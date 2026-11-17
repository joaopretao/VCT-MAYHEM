import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const INPUT_DIR = 'public/players';
const OUTPUT_DIR = 'public/players-padronizadas';

// Cortes específicos calibrados visualmente para fotos de corpo inteiro / palco amplo
const CUSTOM_BUST_CROPS = {
  'brawk.jpg': { left: 35, top: 68, width: 240, height: 240 },
  'sushiboys.jpg': { left: 35, top: 55, width: 230, height: 230 },
  'dos9.jpg': { left: 20, top: 35, width: 250, height: 250 },
  'ayrin.jpg': { left: 25, top: 10, width: 250, height: 250 },
  'trexx.jpg': { left: 20, top: 10, width: 260, height: 260 },
  'kingg.jpg': { left: 25, top: 8, width: 250, height: 250 },
  'tennn.jpg': { left: 12, top: 10, width: 250, height: 250 },
  'victor.jpg': { left: 72, top: 18, width: 165, height: 165 },
  'yetujey.png': { left: 45, top: 4, width: 210, height: 210 },
  'xeus.png': { left: 45, top: 4, width: 210, height: 210 },
  'mrfalin.png': { left: 45, top: 4, width: 210, height: 210 },
  'udotan.png': { left: 25, top: 4, width: 250, height: 250 },
};

async function computePngUpperBustCrop(filePath) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minY = info.height;
  let maxY = -1;
  let minX = info.width;
  let maxX = -1;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 20) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;

  const contentH = maxY - minY + 1;
  const contentW = maxX - minX + 1;
  // Só ajusta PNGs se tiver muito espaço vazio em cima (>18px) ou corpo muito alto
  if (minY <= 18 && info.height <= info.width * 1.12) {
    return null;
  }

  const size = Math.min(info.width, info.height, Math.max(contentW, Math.round(contentH * 0.72), 200));
  const cx = Math.round((minX + maxX) / 2);
  const left = Math.max(0, Math.min(info.width - size, cx - Math.floor(size / 2)));
  const top = Math.max(0, Math.min(info.height - size, minY - 6));

  return { left, top, width: size, height: size };
}

async function run() {
  const applyInPlace = process.argv.includes('--apply');
  if (!applyInPlace) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(INPUT_DIR)
    .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort();

  let croppedCount = 0;

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const meta = await sharp(inputPath).metadata();
    let crop = CUSTOM_BUST_CROPS[file] || null;

    if (!crop && file.toLowerCase().endsWith('.png')) {
      crop = await computePngUpperBustCrop(inputPath);
    }

    if (!crop) continue;

    // Clamping de segurança nos limites reais da imagem
    const w = meta.width || 300;
    const h = meta.height || 300;
    const safeLeft = Math.max(0, Math.min(w - 1, crop.left));
    const safeTop = Math.max(0, Math.min(h - 1, crop.top));
    const safeW = Math.max(1, Math.min(w - safeLeft, crop.width));
    const safeH = Math.max(1, Math.min(h - safeTop, crop.height));

    const outPath = applyInPlace ? inputPath + '.tmp' : path.join(OUTPUT_DIR, file);
    let pipeline = sharp(inputPath)
      .extract({ left: safeLeft, top: safeTop, width: safeW, height: safeH })
      .resize(256, 256, { fit: 'cover', position: 'top' });

    if (file.toLowerCase().endsWith('.png')) {
      pipeline = pipeline.png();
    } else {
      pipeline = pipeline.jpeg({ quality: 92 });
    }

    await pipeline.toFile(outPath);
    if (applyInPlace) {
      fs.renameSync(outPath, inputPath);
    }
    croppedCount++;
    console.log(`Padronizada (${safeW}x${safeH} -> 256x256): ${file}`);
  }

  console.log(`\nTotal padronizadas: ${croppedCount}`);
}

run();
