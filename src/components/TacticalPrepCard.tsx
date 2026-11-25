import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Crosshair,
  Shield,
  Scale,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  Sparkles,
  Check,
  Trophy,
  Ban,
  MapPin,
  Award,
} from 'lucide-react';
import {
  CompletedSeriesSummary,
  Difficulty,
  Lineup,
  MayhemBonus,
  Player,
  SeriesMatch,
  SeriesTacticBuff,
  TacticalStance,
  TournamentMvpStats,
  TournamentStage,
  UserTeamIdentity,
} from '../types';
import {
  alignOpponentRosterToSlots,
  generateOpponentScoutReport,
  getOpponentStarPlayer,
  getOpponentTeam,
  TACTICAL_STANCES,
} from '../utils/scouting';
import { AGENT_FULL_PORTRAITS, AGENT_ICONS } from '../data/agentIcons';
import { ROLE_COLORS, ROLE_NAMES_PT } from '../data/roleIcons';
import { playSelectSound } from '../utils/audio';
import { ROLE_ORDER } from './roleOrder';
import { PlayerAvatar } from './PlayerAvatar';
import { CountryFlag } from './CountryFlag';
import { RoleEmblem } from './RoleEmblem';
import { TeamLogo } from './TeamLogo';
import { TeamCrest } from './TeamCrest';
import { TraitBadge } from './TraitBadge';
import { MayhemBonusChip } from './MayhemBonusChip';
import { Badge, Card, PrimaryButton } from './ui';

interface TacticalPrepCardProps {
  series: SeriesMatch;
  lineup: Lineup;
  teamIdentity: UserTeamIdentity;
  difficulty: Difficulty;
  selectedStance: TacticalStance;
  onSelectStance: (stance: TacticalStance) => void;
  activeSeriesBuff: SeriesTacticBuff;
  selectedBonuses: MayhemBonus[];
  completedSeries: CompletedSeriesSummary[];
  runLeader: TournamentMvpStats | null;
  teamSynergy: number;
  onStartSeries: () => void;
}

const STANCE_ICON: Record<
  TacticalStance,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  aggressive: Crosshair,
  balanced: Scale,
  disciplined: Shield,
};

const BUFF_LABEL: Record<Exclude<SeriesTacticBuff, 'none'>, string> = {
  rating_boost: 'Analista ativo: +2 Força nesta série',
  pistol_prep: 'Plano de Pistol: +5% Pistol/Forçado',
  clutch_prep: 'Treino de Retake: +5% Retake/Decider',
};

const STAGE_STEPS: { id: TournamentStage; short: string; label: string }[] = [
  { id: 'group', short: 'Grupos', label: 'Fase de Grupos' },
  { id: 'quarters', short: 'Quartas', label: 'Quartas de Final' },
  { id: 'semis', short: 'Semis', label: 'Semifinais' },
  { id: 'finals', short: 'Final', label: 'Grande Final' },
];

function formatOpponentShort(opponent: SeriesMatch['opponent']): string {
  const tag = opponent.tag || opponent.name;
  if (tag.includes("'")) return tag;
  const yrMatch = opponent.name.match(/\((\d{4})\)/);
  return yrMatch ? `${tag} '${yrMatch[1].slice(2)}` : tag;
}

