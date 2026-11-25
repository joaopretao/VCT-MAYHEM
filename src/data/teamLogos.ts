// Official team logos registry with authentic colors and local custom SVG logos

export interface TeamLogoData {
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  category: 'Americas' | 'EMEA' | 'Pacific' | 'China';
}

export const TEAM_REAL_LOGOS: Record<string, TeamLogoData> = {
  loud: {
    name: 'LOUD',
    shortName: 'LOUD',
    primaryColor: '#00ff88',
    secondaryColor: '#003b1f',
    logoUrl: './logos/loud.png',
    category: 'Americas',
  },
  furia: {
    name: 'FURIA',
    shortName: 'FUR',
    primaryColor: '#ffffff',
    secondaryColor: '#111111',
    logoUrl: './logos/furia.png',
    category: 'Americas',
  },
  sentinels: {
    name: 'Sentinels',
    shortName: 'SEN',
    primaryColor: '#ce0037',
    secondaryColor: '#ffffff',
    logoUrl: './logos/sentinels.png',
    category: 'Americas',
  },
  fnatic: {
    name: 'Fnatic',
    shortName: 'FNC',
    primaryColor: '#ff5900',
    secondaryColor: '#181a1d',
    logoUrl: './logos/fnatic.png',
    category: 'EMEA',
  },
  paperrex: {
    name: 'Paper Rex',
    shortName: 'PRX',
    primaryColor: '#d63384',
    secondaryColor: '#00d2ff',
    logoUrl: './logos/prx.png',
    category: 'Pacific',
  },
  g2: {
    name: 'G2 Esports',
    shortName: 'G2',
    primaryColor: '#ee1515',
    secondaryColor: '#ffffff',
    logoUrl: './logos/g2.png',
    category: 'Americas',
  },
  liquid: {
    name: 'Team Liquid',
    shortName: 'TL',
    primaryColor: '#2b7fff',
    secondaryColor: '#0c223f',
    logoUrl: './logos/liquid.png',
    category: 'EMEA',
  },
  xlg: {
    name: 'Xi Lai Gaming',
    shortName: 'XLG',
    primaryColor: '#38b2ac',
    secondaryColor: '#004b87',
    logoUrl: './logos/xlg.png',
    category: 'China',
  },
  geng: {
    name: 'Gen.G Esports',
    shortName: 'GEN',
    primaryColor: '#aa8a00',
    secondaryColor: '#000000',
    logoUrl: './logos/geng.png',
    category: 'Pacific',
  },
  edg: {
    name: 'EDward Gaming',
    shortName: 'EDG',
    primaryColor: '#c51d24',
    secondaryColor: '#111111',
    logoUrl: './logos/edg.png',
    category: 'China',
  },
  vitality: {
    name: 'Team Vitality',
    shortName: 'VIT',
    primaryColor: '#f5c518',
    secondaryColor: '#000000',
    logoUrl: './logos/vitality.png',
    category: 'EMEA',
  },
  ns: {
    name: 'Nongshim RedForce',
    shortName: 'NS',
    primaryColor: '#de2027',
    secondaryColor: '#101010',
    logoUrl: './logos/ns.png',
    category: 'Pacific',
  },
  heretics: {
    name: 'Team Heretics',
    shortName: 'TH',
    primaryColor: '#d6a13d',
    secondaryColor: '#121212',
    logoUrl: './logos/heretics.png',
    category: 'EMEA',
  },
  nrg: {
    name: 'NRG Esports',
    shortName: 'NRG',
    primaryColor: '#ff3800',
    secondaryColor: '#2b2b2b',
    logoUrl: './logos/nrg.png',
    category: 'Americas',
  },
  jdg: {
    name: 'JD Gaming',
    shortName: 'JDG',
    primaryColor: '#d81e28',
    secondaryColor: '#0b1325',
    logoUrl: './logos/jdg.png',
    category: 'China',
  },
  talon: {
    name: 'Talon Esports',
    shortName: 'TLN',
    primaryColor: '#ea1d2d',
    secondaryColor: '#ffffff',
    logoUrl: './logos/talon.png',
    category: 'Pacific',
  },
  trace: {
    name: 'Trace Esports',
    shortName: 'TE',
    primaryColor: '#00adb5',
    secondaryColor: '#2e3859',
    logoUrl: './logos/trace.png',
    category: 'China',
  },
  kru: {
    name: 'KRÜ Esports',
    shortName: 'KRÜ',
    primaryColor: '#ff007f',
    secondaryColor: '#111111',
    logoUrl: './logos/kru.png',
    category: 'Americas',
  },
  thieves: {
    name: '100 Thieves',
    shortName: '100T',
    primaryColor: '#de1f26',
    secondaryColor: '#1a1a1a',
    logoUrl: './logos/100t.png',
    category: 'Americas',
  },
  mibr: {
    name: 'MIBR',
    shortName: 'MIBR',
    primaryColor: '#009c3b',
    secondaryColor: '#001a4d',
    logoUrl: './logos/mibr.png',
    category: 'Americas',
  },
  optic: {
    name: 'OpTic Gaming',
    shortName: 'OPTIC',
    primaryColor: '#88c227',
    secondaryColor: '#181818',
    logoUrl: './logos/optic.png',
    category: 'Americas',
  },
  leviatan: {
    name: 'Leviatán',
    shortName: 'LEV',
    primaryColor: '#4ea5de',
    secondaryColor: '#003366',
    logoUrl: './logos/leviatan.png',
    category: 'Americas',
  },
  kc: {
    name: 'Karmine Corp',
    shortName: 'KC',
    primaryColor: '#00c8ff',
    secondaryColor: '#051336',
    logoUrl: './logos/kc.png',
    category: 'EMEA',
  },
  drx: {
    name: 'DRX',
    shortName: 'DRX',
    primaryColor: '#2563eb',
    secondaryColor: '#5ce1e6',
    logoUrl: './logos/drx.png',
    category: 'Pacific',
  },
  blg: {
    name: 'Bilibili Gaming',
    shortName: 'BLG',
    primaryColor: '#00a6e3',
    secondaryColor: '#f25d8e',
    logoUrl: './logos/blg.png',
    category: 'China',
  },
  c9: {
    name: 'Cloud9',
    shortName: 'C9',
    primaryColor: '#0ea5e9',
    secondaryColor: '#0b253c',
    logoUrl: './logos/c9.png',
    category: 'Americas',
  },
  fpx: {
    name: 'FunPlus Phoenix',
    shortName: 'FPX',
    primaryColor: '#ff4655',
    secondaryColor: '#ff9900',
    logoUrl: './logos/fpx.png',
    category: 'EMEA',
  },
  eg: {
    name: 'Evil Geniuses',
    shortName: 'EG',
    primaryColor: '#053e6b',
    secondaryColor: '#ffffff',
    logoUrl: './logos/eg.png',
    category: 'Americas',
  },
  fut: {
    name: 'FUT Esports',
    shortName: 'FUT',
    primaryColor: '#d92534',
    secondaryColor: '#111111',
    logoUrl: './logos/fut.png',
    category: 'EMEA',
  },
  navi: {
    name: 'Natus Vincere',
    shortName: 'NAVI',
    primaryColor: '#fff200',
    secondaryColor: '#000000',
    logoUrl: './logos/navi.png',
    category: 'EMEA',
  },
  zeta: {
    name: 'ZETA DIVISION',
    shortName: 'ZETA',
    primaryColor: '#c4ff00',
    secondaryColor: '#121212',
    logoUrl: './logos/zeta.png',
    category: 'Pacific',
  },
  t1: {
    name: 'T1',
    shortName: 'T1',
    primaryColor: '#e4002b',
    secondaryColor: '#0f0f0f',
    logoUrl: './logos/t1.png',
    category: 'Pacific',
  },
  tyloo: {
    name: 'TYLOO',
    shortName: 'TYL',
    primaryColor: '#d62828',
    secondaryColor: '#f77f00',
    logoUrl: './logos/tyloo.png',
    category: 'China',
  },
  global: {
    name: 'Global Esports',
    shortName: 'GE',
    primaryColor: '#0055ff',
    secondaryColor: '#ef4444',
    logoUrl: './logos/global.png',
    category: 'Pacific',
  },
  xset: {
    name: 'XSET',
    shortName: 'XSET',
    primaryColor: '#ff0033',
    secondaryColor: '#111111',
    logoUrl: './logos/xset.png',
    category: 'Americas',
  },
  boom: {
    name: 'BOOM Esports',
    shortName: 'BME',
    primaryColor: '#e02424',
    secondaryColor: '#111111',
    logoUrl: './logos/boom.png',
    category: 'Pacific',
  },
  xerxia: {
    name: 'XERXIA',
    shortName: 'XIA',
    primaryColor: '#ec4899',
    secondaryColor: '#111111',
    logoUrl: './logos/xerxia.png',
    category: 'Pacific',
  },
  giantx: {
    name: 'GIANTX',
    shortName: 'GX',
    primaryColor: '#38bdf8',
    secondaryColor: '#0b0e14',
    logoUrl: './logos/giantx.png',
    category: 'EMEA',
  },
  acend: {
    name: 'Acend',
    shortName: 'ACE',
    primaryColor: '#a855f7',
    secondaryColor: '#eab308',
    logoUrl: './logos/acend.png',
    category: 'EMEA',
  },
  rrq: {
    name: 'Rex Regum Qeon',
    shortName: 'RRQ',
    primaryColor: '#f59e0b',
    secondaryColor: '#111111',
    logoUrl: './logos/rrq.png',
    category: 'Pacific',
  },
  fullsense: {
    name: 'FULL SENSE',
    shortName: 'FS',
    primaryColor: '#ff5900',
    secondaryColor: '#111111',
    logoUrl: './logos/fullsense.png',
    category: 'Pacific',
  },
  ag: {
    name: 'All Gamers',
    shortName: 'AG',
    primaryColor: '#ef4444',
    secondaryColor: '#111111',
    logoUrl: './logos/ag.png',
    category: 'China',
  },
  drg: {
    name: 'Dragon Ranger Gaming',
    shortName: 'DRG',
    primaryColor: '#2563eb',
    secondaryColor: '#4ade80',
    logoUrl: './logos/drg.png',
    category: 'China',
  },
  envy: {
    name: 'Team Envy',
    shortName: 'ENVY',
    primaryColor: '#0ea5e9',
    secondaryColor: '#111111',
    logoUrl: './logos/envy.png',
    category: 'Americas',
  },
  bbl: {
    name: 'BBL Esports',
    shortName: 'BBL',
    primaryColor: '#f59e0b',
    secondaryColor: '#111111',
    logoUrl: './logos/bbl.png',
    category: 'EMEA',
  },
  gambit: {
    name: 'Gambit Esports',
    shortName: 'GMB',
    primaryColor: '#ef4444',
    secondaryColor: '#111111',
    logoUrl: './logos/gambit.png',
    category: 'EMEA',
  },
  secret: {
    name: 'Team Secret',
    shortName: 'TS',
    primaryColor: '#ffffff',
    secondaryColor: '#111111',
    logoUrl: './logos/secret.png',
    category: 'Pacific',
  },
};

