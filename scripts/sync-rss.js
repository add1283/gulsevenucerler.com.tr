const fs = require('fs');
const path = require('path');
const https = require('https');
const { DOMParser } = require('xmldom');

// RSS URL - environment variable'dan al veya default kullan
const RSS_URL = process.env.RSS_URL || 'https://gulsevenucerler.blogspot.com/feeds/posts/default?alt=rss';

// Utility functions
function fetchRSS(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function createSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // özel karakterleri kaldır
    .replace(/[\s_-]+/g, '-') // boşluk ve tire normalize et
    .replace(/^-+|-+$/g, ''); // başında/sonunda tire kaldır
}

function extractImageFromDescription(description) {
  // <img ... src="..."> yakala
  const imgMatch = description.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  return null;
}

function parseRSSContent(rssText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(rssText, 'text/xml');
  const items = xmlDoc.getElementsByTagName('item');

  const posts = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const title = item.getElementsByTagName('title')[0]?.textContent || '';
    const link = item.getElementsByTagName('link')[0]?.textContent || '';
    const description = item.getElementsByTagName('description')[0]?.textContent || '';
    const pubDate = item.getElementsByTagName('pubDate')[0]?.textContent || '';
    const guid = item.getElementsByTagName('guid')[0]?.textContent || '';

    // Boş başlık kontrolü
    if (!title.trim()) {
      console.warn('⚠️  Skipping post with empty title');
      continue;
    }

    // Content: description'ın decode edilmiş tam HTML'i
    const decodeHtml = (html) => {
      return html.replace(/&lt;/g, '<')
                 .replace(/&gt;/g, '>')
                 .replace(/&amp;/g, '&')
                 .replace(/&quot;/g, '"')
                 .replace(/&#39;/g, "'");
    };
    const rawContent = decodeHtml(description);
    const content = transformBlogHtml(rawContent);
    const ampContent = transformBlogHtmlAmp(rawContent);

    // Görsel: önce description'daki <img>, yoksa media:thumbnail (büyük boyutlu)
    let image = extractImageFromDescription(description);
    if (!image) {
      const mediaThumbnail = item.getElementsByTagName('media:thumbnail')[0];
      if (mediaThumbnail && mediaThumbnail.getAttribute('url')) {
        image = mediaThumbnail.getAttribute('url').replace(/=s\d{2,4}(-c)?$/, '=s1600');
      } else {
        image = '/images/default-blog-image.png';
      }
    }

    // Excerpt: temiz metin, entity'ler ve HTML'siz, 150 karakter
    let cleanDescription = description
      .replace(/<[^>]*>/g, '') // HTML tag'leri kaldır
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/gi, ' ')
      .trim();
    cleanDescription = decodeEntities(cleanDescription);
    let excerpt = cleanDescription;
    if (excerpt.length > 150) {
      excerpt = excerpt.substring(0, 150).trim() + '...';
    }

    const slug = createSlug(title);
    const publishDate = new Date(pubDate);

    posts.push({
      id: guid || slug,
      title: title.trim(),
      slug,
      excerpt,
      content: content,
      ampContent: ampContent,
      originalUrl: link,
      image,
      publishedAt: publishDate.toISOString(),
      publishedDate: publishDate.toLocaleDateString('tr-TR'),
      readTime: Math.max(1, Math.ceil(cleanDescription.split(' ').length / 200)) // ortalama okuma süresi
    });
  }

  // Tarihe göre sırala (en yeni önce)
  return posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

function loadExistingBlogData(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('⚠️  Could not load existing blog data:', error.message);
  }
  return [];
}

function hasNewPosts(existingPosts, newPosts) {
  if (existingPosts.length !== newPosts.length) {
    return true;
  }

  // ID'lere göre karşılaştır
  const existingIds = new Set(existingPosts.map(post => post.id));
  const newIds = new Set(newPosts.map(post => post.id));

  // Yeni ID varsa güncelleme gerekli
  for (const id of newIds) {
    if (!existingIds.has(id)) {
      return true;
    }
  }

  // İçerik değişikliği kontrolü (title, content)
  for (const newPost of newPosts) {
    const existingPost = existingPosts.find(p => p.id === newPost.id);
    if (existingPost) {
      if (existingPost.title !== newPost.title || existingPost.content !== newPost.content) {
        return true;
      }
    }
  }

  return false;
}

