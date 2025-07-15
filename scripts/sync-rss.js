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

    // İçeriği temizle (HTML tag'leri kaldır)
    const cleanDescription = description
      .replace(/<[^>]*>/g, '') // HTML tag'leri kaldır
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();

    // Excerpt oluştur (ilk 200 karakter)
    const excerpt = cleanDescription.length > 200
      ? cleanDescription.substring(0, 200) + '...'
      : cleanDescription;

    const slug = createSlug(title);
    const publishDate = new Date(pubDate);

    posts.push({
      id: guid || slug,
      title: title.trim(),
      slug,
      excerpt,
      content: cleanDescription,
      originalUrl: link,
      publishedAt: publishDate.toISOString(),
      publishedDate: publishDate.toLocaleDateString('tr-TR'),
      readTime: Math.max(1, Math.ceil(cleanDescription.split(' ').length / 200)) // ortalama okuma süresi
    });
  }

  // Tarihe göre sırala (en yeni önce)
  return posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

function updateSitemap(posts) {
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  let sitemap = fs.readFileSync(sitemapPath, 'utf-8');

  // Mevcut blog URL'lerini kaldır
  sitemap = sitemap.replace(/<url>\s*<loc>https:\/\/gulsevenucerler\.com\.tr\/blog.*?<\/url>/gs, '');

  // Blog ana sayfası ekle
  const blogMainUrl = `
  <url>
    <loc>https://gulsevenucerler.com.tr/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
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
  sitemap = sitemap.replace('</urlset>', blogMainUrl + blogUrls + '\n</urlset>');

  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`✅ Sitemap updated with ${posts.length} blog posts`);
}

async function main() {
  try {
    console.log('🔄 Fetching RSS feed from:', RSS_URL);

    const rssContent = await fetchRSS(RSS_URL);
    console.log('✅ RSS feed fetched successfully');

    const posts = parseRSSContent(rssContent);
    console.log(`📄 Parsed ${posts.length} blog posts`);

    // Blog data dosyasını oluştur
    const blogDataPath = path.join(__dirname, '../public/blog-data.json');
    const blogData = {
      posts,
      lastUpdated: new Date().toISOString(),
      totalPosts: posts.length
    };

    fs.writeFileSync(blogDataPath, JSON.stringify(blogData, null, 2));
    console.log('✅ Blog data saved to public/blog-data.json');

    // Sitemap'i güncelle
    updateSitemap(posts);

    console.log('🎉 Blog sync completed successfully!');

  } catch (error) {
    console.error('❌ Error syncing blog:', error);
    process.exit(1);
  }
}

main();
