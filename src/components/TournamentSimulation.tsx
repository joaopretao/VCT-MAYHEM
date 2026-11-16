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
  Sparkles,
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
} from '../types';
import {
  generateTournamentSeries,
  simulateSingleMap,
  calculateTeamStats,
  calculateTournamentMvp,
  aggregateTournamentPerformances,
} from '../utils/simulation';
import {
  playRoundWinSound,
  playRoundLossSound,
  playVictoryFanfare,
  playEliminationSound,
  playSelectSound,
} from '../utils/audio';
import { ROLE_NAMES_PT, ROLE_COLORS } from '../data/roleIcons';
import { StageQualifiedScreen } from './StageQualifiedScreen';
import { TeamLogo } from './TeamLogo';
import { TraitBadge } from './TraitBadge';
import { RoleEmblem } from './RoleEmblem';
import { ROLE_ORDER } from './roleOrder';
import { Confetti } from './Confetti';
import { Card, Badge, PrimaryButton, SecondaryButton } from './ui';

interface TournamentSimulationProps {
  lineup: Lineup;
  difficulty: Difficulty;
  onResetTournament: () => void;
  onSaveCampaign: (history: CampaignHistory) => void;
}

const STAGES: TournamentStage[] = ['group', 'quarters', 'semis', 'finals'];

