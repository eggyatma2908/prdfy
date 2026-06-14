const fs = require('fs');
const src = 'C:/Users/user/.gemini/antigravity-ide/brain/15ac7272-c110-460c-8edb-ceb09859c808/og_image_preview_1781431457583.png';
const dest = 'c:/Users/user/Desktop/ai-prd-generator/ai-prd-generator-fe/public/og-image.png';

try {
  fs.copyFileSync(src, dest);
  console.log('Success copy!');
} catch (e) {
  console.error('Error copy:', e);
}
