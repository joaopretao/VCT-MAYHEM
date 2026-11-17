import { Player } from '../types';
import { PLAYERS_DATABASE } from './teamsAndPlayers';
import { TEAMS_2026 } from './teams2026';

export type GridCriterionType = 'team' | 'nationality' | 'achievement';

export interface GridCriterion {
  id: string;
  label: string;
  subLabel?: string;
  type: GridCriterionType;
  value: string;
  color?: string;
  shortCode?: string;
}

export interface GridPuzzle {
  id: string;
  number: number;
  title: string;
  description: string;
  rows: [GridCriterion, GridCriterion, GridCriterion];
  cols: [GridCriterion, GridCriterion, GridCriterion];
}

/**
 * Aliases de nicks de jogadores que mudaram de nome ou grafia ao longo da carreira
 */
const IGN_ALIAS_GROUPS: string[][] = [
  ['Nozwerr', 'nzr'],
  ['mazin', 'mzn'],
  ['liazzi', 'liazz'],
  ['Victor', 'food'],
  ['Sayaplayer', 'Spyder'],
  ['dimasick', 'dimaoneshot'],
  ['ZmjjKK', 'KangKang'],
  ['TzH', 'NizhaoTZH'],
  ['HeiB', 'Heybay'],
  ['t3xture', 'texture'],
  ['LewN', 'LêwN'],
  ['Shao', 'Shion7'],
];

const ALIAS_MAP: Record<string, string[]> = {};
for (const group of IGN_ALIAS_GROUPS) {
  const lowerGroup = group.map(g => g.toLowerCase());
  for (const name of lowerGroup) {
    ALIAS_MAP[name] = lowerGroup;
  }
}

/**
 * Histórico completo de jogadores por organização (2021–2026)
 */
