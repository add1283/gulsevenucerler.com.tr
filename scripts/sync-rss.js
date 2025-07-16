const fs = require('fs');
const path = require('path');
const https = require('https');
const { DOMParser } = require('xmldom');

const RSS_URL = process.env.RSS_URL || 'https://gulsevenucerler.blogspot.com/feeds/posts/default?alt=rss';

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
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i')
    .replace(/[^\w\s-]/g, '') // Sadece harf, rakam, tire kalsın
    .replace(/[\u0000-\u001F\u007F]/g, '') // Kontrol karakterlerini temizle
    .replace(/\s+/g, '-') // Boşlukları tireye çevir
    .replace(/-+/g, '-') // Birden fazla tireyi teke indir
    .replace(/^-+|-+$/g, ''); // Baş ve sondaki tireleri kaldır
}

function extractImageFromDescription(description) {
  const imgMatch = description.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  return imgMatch ? imgMatch[1] : null;
}

function transformBlogHtml(html) {
  // Artık hiçbir dönüşüm yok, sadece orijinal HTML döndürülüyor
  return html;
}

function parseRSSContent(rssText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(rssText, 'text/xml');
  const items = xmlDoc.getElementsByTagName('item');
  const posts = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const title = item.getElementsByTagName('title')[0]?.textContent || '';
    if (!title.trim()) continue;
    const link = item.getElementsByTagName('link')[0]?.textContent || '';
    const description = item.getElementsByTagName('description')[0]?.textContent || '';
    const pubDate = item.getElementsByTagName('pubDate')[0]?.textContent || '';
    const guid = item.getElementsByTagName('guid')[0]?.textContent || '';
    // Temizle: &nbsp; ve benzeri HTML entity'leri kaldır
    const cleanedDescription = description.replace(/<[^>]*>/g, '').replace(/&nbsp;|&#160;| /gi, ' ').replace(/&[a-zA-Z0-9#]+;/g, '').trim();
    const content = transformBlogHtml(description).replace(/&nbsp;|&#160;| /gi, ' ').replace(/&[a-zA-Z0-9#]+;/g, '');
    let image = extractImageFromDescription(description);
    if (!image) {
      const mediaThumbnail = item.getElementsByTagName('media:thumbnail')[0];
      image = mediaThumbnail && mediaThumbnail.getAttribute('url') ? mediaThumbnail.getAttribute('url').replace(/=s\d{2,4}(-c)?$/, '=s1600') : '/images/default-blog-image.png';
    }
    let excerpt = cleanedDescription.substring(0, 150).trim() + (cleanedDescription.length > 150 ? '...' : '');
    const slug = createSlug(title);
    const publishDate = new Date(pubDate);
    posts.push({
      id: guid || slug,
      title: title.trim(),
      slug,
      excerpt,
      content,
      originalUrl: link,
      image,
      publishedAt: publishDate.toISOString(),
      publishedDate: publishDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      readTime: Math.max(1, Math.ceil(cleanedDescription.split(' ').length / 200))
    });
  }
  return posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

function generateSitemap(posts) {
  const baseUrl = 'https://gulsevenucerler.com.tr';
  const urls = posts.map(post => {
    return `<url><loc>${baseUrl}/blog/${post.slug}</loc><lastmod>${post.publishedAt}</lastmod></url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

async function main() {
  try {
    console.log('🔄 RSS akışı çekiliyor:', RSS_URL);
    const rssContent = await fetchRSS(RSS_URL);
    if (!rssContent || rssContent.trim().length === 0) {
      console.log('⏸️  RSS akışı boş veya henüz mevcut değil. Senkronizasyon atlanıyor.');
      process.exit(2);
    }
    console.log('✅ RSS akışı başarıyla çekildi.');
    const newPosts = parseRSSContent(rssContent);
    if (newPosts.length === 0) {
      console.log('⏸️  RSS akışında geçerli gönderi bulunamadı. Senkronizasyon atlanıyor.');
      process.exit(2);
    }
    console.log(`📄 ${newPosts.length} adet gönderi ayrıştırıldı.`);
    const publicBlogDataPath = path.join(__dirname, '../public/blog-data.json');
    const assetsBlogDataPath = path.join(__dirname, '../src/assets/blog-data.json');
    fs.writeFileSync(publicBlogDataPath, JSON.stringify(newPosts, null, 2));
    fs.writeFileSync(assetsBlogDataPath, JSON.stringify(newPosts, null, 2));
    // Sitemap oluştur ve kaydet
    const sitemapXml = generateSitemap(newPosts);
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapXml);
    console.log('✅ Blog verisi ve sitemap kaydedildi.');
  } catch (error) {
    console.error('❌ Blog senkronizasyonu sırasında hata:', error);
    process.exit(1);
  }
}

main();
