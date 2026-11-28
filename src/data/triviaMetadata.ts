import { Player } from '../types';

export type TriviaPlayerStatus = 'Ativo' | 'Reserva / FA' | 'Aposentado';

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

/**
 * Datas de nascimento oficiais (YYYY-MM-DD) verificadas via Liquipedia API (220/220)
 */
const PLAYER_BIRTH_DATES: Record<string, string> = {
  "aaaay": "2002-12-12",
  "adverso": "1998-03-13",
  "alfajer": "2005-06-10",
  "ange1": "1989-09-10",
  "ardiis": "1998-05-01",
  "artzin": "2003-11-29",
  "aspas": "2003-06-15",
  "asuna": "2003-07-26",
  "ata kaptan": "2001-07-06",
  "autumn": "1991-02-27",
  "avez": "2004-10-05",
  "axeddy": "2003-06-11",
  "ayrin": "1996-04-04",
  "babybay": "1995-06-23",
  "ban": "2000-01-27",
  "bang": "2004-03-13",
  "bcj": "2000-07-04",
  "benjyfishy": "2004-04-02",
  "benkai": "1996-11-10",
  "berlin": "2004-04-19",
  "berserx": "2003-07-25",
  "beyn": "2003-09-05",
  "biank": "2000-12-16",
  "blazek1ng": "1996-05-03",
  "boaster": "1995-05-25",
  "boo": "1997-12-02",
  "boostio": "2000-11-14",
  "brawk": "2000-06-05",
  "buzz": "2003-01-13",
  "c0m": "2000-05-10",
  "carpe": "1998-10-14",
  "cauanzin": "2005-08-02",
  "cender": "2001-10-30",
  "chichoo": "2003-11-27",
  "chronicle": "2002-08-16",
  "cloud": "2003-10-10",
  "cned": "2002-01-18",
  "cortezia": "2004-12-16",
  "crashies": "1997-12-20",
  "crow": "1997-11-28",
  "crownfisher": "2005-10-24",
  "crws": "1996-11-15",
  "cryocells": "2002-12-22",
  "d4v41": "1998-10-14",
  "dambi": "2006-06-22",
  "darker": "2005-03-25",
  "daveeys": "2000-09-02",
  "davih": "2003-01-28",
  "delz1k": "2000-06-22",
  "demon1": "2002-09-07",
  "dep": "2000-12-04",
  "dephh": "1991-12-23",
  "derke": "2003-02-06",
  "derrek": "1997-09-16",
  "dgzin": "2000-07-06",
  "dimasick": "1996-07-06",
  "dos9": "2004-06-03",
  "enzo": "1996-06-12",
  "erde": "2008-02-12",
  "erv": "2004-02-16",
  "ethan": "2000-03-02",
  "f0rsaken": "2004-03-25",
  "famouz": "1998-06-03",
  "fengf": "2003-11-09",
  "fit1nho": "2000-02-08",
  "fl1pzjder": "1999-07-27",
  "flashback": "2005-11-15",
  "flex1n": "2001-08-02",
  "fns": "1992-03-19",
  "foxy9": "2004-11-20",
  "foxz": "1999-04-08",
  "francis": "2006-07-31",
  "governor": "2003-08-19",
  "gsr": "2008-08-09",
  "haodong": "2002-08-04",
  "happywei": "2004-04-13",
  "heat": "2003-02-07",
  "heib": "1998-03-16",
  "hiro": "2006-03-10",
  "hoody": "1998-09-17",
  "icy": "2003-04-30",
  "invy": "2004-07-08",
  "ivy": "2005-03-07",
  "izu": "2004-09-23",
  "jamppi": "2001-07-22",
  "jawgemo": "1999-06-24",
  "jinggg": "2003-07-29",
  "jitboys": "2005-03-06",
  "jkuro": "2005-03-01",
  "johnqt": "1998-09-21",
  "jonahp": "2000-03-31",
  "kaajak": "2004-08-08",
  "kai": "2003-10-01",
  "kamo": "2005-04-11",
  "karon": "2002-10-21",
  "keiko": "2003-09-12",
  "keznit": "2001-08-14",
  "khalil": "2004-06-11",
  "kicks": "2005-09-18",
  "kingg": "2001-10-23",
  "klaus": "2001-04-04",
  "knight": "2003-10-14",
  "kr1stal": "2003-04-03",
  "krostaly": "2006-02-24",
  "lakia": "2000-12-24",
  "laz": "1995-11-26",
  "leaf": "2003-11-24",
  "leo": "2003-12-15",
  "less": "2005-02-24",
  "lewn": "2006-11-05",
  "life": "2002-08-09",
  "lukxo": "2007-03-07",
  "luok1ng": "2002-03-28",
  "lysoar": "2005-02-22",
  "mada": "2003-12-16",
  "magnum": "2001-08-09",
  "mako": "2002-01-15",
  "marteen": "2004-10-21",
  "marved": "2000-02-24",
  "mazino": "2001-06-29",
  "melser": "1995-05-12",
  "meteor": "1999-12-19",
  "mindfreak": "1999-10-04",
  "miniboo": "2005-07-11",
  "mistic": "2001-11-12",
  "mojj": "1997-05-21",
  "mrfalin": "2000-09-27",
  "munchkin": "1998-03-27",
  "mzn": "1999-07-27",
  "n4rrate": "2002-11-25",
  "nagz": "1996-12-11",
  "nats": "2002-07-01",
  "nephh": "2003-03-21",
  "nivera": "2001-06-10",
  "nobody": "2002-12-05",
  "noman": "2004-09-13",
  "nozwerr": "1998-05-08",
  "nukkye": "1997-11-05",
  "pancada": "1999-10-31",
  "patmen": "2001-12-05",
  "primmie": "2004-10-08",
  "profek": "2004-07-25",
  "qck": "2003-07-18",
  "qraxs": "2000-05-02",
  "qw1": "2002-06-10",
  "rarga": "2001-11-20",
  "rb": "2001-12-07",
  "redgar": "1997-10-17",
  "rhyme": "1999-01-12",
  "riens": "2005-05-20",
  "rin": "1998-05-18",
  "runner": "2003-10-08",
  "s0m": "2002-06-07",
  "s0pp": "2008-03-24",
  "s1mon": "2004-06-25",
  "saadhak": "1997-03-08",
  "sacy": "1997-12-02",
  "sayaplayer": "1998-07-29",
  "sayf": "2001-01-01",
  "sayonara": "2008-03-04",
  "scales": "2004-10-20",
  "scream": "1994-07-02",
  "shao": "2000-01-27",
  "shin": "2002-09-03",
  "shyy": "2004-09-22",
  "siufatbb": "1999-07-19",
  "skuba": "2002-12-03",
  "slowly": "2001-09-23",
  "smoggy": "2002-06-08",
  "sociablee": "1996-04-29",
  "something": "2002-02-11",
  "soulcas": "2000-01-02",
  "splash": "2007-08-14",
  "sscary": "1999-08-02",
  "stax": "2000-02-16",
  "stellar": "1996-07-29",
  "stew": "2005-03-18",
  "sugarz3ro": "2003-03-18",
  "surf": "2004-04-02",
  "sushiboys": "2000-11-06",
  "suygetsu": "2002-07-16",
  "t3xture": "1999-07-20",
  "tacolilla": "2000-10-03",
  "tehbotol": "2001-08-04",
  "tennn": "2001-10-19",
  "tenz": "2001-05-05",
  "tex": "1999-08-02",
  "timotino": "2007-07-18",
  "tkzin": "2008-02-13",
  "tomaszy": "2005-08-19",
  "trent": "2004-12-09",
  "trexx": "2004-04-24",
  "tuyz": "2003-08-03",
  "tzh": "1999-10-02",
  "udotan": "2004-05-10",
  "v1nny": "1997-05-21",
  "valyn": "2003-01-04",
  "verno": "2006-04-27",
  "victor": "1996-09-14",
  "vora": "2004-09-01",
  "whzy": "2003-07-28",
  "will": "1999-11-20",
  "wo0t": "2006-03-16",
  "wsleo": "2001-03-18",
  "xavi8k": "2001-10-28",
  "xenom": "2002-10-17",
  "xeta": "1997-06-03",
  "xeus": "2004-10-25",
  "xross": "2007-11-20",
  "yay": "1998-09-09",
  "yetujey": "2005-11-08",
  "yosemite": "2002-06-22",
  "yuicaw": "2004-02-20",
  "zekken": "2005-03-19",
  "zellsis": "1998-03-02",
  "zest": "2000-12-27",
  "zhe": "2004-07-21",
  "zmjjkk": "2004-03-03",
  "zyppan": "2002-07-17"
};