export const TEAM_ROSTER_HISTORY: Record<string, string[]> = {
  // === VCT AMERICAS ===
  'LOUD': [
    'aspas', 'Sacy', 'pANcada', 'Less', 'saadhak', 'cauanzin', 'tuyz', 'qck',
    'dgzin', 'v1nNy', 'lukxo', 'virtyy', 'RobbieBk', 'tkzin', 'erde', 'Darker', 'DaviH',
  ],
  'FURIA': [
    'xand', 'qck', 'khalil', 'Nozwerr', 'mazin', 'dgzin', 'mwzera', 'kon4n',
    'liazz', 'havoc', 'liazzi', 'nzr', 'heat', 'raafa', 'tuyz', 'pryze',
    'Urango', 'basic', 'artzin', 'nerve', 'alym', 'koalanoob', 'eeiu',
  ],
  'MIBR': [
    'jzz', 'frz', 'murizzz', 'heat', 'RgLM', 'txozin', 'Palla', 'artzin',
    'mazin', 'liazzi', 'rich', 'cortezia', 'xenom', 'verno', 'aspas', 'tex',
    'Zekken', 'Mazino',
  ],
  'Sentinels': [
    'ShahZaM', 'SicK', 'Sinatraa', 'zombs', 'dapr', 'TenZ', 'Kanpeki', 'shroud',
    'Zellsis', 'Sacy', 'pANcada', 'dephh', 'Marved', 'johnqt', 'zekken', 'N4RRATE',
    'bang', 'reduxx', 'cortezia', 'Kyu', 'Nightz',
  ],
  'Cloud9': [
    'TenZ', 'Relyks', 'Mitch', 'shinobi', 'vice', 'leaf', 'xeta', 'poiz',
    'vanity', 'curry', 'Yay', 'Zellsis', 'qpert', 'runi', 'jakee', 'wippie',
    'OXY', 'moose', 'Rossy', 'v1c', 'neT', 'penny', 'demon1',
  ],
  'NRG': [
    'daps', 's0m', 'eeiu', 'ANDROID', 'Infinite', 'tex', 'hazed', 'Ethan',
    'FNS', 'Victor', 'Crashies', 'ardiis', 'Demon1', 'Marved', 'Verno', 'mada',
    'brawk', 'skuba', 'keiko',
  ],
  'Evil Geniuses': [
    'Aleksandar', 'Osias', 'temperature', 'clawdia', 'pho', 'Boostio', 'Reformed',
    'jawgemo', 'C0M', 'Apoth', 'icy', 'Ethan', 'Demon1', 'Derrek', 'NaturE',
    'supamen', 'yay', 'sym', 'okeanos',
  ],
  '100 Thieves': [
    'Hiko', 'nitr0', 'steel', 'Asuna', 'dicey', 'Ethan', 'b0i', 'seven',
    'jcStani', 'bang', 'Will', 'Derrek', 'stellar', 'Cryocells', 'eeiu',
    'Boostio', 'zander', 'Timotino', 'vora',
  ],
  'G2 Esports': [
    'trent', 'valyn', 'JonahP', 'leaf', 'icy', 'jawgemo', 'babybay',
  ],
  'OpTic Gaming': [
    'FNS', 'Victor', 'Crashies', 'Yay', 'Marved',
  ],
  'Team Envy': [
    'FNS', 'Victor', 'Crashies', 'Yay', 'Marved', 'kaboose', 'mummAy',
    'ANDROID', 'inspire', 'canezerra', 'ion2x', 'Eggsterr', 'P0PPIN',
  ],
  'XSET': [
    'AYRIN', 'BcJ', 'Cryocells', 'dephh', 'zekken', 'PureR', 'Thwifo', 'Wedid',
  ],
  'KRÜ Esports': [
    'NagZ', 'Klaus', 'Mazino', 'delz1k', 'keznit', 'xand', 'Daveeys', 'Melser',
    'axeddy', 'Tacolilla', 'shyy', 'heat', 'mta', 'adverso', 'Less', 'Dantedeu5',
    'Saadhak', 'mwzera', 'silentzz',
  ],
  'Leviatán': [
    'Tacolilla', 'Melser', 'adverso', 'kiNgg', 'Shyy', 'Nozwerr', 'Mazino',
    'keznit', 'aspas', 'tex', 'C0M', 'Demon1', 'nataNk', 'Rossy', 'Sato',
    'okeanos', 'blowz', 'SpikeziN',
  ],

  // === VCT EMEA ===
  'Fnatic': [
    'Boaster', 'Derke', 'Mistic', 'Magnum', 'doma', 'BraveAF', 'Enzo',
    'Alfajer', 'Fearoth', 'kamyk', 'Chronicle', 'Leo', 'Hiro', 'kaajak',
    'crashies', 'Veqaj',
  ],
  'Team Liquid': [
    'soulcas', 'L1NK', 'Kryptix', 'ec1s', 'ScreaM', 'Jamppi', 'Nivera',
    'dimasick', 'Sayf', 'Redgar', 'nAts', 'Enzo', 'Keiko', 'Mistic', 'paTiTek',
    'kamyk', 'kamo', 'Serial', 'purp0', 'trexx', 'Kicks', 'GSR',
  ],
  'Team Heretics': [
    'lowel', 'niesoW', 'paTiTek', 'pAura', 'AvovA', 'RUBINO', 'MONSTEERR',
    'al0rante', 'Zeek', 'keloqz', 'Mixwell', 'Boo', 'Benjyfishy', 'MiniBoo',
    'RieNs', 'Wo0t', 'ComeBack',
  ],
  'FUT Esports': [
    'mojj', 'qRaxs', 'qw1', 'MrFaliN', 'AtaKaptan', 'Muj', 'yetujey',
    'cNed', 'xeus', 'KROSTALY', 'sociablEE', 's0pp',
  ],
  'Team Vitality': [
    'ceNder', 'bramz', 'vakk', 'feqew', 'JESMUND', 'baddyG', 'nataNk',
    'H1ber', 'BONECOLD', 'MOLSI', 'Twisten', 'Destrian', 'runneR', 'Kicks',
    'trexx', 'Sayf', 'Derke', 'Less', 'CyvOph', 'UNFAKE', 'Jamppi',
    'Sayonara', 'Chronicle', 'PROFEK',
  ],
  'Natus Vincere': [
    'Cloud', '7ssk7', 'Duno', 'zeddy', 'Jady', 'ANGE1', 'Shao', 'Zyppan',
    'SUYGETSU', 'cNed', 'ardiis', 'koalanoob', 'hiro', 'Ruxic', 'alexiiik',
    'SociablEE',
  ],
  'GIANTX': [
    'Fit1nho', 'Meddo', 'pipsoN', 'hoody', 'nukkye', 'rhyme', 'Cloud',
    'Redgar', 'Purp0', 'westside', 'Grubinho', 'flickless', 'ara', 'tomaszy',
  ],
  'BBL Esports': [
    'AsLanM4shadoW', 'russ', 'aimDLL', 'Kerimhan', 'kero', 'pAura',
    'QutionerX', 'Turko', 'SouhcNi', 'Brave', 'Elite', 'reazy', 'LewN',
    'PROFEK', 'Jamppi', 'sociablEE', 'Lar0k', 'Crewen', 'Lovers Rock',
  ],
  'Karmine Corp': [
    'ScreaM', 'Nivera', 'Newzera', 'xms', 'Shin', 'ZE1SH', 'magnum',
    'marteen', 'N4RRATE', 'tomaszy', 'Elite', 'Saadhak', 'SUYGETSU', 'avez',
    'pyrolll', 'LêwN', 'dos9',
  ],
  'Acend': [
    'BONECOLD', 'cNed', 'starxo', 'zeek', 'Kiles', 'vakk', 'MONSTEERR',
    'L1NK', 'musashi',
  ],
  'Gambit Esports': [
    'Chronicle', 'd3ffo', 'Sheydos', 'nAts', 'Redgar',
  ],
  'FunPlus Phoenix': [
    // EMEA (2021-2022) + China (2023-2026)
    'ANGE1', 'Shao', 'Zyppan', 'SUYGETSU', 'ardiis', 'Meddo', 'dimaoneshot',
    'ShadoW', 'SEIDER', 'AAAAY', 'BerLIN', 'Yuicaw', 'Lysoar', 'NizhaoTZH',
    'Autumn', 'Life', 'yosemite', 'shrink', 'XII', 'setrod', 'sScary',
  ],

  // === VCT PACIFIC ===
  'Paper Rex': [
    'f0rsakeN', 'd4v41', 'Jinggg', 'mindfreak', 'Benkai', 'something',
    'Monyet', 'CGRS', 'PatMen', 'invy',
  ],
  'DRX': [
    'stax', 'Rb', 'Zest', 'BuZz', 'MaKo', 'Foxy9', 'Flashback', 'BeYN',
    'free1ng', 'HYUNMIN', 'Estrella', 'Hermes', 'Flicker',
  ],
  'Vision Strikers': [
    'stax', 'Rb', 'Zest', 'BuZz', 'MaKo', 'Lakia', 'k1Ng', 'glow',
  ],
  'Gen.G': [
    'huynh', 'gMd', 'Effys', 'MkaeL', 'player1', 'Shawn', 'koosta', 'NaturE',
    'Rhyme', 'PureR', 'Elmapuddy', 'TS', 'Secret', 'eKo', 'Sylvan', 'Meteor',
    't3xture', 'Karon', 'Munchkin', 'Lakia', 'Foxy9', 'yoman', 'Ash', 'Suggest',
  ],
  'ZETA DIVISION': [
    'Laz', 'crow', 'barce', 'Reita', 'takej', 'makiba', 'Dep', 'SugarZ3ro',
    'TENNN', 'Xdll', 'hiroronn', 'Yuran', 'SyouTa', 'CLZ', 'Syouta',
    'TenTen', 'Caedye', 'HoneyBunny',
  ],
  'T1': [
    'brax', 'AZK', 'crashies', 'food', 'Victor', 'Skadoodle', 'Spyder',
    'Sayaplayer', 'DaZeD', 'autimatic', 'Curry', 'Dawn', 'steel', 'thwifo',
    'pwny', 'dynamic', 'Munchkin', 'xeta', 'Ban', 'Carpe', 'iZu', 'Rossy',
    'k1Ng', 'stax', 'Sylvan', 'BuZz', 'Meteor', 'Dhennev',
  ],
  'Talon Esports': [
    'Crws', 'Foxz', 'Sushiboys', 'GarnetS', 'Patiphan', 'JitBoyS', 'ban',
    'Governor', 'lenne', 'surf', 'Primmie', 'killua', 'thyy',
  ],
  'Rex Regum Qeon': [
    'Nexi', 'KellyS', 'Kvzx', 'Draxx', 'Emmanuel', '2ge', 'Tehbotol',
    'fl1pzjder', 'Lmemore', 'EJAY', 'xffero', 'Estrella', 'Jemkin', 'Monyet',
    'kushy', 'crazyguy',
  ],
  'Nongshim RedForce': [
    'Dambi', 'Francis', 'Ivy', 'margaret', 'Persia', 'Xross', 'Rb',
  ],
  'Team Secret': [
    'JessieVash', 'DubsteP', 'BORKUM', 'Dispenser', 'witz', 'Jremy',
    'lenne', 'NDG', 'inVy', '2ge', 'Wild0reoo', 'kellyS', 'n1zzy', 'ZesBeeW',
  ],
  'BOOM Esports': [
    'blazek1ng', 'fl1pzjder', 'severiNe', 'NcSlasher', 'Eeyore', 'famouz',
    'BerserX', 'tehbotol', 'Shiro', 'Frostmind', 'ZesBeeW', 'dos9', 'natz',
    'Whitecat',
  ],
  'Global Esports': [
    'SkRossi', 'Lightningfast', 'KappA', 'HellrangeR', 'skillZ', 'AYRIN',
    'texture', 'Bazzi', 'Monyet', 'WRONSKI', 'Benkai', 'Russ', 'BlaZek1ng',
    'Polvi', 'Kr1stal', 'kellyS', 'papi', 'UdoTan', 'PatMen', 'xavi8k', 'Autumn',
  ],

  // === VCT CHINA ===
  'EDward Gaming': [
    'Haodong', 'CHICHOO', 'nobody', 'ZmjjKK', 'Smoggy', 'Life', 'QuQu',
    'Abo', 'KangKang', 'S1Mon', 'Jieni7', 'WoodAy1', 'zjc', 'stew',
  ],
  'Bilibili Gaming': [
    'whzy', 'Biank', 'Knight', 'Yosemite', 'rin', 'B3Ar', 'Levius',
    'nephh', 'rushia', 'Flex1n', 'S1Mon',
  ],
  'Trace Esports': [
    'FengF', 'Heybay', 'Kai', 'LuoK1ng', 'Biank', 'flex1n', 'cgrs', 'Song', 'Midi',
  ],
  'Dragon Ranger Gaming': [
    'vo0kashu', 'Nicc', 'TvirusLuke', 'Shao', 'Shion7', 'Dingwei', 'SpiritZ1',
    'Flex1n', 'Cangshu', 'Akeman', 'Zeno',
  ],
  'Xi Lai Gaming': [
    'Rarga', 'happywei', 'MarT1n', 'MrCANI', 'You', 'coconut', 'Viva',
    'NoMan', 'WsLeo', 'Lysoar', 'Kr1stal',
  ],
  'TYLOO': [
    'slowly', 'hfmi0dzjc9z7', 'LuoK1ng', 'Ninebody', 'Eren', 'AAK',
    'Coldfish', 'moxie', 'Splash', 'SiuFatBB', 'Scales', 'Erv', 'sword9',
  ],
  'JD Gaming': [
    'stew', 'jkuro', 'MarT1n', 'Viva', 'YiHao', 'Z1yan', 'babyblue',
    'zhe', 'Yuicaw', 'BerLIN', 'crownfisher',
  ],
};

