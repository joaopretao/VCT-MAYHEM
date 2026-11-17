import { GridPuzzle, GridCriterion, GRID_PUZZLES, playerMatchesCriterion, GRID_PLAYERS_DATABASE } from './gridPuzzles';

// Candidate Column Criteria — 100% Single Teams (No "A ou B")
export const INFINITE_COL_CRITERIA: GridCriterion[] = [
  { id: 'c_loud', label: 'LOUD', subLabel: 'VCT Americas', type: 'team', value: 'LOUD', color: '#00ff88', shortCode: 'LOUD' },
  { id: 'c_sen', label: 'Sentinels', subLabel: 'VCT Americas', type: 'team', value: 'Sentinels', color: '#ce0037', shortCode: 'SEN' },
  { id: 'c_nrg', label: 'NRG', subLabel: 'VCT Americas', type: 'team', value: 'NRG', color: '#ff3800', shortCode: 'NRG' },
  { id: 'c_g2', label: 'G2 Esports', subLabel: 'VCT Americas', type: 'team', value: 'G2 Esports', color: '#ee1515', shortCode: 'G2' },
  { id: 'c_c9', label: 'Cloud9', subLabel: 'VCT Americas', type: 'team', value: 'Cloud9', color: '#0ea5e9', shortCode: 'C9' },
  { id: 'c_100t', label: '100 Thieves', subLabel: 'VCT Americas', type: 'team', value: '100 Thieves', color: '#de1f26', shortCode: '100T' },
  { id: 'c_eg', label: 'Evil Geniuses', subLabel: 'VCT Americas', type: 'team', value: 'Evil Geniuses', color: '#053e6b', shortCode: 'EG' },
  { id: 'c_lev', label: 'Leviatán', subLabel: 'VCT Americas', type: 'team', value: 'Leviatán', color: '#4ea5de', shortCode: 'LEV' },
  { id: 'c_kru', label: 'KRÜ Esports', subLabel: 'VCT Americas', type: 'team', value: 'KRÜ Esports', color: '#ff007f', shortCode: 'KRÜ' },
  { id: 'c_mibr', label: 'MIBR', subLabel: 'VCT Americas', type: 'team', value: 'MIBR', color: '#009c3b', shortCode: 'MIBR' },
  { id: 'c_furia', label: 'FURIA', subLabel: 'VCT Americas', type: 'team', value: 'FURIA', color: '#ffffff', shortCode: 'FUR' },
  { id: 'c_optic', label: 'OpTic Gaming', subLabel: 'Champions 2022', type: 'team', value: 'OpTic Gaming', color: '#88c227', shortCode: 'OG' },
  { id: 'c_envy', label: 'Team Envy', subLabel: 'VCT Americas', type: 'team', value: 'Team Envy', color: '#0ea5e9', shortCode: 'ENVY' },
  { id: 'c_xset', label: 'XSET', subLabel: 'Champions 2022', type: 'team', value: 'XSET', color: '#ef4444', shortCode: 'XSET' },
  { id: 'c_fnc', label: 'Fnatic', subLabel: 'VCT EMEA', type: 'team', value: 'Fnatic', color: '#ff5900', shortCode: 'FNC' },
  { id: 'c_vit', label: 'Team Vitality', subLabel: 'VCT EMEA', type: 'team', value: 'Team Vitality', color: '#f5c518', shortCode: 'VIT' },
  { id: 'c_tl', label: 'Team Liquid', subLabel: 'VCT EMEA', type: 'team', value: 'Team Liquid', color: '#2b7fff', shortCode: 'TL' },
  { id: 'c_kc', label: 'Karmine Corp', subLabel: 'VCT EMEA', type: 'team', value: 'Karmine Corp', color: '#00c8ff', shortCode: 'KC' },
  { id: 'c_th', label: 'Team Heretics', subLabel: 'VCT EMEA', type: 'team', value: 'Team Heretics', color: '#d6a13d', shortCode: 'TH' },
  { id: 'c_navi', label: 'Natus Vincere', subLabel: 'VCT EMEA', type: 'team', value: 'Natus Vincere', color: '#fff200', shortCode: 'NAVI' },
  { id: 'c_fut', label: 'FUT Esports', subLabel: 'VCT EMEA', type: 'team', value: 'FUT Esports', color: '#d92534', shortCode: 'FUT' },
  { id: 'c_gx', label: 'GIANTX', subLabel: 'VCT EMEA', type: 'team', value: 'GIANTX', color: '#38bdf8', shortCode: 'GX' },
  { id: 'c_bbl', label: 'BBL Esports', subLabel: 'VCT EMEA', type: 'team', value: 'BBL Esports', color: '#f59e0b', shortCode: 'BBL' },
  { id: 'c_acend', label: 'Acend', subLabel: 'Champions 2021', type: 'team', value: 'Acend', color: '#8b5cf6', shortCode: 'ACE' },
  { id: 'c_gambit', label: 'Gambit Esports', subLabel: 'Champions 2021', type: 'team', value: 'Gambit Esports', color: '#ef4444', shortCode: 'GMB' },
  { id: 'c_fpx', label: 'FunPlus Phoenix', subLabel: 'EMEA / China', type: 'team', value: 'FunPlus Phoenix', color: '#ff4655', shortCode: 'FPX' },
  { id: 'c_prx', label: 'Paper Rex', subLabel: 'VCT Pacific', type: 'team', value: 'Paper Rex', color: '#d63384', shortCode: 'PRX' },
  { id: 'c_drx', label: 'DRX', subLabel: 'VCT Pacific', type: 'team', value: 'DRX', color: '#2563eb', shortCode: 'DRX' },
  { id: 'c_geng', label: 'Gen.G', subLabel: 'VCT Pacific', type: 'team', value: 'Gen.G', color: '#aa8a00', shortCode: 'GEN' },
  { id: 'c_t1', label: 'T1', subLabel: 'VCT Pacific', type: 'team', value: 'T1', color: '#e4002b', shortCode: 'T1' },
  { id: 'c_tln', label: 'Talon Esports', subLabel: 'VCT Pacific', type: 'team', value: 'Talon Esports', color: '#ea1d2d', shortCode: 'TLN' },
  { id: 'c_rrq', label: 'Rex Regum Qeon', subLabel: 'VCT Pacific', type: 'team', value: 'Rex Regum Qeon', color: '#f59e0b', shortCode: 'RRQ' },
  { id: 'c_ts', label: 'Team Secret', subLabel: 'VCT Pacific', type: 'team', value: 'Team Secret', color: '#ffffff', shortCode: 'TS' },
  { id: 'c_bme', label: 'BOOM Esports', subLabel: 'VCT Pacific', type: 'team', value: 'BOOM Esports', color: '#ef4444', shortCode: 'BME' },
  { id: 'c_ge', label: 'Global Esports', subLabel: 'VCT Pacific', type: 'team', value: 'Global Esports', color: '#0055ff', shortCode: 'GE' },
  { id: 'c_edg', label: 'EDward Gaming', subLabel: 'VCT China', type: 'team', value: 'EDward Gaming', color: '#c51d24', shortCode: 'EDG' },
  { id: 'c_blg', label: 'Bilibili Gaming', subLabel: 'VCT China', type: 'team', value: 'Bilibili Gaming', color: '#00a1d6', shortCode: 'BLG' },
  { id: 'c_te', label: 'Trace Esports', subLabel: 'VCT China', type: 'team', value: 'Trace Esports', color: '#00adb5', shortCode: 'TE' },
  { id: 'c_xlg', label: 'Xi Lai Gaming', subLabel: 'VCT China', type: 'team', value: 'Xi Lai Gaming', color: '#38bdf8', shortCode: 'XLG' },
  { id: 'c_jdg', label: 'JD Gaming', subLabel: 'VCT China', type: 'team', value: 'JD Gaming', color: '#d81e28', shortCode: 'JDG' },
];

