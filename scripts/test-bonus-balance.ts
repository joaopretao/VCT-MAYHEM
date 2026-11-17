import { Lineup, MayhemBonus, Player, Role, Team, TournamentStage } from '../src/types';
import { TEAMS_DATABASE } from '../src/data/teamsAndPlayers';
import { assignTraitsToTeam } from '../src/data/traits';
import { MAYHEM_BONUSES, rollMayhemBonusChoices } from '../src/data/mayhemBonuses';
import { generateTournamentSeries, simulateSingleMap } from '../src/utils/simulation';

const RUNS = 2000;
const STAGES: TournamentStage[] = ['group', 'quarters', 'semis', 'finals'];

function drawThreeTeams(excludeIds: string[]): Team[] {
  const available = TEAMS_DATABASE.filter(t => !excludeIds.includes(t.id));
  const pool = available.length >= 3 ? available : TEAMS_DATABASE;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(t => assignTraitsToTeam(t));
}

function findAvailableRole(lineup: Lineup, player: Player): Role | null {
  if (Object.values(lineup).some(p => p?.id === player.id)) return null;
  if (!lineup[player.primaryRole]) return player.primaryRole;
  for (const sec of player.secondaryRoles) {
    if (!lineup[sec]) return sec;
  }
  if (!lineup.Flex) return 'Flex';
  return null;
}

function pickBestCandidate(lineup: Lineup, teams: Team[], preferredTeams: Set<string>): {
  player: Player;
  role: Role;
  score: number;
} | null {
  let best: { player: Player; role: Role; score: number } | null = null;

  for (const team of teams) {
    for (const player of team.roster) {
      const role = findAvailableRole(lineup, player);
      if (!role) continue;
      let score = player.rating;
      if (role === player.primaryRole) score += 2;
      if (preferredTeams.has(player.team)) score += 2.5;
      if (player.isChampionsWinner) score += 1;
      if (player.trait?.type === 'positive') score += 1.5;
      if (player.trait?.type === 'negative') score -= 2;
      if (!best || score > best.score) {
        best = { player, role, score };
      }
    }
  }
  return best;
}

type DraftBonusMode =
  | { kind: 'none' }
  | { kind: 'randomTwo' }
  | { kind: 'single'; bonus: MayhemBonus };

function simulateDraft(mode: DraftBonusMode): { lineup: Lineup; bonuses: MayhemBonus[] } {
  const lineup: Lineup = {
    Duelist: null,
    Controller: null,
    Initiator: null,
    Sentinel: null,
    Flex: null,
  };

  let rerollsLeft = 3; // Normal difficulty starts with 3 rerolls
  let availableTeams = drawThreeTeams([]);
  const activeBonuses: MayhemBonus[] = [];

  for (let pick = 1; pick <= 5; pick++) {
    const pickedTeams = new Set(
      Object.values(lineup)
        .filter((p): p is Player => p !== null)
        .map(p => p.team)
    );

    let best = pickBestCandidate(lineup, availableTeams, pickedTeams);

    // Human-like greedy reroll when batch top pick is mediocre and rerolls remain
    while (best && best.score < 90 && rerollsLeft > 0) {
      rerollsLeft -= 1;
      const exclude = availableTeams.map(t => t.id);
      availableTeams = drawThreeTeams(exclude);
      best = pickBestCandidate(lineup, availableTeams, pickedTeams);
    }

    if (!best) {
      // Emergency fill with any unpicked open slot if all candidates collided
      const openRoles = (Object.keys(lineup) as Role[]).filter(r => !lineup[r]);
      const fallbackTeam = availableTeams[0];
      const fallbackPlayer = fallbackTeam.roster.find(
        p => !Object.values(lineup).some(d => d?.id === p.id)
      );
      if (fallbackPlayer && openRoles[0]) {
        lineup[openRoles[0]] = fallbackPlayer;
      }
    } else {
      lineup[best.role] = best.player;
    }

    // Apply Roguelike bonus picks after Pick 2 and Pick 4 (or single-bonus test at Pick 2)
    if (mode.kind === 'randomTwo' && (pick === 2 || pick === 4)) {
      const offer = rollMayhemBonusChoices(activeBonuses.map(b => b.id), 3);
      if (offer.length > 0) {
        const chosen = offer[Math.floor(Math.random() * offer.length)];
        activeBonuses.push(chosen);
        if (chosen.modifiers.extraRerolls) rerollsLeft += chosen.modifiers.extraRerolls;
        if (chosen.modifiers.zeroRerolls) rerollsLeft = 0;
      }
    } else if (mode.kind === 'single' && pick === 2) {
      const chosen = mode.bonus;
      activeBonuses.push(chosen);
      if (chosen.modifiers.extraRerolls) rerollsLeft += chosen.modifiers.extraRerolls;
      if (chosen.modifiers.zeroRerolls) rerollsLeft = 0;
    }

    availableTeams = drawThreeTeams(availableTeams.map(t => t.id));
  }

  return { lineup, bonuses: activeBonuses };
}

