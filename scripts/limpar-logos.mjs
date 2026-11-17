import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const INPUT_DIR = 'public/logos';
const OUTPUT_DIR = 'public/logos-limpas';
const TOLERANCIA = 45;
const FEATHER_RANGE = 65;

// Logos com preenchimento branco interno que faz parte do escudo/personagem:
// removemos apenas o fundo externo conectado às bordas para preservar o interior branco.
const EDGE_ONLY_FILES = new Set([
  'edg.png',
  'furia.png',
  'fut.png',
  'g2.png',
  'heretics.png',
  'liquid.png',
  'navi.png',
  'ns.png',
]);

// Logos em caixa/emblema colorido cheio (ex.: quadrado vermelho oficial da Sentinels)
const KEEP_FULL_BLEED_FILES = new Set(['sentinels.png']);

// Logos puramente brancas sobre preto: a luminância vira canal alfa com RGB branco puro
const MONOCHROME_WHITE_ON_BLACK = new Set(['eg.png', 'prx.png', 'zeta.png']);

function colorDiff(r, g, b, bgR, bgG, bgB) {
  return Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
}

function detectBackgroundFromBorder(data, width, height) {
  let transparentBorderCount = 0;
  let totalBorderCount = 0;
  let nearWhiteCount = 0;
  let nearBlackCount = 0;

  const inspectPixel = (x, y) => {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    totalBorderCount++;

    if (a <= 200) {
      transparentBorderCount++;
      return;
    }
    if (r >= 230 && g >= 230 && b >= 230) {
      nearWhiteCount++;
    } else if (r <= 25 && g <= 25 && b <= 25) {
      nearBlackCount++;
    }
  };

  for (let x = 0; x < width; x++) {
    inspectPixel(x, 0);
    if (height > 1) inspectPixel(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    inspectPixel(0, y);
    if (width > 1) inspectPixel(width - 1, y);
  }

  if (transparentBorderCount >= totalBorderCount * 0.15) {
    return { kind: 'already-transparent' };
  }
  if (nearWhiteCount >= totalBorderCount * 0.25 && nearWhiteCount >= nearBlackCount) {
    return { kind: 'neutral', r: 255, g: 255, b: 255 };
  }
  if (nearBlackCount >= totalBorderCount * 0.25) {
    return { kind: 'neutral', r: 0, g: 0, b: 0 };
  }
  return { kind: 'colored-full-bleed' };
}

function floodFillExteriorMask(data, width, height, bgR, bgG, bgB, tolerance) {
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const trySeed = (x, y) => {
    const pos = y * width + x;
    if (visited[pos]) return;
    const idx = pos * 4;
    if (data[idx + 3] <= 200) {
      visited[pos] = 1;
      queue[tail++] = pos;
      return;
    }
    const diff = colorDiff(data[idx], data[idx + 1], data[idx + 2], bgR, bgG, bgB);
    if (diff <= tolerance) {
      visited[pos] = 1;
      queue[tail++] = pos;
    }
  };

  for (let x = 0; x < width; x++) {
    trySeed(x, 0);
    trySeed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    trySeed(0, y);
    trySeed(width - 1, y);
  }

  while (head < tail) {
    const pos = queue[head++];
    const x = pos % width;
    const y = (pos / width) | 0;

    if (x > 0) trySeed(x - 1, y);
    if (x < width - 1) trySeed(x + 1, y);
    if (y > 0) trySeed(x, y - 1);
    if (y < height - 1) trySeed(x, y + 1);
  }

  return visited;
}

function applySmoothAlphaFeathering(data, width, height, removedMask, bgR, bgG, bgB) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      if (removedMask[pos]) {
        data[pos * 4 + 3] = 0;
        continue;
      }

      // Se for vizinho imediato de pixel removido, suaviza halos anti-aliased
      const touchesRemoved =
        (x > 0 && removedMask[pos - 1]) ||
        (x < width - 1 && removedMask[pos + 1]) ||
        (y > 0 && removedMask[pos - width]) ||
        (y < height - 1 && removedMask[pos + width]);

      if (!touchesRemoved) continue;

      const idx = pos * 4;
      const diff = colorDiff(data[idx], data[idx + 1], data[idx + 2], bgR, bgG, bgB);
      if (diff <= TOLERANCIA + FEATHER_RANGE) {
        const ratio = Math.max(0, Math.min(1, (diff - TOLERANCIA) / FEATHER_RANGE));
        if (ratio < 0.18) {
          data[idx + 3] = 0;
        } else {
          // Descontamina o reflexo da cor de fundo na borda anti-aliased
          data[idx] = Math.max(0, Math.min(255, Math.round((data[idx] - (1 - ratio) * bgR) / ratio)));
          data[idx + 1] = Math.max(
            0,
            Math.min(255, Math.round((data[idx + 1] - (1 - ratio) * bgG) / ratio))
          );
          data[idx + 2] = Math.max(
            0,
            Math.min(255, Math.round((data[idx + 2] - (1 - ratio) * bgB) / ratio))
          );
          data[idx + 3] = Math.round(data[idx + 3] * ratio);
        }
      }
    }
  }
}