const AgentMiniBadge: React.FC<{ agent: string; size?: 'sm' | 'md' }> = ({
  agent,
  size = 'sm',
}) => {
  const iconUrl = agent ? AGENT_ICONS[agent] : null;
  const boxCls = size === 'md' ? 'w-8 h-8' : 'w-7 h-7';
  if (!iconUrl) {
    return (
      <div
        className={`${boxCls} rounded-[2px] bg-[#0b0e14] border border-white/10 flex items-center justify-center text-[10px] font-mono-vct text-slate-400 shrink-0`}
        title={agent || 'Agente'}
      >
        {agent ? agent.slice(0, 2).toUpperCase() : '—'}
      </div>
    );
  }
  return (
    <div
      className={`${boxCls} rounded-[2px] bg-[#0b0e14] border border-white/15 overflow-hidden shrink-0 flex items-center justify-center`}
      title={agent}
    >
      <img
        src={iconUrl}
        alt={agent}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export const TacticalPrepCard: React.FC<TacticalPrepCardProps> = ({
  series,
  lineup,
  teamIdentity,
  difficulty,
  selectedStance,
  onSelectStance,
  activeSeriesBuff,
  selectedBonuses,
  completedSeries,
  runLeader,
  teamSynergy,
  onStartSeries,
}) => {
  const isFinals = series.stage === 'finals';
  const report = useMemo(
    () => generateOpponentScoutReport(series.opponent, difficulty),
    [series.opponent, difficulty]
  );
  const realOpponentTeam = useMemo(
    () => getOpponentTeam(series.opponent),
    [series.opponent]
  );
  const opponentSlots = useMemo(
    () => alignOpponentRosterToSlots(series.opponent),
    [series.opponent]
  );
  const opponentStar = useMemo(
    () => getOpponentStarPlayer(series.opponent),
    [series.opponent]
  );

  const fallbackUserLeader: Player | null =
    runLeader?.player ||
    lineup.Duelist ||
    Object.values(lineup).find((p): p is Player => p !== null) ||
    null;

  const lowSynergyMasterPenalty = difficulty === 'master' && teamSynergy < 78;
  const currentStageIdx = STAGE_STEPS.findIndex(s => s.id === series.stage);

  const campaignMapWins = completedSeries.reduce((acc, s) => acc + s.playerWins, 0);
  const campaignMapLosses = completedSeries.reduce((acc, s) => acc + s.opponentWins, 0);

  const mapQueue =
    series.mapQueue && series.mapQueue.length > 0
      ? series.mapQueue
      : Array.from({ length: series.bestOf }, (_, i) => `Mapa ${i + 1}`);
  const bannedMaps = series.bannedMaps || [];
  const oppShort = formatOpponentShort(series.opponent);

  return (
    <div id="tactical-prep-card" className="flex flex-col gap-3 md:gap-4">
      {/* =====================================================================
          1. BROADCAST TOURNAMENT MASTHEAD & ROAD TO FINALS / BRACKET STRIP
         ===================================================================== */}
      <Card
        padding="none"
        className={`relative overflow-hidden ${
          isFinals ? 'border-[#e2b714]/45 bg-[#0e121a]' : 'border-white/10'
        }`}
      >
        {/* Top accent line */}
        <div
          className={`h-[2px] w-full ${
            isFinals
              ? 'bg-gradient-to-r from-[#e2b714]/20 via-[#e2b714] to-[#e2b714]/20'
              : 'bg-gradient-to-r from-transparent via-[#ff4655]/80 to-transparent'
          }`}
          aria-hidden
        />

        {/* Tournament Stage Progress / Road to Final */}
        <div
          className={`px-3 sm:px-5 py-2.5 border-b flex items-center justify-between gap-2 flex-wrap ${
            isFinals
              ? 'bg-[#12151e] border-[#e2b714]/20'
              : 'bg-[#0b0e14]/80 border-white/[0.07]'
          }`}
        >
          <div className="flex items-center gap-2">
            {isFinals ? (
              <>
                <Trophy className="w-4 h-4 text-[#e2b714] shrink-0" />
                <span className="font-mono-vct text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-[#e2b714]">
                  Valorant Champions · Palco Principal
                </span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-[1px] bg-[#ff4655] shrink-0" />
                <span className="font-mono-vct text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] text-slate-200">
                  Transmissão Oficial · {series.stageTitle}
                </span>
              </>
            )}
          </div>

          {/* 4-Stage Bracket Progress Strip */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full">
            {STAGE_STEPS.map((step, idx) => {
              const done = completedSeries.find(c => c.stage === step.id);
              const isCurrent = idx === currentStageIdx;
              const isPast = idx < currentStageIdx;

              return (
                <React.Fragment key={step.id}>
                  <div
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] border text-[10px] sm:text-[11px] font-mono-vct uppercase shrink-0 ${
                      isCurrent
                        ? isFinals
                          ? 'bg-[#e2b714]/15 border-[#e2b714]/60 text-[#fde047] font-bold'
                          : 'bg-[#ff4655]/15 border-[#ff4655]/60 text-white font-bold'
                        : isPast
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-[#0a0d13] border-white/[0.07] text-slate-500'
                    }`}
                  >
                    {isPast && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                    <span>{step.short}</span>
                    {done && (
                      <span className="text-[10px] text-emerald-200/90 font-bold">
                        {done.playerWins}–{done.opponentWins}
                      </span>
                    )}
                  </div>
                  {idx < STAGE_STEPS.length - 1 && (
                    <span className="text-slate-600 text-[10px] select-none">›</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Road to the Final detailed bar (EXCLUSIVE TO GRAND FINALS) */}
        {isFinals && completedSeries.length > 0 && (
          <div className="px-3 sm:px-5 py-2 bg-[#090c11]/90 border-b border-white/[0.06] flex items-center justify-between gap-2 flex-wrap">
            <span className="font-mono-vct text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400">
              Caminho até a Final
            </span>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {completedSeries.map((c, idx) => (
                <div
                  key={`${c.stage}-${idx}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono-vct text-slate-200 bg-[#11151d] border border-white/10 px-2 py-0.5 rounded-[2px]"
                >
                  <TeamLogo
                    teamName={c.opponentName}
                    shortName={c.opponentTag}
                    logoUrl={c.opponentLogoUrl}
                    primaryColor={c.opponentColor}
                    size="xs"
                  />
                  <span className="text-slate-300">{c.opponentTag}</span>
                  <span className="text-emerald-400 font-bold">
                    {c.playerWins}–{c.opponentWins}
                  </span>
                </div>
              ))}
              <span className="font-mono-vct text-[11px] text-[#e2b714] font-bold">
                Saldo: {campaignMapWins}V–{campaignMapLosses}D mapas
              </span>
            </div>
          </div>
        )}

        {/* ===================================================================
            2. MATCHUP HERO BANNER (TEAM A vs TEAM B)
           =================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          className="relative px-3.5 sm:px-6 py-4 sm:py-6 overflow-hidden"
          style={{
            background: isFinals
              ? `linear-gradient(105deg, ${teamIdentity.color}1c 0%, #0d1118 38%, #0d1118 62%, ${series.opponent.logoColor}1e 100%)`
              : `linear-gradient(105deg, ${teamIdentity.color}14 0%, #0d1118 40%, #0d1118 60%, ${series.opponent.logoColor}16 100%)`,
          }}
        >
          {/* Subtle centered brand mark watermark */}
          <img
            src="/brand/mark.png"
            alt=""
            aria-hidden="true"
            className={`pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain ${
              isFinals ? 'w-36 h-36 opacity-[0.07]' : 'w-28 h-28 opacity-[0.04]'
            }`}
          />

          <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-5">
            {/* LEFT: USER TEAM */}
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
              <TeamCrest
                emblemId={teamIdentity.emblemId}
                color={teamIdentity.color}
                size="lg"
                className="w-10 h-10 sm:w-14 sm:h-14 shrink-0"
              />
              <div className="min-w-0">
                <span className="block font-mono-vct text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
                  {isFinals ? 'Finalista · Sua Equipe' : 'Sua Equipe'}
                </span>
                <h2 className="font-display text-2xl sm:text-4xl md:text-[42px] leading-[0.95] text-white uppercase tracking-wide truncate mt-0.5">
                  {teamIdentity.name}
                </h2>
                <div className="hidden sm:flex items-center gap-2 mt-1 text-xs font-mono-vct text-slate-300 flex-wrap">
                  <span>
                    {completedSeries.length > 0
                      ? `${completedSeries.length}–0 séries · ${campaignMapWins}–${campaignMapLosses} mapas`
                      : 'Estreia na Campanha'}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">Força Oculta na Run</span>
                </div>
              </div>
            </div>

            {/* CENTER: OFFICIAL STAGE & VS EMBLEM */}
            <div className="flex flex-col items-center justify-center text-center px-1.5 sm:px-4">
              {isFinals ? (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[3px] bg-[#e2b714]/15 border border-[#e2b714]/60 flex items-center justify-center mb-1.5">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#e2b714]" />
                  </div>
                  <span className="font-display text-2xl sm:text-3xl leading-none text-[#fde047] tracking-widest uppercase">
                    FINAL
                  </span>
                  <span className="mt-1 px-2 py-0.5 rounded-[2px] bg-[#e2b714]/15 border border-[#e2b714]/45 font-mono-vct text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#fde047]">
                    MD5 · 3 Vitórias
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="px-2 py-0.5 rounded-[2px] bg-[#ff4655]/15 border border-[#ff4655]/45 font-mono-vct text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#fda4af] mb-1">
                    MD{series.bestOf}
                  </span>
                  <span className="font-display text-3xl sm:text-5xl leading-none text-slate-300/90 tracking-widest select-none">
                    VS
                  </span>
                  <span className="hidden sm:block font-mono-vct text-[10px] uppercase tracking-widest text-slate-400 mt-1">
                    Pré-Confronto
                  </span>
                </div>
              )}
            </div>

            {/* RIGHT: OPPONENT TEAM */}
            <div className="flex items-center justify-end gap-2.5 sm:gap-4 text-right min-w-0">
              <div className="min-w-0">
                <span className="block font-mono-vct text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-400">
                  {isFinals ? `Finalista · ${series.opponent.region}` : `Adversário · ${series.opponent.region}`}
                </span>
                <h2 className="font-display text-2xl sm:text-4xl md:text-[42px] leading-[0.95] text-white uppercase tracking-wide truncate mt-0.5">
                  <span className="sm:hidden">{oppShort}</span>
                  <span className="hidden sm:inline">{realOpponentTeam?.name || oppShort}</span>
                </h2>
                <div className="hidden sm:flex items-center justify-end gap-2 mt-1 text-xs font-mono-vct text-slate-300 flex-wrap">
                  <span className="text-slate-300 truncate max-w-[230px]">
                    {realOpponentTeam?.editionLabel || series.opponent.name}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-white font-bold">{series.opponent.rating} OVR</span>
                </div>
              </div>

              <div
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-[4px] bg-[#0b0e14] border p-1.5 flex items-center justify-center shrink-0"
                style={{
                  borderColor: `${series.opponent.logoColor}66`,
                  boxShadow: `0 0 18px -6px ${series.opponent.logoColor}66`,
                }}
              >
                <TeamLogo
                  teamName={series.opponent.name}
                  shortName={series.opponent.tag}
                  logoUrl={series.opponent.logoUrl}
                  primaryColor={series.opponent.logoColor}
                  size="lg"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Active Mayhem Bonuses Strip */}
          {selectedBonuses.length > 0 && (
            <div
              id="tournament-bonuses-header"
              className="relative z-10 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 flex-wrap mt-4 pt-3 border-t border-white/[0.08]"
            >
              <span className="font-mono-vct text-[11px] font-bold uppercase tracking-wider text-[#e2b714]">
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
        </motion.div>
      </Card>

      {/* =====================================================================
          3. EXCLUSIVE TO GRAND FINALS: HEADLINER SPOTLIGHT (PLAYERS TO WATCH)
         ===================================================================== */}
      {isFinals && fallbackUserLeader && opponentStar && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.06, ease: 'easeOut' }}
        >
          <Card
            padding="none"
            className="border-[#e2b714]/35 bg-[#0b0f17] overflow-hidden"
          >
            <div className="px-3.5 sm:px-5 py-2 bg-[#131722] border-b border-[#e2b714]/20 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono-vct text-[11px] font-bold uppercase tracking-[0.14em] text-[#fde047]">
                <Award className="w-3.5 h-3.5 text-[#e2b714]" />
                Duelo Principal da Final · Players to Watch
              </span>
              <span className="hidden sm:inline font-mono-vct text-[11px] text-slate-400">
                Líder da sua campanha vs Referência do rival
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3 p-3.5 sm:p-5">
              {/* Left: Your Campaign Leader */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <PlayerAvatar
                  player={fallbackUserLeader}
                  size="xl"
                  teamColor={teamIdentity.color}
                />
                <div className="min-w-0 flex-1">
                  <span className="font-mono-vct text-[10px] font-bold uppercase tracking-wider text-[#38bdf8]">
                    Destaque da Sua Run
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h3 className="font-display text-2xl sm:text-3xl leading-none text-white uppercase tracking-wide truncate">
                      {fallbackUserLeader.ign}
                    </h3>
                    {fallbackUserLeader.countryCode && (
                      <CountryFlag code={fallbackUserLeader.countryCode} size="xs" />
                    )}
                    <AgentMiniBadge agent={fallbackUserLeader.signatureAgent} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap font-mono-vct text-[11px]">
                    {runLeader ? (
                      <>
                        <span className="px-1.5 py-0.5 rounded-[2px] bg-[#141a25] border border-white/10 text-white font-bold">
                          {runLeader.acs} ACS
                        </span>
                        <span className="px-1.5 py-0.5 rounded-[2px] bg-[#141a25] border border-white/10 text-emerald-300 font-bold">
                          {runLeader.kdRatio.toFixed(2)} K/D
                        </span>
                        {runLeader.clutchesWon > 0 && (
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-[#e2b714]/15 border border-[#e2b714]/35 text-[#fde047] font-bold">
                            {runLeader.clutchesWon}{' '}
                            {runLeader.clutchesWon === 1 ? 'Clutch' : 'Clutches'}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-slate-300">
                        {ROLE_NAMES_PT[fallbackUserLeader.primaryRole]} ·{' '}
                        {fallbackUserLeader.signatureAgent}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Center divider */}
              <div className="hidden md:flex flex-col items-center justify-center px-3">
                <span className="font-display text-3xl leading-none text-[#e2b714]/80 tracking-widest">
                  VS
                </span>
              </div>

              {/* Right: Opponent Star */}
              <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 md:text-right min-w-0 pt-2.5 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
                <div className="min-w-0 flex-1 order-2 md:order-1">
                  <span className="font-mono-vct text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    Estrela do Adversário
                  </span>
                  <div className="flex items-center md:justify-end gap-2 mt-0.5">
                    <AgentMiniBadge agent={opponentStar.signatureAgent} size="sm" />
                    {opponentStar.countryCode && (
                      <CountryFlag code={opponentStar.countryCode} size="xs" />
                    )}
                    <h3 className="font-display text-2xl sm:text-3xl leading-none text-white uppercase tracking-wide truncate">
                      {opponentStar.ign}
                    </h3>
                  </div>
                  <div className="flex items-center md:justify-end gap-2 mt-1.5 flex-wrap font-mono-vct text-[11px]">
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-[#141a25] border border-white/10 text-slate-200">
                      {ROLE_NAMES_PT[opponentStar.primaryRole]} · {opponentStar.signatureAgent}
                    </span>
                    {opponentStar.isChampionsWinner && (
                      <span className="px-1.5 py-0.5 rounded-[2px] bg-[#e2b714]/15 border border-[#e2b714]/35 text-[#fde047] font-bold">
                        Campeão Mundial
                      </span>
                    )}
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <PlayerAvatar
                    player={opponentStar}
                    size="xl"
                    teamColor={series.opponent.logoColor}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* =====================================================================
          4. OFFICIAL 5v5 HEAD-TO-HEAD LINEUP PRESENTATION
         ===================================================================== */}
      <Card
        padding="none"
        className={`overflow-hidden ${
          isFinals ? 'border-[#e2b714]/30' : 'border-white/10'
        }`}
      >
        <div className="px-3.5 sm:px-5 py-2.5 bg-[#0b0e14] border-b border-white/[0.07] flex items-center justify-between gap-2">
          <span className="font-mono-vct text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-200">
            {isFinals
              ? 'Apresentação Oficial das Equipes · Confronto 5v5'
              : 'Elencos Titulares · Confronto por Função'}
          </span>
          <span className="font-mono-vct text-[11px] text-slate-400 hidden sm:inline">
            {teamIdentity.name} vs {oppShort}
          </span>
        </div>

        <div className="divide-y divide-white/[0.06] bg-[#0d1118]">
          {ROLE_ORDER.map((role, idx) => {
            const myPlayer = lineup[role];
            const oppPlayer = opponentSlots[role];
            const roleColor = ROLE_COLORS[role];
            const myAgentPortrait =
              isFinals && myPlayer?.signatureAgent
                ? AGENT_FULL_PORTRAITS[myPlayer.signatureAgent]
                : null;
            const oppAgentPortrait =
              isFinals && oppPlayer?.signatureAgent
                ? AGENT_FULL_PORTRAITS[oppPlayer.signatureAgent]
                : null;

            return (
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  delay: (isFinals ? 0.1 : 0.04) + idx * 0.035,
                  ease: 'easeOut',
                }}
                className="relative"
              >
                {/* DESKTOP / TABLET ROW (sm+) */}
                <div
                  className={`hidden sm:grid grid-cols-[1fr_132px_1fr] items-stretch ${
                    isFinals ? 'min-h-[78px]' : 'min-h-[64px]'
                  }`}
                >
                  {/* LEFT WING: YOUR PLAYER */}
                  <div className="relative overflow-hidden flex items-center justify-between gap-3 px-4 py-2.5">
                    {myAgentPortrait && (
                      <img
                        src={myAgentPortrait}
                        alt=""
                        aria-hidden="true"
                        referrerPolicy="no-referrer"
                        className="pointer-events-none select-none absolute right-2 top-1/2 -translate-y-1/2 h-28 object-contain opacity-[0.09]"
                      />
                    )}

                    <div className="relative z-10 flex items-center gap-3 min-w-0">
                      {myPlayer ? (
                        <PlayerAvatar
                          player={myPlayer}
                          size={isFinals ? 'lg' : 'md'}
                          teamColor={teamIdentity.color}
                        />
                      ) : (
                        <RoleEmblem role={role} size="md" />
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`font-display leading-none text-white uppercase tracking-wide truncate ${
                              isFinals ? 'text-2xl' : 'text-xl'
                            }`}
                          >
                            {myPlayer?.ign || '—'}
                          </span>
                          {myPlayer?.countryCode && (
                            <CountryFlag code={myPlayer.countryCode} size="xs" />
                          )}
                          {myPlayer?.trait && (
                            <TraitBadge trait={myPlayer.trait} iconOnly size="xs" />
                          )}
                          {myPlayer?.isChampionsWinner && (
                            <span
                              title={
                                myPlayer.championsYears.length > 0
                                  ? `Campeão Champions (${myPlayer.championsYears.join(', ')})`
                                  : 'Campeão Mundial'
                              }
                              className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-[2px] bg-[#e2b714]/15 border border-[#e2b714]/35 text-[9px] font-mono-vct font-bold uppercase text-[#fde047]"
                            >
                              <Trophy className="w-2.5 h-2.5" />
                              {isFinals && myPlayer.championsYears.length > 0
                                ? myPlayer.championsYears[0]
                                : null}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono-vct text-slate-400 mt-0.5 truncate">
                          {myPlayer && (
                            <>
                              <span>
                                {myPlayer.team} &apos;{String(myPlayer.year).slice(2)}
                              </span>
                              {myPlayer.signatureAgent && (
                                <>
                                  <span className="text-slate-600">·</span>
                                  <span className="text-slate-300">
                                    {myPlayer.signatureAgent}
                                  </span>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {myPlayer?.signatureAgent && (
                      <div className="relative z-10">
                        <AgentMiniBadge
                          agent={myPlayer.signatureAgent}
                          size={isFinals ? 'md' : 'sm'}
                        />
                      </div>
                    )}
                  </div>

                  {/* CENTER COLUMN: ROLE MATCHUP DIVIDER */}
                  <div className="bg-[#090c11]/85 border-x border-white/[0.06] flex flex-col items-center justify-center px-2 py-2 text-center select-none">
                    <RoleEmblem role={role} size="sm" showBackground={false} />
                    <span
                      className="font-mono-vct text-[10px] font-bold uppercase tracking-wider mt-1"
                      style={{ color: roleColor }}
                    >
                      {ROLE_NAMES_PT[role]}
                    </span>
                  </div>

                  {/* RIGHT WING: OPPONENT PLAYER (MIRRORED) */}
                  <div className="relative overflow-hidden flex items-center justify-between gap-3 px-4 py-2.5">
                    {oppAgentPortrait && (
                      <img
                        src={oppAgentPortrait}
                        alt=""
                        aria-hidden="true"
                        referrerPolicy="no-referrer"
                        className="pointer-events-none select-none absolute left-2 top-1/2 -translate-y-1/2 h-28 object-contain opacity-[0.09]"
                      />
                    )}

                    {oppPlayer?.signatureAgent ? (
                      <div className="relative z-10">
                        <AgentMiniBadge
                          agent={oppPlayer.signatureAgent}
                          size={isFinals ? 'md' : 'sm'}
                        />
                      </div>
                    ) : (
                      <div />
                    )}

                    <div className="relative z-10 flex items-center justify-end gap-3 min-w-0 text-right">
                      <div className="min-w-0">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {oppPlayer?.isChampionsWinner && (
                            <span
                              title={
                                oppPlayer.championsYears.length > 0
                                  ? `Campeão Champions (${oppPlayer.championsYears.join(', ')})`
                                  : 'Campeão Mundial'
                              }
                              className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-[2px] bg-[#e2b714]/15 border border-[#e2b714]/35 text-[9px] font-mono-vct font-bold uppercase text-[#fde047]"
                            >
                              <Trophy className="w-2.5 h-2.5" />
                              {isFinals && oppPlayer.championsYears.length > 0
                                ? oppPlayer.championsYears[0]
                                : null}
                            </span>
                          )}
                          {oppPlayer?.countryCode && (
                            <CountryFlag code={oppPlayer.countryCode} size="xs" />
                          )}
                          <span
                            className={`font-display leading-none text-white uppercase tracking-wide truncate ${
                              isFinals ? 'text-2xl' : 'text-xl'
                            }`}
                          >
                            {oppPlayer?.ign || '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5 text-[11px] font-mono-vct text-slate-400 mt-0.5 truncate">
                          {oppPlayer && (
                            <>
                              {oppPlayer.signatureAgent && (
                                <span className="text-slate-300">
                                  {oppPlayer.signatureAgent}
                                </span>
                              )}
                              {oppPlayer.signatureAgent && (
                                <span className="text-slate-600">·</span>
                              )}
                              <span>
                                {realOpponentTeam?.shortName || series.opponent.tag} &apos;
                                {String(oppPlayer.year).slice(2)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {oppPlayer ? (
                        <PlayerAvatar
                          player={oppPlayer}
                          size={isFinals ? 'lg' : 'md'}
                          teamColor={series.opponent.logoColor}
                        />
                      ) : (
                        <RoleEmblem role={role} size="md" />
                      )}
                    </div>
                  </div>
                </div>

                {/* MOBILE COMPACT ROW (< sm) */}
                <div className="sm:hidden px-3 py-2.5 space-y-1.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <RoleEmblem role={role} size="xs" showBackground={false} />
                    <span
                      className="font-mono-vct text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: roleColor }}
                    >
                      {ROLE_NAMES_PT[role]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    {/* Mobile Left: User Player */}
                    <div className="flex items-center gap-2 min-w-0">
                      {myPlayer && (
                        <PlayerAvatar
                          player={myPlayer}
                          size="sm"
                          teamColor={teamIdentity.color}
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-display text-lg leading-none text-white truncate">
                            {myPlayer?.ign || '—'}
                          </span>
                          {myPlayer?.countryCode && (
                            <CountryFlag code={myPlayer.countryCode} size="xs" />
                          )}
                        </div>
                        <span className="block text-[10px] font-mono-vct text-slate-400 truncate">
                          {myPlayer?.signatureAgent || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Right: Opponent Player */}
                    <div className="flex items-center justify-end gap-2 min-w-0 text-right">
                      <div className="min-w-0">
                        <div className="flex items-center justify-end gap-1">
                          {oppPlayer?.countryCode && (
                            <CountryFlag code={oppPlayer.countryCode} size="xs" />
                          )}
                          <span className="font-display text-lg leading-none text-white truncate">
                            {oppPlayer?.ign || '—'}
                          </span>
                        </div>
                        <span className="block text-[10px] font-mono-vct text-slate-400 truncate">
                          {oppPlayer?.signatureAgent || '—'}
                        </span>
                      </div>
                      {oppPlayer && (
                        <PlayerAvatar
                          player={oppPlayer}
                          size="sm"
                          teamColor={series.opponent.logoColor}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* =====================================================================
          5. OFFICIAL MAP ORDER & VETO STRIP (MD3 / MD5 WITH 2 BANS)
         ===================================================================== */}
      <Card
        padding="none"
        className={`p-3 sm:p-4 ${
          isFinals ? 'border-[#e2b714]/30 bg-[#0d1118]' : 'border-white/10'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-mono-vct text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-200">
            <MapPin
              className={`w-3.5 h-3.5 ${
                isFinals ? 'text-[#e2b714]' : 'text-[#ff4655]'
              }`}
            />
            {isFinals
              ? 'Veto & Ordem Oficial da Grande Final (MD5)'
              : `Ordem Oficial dos Mapas (MD${series.bestOf})`}
          </span>
          <span className="font-mono-vct text-[11px] text-slate-400">
            Vence quem conquistar {Math.ceil(series.bestOf / 2)} mapas
          </span>
        </div>

        {/* Grand Finals Bans Strip */}
        {isFinals && bannedMaps.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-2.5 pb-2.5 border-b border-white/[0.06]">
            {bannedMaps.map((b, i) => (
              <div
                key={`${b.mapName}-${i}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-rose-950/35 border border-rose-500/25 text-[11px] font-mono-vct text-rose-300/90"
              >
                <Ban className="w-3 h-3 text-rose-400 shrink-0" />
                <span className="uppercase text-slate-400">
                  Ban {b.bannedBy === 'player' ? teamIdentity.name.slice(0, 12) : oppShort}:
                </span>
                <span className="line-through font-bold text-rose-200/90">
                  {b.mapName}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Map Queue Tiles */}
        <div
          className={`grid gap-2 ${
            mapQueue.length >= 5
              ? 'grid-cols-2 sm:grid-cols-5'
              : 'grid-cols-3'
          }`}
        >
          {mapQueue.map((mapName, idx) => {
            const isDecider = idx === mapQueue.length - 1;
            const isOptional =
              series.bestOf === 5 && idx >= 3 && idx < mapQueue.length - 1;
            return (
              <div
                key={`${mapName}-${idx}`}
                className={`rounded-[3px] border px-2.5 py-2 flex flex-col items-center justify-center text-center ${
                  isDecider
                    ? isFinals
                      ? 'bg-[#e2b714]/10 border-[#e2b714]/45'
                      : 'bg-[#ff4655]/10 border-[#ff4655]/35'
                    : 'bg-[#090c11] border-white/10'
                }`}
              >
                <span
                  className={`font-mono-vct text-[10px] font-bold uppercase tracking-wider ${
                    isDecider
                      ? isFinals
                        ? 'text-[#fde047]'
                        : 'text-[#fda4af]'
                      : 'text-slate-400'
                  }`}
                >
                  {isDecider
                    ? `Mapa ${idx + 1} · Decider`
                    : isOptional
                    ? `Mapa ${idx + 1} · Se nec.`
                    : `Mapa ${idx + 1}`}
                </span>
                <span className="font-display text-lg sm:text-xl leading-tight text-white uppercase tracking-wide mt-0.5">
                  {mapName}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* =====================================================================
          6. SCOUTING DESK + TACTICAL STANCE SELECTION + START CTA
         ===================================================================== */}
      <Card
        padding="md"
        className={`space-y-4 ${
          isFinals ? 'border-[#e2b714]/35' : 'border-white/10'
        }`}
      >
        {/* Compact Scouting Summary */}
        <div className="rounded-[3px] bg-[#090c11] border border-white/10 p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {report.visibility === 'blind' ? (
                <EyeOff className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Eye className="w-4 h-4 text-[#38bdf8] shrink-0" />
              )}
              <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-white">
                Scouting Pré-Série · {series.opponent.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {activeSeriesBuff !== 'none' && (
                <Badge tone="gold">
                  <Sparkles className="w-3 h-3" />
                  {BUFF_LABEL[activeSeriesBuff]}
                </Badge>
              )}
              <Badge
                tone={
                  report.visibility === 'full'
                    ? 'green'
                    : report.visibility === 'partial'
                    ? 'gold'
                    : 'red'
                }
              >
                {report.visibility === 'full'
                  ? 'Leitura Completa'
                  : report.visibility === 'partial'
                  ? 'Leitura Parcial'
                  : 'Blind · Master'}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-slate-100 leading-snug">{report.headline}</p>

          {report.recommendedReason && (
            <div className="text-xs font-mono-vct text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1.5 rounded-[2px] flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>Sugestão: {report.recommendedReason}</span>
            </div>
          )}

          {lowSynergyMasterPenalty && (
            <div className="text-xs font-mono-vct text-rose-300 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1.5 rounded-[2px]">
              Alerta Master: Química baixa ({teamSynergy}) gera -2% de coordenação em retakes.
            </div>
          )}
        </div>

        {/* 3 One-Click Tactical Stances */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-slate-200">
              {isFinals ? 'Plano de Jogo da Grande Final' : 'Postura Tática da Série'}
            </span>
            <span className="text-xs text-slate-300">Escolha 1 plano para os mapas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {TACTICAL_STANCES.map(stance => {
              const active = selectedStance === stance.id;
              const isRecommended = report.recommendedStance === stance.id;
              const StanceIcon = STANCE_ICON[stance.id];

              return (
                <button
                  key={stance.id}
                  id={`stance-${stance.id}-btn`}
                  type="button"
                  onClick={() => {
                    playSelectSound();
                    onSelectStance(stance.id);
                  }}
                  className={`text-left rounded-[3px] border p-3 transition-colors cursor-pointer relative ${
                    active
                      ? 'bg-[#171d29]'
                      : 'bg-[#0b0e14] border-white/10 hover:border-white/25 hover:bg-[#111620]'
                  }`}
                  style={
                    active
                      ? {
                          borderColor: stance.accentColor,
                          boxShadow: `0 0 18px -6px ${stance.accentColor}66`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 font-display text-xl leading-none text-white uppercase tracking-wide">
                      <StanceIcon
                        className="w-4 h-4 shrink-0"
                        style={{ color: stance.accentColor }}
                      />
                      {stance.label}
                    </span>
                    {active ? (
                      <Check
                        className="w-4 h-4 shrink-0"
                        style={{ color: stance.accentColor }}
                      />
                    ) : isRecommended ? (
                      <span className="font-mono-vct text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-[2px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/35">
                        Ideal
                      </span>
                    ) : null}
                  </div>

                  <span
                    className="font-mono-vct text-[11px] font-bold uppercase block mb-1.5"
                    style={{ color: stance.accentColor }}
                  >
                    {stance.tag}
                  </span>
                  <p className="text-xs text-slate-100 font-medium leading-snug">
                    {stance.summary}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1 leading-tight">
                    {stance.tradeoff}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Series / Enter Grand Finals Stage CTA */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10 flex-wrap">
          <span className="text-xs text-slate-300 font-mono-vct">
            {isFinals
              ? `Grande Final MD5 · Primeiro mapa: ${mapQueue[0]}`
              : `Formato MD${series.bestOf} · Primeiro mapa: ${mapQueue[0]}`}
          </span>
          <PrimaryButton
            id="start-series-prep-btn"
            size="md"
            onClick={() => {
              playSelectSound();
              onStartSeries();
            }}
            className={`w-full sm:w-auto ${
              isFinals
                ? '!bg-[#e2b714] hover:!bg-[#f0c729] !text-[#0b0e14] !border-[#fde047]'
                : ''
            }`}
          >
            {isFinals && <Trophy className="w-4 h-4" />}
            <span>{isFinals ? 'Entrar no Palco da Final' : 'Começar Série'}</span>
            <ArrowRight className="w-4 h-4" />
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
};