export const TournamentSimulation: React.FC<TournamentSimulationProps> = ({
  lineup,
  difficulty,
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

  const teamStats = calculateTeamStats(lineup);
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

    const firstMap = simulateSingleMap(lineup, newSeries.opponent.rating, 0);
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

    const updatedMaps = [...series.maps, currentMap];
    const newAllTournamentMaps = [...allTournamentMaps, currentMap];
    setAllTournamentMaps(newAllTournamentMaps);

    const playerWins = updatedMaps.filter(m => m.playerWon).length;
    const opponentWins = updatedMaps.filter(m => !m.playerWon).length;
    const targetWins = Math.ceil(series.bestOf / 2);

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

    if (seriesOver) {
      setIsSeriesDecided(true);

      const performances = aggregateTournamentPerformances(lineup, newAllTournamentMaps);
      setTeamPerformances(performances);

      const mvp = calculateTournamentMvp(lineup, newAllTournamentMaps);
      setTournamentMvp(mvp);

      if (isSeriesWon) {
        if (currentStageIndex === STAGES.length - 1) {
          playVictoryFanfare();
          setIsChampionshipWon(true);
          saveCampaignRecord(true, currentStage, mvp, performances, playerWins, opponentWins);
        } else {
          setShowQualifiedScreen(true);
        }
      } else {
        playEliminationSound();
        setIsEliminated(true);
        saveCampaignRecord(false, currentStage, mvp, performances, playerWins, opponentWins);
      }
    } else {
      const nextMap = simulateSingleMap(
        lineup,
        series.opponent.rating,
        updatedSeries.currentMapIndex,
        updatedMaps.map(m => m.mapName)
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
    performances: PlayerPerformance[],
    finalPlayerWins?: number,
    finalOpponentWins?: number
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
    };

    onSaveCampaign(record);
  };

  const handleNextStageFromScreen = () => {
    setShowQualifiedScreen(false);
    setCurrentStageIndex(prev => prev + 1);
  };

  if (showQualifiedScreen) {
    return <StageQualifiedScreen stage={currentStage} onNextStage={handleNextStageFromScreen} />;
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
    <div className="flex flex-col gap-4 pb-4">
      <Confetti fire={isChampionshipWon} />

      {/* TOP FULL-WIDTH SCOREBOARD */}
      <Card padding="md" className="w-full">
        {/* Small Stage & Format Labels */}
        <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
          <Badge tone="red">{series.stageTitle}</Badge>
          <Badge tone="neutral">Série · Melhor de {series.bestOf}</Badge>
        </div>

        {/* SEU ELENCO vs SÉRIE SCORE vs ADVERSÁRIO (Full Name, up to 2 lines, never truncated) */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left: Seu Elenco */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#ff4655]/15 border border-[#ff4655]/40 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-[#ff4655]" />
            </div>
            <div>
              <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-[#38bdf8] block">
                Sua Equipe
              </span>
              <h2 className="font-display text-3xl leading-none text-white uppercase tracking-wide">
                SEU ELENCO
              </h2>
              <span className="font-mono-vct text-xs text-slate-300 mt-0.5 block">
                Força Geral: <strong className="text-slate-400">Oculta na Run</strong>
              </span>
            </div>
          </div>

          {/* Center: Large Series Score */}
          <div className="glass-film flex flex-col items-center justify-center px-6 py-2 rounded-xl mx-auto">
            <span className="font-mono-vct text-xs font-bold uppercase tracking-widest text-slate-300 mb-0.5">
              Placar da Série
            </span>
            <div className="font-mono-vct text-3xl sm:text-4xl font-black tracking-wider leading-none flex items-center gap-3">
              <span className={displayedPlayerWins > displayedOpponentWins ? 'text-emerald-400' : 'text-white'}>
                {displayedPlayerWins}
              </span>
              <span className="text-slate-500 text-2xl">:</span>
              <span className={displayedOpponentWins > displayedPlayerWins ? 'text-rose-400' : 'text-white'}>
                {displayedOpponentWins}
              </span>
            </div>
          </div>

          {/* Right: Adversário (Full Name allowed to wrap up to 2 lines) */}
          <div className="flex items-center md:justify-end gap-3 md:text-right">
            <div className="order-2 md:order-1 min-w-0">
              <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-rose-400 block">
                Adversário
              </span>
              <h2 className="font-display text-2xl sm:text-3xl leading-tight text-white uppercase tracking-wide break-words line-clamp-2">
                {series.opponent.name}
              </h2>
              <span className="font-mono-vct text-xs text-slate-300 mt-0.5 block">
                Força Geral: <strong className="text-white">{series.opponent.rating} OVR</strong>
              </span>
            </div>
            <div className="order-1 md:order-2 w-12 h-12 rounded-xl bg-[#0b0e14] border border-white/10 p-1.5 flex items-center justify-center shrink-0">
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
      </Card>

      {/* BELOW: TWO TOP-ALIGNED COLUMNS (No stretched empty space) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT NARROW COLUMN: 5 Roster Players + Map Markers (M1/M2/M3) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Map Markers Card */}
          <Card padding="md">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-slate-200">
                Mapas da Série
              </span>
              <span className="font-mono-vct text-xs text-slate-300">
                Vence quem ganhar {targetWinsToCloseSeries}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
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
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center ${boxCls}`}
                  >
                    <span className="font-mono-vct text-xs font-bold uppercase">
                      M{idx + 1} {mapData ? `· ${mapData.mapName}` : isCurrentSlot ? `· ${currentMap.mapName}` : ''}
                    </span>
                    <span className="font-mono-vct text-sm font-bold mt-1 text-white">
                      {scoreLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 5 Players Roster Card */}
          <Card padding="md">
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
                    className="glass-film px-3 py-2 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <RoleEmblem role={role} size="xs" showBackground={false} />
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
                      className={`px-2.5 py-1.5 rounded-xl border font-mono-vct text-xs font-bold flex items-center gap-1 ${pillClass}`}
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
                    className={`rounded-xl border border-white/10 border-l-[3px] p-3.5 ${
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
          <div className="sticky bottom-4 z-30">
            <Card padding="sm" className="bg-[#0b0e14]/95 border-white/15 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-slate-300 px-1">
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

      {/* Grand Final Championship Victory Modal */}
      {isChampionshipWon && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <Card padding="lg" className="border-amber-500/40 w-full max-w-xl text-center text-white my-auto animate-popIn">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-3 text-amber-400">
              <Trophy className="w-8 h-8" />
            </div>

            <span className="text-xs font-mono-vct font-bold text-amber-400 uppercase tracking-widest block">
              VALORANT CHAMPIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-wide mt-1 mb-2 uppercase">
              CAMPEÕES MUNDIAIS!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-5 max-w-md mx-auto">
              Sua escalação personalizada conquistou o troféu mundial com química tática e precisão sob pressão!
            </p>

            {tournamentMvp && (
              <div className="rounded-xl bg-[#0b0e14] border border-amber-500/40 p-4 sm:p-5 mb-5 text-left">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge tone="gold">
                    <Award className="w-3.5 h-3.5" />
                    MVP DA CAMPANHA
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
                      <span className="text-amber-400 font-semibold">
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

                  <div className="grid grid-cols-3 gap-2 bg-[#111723] p-2.5 rounded-xl border border-white/10 text-center shrink-0">
                    <div className="px-2">
                      <span className="text-xs uppercase font-semibold text-slate-300 block">ACS</span>
                      <span className="text-base font-bold text-amber-400 font-mono-vct">
                        {tournamentMvp.acs}
                      </span>
                    </div>
                    <div className="px-2 border-x border-white/10">
                      <span className="text-xs uppercase font-semibold text-slate-300 block">K/D</span>
                      <span className="text-base font-bold text-emerald-400 font-mono-vct">
                        {tournamentMvp.kdRatio}
                      </span>
                    </div>
                    <div className="px-2">
                      <span className="text-xs uppercase font-semibold text-slate-300 block">Clutches</span>
                      <span className="text-base font-bold text-sky-400 font-mono-vct">
                        {tournamentMvp.clutchesWon}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm italic text-amber-200/90 mt-3 pt-2.5 border-t border-white/10">
                  "{tournamentMvp.highlightText}"
                </p>
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
                      ? 'Ocultar estatísticas do elenco'
                      : 'Ver estatísticas de todos os 5 jogadores'}
                  </span>
                </span>
                {showScoreboardModal ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </SecondaryButton>

              {showScoreboardModal && (
                <div className="mt-2 bg-[#0b0e14] p-3 rounded-xl border border-white/10 text-left space-y-1.5">
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
                        className={`grid grid-cols-12 items-center text-xs font-mono-vct py-1.5 px-2.5 rounded-lg ${
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

            <PrimaryButton
              id="victory-new-draft-btn"
              size="lg"
              onClick={() => {
                playSelectSound();
                onResetTournament();
              }}
              className="w-full"
            >
              MONTAR NOVO ELENCO (DRAFT)
            </PrimaryButton>
          </Card>
        </div>
      )}

      {/* Tournament Elimination Screen */}
      {isEliminated && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <Card padding="lg" className="border-rose-500/40 w-full max-w-lg text-center text-white my-auto animate-popIn">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-3 text-rose-400">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <span className="text-xs font-mono-vct font-bold text-rose-400 uppercase tracking-widest block">
              FIM DA LINHA
            </span>
            <h2 className="text-3xl font-display font-bold text-white tracking-wide mt-1 mb-2 uppercase">
              Equipe Eliminada
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-5 flex items-center justify-center gap-2 flex-wrap">
              <span>
                Sua equipe foi superada ({series.playerWins}–{series.opponentWins}) por
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0b0e14] border border-white/10 text-white font-bold">
                <TeamLogo
                  teamName={series.opponent.name}
                  shortName={series.opponent.tag}
                  logoUrl={series.opponent.logoUrl}
                  primaryColor={series.opponent.logoColor}
                  size="xs"
                />
                {series.opponent.name}
              </span>
              <span>na {series.stageTitle}.</span>
            </p>

            {tournamentMvp && (
              <div className="rounded-xl bg-[#0b0e14] border border-white/10 p-4 mb-4 text-left">
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <Badge tone="gold">
                    <Award className="w-3.5 h-3.5" />
                    Destaque: {tournamentMvp.player.ign}
                  </Badge>
                  <span className="text-xs font-mono-vct text-amber-400 font-bold">
                    {tournamentMvp.acs} ACS · {tournamentMvp.kdRatio} K/D
                  </span>
                </div>
                <p className="text-xs sm:text-sm italic text-slate-300">
                  "{tournamentMvp.highlightText}"
                </p>
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
                      ? 'Ocultar estatísticas do elenco'
                      : 'Ver estatísticas do elenco'}
                  </span>
                </span>
                {showScoreboardModal ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </SecondaryButton>

              {showScoreboardModal && (
                <div className="mt-2 bg-[#0b0e14] p-3 rounded-xl border border-white/10 text-left space-y-1.5">
                  <div className="grid grid-cols-12 text-xs font-mono-vct text-slate-300 uppercase pb-1.5 border-b border-white/10">
                    <span className="col-span-5">Jogador</span>
                    <span className="col-span-2 text-center">K / D</span>
                    <span className="col-span-2 text-center">K/D</span>
                    <span className="col-span-3 text-right">ACS</span>
                  </div>
                  {teamPerformances.map(perf => (
                    <div
                      key={perf.playerId}
                      className="grid grid-cols-12 items-center text-xs font-mono-vct py-1.5 px-2.5 rounded-lg bg-white/[0.03]"
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
              <span>Montar Novo Elenco</span>
            </PrimaryButton>
          </Card>
        </div>
      )}
    </div>
  );
};
