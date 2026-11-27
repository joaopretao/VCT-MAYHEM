import {
  Difficulty,
  Lineup,
  MayhemBonus,
  Player,
  Role,
  SeriesTacticBuff,
  TacticalStance,
  Team,
  TournamentStage,
} from '../src/types';
import { TEAMS_DATABASE } from '../src/data/teamsAndPlayers';
import { assignTraitsToTeam } from '../src/data/traits';
import { rollMayhemBonusChoices } from '../src/data/mayhemBonuses';
import { rollOpponentBans, isPlayerBanned } from '../src/utils/bans';
import { generateTournamentSeries, simulateSingleMap } from '../src/utils/simulation';
import { generateOpponentScoutReport } from '../src/utils/scouting';
import {
  MAX_RUN_BONUSES,
  PLAYER_SWAP_COST,
  SHOP_BONUS_COST,
  generateIntermissionShopOffer,
  getSeriesCreditsReward,
  getStartingCredits,
} from '../src/utils/shop';

const RUNS = 2000;
const STAGES: TournamentStage[] = ['group', 'quarters', 'semis', 'finals'];

function drawThreeTeams(excludeIds: string[]): Team[] {
  const available = TEAMS_DATABASE.filter(t => !excludeIds.includes(t.id));
  const pool = available.length >= 3 ? available : TEAMS_DATABASE;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(t => assignTraitsToTeam(t));
}

function findAvailableRole(lineup: Lineup, player: Player, banned: Player[]): Role | null {
  if (isPlayerBanned(player, banned)) return null;
  if (Object.values(lineup).some(p => p?.id === player.id)) return null;
  if (!lineup[player.primaryRole]) return player.primaryRole;
  for (const sec of player.secondaryRoles) {
    if (!lineup[sec]) return sec;
  }
  if (!lineup.Flex) return 'Flex';
  return null;
}

function simulateDraftForDifficulty(difficulty: Difficulty): {
  lineup: Lineup;
  bonuses: MayhemBonus[];
  banned: Player[];
} {
  const lineup: Lineup = {
    Duelist: null,
    Controller: null,
    Initiator: null,
    Sentinel: null,
    Flex: null,
  };
  let rerollsLeft = difficulty === 'normal' ? 3 : difficulty === 'hard' ? 2 : 1;
  const banned = rollOpponentBans(difficulty);
  let availableTeams = drawThreeTeams([]);
  const bonuses: MayhemBonus[] = [];

  for (let pick = 1; pick <= 5; pick++) {
    const pickedTeams = new Set(
      Object.values(lineup)
        .filter((p): p is Player => p !== null)
        .map(p => p.team)
    );

    const findBest = () => {
      let best: { player: Player; role: Role; score: number } | null = null;
      for (const t of availableTeams) {
        for (const p of t.roster) {
          const role = findAvailableRole(lineup, p, banned);
          if (!role) continue;
          let score = p.rating + (role === p.primaryRole ? 2 : 0) + (pickedTeams.has(p.team) ? 2.5 : 0);
          if (p.isChampionsWinner) score += 1;
          if (!best || score > best.score) best = { player: p, role, score };
        }
      }
      return best;
    };

    let best = findBest();
    while (best && best.score < 90 && rerollsLeft > 0) {
      rerollsLeft--;
      availableTeams = drawThreeTeams(availableTeams.map(t => t.id));
      best = findBest();
    }

    if (best) {
      lineup[best.role] = best.player;
    } else {
      const open = (Object.keys(lineup) as Role[]).filter(r => !lineup[r]);
      const fallback = availableTeams[0].roster.find(p => !isPlayerBanned(p, banned));
      if (open[0] && fallback) lineup[open[0]] = fallback;
    }

    if (pick === 2 || pick === 4) {
      const offer = rollMayhemBonusChoices(bonuses.map(b => b.id), 3);
      if (offer.length > 0) {
        const chosen = offer[Math.floor(Math.random() * offer.length)];
        bonuses.push(chosen);
        if (chosen.modifiers.extraRerolls) rerollsLeft += chosen.modifiers.extraRerolls;
        if (chosen.modifiers.zeroRerolls) rerollsLeft = 0;
      }
    }

    availableTeams = drawThreeTeams(availableTeams.map(t => t.id));
  }

  return { lineup, bonuses, banned };
}