// Constroi o índice reverso (jogador -> lista de times em que jogou)
export const PLAYER_TEAM_HISTORY: Record<string, string[]> = {};

for (const [teamName, roster] of Object.entries(TEAM_ROSTER_HISTORY)) {
  for (const rawIgn of roster) {
    const lower = rawIgn.trim().toLowerCase();
    const aliases = ALIAS_MAP[lower] || [lower];
    for (const alias of aliases) {
      if (!PLAYER_TEAM_HISTORY[alias]) {
        PLAYER_TEAM_HISTORY[alias] = [];
      }
      if (!PLAYER_TEAM_HISTORY[alias].includes(teamName)) {
        PLAYER_TEAM_HISTORY[alias].push(teamName);
      }
    }
  }
}

/**
 * Base completa de jogadores pesquisáveis no Modo Grid (inclui todos os atletas atuais e históricos)
 */
export const GRID_PLAYERS_DATABASE: Player[] = (() => {
  const result: Player[] = [...PLAYERS_DATABASE];
  const existingIgns = new Set(PLAYERS_DATABASE.map(p => p.ign.toLowerCase()));

  // Adiciona também os nomes alternativos de atletas que mudaram de nick
  for (const p of PLAYERS_DATABASE) {
    const aliases = ALIAS_MAP[p.ign.toLowerCase()];
    if (aliases) {
      for (const a of aliases) existingIgns.add(a);
    }
  }

  for (const [teamName, roster] of Object.entries(TEAM_ROSTER_HISTORY)) {
    for (const rawIgn of roster) {
      const cleanIgn = rawIgn.trim();
      const lower = cleanIgn.toLowerCase();
      if (existingIgns.has(lower)) continue;
      existingIgns.add(lower);

      const aliases = ALIAS_MAP[lower];
      if (aliases) {
        for (const a of aliases) existingIgns.add(a);
      }

      result.push({
        id: `hist-${teamName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${lower}`,
        ign: cleanIgn,
        name: 'Atleta VCT',
        country: '',
        countryCode: '',
        team: teamName,
        year: 2024,
        championsYears: [2024],
        primaryRole: 'Flex',
        secondaryRoles: [],
        signatureAgent: 'Omen',
        rating: 82,
        consistency: 82,
        clutch: 82,
        synergy: 82,
        flexibility: 82,
      });
    }
  }

  return result;
})();

