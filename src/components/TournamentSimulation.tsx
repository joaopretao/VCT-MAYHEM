import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Play,
  FastForward,
  RotateCcw,
  ShieldAlert,
  Award,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Share2,
  Download,
} from 'lucide-react';
import {
  CardFrameId,
  Player,
  Role,
  Lineup,
  SeriesMatch,
  TournamentStage,
  Difficulty,
  CampaignHistory,
  MapGame,
  TournamentMvpStats,
  PlayerPerformance,
  MayhemBonus,
  BonusUsageSummary,
  UserTeamIdentity,
  SavedTournamentState,
  TacticalStance,
  SeriesTacticBuff,
  IntermissionShopOffer,
  RunRuleId,
  CompletedSeriesSummary,
} from '../types';
import {
  generateTournamentSeries,
  simulateSingleMap,
  calculateTeamStats,
  calculateTournamentMvp,
  aggregateTournamentPerformances,
  buildBonusUsageSummaries,
  generateRunSummaryLine,
} from '../utils/simulation';
import {
  playRoundWinSound,
  playRoundLossSound,
  playVictoryFanfare,
  playEliminationSound,
  playSelectSound,
  playBonusRevealSound,
} from '../utils/audio';
import { ROLE_NAMES_PT, ROLE_COLORS } from '../data/roleIcons';
import { AGENT_FULL_PORTRAITS } from '../data/agentIcons';
import { getMapArt } from '../data/mapArt';
import { getFrameMeta } from '../data/frames';
import { downloadShareResultPng } from '../utils/shareCard';
import { StageQualifiedScreen } from './StageQualifiedScreen';
import { TacticalPrepCard } from './TacticalPrepCard';
import { AppBackdropConfig } from './AppBackground';
import { TACTICAL_STANCES } from '../utils/scouting';
import {
  PLAYER_SWAP_COST,
  SHOP_BONUS_COST,
  SHOP_REROLL_COST,
  generateIntermissionShopOffer,
  getSeriesCreditsReward,
  getStartingCredits,
  rollTournamentShopBonus,
} from '../utils/shop';
import { TeamLogo } from './TeamLogo';
import { TeamCrest, DEFAULT_TEAM_IDENTITY } from './TeamCrest';
import { TraitBadge } from './TraitBadge';
import { RoleEmblem } from './RoleEmblem';
import { PlayerAvatar } from './PlayerAvatar';
import { CountryFlag } from './CountryFlag';
import { MayhemBonusChip } from './MayhemBonusChip';
import { ROLE_ORDER } from './roleOrder';
import { Confetti } from './Confetti';
import { Card, Badge, PrimaryButton, SecondaryButton } from './ui';

interface RunSummaryPanelProps {
  bonusSummaries: BonusUsageSummary[];
  summaryLine: string;
}

