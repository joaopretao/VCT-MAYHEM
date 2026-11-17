import { CampaignHistory, PlayerRecords } from '../types';
import { getMayhemBonusById } from '../data/mayhemBonuses';

export const RECORDS_STORAGE_KEY = 'vct_mayhem_records';

export const EMPTY_PLAYER_RECORDS: PlayerRecords = {
  runsPlayed: 0,
  titles: 0,
  currentStreak: 0,
  bestStreak: 0,
  bestOverallRating: 0,
  bonusPickCounts: {},
};

function sanitizeRecords(raw: unknown): PlayerRecords {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_PLAYER_RECORDS };
  const obj = raw as Partial<PlayerRecords>;
  const counts: Record<string, number> = {};
  if (obj.bonusPickCounts && typeof obj.bonusPickCounts === 'object') {
    Object.entries(obj.bonusPickCounts).forEach(([k, v]) => {
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
        counts[k] = v;
      }
    });
  }
  return {
    runsPlayed: typeof obj.runsPlayed === 'number' && obj.runsPlayed >= 0 ? obj.runsPlayed : 0,
    titles: typeof obj.titles === 'number' && obj.titles >= 0 ? obj.titles : 0,
    currentStreak: typeof obj.currentStreak === 'number' && obj.currentStreak >= 0 ? obj.currentStreak : 0,
    bestStreak: typeof obj.bestStreak === 'number' && obj.bestStreak >= 0 ? obj.bestStreak : 0,
    bestOverallRating:
      typeof obj.bestOverallRating === 'number' && obj.bestOverallRating >= 0
        ? obj.bestOverallRating
        : 0,
    bonusPickCounts: counts,
  };
}

/**
 * Rebuilds PlayerRecords from an array of campaigns (oldest-to-newest).
 */
export function buildRecordsFromCampaigns(campaigns: CampaignHistory[]): PlayerRecords {
  let records: PlayerRecords = { ...EMPTY_PLAYER_RECORDS, bonusPickCounts: {} };
  // Campaign array stores newest-first in App.tsx, so iterate in reverse chronological order
  const chronological = [...campaigns].reverse();

  for (const camp of chronological) {
    records = applyCampaignToRecords(records, camp);
  }
  return records;
}

export function applyCampaignToRecords(prev: PlayerRecords, record: CampaignHistory): PlayerRecords {
  const nextCounts = { ...prev.bonusPickCounts };
  if (Array.isArray(record.bonuses)) {
    for (const b of record.bonuses) {
      if (b?.id) {
        nextCounts[b.id] = (nextCounts[b.id] || 0) + 1;
      }
    }
  }

  const nextStreak = record.wonChampionship ? prev.currentStreak + 1 : 0;
  return {
    runsPlayed: prev.runsPlayed + 1,
    titles: prev.titles + (record.wonChampionship ? 1 : 0),
    currentStreak: nextStreak,
    bestStreak: Math.max(prev.bestStreak, nextStreak),
    bestOverallRating: Math.max(prev.bestOverallRating, record.overallRating || 0),
    bonusPickCounts: nextCounts,
  };
}

export function loadPlayerRecords(legacyCampaigns: CampaignHistory[] = []): PlayerRecords {
  try {
    const saved = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (saved) {
      const parsed = sanitizeRecords(JSON.parse(saved));
      // Keep records synchronized if campaigns exist from before records key existed
      if (parsed.runsPlayed === 0 && legacyCampaigns.length > 0) {
        const rebuilt = buildRecordsFromCampaigns(legacyCampaigns);
        savePlayerRecords(rebuilt);
        return rebuilt;
      }
      return parsed;
    }

    if (legacyCampaigns.length > 0) {
      const rebuilt = buildRecordsFromCampaigns(legacyCampaigns);
      savePlayerRecords(rebuilt);
      return rebuilt;
    }
  } catch (e) {
    console.error('Failed to load player records', e);
  }
  return { ...EMPTY_PLAYER_RECORDS, bonusPickCounts: {} };
}

export function savePlayerRecords(records: PlayerRecords): void {
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save player records', e);
  }
}

export function recordCampaignAndSave(
  prev: PlayerRecords,
  campaign: CampaignHistory
): PlayerRecords {
  const updated = applyCampaignToRecords(prev, campaign);
  savePlayerRecords(updated);
  return updated;
}

export function clearPlayerRecords(): PlayerRecords {
  try {
    localStorage.removeItem(RECORDS_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear player records', e);
  }
  return { ...EMPTY_PLAYER_RECORDS, bonusPickCounts: {} };
}

export function getMostUsedBonus(
  records: PlayerRecords
): { id: string; name: string; count: number } | null {
  const entries = Object.entries(records.bonusPickCounts);
  if (entries.length === 0) return null;

  let bestId = '';
  let bestCount = 0;
  for (const [id, count] of entries) {
    if (count > bestCount) {
      bestId = id;
      bestCount = count;
    }
  }
  if (!bestId || bestCount <= 0) return null;

  const bonus = getMayhemBonusById(bestId);
  return {
    id: bestId,
    name: bonus ? bonus.name : bestId,
    count: bestCount,
  };
}