export function isTeamMatch(teamName: string, targetTeam: string): boolean {
  const tNorm = (teamName || '').toLowerCase().trim();
  const targetNorm = (targetTeam || '').toLowerCase().trim();
  if (!tNorm || !targetNorm) return false;

  if (targetNorm === 'loud') return tNorm === 'loud' || tNorm.startsWith('loud ') || tNorm.endsWith(' loud');
  if (targetNorm === 'c9' || targetNorm === 'cloud9') return tNorm === 'c9' || tNorm.includes('cloud9');
  if (targetNorm === 'eg' || targetNorm === 'evil geniuses') return tNorm === 'eg' || tNorm.includes('evil geniuses');
  if (targetNorm === 'g2' || targetNorm === 'g2 esports') return tNorm === 'g2' || tNorm.includes('g2 esports');
  if (targetNorm === 'fpx' || targetNorm === 'funplus phoenix') return tNorm === 'fpx' || tNorm.includes('funplus');
  if (targetNorm === 'edg' || targetNorm === 'edward gaming') return tNorm === 'edg' || tNorm.includes('edward');
  if (targetNorm === 'prx' || targetNorm === 'paper rex') return tNorm === 'prx' || tNorm.includes('paper rex');
  if (targetNorm === 'krü' || targetNorm === 'kru' || targetNorm === 'krü esports') return tNorm.includes('krü') || tNorm.includes('kru');
  if (targetNorm === 'drx') return tNorm === 'drx' || tNorm.startsWith('drx ');
  if (targetNorm === 'nrg' || targetNorm === 'nrg esports') return tNorm === 'nrg' || tNorm.startsWith('nrg');
  if (targetNorm === 'optic' || targetNorm === 'optic gaming') return tNorm.includes('optic');
  if (targetNorm === 'envy' || targetNorm === 'team envy') return tNorm.includes('envy');
  if (targetNorm === 'navi' || targetNorm === 'natus vincere') return tNorm === 'navi' || tNorm.includes('natus vincere');
  if (targetNorm === 'kc' || targetNorm === 'karmine corp') return tNorm === 'kc' || tNorm.includes('karmine');
  if (targetNorm === 'tl' || targetNorm === 'team liquid') return tNorm === 'tl' || tNorm.includes('liquid');
  if (targetNorm === 'vit' || targetNorm === 'team vitality') return tNorm === 'vit' || tNorm.includes('vitality');
  if (targetNorm === 'th' || targetNorm === 'team heretics') return tNorm === 'th' || tNorm.includes('heretics');
  if (targetNorm === 'gen' || targetNorm === 'gen.g' || targetNorm === 'gen.g esports') return tNorm.includes('gen.g') || tNorm === 'gen';
  if (targetNorm === '100t' || targetNorm === '100 thieves') return tNorm.includes('100 thieves') || tNorm === '100t';
  if (targetNorm === 'lev' || targetNorm === 'leviatán' || targetNorm === 'leviatan') return tNorm.includes('leviat');
  if (targetNorm === 'furia' || targetNorm === 'furia esports') return tNorm.includes('furia');
  if (targetNorm === 'mibr') return tNorm.includes('mibr');
  if (targetNorm === 'giants' || targetNorm === 'giantx') return tNorm.includes('giant');
  if (targetNorm === 'rrq' || targetNorm === 'rex regum qeon') return tNorm === 'rrq' || tNorm.includes('rex regum');
  if (targetNorm === 'xlg' || targetNorm === 'xlg esports' || targetNorm === 'xi lai gaming') return tNorm.includes('xi lai') || tNorm.includes('xlg');
  if (targetNorm === 'drg' || targetNorm === 'dragon ranger gaming') return tNorm.includes('dragon ranger') || tNorm === 'drg';
  if (targetNorm === 'jdg' || targetNorm === 'jd gaming') return tNorm.includes('jd gaming') || tNorm === 'jdg';
  if (targetNorm === 'blg' || targetNorm === 'bilibili gaming') return tNorm.includes('bilibili') || tNorm === 'blg';
  if (targetNorm === 'vs' || targetNorm === 'vision strikers') return tNorm.includes('vision strikers') || tNorm === 'vs';
  return tNorm === targetNorm || tNorm.includes(targetNorm);
}