const RunSummaryPanel: React.FC<RunSummaryPanelProps> = ({ bonusSummaries, summaryLine }) => (
  <div
    id="run-summary-panel"
    className="rounded-[3px] bg-[#090c11] border border-white/10 p-3.5 mb-4 text-left space-y-2.5"
  >
    <div className="flex items-center justify-between gap-2">
      <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-[#e2b714]">
        RESUMO DA RUN
      </span>
      {bonusSummaries.length > 0 && (
        <span className="font-mono-vct text-xs text-slate-300">
          {bonusSummaries.length} {bonusSummaries.length === 1 ? 'bônus usado' : 'bônus usados'}
        </span>
      )}
    </div>

    {summaryLine && (
      <p className="text-xs sm:text-sm text-slate-200 leading-snug">{summaryLine}</p>
    )}

    {bonusSummaries.length > 0 && (
      <div className="space-y-1.5 pt-2 border-t border-white/[0.07]">
        {bonusSummaries.map(b => (
          <div
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-vct"
          >
            <MayhemBonusChip id={b.id} name={b.name} rarity={b.rarity} compact />
            <span className="text-slate-300">{b.usageText}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

interface ShareResultActionsProps {
  seed?: string;
  seedCopied?: boolean;
  isDownloadingPng: boolean;
  onCopySeedUrl?: () => void;
  onDownloadPng: () => void;
}

const ShareResultActions: React.FC<ShareResultActionsProps> = ({
  seed,
  seedCopied = false,
  isDownloadingPng,
  onCopySeedUrl,
  onDownloadPng,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
    {seed && onCopySeedUrl && (
      <SecondaryButton
        id="copy-seed-link-btn"
        size="md"
        onClick={() => {
          playSelectSound();
          onCopySeedUrl();
        }}
        className="w-full"
      >
        <Share2 className="w-4 h-4 text-[#38bdf8]" />
        <span>{seedCopied ? 'Link copiado!' : 'Tente o meu draft'}</span>
      </SecondaryButton>
    )}
    <SecondaryButton
      id="download-share-card-btn"
      size="md"
      disabled={isDownloadingPng}
      onClick={() => {
        playSelectSound();
        onDownloadPng();
      }}
      className={`w-full ${!seed || !onCopySeedUrl ? 'sm:col-span-2' : ''}`}
    >
      <Download className="w-4 h-4 text-[#e2b714]" />
      <span>{isDownloadingPng ? 'Gerando imagem...' : 'Baixar card PNG'}</span>
    </SecondaryButton>
  </div>
);

interface RoundTrackNode {
  label: string;
  pScore: number;
  oScore: number;
  type: 'start' | 'win' | 'loss';
}

function buildRoundProgressionSteps(
  events: MapGame['events'],
  revealedCount: number,
  finalPlayerScore: number,
  finalOpponentScore: number,
  isEnded: boolean
): RoundTrackNode[] {
  const nodes: RoundTrackNode[] = [{ label: 'Início', pScore: 0, oScore: 0, type: 'start' }];
  const visibleCount = Math.min(revealedCount, events.length);
  const baseMilestones = [0, 4, 8, 13];
  let pWins = 0;
  let oWins = 0;
  let curP = 0;
  let curO = 0;

  for (let i = 0; i < visibleCount; i++) {
    const ev = events[i];
    const isLastVisible = i === visibleCount - 1;
    if (ev.type === 'win') {
      pWins++;
    } else {
      oWins++;
    }

    if (isEnded && isLastVisible) {
      curP = finalPlayerScore;
      curO = finalOpponentScore;
    } else {
      const targetWinP = ev.type === 'win'
        ? Math.max(curP + 1, baseMilestones[Math.min(3, pWins)] ?? curP + 3)
        : Math.min(11, curP + (oWins > 1 ? 2 : 1));
      const targetWinO = ev.type === 'loss'
        ? Math.max(curO + 1, baseMilestones[Math.min(3, oWins)] ?? curO + 3)
        : Math.min(11, curO + (pWins > 1 ? 2 : 1));

      curP = isEnded ? Math.min(finalPlayerScore, targetWinP) : Math.min(12, targetWinP);
      curO = isEnded ? Math.min(finalOpponentScore, targetWinO) : Math.min(12, targetWinO);
    }

    nodes.push({
      label: `#${i + 1}`,
      pScore: curP,
      oScore: curO,
      type: ev.type === 'win' ? 'win' : 'loss',
    });
  }

  return nodes;
}

interface TournamentSimulationProps {
  lineup: Lineup;
  difficulty: Difficulty;
  runRule?: RunRuleId;
  seed?: string;
  rerollsUsed?: number;
  isDaily?: boolean;
  frameId?: CardFrameId;
  seedCopied?: boolean;
  onCopySeedUrl?: () => void;
  selectedBonuses?: MayhemBonus[];
  bannedPlayers?: Player[];
  teamIdentity?: UserTeamIdentity;
  initialSavedState?: SavedTournamentState | null;
  onTournamentStateChange?: (state: SavedTournamentState) => void;
  onUpdateLineup?: (nextLineup: Lineup) => void;
  onAddShopBonus?: (bonus: MayhemBonus) => void;
  onBackdropChange?: (backdrop: AppBackdropConfig | null) => void;
  onResetTournament: () => void;
  onSaveCampaign: (history: CampaignHistory) => void;
}

const STAGES: TournamentStage[] = ['group', 'quarters', 'semis', 'finals'];

export const TournamentSimulation: React.FC<TournamentSimulationProps> = ({
  lineup,
  difficulty,
  runRule = 'standard',
  seed = 'LOCAL',
  rerollsUsed = 0,
  isDaily = false,
  frameId = 'default',
  seedCopied = false,
  onCopySeedUrl,
  selectedBonuses = [],
  bannedPlayers = [],
  teamIdentity = DEFAULT_TEAM_IDENTITY,
  initialSavedState = null,
  onTournamentStateChange,
  onUpdateLineup,
  onAddShopBonus,
  onBackdropChange,
  onResetTournament,
  onSaveCampaign,
}) => {
  const [isDownloadingPng, setIsDownloadingPng] = useState<boolean>(false);
  const [previewMapName, setPreviewMapName] = useState<string | null>(null);
  const frameMeta = getFrameMeta(frameId);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(
    initialSavedState?.currentStageIndex ?? 0
  );
  const [showQualifiedScreen, setShowQualifiedScreen] = useState<boolean>(
    initialSavedState?.showQualifiedScreen ?? false
  );
  const [isPreSeriesPrep, setIsPreSeriesPrep] = useState<boolean>(
    initialSavedState?.isPreSeriesPrep ?? true
  );
  const [selectedStance, setSelectedStance] = useState<TacticalStance>(
    initialSavedState?.selectedStance ?? 'balanced'
  );
  const [credits, setCredits] = useState<number>(
    initialSavedState?.credits ?? getStartingCredits(difficulty)
  );
  const [lastSeriesCreditsEarned, setLastSeriesCreditsEarned] = useState<number>(
    initialSavedState?.lastSeriesCreditsEarned ?? 0
  );
  const [activeSeriesBuff, setActiveSeriesBuff] = useState<SeriesTacticBuff>(
    initialSavedState?.activeSeriesBuff ?? 'none'
  );
  const [shopOffer, setShopOffer] = useState<IntermissionShopOffer | null>(
    initialSavedState?.shopOffer ?? null
  );
  const [series, setSeries] = useState<SeriesMatch | null>(initialSavedState?.series ?? null);
  const [currentMap, setCurrentMap] = useState<MapGame | null>(
    initialSavedState?.currentMap ?? null
  );
  const [allTournamentMaps, setAllTournamentMaps] = useState<MapGame[]>(
    initialSavedState?.allTournamentMaps ?? []
  );
  const [usedOpponentIds, setUsedOpponentIds] = useState<string[]>(
    initialSavedState?.usedOpponentIds ?? []
  );
  const [completedSeries, setCompletedSeries] = useState<CompletedSeriesSummary[]>(
    initialSavedState?.completedSeries ?? []
  );
  const [revealedEventsCount, setRevealedEventsCount] = useState<number>(
    initialSavedState?.revealedEventsCount ?? 0
  );
  const [isSeriesDecided, setIsSeriesDecided] = useState<boolean>(
    initialSavedState?.isSeriesDecided ?? false
  );
  const [isChampionshipWon, setIsChampionshipWon] = useState<boolean>(
    initialSavedState?.isChampionshipWon ?? false
  );
  const [isEliminated, setIsEliminated] = useState<boolean>(
    initialSavedState?.isEliminated ?? false
  );
  const [showScoreboardModal, setShowScoreboardModal] = useState<boolean>(false);
  const [showCurrentMapStats, setShowCurrentMapStats] = useState<boolean>(false);
  const [seriesMvp, setSeriesMvp] = useState<TournamentMvpStats | null>(
    initialSavedState?.seriesMvp ?? null
  );
  const [tournamentMvp, setTournamentMvp] = useState<TournamentMvpStats | null>(
    initialSavedState?.tournamentMvp ?? null
  );
  const [teamPerformances, setTeamPerformances] = useState<PlayerPerformance[]>(
    initialSavedState?.teamPerformances ?? []
  );
  const [lostPreviousMapInSeries, setLostPreviousMapInSeries] = useState<boolean>(
    initialSavedState?.lostPreviousMapInSeries ?? false
  );
  const [secondChanceUsedCount, setSecondChanceUsedCount] = useState<number>(
    initialSavedState?.secondChanceUsedCount ?? 0
  );
  const [secondChanceNotice, setSecondChanceNotice] = useState<string | null>(
    initialSavedState?.secondChanceNotice ?? null
  );
  const [runBonusSummaries, setRunBonusSummaries] = useState<BonusUsageSummary[]>(
    initialSavedState?.runBonusSummaries ?? []
  );
  const [runSummaryLine, setRunSummaryLine] = useState<string>(
    initialSavedState?.runSummaryLine ?? ''
  );
  const [campaignSaved, setCampaignSaved] = useState<boolean>(
    initialSavedState?.campaignSaved ?? false
  );
  const skipNextRoundSoundRef = React.useRef<boolean>(Boolean(initialSavedState?.series));

  const teamStats = calculateTeamStats(lineup, selectedBonuses);
  const currentStage = STAGES[currentStageIndex];

  const initSeriesForStage = (
    stage: TournamentStage,
    currentUsedIds: string[] = usedOpponentIds,
    stance: TacticalStance = 'balanced',
    buff: SeriesTacticBuff = activeSeriesBuff
  ) => {
    const newSeries = generateTournamentSeries(stage, difficulty, currentUsedIds, runRule);
    if (newSeries.opponent.id) {
      setUsedOpponentIds(prev => (prev.includes(newSeries.opponent.id!) ? prev : [...prev, newSeries.opponent.id!]));
    }
    setSeries(newSeries);
    setSelectedStance(stance);
    setIsPreSeriesPrep(true);
    setIsSeriesDecided(false);
    setShowCurrentMapStats(false);
    setLostPreviousMapInSeries(false);
    setSecondChanceNotice(null);

    const firstMap = simulateSingleMap(lineup, newSeries.opponent.rating, 0, [], {
      bonuses: selectedBonuses,
      lostPreviousMap: false,
      difficulty,
      stance,
      seriesBuff: buff,
      forcedMapName: newSeries.mapQueue?.[0],
    });
    setCurrentMap(firstMap);
    setRevealedEventsCount(1);
  };

  const handleConfirmSeriesPrep = () => {
    if (!series) return;
    const firstMap = simulateSingleMap(lineup, series.opponent.rating, 0, [], {
      bonuses: selectedBonuses,
      lostPreviousMap: false,
      difficulty,
      stance: selectedStance,
      seriesBuff: activeSeriesBuff,
      forcedMapName: series.mapQueue?.[0],
    });
    skipNextRoundSoundRef.current = false;
    setCurrentMap(firstMap);
    setRevealedEventsCount(1);
    setShowCurrentMapStats(false);
    setIsPreSeriesPrep(false);
  };

  useEffect(() => {
    if (!onBackdropChange) return;
    const activeMap = isPreSeriesPrep
      ? previewMapName || series?.mapQueue?.[0] || currentMap?.mapName || null
      : currentMap?.mapName || series?.mapQueue?.[series?.currentMapIndex ?? 0] || null;

    if (activeMap && !showQualifiedScreen) {
      onBackdropChange({
        mapName: activeMap,
        leftGlowColor: teamIdentity.color,
        rightGlowColor: series?.opponent.logoColor || null,
        isFinals: series?.stage === 'finals',
      });
    } else {
      onBackdropChange(null);
    }
  }, [
    onBackdropChange,
    isPreSeriesPrep,
    previewMapName,
    currentMap?.mapName,
    series?.mapQueue,
    series?.currentMapIndex,
    series?.opponent.logoColor,
    series?.stage,
    teamIdentity.color,
    showQualifiedScreen,
  ]);

  useEffect(() => {
    return () => {
      onBackdropChange?.(null);
    };
  }, [onBackdropChange]);

  useEffect(() => {
    if (!series || !currentMap) {
      initSeriesForStage(STAGES[currentStageIndex], usedOpponentIds);
    }
  }, []);

  useEffect(() => {
    if (!onTournamentStateChange || !series) return;
    onTournamentStateChange({
      currentStageIndex,
      showQualifiedScreen,
      isPreSeriesPrep,
      selectedStance,
      credits,
      lastSeriesCreditsEarned,
      activeSeriesBuff,
      shopOffer,
      series,
      currentMap,
      allTournamentMaps,
      usedOpponentIds,
      revealedEventsCount,
      isSeriesDecided,
      isChampionshipWon,
      isEliminated,
      lostPreviousMapInSeries,
      secondChanceUsedCount,
      secondChanceNotice,
      seriesMvp,
      tournamentMvp,
      teamPerformances,
      runBonusSummaries,
      runSummaryLine,
      campaignSaved,
      completedSeries,
    });
  }, [
    onTournamentStateChange,
    currentStageIndex,
    showQualifiedScreen,
    isPreSeriesPrep,
    selectedStance,
    credits,
    lastSeriesCreditsEarned,
    activeSeriesBuff,
    shopOffer,
    series,
    currentMap,
    allTournamentMaps,
    usedOpponentIds,
    revealedEventsCount,
    isSeriesDecided,
    isChampionshipWon,
    isEliminated,
    lostPreviousMapInSeries,
    secondChanceUsedCount,
    secondChanceNotice,
    seriesMvp,
    tournamentMvp,
    teamPerformances,
    runBonusSummaries,
    runSummaryLine,
    campaignSaved,
    completedSeries,
  ]);

  useEffect(() => {
    if (!currentMap || revealedEventsCount === 0) return;
    if (skipNextRoundSoundRef.current) {
      skipNextRoundSoundRef.current = false;
      return;
    }
    const latestEvent = currentMap.events[revealedEventsCount - 1];
    if (latestEvent) {
      if (latestEvent.type === 'win') {
        playRoundWinSound();
      } else {
        playRoundLossSound();
      }
    }
  }, [revealedEventsCount, currentMap]);

  const handleNextEvent = () => {
    if (!currentMap || !series) return;

    const revealedEvents = currentMap.events.slice(0, revealedEventsCount);
    const playerSituationsWon = revealedEvents.filter(e => e.type === 'win').length;
    const opponentSituationsWon = revealedEvents.filter(e => e.type === 'loss').length;
    const isMapDecided = playerSituationsWon >= 3 || opponentSituationsWon >= 3;

    if (revealedEventsCount < currentMap.events.length && !isMapDecided) {
      const nextEvent = currentMap.events[revealedEventsCount];
      if (nextEvent && nextEvent.type === 'win') {
        playRoundWinSound();
      } else if (nextEvent && nextEvent.type === 'loss') {
        playRoundLossSound();
      } else {
        playSelectSound();
      }
      setRevealedEventsCount(prev => prev + 1);
    } else {
      playSelectSound();
      finishCurrentMap();
    }
  };

  const handleInstantMap = () => {
    playSelectSound();
    if (!currentMap || !series) return;
    setRevealedEventsCount(currentMap.events.length);
    if (currentMap.playerWon) {
      playRoundWinSound();
    } else {
      playRoundLossSound();
    }
  };

  const finishCurrentMap = () => {
    if (!currentMap || !series) return;

    const targetWins = Math.ceil(series.bestOf / 2);
    const hasSecondChance = selectedBonuses.some(b => b.modifiers.onceSecondChance);
    const wouldLoseSeries = !currentMap.playerWon && series.opponentWins + 1 >= targetWins;

    if (wouldLoseSeries && hasSecondChance && secondChanceUsedCount === 0) {
      setSecondChanceUsedCount(1);
      setLostPreviousMapInSeries(true);
      setSecondChanceNotice(
        'SEGUNDA CHANCE ATIVADA! Eliminação evitada — o último mapa desta série será jogado novamente.'
      );
      playBonusRevealSound();

      const replayedMap = simulateSingleMap(
        lineup,
        series.opponent.rating,
        series.currentMapIndex,
        series.maps.map(m => m.mapName),
        {
          bonuses: selectedBonuses,
          lostPreviousMap: true,
          isSecondChanceReplay: true,
          difficulty,
          stance: selectedStance,
          seriesBuff: activeSeriesBuff,
          forcedMapName: currentMap.mapName,
        }
      );
      setCurrentMap(replayedMap);
      setRevealedEventsCount(1);
      setShowCurrentMapStats(false);
      return;
    }

    const updatedMaps = [...series.maps, currentMap];
    const newAllTournamentMaps = [...allTournamentMaps, currentMap];
    setAllTournamentMaps(newAllTournamentMaps);

    const playerWins = updatedMaps.filter(m => m.playerWon).length;
    const opponentWins = updatedMaps.filter(m => !m.playerWon).length;

    const isSeriesWon = playerWins >= targetWins;
    const isSeriesLost = opponentWins >= targetWins;
    const seriesOver = isSeriesWon || isSeriesLost;

    const updatedSeries: SeriesMatch = {
      ...series,
      playerWins,
      opponentWins,
      currentMapIndex: series.currentMapIndex + 1,
      maps: updatedMaps,
      isFinished: seriesOver,
      playerWonSeries: seriesOver ? isSeriesWon : null,
    };

    setSeries(updatedSeries);
    setSecondChanceNotice(null);

    if (seriesOver) {
      setIsSeriesDecided(true);

      const performances = aggregateTournamentPerformances(lineup, newAllTournamentMaps);
      setTeamPerformances(performances);

      const mvp = calculateTournamentMvp(lineup, newAllTournamentMaps);
      setTournamentMvp(mvp);

      const wonCamp = isSeriesWon && currentStageIndex === STAGES.length - 1;
      const summaries = buildBonusUsageSummaries(
        selectedBonuses,
        newAllTournamentMaps,
        secondChanceUsedCount
      );
      const summaryLine = generateRunSummaryLine({
        wonChampionship: wonCamp,
        stageReached: currentStage,
        stats: teamStats,
        bonusSummaries: summaries,
        secondChanceUsedCount,
        mvpIgn: mvp?.player.ign,
        playerWins,
        opponentWins,
      });
      setRunBonusSummaries(summaries);
      setRunSummaryLine(summaryLine);

      if (isSeriesWon) {
        const seriesRecord: CompletedSeriesSummary = {
          stage: currentStage,
          opponentName: series.opponent.name,
          opponentTag: series.opponent.tag,
          opponentLogoUrl: series.opponent.logoUrl,
          opponentColor: series.opponent.logoColor,
          playerWins,
          opponentWins,
        };
        setCompletedSeries(prev => [
          ...prev.filter(item => item.stage !== currentStage),
          seriesRecord,
        ]);

        if (currentStageIndex === STAGES.length - 1) {
          playVictoryFanfare();
          setIsChampionshipWon(true);
          saveCampaignRecord(true, currentStage, mvp, playerWins, opponentWins, summaries, summaryLine);
        } else {
          const currentSeriesMvp = calculateTournamentMvp(lineup, updatedMaps);
          const earnedCredits = getSeriesCreditsReward(playerWins, opponentWins);
          setSeriesMvp(currentSeriesMvp);
          setLastSeriesCreditsEarned(earnedCredits);
          setCredits(prev => prev + earnedCredits);
          setActiveSeriesBuff('none');
          setShopOffer(generateIntermissionShopOffer(lineup, selectedBonuses, bannedPlayers, runRule));
          setShowQualifiedScreen(true);
        }
      } else {
        playEliminationSound();
        setIsEliminated(true);
        saveCampaignRecord(false, currentStage, mvp, playerWins, opponentWins, summaries, summaryLine);
      }
    } else {
      const lostCurrent = !currentMap.playerWon;
      setLostPreviousMapInSeries(lostCurrent);
      const nextMap = simulateSingleMap(
        lineup,
        series.opponent.rating,
        updatedSeries.currentMapIndex,
        updatedMaps.map(m => m.mapName),
        {
          bonuses: selectedBonuses,
          lostPreviousMap: lostCurrent,
          difficulty,
          stance: selectedStance,
          seriesBuff: activeSeriesBuff,
          forcedMapName: series.mapQueue?.[updatedSeries.currentMapIndex],
        }
      );
      setCurrentMap(nextMap);
      setRevealedEventsCount(1);
      setShowCurrentMapStats(false);
    }
  };

  const saveCampaignRecord = (
    wonChampionship: boolean,
    finalStage: TournamentStage,
    mvpStats: TournamentMvpStats | null,
    finalPlayerWins?: number,
    finalOpponentWins?: number,
    bonuses?: BonusUsageSummary[],
    runSummary?: string
  ) => {
    if (campaignSaved) return;
    setCampaignSaved(true);

    const mvpPlayer = mvpStats?.player;

    const record: CampaignHistory = {
      id: `camp_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      difficulty,
      teamName: teamIdentity.name,
      teamEmblemId: teamIdentity.emblemId,
      teamColor: teamIdentity.color,
      runRule,
      seed,
      rerollsUsed,
      isDaily,
      lineup: Object.entries(lineup)
        .filter(([_, p]) => p !== null)
        .map(([role, p]) => ({
          role: role as Role,
          ign: p!.ign,
          team: p!.team,
          year: p!.year,
          rating: p!.rating,
          traitId: p!.trait?.id,
          traitName: p!.trait?.name,
        })),
      overallRating: teamStats.overallRating,
      stageReached: finalStage,
      wonChampionship,
      seriesScore: `${finalPlayerWins ?? series?.playerWins ?? 0} - ${finalOpponentWins ?? series?.opponentWins ?? 0}`,
      mvp: mvpPlayer?.ign || 'Nenhum',
      mvpDetails:
        mvpPlayer && mvpStats
          ? {
              ign: mvpPlayer.ign,
              role: mvpPlayer.primaryRole,
              team: mvpPlayer.team,
              year: mvpPlayer.year,
              acs: mvpStats.acs,
              kdRatio: mvpStats.kdRatio,
              clutchesWon: mvpStats.clutchesWon,
              signatureAgent: mvpPlayer.signatureAgent,
            }
          : undefined,
      bonuses: bonuses && bonuses.length > 0 ? bonuses : undefined,
      runSummary: runSummary || undefined,
    };

    onSaveCampaign(record);
  };

  const handleShopSwapPlayer = (newPlayer: Player, targetRole: Role) => {
    if (!shopOffer || shopOffer.swapUsed || credits < PLAYER_SWAP_COST) return;
    const updatedLineup: Lineup = { ...lineup, [targetRole]: newPlayer };
    onUpdateLineup?.(updatedLineup);
    setCredits(prev => prev - PLAYER_SWAP_COST);
    setShopOffer(prev => (prev ? { ...prev, swapUsed: true } : prev));
  };

  const handleShopBuyBonus = (bonus: MayhemBonus) => {
    if (!shopOffer || shopOffer.bonusBought || credits < SHOP_BONUS_COST) return;
    onAddShopBonus?.(bonus);
    setCredits(prev => prev - SHOP_BONUS_COST);
    setShopOffer(prev => (prev ? { ...prev, bonusBought: true } : prev));
  };

  const handleShopRerollBonus = () => {
    if (!shopOffer || shopOffer.bonusBought || credits < SHOP_REROLL_COST) return;
    const excludeWithCurrent = shopOffer.bonusOffer
      ? [...selectedBonuses, shopOffer.bonusOffer]
      : selectedBonuses;
    let nextBonus = rollTournamentShopBonus(excludeWithCurrent);
    if (!nextBonus) nextBonus = rollTournamentShopBonus(selectedBonuses);
    setCredits(prev => prev - SHOP_REROLL_COST);
    setShopOffer(prev => (prev ? { ...prev, bonusOffer: nextBonus } : prev));
  };

  const handleShopBuyTacticBuff = (buffId: SeriesTacticBuff, cost: number) => {
    if (!shopOffer || shopOffer.tacticBought || credits < cost) return;
    setCredits(prev => prev - cost);
    setActiveSeriesBuff(buffId);
    setShopOffer(prev => (prev ? { ...prev, tacticBought: true } : prev));
  };

  const handleDownloadResultPng = async () => {
    if (!series || isDownloadingPng) return;
    setIsDownloadingPng(true);
    try {
      await downloadShareResultPng({
        teamIdentity,
        frameId,
        lineup,
        wonChampionship: isChampionshipWon,
        stageReached: currentStage,
        seriesScore: `${series.playerWins}–${series.opponentWins}`,
        opponentName: series.opponent.name,
        difficulty,
        runRule,
        seed,
        mvp: tournamentMvp,
        bonuses: runBonusSummaries,
      });
    } finally {
      setIsDownloadingPng(false);
    }
  };

  const handleNextStageFromScreen = () => {
    const nextIdx = currentStageIndex + 1;
    setShowQualifiedScreen(false);
    setShopOffer(null);
    setSeriesMvp(null);
    setCurrentStageIndex(nextIdx);
    initSeriesForStage(STAGES[nextIdx], usedOpponentIds, 'balanced', activeSeriesBuff);
  };

  if (showQualifiedScreen) {
    return (
      <StageQualifiedScreen
        stage={currentStage}
        lineup={lineup}
        teamIdentity={teamIdentity}
        opponentName={series?.opponent.name}
        scoreLabel={series ? `${series.playerWins}–${series.opponentWins}` : undefined}
        seriesMvp={seriesMvp}
        credits={credits}
        lastEarnedCredits={lastSeriesCreditsEarned}
        shopOffer={shopOffer}
        selectedBonuses={selectedBonuses}
        activeSeriesBuff={activeSeriesBuff}
        onSwapPlayer={handleShopSwapPlayer}
        onBuyBonus={handleShopBuyBonus}
        onRerollBonus={handleShopRerollBonus}
        onBuyTacticBuff={handleShopBuyTacticBuff}
        onNextStage={handleNextStageFromScreen}
      />
    );
  }

  if (!series || !currentMap) {
    return (
      <div className="p-8 text-center text-slate-300 font-mono-vct text-sm">
        Carregando confrontos do Champions...
      </div>
    );
  }

  const mapSlots = Array.from({ length: series.bestOf });
  const revealedEvents = currentMap.events.slice(0, revealedEventsCount);
  const playerSituationsWon = revealedEvents.filter(e => e.type === 'win').length;
  const opponentSituationsWon = revealedEvents.filter(e => e.type === 'loss').length;
  const isCurrentMapEnded =
    playerSituationsWon >= 3 ||
    opponentSituationsWon >= 3 ||
    revealedEventsCount >= currentMap.events.length;

  // Immediate visual update of the Series score as soon as the current map ends
  const pendingMapAlreadyCommitted = series.maps.length > series.currentMapIndex;
  const displayedPlayerWins =
    series.playerWins +
    (isCurrentMapEnded && !pendingMapAlreadyCommitted && currentMap.playerWon ? 1 : 0);
  const displayedOpponentWins =
    series.opponentWins +
    (isCurrentMapEnded && !pendingMapAlreadyCommitted && !currentMap.playerWon ? 1 : 0);
  const targetWinsToCloseSeries = Math.ceil(series.bestOf / 2);
  const willCurrentMapDecideSeries =
    isSeriesDecided ||
    displayedPlayerWins >= targetWinsToCloseSeries ||
    displayedOpponentWins >= targetWinsToCloseSeries;

  const runLeader =
    allTournamentMaps.length > 0 ? calculateTournamentMvp(lineup, allTournamentMaps) : null;

  return (
    <div className="flex flex-col gap-2.5 md:gap-4 pb-4">
      <Confetti fire={isChampionshipWon} />

      {/* TOP FULL-WIDTH SCOREBOARD (Shown during Live Series; Pre-Series uses unified Broadcast Header) */}
      {!isPreSeriesPrep && (
      <Card padding="none" className="p-2.5 md:p-4 w-full">
        {/* Small Stage & Format Labels */}
        <div className="flex items-center justify-center gap-2 mb-2 md:mb-3 flex-wrap">
          <Badge tone={series.stage === 'finals' ? 'gold' : 'red'}>{series.stageTitle}</Badge>
          <Badge tone="neutral">MD{series.bestOf}</Badge>
          <Badge tone="cyan">
            Postura: {TACTICAL_STANCES.find(s => s.id === selectedStance)?.label || 'Equilibrada'}
          </Badge>
          {activeSeriesBuff !== 'none' && (
            <Badge tone="gold">Preparo ativo</Badge>
          )}
          {lostPreviousMapInSeries && selectedBonuses.some(b => b.id === 'folego') && (
            <Badge tone="gold">Fôlego ativo (+3)</Badge>
          )}
        </div>

        {/* SEU ELENCO vs SÉRIE SCORE vs ADVERSÁRIO (Always horizontal 3-col so mobile stays compact) */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4">
          {/* Left: Seu Time */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <TeamCrest
              emblemId={teamIdentity.emblemId}
              color={teamIdentity.color}
              size="lg"
              className="hidden sm:inline-flex"
            />
            <div className="min-w-0">
              <span className="hidden md:block font-mono-vct text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
                Sua Equipe
              </span>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl leading-none text-white uppercase tracking-wide truncate">
                {teamIdentity.name}
              </h2>
              <span className="hidden md:block font-mono-vct text-xs text-slate-300 mt-0.5">
                Força Geral: <strong className="text-slate-300">Oculta na Run</strong>
              </span>
            </div>
          </div>

          {/* Center: Large Series Score */}
          <div className="surface-sub flex flex-col items-center justify-center px-3 py-1.5 md:px-6 md:py-2 mx-auto">
            <span className="hidden md:block font-mono-vct text-xs font-bold uppercase tracking-widest text-slate-300 mb-0.5">
              Placar da Série
            </span>
            <div className="font-mono-vct text-2xl sm:text-3xl md:text-4xl font-black tracking-wider leading-none flex items-center gap-2 md:gap-3">
              <span className={displayedPlayerWins > displayedOpponentWins ? 'text-emerald-400' : 'text-white'}>
                {displayedPlayerWins}
              </span>
              <span className="text-slate-500 text-xl md:text-2xl">:</span>
              <span className={displayedOpponentWins > displayedPlayerWins ? 'text-rose-400' : 'text-white'}>
                {displayedOpponentWins}
              </span>
            </div>
          </div>

          {/* Right: Adversário */}
          <div className="flex items-center justify-end gap-2 md:gap-3 text-right min-w-0">
            <div className="order-2 md:order-1 min-w-0">
              <span className="hidden md:block font-mono-vct text-xs font-bold uppercase tracking-wider text-rose-400">
                Adversário
              </span>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl leading-none md:leading-tight text-white uppercase tracking-wide break-words line-clamp-1 md:line-clamp-2">
                {(() => {
                  const tag = series.opponent.tag || series.opponent.name;
                  if (tag.includes("'")) return tag;
                  const yrMatch = series.opponent.name.match(/\((\d{4})\)/);
                  return yrMatch ? `${tag} '${yrMatch[1].slice(2)}` : tag;
                })()}
              </h2>
              <span className="hidden md:block font-mono-vct text-xs text-slate-300 mt-0.5">
                Força Geral: <strong className="text-white">{series.opponent.rating} OVR</strong>
              </span>
            </div>
            <div className="order-1 md:order-2 w-8 h-8 md:w-12 md:h-12 rounded-[3px] bg-[#0b0e14] border border-white/10 p-1 md:p-1.5 flex items-center justify-center shrink-0">
              <TeamLogo
                teamName={series.opponent.name}
                shortName={series.opponent.tag}
                logoUrl={series.opponent.logoUrl}
                primaryColor={series.opponent.logoColor}
                size="md"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Active Mayhem Bonuses in Tournament Header */}
        {selectedBonuses.length > 0 && (
          <div
            id="tournament-bonuses-header"
            className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 flex-wrap mt-2.5 pt-2 border-t border-white/[0.07]"
          >
            <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-[#e2b714]">
              Bônus ativos:
            </span>
            {selectedBonuses.map(bonus => (
              <MayhemBonusChip
                key={bonus.id}
                id={bonus.id}
                name={bonus.name}
                rarity={bonus.rarity}
                subtitle={bonus.shortEffect}
                compact
              />
            ))}
          </div>
        )}
      </Card>
      )}

      {secondChanceNotice && (
        <div
          id="second-chance-banner"
          className="rounded-[3px] bg-[#0d1118] border border-[#38bdf8]/50 px-3.5 py-2.5 flex items-center gap-2.5 text-xs sm:text-sm font-mono-vct text-sky-200 animate-popIn"
        >
          <ShieldAlert className="w-4 h-4 text-[#38bdf8] shrink-0" />
          <span>{secondChanceNotice}</span>
        </div>
      )}

      {/* BELOW: PRE-SERIES OFFICIAL BROADCAST PRESENTATION OR LIVE SERIES COLUMNS */}
      {isPreSeriesPrep ? (
        <TacticalPrepCard
          series={series}
          lineup={lineup}
          teamIdentity={teamIdentity}
          difficulty={difficulty}
          selectedStance={selectedStance}
          onSelectStance={setSelectedStance}
          activeSeriesBuff={activeSeriesBuff}
          selectedBonuses={selectedBonuses}
          completedSeries={completedSeries}
          runLeader={runLeader}
          teamSynergy={teamStats.synergy}
          onPreviewMapChange={setPreviewMapName}
          onStartSeries={handleConfirmSeriesPrep}
        />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 md:gap-4 items-start">
        {/* LEFT NARROW COLUMN */}
        <div className="lg:col-span-4 flex flex-col gap-2.5 md:gap-4">
          {/* Map Markers Card with Real HD Map Thumbnails */}
          <Card padding="none" className="p-2.5 md:p-4">
            <div className="hidden md:flex items-center justify-between gap-2 mb-3">
              <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-slate-200">
                Mapas da Série
              </span>
              <span className="font-mono-vct text-xs text-slate-300">
                Vence quem ganhar {targetWinsToCloseSeries}
              </span>
            </div>

            <div
              className={`grid gap-1.5 md:gap-2 ${
                series.bestOf >= 5 ? 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-3'
              }`}
            >
              {mapSlots.map((_, idx) => {
                const committedMap = series.maps[idx];
                const isCurrentSlot = idx === series.currentMapIndex;
                const liveFinishedMap =
                  isCurrentSlot && isCurrentMapEnded && !committedMap ? currentMap : null;
                const mapData = committedMap || liveFinishedMap;
                const scheduledMapName = series.mapQueue?.[idx];

                let borderCls = 'border-white/12 text-slate-200';
                let scoreColorCls = 'text-slate-200';
                let scoreLabel = isCurrentSlot ? 'Em jogo' : 'A jogar';

                if (mapData) {
                  if (mapData.playerWon) {
                    borderCls = 'border-emerald-500/55 text-emerald-300';
                    scoreColorCls = 'text-emerald-300';
                    scoreLabel = `${mapData.playerScore}–${mapData.opponentScore} ✓`;
                  } else {
                    borderCls = 'border-rose-500/55 text-rose-300';
                    scoreColorCls = 'text-rose-300';
                    scoreLabel = `${mapData.playerScore}–${mapData.opponentScore} ✗`;
                  }
                } else if (isCurrentSlot) {
                  borderCls = 'border-[#e2b714]/80 text-[#fde047]';
                  scoreColorCls = 'text-[#fde047]';
                  scoreLabel = 'Em jogo';
                }

                const slotMapName = mapData
                  ? mapData.mapName
                  : isCurrentSlot
                  ? currentMap.mapName
                  : scheduledMapName || '';
                const mapArt = slotMapName ? getMapArt(slotMapName) : null;

                return (
                  <div
                    key={idx}
                    className={`relative overflow-hidden min-h-[58px] md:min-h-[68px] p-1.5 md:p-2 rounded-[4px] border flex flex-col items-center justify-center text-center bg-[#06090f] ${borderCls}`}
                  >
                    {mapArt && (
                      <img
                        src={mapArt.splash}
                        alt=""
                        aria-hidden="true"
                        className={`pointer-events-none select-none absolute inset-0 w-full h-full object-cover ${
                          isCurrentSlot
                            ? 'opacity-50'
                            : mapData
                            ? 'opacity-40'
                            : 'opacity-22 grayscale-[35%]'
                        }`}
                      />
                    )}
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06090f]/92 via-[#06090f]/58 to-[#06090f]/75"
                      aria-hidden
                    />
                    <span className="relative z-10 font-mono-vct text-[10px] md:text-[11px] font-bold uppercase truncate max-w-full drop-shadow">
                      M{idx + 1} {slotMapName ? `· ${slotMapName}` : ''}
                    </span>
                    <span
                      className={`relative z-10 font-mono-vct text-xs md:text-sm font-black mt-0.5 drop-shadow ${scoreColorCls}`}
                    >
                      {scoreLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 5 Players Roster Card with Crisp Agent Banners + Live Clutch Highlight */}
          <Card padding="md" className="hidden lg:block">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-slate-200">
                Seu Elenco Titular
              </span>
              <span className="font-mono-vct text-xs text-slate-300">5 atletas</span>
            </div>

            <div className="flex flex-col gap-2">
              {(() => {
                const latestClutchIgn =
                  revealedEvents[revealedEvents.length - 1]?.clutchPlayer?.toLowerCase() || null;

                return ROLE_ORDER.map(role => {
                  const p = lineup[role];
                  const roleColor = ROLE_COLORS[role];
                  const agentPortrait = p?.signatureAgent
                    ? AGENT_FULL_PORTRAITS[p.signatureAgent]
                    : null;
                  const isHighlighted = Boolean(
                    p && latestClutchIgn && p.ign.toLowerCase() === latestClutchIgn
                  );

                  return (
                    <div
                      key={role}
                      className={`relative h-[54px] rounded-[4px] overflow-hidden border flex items-center justify-between gap-2 px-2.5 transition-colors ${
                        isHighlighted
                          ? 'border-[#e2b714] bg-[#14171f]/90 shadow-[0_0_16px_-4px_rgba(226,183,20,0.5)]'
                          : 'border-white/[0.11] bg-[#070b12]/80'
                      }`}
                    >
                      <div
                        className="absolute inset-y-0 left-0 w-[3px] z-20"
                        style={{ backgroundColor: isHighlighted ? '#e2b714' : roleColor }}
                        aria-hidden
                      />
                      {agentPortrait && (
                        <img
                          src={agentPortrait}
                          alt=""
                          aria-hidden="true"
                          referrerPolicy="no-referrer"
                          className={`pointer-events-none select-none absolute right-[-6%] top-[-20%] h-[185%] w-auto max-w-none object-contain ${
                            isHighlighted ? 'opacity-65' : 'opacity-40'
                          }`}
                        />
                      )}
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            'linear-gradient(90deg, rgba(6,10,17,0.92) 0%, rgba(6,10,17,0.68) 58%, rgba(6,10,17,0.32) 100%)',
                        }}
                        aria-hidden
                      />

                      <div className="relative z-10 flex items-center gap-2.5 min-w-0 pl-0.5">
                        {p ? (
                          <PlayerAvatar player={p} size="sm" teamColor={teamIdentity.color} />
                        ) : (
                          <RoleEmblem role={role} size="xs" showBackground={false} />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display text-xl leading-none text-white uppercase tracking-wide truncate">
                              {p?.ign || '—'}
                            </span>
                            {p?.countryCode && <CountryFlag code={p.countryCode} size="xs" />}
                            {p?.trait && <TraitBadge trait={p.trait} iconOnly size="xs" />}
                          </div>
                          <span className="block font-mono-vct text-[10px] text-slate-300 leading-none mt-0.5 truncate">
                            {p?.signatureAgent || '—'}
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 flex flex-col items-end shrink-0">
                        {isHighlighted && (
                          <span className="font-mono-vct text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-[2px] bg-[#e2b714]/20 border border-[#e2b714]/50 text-[#fde047] mb-0.5">
                            Destaque
                          </span>
                        )}
                        <span
                          className="font-mono-vct text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: roleColor }}
                        >
                          {ROLE_NAMES_PT[role]}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </Card>
        </div>

        {/* RIGHT WIDE COLUMN: Timeline of Decisive Moments */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <Card padding="md">
            {/* Distinct Map Score & Decisive Moments Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-[#e2b714]">
                    Mapa {Math.min(series.bestOf, series.currentMapIndex + 1)}: {currentMap.mapName}
                  </span>
                  {isCurrentMapEnded ? (
                    <Badge tone={currentMap.playerWon ? 'green' : 'red'}>
                      Mapa (Rounds): {currentMap.playerScore}–{currentMap.opponentScore}{' '}
                      {currentMap.playerWon ? '· Vitória' : '· Derrota'}
                    </Badge>
                  ) : (
                    <Badge tone="gold">Mapa em andamento</Badge>
                  )}
                </div>

                <h3 className="font-display text-2xl sm:text-3xl leading-none text-white mt-1.5">
                  Momentos decisivos: <span className="text-emerald-400">{playerSituationsWon}</span>–
                  <span className="text-rose-400">{opponentSituationsWon}</span>{' '}
                  <span className="text-sm sm:text-base font-sans font-semibold text-slate-300">
                    (3 vitórias = mapa)
                  </span>
                </h3>
              </div>

              {/* Numbered 1 to 5 Decisive Moment Pips */}
              <div className="flex items-center gap-1.5 shrink-0">
                {Array.from({ length: 5 }).map((_, sIdx) => {
                  const ev = revealedEvents[sIdx];
                  let symbol = '•';
                  let pillClass = 'bg-[#0b0e14] border-white/10 text-slate-400';
                  if (ev) {
                    if (ev.type === 'win') {
                      symbol = '✓';
                      pillClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
                    } else {
                      symbol = '✗';
                      pillClass = 'bg-rose-500/20 border-rose-500/50 text-rose-300';
                    }
                  }
                  return (
                    <div
                      key={sIdx}
                      className={`px-2.5 py-1.5 rounded-[3px] border font-mono-vct text-xs font-bold flex items-center gap-1 ${pillClass}`}
                      title={`Momento decisivo ${sIdx + 1}`}
                    >
                      <span className="text-slate-400">{sIdx + 1}</span>
                      <span>{symbol}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual Round Score Progression Track */}
            {(() => {
              const trackSteps = buildRoundProgressionSteps(
                currentMap.events,
                revealedEventsCount,
                currentMap.playerScore,
                currentMap.opponentScore,
                isCurrentMapEnded
              );
              const totalNodes = 1 + currentMap.events.length;
              return (
                <div
                  id="round-progression-track"
                  className="mb-3.5 p-2.5 sm:p-3 rounded-[3px] bg-[#090c11] border border-white/10"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono-vct text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      Evolução do Placar · {currentMap.mapName}
                    </span>
                    <span className="font-mono-vct text-xs font-bold text-white">
                      {trackSteps[trackSteps.length - 1].pScore}–{trackSteps[trackSteps.length - 1].oScore}
                      {isCurrentMapEnded ? ' Final' : ' Parcial'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                    {Array.from({ length: totalNodes }).map((_, idx) => {
                      const step = trackSteps[idx];
                      const isLast = idx === totalNodes - 1;
                      const isCurrentHead = idx === trackSteps.length - 1;
                      const chipCls = !step
                        ? 'bg-[#0d1118] border-white/10 text-slate-500 border-dashed'
                        : step.type === 'start'
                        ? 'bg-[#11151d] border-white/20 text-slate-200'
                        : step.type === 'win'
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                        : 'bg-rose-500/15 border-rose-500/50 text-rose-300';

                      return (
                        <React.Fragment key={idx}>
                          <div
                            className={`px-2 py-1 rounded-[3px] border font-mono-vct text-xs flex flex-col items-center min-w-[50px] shrink-0 transition-all ${chipCls} ${
                              isCurrentHead ? 'ring-1 ring-white/40' : ''
                            }`}
                          >
                            <span className="text-[10px] opacity-80 leading-none">
                              {step ? step.label : `#${idx}`}
                            </span>
                            <span className="font-bold leading-tight mt-0.5 tabular-nums">
                              {step ? `${step.pScore}–${step.oScore}` : '--'}
                            </span>
                          </div>
                          {!isLast && (
                            <div
                              className={`h-[2px] flex-1 min-w-[10px] rounded-full ${
                                trackSteps[idx + 1]
                                  ? trackSteps[idx + 1].type === 'win'
                                    ? 'bg-emerald-400/70'
                                    : 'bg-rose-400/70'
                                  : 'bg-white/10'
                              }`}
                              aria-hidden
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Event Cards Timeline (3px left accent bar + subtle ~8% tinted background) */}
            <div className="flex flex-col gap-3">
              {revealedEvents.map((event, eIdx) => {
                const isWin = event.type === 'win';
                const tagMatch = event.text.match(/^(\[[A-ZÀ-Ú\s]+\])\s*(.*)$/);
                const traitTag = tagMatch ? tagMatch[1].replace('[', '').replace(']', '') : null;
                const cleanText = tagMatch ? tagMatch[2] : event.text;

                return (
                  <motion.div
                    key={event.id || eIdx}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={`rounded-[3px] border border-white/10 border-l-[3px] p-3.5 ${
                      isWin
                        ? 'border-l-emerald-400 bg-emerald-500/[0.08]'
                        : 'border-l-rose-400 bg-rose-500/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono-vct text-xs font-bold uppercase ${
                            isWin ? 'text-emerald-300' : 'text-rose-300'
                          }`}
                        >
                          #{eIdx + 1} · {event.situationTitle || (isWin ? 'Ponto conquistado' : 'Ponto adversário')}
                        </span>
                        {traitTag && <Badge tone="gold">{traitTag}</Badge>}
                      </div>
                      <span className="font-mono-vct text-xs text-slate-300">
                        Round {event.roundNumber}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base text-slate-100 leading-relaxed">
                      {cleanText}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Optional Map Scoreboard Accordion when map ends */}
            {isCurrentMapEnded && currentMap.playerPerformances && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowCurrentMapStats(!showCurrentMapStats)}
                  className="text-xs font-mono-vct font-bold text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-[#e2b714]" />
                  <span>
                    {showCurrentMapStats
                      ? 'Ocultar estatísticas individuais do mapa'
                      : 'Ver estatísticas individuais do mapa (K/D/A & ACS)'}
                  </span>
                  {showCurrentMapStats ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showCurrentMapStats && (
                  <div className="mt-3 p-3 rounded-xl bg-[#0b0e14] border border-white/10 space-y-2 animate-fadeIn">
                    <div className="flex justify-between font-mono-vct text-xs text-slate-300 font-bold uppercase pb-1.5 border-b border-white/10">
                      <span>Jogador</span>
                      <span>K / D / A · ACS</span>
                    </div>
                    {currentMap.playerPerformances.map((perf, pIdx) => {
                      const playerObj = Object.values(lineup).find(p => p?.id === perf.playerId);
                      return (
                        <div
                          key={pIdx}
                          className="flex items-center justify-between text-xs sm:text-sm font-mono-vct py-1.5 px-2.5 rounded-lg bg-white/[0.03]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{perf.ign}</span>
                            {playerObj?.trait && <TraitBadge trait={playerObj.trait} size="xs" />}
                            <span className="text-xs text-slate-300">{perf.signatureAgent}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-slate-200">
                              {perf.kills}/{perf.deaths}/{perf.assists}
                            </span>
                            <span className="font-bold text-[#e2b714] w-16 text-right">
                              {perf.acs} ACS
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* STICKY BOTTOM ACTION BAR */}
          <div className="sticky bottom-2 md:bottom-4 z-30">
            <Card padding="sm" className="bg-[#0b0e14]/95 border-white/15 flex flex-wrap items-center justify-between gap-2 md:gap-3">
              <div className="hidden sm:block text-xs sm:text-sm text-slate-300 px-1">
                {isCurrentMapEnded ? (
                  <span>
                    <strong className={currentMap.playerWon ? 'text-emerald-400' : 'text-rose-400'}>
                      {currentMap.playerWon ? 'Mapa vencido!' : 'Mapa perdido.'}
                    </strong>{' '}
                    Placar final de rounds: {currentMap.playerScore}–{currentMap.opponentScore}.
                  </span>
                ) : (
                  <span>
                    Avance para revelar o próximo momento decisivo de{' '}
                    <strong className="text-white">{currentMap.mapName}</strong>.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {!isCurrentMapEnded ? (
                  <>
                    <SecondaryButton
                      id="instant-map-btn"
                      size="md"
                      onClick={handleInstantMap}
                      title="Revelar todos os momentos restantes deste mapa"
                    >
                      <FastForward className="w-4 h-4" />
                      <span>Simular restante</span>
                    </SecondaryButton>

                    <PrimaryButton
                      id="next-round-btn"
                      size="md"
                      onClick={handleNextEvent}
                      className="flex-1 sm:flex-initial"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Próximo round</span>
                    </PrimaryButton>
                  </>
                ) : (
                  <PrimaryButton
                    id="continue-series-btn"
                    size="md"
                    onClick={handleNextEvent}
                    className="w-full sm:w-auto"
                  >
                    <span>
                      {willCurrentMapDecideSeries
                        ? 'Ver resultado da série'
                        : 'Ir para o próximo mapa'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </PrimaryButton>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
      )}

      {/* Grand Final Championship Victory Screen */}
      {isChampionshipWon && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <Card
            variant="modal"
            padding="lg"
            cutCorner
            className="w-full max-w-2xl text-center text-white my-auto animate-popIn relative overflow-hidden"
            style={{
              borderColor: frameId !== 'default' ? frameMeta.borderColor : 'rgba(226, 183, 20, 0.5)',
              boxShadow: frameId !== 'default' ? frameMeta.glowShadow : undefined,
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{
                background: frameId !== 'default' ? frameMeta.topStripGradient : '#e2b714',
              }}
              aria-hidden
            />

            <div className="flex items-center justify-center gap-2 text-xs font-mono-vct font-bold text-[#e2b714] uppercase tracking-widest mb-1.5">
              <TeamCrest emblemId={teamIdentity.emblemId} color={teamIdentity.color} size="xs" />
              <span>{teamIdentity.name} · Título Mundial</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-wide uppercase leading-none">
              Campeão do Champions
            </h2>
            <p className="text-sm text-slate-300 mt-1 mb-5">
              {series.playerWins}–{series.opponentWins} na Grande Final sobre {series.opponent.name}.
            </p>

            {/* All 5 Champions side by side with Crisp Agent Backdrops */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-5">
              {ROLE_ORDER.map(role => {
                const p = lineup[role];
                if (!p) return null;
                const isMvp = tournamentMvp?.player.id === p.id;
                const agentBg = p.signatureAgent ? AGENT_FULL_PORTRAITS[p.signatureAgent] : null;
                return (
                  <div
                    key={role}
                    className={`relative overflow-hidden surface-sub p-2 flex flex-col items-center gap-1 border-b-2 ${
                      isMvp ? 'border-[#e2b714]' : 'border-white/15'
                    }`}
                    style={{ borderBottomColor: isMvp ? '#e2b714' : ROLE_COLORS[role] }}
                  >
                    {agentBg && (
                      <img
                        src={agentBg}
                        alt=""
                        aria-hidden="true"
                        referrerPolicy="no-referrer"
                        className="pointer-events-none select-none absolute inset-x-0 top-[-15%] mx-auto h-[145%] w-auto max-w-none object-contain opacity-30"
                      />
                    )}
                    <div className="relative z-10">
                      <PlayerAvatar player={p} size="md" teamColor={teamIdentity.color} />
                    </div>
                    <span className="relative z-10 font-display text-base leading-none text-white uppercase tracking-wide truncate max-w-full">
                      {p.ign}
                    </span>
                    <span className="relative z-10 text-[10px] font-mono-vct text-slate-300 uppercase">
                      {isMvp ? 'MVP' : ROLE_NAMES_PT[role]}
                    </span>
                  </div>
                );
              })}
            </div>

            {tournamentMvp && (
              <div className="relative overflow-hidden rounded-[4px] bg-[#070b12] border border-[#e2b714]/45 p-4 mb-5 text-left">
                {tournamentMvp.player.signatureAgent &&
                  AGENT_FULL_PORTRAITS[tournamentMvp.player.signatureAgent] && (
                    <img
                      src={AGENT_FULL_PORTRAITS[tournamentMvp.player.signatureAgent]}
                      alt=""
                      aria-hidden="true"
                      referrerPolicy="no-referrer"
                      className="pointer-events-none select-none absolute right-[-4%] top-[-18%] h-[185%] w-auto max-w-none object-contain opacity-40"
                    />
                  )}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(7,11,18,0.95) 0%, rgba(7,11,18,0.78) 58%, rgba(7,11,18,0.45) 100%)',
                  }}
                  aria-hidden
                />

                <div className="relative z-10 flex items-center justify-between gap-2 mb-2.5">
                  <Badge tone="gold">
                    <Award className="w-3.5 h-3.5" />
                    MVP da Campanha
                  </Badge>
                  <span className="text-xs font-mono-vct text-slate-200">
                    {ROLE_NAMES_PT[tournamentMvp.player.primaryRole]}
                  </span>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <PlayerAvatar
                      player={tournamentMvp.player}
                      size="lg"
                      teamColor={teamIdentity.color}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-3xl leading-none uppercase tracking-wide text-white">
                          {tournamentMvp.player.ign}
                        </h3>
                        {tournamentMvp.player.countryCode && (
                          <CountryFlag code={tournamentMvp.player.countryCode} size="xs" />
                        )}
                        {tournamentMvp.player.trait && (
                          <TraitBadge trait={tournamentMvp.player.trait} size="sm" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap mt-1">
                        <span>{tournamentMvp.player.name}</span>
                        <span>·</span>
                        <span className="text-amber-300 font-semibold">
                          {tournamentMvp.player.signatureAgent}
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1.5 text-slate-200">
                          <TeamLogo teamName={tournamentMvp.player.team} size="xs" />
                          <span>
                            {tournamentMvp.player.team} '{tournamentMvp.player.year.toString().slice(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[#06090f]/85 p-2.5 rounded-[3px] border border-white/15 text-center shrink-0">
                    <div className="px-2">
                      <span className="text-xs uppercase font-semibold text-slate-400 block">ACS</span>
                      <span className="text-base font-bold text-amber-400 font-mono-vct">
                        {tournamentMvp.acs}
                      </span>
                    </div>
                    <div className="px-2 border-x border-white/10">
                      <span className="text-xs uppercase font-semibold text-slate-400 block">K/D</span>
                      <span className="text-base font-bold text-emerald-400 font-mono-vct">
                        {tournamentMvp.kdRatio}
                      </span>
                    </div>
                    <div className="px-2">
                      <span className="text-xs uppercase font-semibold text-slate-400 block">Clutches</span>
                      <span className="text-base font-bold text-sky-400 font-mono-vct">
                        {tournamentMvp.clutchesWon}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-5">
              <SecondaryButton
                size="md"
                onClick={() => setShowScoreboardModal(!showScoreboardModal)}
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>
                    {showScoreboardModal
                      ? 'Ocultar placar do time'
                      : 'Ver placar dos 5 jogadores'}
                  </span>
                </span>
                {showScoreboardModal ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </SecondaryButton>

              {showScoreboardModal && (
                <div className="mt-2 bg-[#090c11] p-3 rounded-[3px] border border-white/10 text-left space-y-1.5">
                  <div className="grid grid-cols-12 text-xs font-mono-vct text-slate-300 uppercase pb-1.5 border-b border-white/10">
                    <span className="col-span-5">Jogador</span>
                    <span className="col-span-2 text-center">K / D</span>
                    <span className="col-span-2 text-center">K/D</span>
                    <span className="col-span-3 text-right">ACS Médio</span>
                  </div>
                  {teamPerformances.map(perf => {
                    const isMvp = tournamentMvp?.player.id === perf.playerId;
                    return (
                      <div
                        key={perf.playerId}
                        className={`grid grid-cols-12 items-center text-xs font-mono-vct py-1.5 px-2.5 rounded-[2px] ${
                          isMvp
                            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200'
                            : 'bg-white/[0.03] text-slate-200'
                        }`}
                      >
                        <div className="col-span-5 flex items-center gap-1.5 truncate">
                          {isMvp && <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          <TeamLogo teamName={lineup[perf.role]?.team || ''} size="xs" />
                          <span className="font-bold text-white truncate">{perf.ign}</span>
                        </div>
                        <span className="col-span-2 text-center text-slate-300">
                          {perf.kills}/{perf.deaths}
                        </span>
                        <span
                          className={`col-span-2 text-center font-bold ${
                            perf.kdRatio >= 1 ? 'text-emerald-400' : 'text-slate-300'
                          }`}
                        >
                          {perf.kdRatio}
                        </span>
                        <span className="col-span-3 text-right font-bold text-amber-400">
                          {perf.acs} ACS
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <RunSummaryPanel bonusSummaries={runBonusSummaries} summaryLine={runSummaryLine} />

            <ShareResultActions
              seed={seed}
              seedCopied={seedCopied}
              isDownloadingPng={isDownloadingPng}
              onCopySeedUrl={onCopySeedUrl}
              onDownloadPng={handleDownloadResultPng}
            />

            <PrimaryButton
              id="victory-new-draft-btn"
              size="lg"
              onClick={() => {
                playSelectSound();
                onResetTournament();
              }}
              className="w-full"
            >
              Jogar novo draft
            </PrimaryButton>
          </Card>
        </div>
      )}

      {/* Tournament Elimination Screen */}
      {isEliminated && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <Card variant="modal" padding="lg" cutCorner className="border-rose-500/40 w-full max-w-lg text-center text-white my-auto animate-popIn relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-[#ff4655]" aria-hidden />

            <h2 className="text-6xl font-display font-bold text-[#ff4655] tracking-wider uppercase leading-none mt-1">
              GG.
            </h2>

            <p className="text-sm sm:text-base text-slate-200 mt-2 mb-5 flex items-center justify-center gap-2 flex-wrap">
              <span>
                {currentStage === 'group'
                  ? 'Caiu nos Grupos'
                  : currentStage === 'quarters'
                  ? 'Caiu nas Quartas'
                  : currentStage === 'semis'
                  ? 'Caiu nas Semis'
                  : 'Vice-campeão na Final'}{' '}
                ({series.playerWins}–{series.opponentWins}) pra
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#090c11] border border-white/10 text-white font-bold">
                <TeamLogo
                  teamName={series.opponent.name}
                  shortName={series.opponent.tag}
                  logoUrl={series.opponent.logoUrl}
                  primaryColor={series.opponent.logoColor}
                  size="xs"
                />
                {series.opponent.name}
              </span>
            </p>

            {tournamentMvp && (
              <div className="rounded-[3px] bg-[#090c11] border border-white/10 p-3.5 mb-4 text-left flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <PlayerAvatar player={tournamentMvp.player} size="sm" />
                  <div>
                    <span className="text-xs font-mono-vct text-slate-300 block">Destaque da line</span>
                    <strong className="text-sm text-white">{tournamentMvp.player.ign}</strong>
                  </div>
                </div>
                <span className="text-xs font-mono-vct text-amber-400 font-bold">
                  {tournamentMvp.acs} ACS · {tournamentMvp.kdRatio} K/D
                </span>
              </div>
            )}

            <div className="mb-5">
              <SecondaryButton
                size="md"
                onClick={() => setShowScoreboardModal(!showScoreboardModal)}
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-rose-400" />
                  <span>
                    {showScoreboardModal
                      ? 'Ocultar placar do time'
                      : 'Ver placar dos 5 jogadores'}
                  </span>
                </span>
                {showScoreboardModal ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </SecondaryButton>

              {showScoreboardModal && (
                <div className="mt-2 bg-[#090c11] p-3 rounded-[3px] border border-white/10 text-left space-y-1.5">
                  <div className="grid grid-cols-12 text-xs font-mono-vct text-slate-300 uppercase pb-1.5 border-b border-white/10">
                    <span className="col-span-5">Jogador</span>
                    <span className="col-span-2 text-center">K / D</span>
                    <span className="col-span-2 text-center">K/D</span>
                    <span className="col-span-3 text-right">ACS</span>
                  </div>
                  {teamPerformances.map(perf => (
                    <div
                      key={perf.playerId}
                      className="grid grid-cols-12 items-center text-xs font-mono-vct py-1.5 px-2.5 rounded-[2px] bg-white/[0.03]"
                    >
                      <span className="col-span-5 font-bold text-white truncate">{perf.ign}</span>
                      <span className="col-span-2 text-center text-slate-300">
                        {perf.kills}/{perf.deaths}
                      </span>
                      <span className="col-span-2 text-center font-bold text-slate-200">
                        {perf.kdRatio}
                      </span>
                      <span className="col-span-3 text-right font-bold text-rose-400">
                        {perf.acs} ACS
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <RunSummaryPanel bonusSummaries={runBonusSummaries} summaryLine={runSummaryLine} />

            <ShareResultActions
              seed={seed}
              seedCopied={seedCopied}
              isDownloadingPng={isDownloadingPng}
              onCopySeedUrl={onCopySeedUrl}
              onDownloadPng={handleDownloadResultPng}
            />

            <PrimaryButton
              id="eliminated-retry-btn"
              size="lg"
              onClick={() => {
                playSelectSound();
                onResetTournament();
              }}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Montar nova line</span>
            </PrimaryButton>
          </Card>
        </div>
      )}
    </div>
  );
};
