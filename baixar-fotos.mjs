import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const OUTPUT_DIR = path.resolve('public/players');
const DATA_OUT_FILE = path.resolve('src/data/playerPhotos.ts');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Lista explícita prioritária
const EXPLICIT_PLAYERS = [
  { slug: 'aspas', ign: 'aspas', url: 'https://www.vlr.gg/player/8480/aspas' },
  { slug: 'artzin', ign: 'artzin', url: 'https://www.vlr.gg/player/5957/artzin' },
  { slug: 'cortezia', ign: 'cortezia', url: 'https://www.vlr.gg/player/5395/cortezia' },
  { slug: 'xenom', ign: 'xenom', url: 'https://www.vlr.gg/player/20240/xenom' },
  { slug: 'verno', ign: 'verno', url: 'https://www.vlr.gg/player/21668/verno' },
  { slug: 'nzr', ign: 'nzr', url: 'https://www.vlr.gg/player/725/nzr' },
];

// Aliases conhecidos para associar grafias diferentes à mesma foto
const IGN_ALIASES = {
  nzr: ['Nozwerr', 'nzr'],
  nozwerr: ['Nozwerr', 'nzr'],
  lewn: ['LewN', 'LêwN'],
  zmjjkk: ['ZmjjKK', 'KangKang'],
  t3xture: ['t3xture', 'texture'],
  keiko: ['keiko', 'Keiko'],
  jawgemo: ['jawgemo', 'Jawgemo'],
  autumn: ['Autumn', 'autumn'],
  kicks: ['Kicks', 'kicks'],
  yosemite: ['Yosemite', 'yosemite'],
  jitboys: ['JitboyS', 'jitboyS'],
  heib: ['HeiB', 'Heybay'],
  victor: ['Victor', 'food'],
  sayaplayer: ['Sayaplayer', 'Spyder'],
  dimasick: ['dimasick', 'dimaoneshot'],
  tzh: ['TzH', 'NizhaoTZH'],
  mazin: ['mazin', 'mzn'],
};