/**
 * Jogadores campeões de VCT Masters / LOCK//IN (2021–2026)
 */
const MASTERS_WINNER_IGNS = new Set(
  [
    // Masters Reykjavík 2021 (Sentinels)
    'TenZ', 'ShahZaM', 'SicK', 'zombs', 'dapr',
    // Masters Berlin 2021 (Gambit)
    'Chronicle', 'nAts', 'Redgar', 'Sheydos', 'd3ffo',
    // Masters Reykjavík 2022 (OpTic Gaming)
    'FNS', 'Victor', 'food', 'Crashies', 'Yay', 'Marved',
    // Masters Copenhagen 2022 (FunPlus Phoenix)
    'ANGE1', 'Shao', 'Zyppan', 'SUYGETSU', 'ardiis', 'SEIDER',
    // LOCK//IN & Masters Tokyo 2023 (Fnatic)
    'Boaster', 'Derke', 'Alfajer', 'Leo', 'Chronicle',
    // Masters Madrid 2024 (Sentinels)
    'zekken', 'Zellsis', 'johnqt', 'Sacy',
    // Masters Shanghai 2024 (Gen.G)
    'Meteor', 't3xture', 'texture', 'Karon', 'Munchkin', 'Lakia',
    // Masters Bangkok 2025 (T1)
    'BuZz', 'iZu', 'stax', 'Sylvan', 'Carpe',
    // Masters Toronto 2025 (Paper Rex)
    'f0rsakeN', 'd4v41', 'Jinggg', 'mindfreak', 'something', 'PatMen',
  ].map(s => s.toLowerCase())
);

