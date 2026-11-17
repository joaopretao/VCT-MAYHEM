import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  ArrowRight,
  Play,
  FastForward,
  RotateCcw,
  ShieldAlert,
  Award,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
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
import { StageQualifiedScreen } from './StageQualifiedScreen';
import { TeamLogo } from './TeamLogo';
import { TraitBadge } from './TraitBadge';
import { RoleEmblem } from './RoleEmblem';
import { PlayerAvatar } from './PlayerAvatar';
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
        <span className="font-mono-vct text-xs text-slate-400">
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

interface TournamentSimulationProps {
  lineup: Lineup;
  difficulty: Difficulty;
  selectedBonuses?: MayhemBonus[];
  onResetTournament: () => void;
  onSaveCampaign: (history: CampaignHistory) => void;
}

const STAGES: TournamentStage[] = ['group', 'quarters', 'semis', 'finals'];

export const TournamentSimulation: React.FC<TournamentSimulationProps> = ({
  lineup,
  difficulty,
  selectedBonuses = [],
  onResetTournament,
  onSaveCampaign,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [showQualifiedScreen, setShowQualifiedScreen] = useState<boolean>(false);
  const [series, setSeries] = useState<SeriesMatch | null>(null);
  const [currentMap, setCurrentMap] = useState<MapGame | null>(null);
  const [allTournamentMaps, setAllTournamentMaps] = useState<MapGame[]>([]);
  const [usedOpponentIds, setUsedOpponentIds] = useState<string[]>([]);
  const [revealedEventsCount, setRevealedEventsCount] = useState<number>(0);
  const [isSeriesDecided, setIsSeriesDecided] = useState<boolean>(false);
  const [isChampionshipWon, setIsChampionshipWon] = useState<boolean>(false);
  const [isEliminated, setIsEliminated] = useState<boolean>(false);
  const [showScoreboardModal, setShowScoreboardModal] = useState<boolean>(false);
  const [showCurrentMapStats, setShowCurrentMapStats] = useState<boolean>(false);
  const [tournamentMvp, setTournamentMvp] = useState<TournamentMvpStats | null>(null);
  const [teamPerformances, setTeamPerformances] = useState<PlayerPerformance[]>([]);
  const [lostPreviousMapInSeries, setLostPreviousMapInSeries] = useState<boolean>(false);
  const [secondChanceUsedCount, setSecondChanceUsedCount] = useState<number>(0);
  const [secondChanceNotice, setSecondChanceNotice] = useState<string | null>(null);
  const [runBonusSummaries, setRunBonusSummaries] = useState<BonusUsageSummary[]>([]);
  const [runSummaryLine, setRunSummaryLine] = useState<string>('');

  const teamStats = calculateTeamStats(lineup, selectedBonuses);
  const currentStage = STAGES[currentStageIndex];

  useEffect(() => {
    initSeriesForStage(currentStage);
  }, [currentStageIndex]);

  const initSeriesForStage = (stage: TournamentStage) => {
    const newSeries = generateTournamentSeries(stage, difficulty, usedOpponentIds);
    if (newSeries.opponent.id) {
      setUsedOpponentIds(prev => [...prev, newSeries.opponent.id!]);
    }
    setSeries(newSeries);
    setIsSeriesDecided(false);
    setShowCurrentMapStats(false);
    setLostPreviousMapInSeries(false);
    setSecondChanceNotice(null);

    const firstMap = simulateSingleMap(lineup, newSeries.opponent.rating, 0, [], {
      bonuses: selectedBonuses,
      lostPreviousMap: false,
    });
    setCurrentMap(firstMap);
    setRevealedEventsCount(1);
  };

  useEffect(() => {
    if (!currentMap || revealedEventsCount === 0) return;
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
        { bonuses: selectedBonuses, lostPreviousMap: true }
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
        if (currentStageIndex === STAGES.length - 1) {
          playVictoryFanfare();
          setIsChampionshipWon(true);
          saveCampaignRecord(true, currentStage, mvp, playerWins, opponentWins, summaries, summaryLine);
        } else {
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
        { bonuses: selectedBonuses, lostPreviousMap: lostCurrent }
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
    const mvpPlayer = mvpStats?.player;

    const record: CampaignHistory = {
      id: `camp_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      difficulty,
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

  const handleNextStageFromScreen = () => {
    setShowQualifiedScreen(false);
    setCurrentStageIndex(prev => prev + 1);
  };

  if (showQualifiedScreen) {
    return (
      <StageQualifiedScreen
        stage={currentStage}
        lineup={lineup}
        opponentName={series?.opponent.name}
        scoreLabel={series ? `${series.playerWins}–${series.opponentWins}` : undefined}
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

  return (
    <div className="flex flex-col gap-2.5 md:gap-4 pb-4">
      <Confetti fire={isChampionshipWon} />

      {/* TOP FULL-WIDTH SCOREBOARD */}
      <Card padding="none" className="p-2.5 md:p-4 w-full">
        {/* Small Stage & Format Labels */}
        <div className="flex items-center justify-center gap-2 mb-2 md:mb-3 flex-wrap">
          <Badge tone="red">{series.stageTitle}</Badge>
          <Badge tone="neutral">MD{series.bestOf}</Badge>
          {lostPreviousMapInSeries && selectedBonuses.some(b => b.id === 'folego') && (
            <Badge tone="gold">Fôlego ativo (+3)</Badge>
          )}
        </div>

        {/* SEU ELENCO vs SÉRIE SCORE vs ADVERSÁRIO (Always horizontal 3-col so mobile stays compact) */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4">
          {/* Left: Seu Elenco */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 rounded-[3px] bg-[#ff4655]/15 border border-[#ff4655]/40 items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-[#ff4655]" />
            </div>
            <div className="min-w-0">
              <span className="hidden md:block font-mono-vct text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
                Sua Equipe
              </span>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl leading-none text-white uppercase tracking-wide truncate">
                SEU ELENCO
              </h2>
              <span className="hidden md:block font-mono-vct text-xs text-slate-300 mt-0.5">
                Força Geral: <strong className="text-slate-400">Oculta na Run</strong>
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
                {series.opponent.tag || series.opponent.name}
                <span className="hidden md:inline">
                  {series.opponent.name !== series.opponent.tag ? '' : ''}
                </span>
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

      {secondChanceNotice && (
        <div
          id="second-chance-banner"
          className="rounded-[3px] bg-[#0d1118] border border-[#38bdf8]/50 px-3.5 py-2.5 flex items-center gap-2.5 text-xs sm:text-sm font-mono-vct text-sky-200 animate-popIn"
        >
          <ShieldAlert className="w-4 h-4 text-[#38bdf8] shrink-0" />
          <span>{secondChanceNotice}</span>
        </div>
      )}

      {/* BELOW: TWO TOP-ALIGNED COLUMNS (On mobile: compact Maps strip + Live Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 md:gap-4 items-start">
        {/* LEFT NARROW COLUMN */}
        <div className="lg:col-span-4 flex flex-col gap-2.5 md:gap-4">
          {/* Map Markers Card */}
          <Card padding="none" className="p-2.5 md:p-4">
            <div className="hidden md:flex items-center justify-between gap-2 mb-3">
              <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-slate-200">
                Mapas da Série
              </span>
              <span className="font-mono-vct text-xs text-slate-300">
                Vence quem ganhar {targetWinsToCloseSeries}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 md:gap-2">
              {mapSlots.map((_, idx) => {
                const committedMap = series.maps[idx];
                const isCurrentSlot = idx === series.currentMapIndex;
                const liveFinishedMap =
                  isCurrentSlot && isCurrentMapEnded && !committedMap ? currentMap : null;
                const mapData = committedMap || liveFinishedMap;

                let boxCls = 'bg-[#0b0e14]/70 border-white/10 text-slate-400';
                let scoreLabel = isCurrentSlot ? currentMap.mapName : 'A jogar';

                if (mapData) {
                  if (mapData.playerWon) {
                    boxCls = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300';
                    scoreLabel = `${mapData.playerScore}–${mapData.opponentScore} ✓`;
                  } else {
                    boxCls = 'bg-rose-500/10 border-rose-500/40 text-rose-300';
                    scoreLabel = `${mapData.playerScore}–${mapData.opponentScore} ✗`;
                  }
                } else if (isCurrentSlot) {
                  boxCls = 'bg-[#e2b714]/10 border-[#e2b714]/60 text-[#e2b714]';
                  scoreLabel = 'Em jogo';
                }

                return (
                  <div
                    key={idx}
                    className={`p-1.5 md:p-2.5 rounded-[3px] border flex flex-col items-center justify-center text-center ${boxCls}`}
                  >
                    <span className="font-mono-vct text-xs font-bold uppercase truncate max-w-full">
                      M{idx + 1} {mapData ? `· ${mapData.mapName}` : isCurrentSlot ? `· ${currentMap.mapName}` : ''}
                    </span>
                    <span className="font-mono-vct text-xs md:text-sm font-bold mt-0.5 md:mt-1 text-white">
                      {scoreLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 5 Players Roster Card (Hidden on < lg mobile so live timeline & controls sit immediately above the fold) */}
          <Card padding="md" className="hidden lg:block">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-slate-200">
                Seu Elenco Titular
              </span>
              <span className="font-mono-vct text-xs text-slate-300">5 atletas</span>
            </div>

            <div className="flex flex-col gap-2">
              {ROLE_ORDER.map(role => {
                const p = lineup[role];
                const roleColor = ROLE_COLORS[role];
                return (
                  <div
                    key={role}
                    className="surface-sub px-2.5 py-2 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {p ? <PlayerAvatar player={p} size="xs" /> : <RoleEmblem role={role} size="xs" showBackground={false} />}
                      <span className="text-sm font-bold text-white truncate">
                        {p?.ign || '—'}
                      </span>
                      {p?.trait && <TraitBadge trait={p.trait} iconOnly size="xs" />}
                    </div>
                    <span
                      className="font-mono-vct text-xs font-bold uppercase tracking-wider shrink-0"
                      style={{ color: roleColor }}
                    >
                      {ROLE_NAMES_PT[role]}
                    </span>
                  </div>
                );
              })}
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

      {/* Grand Final Championship Victory Screen */}
      {isChampionshipWon && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <Card variant="modal" padding="lg" cutCorner className="border-[#e2b714]/50 w-full max-w-2xl text-center text-white my-auto animate-popIn relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-[#e2b714]" aria-hidden />

            <div className="flex items-center justify-center gap-2 text-xs font-mono-vct font-bold text-[#e2b714] uppercase tracking-widest mb-1">
              <Trophy className="w-4 h-4" />
              <span>VALORANT Champions · Título Mundial</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-wide uppercase leading-none">
              Campeão do Champions
            </h2>
            <p className="text-sm text-slate-300 mt-1 mb-5">
              {series.playerWins}–{series.opponentWins} na Grande Final sobre {series.opponent.name}.
            </p>

            {/* All 5 Champions side by side */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-5">
              {ROLE_ORDER.map(role => {
                const p = lineup[role];
                if (!p) return null;
                const isMvp = tournamentMvp?.player.id === p.id;
                return (
                  <div
                    key={role}
                    className={`surface-sub p-2 flex flex-col items-center gap-1 border-b-2 ${
                      isMvp ? 'border-[#e2b714]' : 'border-white/15'
                    }`}
                    style={{ borderBottomColor: isMvp ? '#e2b714' : ROLE_COLORS[role] }}
                  >
                    <PlayerAvatar player={p} size="md" />
                    <span className="text-xs font-bold text-white truncate max-w-full">
                      {p.ign}
                    </span>
                    <span className="text-xs font-mono-vct text-slate-400">
                      {isMvp ? 'MVP' : ROLE_NAMES_PT[role]}
                    </span>
                  </div>
                );
              })}
            </div>

            {tournamentMvp && (
              <div className="rounded-[3px] bg-[#090c11] border border-[#e2b714]/40 p-4 mb-5 text-left">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <Badge tone="gold">
                    <Award className="w-3.5 h-3.5" />
                    MVP da Campanha
                  </Badge>
                  <span className="text-xs font-mono-vct text-slate-300">
                    {ROLE_NAMES_PT[tournamentMvp.player.primaryRole]}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold text-white">{tournamentMvp.player.ign}</h3>
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

                  <div className="grid grid-cols-3 gap-2 bg-[#11151d] p-2.5 rounded-[3px] border border-white/10 text-center shrink-0">
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
                  <div className="grid grid-cols-12 text-xs font-mono-vct text-slate-400 uppercase pb-1.5 border-b border-white/10">
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
                    <span className="text-xs font-mono-vct text-slate-400 block">Destaque da line</span>
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
                  <div className="grid grid-cols-12 text-xs font-mono-vct text-slate-400 uppercase pb-1.5 border-b border-white/10">
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