// Candidate Row Criteria — 100% Single Teams & Single Nationalities (No "A ou B")
export const INFINITE_ROW_CRITERIA: GridCriterion[] = [
  // Single Nationalities
  { id: 'r_br', label: 'Brasil', subLabel: 'Nacionalidade', type: 'nationality', value: 'brasil', color: '#10b981', shortCode: 'BRA' },
  { id: 'r_us', label: 'Estados Unidos', subLabel: 'Nacionalidade', type: 'nationality', value: 'estados unidos', color: '#3b82f6', shortCode: 'USA' },
  { id: 'r_ca', label: 'Canadá', subLabel: 'Nacionalidade', type: 'nationality', value: 'canadá', color: '#ef4444', shortCode: 'CAN' },
  { id: 'r_cl', label: 'Chile', subLabel: 'Nacionalidade', type: 'nationality', value: 'chile', color: '#0284c7', shortCode: 'CHI' },
  { id: 'r_tr', label: 'Turquia', subLabel: 'Nacionalidade', type: 'nationality', value: 'turquia', color: '#e11d48', shortCode: 'TUR' },
  { id: 'r_ru', label: 'Rússia', subLabel: 'Nacionalidade', type: 'nationality', value: 'rússia', color: '#3b82f6', shortCode: 'RUS' },
  { id: 'r_fi', label: 'Finlândia', subLabel: 'Nacionalidade', type: 'nationality', value: 'finlândia', color: '#0284c7', shortCode: 'FIN' },
  { id: 'r_kr', label: 'Coreia do Sul', subLabel: 'Nacionalidade', type: 'nationality', value: 'coreia do sul', color: '#3b82f6', shortCode: 'KOR' },
  { id: 'r_cn', label: 'China', subLabel: 'Nacionalidade', type: 'nationality', value: 'china', color: '#de2910', shortCode: 'CHN' },

  // Single Teams (Transfer Windows)
  ...INFINITE_COL_CRITERIA.map(c => ({
    ...c,
    id: c.id.replace(/^c_/, 'r_'),
    subLabel: `Jogou na ${c.label}`,
  })),
];