function simulateTournament(lineup: Lineup, bonuses: MayhemBonus[]): boolean {
  const usedOpponents: string[] = [];
  let secondChanceUsed = false;
  const hasSecondChance = bonuses.some(b => b.modifiers.onceSecondChance);

  for (const stage of STAGES) {
    const series = generateTournamentSeries(stage, 'normal', usedOpponents);
    if (series.opponent.id) usedOpponents.push(series.opponent.id);

    const targetWins = Math.ceil(series.bestOf / 2);
    let playerWins = 0;
    let opponentWins = 0;
    let lostPreviousMap = false;
    const usedMaps: string[] = [];
    let mapIdx = 0;

    while (playerWins < targetWins && opponentWins < targetWins) {
      const map = simulateSingleMap(lineup, series.opponent.rating, mapIdx, usedMaps, {
        bonuses,
        lostPreviousMap,
      });
      usedMaps.push(map.mapName);

      if (map.playerWon) {
        playerWins += 1;
        lostPreviousMap = false;
        mapIdx += 1;
      } else {
        const wouldLoseSeries = opponentWins + 1 >= targetWins;
        if (wouldLoseSeries && hasSecondChance && !secondChanceUsed) {
          secondChanceUsed = true;
          lostPreviousMap = true;
          // Replay deciding map without incrementing opponentWins
          continue;
        }
        opponentWins += 1;
        lostPreviousMap = true;
        mapIdx += 1;
      }
    }

    if (playerWins < targetWins) {
      return false;
    }
  }

  return true;
}

function evaluateMode(mode: DraftBonusMode, runs: number): number {
  let wins = 0;
  for (let i = 0; i < runs; i++) {
    const { lineup, bonuses } = simulateDraft(mode);
    if (simulateTournament(lineup, bonuses)) {
      wins += 1;
    }
  }
  return (wins / runs) * 100;
}

function main() {
  const noBonusRate = evaluateMode({ kind: 'none' }, RUNS);
  const randomTwoRate = evaluateMode({ kind: 'randomTwo' }, RUNS);
  const randomDiff = randomTwoRate - noBonusRate;

  console.log(`\n=== SIMULACAO MAYHEM (${RUNS} runs por cenario | Dificuldade Normal) ===`);
  console.log(`Sem bonus           : ${noBonusRate.toFixed(2)}%`);
  console.log(
    `2 bonus aleatorios  : ${randomTwoRate.toFixed(2)}% (${randomDiff >= 0 ? '+' : ''}${randomDiff.toFixed(2)} p.p.)`
  );
  console.log(
    `Meta combinada (+5 a +15 p.p.): ${
      randomDiff >= 5 && randomDiff <= 15 ? 'OK' : 'FORA DA META'
    }\n`
  );

  console.log('Bonus'.padEnd(24) + 'Raridade'.padEnd(10) + 'Taxa'.padEnd(9) + 'Delta'.padEnd(11) + 'Status (<= +6.00 p.p.)');
  console.log('-'.repeat(76));

  let maxIndividualDiff = -Infinity;
  for (const bonus of MAYHEM_BONUSES) {
    const rate = evaluateMode({ kind: 'single', bonus }, RUNS);
    const diff = rate - noBonusRate;
    if (diff > maxIndividualDiff) maxIndividualDiff = diff;
    const status = diff <= 6.0 ? 'OK' : 'PASSOU';
    console.log(
      bonus.name.padEnd(24) +
        bonus.rarity.padEnd(10) +
        `${rate.toFixed(2)}%`.padEnd(9) +
        `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} p.p.`.padEnd(11) +
        status
    );
  }
  console.log('-'.repeat(76));
  console.log(`Maior ganho individual: ${maxIndividualDiff >= 0 ? '+' : ''}${maxIndividualDiff.toFixed(2)} p.p.\n`);
}

main();