// Normalized helper to find team data
export function getTeamLogoData(teamQuery: string): TeamLogoData | null {
  if (!teamQuery) return null;
  const q = teamQuery.toLowerCase().replace(/[\s.-]/g, '');

  if (q.includes('loud')) return TEAM_REAL_LOGOS.loud;
  if (q.includes('furia') || q === 'fur') return TEAM_REAL_LOGOS.furia;
  if (q.includes('sentinel') || q === 'sen') return TEAM_REAL_LOGOS.sentinels;
  if (q.includes('fnatic') || q === 'fnc') return TEAM_REAL_LOGOS.fnatic;
  if (q.includes('paperrex') || q === 'prx') return TEAM_REAL_LOGOS.paperrex;
  if (q.includes('g2')) return TEAM_REAL_LOGOS.g2;
  if (q.includes('liquid') || q === 'tl') return TEAM_REAL_LOGOS.liquid;
  if (q.includes('cloud9') || q === 'c9') return TEAM_REAL_LOGOS.c9;

  if (q.includes('xilai') || q.includes('xlg')) return TEAM_REAL_LOGOS.xlg;
  if (q.includes('geng') || q === 'gen') return TEAM_REAL_LOGOS.geng;
  if (q.includes('edward') || q.includes('edg')) return TEAM_REAL_LOGOS.edg;
  if (q.includes('vitality') || q === 'vit') return TEAM_REAL_LOGOS.vitality;
  if (q.includes('nongshim') || q.includes('redforce') || q === 'ns') return TEAM_REAL_LOGOS.ns;
  if (q.includes('heretics') || q === 'th') return TEAM_REAL_LOGOS.heretics;
  if (q.includes('nrrg') || q.includes('nrg')) return TEAM_REAL_LOGOS.nrg;
  if (q.includes('jdg') || q.includes('jdgaming')) return TEAM_REAL_LOGOS.jdg;
  if (q.includes('talon') || q === 'tln') return TEAM_REAL_LOGOS.talon;
  if (q.includes('trace') || q === 'te') return TEAM_REAL_LOGOS.trace;
  if (q.includes('kru') || q.includes('krü')) return TEAM_REAL_LOGOS.kru;
  if (q.includes('100thieves') || q.includes('100t') || q.includes('thieves')) return TEAM_REAL_LOGOS.thieves;
  if (q.includes('mibr')) return TEAM_REAL_LOGOS.mibr;
  if (q.includes('optic')) return TEAM_REAL_LOGOS.optic;
  if (q.includes('leviathan') || q.includes('leviatan') || q.includes('leviatán') || q === 'lev') return TEAM_REAL_LOGOS.leviatan;
  if (q.includes('karmine') || q.includes('kc')) return TEAM_REAL_LOGOS.kc;
  if (q.includes('drx') || q.includes('dragonx')) return TEAM_REAL_LOGOS.drx;
  if (q.includes('bilibili') || q.includes('blg')) return TEAM_REAL_LOGOS.blg;

  if (q.includes('funplus') || q === 'fpx') return TEAM_REAL_LOGOS.fpx;
  if (q.includes('evil') || q === 'eg') return TEAM_REAL_LOGOS.eg;
  if (q.includes('fut')) return TEAM_REAL_LOGOS.fut;
  if (q.includes('navi') || q.includes('natus')) return TEAM_REAL_LOGOS.navi;
  if (q.includes('zeta')) return TEAM_REAL_LOGOS.zeta;
  if (q.includes('t1')) return TEAM_REAL_LOGOS.t1;
  if (q.includes('tyloo')) return TEAM_REAL_LOGOS.tyloo;
  if (q.includes('giantx') || q.includes('giants') || q === 'gx') return TEAM_REAL_LOGOS.giantx;
  if (q.includes('acend') || q === 'ace') return TEAM_REAL_LOGOS.acend;
  if (q.includes('rexregum') || q.includes('rrq')) return TEAM_REAL_LOGOS.rrq;
  if (q.includes('fullsense') || q === 'fs') return TEAM_REAL_LOGOS.fullsense;
  if (q.includes('allgamers') || q === 'ag') return TEAM_REAL_LOGOS.ag;
  if (q.includes('dragonranger') || q === 'drg') return TEAM_REAL_LOGOS.drg;
  if (q.includes('global') || q === 'ge') return TEAM_REAL_LOGOS.global;
  if (q.includes('xset')) return TEAM_REAL_LOGOS.xset;
  if (q.includes('boom') || q === 'bme') return TEAM_REAL_LOGOS.boom;
  if (q.includes('xerxia') || q === 'xia') return TEAM_REAL_LOGOS.xerxia;
  if (q.includes('envy')) return TEAM_REAL_LOGOS.envy;
  if (q.includes('bbl')) return TEAM_REAL_LOGOS.bbl;
  if (q.includes('gambit') || q === 'gmb') return TEAM_REAL_LOGOS.gambit;
  if (q.includes('secret') || q === 'ts') return TEAM_REAL_LOGOS.secret;

  return null;
}