/**
 * Status competitivo verificado via Liquipedia API
 */
const PLAYER_STATUS: Record<string, TriviaPlayerStatus> = {
  "aaaay": "Ativo",
  "adverso": "Aposentado",
  "alfajer": "Reserva / FA",
  "ange1": "Aposentado",
  "ardiis": "Aposentado",
  "artzin": "Reserva / FA",
  "aspas": "Ativo",
  "asuna": "Ativo",
  "ata kaptan": "Aposentado",
  "autumn": "Aposentado",
  "avez": "Ativo",
  "axeddy": "Ativo",
  "ayrin": "Aposentado",
  "babybay": "Reserva / FA",
  "ban": "Reserva / FA",
  "bang": "Ativo",
  "bcj": "Aposentado",
  "benjyfishy": "Ativo",
  "benkai": "Aposentado",
  "berlin": "Ativo",
  "berserx": "Reserva / FA",
  "beyn": "Reserva / FA",
  "biank": "Ativo",
  "blazek1ng": "Aposentado",
  "boaster": "Ativo",
  "boo": "Ativo",
  "boostio": "Reserva / FA",
  "brawk": "Ativo",
  "buzz": "Ativo",
  "c0m": "Reserva / FA",
  "carpe": "Reserva / FA",
  "cauanzin": "Reserva / FA",
  "cender": "Reserva / FA",
  "chichoo": "Ativo",
  "chronicle": "Ativo",
  "cloud": "Ativo",
  "cned": "Reserva / FA",
  "cortezia": "Ativo",
  "crashies": "Reserva / FA",
  "crow": "Aposentado",
  "crownfisher": "Ativo",
  "crws": "Aposentado",
  "cryocells": "Ativo",
  "d4v41": "Reserva / FA",
  "dambi": "Ativo",
  "darker": "Ativo",
  "daveeys": "Aposentado",
  "davih": "Ativo",
  "delz1k": "Reserva / FA",
  "demon1": "Ativo",
  "dep": "Ativo",
  "dephh": "Aposentado",
  "derke": "Ativo",
  "derrek": "Ativo",
  "dgzin": "Reserva / FA",
  "dimasick": "Aposentado",
  "dos9": "Ativo",
  "enzo": "Reserva / FA",
  "erde": "Ativo",
  "erv": "Ativo",
  "ethan": "Ativo",
  "f0rsaken": "Ativo",
  "famouz": "Reserva / FA",
  "fengf": "Ativo",
  "fit1nho": "Ativo",
  "fl1pzjder": "Reserva / FA",
  "flashback": "Aposentado",
  "flex1n": "Ativo",
  "fns": "Aposentado",
  "foxy9": "Reserva / FA",
  "foxz": "Reserva / FA",
  "francis": "Ativo",
  "governor": "Ativo",
  "gsr": "Ativo",
  "haodong": "Reserva / FA",
  "happywei": "Ativo",
  "heat": "Reserva / FA",
  "heib": "Ativo",
  "hiro": "Reserva / FA",
  "hoody": "Ativo",
  "icy": "Reserva / FA",
  "invy": "Ativo",
  "ivy": "Ativo",
  "izu": "Ativo",
  "jamppi": "Ativo",
  "jawgemo": "Ativo",
  "jinggg": "Reserva / FA",
  "jitboys": "Ativo",
  "jkuro": "Ativo",
  "johnqt": "Ativo",
  "jonahp": "Reserva / FA",
  "kaajak": "Ativo",
  "kai": "Ativo",
  "kamo": "Ativo",
  "karon": "Ativo",
  "keiko": "Reserva / FA",
  "keznit": "Ativo",
  "khalil": "Reserva / FA",
  "kicks": "Ativo",
  "kingg": "Reserva / FA",
  "klaus": "Reserva / FA",
  "knight": "Ativo",
  "kr1stal": "Reserva / FA",
  "krostaly": "Ativo",
  "lakia": "Reserva / FA",
  "laz": "Aposentado",
  "leaf": "Ativo",
  "leo": "Aposentado",
  "less": "Ativo",
  "lewn": "Ativo",
  "life": "Ativo",
  "lukxo": "Ativo",
  "luok1ng": "Ativo",
  "lysoar": "Ativo",
  "mada": "Ativo",
  "magnum": "Ativo",
  "mako": "Reserva / FA",
  "marteen": "Reserva / FA",
  "marved": "Reserva / FA",
  "mazino": "Ativo",
  "melser": "Reserva / FA",
  "meteor": "Reserva / FA",
  "mindfreak": "Reserva / FA",
  "miniboo": "Ativo",
  "mistic": "Reserva / FA",
  "mojj": "Reserva / FA",
  "mrfalin": "Reserva / FA",
  "munchkin": "Reserva / FA",
  "mzn": "Ativo",
  "n4rrate": "Ativo",
  "nagz": "Ativo",
  "nats": "Ativo",
  "nephh": "Ativo",
  "nivera": "Aposentado",
  "nobody": "Ativo",
  "noman": "Ativo",
  "nozwerr": "Reserva / FA",
  "nukkye": "Aposentado",
  "pancada": "Reserva / FA",
  "patmen": "Reserva / FA",
  "primmie": "Reserva / FA",
  "profek": "Ativo",
  "qck": "Reserva / FA",
  "qraxs": "Reserva / FA",
  "qw1": "Aposentado",
  "rarga": "Reserva / FA",
  "rb": "Ativo",
  "redgar": "Ativo",
  "rhyme": "Aposentado",
  "riens": "Ativo",
  "rin": "Aposentado",
  "runner": "Ativo",
  "s0m": "Aposentado",
  "s0pp": "Ativo",
  "s1mon": "Ativo",
  "saadhak": "Reserva / FA",
  "sacy": "Aposentado",
  "sayaplayer": "Reserva / FA",
  "sayf": "Reserva / FA",
  "sayonara": "Ativo",
  "scales": "Ativo",
  "scream": "Aposentado",
  "shao": "Ativo",
  "shin": "Reserva / FA",
  "shyy": "Reserva / FA",
  "siufatbb": "Ativo",
  "skuba": "Ativo",
  "slowly": "Ativo",
  "smoggy": "Ativo",
  "sociablee": "Ativo",
  "something": "Ativo",
  "soulcas": "Reserva / FA",
  "splash": "Ativo",
  "sscary": "Reserva / FA",
  "stax": "Ativo",
  "stellar": "Reserva / FA",
  "stew": "Ativo",
  "sugarz3ro": "Ativo",
  "surf": "Ativo",
  "sushiboys": "Aposentado",
  "suygetsu": "Ativo",
  "t3xture": "Ativo",
  "tacolilla": "Reserva / FA",
  "tehbotol": "Ativo",
  "tennn": "Reserva / FA",
  "tenz": "Ativo",
  "tex": "Ativo",
  "timotino": "Ativo",
  "tkzin": "Ativo",
  "tomaszy": "Reserva / FA",
  "trent": "Ativo",
  "trexx": "Ativo",
  "tuyz": "Ativo",
  "tzh": "Reserva / FA",
  "udotan": "Ativo",
  "v1nny": "Reserva / FA",
  "valyn": "Reserva / FA",
  "verno": "Ativo",
  "victor": "Reserva / FA",
  "vora": "Ativo",
  "whzy": "Ativo",
  "will": "Reserva / FA",
  "wo0t": "Reserva / FA",
  "wsleo": "Ativo",
  "xavi8k": "Reserva / FA",
  "xenom": "Ativo",
  "xeta": "Aposentado",
  "xeus": "Reserva / FA",
  "xross": "Ativo",
  "yay": "Reserva / FA",
  "yetujey": "Ativo",
  "yosemite": "Ativo",
  "yuicaw": "Ativo",
  "zekken": "Ativo",
  "zellsis": "Reserva / FA",
  "zest": "Aposentado",
  "zhe": "Ativo",
  "zmjjkk": "Ativo",
  "zyppan": "Reserva / FA"
};

