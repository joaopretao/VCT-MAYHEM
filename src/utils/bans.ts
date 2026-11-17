import { Player, Difficulty, RunRuleId } from '../types';
import { PLAYERS_DATABASE } from '../data/teamsAndPlayers';
import { createSeededRng, seededShuffle } from './seed';
import { isPlayerEligibleForRule } from './runRules';

/**
 * Rolls random opponent bans based on difficulty (deterministically when seed is passed):
 * - Normal mode: 0 bans
 * - Hard mode: 3 players randomly banned
 * - Master mode: 6 players randomly banned
 * Safeguards tight rule pools (e.g., only_br) so every role always has draftable players.
 */
export function rollOpponentBans(
  difficulty: Difficulty,
  seed?: string,
  rule: RunRuleId = 'standard'
): Player[] {
  if (difficulty === 'normal') {
    return [];
  }

  let banCount = difficulty === 'hard' ? 3 : difficulty === 'master' ? 6 : 0;
  if (banCount <= 0) return [];

  if (rule === 'only_br') {
    banCount = difficulty === 'hard' ? 1 : 2;
  } else if (rule === 'only_2022' || rule === 'only_champions') {
    banCount = Math.min(banCount, difficulty === 'hard' ? 2 : 3);
  }

  const uniquePlayersMap = new Map<string, Player>();
  for (const player of PLAYERS_DATABASE) {
    if (!isPlayerEligibleForRule(player, rule)) continue;
    const key = player.ign.toLowerCase();
    if (!uniquePlayersMap.has(key)) {
      uniquePlayersMap.set(key, player);
    }
  }

  const uniquePlayers = Array.from(uniquePlayersMap.values());
  const roleTotals = uniquePlayers.reduce<Record<string, number>>((acc, p) => {
    acc[p.primaryRole] = (acc[p.primaryRole] || 0) + 1;
    return acc;
  }, {});

  const shuffled = seed
    ? seededShuffle(uniquePlayers, createSeededRng(`${seed}-bans-${difficulty}-${rule}`))
    : [...uniquePlayers].sort(() => 0.5 - Math.random());

  const chosenBans: Player[] = [];
  const remainingByRole = { ...roleTotals };

  for (const candidate of shuffled) {
    if (chosenBans.length >= banCount) break;
    // Keep at least 3 distinct athletes available per primary role so drafts never deadlock
    if ((remainingByRole[candidate.primaryRole] || 0) <= 3) {
      continue;
    }
    remainingByRole[candidate.primaryRole] = (remainingByRole[candidate.primaryRole] || 0) - 1;
    chosenBans.push(candidate);
  }

  return chosenBans;
}

/**
 * Checks if a specific player matches any of the opponent bans (by id or IGN).
 */
export function isPlayerBanned(player: Player, bannedPlayers: Player[]): boolean {
  if (!bannedPlayers || bannedPlayers.length === 0) return false;
  return bannedPlayers.some(
    b => b.id === player.id || b.ign.toLowerCase() === player.ign.toLowerCase()
  );
}
