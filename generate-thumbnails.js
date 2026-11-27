const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const productDir = 'frontend/public/products';
const directories = fs.readdirSync(productDir);

const sizes = [480, 960, 1600];
const VARIANT_RE = /@\d+w\.(jpe?g|png|webp)$/i;

let total = 0;
let success = 0;

async function run() {
  for (const dir of directories) {
    const dirpath = path.join(productDir, dir);
    if (!fs.existsSync(dirpath)) continue;
    if (!fs.statSync(dirpath).isDirectory()) continue;

    const files = fs.readdirSync(dirpath);
    const jpgFiles = files.filter(
      (f) => /\.(jpe?g|png)$/i.test(f) && !VARIANT_RE.test(f)
    );

    for (const file of jpgFiles) {
      const fpath = path.join(dirpath, file);
      try {
        const metadata = await sharp(fpath).metadata();
        total++;

        for (const size of sizes) {
          const ext = path.extname(file);
          const baseName = file.slice(0, -ext.length);
          const outName = `${baseName}@${size}w.jpg`;
          const outPath = path.join(dirpath, outName);

          await sharp(fpath)
            .resize(size, Math.round((size / metadata.width) * metadata.height), {
              withoutEnlargement: true,
              fit: 'inside',
            })
            .jpeg({ quality: 84, mozjpeg: true })
            .toFile(outPath);
        }
        success++;
        console.log(`${dir}/${file}: generated thumbnails at 480, 960, 1600`);
      } catch (e) {
        console.error(`${dir}/${file}: ERROR ${e.message}`);
      }
    }
  }

  console.log(`\nTotal: ${total}, Success: ${success}`);
}

run();