// Dicas diretas de título no Liquipedia para nicks com múltiplas ocorrências
const LIQUIPEDIA_TITLE_OVERRIDES = {
  will: 'Will (American player)',
  life: 'Life (Chinese player)',
  ban: 'Ban (American player)',
  steel: 'Steel (Joshua Nissan)',
  cloud: 'Cloud',
  mzn: 'Mazin',
  mazin: 'Mazin',
  mindfreak: 'mindfreak (Indonesian player)',
  crown: 'Crow',
  victor: 'Victor (American player)',
  johnqt: 'Johnqt',
  babybay: 'BABYBAY',
  d4v41: 'D4v41',
  f0rsaken: 'F0rsakeN',
  suygetsu: 'SUYGETSU',
  smoggy: 'Smoggy',
  chichoo: 'CHICHOO',
  nobody: 'Nobody',
  haodong: 'Haodong',
  s1mon: 'S1Mon',
  jieni7: 'Jieni7',
  kamo: 'Kamo',
  gsr: 'GSR (Swedish player)',
  lewn: 'LêwN',
  aveZ: 'Avez',
  ave: 'Avez',
  dos9: 'Dos9',
  rin: 'Rin (Chinese player)',
  kai: 'Kai (Chinese player)',
  nephh: 'Nephh',
  berl1n: 'BerLIN',
  berlin: 'BerLIN',
  luok1ng: 'LuoK1ng',
  n4rrate: 'N4RRATE',
  t3xture: 'T3xture',
  foxy9: 'Foxy9',
  beyn: 'BeYN',
  mako: 'MaKo',
  buzz: 'BuZz',
  rb: 'Rb',
  zest: 'Zest',
  xeta: 'Xeta',
  iza: 'IZu',
  izu: 'IZu',
  s0m: 'S0m',
  c0m: 'C0M',
  bcj: 'BcJ',
  fns: 'FNS',
  yay: 'Yay',
  cned: 'CNed',
  ange1: 'ANGE1',
  wo0t: 'Wo0t',
  riens: 'RieNs',
  boo: 'Boo',
  miniboo: 'MiniBoo',
  benjyfishy: 'Benjyfishy',
  trexx: 'Trexx',
  chronicle: 'Chronicle',
  boaster: 'Boaster',
  alfajer: 'Alfajer',
  leo: 'Leo (Swedish player)',
  kaajak: 'Kaajak',
  crashies: 'Crashies',
  nats: 'NAts',
  shao: 'Shao',
  zyppan: 'Zyppan',
  ardiis: 'Ardiis',
  scream: 'ScreaM',
  nivera: 'Nivera',
  redgar: 'Redgar',
  sayf: 'Sayf',
  tenz: 'TenZ',
  zekken: 'Zekken',
  pancada: 'PANcada',
  sacy: 'Sacy',
  saadhak: 'Saadhak',
  less: 'Less',
  cauanzin: 'Cauanzin',
  tuyz: 'Tuyz',
  qck: 'Qck',
  dgzin: 'Dgzin',
  khalil: 'Khalil',
  nozwerr: 'Nzr',
  kingg: 'KiNgg',
  mazino: 'Mazino',
  shyy: 'Shyy',
  melser: 'Melser',
  keznit: 'Keznit',
  klaus: 'Klaus',
  tacolilla: 'Tacolilla',
  adverso: 'Adverso',
  delz1k: 'Delz1k',
  nagz: 'NagZ',
  axeddy: 'Axeddy',
  daveeys: 'DaveeyS',
  cgrs: 'CGRS',
  laz: 'Laz',
  crow: 'Crow',
  dep: 'Dep',
  sugarz3ro: 'SugarZ3ro',
  tennn: 'TENNN',
  jitboys: 'JitboyS',
  crws: 'Crws',
  foxz: 'Foxz',
  sushiboys: 'Sushiboys',
  sscary: 'SScary',
  surf: 'Surf',
  primmie: 'Primmie',
  governor: 'Governor',
  jonahp: 'JonahP',
  demon1: 'Demon1',
  boostio: 'Boostio',
  icy: 'Icy (Jacob Lange)',
  tex: 'Tex',
  stax: 'Stax',
  meteor: 'Meteor',
  munchkin: 'Munchkin',
  karon: 'Karon',
  lakia: 'Lakia',
  stew: 'Stew',
  whzy: 'Whzy',
  knight: 'Knight (Liu Yuxiang)',
  biank: 'Biank',
  fengf: 'FengF',
  heib: 'Heybay',
  heybay: 'Heybay',
  aaaaY: 'AAAAY',
  aaaay: 'AAAAY',
  lysoar: 'Lysoar',
  yuicaw: 'Yuicaw',
  rarga: 'Rarga',
  happywei: 'Happywei',
  noman: 'NoMan',
  wsleo: 'WsLeo',
  slowly: 'Slowly',
  siufatbb: 'SiuFatBB',
  splash: 'Splash',
  scales: 'Scales',
  erv: 'Erv',
  dambi: 'Dambi',
  francis: 'Francis',
  ivy: 'Ivy (Korean player)',
  xross: 'Xross',
  kr1stal: 'Kr1stal',
  patmen: 'PatMen',
  xavi8k: 'Xavi8k',
  udotan: 'UdoTan',
  invy: 'InVy',
  fl1pzjder: 'Fl1pzjder',
  blazek1ng: 'BlaZek1ng',
  berserx: 'BerserX',
  tehbotoL: 'Tehbotol',
  tehbotol: 'Tehbotol',
  famouz: 'Famouz',
  ceNder: 'CeNder',
  cender: 'CeNder',
  runner: 'RunneR',
  ayrin: 'AYRIN',
  dephh: 'Dephh',
  mistic: 'Mistic',
  soulcas: 'Soulcas',
  dimasick: 'Dimasick',
  enzo: 'Enzo',
  hiro: 'Hiro (Emirhan Kat)',
  tomaszy: 'Tomaszy',
  marteen: 'Marteen',
  magnum: 'Magnum',
  shin: 'Shin',
  nukkye: 'Nukkye',
  hoody: 'Hoody',
  fit1nho: 'Fit1nho',
  rhyme: 'Rhyme',
  'ata kaptan': 'ATA KAPTAN',
  qraxs: 'QRaxs',
  mrfalin: 'MrFaliN',
  mojj: 'Mojj',
  qw1: 'Qw1',
  yetujey: 'Yetujey',
  sociablee: 'SociablEE',
  xeus: 'Xeus',
  s0pp: 'S0pp',
  erde: 'Erde',
  sayonara: 'Sayonara',
  brawk: 'Brawk',
  tzh: 'NizhaoTZH',
  rxy: 'Rxy',
  flex1n: 'Flex1n',
  zhe: 'Zhe',
  jkuro: 'Jkuro',
  crownfisher: 'Crownfisher',
};

