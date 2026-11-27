const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const productDir = 'frontend/public/products';
const directories = fs.readdirSync(productDir);

const sizes = [480, 960, 1600];

let total = 0;
let success = 0;

for (const dir of directories) {
  dirpath = path.join(productDir, dir);
  if (!fs.existsSync(dirpath)) continue;
  if (!fs.statSync(dirpath).isDirectory()) continue;

  const files = fs.readdirSync(dirpath);
  const jpgFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));

  for (const file of jpgFiles) {
    fpath = path.join(dirpath, file);
    try {
      const img = sharp(fpath);
      const metadata = await img.metadata();
      total++;

      // Generate thumbnails at each size
      for (const size of sizes) {
        // Output filename: original name with @size suffix
        const baseName = file.replace(/\.jpg$/, '').replace(/\.png$/, '');
        const outName = baseName + '@' + size + 'w.jpg';
        const outPath = path.join(dirpath, outName);

        await img.resize(size, Math.round(size / metadata.width * metadata.height), {
          withoutEnlargement: true,
          fit: 'inside'
        }).toFile(outPath);
      }
      success++;
      console.log(`${dir}/${file}: generated thumbnails at 480, 960, 1600`);
    } catch (e) {
      console.error(`${dir}/${file}: ERROR ${e.message}`);
    }
  }
}

console.log(`\nTotal: ${total}, Success: ${success}`);