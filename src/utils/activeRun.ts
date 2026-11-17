import { ActiveRunSave, Difficulty, Lineup, Player, RunRuleId, SavedTournamentState, UserTeamIdentity } from '../types';
import { DEFAULT_TEAM_IDENTITY } from '../components/TeamCrest';
import { isSamePlayer } from './runRules';

const ACTIVE_RUN_STORAGE_KEY = 'vct_mayhem_active_run_v1';

const VALID_DIFFICULTIES: Difficulty[] = ['normal', 'hard', 'master'];
const VALID_RULES: RunRuleId[] = ['standard', 'only_br', 'no_reroll', 'only_2022', 'only_champions'];
const VALID_EMBLEMS = new Set(['shield', 'flame', 'crown', 'sword', 'phoenix', 'bolt']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidLineup(value: unknown): value is Lineup {
  if (!isRecord(value)) return false;
  const roles: (keyof Lineup)[] = ['Duelist', 'Controller', 'Initiator', 'Sentinel', 'Flex'];
  return roles.every(role => role in value && (value[role] === null || isRecord(value[role])));
}

function deduplicateLineup(lineup: Lineup): Lineup {
  const seen: Player[] = [];
  const roles: (keyof Lineup)[] = ['Duelist', 'Controller', 'Initiator', 'Sentinel', 'Flex'];
  const cleaned: Lineup = { ...lineup };
  for (const r of roles) {
    const p = cleaned[r];
    if (!p) continue;
    if (seen.some(existing => isSamePlayer(existing, p))) {
      cleaned[r] = null;
    } else {
      seen.push(p);
    }
  }
  return cleaned;
}

function sanitizeTeamIdentity(value: unknown): UserTeamIdentity {
  if (!isRecord(value)) return { ...DEFAULT_TEAM_IDENTITY };
  const name =
    typeof value.name === 'string' && value.name.trim().length > 0
      ? value.name.trim().slice(0, 18).toUpperCase()
      : DEFAULT_TEAM_IDENTITY.name;
  const emblemId =
    typeof value.emblemId === 'string' && VALID_EMBLEMS.has(value.emblemId)
      ? (value.emblemId as UserTeamIdentity['emblemId'])
      : DEFAULT_TEAM_IDENTITY.emblemId;
  const color =
    typeof value.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(value.color)
      ? value.color
      : DEFAULT_TEAM_IDENTITY.color;
  return { name, emblemId, color };
}

export function saveActiveRun(run: ActiveRunSave): void {
  try {
    localStorage.setItem(ACTIVE_RUN_STORAGE_KEY, JSON.stringify(run));
  } catch (e) {
    console.error('Failed to auto-save active run', e);
  }
}

export function loadActiveRun(): ActiveRunSave | null {
  try {
    const raw = localStorage.getItem(ACTIVE_RUN_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    if (parsed.version !== 1) return null;
    if (!VALID_DIFFICULTIES.includes(parsed.difficulty as Difficulty)) return null;
    if (!isValidLineup(parsed.lineup)) return null;
    if (!Array.isArray(parsed.availableTeams) || parsed.availableTeams.length === 0) return null;
    if (typeof parsed.rerollsLeft !== 'number' || Number.isNaN(parsed.rerollsLeft)) return null;

    const isTournamentActive = Boolean(parsed.isTournamentActive);
    let tournamentState: SavedTournamentState | null = null;

    if (isTournamentActive) {
      if (!isRecord(parsed.tournamentState)) return null;
      const ts = parsed.tournamentState;
      if (
        typeof ts.currentStageIndex !== 'number' ||
        !isRecord(ts.series) ||
        !isRecord(ts.currentMap) ||
        !Array.isArray(ts.currentMap.events)
      ) {
        return null;
      }
      tournamentState = {
        currentStageIndex: ts.currentStageIndex,
        showQualifiedScreen: Boolean(ts.showQualifiedScreen),
        series: ts.series as unknown as SavedTournamentState['series'],
        currentMap: ts.currentMap as unknown as SavedTournamentState['currentMap'],
        allTournamentMaps: Array.isArray(ts.allTournamentMaps) ? ts.allTournamentMaps : [],
        usedOpponentIds: Array.isArray(ts.usedOpponentIds) ? ts.usedOpponentIds : [],
        revealedEventsCount: typeof ts.revealedEventsCount === 'number' ? ts.revealedEventsCount : 1,
        isSeriesDecided: Boolean(ts.isSeriesDecided),
        isChampionshipWon: Boolean(ts.isChampionshipWon),
        isEliminated: Boolean(ts.isEliminated),
        lostPreviousMapInSeries: Boolean(ts.lostPreviousMapInSeries),
        secondChanceUsedCount:
          typeof ts.secondChanceUsedCount === 'number' ? ts.secondChanceUsedCount : 0,
        secondChanceNotice:
          typeof ts.secondChanceNotice === 'string' ? ts.secondChanceNotice : null,
        seriesMvp: isRecord(ts.seriesMvp)
          ? (ts.seriesMvp as unknown as SavedTournamentState['seriesMvp'])
          : null,
        tournamentMvp: isRecord(ts.tournamentMvp)
          ? (ts.tournamentMvp as unknown as SavedTournamentState['tournamentMvp'])
          : null,
        teamPerformances: Array.isArray(ts.teamPerformances) ? ts.teamPerformances : [],
        runBonusSummaries: Array.isArray(ts.runBonusSummaries) ? ts.runBonusSummaries : [],
        runSummaryLine: typeof ts.runSummaryLine === 'string' ? ts.runSummaryLine : '',
        campaignSaved: Boolean(ts.campaignSaved),
        isPreSeriesPrep:
          typeof ts.isPreSeriesPrep === 'boolean' ? ts.isPreSeriesPrep : false,
        selectedStance:
          ts.selectedStance === 'aggressive' ||
          ts.selectedStance === 'balanced' ||
          ts.selectedStance === 'disciplined'
            ? ts.selectedStance
            : 'balanced',
        credits: typeof ts.credits === 'number' ? ts.credits : 0,
        lastSeriesCreditsEarned:
          typeof ts.lastSeriesCreditsEarned === 'number' ? ts.lastSeriesCreditsEarned : 0,
        activeSeriesBuff:
          ts.activeSeriesBuff === 'rating_boost' ||
          ts.activeSeriesBuff === 'pistol_prep' ||
          ts.activeSeriesBuff === 'clutch_prep'
            ? ts.activeSeriesBuff
            : 'none',
        shopOffer: isRecord(ts.shopOffer)
          ? (ts.shopOffer as unknown as SavedTournamentState['shopOffer'])
          : null,
      };
    }

    return {
      version: 1,
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now(),
      difficulty: parsed.difficulty as Difficulty,
      runRule: VALID_RULES.includes(parsed.runRule as RunRuleId)
        ? (parsed.runRule as RunRuleId)
        : 'standard',
      seed: typeof parsed.seed === 'string' && parsed.seed.length > 0 ? parsed.seed : undefined,
      drawStep: typeof parsed.drawStep === 'number' ? parsed.drawStep : 0,
      rerollsUsed: typeof parsed.rerollsUsed === 'number' ? parsed.rerollsUsed : 0,
      isDaily: Boolean(parsed.isDaily),
      teamIdentity: sanitizeTeamIdentity(parsed.teamIdentity),
      lineup: deduplicateLineup(parsed.lineup),
      availableTeams: parsed.availableTeams as ActiveRunSave['availableTeams'],
      rerollsLeft: parsed.rerollsLeft,
      selectedBonuses: Array.isArray(parsed.selectedBonuses) ? parsed.selectedBonuses : [],
      pendingBonusChoices: Array.isArray(parsed.pendingBonusChoices)
        ? parsed.pendingBonusChoices
        : null,
      bonusPromptStep: parsed.bonusPromptStep === 2 ? 2 : 1,
      bannedPlayers: Array.isArray(parsed.bannedPlayers) ? parsed.bannedPlayers : [],
      isTournamentActive,
      tournamentState,
    };
  } catch {
    return null;
  }
}

export function clearActiveRun(): void {
  try {
    localStorage.removeItem(ACTIVE_RUN_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

export function hasSavedProgress(run: ActiveRunSave | null): boolean {
  if (!run) return false;
  if (run.isTournamentActive && run.tournamentState && !run.tournamentState.isChampionshipWon && !run.tournamentState.isEliminated) {
    return true;
  }
  const picks = Object.values(run.lineup).filter(Boolean).length;
  return picks > 0 || !!run.pendingBonusChoices;
}