export function calculateAge(birthDateIso: string, referenceDate: Date = new Date()): number | null {
  const match = birthDateIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  let age = referenceDate.getFullYear() - year;
  const hasHadBirthday =
    referenceDate.getMonth() + 1 > month ||
    (referenceDate.getMonth() + 1 === month && referenceDate.getDate() >= day);
  if (!hasHadBirthday) age--;
  return age;
}

export interface TriviaPlayerMeta {
  debutYear: number;
  trophies: number;
  birthDate: string;
  age: number;
  status: TriviaPlayerStatus;
}

/**
 * Curadoria dos ~115 jogadores mais reconhecíveis / icônicos do cenário VCT (2021–2026).
 * Usada como pool alvo no Desafio Diário e no modo padrão "Populares" do Treino Livre,
 * enquanto todos os 220 atletas continuam pesquisáveis para palpites.
 */
export const POPULAR_TRIVIA_IGNS: ReadonlySet<string> = new Set([
  // Americas (~48)
  'aspas', 'less', 'saadhak', 'sacy', 'pancada', 'cauanzin', 'tuyz', 'lukxo',
  'dgzin', 'qck', 'khalil', 'nozwerr', 'heat', 'artzin', 'cortezia', 'xenom', 'verno',
  'tenz', 'zekken', 'johnqt', 'zellsis', 'n4rrate', 'bang',
  'yay', 'fns', 'victor', 'crashies', 'marved', 's0m', 'ethan',
  'demon1', 'boostio', 'jawgemo', 'c0m', 'brawk', 'mada', 'skuba',
  'asuna', 'cryocells', 'derrek', 'trent', 'valyn', 'jonahp', 'leaf', 'babybay',
  'kingg', 'mazino', 'tex', 'keznit', 'melser', 'klaus', 'shyy', 'daveeys', 'tacolilla',
  // EMEA (~34)
  'boaster', 'derke', 'alfajer', 'chronicle', 'leo', 'kaajak', 'hiro', 'mistic', 'enzo',
  'nats', 'scream', 'nivera', 'jamppi', 'soulcas', 'redgar', 'sayf', 'trexx', 'kamo', 'kicks', 'keiko',
  'boo', 'benjyfishy', 'miniboo', 'riens', 'wo0t',
  'shao', 'suygetsu', 'zyppan', 'ange1', 'ardiis', 'cned',
  'mrfalin', 'yetujey', 'xeus', 'cloud', 'nukkye', 'marteen', 'sayonara',
  // Pacific (~30)
  'f0rsaken', 'jinggg', 'd4v41', 'mindfreak', 'something', 'benkai', 'patmen', 'invy',
  'mako', 'stax', 'buzz', 'rb', 'zest', 'foxy9', 'flashback', 'beyn',
  't3xture', 'karon', 'meteor', 'munchkin', 'lakia',
  'izu', 'carpe', 'sayaplayer', 'xeta',
  'laz', 'dep', 'sugarz3ro', 'tennn', 'crow',
  'primmie', 'crws', 'sscary',
  // China (~12)
  'zmjjkk', 'chichoo', 'nobody', 'smoggy', 'haodong', 's1mon',
  'whzy', 'biank', 'knight', 'life', 'berlin', 'aaaay',
]);

export function isPopularTriviaPlayer(ign: string): boolean {
  return POPULAR_TRIVIA_IGNS.has(ign.trim().toLowerCase());
}

export function getNameInitials(realName?: string): string {
  if (!realName) return '—';
  const parts = realName
    .trim()
    .split(/\s+/)
    .filter(p => p.length > 0 && /[A-Za-zÀ-ÿ]/.test(p[0]));
  if (parts.length === 0) return '—';
  if (parts.length === 1) return `${parts[0][0].toUpperCase()}.`;
  return `${parts[0][0].toUpperCase()}. ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export function getTriviaPlayerMeta(player: Player, earliestDbYear: number): TriviaPlayerMeta {
  const key = player.ign.trim().toLowerCase();
  const birthDate = PLAYER_BIRTH_DATES[key] || '2001-01-01';
  const age = calculateAge(birthDate) ?? 23;
  return {
    debutYear: VCT_DEBUT_YEAR_OVERRIDES[key] ?? earliestDbYear,
    trophies: INTERNATIONAL_TROPHIES[key] ?? 0,
    birthDate,
    age,
    status: PLAYER_STATUS[key] ?? 'Ativo',
  };
}