function updateSitemap(posts) {
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  let sitemap = fs.readFileSync(sitemapPath, 'utf-8');

  // Mevcut blog URL'lerini kaldır
  sitemap = sitemap.replace(/<url>\s*<loc>https:\/\/gulsevenucerler\.com\.tr\/blog.*?<\/url>/gs, '');

  // Blog ana sayfası ve /blog/ sabit ekle
  const today = new Date().toISOString().split('T')[0];
  const blogMainUrl = `
  <url>
    <loc>https://gulsevenucerler.com.tr/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${today}</lastmod>
  </url>`;
  const blogSlashUrl = `
  <url>
    <loc>https://gulsevenucerler.com.tr/blog/</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${today}</lastmod>
  </url>`;

  // Blog post URL'lerini oluştur
  const blogUrls = posts.map(post => `
  <url>
    <loc>https://gulsevenucerler.com.tr/blog/${post.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <lastmod>${post.publishedAt.split('T')[0]}</lastmod>
  </url>`).join('');

  // </urlset> tag'inden önce blog URL'lerini ekle
  sitemap = sitemap.replace('</urlset>', blogMainUrl + blogSlashUrl + blogUrls + '\n</urlset>');

  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`✅ Sitemap updated with ${posts.length} blog posts`);
}

// Tüm HTML entity'lerini temizle (decode)
function decodeEntities(text) {
  return text.replace(/&#?[a-zA-Z0-9]+;/g, ' ');
}

// Blog içeriğini dönüştür: img'lere lazyload ve lightbox, sosyal medya embed
function transformBlogHtml(html) {
  // 1. <img> etiketlerine loading="lazy" ve data-lightbox="blog" ekle
  html = html.replace(/<img([^>]*?)>/gi, (match, attrs) => {
    // loading ve data-lightbox zaten varsa tekrar ekleme
    let newAttrs = attrs;
    if (!/loading=/.test(attrs)) newAttrs += ' loading="lazy"';
    if (!/data-lightbox=/.test(attrs)) newAttrs += ' data-lightbox="blog"';
    return `<img${newAttrs}>`;
  });

  // 2. YouTube link veya iframe'lerini responsive embed'e çevir
  // a) YouTube linklerini iframe'e çevir
  html = html.replace(/<a[^>]+href=["'](https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^"]+)["'][^>]*>[^<]*<\/a>/gi, (match, url) => {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return `<div class="youtube-embed"><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen loading="lazy"></iframe></div>`;
    }
    return match;
  });
  // b) YouTube iframe'lerini responsive yap
  html = html.replace(/<iframe[^>]+src=["']https?:\/\/(www\.)?(youtube\.com|youtu\.be)[^"']+["'][^>]*><\/iframe>/gi, (iframe) => {
    // loading="lazy" ekle
    if (!/loading=/.test(iframe)) {
      return iframe.replace('<iframe', '<iframe loading="lazy"');
    }
    return iframe;
  });

  // 3. X (Twitter) linklerini embed'e çevir
  html = html.replace(/<a[^>]+href=["'](https?:\/\/(www\.)?twitter\.com\/[^"]+status\/[0-9]+)["'][^>]*>[^<]*<\/a>/gi, (match, url) => {
    return `<blockquote class="twitter-tweet"><a href="${url}"></a></blockquote>`;
  });

  // 4. Instagram gönderi linklerini embed'e çevir
  html = html.replace(/<a[^>]+href=["'](https?:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+)["'][^>]*>[^<]*<\/a>/gi, (match, url) => {
    return `<blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14"></blockquote>`;
  });

  return html;
}

