import { Lineup, Player, Role, RunRuleId, Team } from '../types';
import { TEAMS_DATABASE } from '../data/teamsAndPlayers';
import { assignTraitsToTeam } from '../data/traits';
import { isPlayerBanned } from './bans';
import { createSeededRng, seededShuffle } from './seed';

export interface RunRuleMeta {
  id: RunRuleId;
  label: string;
  shortTag: string;
  description: string;
  accentColor: string;
}

export const RUN_RULES: RunRuleMeta[] = [
  {
    id: 'standard',
    label: 'Clássico',
    shortTag: 'Padrão',
    description: 'Pool completo VCT 2022–2026 com rerolls padrão da dificuldade.',
    accentColor: '#ffffff',
  },
  {
    id: 'only_br',
    label: 'Só BR',
    shortTag: 'Brasileiros',
    description: 'Apenas jogadores brasileiros podem ser escolhidos no draft e na loja.',
    accentColor: '#10b981',
  },
  {
    id: 'no_reroll',
    label: 'Sem Reroll',
    shortTag: '0 Rerolls',
    description: 'Zero rerolls do início ao fim. Adapte-se às 3 equipes da rodada.',
    accentColor: '#e2b714',
  },
  {
    id: 'only_2022',
    label: 'Só 2022',
    shortTag: 'Champions 22',
    description: 'Apenas elencos da edição histórica do Champions 2022.',
    accentColor: '#38bdf8',
  },
  {
    id: 'only_champions',
    label: 'Só Campeões',
    shortTag: 'Campeões',
    description: 'Apenas atletas que já levantaram a taça do VALORANT Champions.',
    accentColor: '#ff4655',
  },
];

export function getRunRuleMeta(rule: RunRuleId = 'standard'): RunRuleMeta {
  return RUN_RULES.find(r => r.id === rule) || RUN_RULES[0];
}

export function isPlayerEligibleForRule(player: Player, rule: RunRuleId = 'standard'): boolean {
  switch (rule) {
    case 'only_br':
      return player.countryCode.toUpperCase() === 'BR';
    case 'only_2022':
      return player.year === 2022;
    case 'only_champions':
      return Boolean(player.isChampionsWinner);
    case 'no_reroll':
    case 'standard':
    default:
      return true;
  }
}

export function isTeamEligibleForRule(team: Team, rule: RunRuleId = 'standard'): boolean {
  if (rule === 'only_2022') return team.year === 2022;
  if (rule === 'only_br' || rule === 'only_champions') {
    return team.roster.some(p => isPlayerEligibleForRule(p, rule));
  }
  return true;
}

export function isSamePlayer(a: Player, b: Player): boolean {
  if (a.id === b.id) return true;
  if (a.ign.trim().toLowerCase() === b.ign.trim().toLowerCase()) return true;
  const nameA = a.name?.trim().toLowerCase();
  const nameB = b.name?.trim().toLowerCase();
  return Boolean(nameA && nameB && nameA === nameB);
}

export function isPlayerInLineup(player: Player, lineup: Lineup): boolean {
  return Object.values(lineup).some(p => p !== null && isSamePlayer(p, player));
}

function canPlayerFitOpenSlot(player: Player, lineup: Lineup, banned: Player[]): boolean {
  if (isPlayerBanned(player, banned)) return false;
  if (isPlayerInLineup(player, lineup)) return false;
  if (!lineup[player.primaryRole]) return true;
  for (const sec of player.secondaryRoles) {
    if (!lineup[sec]) return true;
  }
  if (!lineup.Flex) return true;
  const primaryOccupant = lineup[player.primaryRole];
  if (primaryOccupant && primaryOccupant.secondaryRoles.some(alt => !lineup[alt])) {
    return true;
  }
  const flexOccupant = lineup.Flex;
  if (
    flexOccupant &&
    [flexOccupant.primaryRole, ...flexOccupant.secondaryRoles].some(alt => !lineup[alt])
  ) {
    return true;
  }
  return false;
}

/**
 * Draws 3 teams deterministically from a run seed + draw step while guaranteeing
 * that under strict special rules (Só BR, Só 2022, Só Campeões), at least one
 * candidate in the 3 offered teams can legally fill an open slot in `lineup`.
 */
export function drawThreeTeamsForRun(params: {
  rule: RunRuleId;
  seed: string;
  step: number;
  excludeIds: string[];
  lineup: Lineup;
  bannedPlayers: Player[];
}): Team[] {
  const { rule, seed, step, excludeIds, lineup, bannedPlayers } = params;
  const rng = createSeededRng(`${seed}-draw-${rule}-${step}`);

  const ruleTeams = TEAMS_DATABASE.filter(t => isTeamEligibleForRule(t, rule));
  const nonExcluded = ruleTeams.filter(t => !excludeIds.includes(t.id));
  const primaryPool = nonExcluded.length >= 3 ? nonExcluded : ruleTeams;

  const shuffled = seededShuffle(primaryPool, rng);
  let chosen = shuffled.slice(0, 3);

  const hasOpenSlots = (Object.keys(lineup) as Role[]).some(r => !lineup[r]);
  if (hasOpenSlots) {
    const hasPlayableCandidate = chosen.some(team =>
      team.roster.some(
        p =>
          isPlayerEligibleForRule(p, rule) &&
          canPlayerFitOpenSlot(p, lineup, bannedPlayers)
      )
    );

    if (!hasPlayableCandidate) {
      // Rescue draw: guarantee a team that holds an eligible player fitting an open role
      const rescueCandidates = seededShuffle(ruleTeams, rng).filter(team =>
        team.roster.some(
          p =>
            isPlayerEligibleForRule(p, rule) &&
            canPlayerFitOpenSlot(p, lineup, bannedPlayers)
        )
      );
      if (rescueCandidates.length > 0 && !chosen.some(c => c.id === rescueCandidates[0].id)) {
        chosen = [rescueCandidates[0], ...chosen.slice(0, 2)];
      }
    }
  }

  return chosen.map(team => assignTraitsToTeam(team));
}
