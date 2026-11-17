import {
  Difficulty,
  IntermissionShopOffer,
  IntermissionTacticOption,
  Lineup,
  MayhemBonus,
  Player,
  Role,
  RunRuleId,
} from '../types';
import { PLAYERS_DATABASE } from '../data/teamsAndPlayers';
import { rollPlayerTrait } from '../data/traits';
import { rollMayhemBonusChoices } from '../data/mayhemBonuses';
import { isPlayerBanned } from './bans';
import { isPlayerEligibleForRule, isPlayerInLineup, isSamePlayer } from './runRules';

export const PLAYER_SWAP_COST = 5;
export const SHOP_BONUS_COST = 4;
export const SHOP_REROLL_COST = 2;
export const SHOP_TACTIC_COST = 3;
export const MAX_RUN_BONUSES = 3;

export function getStartingCredits(difficulty: Difficulty): number {
  if (difficulty === 'normal') return 2;
  if (difficulty === 'hard') return 1;
  return 0;
}

export function getSeriesCreditsReward(playerWins: number, opponentWins: number): number {
  if (playerWins > opponentWins && opponentWins === 0) {
    return 6; // Clean sweep (e.g. 2-0) gives extra credits
  }
  return 4;
}

const ALL_TACTIC_OPTIONS: IntermissionTacticOption[] = [
  {
    id: 'rating_boost',
    name: 'Analista de Vídeo',
    description: '+2 de Força da equipe apenas na próxima série.',
    cost: SHOP_TACTIC_COST,
  },
  {
    id: 'pistol_prep',
    name: 'Plano de Pistol',
    description: '+5% nos pistol & forçados da próxima série.',
    cost: SHOP_TACTIC_COST,
  },
  {
    id: 'clutch_prep',
    name: 'Treino de Retake',
    description: '+5% em retakes & ponto decisivo na próxima série.',
    cost: SHOP_TACTIC_COST,
  },
];

function resolveTargetRoleForCandidate(player: Player, lineup: Lineup): Role | null {
  if (lineup[player.primaryRole]) return player.primaryRole;
  for (const sec of player.secondaryRoles) {
    if (lineup[sec]) return sec;
  }
  if (lineup.Flex) return 'Flex';
  return null;
}

export function rollTournamentShopBonus(activeBonuses: MayhemBonus[]): MayhemBonus | null {
  if (activeBonuses.length >= MAX_RUN_BONUSES) return null;
  // Exclude draft-only reroll bonuses so every shop bonus helps directly in tournament play
  const draftOnlyIds = ['reforco_reroll', 'dream_team'];
  const excludeIds = [...activeBonuses.map(b => b.id), ...draftOnlyIds];
  const rolled = rollMayhemBonusChoices(excludeIds, 1);
  return rolled[0] || null;
}

export function generateIntermissionShopOffer(
  lineup: Lineup,
  activeBonuses: MayhemBonus[],
  bannedPlayers: Player[] = [],
  rule: RunRuleId = 'standard'
): IntermissionShopOffer {
  // Build pool excluding drafted (same IGN/real name) and banned athletes
  const pool = PLAYERS_DATABASE.filter(
    p =>
      isPlayerEligibleForRule(p, rule) &&
      !isPlayerInLineup(p, lineup) &&
      !isPlayerBanned(p, bannedPlayers)
  );

  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
  const swapCandidates: { player: Player; targetRole: Role }[] = [];
  const pickedRoles = new Set<Role>();

  for (const candidate of shuffledPool) {
    if (swapCandidates.length >= 2) break;
    if (swapCandidates.some(s => isSamePlayer(s.player, candidate))) continue;
    const role = resolveTargetRoleForCandidate(candidate, lineup);
    if (!role) continue;
    // Prefer distinct target roles when available so user has real choice
    if (pickedRoles.has(role) && swapCandidates.length === 1 && Math.random() < 0.75) {
      continue;
    }
    pickedRoles.add(role);
    swapCandidates.push({
      player: candidate.trait ? candidate : { ...candidate, trait: rollPlayerTrait(candidate) },
      targetRole: role,
    });
  }

  const bonusOffer = rollTournamentShopBonus(activeBonuses);
  const shuffledTactics = [...ALL_TACTIC_OPTIONS].sort(() => Math.random() - 0.5).slice(0, 2);

  return {
    swapCandidates,
    bonusOffer,
    tacticOptions: shuffledTactics,
    swapUsed: false,
    bonusBought: false,
    tacticBought: false,
  };
}
