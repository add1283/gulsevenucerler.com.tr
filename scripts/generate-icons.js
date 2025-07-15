const fs = require('fs');
const path = require('path');

// İkon boyutları
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG template
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#52c085;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#369b5f;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#grad)"/>
  <text x="${size/2}" y="${size/2 + size*0.1}" font-family="serif" font-size="${Math.round(size * 0.44)}" font-weight="bold" fill="white" text-anchor="middle">G</text>
</svg>`;

// Screenshot placeholder'ları
const createScreenshotSVG = (width, height, label) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#52c085;stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:#369b5f;stop-opacity:0.1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
  <rect x="20" y="20" width="${width-40}" height="${height-40}" rx="20" fill="white" opacity="0.9"/>
  <text x="${width/2}" y="${height/2}" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#2d3748" text-anchor="middle">${label}</text>
  <text x="${width/2}" y="${height/2 + 40}" font-family="Arial, sans-serif" font-size="16" fill="#4a5568" text-anchor="middle">Gülseven Üçerler - Enerji Şifa Uzmanı</text>
</svg>`;

// Klasör oluştur
const imagesDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// İkonları oluştur
iconSizes.forEach(size => {
  const svg = createSVG(size);
  const filename = `icon-${size}x${size}.png`;

  // SVG olarak kaydet (production'da PNG'ye convert edilebilir)
  fs.writeFileSync(
    path.join(imagesDir, filename.replace('.png', '.svg')),
    svg
  );

  console.log(`✅ ${filename} oluşturuldu (SVG olarak)`);
});

// Screenshot'ları oluştur
const screenshots = [
  { width: 1920, height: 1080, name: 'screenshot-desktop', label: 'Masaüstü Görünüm' },
  { width: 360, height: 720, name: 'screenshot-mobile', label: 'Mobil Görünüm' }
];

screenshots.forEach(({ width, height, name, label }) => {
  const svg = createScreenshotSVG(width, height, label);
  fs.writeFileSync(
    path.join(imagesDir, `${name}.svg`),
    svg
  );
  console.log(`✅ ${name}.svg oluşturuldu`);
});

console.log('\nTum PWA ikonlari ve screenshotlari olusturuldu!');
console.log('\nNotlar:');
console.log('- Ikonlar SVG formatinda olusturuldu');
console.log('- Production icin PNG formatina convert edilebilir');
console.log('- Manifest.json dosyasinda .svg uzantilarini .png olarak guncelleyin');
console.log('- Gercek screenshotlar icin tarayicidan cekim yapabilirsiniz');