/**
 * Verifies that a 3x3 grid has 9 DISTINCT players (by IGN) that can solve all 9 cells simultaneously.
 */
export function isGridSolvable(
  rows: [GridCriterion, GridCriterion, GridCriterion],
  cols: [GridCriterion, GridCriterion, GridCriterion]
): boolean {
  const candidatesPerCell: string[][] = [];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const uniqueIgns = Array.from(
        new Set(
          GRID_PLAYERS_DATABASE.filter(
            p => playerMatchesCriterion(p, rows[r]) && playerMatchesCriterion(p, cols[c])
          ).map(p => p.ign.toLowerCase())
        )
      );
      if (uniqueIgns.length === 0) return false;
      candidatesPerCell.push(uniqueIgns);
    }
  }

  const cellOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(
    (a, b) => candidatesPerCell[a].length - candidatesPerCell[b].length
  );

  const usedIgns = new Set<string>();

  function backtrack(idx: number): boolean {
    if (idx === 9) return true;
    const cellIdx = cellOrder[idx];
    for (const ign of candidatesPerCell[cellIdx]) {
      if (!usedIgns.has(ign)) {
        usedIgns.add(ign);
        if (backtrack(idx + 1)) return true;
        usedIgns.delete(ign);
      }
    }
    return false;
  }

  return backtrack(0);
}

function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(array: T[], rng: () => number = Math.random): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPreviousDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, (d || 1) - 1);
  return getLocalDateKey(dt);
}

export function formatDateKeyPtBr(dateKey: string): string {
  const [y, m, d] = dateKey.split('-');
  if (!y || !m || !d) return dateKey;
  return `${d}/${m}/${y}`;
}