const LP_HEADERS = {
  'User-Agent': 'ValorantChampionsMayhem/1.0 (https://localhost/vct-mayhem)',
  Accept: 'application/json',
};

const sleep = ms => new Promise(res => setTimeout(res, ms));

function toSlug(ign) {
  return ign
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '');
}

function getExistingPhotoForSlug(slug) {
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) {
    const filePath = path.join(OUTPUT_DIR, `${slug}.${ext}`);
    // Garante > 3500 bytes para evitar silhuetas/placeholders
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 3500) {
      return `/players/${slug}.${ext}`;
    }
  }
  return null;
}

function loadPlayersFromDatabase() {
  const tmpOut = path.resolve('dist/tmp_players_extract.cjs');
  try {
    execSync(
      `npx --no-install esbuild src/data/teamsAndPlayers.ts --bundle --platform=node --outfile="${tmpOut}"`,
      { stdio: 'ignore' }
    );
  } catch {
    execSync(
      `".\\node_modules\\.bin\\esbuild" src/data/teamsAndPlayers.ts --bundle --platform=node --outfile="${tmpOut}"`,
      { stdio: 'ignore' }
    );
  }
  return tmpOut;
}

function normText(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isRealPlayerWikitext(wikitext) {
  if (!wikitext) return false;
  if (/\{\{\s*Disambig/i.test(wikitext)) return false;
  return /\{\{\s*Infobox player/i.test(wikitext);
}

function extractImageFromWikitext(wikitext) {
  const match = wikitext.match(/\|image\s*=\s*([^\n|\}]+)/);
  if (!match) return null;
  let img = match[1].trim();
  img = img.replace(/^File:/i, '').trim();
  if (!img || /placeholder|sil|noimage|question/i.test(img)) return null;
  return img;
}

async function fetchLiquipediaJson(params) {
  const url = `https://liquipedia.net/valorant/api.php?${new URLSearchParams(params).toString()}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: LP_HEADERS });
    if (res.status === 429) {
      await sleep(3000 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
  throw new Error('Liquipedia rate limit');
}

async function queryLiquipediaInfoboxes(titles) {
  const results = new Map(); // normalized queried title -> { fileTitle, realName }
  const CHUNK = 35;

  for (let i = 0; i < titles.length; i += CHUNK) {
    const batch = titles.slice(i, i + CHUNK);
    const data = await fetchLiquipediaJson({
      action: 'query',
      titles: batch.join('|'),
      prop: 'revisions',
      rvprop: 'content',
      rvslots: 'main',
      redirects: '1',
      format: 'json',
    });

    const normalizedMap = new Map();
    for (const n of data.query?.normalized || []) {
      normalizedMap.set(n.to, n.from);
    }
    const redirectMap = new Map();
    for (const r of data.query?.redirects || []) {
      redirectMap.set(r.to, r.from);
    }

    const pages = Object.values(data.query?.pages || {});
    for (const p of pages) {
      const txt = p.revisions?.[0]?.slots?.main?.['*'] || p.revisions?.[0]?.['*'] || '';
      if (!isRealPlayerWikitext(txt)) continue;

      const fileTitle = extractImageFromWikitext(txt);
      if (!fileTitle) continue;

      const realNameMatch = txt.match(/\|romanized_name\s*=\s*([^\n|]+)|\|name\s*=\s*([^\n|]+)/);
      const realName = realNameMatch ? (realNameMatch[1] || realNameMatch[2] || '').trim() : '';

      // Trace back to original queried title(s)
      let cur = p.title;
      const trace = [cur];
      if (redirectMap.has(cur)) trace.push(redirectMap.get(cur));
      for (const t of [...trace]) {
        if (normalizedMap.has(t)) trace.push(normalizedMap.get(t));
      }
      for (const t of trace) {
        results.set(t.toLowerCase(), { fileTitle, realName });
      }
    }

    if (i + CHUNK < titles.length) await sleep(1500);
  }

  return results;
}

async function resolveFileUrls(fileNames) {
  const fileUrlMap = new Map(); // fileNameLower -> url
  const CHUNK = 35;

  for (let i = 0; i < fileNames.length; i += CHUNK) {
    const batch = fileNames.slice(i, i + CHUNK).map(f => `File:${f}`);
    const data = await fetchLiquipediaJson({
      action: 'query',
      titles: batch.join('|'),
      prop: 'imageinfo',
      iiprop: 'url',
      iiurlwidth: '300',
      format: 'json',
    });

    const normalizedMap = new Map();
    for (const n of data.query?.normalized || []) {
      normalizedMap.set(n.to, n.from);
    }

    const pages = Object.values(data.query?.pages || {});
    for (const p of pages) {
      const info = p.imageinfo?.[0];
      const url = info?.thumburl || info?.url;
      if (!url) continue;

      const stripped = p.title.replace(/^File:/i, '').toLowerCase();
      fileUrlMap.set(stripped, url);
      if (normalizedMap.has(p.title)) {
        const orig = normalizedMap.get(p.title).replace(/^File:/i, '').toLowerCase();
        fileUrlMap.set(orig, url);
      }
    }

    if (i + CHUNK < fileNames.length) await sleep(1500);
  }

  return fileUrlMap;
}

async function searchLiquipediaTitle(ign, realName) {
  const queries = realName ? [`${ign} ${realName}`, ign] : [ign];
  for (const q of queries) {
    const data = await fetchLiquipediaJson({
      action: 'query',
      list: 'search',
      srsearch: q,
      srlimit: '5',
      format: 'json',
    });
    const hits = data.query?.search || [];
    for (const h of hits) {
      if (normText(h.title).startsWith(normText(ign))) {
        return h.title;
      }
    }
    if (hits.length > 0 && realName) {
      return hits[0].title;
    }
    await sleep(600);
  }
  return null;
}

async function downloadImageFile(imgUrl, slug) {
  const extMatch = imgUrl.match(/\.(png|jpe?g|webp)(?:[?#]|$)/i);
  const ext = extMatch ? extMatch[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
  const filename = `${slug}.${ext}`;
  const outPath = path.join(OUTPUT_DIR, filename);

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(imgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    if (res.status === 429) {
      await sleep(2500 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 3000) throw new Error('Arquivo muito pequeno');
    fs.writeFileSync(outPath, buffer);
    return `/players/${filename}`;
  }
  throw new Error('Download falhou após tentativas');
}

async function main() {
  const tmpOut = loadPlayersFromDatabase();
  const { PLAYERS_DATABASE } = require(tmpOut);
  try {
    fs.unlinkSync(tmpOut);
  } catch {}

  const uniqueMap = new Map();
  for (const p of PLAYERS_DATABASE) {
    const key = p.ign.trim().toLowerCase();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, { ign: p.ign.trim(), name: p.name });
    }
  }

  const photoMap = {}; // lowerIgn -> webPath

  // 1. Mantém fotos válidas já baixadas + aliases
  for (const p of EXPLICIT_PLAYERS) {
    const existing = getExistingPhotoForSlug(p.slug);
    if (existing) {
      photoMap[p.ign.toLowerCase()] = existing;
      const aliases = IGN_ALIASES[p.slug] || [];
      for (const a of aliases) photoMap[a.toLowerCase()] = existing;
    }
  }

  const missingPlayers = [];
  for (const p of uniqueMap.values()) {
    const key = p.ign.toLowerCase();
    const slug = toSlug(p.ign);
    const existing = photoMap[key] || getExistingPhotoForSlug(slug);
    if (existing) {
      photoMap[key] = existing;
      const aliases = IGN_ALIASES[key] || IGN_ALIASES[slug] || [];
      for (const a of aliases) photoMap[a.toLowerCase()] = existing;
    } else {
      missingPlayers.push(p);
    }
  }

  console.log(
    `Já salvos localmente: ${uniqueMap.size - missingPlayers.length}/${uniqueMap.size}. Faltam: ${missingPlayers.length}`
  );

  if (missingPlayers.length > 0) {
    // 2. Consulta Liquipedia em lotes para todos os que faltam
    const titleForPlayer = new Map();
    for (const p of missingPlayers) {
      const k = p.ign.toLowerCase();
      const targetTitle = LIQUIPEDIA_TITLE_OVERRIDES[k] || p.ign;
      titleForPlayer.set(k, targetTitle);
    }

    console.log('Consultando Liquipedia em lotes...');
    const uniqueTitles = Array.from(new Set(titleForPlayer.values()));
    const infoboxes = await queryLiquipediaInfoboxes(uniqueTitles);

    // Segundo passo: busca título exato no search da Liquipedia para os que não vieram direto (ex: desambiguação)
    const stillUnresolved = missingPlayers.filter(
      p => !infoboxes.has(titleForPlayer.get(p.ign.toLowerCase()).toLowerCase())
    );

    if (stillUnresolved.length > 0) {
      console.log(`Buscando títulos alternativos no Liquipedia para ${stillUnresolved.length} atletas...`);
      const resolvedAltTitles = [];
      for (const p of stillUnresolved) {
        try {
          const alt = await searchLiquipediaTitle(p.ign, p.name);
          if (alt) {
            titleForPlayer.set(p.ign.toLowerCase(), alt);
            resolvedAltTitles.push(alt);
          }
          await sleep(450);
        } catch {
          // ignore search hiccup
        }
      }
      if (resolvedAltTitles.length > 0) {
        const extraBoxes = await queryLiquipediaInfoboxes(Array.from(new Set(resolvedAltTitles)));
        for (const [k, v] of extraBoxes.entries()) infoboxes.set(k, v);
      }
    }

    // 3. Resolve URLs das imagens em lote via imageinfo
    const fileToPlayers = new Map();
    for (const p of missingPlayers) {
      const key = p.ign.toLowerCase();
      const t = titleForPlayer.get(key).toLowerCase();
      const box = infoboxes.get(t);
      if (box?.fileTitle) {
        const fileKey = box.fileTitle.toLowerCase();
        if (!fileToPlayers.has(fileKey)) fileToPlayers.set(fileKey, []);
        fileToPlayers.get(fileKey).push(p);
      }
    }

    const uniqueFiles = Array.from(
      new Set(
        Array.from(infoboxes.values())
          .map(b => b.fileTitle)
          .filter(Boolean)
      )
    );

    console.log(`Resolvendo URLs de ${uniqueFiles.length} imagens no Liquipedia...`);
    const fileUrls = await resolveFileUrls(uniqueFiles);

    // 4. Faz o download gentil das imagens para public/players/
    let ok = 0;
    const stillMissing = [];
    for (const p of missingPlayers) {
      const key = p.ign.toLowerCase();
      const t = titleForPlayer.get(key).toLowerCase();
      const box = infoboxes.get(t);
      const url = box?.fileTitle ? fileUrls.get(box.fileTitle.toLowerCase()) : null;
      if (!url) {
        stillMissing.push(p.ign);
        continue;
      }

      try {
        const webPath = await downloadImageFile(url, toSlug(p.ign));
        photoMap[key] = webPath;
        const aliases = IGN_ALIASES[key] || IGN_ALIASES[toSlug(p.ign)] || [];
        for (const a of aliases) photoMap[a.toLowerCase()] = webPath;
        ok++;
        process.stdout.write('+');
        await sleep(180);
      } catch (e) {
        stillMissing.push(`${p.ign}(${e.message})`);
        process.stdout.write('x');
      }
    }

    console.log(`\nNovas fotos baixadas: ${ok}`);
    if (stillMissing.length > 0) {
      console.log(`Sem foto encontrada (${stillMissing.length}): ${stillMissing.join(', ')}`);
    }
  }

  // Garante mapeamento para todo alias
  for (const [k, aliases] of Object.entries(IGN_ALIASES)) {
    const found = photoMap[k] || aliases.map(a => photoMap[a.toLowerCase()]).find(Boolean);
    if (found) {
      photoMap[k] = found;
      for (const a of aliases) photoMap[a.toLowerCase()] = found;
    }
  }

  const sortedEntries = Object.entries(photoMap).sort((a, b) => a[0].localeCompare(b[0]));
  const tsLines = [
    '// Gerado automaticamente por baixar-fotos.mjs — fotos reais em public/players/',
    'export const PLAYER_PHOTOS: Record<string, string> = {',
    ...sortedEntries.map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`),
    '};',
    '',
    'export function getPlayerPhotoUrl(ign?: string): string | null {',
    '  if (!ign) return null;',
    '  const key = ign.trim().toLowerCase();',
    '  if (PLAYER_PHOTOS[key]) return PLAYER_PHOTOS[key];',
    "  const normalized = key.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');",
    '  return PLAYER_PHOTOS[normalized] || null;',
    '}',
    '',
  ];
  fs.writeFileSync(DATA_OUT_FILE, tsLines.join('\n'), 'utf8');
  console.log(`\nMapeamento salvo em src/data/playerPhotos.ts (${sortedEntries.length} entradas)!`);
}

main();
