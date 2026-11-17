import { Difficulty, RunRuleId } from '../types';

/**
 * Deterministic 32-bit FNV-1a string hash + Mulberry32 PRNG.
 * Allows sharing exact draft seeds via URL and playing offline Daily Drafts.
 */
function hashSeedString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createSeededRng(seedString: string): () => number {
  let a = hashSeedString(seedString) || 1;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRandomSeed(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `VCT-${code}`;
}

export function getDailyDraftDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDailyDraftSeed(date: Date = new Date()): string {
  return `DIARIO-${getDailyDraftDateKey(date)}`;
}

const VALID_RULES: Set<RunRuleId> = new Set([
  'standard',
  'only_br',
  'no_reroll',
  'only_2022',
  'only_champions',
]);

const VALID_DIFFS: Set<Difficulty> = new Set(['normal', 'hard', 'master']);

export interface ParsedUrlSeed {
  seed: string;
  rule: RunRuleId;
  difficulty: Difficulty;
  isDaily: boolean;
}

export function parseRunFromUrl(): ParsedUrlSeed | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const rawSeed = params.get('seed')?.trim();
    if (!rawSeed) return null;

    const cleanSeed = rawSeed.slice(0, 28).toUpperCase();
    const rawRule = (params.get('rule') || 'standard') as RunRuleId;
    const rawDiff = (params.get('diff') || 'normal') as Difficulty;

    return {
      seed: cleanSeed,
      rule: VALID_RULES.has(rawRule) ? rawRule : 'standard',
      difficulty: VALID_DIFFS.has(rawDiff) ? rawDiff : 'normal',
      isDaily: cleanSeed === getDailyDraftSeed(),
    };
  } catch {
    return null;
  }
}

export function buildShareDraftUrl(
  seed: string,
  rule: RunRuleId,
  difficulty: Difficulty
): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.searchParams.set('seed', seed);
  if (rule !== 'standard') {
    url.searchParams.set('rule', rule);
  } else {
    url.searchParams.delete('rule');
  }
  if (difficulty !== 'normal') {
    url.searchParams.set('diff', difficulty);
  } else {
    url.searchParams.delete('diff');
  }
  return url.toString();
}

export function clearUrlSeedParams(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('seed') || url.searchParams.has('rule') || url.searchParams.has('diff')) {
      url.searchParams.delete('seed');
      url.searchParams.delete('rule');
      url.searchParams.delete('diff');
      window.history.replaceState({}, '', url.toString());
    }
  } catch {
    // ignore history errors
  }
}

const DAILY_DONE_STORAGE_KEY = 'vct_mayhem_daily_done_v1';

export function hasCompletedDailyDraft(date: Date = new Date()): boolean {
  try {
    return localStorage.getItem(DAILY_DONE_STORAGE_KEY) === getDailyDraftDateKey(date);
  } catch {
    return false;
  }
}

export function markDailyDraftCompleted(date: Date = new Date()): void {
  try {
    localStorage.setItem(DAILY_DONE_STORAGE_KEY, getDailyDraftDateKey(date));
  } catch {
    // ignore storage errors
  }
}
