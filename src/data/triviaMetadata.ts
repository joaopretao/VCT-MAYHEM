import { Player } from '../types';

/**
 * Total de títulos internacionais oficiais em LAN do VCT (Masters + LOCK//IN + Champions, 2021–2025)
 */
const INTERNATIONAL_TROPHIES: Record<string, number> = {
  // 3 títulos
  chronicle: 3, // Berlin '21, LOCK//IN '23, Tokyo '23

  // 2 títulos
  boaster: 2,   // LOCK//IN '23, Tokyo '23
  derke: 2,     // LOCK//IN '23, Tokyo '23
  alfajer: 2,   // LOCK//IN '23, Tokyo '23
  leo: 2,       // LOCK//IN '23, Tokyo '23
  tenz: 2,      // Reykjavik '21, Madrid '24
  sacy: 2,      // Champions '22, Madrid '24
  meteor: 2,    // Shanghai '24, Bangkok '25
  ethan: 2,     // Champions '23, Champions '25

  // 1 título
  nats: 1,      // Berlin '21
  redgar: 1,    // Berlin '21
  cned: 1,      // Champions '21
  fns: 1,       // Reykjavik '22
  victor: 1,    // Reykjavik '22
  crashies: 1,  // Reykjavik '22
  yay: 1,       // Reykjavik '22
  marved: 1,    // Reykjavik '22
  ange1: 1,     // Copenhagen '22
  shao: 1,      // Copenhagen '22
  zyppan: 1,    // Copenhagen '22
  suygetsu: 1,  // Copenhagen '22
  ardiis: 1,    // Copenhagen '22
  aspas: 1,     // Champions '22
  less: 1,      // Champions '22
  saadhak: 1,   // Champions '22
  pancada: 1,   // Champions '22
  boostio: 1,   // Champions '23
  jawgemo: 1,   // Champions '23
  c0m: 1,       // Champions '23
  demon1: 1,    // Champions '23
  zekken: 1,    // Madrid '24
  zellsis: 1,   // Madrid '24
  johnqt: 1,    // Madrid '24
  t3xture: 1,   // Shanghai '24
  karon: 1,     // Shanghai '24
  munchkin: 1,  // Shanghai '24
  lakia: 1,     // Shanghai '24
  zmjjkk: 1,    // Champions '24
  chichoo: 1,   // Champions '24
  nobody: 1,    // Champions '24
  smoggy: 1,    // Champions '24
  s1mon: 1,     // Champions '24
  buzz: 1,      // Bangkok '25
  izu: 1,       // Bangkok '25
  stax: 1,      // Bangkok '25
  carpe: 1,     // Bangkok '25
  f0rsaken: 1,  // Toronto '25
  d4v41: 1,     // Toronto '25
  jinggg: 1,    // Toronto '25
  mindfreak: 1, // Toronto '25
  something: 1, // Toronto '25
  patmen: 1,    // Toronto '25
  s0m: 1,       // Champions '25
  brawk: 1,     // Champions '25
  skuba: 1,     // Champions '25
  mada: 1,      // Champions '25
};

/**
 * Jogadores que atuam ou atuaram como IGL (In-Game Leader) principal no Tier 1 do VCT
 */
const VCT_IGL_IGNS = new Set<string>([
  // Americas
  'saadhak', 'fns', 'boostio', 'kingg', 'johnqt', 'klaus', 'melser',
  'valyn', 'stellar', 'ayrin', 'dephh', 'nozwerr', 'adverso', 'ethan',
  'v1nny', 'artzin', 'verno', 'rossy', 'steel',
  // EMEA
  'boaster', 'ange1', 'boo', 'redgar', 'nats', 'cender', 'mrfalin',
  'enzo', 'rhyme', 'jamppi', 'magnum', 'sayf', 'scream', 'nukkye',
  // Pacific
  'stax', 'mako', 'munchkin', 'benkai', 'laz', 'crws', 'foxz',
  'fl1pzjder', 'blazek1ng', 'kr1stal',
  // China
  'haodong', 'nobody', 'berlin', 'biank', 'siufatbb',
]);

/**
 * Ano de estreia no cenário Tier 1 / VCT para atletas cuja primeira entrada no banco (2022+) foi posterior
 */
const VCT_DEBUT_YEAR_OVERRIDES: Record<string, number> = {
  // OGs de 2021 (Masters Reykjavik / Berlin / Champions 2021 / VCT 2021)
  tenz: 2021, sacy: 2021, saadhak: 2021, boaster: 2021, derke: 2021,
  mistic: 2021, enzo: 2021, chronicle: 2021, nats: 2021, redgar: 2021,
  shao: 2021, zyppan: 2021, suygetsu: 2021, cned: 2021, ange1: 2021,
  ardiis: 2021, fns: 2021, victor: 2021, crashies: 2021, yay: 2021,
  marved: 2021, asuna: 2021, ethan: 2021, stax: 2021, mako: 2021,
  buzz: 2021, rb: 2021, zest: 2021, lakia: 2021, laz: 2021, crow: 2021,
  dep: 2021, sugarz3ro: 2021, f0rsaken: 2021, d4v41: 2021, benkai: 2021,
  scream: 2021, nivera: 2021, jamppi: 2021, soulcas: 2021, dimasick: 2021,
  klaus: 2021, nagz: 2021, delz1k: 2021, mazino: 2021, keznit: 2021,
  khalil: 2021, nozwerr: 2021, foxz: 2021, sscary: 2021, crws: 2021,
  sushiboys: 2021, dephh: 2021, leo: 2021, sayf: 2021, hoody: 2021,
  nukkye: 2021, t3xture: 2021, munchkin: 2021, zellsis: 2021, zekken: 2021,
  s0m: 2021, leaf: 2021, boostio: 2021, babybay: 2021, xeta: 2021,
  // Estreia VCT Tier 1 / Masters 2022 antes de ir ao Champions
  cryocells: 2022, valyn: 2022, trent: 2022, jonahp: 2022, sayaplayer: 2022,
  trexx: 2022, bang: 2022, will: 2022,
  // Estreia Tier 1 em 2023 (Franchising)
  carpe: 2023,
  // Estreia VCT Tier 1 em 2024
  johnqt: 2024, n4rrate: 2024,
};

export interface TriviaPlayerMeta {
  debutYear: number;
  trophies: number;
  isIgl: boolean;
}

export function getTriviaPlayerMeta(player: Player, earliestDbYear: number): TriviaPlayerMeta {
  const key = player.ign.trim().toLowerCase();
  return {
    debutYear: VCT_DEBUT_YEAR_OVERRIDES[key] ?? earliestDbYear,
    trophies: INTERNATIONAL_TROPHIES[key] ?? 0,
    isIgl: VCT_IGL_IGNS.has(key),
  };
}