/**
 * Jogadores que disputaram o VALORANT Champions 2026
 */
const CHAMPIONS_2026_IGNS = new Set(
  TEAMS_2026.flatMap(t => t.roster.map(p => p.ign.toLowerCase()))
);

export function getPlayerTeamHistory(ign: string): string[] {
  const ignLower = ign.trim().toLowerCase();
  const staticTeams = PLAYER_TEAM_HISTORY[ignLower] || [];
  const aliases = ALIAS_MAP[ignLower] || [ignLower];
  const dbTeams = PLAYERS_DATABASE
    .filter(p => aliases.includes(p.ign.toLowerCase()))
    .map(p => p.team);
  return Array.from(new Set([...staticTeams, ...dbTeams]));
}

export function playerMatchesCriterion(player: Player, criterion: GridCriterion): boolean {
  switch (criterion.type) {
    case 'team': {
      const targetTeam = criterion.value.trim();
      const history = getPlayerTeamHistory(player.ign);
      return (
        isTeamMatch(player.team, targetTeam) ||
        history.some(histTeam => isTeamMatch(histTeam, targetTeam))
      );
    }

    case 'achievement': {
      const val = criterion.value.toLowerCase().trim();
      const ignLow = player.ign.trim().toLowerCase();
      const aliases = ALIAS_MAP[ignLow] || [ignLow];

      if (val === 'masters_winner') {
        return aliases.some(a => MASTERS_WINNER_IGNS.has(a));
      }
      if (val === 'champions_2026') {
        return (
          player.year === 2026 ||
          (player.championsYears && player.championsYears.includes(2026)) ||
          aliases.some(a => CHAMPIONS_2026_IGNS.has(a))
        );
      }
      return false;
    }

    case 'nationality': {
      const targetNat = criterion.value.toLowerCase().trim();
      const playerCountry = (player.country || '').toLowerCase();
      const code = (player.countryCode || '').toUpperCase();

      if (targetNat === 'frança' || targetNat === 'france') return playerCountry.includes('fran') || code === 'FR';
      if (targetNat === 'espanha' || targetNat === 'spain') return playerCountry.includes('espan') || code === 'ES';
      if (targetNat === 'turquia') return playerCountry.includes('turqu') || code === 'TR';
      if (targetNat === 'brasil') return playerCountry.includes('brasil') || code === 'BR';
      if (targetNat === 'canadá') return playerCountry.includes('canad') || code === 'CA';
      if (targetNat === 'estados unidos') {
        return playerCountry.includes('estados unidos') || playerCountry.includes('eua') || code === 'US';
      }
      if (targetNat === 'chile') return playerCountry.includes('chile') || code === 'CL';
      if (targetNat === 'argentina') return playerCountry.includes('argent') || code === 'AR';
      if (targetNat === 'rússia') return playerCountry.includes('rús') || playerCountry.includes('rus') || code === 'RU';
      if (targetNat === 'finlândia') return playerCountry.includes('finl') || code === 'FI';
      if (targetNat === 'coreia do sul') return playerCountry.includes('coreia') || code === 'KR';
      if (targetNat === 'reino unido') return playerCountry.includes('reino') || code === 'GB';
      if (targetNat === 'japão') return playerCountry.includes('jap') || code === 'JP';
      if (targetNat === 'china') return playerCountry.includes('china') || code === 'CN';
      return playerCountry === targetNat;
    }

    default:
      return false;
  }
}