export function getDailyGridNumber(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  const anchor = Date.UTC(2026, 10, 1); // 2026-11-01
  const target = Date.UTC(y || 2026, (m || 1) - 1, d || 1);
  const diffDays = Math.floor((target - anchor) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

let cachedCritSets: Map<string, Set<string>> | null = null;

function getCriteriaPlayerSets(): Map<string, Set<string>> {
  if (cachedCritSets) return cachedCritSets;
  const dedupPlayers = Array.from(
    new Map(GRID_PLAYERS_DATABASE.map(p => [p.ign.toLowerCase(), p])).values()
  );
  const map = new Map<string, Set<string>>();
  for (const cr of [...INFINITE_COL_CRITERIA, ...INFINITE_ROW_CRITERIA]) {
    const set = new Set<string>();
    for (const p of dedupPlayers) {
      if (playerMatchesCriterion(p, cr)) {
        set.add(p.ign.toLowerCase());
      }
    }
    map.set(cr.id, set);
  }
  cachedCritSets = map;
  return map;
}

function hasIntersection(a: Set<string>, b: Set<string>): boolean {
  for (const val of a) {
    if (b.has(val)) return true;
  }
  return false;
}

function solveWithCachedSets(
  rowIds: [string, string, string],
  colIds: [string, string, string],
  critSets: Map<string, Set<string>>
): number[] | null {
  const candidatesPerCell: string[][] = [];
  for (const rId of rowIds) {
    const rSet = critSets.get(rId);
    if (!rSet) return null;
    for (const cId of colIds) {
      const cSet = critSets.get(cId);
      if (!cSet) return null;
      const inter: string[] = [];
      for (const ign of rSet) {
        if (cSet.has(ign)) inter.push(ign);
      }
      if (inter.length === 0) return null;
      candidatesPerCell.push(inter);
    }
  }

  const order = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(
    (a, b) => candidatesPerCell[a].length - candidatesPerCell[b].length
  );
  const used = new Set<string>();

  function bt(idx: number): boolean {
    if (idx === 9) return true;
    for (const ign of candidatesPerCell[order[idx]]) {
      if (!used.has(ign)) {
        used.add(ign);
        if (bt(idx + 1)) return true;
        used.delete(ign);
      }
    }
    return false;
  }

  return bt(0) ? candidatesPerCell.map(c => c.length) : null;
}

/**
 * Deterministically generates a verified solvable 3x3 Daily Grid Puzzle using ONLY Teams & Nationalities
 */
export function generateDailyGridPuzzle(dateKey: string = getLocalDateKey()): GridPuzzle {
  const dailyNumber = getDailyGridNumber(dateKey);
  const rng = mulberry32(hashString(`vct-daily-grid-${dateKey}`));
  const critSets = getCriteriaPlayerSets();

  // Pre-filter columns that actually have compatible partners
  const activeCols = INFINITE_COL_CRITERIA.filter(c => (critSets.get(c.id)?.size ?? 0) > 0);
  const maxAttempts = 250;

  let bestCandidate: {
    rows: [GridCriterion, GridCriterion, GridCriterion];
    cols: [GridCriterion, GridCriterion, GridCriterion];
    score: number;
  } | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const col0 = activeCols[Math.floor(rng() * activeCols.length)];
    const col0Partners = INFINITE_ROW_CRITERIA.filter(
      r =>
        !(r.type === 'team' && r.value.toLowerCase() === col0.value.toLowerCase()) &&
        hasIntersection(critSets.get(r.id)!, critSets.get(col0.id)!)
    );
    if (col0Partners.length < 3) continue;

    // Restrict remaining columns to ones that also overlap with at least 3 of col0's row partners
    const eligibleCols = activeCols.filter(c => {
      if (c.id === col0.id) return false;
      const cSet = critSets.get(c.id)!;
      let sharedRows = 0;
      for (const r of col0Partners) {
        if (r.type === 'team' && r.value.toLowerCase() === c.value.toLowerCase()) continue;
        if (hasIntersection(critSets.get(r.id)!, cSet)) sharedRows++;
        if (sharedRows >= 3) return true;
      }
      return false;
    });
    if (eligibleCols.length < 2) continue;

    const shuffledEligible = shuffle(eligibleCols, rng);
    const chosenCols: [GridCriterion, GridCriterion, GridCriterion] = [
      col0,
      shuffledEligible[0],
      shuffledEligible[1],
    ];
    const colTeams = new Set(chosenCols.map(c => c.value.toLowerCase()));

    const compatibleRows = shuffle(
      col0Partners.filter(r => {
        if (r.type === 'team' && colTeams.has(r.value.toLowerCase())) return false;
        const rSet = critSets.get(r.id)!;
        return hasIntersection(rSet, critSets.get(chosenCols[1].id)!) &&
          hasIntersection(rSet, critSets.get(chosenCols[2].id)!);
      }),
      rng
    );

    if (compatibleRows.length < 3) continue;

    for (let i = 0; i < compatibleRows.length - 2; i++) {
      for (let j = i + 1; j < compatibleRows.length - 1; j++) {
        for (let k = j + 1; k < compatibleRows.length; k++) {
          const chosenRows: [GridCriterion, GridCriterion, GridCriterion] = [
            compatibleRows[i],
            compatibleRows[j],
            compatibleRows[k],
          ];
          const counts = solveWithCachedSets(
            [chosenRows[0].id, chosenRows[1].id, chosenRows[2].id],
            [chosenCols[0].id, chosenCols[1].id, chosenCols[2].id],
            critSets
          );
          if (counts) {
            const minCount = Math.min(...counts);
            const totalCount = counts.reduce((s, n) => s + n, 0);
            const boardScore = minCount * 100 + totalCount;
            if (!bestCandidate || boardScore > bestCandidate.score) {
              bestCandidate = { rows: chosenRows, cols: chosenCols, score: boardScore };
            }
            // Fast-exit as soon as we find a generous board (every cell has >= 2 valid picks)
            if (minCount >= 2) {
              return {
                id: `daily-grid-${dateKey}`,
                number: dailyNumber,
                title: `Grid Diário #${dailyNumber}`,
                description: `Desafio de ${formatDateKeyPtBr(dateKey)} — cruze times e nacionalidades do VCT (2021–2026).`,
                cols: chosenCols,
                rows: chosenRows,
              };
            }
          }
        }
      }
    }

    if (bestCandidate && attempt >= 45) break;
  }

  if (bestCandidate) {
    return {
      id: `daily-grid-${dateKey}`,
      number: dailyNumber,
      title: `Grid Diário #${dailyNumber}`,
      description: `Desafio de ${formatDateKeyPtBr(dateKey)} — cruze times e nacionalidades do VCT (2021–2026).`,
      cols: bestCandidate.cols,
      rows: bestCandidate.rows,
    };
  }

  const fallback = GRID_PUZZLES[hashString(dateKey) % GRID_PUZZLES.length];
  return {
    ...fallback,
    id: `daily-grid-${dateKey}`,
    number: dailyNumber,
    title: `Grid Diário #${dailyNumber}`,
    description: `Desafio de ${formatDateKeyPtBr(dateKey)} — ${fallback.description}`,
  };
}

/**
 * Dynamically generates a 100% verified solvable 3x3 Grid Puzzle using ONLY Single Teams & Single Nationalities
 */
export function generateInfiniteGridPuzzle(roundNumber: number): GridPuzzle {
  return generateDailyGridPuzzle(`practice-${Date.now()}-${roundNumber}`);
}