function simulateFullTacticalRun(
  difficulty: Difficulty,
  useShopAndScout: boolean
): boolean {
  const { lineup, bonuses, banned } = simulateDraftForDifficulty(difficulty);
  let activeLineup: Lineup = { ...lineup };
  const activeBonuses: MayhemBonus[] = [...bonuses];
  const usedOpponents: string[] = [];
  let credits = useShopAndScout ? getStartingCredits(difficulty) : 0;
  let activeSeriesBuff: SeriesTacticBuff = 'none';
  let secondChanceUsed = false;

  for (let stageIdx = 0; stageIdx < STAGES.length; stageIdx++) {
    const stage = STAGES[stageIdx];
    const series = generateTournamentSeries(stage, difficulty, usedOpponents);
    if (series.opponent.id) usedOpponents.push(series.opponent.id);

    const report = generateOpponentScoutReport(series.opponent, difficulty);
    const stances: TacticalStance[] = ['aggressive', 'balanced', 'disciplined'];
    let inferredStance: TacticalStance = stances[Math.floor(Math.random() * stances.length)];
    if (useShopAndScout && report.visibility === 'full') {
      if (report.strengthText.includes('retake e clutch')) {
        inferredStance = 'aggressive';
      } else if (report.strengthText.includes('Macro disciplinado')) {
        inferredStance = 'balanced';
      } else {
        inferredStance = 'disciplined';
      }
    }
    const stance: TacticalStance = inferredStance;

    const targetWins = Math.ceil(series.bestOf / 2);
    let pWins = 0;
    let oWins = 0;
    let lostPrev = false;
    const usedMaps: string[] = [];
    let mapIdx = 0;

    while (pWins < targetWins && oWins < targetWins) {
      const map = simulateSingleMap(activeLineup, series.opponent.rating, mapIdx, usedMaps, {
        bonuses: activeBonuses,
        lostPreviousMap: lostPrev,
        difficulty,
        stance: useShopAndScout ? stance : undefined,
        seriesBuff: activeSeriesBuff,
      });
      usedMaps.push(map.mapName);

      if (map.playerWon) {
        pWins++;
        lostPrev = false;
        mapIdx++;
      } else {
        const wouldLose = oWins + 1 >= targetWins;
        const hasSecondChance = activeBonuses.some(b => b.modifiers.onceSecondChance);
        if (wouldLose && hasSecondChance && !secondChanceUsed) {
          secondChanceUsed = true;
          lostPrev = true;
          continue;
        }
        oWins++;
        lostPrev = true;
        mapIdx++;
      }
    }

    if (pWins < targetWins) return false;

    activeSeriesBuff = 'none';
    if (useShopAndScout && stageIdx < STAGES.length - 1) {
      credits += getSeriesCreditsReward(pWins, oWins);
      const offer = generateIntermissionShopOffer(activeLineup, activeBonuses, banned);

      if (offer.bonusOffer && activeBonuses.length < MAX_RUN_BONUSES && credits >= SHOP_BONUS_COST) {
        activeBonuses.push(offer.bonusOffer);
        credits -= SHOP_BONUS_COST;
      }
      if (offer.swapCandidates.length > 0 && credits >= PLAYER_SWAP_COST) {
        const better = offer.swapCandidates.find(c => {
          const cur = activeLineup[c.targetRole];
          return cur && c.player.rating > cur.rating + 2;
        });
        if (better) {
          activeLineup = { ...activeLineup, [better.targetRole]: better.player };
          credits -= PLAYER_SWAP_COST;
        }
      }
      if (offer.tacticOptions.length > 0 && credits >= offer.tacticOptions[0].cost) {
        activeSeriesBuff = offer.tacticOptions[0].id;
        credits -= offer.tacticOptions[0].cost;
      }
    }
  }

  return true;
}

function measure(label: string, fn: () => boolean): number {
  let wins = 0;
  for (let i = 0; i < RUNS; i++) {
    if (fn()) wins++;
  }
  const pct = (wins / RUNS) * 100;
  console.log(`${label.padEnd(42)}: ${pct.toFixed(2)}% (${wins}/${RUNS})`);
  return pct;
}

console.log(`\n=== SIMULACAO FASE 3 (${RUNS} runs por cenario) ===`);
const normNoShop = measure('Normal (só 2 bônus, sem loja/scout)', () =>
  simulateFullTacticalRun('normal', false)
);
const normWithShop = measure('Normal (2 bônus + Scout + Loja)', () =>
  simulateFullTacticalRun('normal', true)
);
const hardWithShop = measure('Difícil (Scout parcial + Loja)', () =>
  simulateFullTacticalRun('hard', true)
);
const masterWithShop = measure('Master (Scout cego + Loja + Pressão)', () =>
  simulateFullTacticalRun('master', true)
);
console.log(
  `\nDelta Tática/Loja no Normal: +${(normWithShop - normNoShop).toFixed(2)} p.p.`
);
console.log(
  `Escalada Difícil vs Normal: ${(hardWithShop - normWithShop).toFixed(2)} p.p. | Master vs Difícil: ${(masterWithShop - hardWithShop).toFixed(2)} p.p.\n`
);