// YouTube video ID'sini linkten çıkar
function extractYouTubeId(url) {
  // youtube.com/watch?v=... veya youtu.be/... gibi
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

// AMP için dönüştürme
function transformBlogHtmlAmp(html) {
  // <img> -> <amp-img> (lightbox ile)
  html = html.replace(/<img([^>]*?)>/gi, (match, attrs) => {
    // src, alt, width, height bul
    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
    const src = srcMatch ? srcMatch[1] : '';
    const alt = altMatch ? altMatch[1] : '';
    return `<amp-img src="${src}" alt="${alt}" width="600" height="400" layout="responsive" lightbox></amp-img>`;
  });
  // YouTube linklerini <amp-youtube> embed'e çevir
  html = html.replace(/<a[^>]+href=["'](https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^"]+)["'][^>]*>[^<]*<\/a>/gi, (match, url) => {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return `<amp-youtube data-videoid="${videoId}" layout="responsive" width="480" height="270"></amp-youtube>`;
    }
    return match;
  });
  // YouTube iframe'lerini <amp-youtube> ile değiştir
  html = html.replace(/<iframe[^>]+src=["']https?:\/\/(www\.)?(youtube\.com|youtu\.be)[^"']+["'][^>]*><\/iframe>/gi, (iframe) => {
    const srcMatch = iframe.match(/src=["']([^"']+)["']/i);
    if (srcMatch) {
      const videoId = extractYouTubeId(srcMatch[1]);
      if (videoId) {
        return `<amp-youtube data-videoid="${videoId}" layout="responsive" width="480" height="270"></amp-youtube>`;
      }
    }
    return '';
  });
  // Twitter linklerini <amp-twitter> embed'e çevir
  html = html.replace(/<a[^>]+href=["'](https?:\/\/(www\.)?twitter\.com\/[^"]+status\/[0-9]+)["'][^>]*>[^<]*<\/a>/gi, (match, url) => {
    const tweetId = url.match(/status\/([0-9]+)/);
    if (tweetId) {
      return `<amp-twitter width="375" height="472" layout="responsive" data-tweetid="${tweetId[1]}"></amp-twitter>`;
    }
    return match;
  });
  // Instagram gönderi linklerini <amp-instagram> embed'e çevir
  html = html.replace(/<a[^>]+href=["'](https?:\/\/(www\.)?instagram\.com\/p\/([A-Za-z0-9_-]+))["'][^>]*>[^<]*<\/a>/gi, (match, url, _, shortcode) => {
    if (shortcode) {
      return `<amp-instagram data-shortcode="${shortcode}" width="400" height="400" layout="responsive"></amp-instagram>`;
    }
    return match;
  });
  return html;
}

async function main() {
  try {
    console.log('🔄 Fetching RSS feed from:', RSS_URL);

    const rssContent = await fetchRSS(RSS_URL);

    if (!rssContent || rssContent.trim().length === 0) {
      console.log('⏸️  RSS feed is empty or not available yet');
      console.log('💤 Blog sync will be skipped until content is available');
      process.exit(2); // Exit code 2 = not ready (different from error)
    }

    console.log('✅ RSS feed fetched successfully');

    const newPosts = parseRSSContent(rssContent);

    if (newPosts.length === 0) {
      console.log('⏸️  No valid posts found in RSS feed yet');
      console.log('💤 Blog sync will be skipped until posts are available');
      process.exit(2); // Exit code 2 = not ready
    }

    console.log(`📄 Parsed ${newPosts.length} blog posts`);

    // Mevcut blog verisini yükle
    const publicBlogDataPath = path.join(__dirname, '../public/blog-data.json');
    const assetsBlogDataPath = path.join(__dirname, '../src/assets/blog-data.json');

    const existingPosts = loadExistingBlogData(publicBlogDataPath);
    console.log(`📚 Found ${existingPosts.length} existing posts`);

    // Yeni post kontrolü
    if (!hasNewPosts(existingPosts, newPosts)) {
      console.log('ℹ️  No new posts or changes detected. Skipping update.');
      process.exit(0);
    }

    console.log('🆕 New posts or changes detected. Updating files...');

    // Blog data dosyalarını güncelle
    fs.writeFileSync(publicBlogDataPath, JSON.stringify(newPosts, null, 2));
    fs.writeFileSync(assetsBlogDataPath, JSON.stringify(newPosts, null, 2));

    console.log('✅ Blog data saved to public/blog-data.json and src/assets/blog-data.json');

    // Sitemap'i güncelle
    updateSitemap(newPosts);

    console.log('🎉 Blog sync completed successfully!');

  } catch (error) {
    console.error('❌ Error syncing blog:', error);

    // Network error vs other errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.log('🔌 Network issue detected - RSS feed may not be ready yet');
      console.log('💤 Blog sync will be retried in the next scheduled run');
      process.exit(2); // Exit code 2 = not ready
    }

    process.exit(1); // Exit code 1 = actual error
  }
}

main();