/**
 * Grids Clássicos de Janelas de Transferência & Nacionalidades
 */
export const GRID_PUZZLES: GridPuzzle[] = [
  {
    id: 'grid-1-teste-transferencias',
    number: 1,
    title: 'Grid 1: Sul-Americanos & Transferências',
    description: 'Cruze LOUD, MIBR e FURIA com atletas que passaram por KRÜ, Leviatán e Brasil.',
    cols: [
      { id: 'c1', label: 'LOUD', subLabel: 'VCT Americas', type: 'team', value: 'LOUD', color: '#00ff88', shortCode: 'LOUD' },
      { id: 'c2', label: 'MIBR', subLabel: 'VCT Americas', type: 'team', value: 'MIBR', color: '#009c3b', shortCode: 'MIBR' },
      { id: 'c3', label: 'FURIA', subLabel: 'VCT Americas', type: 'team', value: 'FURIA', color: '#ffffff', shortCode: 'FUR' },
    ],
    rows: [
      { id: 'r1', label: 'KRÜ Esports', subLabel: 'Jogou na KRÜ', type: 'team', value: 'KRÜ Esports', color: '#ff007f', shortCode: 'KRÜ' },
      { id: 'r2', label: 'Leviatán', subLabel: 'Jogou na Leviatán', type: 'team', value: 'Leviatán', color: '#4ea5de', shortCode: 'LEV' },
      { id: 'r3', label: 'Brasil', subLabel: 'Nacionalidade', type: 'nationality', value: 'brasil', color: '#009c3b', shortCode: 'BRA' },
    ],
  },
  {
    id: 'grid-2-gigantes-na',
    number: 2,
    title: 'Grid 2: Gigantes do NA & Cruzamentos (Dificuldade: Média)',
    description: 'Cruzamentos históricos entre NRG, Evil Geniuses e T1 contra 100 Thieves, Leviatán e Team Envy.',
    cols: [
      { id: 'c1', label: '100 Thieves', subLabel: 'VCT Americas', type: 'team', value: '100 Thieves', color: '#de1f26', shortCode: '100T' },
      { id: 'c2', label: 'Leviatán', subLabel: 'VCT Americas', type: 'team', value: 'Leviatán', color: '#4ea5de', shortCode: 'LEV' },
      { id: 'c3', label: 'Team Envy', subLabel: 'VCT Americas', type: 'team', value: 'Team Envy', color: '#0ea5e9', shortCode: 'ENVY' },
    ],
    rows: [
      { id: 'r1', label: 'NRG', subLabel: 'Jogou na NRG', type: 'team', value: 'NRG', color: '#ff3800', shortCode: 'NRG' },
      { id: 'r2', label: 'Evil Geniuses', subLabel: 'Jogou na EG', type: 'team', value: 'Evil Geniuses', color: '#053e6b', shortCode: 'EG' },
      { id: 'r3', label: 'T1', subLabel: 'Jogou na T1', type: 'team', value: 'T1', color: '#e4002b', shortCode: 'T1' },
    ],
  },
  {
    id: 'grid-3-batalha-emea',
    number: 3,
    title: 'Grid 3: Batalha do EMEA (Dificuldade: Média)',
    description: 'As janelas de transferência europeias entre Acend, BBL e Fnatic contra Liquid, Vitality e NAVI.',
    cols: [
      { id: 'c1', label: 'Team Liquid', subLabel: 'VCT EMEA', type: 'team', value: 'Team Liquid', color: '#2b7fff', shortCode: 'TL' },
      { id: 'c2', label: 'Team Vitality', subLabel: 'VCT EMEA', type: 'team', value: 'Team Vitality', color: '#f5c518', shortCode: 'VIT' },
      { id: 'c3', label: 'Natus Vincere (NAVI)', subLabel: 'VCT EMEA', type: 'team', value: 'Natus Vincere', color: '#fff200', shortCode: 'NAVI' },
    ],
    rows: [
      { id: 'r1', label: 'Acend', subLabel: 'Jogou na Acend', type: 'team', value: 'Acend', color: '#8b5cf6', shortCode: 'ACE' },
      { id: 'r2', label: 'BBL Esports', subLabel: 'Jogou na BBL', type: 'team', value: 'BBL Esports', color: '#f59e0b', shortCode: 'BBL' },
      { id: 'r3', label: 'Fnatic', subLabel: 'Jogou na Fnatic', type: 'team', value: 'Fnatic', color: '#ff5900', shortCode: 'FNC' },
    ],
  },
  {
    id: 'grid-4-ponte-americas-emea',
    number: 4,
    title: 'Grid 4: Ponte Américas × EMEA (Dificuldade: Difícil)',
    description: 'Janelas intercontinentais cruzando NRG, Fnatic e Karmine Corp com Liquid, NAVI e Estados Unidos.',
    cols: [
      { id: 'c1', label: 'NRG', subLabel: 'VCT Americas', type: 'team', value: 'NRG', color: '#ff3800', shortCode: 'NRG' },
      { id: 'c2', label: 'Fnatic', subLabel: 'VCT EMEA', type: 'team', value: 'Fnatic', color: '#ff5900', shortCode: 'FNC' },
      { id: 'c3', label: 'Karmine Corp', subLabel: 'VCT EMEA', type: 'team', value: 'Karmine Corp', color: '#00c8ff', shortCode: 'KC' },
    ],
    rows: [
      { id: 'r1', label: 'Estados Unidos', subLabel: 'Nacionalidade', type: 'nationality', value: 'estados unidos', color: '#3b82f6', shortCode: 'USA' },
      { id: 'r2', label: 'Team Liquid', subLabel: 'Jogou na Team Liquid', type: 'team', value: 'Team Liquid', color: '#2b7fff', shortCode: 'TL' },
      { id: 'r3', label: 'Natus Vincere (NAVI)', subLabel: 'Jogou na NAVI', type: 'team', value: 'Natus Vincere', color: '#fff200', shortCode: 'NAVI' },
    ],
  },
  {
    id: 'grid-5-dinastia-coreana',
    number: 5,
    title: 'Grid 5: Ponte Américas × Pacífico (Dificuldade: Média/Difícil)',
    description: 'Transferências e origens conectando Evil Geniuses, XSET e T1 contra 100 Thieves, Gen.G e Estados Unidos.',
    cols: [
      { id: 'c1', label: 'Evil Geniuses', subLabel: 'VCT Americas', type: 'team', value: 'Evil Geniuses', color: '#053e6b', shortCode: 'EG' },
      { id: 'c2', label: 'XSET', subLabel: 'Champions 2022', type: 'team', value: 'XSET', color: '#ef4444', shortCode: 'XSET' },
      { id: 'c3', label: 'T1', subLabel: 'VCT Pacific', type: 'team', value: 'T1', color: '#e4002b', shortCode: 'T1' },
    ],
    rows: [
      { id: 'r1', label: 'Estados Unidos', subLabel: 'Nacionalidade', type: 'nationality', value: 'estados unidos', color: '#3b82f6', shortCode: 'USA' },
      { id: 'r2', label: '100 Thieves', subLabel: 'Jogou na 100 Thieves', type: 'team', value: '100 Thieves', color: '#de1f26', shortCode: '100T' },
      { id: 'r3', label: 'Gen.G', subLabel: 'Jogou na Gen.G', type: 'team', value: 'Gen.G', color: '#aa8a00', shortCode: 'GEN' },
    ],
  },
];
