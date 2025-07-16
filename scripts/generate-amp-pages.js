const fs = require('fs');
const path = require('path');

// Statik AMP sayfa üretimi scripti
const blogData = require('../../src/assets/blog-data.json');
const ampTemplate = fs.readFileSync(path.join(__dirname, '../src/app/components/amp-blog/amp-blog.amp.html'), 'utf8');
const outputDir = path.join(__dirname, '../../public/amp');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

blogData.forEach(post => {
  // AMP validasyonu için ampContent içindeki gereksiz attribute ve tagları temizle
  let ampContent = post.ampContent
    // <a> taglarından width, height, layout gibi attribute'ları kaldır
    .replace(/<a([^>]*)(\s(width|height|layout)="[^"]*")([^>]*)>/gi, '<a$1$4>')
    // <img> taglarından amp-img'e uygun olmayan attribute'ları kaldır
    .replace(/<img([^>]*)(\s(width|height|layout)="[^"]*")([^>]*)>/gi, '<img$1$4>')
    // <a> ve <img> taglarında gereksiz boşlukları temizle
    .replace(/<a\s+/gi, '<a ')
    .replace(/<img\s+/gi, '<img ');

  let html = ampTemplate
    .replace(/{{ post.title }}/g, post.title)
    .replace(/{{ post.slug }}/g, post.slug)
    .replace(/{{ post.excerpt }}/g, post.excerpt)
    .replace(/{{ post.image }}/g, post.image || '/images/default-blog-image.png')
    .replace(/{{ post.publishedDate }}/g, post.publishedDate)
    .replace(/{{ post.readTime }}/g, post.readTime)
    .replace(/{{ post.ampContent }}/g, ampContent)
    .replace(/{{ ampShareHtml }}/g, '')
    .replace(/{{ post.originalUrl }}/g, post.originalUrl)
    .replace(/{{ currentYear \|\| 2025 }}/g, new Date().getFullYear());

  fs.writeFileSync(path.join(outputDir, post.slug + '.html'), html);
});

console.log('AMP sayfaları başarıyla üretildi.');