function computeOpaqueBounds(data, width, height) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }
  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

async function processLogos() {
  const applyInPlace = process.argv.includes('--apply');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const arquivos = fs
    .readdirSync(INPUT_DIR)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort();

  const summary = { cleaned: 0, alreadyTransparent: 0, preservedFullBleed: 0 };

  for (const arquivo of arquivos) {
    const caminhoEntrada = path.join(INPUT_DIR, arquivo);
    const nomeBase = path.parse(arquivo).name;
    const outName = `${nomeBase}.png`;
    const caminhoSaida = path.join(OUTPUT_DIR, outName);

    const { data, info } = await sharp(caminhoEntrada)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const bg = KEEP_FULL_BLEED_FILES.has(outName)
      ? { kind: 'colored-full-bleed' }
      : detectBackgroundFromBorder(data, info.width, info.height);

    let pipeline;
    if (MONOCHROME_WHITE_ON_BLACK.has(outName)) {
      const total = info.width * info.height;
      for (let pos = 0; pos < total; pos++) {
        const idx = pos * 4;
        const lum = Math.round((data[idx] + data[idx + 1] + data[idx + 2]) / 3);
        const alpha = lum <= 18 ? 0 : lum >= 235 ? 255 : Math.round(((lum - 18) / (235 - 18)) * 255);
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = Math.round((data[idx + 3] * alpha) / 255);
      }
      pipeline = sharp(data, {
        raw: { width: info.width, height: info.height, channels: 4 },
      });
      const bounds = computeOpaqueBounds(data, info.width, info.height);
      if (bounds) {
        pipeline = pipeline.extract(bounds);
      }
      summary.cleaned++;
      console.log(`Limpa (branco puro/preto): ${outName}`);
    } else if (bg.kind === 'neutral') {
      const total = info.width * info.height;
      let removedMask;

      if (EDGE_ONLY_FILES.has(outName)) {
        removedMask = floodFillExteriorMask(
          data,
          info.width,
          info.height,
          bg.r,
          bg.g,
          bg.b,
          TOLERANCIA
        );
      } else {
        removedMask = new Uint8Array(total);
        for (let pos = 0; pos < total; pos++) {
          const idx = pos * 4;
          if (data[idx + 3] <= 200) {
            removedMask[pos] = 1;
            continue;
          }
          const diff = colorDiff(data[idx], data[idx + 1], data[idx + 2], bg.r, bg.g, bg.b);
          if (diff <= TOLERANCIA) {
            removedMask[pos] = 1;
          }
        }
      }

      applySmoothAlphaFeathering(data, info.width, info.height, removedMask, bg.r, bg.g, bg.b);
      pipeline = sharp(data, {
        raw: { width: info.width, height: info.height, channels: 4 },
      });
      const bounds = computeOpaqueBounds(data, info.width, info.height);
      if (bounds) {
        pipeline = pipeline.extract(bounds);
      }
      summary.cleaned++;
      console.log(`Limpa (${EDGE_ONLY_FILES.has(outName) ? 'borda' : 'global'}): ${outName}`);
    } else if (bg.kind === 'already-transparent') {
      pipeline = sharp(data, {
        raw: { width: info.width, height: info.height, channels: 4 },
      });
      const bounds = computeOpaqueBounds(data, info.width, info.height);
      if (bounds) {
        pipeline = pipeline.extract(bounds);
      }
      summary.alreadyTransparent++;
      console.log(`Já transparente (padronizada): ${outName}`);
    } else {
      pipeline = sharp(data, {
        raw: { width: info.width, height: info.height, channels: 4 },
      });
      summary.preservedFullBleed++;
      console.log(`Preservada (emblema cheio): ${outName}`);
    }

    await pipeline
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(caminhoSaida);
  }

  if (applyInPlace) {
    for (const f of fs.readdirSync(OUTPUT_DIR)) {
      fs.copyFileSync(path.join(OUTPUT_DIR, f), path.join(INPUT_DIR, f));
    }
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    console.log(`\nLogos limpas aplicadas diretamente em ${INPUT_DIR}/`);
  }

  console.log('\nResumo:', summary);
}

processLogos();
