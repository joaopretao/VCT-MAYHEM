import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Role,
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
import { getPlayerPhotoUrl } from '../data/playerPhotos';
import { getMapArt } from '../data/mapArt';
import { ROLE_COLORS, ROLE_NAMES_PT } from '../data/roleIcons';
import { playSelectSound } from '../utils/audio';
import { ROLE_ORDER } from './roleOrder';
import { CountryFlag } from './CountryFlag';
import { RoleEmblem } from './RoleEmblem';
import { TeamLogo } from './TeamLogo';
import { TeamCrest } from './TeamCrest';
import { TraitBadge } from './TraitBadge';
import { MayhemBonusChip } from './MayhemBonusChip';
import { Badge, PrimaryButton } from './ui';

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
  onPreviewMapChange?: (mapName: string) => void;
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

/** Flush square headshot tile for the outer edge of each 5v5 banner */
const PlayerSquarePortrait: React.FC<{
  player: Player | null;
  role: Role;
  accentColor: string;
  side: 'left' | 'right';
  sizeClass?: string;
}> = ({ player, role, accentColor, side, sizeClass = 'w-[72px] xl:w-[82px]' }) => {
  const [photoError, setPhotoError] = useState(false);
  const photoUrl = player ? getPlayerPhotoUrl(player.ign) : null;
  const agentIcon = player?.signatureAgent ? AGENT_ICONS[player.signatureAgent] : null;

  useEffect(() => {
    setPhotoError(false);
  }, [player?.id, photoUrl]);

  return (
    <div
      className={`relative shrink-0 h-full overflow-hidden flex items-center justify-center ${sizeClass} ${
        side === 'left' ? 'border-r border-white/15' : 'border-l border-white/15'
      }`}
      style={{
        background: `radial-gradient(circle at 50% 25%, ${accentColor}44 0%, #090d14 88%)`,
      }}
    >
      {photoUrl && !photoError ? (
        <img
          src={photoUrl}
          alt={player?.ign || ''}
          className="w-full h-full object-cover object-top select-none"
          loading="lazy"
          onError={() => setPhotoError(true)}
        />
      ) : agentIcon ? (
        <img
          src={agentIcon}
          alt={player?.signatureAgent || ''}
          className="w-full h-full object-cover p-1.5 select-none"
          referrerPolicy="no-referrer"
        />
      ) : (
        <RoleEmblem role={role} size="md" showBackground={false} />
      )}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#06090f]/80 to-transparent"
        aria-hidden
      />
    </div>
  );
};

interface MirroredPlayerCardProps {
  player: Player | null;
  role: Role;
  side: 'left' | 'right';
  teamColor: string;
  teamShortLabel: string;
  isFinals: boolean;
  isFocused: boolean;
  isDimmed: boolean;
  spotlightBadge?: string | null;
  onHoverChange: (role: Role | null) => void;
}

const MirroredPlayerCard: React.FC<MirroredPlayerCardProps> = ({
  player,
  role,
  side,
  teamColor,
  teamShortLabel,
  isFinals,
  isFocused,
  isDimmed,
  spotlightBadge,
  onHoverChange,
}) => {
  const roleColor = ROLE_COLORS[role];
  const agentPortrait = player?.signatureAgent
    ? AGENT_FULL_PORTRAITS[player.signatureAgent]
    : null;
  const isLeft = side === 'left';

  const borderColor = isFocused
    ? isFinals
      ? 'rgba(226, 183, 20, 0.75)'
      : `${teamColor}cc`
    : spotlightBadge
    ? 'rgba(226, 183, 20, 0.50)'
    : 'rgba(255, 255, 255, 0.13)';

  return (
    <div
      onMouseEnter={() => onHoverChange(role)}
      onMouseLeave={() => onHoverChange(null)}
      className={`group relative flex items-stretch rounded-[4px] overflow-hidden border transition-all duration-200 ${
        isFinals ? 'h-[82px] xl:h-[90px]' : 'h-[74px] xl:h-[82px]'
      } ${isDimmed ? 'opacity-70' : 'opacity-100'} ${
        isFocused ? 'scale-[1.012] z-10 shadow-xl' : 'shadow-md'
      }`}
      style={{
        borderColor,
        backgroundColor: 'rgba(9, 13, 21, 0.58)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: isFocused
          ? `0 12px 30px -10px ${isFinals ? '#e2b71455' : `${teamColor}66`}`
          : undefined,
      }}
    >
      {/* Accent edge bar */}
      <div
        className={`absolute inset-y-0 w-[3px] z-20 ${isLeft ? 'left-0' : 'right-0'}`}
        style={{ backgroundColor: spotlightBadge ? '#e2b714' : teamColor }}
        aria-hidden
      />

      {/* LEFT SIDE: [FOTO] | [BONECO NO FUNDO] */}
      {isLeft && (
        <PlayerSquarePortrait
          player={player}
          role={role}
          accentColor={teamColor}
          side="left"
          sizeClass={isFinals ? 'w-[78px] xl:w-[88px]' : 'w-[72px] xl:w-[80px]'}
        />
      )}

      {/* BANNER WITH AGENT IN THE BACKGROUND ("BONECO NO FUNDO") */}
      <div
        className={`relative flex-1 min-w-0 overflow-hidden flex flex-col justify-center px-3 xl:px-3.5 ${
          isLeft ? 'text-left' : 'text-right'
        }`}
      >
        {/* Blurred Agent Artwork in Background ("Boneco no fundo") */}
        {agentPortrait && (
          <img
            src={agentPortrait}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            className={`pointer-events-none select-none absolute top-[-18%] h-[185%] w-auto max-w-none object-contain transition-all duration-200 will-change-transform ${
              isLeft ? 'right-[-10%]' : 'left-[-10%] -scale-x-100'
            } ${
              isFocused
                ? 'blur-0 opacity-65 brightness-100'
                : 'blur-[2.5px] opacity-45 brightness-90'
            }`}
          />
        )}

        {/* Directional dark readability veil + subtle team tint */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: isLeft
              ? `linear-gradient(90deg, rgba(7,10,16,0.90) 0%, rgba(7,10,16,0.62) 55%, ${teamColor}22 100%)`
              : `linear-gradient(270deg, rgba(7,10,16,0.90) 0%, rgba(7,10,16,0.62) 55%, ${teamColor}22 100%)`,
          }}
          aria-hidden
        />

        {/* CRISP FOREGROUND INFO (ZERO BLUR) */}
        <div className="relative z-10 flex flex-col justify-center gap-0.5 min-w-0">
          {/* Top line: Role + Agent + Spotlight Badge */}
          <div
            className={`flex items-center gap-1.5 flex-wrap ${
              isLeft ? 'justify-start' : 'justify-end'
            }`}
          >
            {isLeft ? (
              <>
                <RoleEmblem role={role} size="xs" showBackground={false} />
                <span
                  className="font-mono-vct text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: roleColor }}
                >
                  {ROLE_NAMES_PT[role]}
                </span>
                {player?.signatureAgent && (
                  <span className="font-mono-vct text-[10px] text-slate-300/90 uppercase">
                    · {player.signatureAgent}
                  </span>
                )}
                {spotlightBadge && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#e2b714]/20 border border-[#e2b714]/50 font-mono-vct text-[9px] font-bold uppercase text-[#fde047]">
                    <Award className="w-2.5 h-2.5 shrink-0" />
                    {spotlightBadge}
                  </span>
                )}
              </>
            ) : (
              <>
                {spotlightBadge && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#e2b714]/20 border border-[#e2b714]/50 font-mono-vct text-[9px] font-bold uppercase text-[#fde047]">
                    <Award className="w-2.5 h-2.5 shrink-0" />
                    {spotlightBadge}
                  </span>
                )}
                {player?.signatureAgent && (
                  <span className="font-mono-vct text-[10px] text-slate-300/90 uppercase">
                    {player.signatureAgent} ·
                  </span>
                )}
                <span
                  className="font-mono-vct text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: roleColor }}
                >
                  {ROLE_NAMES_PT[role]}
                </span>
                <RoleEmblem role={role} size="xs" showBackground={false} />
              </>
            )}
          </div>

          {/* Main line: Nick + Country Flag + Trait + Champions seal */}
          <div
            className={`flex items-center gap-1.5 ${
              isLeft ? 'justify-start' : 'justify-end'
            }`}
          >
            {!isLeft && player?.isChampionsWinner && (
              <span
                title={
                  player.championsYears.length > 0
                    ? `Campeão Champions (${player.championsYears.join(', ')})`
                    : 'Campeão Mundial'
                }
                className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-[2px] bg-[#e2b714]/20 border border-[#e2b714]/45 text-[9px] font-mono-vct font-bold text-[#fde047] shrink-0"
              >
                <Trophy className="w-2.5 h-2.5" />
                {isFinals && player.championsYears.length > 0
                  ? player.championsYears[0]
                  : null}
              </span>
            )}
            {!isLeft && player?.countryCode && (
              <CountryFlag code={player.countryCode} size="xs" />
            )}

            <span
              className={`font-display leading-none text-white uppercase tracking-wide truncate drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] ${
                isFinals ? 'text-2xl xl:text-[30px]' : 'text-2xl xl:text-[26px]'
              }`}
            >
              {player?.ign || '—'}
            </span>

            {isLeft && player?.countryCode && (
              <CountryFlag code={player.countryCode} size="xs" />
            )}
            {isLeft && player?.trait && (
              <TraitBadge trait={player.trait} iconOnly size="xs" />
            )}
            {isLeft && player?.isChampionsWinner && (
              <span
                title={
                  player.championsYears.length > 0
                    ? `Campeão Champions (${player.championsYears.join(', ')})`
                    : 'Campeão Mundial'
                }
                className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-[2px] bg-[#e2b714]/20 border border-[#e2b714]/45 text-[9px] font-mono-vct font-bold text-[#fde047] shrink-0"
              >
                <Trophy className="w-2.5 h-2.5" />
                {isFinals && player.championsYears.length > 0
                  ? player.championsYears[0]
                  : null}
              </span>
            )}
          </div>

          {/* Bottom micro meta */}
          <span className="font-mono-vct text-[10px] text-slate-300/80 truncate">
            {player
              ? `${isLeft ? player.team : teamShortLabel} '${String(player.year).slice(2)}`
              : 'Vaga aberta'}
          </span>
        </div>
      </div>

      {/* RIGHT SIDE (MIRRORED): [BONECO NO FUNDO] | [FOTO] */}
      {!isLeft && (
        <PlayerSquarePortrait
          player={player}
          role={role}
          accentColor={teamColor}
          side="right"
          sizeClass={isFinals ? 'w-[78px] xl:w-[88px]' : 'w-[72px] xl:w-[80px]'}
        />
      )}
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
  onPreviewMapChange,
  onStartSeries,
}) => {
  const isFinals = series.stage === 'finals';
  const [selectedMapIdx, setSelectedMapIdx] = useState<number>(0);
  const [focusedRole, setFocusedRole] = useState<Role | null>(null);

  const mapQueue = useMemo(
    () =>
      series.mapQueue && series.mapQueue.length > 0
        ? series.mapQueue
        : Array.from({ length: series.bestOf }, () => 'Ascent'),
    [series.mapQueue, series.bestOf]
  );

  // Reset map preview when advancing to a new series
  useEffect(() => {
    setSelectedMapIdx(0);
  }, [series.stage, series.opponent.id, series.opponent.name]);

  const activeMapName = mapQueue[selectedMapIdx] || mapQueue[0] || 'Ascent';
  const activeMapArt = getMapArt(activeMapName);

  // Sync full-viewport backdrop whenever selected map changes
  useEffect(() => {
    onPreviewMapChange?.(activeMapName);
  }, [activeMapName, onPreviewMapChange]);

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

  const lowSynergyMasterPenalty = difficulty === 'master' && teamSynergy < 78;
  const currentStageIdx = STAGE_STEPS.findIndex(s => s.id === series.stage);
  const campaignMapWins = completedSeries.reduce((acc, s) => acc + s.playerWins, 0);
  const campaignMapLosses = completedSeries.reduce((acc, s) => acc + s.opponentWins, 0);
  const bannedMaps = series.bannedMaps || [];
  const oppShort = formatOpponentShort(series.opponent);
  const isSelectedDecider = selectedMapIdx === mapQueue.length - 1;

  return (
    <div
      id="tactical-prep-card"
      className={`relative rounded-[6px] overflow-hidden border shadow-[0_24px_70px_-15px_rgba(0,0,0,0.85)] ${
        isFinals ? 'border-[#e2b714]/45' : 'border-white/15'
      }`}
    >
      {/* =====================================================================
          FULL-BLEED STAGE BACKGROUND: ENTIRE MAP + ATMOSPHERIC DEPTH-OF-FIELD BLUR
         ===================================================================== */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#070a10]" aria-hidden>
        <AnimatePresence mode="sync">
          <motion.img
            key={activeMapArt.splash}
            src={activeMapArt.splash}
            alt=""
            initial={{ opacity: 0, scale: 1.07 }}
            animate={{ opacity: 1, scale: 1.04 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full object-cover blur-[5px] brightness-[0.58] saturate-[1.12] will-change-transform"
          />
        </AnimatePresence>

        {/* Soft cinematic vignette keeping the open center window luminous */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 52% 60% at 50% 42%, rgba(7,10,16,0.18) 0%, rgba(7,10,16,0.68) 72%, rgba(6,9,15,0.88) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06090f]/80 via-transparent to-[#06090f]/92" />

        {/* Atmospheric team color glow fog (Left vs Right + Gold center on Finals) */}
        <div
          className="absolute -left-24 top-1/4 w-[360px] h-[360px] rounded-full blur-[100px] opacity-30"
          style={{ backgroundColor: teamIdentity.color }}
        />
        <div
          className="absolute -right-24 top-1/4 w-[360px] h-[360px] rounded-full blur-[100px] opacity-30"
          style={{ backgroundColor: series.opponent.logoColor }}
        />
        {isFinals && (
          <div
            className="absolute left-1/2 -translate-x-1/2 top-8 w-[340px] h-[220px] rounded-full blur-[90px] opacity-25"
            style={{ backgroundColor: '#e2b714' }}
          />
        )}
      </div>

      {/* =====================================================================
          FOREGROUND CONTENT OVER FULL-BLEED MAP
         ===================================================================== */}
      <div className="relative z-10 flex flex-col">
        {/* Top Accent Line */}
        <div
          className={`h-[2px] w-full ${
            isFinals
              ? 'bg-gradient-to-r from-[#e2b714]/20 via-[#e2b714] to-[#e2b714]/20'
              : 'bg-gradient-to-r from-transparent via-[#ff4655]/85 to-transparent'
          }`}
          aria-hidden
        />

        {/* 1. FROSTED BROADCAST MASTHEAD & BRACKET PROGRESS */}
        <div
          className={`px-3.5 sm:px-5 py-2.5 border-b backdrop-blur-md flex items-center justify-between gap-2 flex-wrap ${
            isFinals
              ? 'bg-[#0c1018]/75 border-[#e2b714]/25'
              : 'bg-[#080c14]/70 border-white/[0.10]'
          }`}
        >
          <div className="flex items-center gap-2">
            {isFinals ? (
              <>
                <Trophy className="w-4 h-4 text-[#e2b714] shrink-0" />
                <span className="font-mono-vct text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-[#fde047]">
                  Valorant Champions · Grande Final MD5
                </span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-[1px] bg-[#ff4655] shrink-0" />
                <span className="font-mono-vct text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] text-slate-100">
                  {series.stageTitle} · MD{series.bestOf}
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
                          ? 'bg-[#e2b714]/20 border-[#e2b714]/65 text-[#fde047] font-bold'
                          : 'bg-[#ff4655]/20 border-[#ff4655]/65 text-white font-bold'
                        : isPast
                        ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                        : 'bg-[#070a10]/55 border-white/[0.08] text-slate-400'
                    }`}
                  >
                    {isPast && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                    <span>{step.short}</span>
                    {done && (
                      <span className="text-[10px] text-emerald-200 font-bold">
                        {done.playerWins}–{done.opponentWins}
                      </span>
                    )}
                  </div>
                  {idx < STAGE_STEPS.length - 1 && (
                    <span className="text-slate-500 text-[10px] select-none">›</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Road to the Final detailed strip (EXCLUSIVE TO GRAND FINALS) */}
        {isFinals && completedSeries.length > 0 && (
          <div className="px-3.5 sm:px-5 py-2 bg-[#070a10]/70 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between gap-2 flex-wrap">
            <span className="font-mono-vct text-[10px] sm:text-[11px] uppercase tracking-wider text-[#fde047]/90">
              Caminho até a Final
            </span>
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              {completedSeries.map((c, idx) => (
                <div
                  key={`${c.stage}-${idx}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono-vct text-slate-200 bg-[#0d121c]/80 border border-white/10 px-2 py-0.5 rounded-[2px]"
                >
                  <TeamLogo
                    teamName={c.opponentName}
                    shortName={c.opponentTag}
                    logoUrl={c.opponentLogoUrl}
                    primaryColor={c.opponentColor}
                    size="xs"
                  />
                  <span className="text-slate-200">{c.opponentTag}</span>
                  <span className="text-emerald-400 font-bold">
                    {c.playerWins}–{c.opponentWins}
                  </span>
                </div>
              ))}
              <span className="font-mono-vct text-[11px] text-[#fde047] font-bold">
                Saldo: {campaignMapWins}V–{campaignMapLosses}D mapas
              </span>
            </div>
          </div>
        )}

        {/* 2. MATCHUP TEAM HEADER (TRANSLUCENT OVER THE MAP) */}
        <div className="px-3.5 sm:px-6 pt-3.5 pb-2.5 bg-[#070b12]/40 backdrop-blur-[6px] border-b border-white/[0.08]">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            {/* Left Team */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <TeamCrest
                emblemId={teamIdentity.emblemId}
                color={teamIdentity.color}
                size="lg"
                className="w-10 h-10 sm:w-12 sm:h-12 shrink-0"
              />
              <div className="min-w-0">
                <span className="block font-mono-vct text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#38bdf8]">
                  {isFinals ? 'Finalista · Sua Equipe' : 'Sua Equipe'}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl leading-[0.95] text-white uppercase tracking-wide truncate drop-shadow">
                  {teamIdentity.name}
                </h2>
              </div>
            </div>

            {/* Center compact tag */}
            <div className="flex flex-col items-center justify-center text-center px-2">
              {isFinals ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#e2b714]/20 border border-[#e2b714]/55 font-mono-vct text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#fde047] backdrop-blur-md">
                  <Trophy className="w-3.5 h-3.5" />
                  Final MD5
                </span>
              ) : (
                <span className="font-display text-2xl sm:text-4xl leading-none text-white/80 tracking-widest select-none drop-shadow">
                  VS
                </span>
              )}
            </div>

            {/* Right Team */}
            <div className="flex items-center justify-end gap-2.5 sm:gap-3.5 text-right min-w-0">
              <div className="min-w-0">
                <span className="block font-mono-vct text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-400">
                  {series.opponent.region} · {series.opponent.rating} OVR
                </span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl leading-[0.95] text-white uppercase tracking-wide truncate drop-shadow">
                  <span className="sm:hidden">{oppShort}</span>
                  <span className="hidden sm:inline">{realOpponentTeam?.name || oppShort}</span>
                </h2>
              </div>
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-[4px] bg-[#080c14]/80 backdrop-blur-md border p-1.5 flex items-center justify-center shrink-0"
                style={{
                  borderColor: `${series.opponent.logoColor}77`,
                  boxShadow: `0 0 18px -6px ${series.opponent.logoColor}88`,
                }}
              >
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

          {selectedBonuses.length > 0 && (
            <div
              id="tournament-bonuses-header"
              className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 flex-wrap mt-2.5 pt-2 border-t border-white/[0.08]"
            >
              <span className="font-mono-vct text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#fde047]">
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
        </div>

        {/* ===================================================================
            3. SIGNATURE 3-COLUMN MIRRORED FACE-OFF OVER FULL-BLEED MAP
               [5 Cards Left]  |  [Atmospheric Center + MAPA]  |  [5 Cards Right]
           =================================================================== */}
        <div className="px-3 sm:px-5 py-4">
          {/* DESKTOP 3-COLUMN LAYOUT (lg+) */}
          <div className="hidden lg:grid grid-cols-[minmax(0,1fr)_270px_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_310px_minmax(0,1fr)] gap-3 xl:gap-4 items-stretch">
            {/* LEFT WING: 5 STACKED PLAYER BANNERS */}
            <div className="flex flex-col gap-2">
              {ROLE_ORDER.map((role, idx) => {
                const p = lineup[role];
                const isUserLeader =
                  isFinals &&
                  Boolean(p && runLeader && runLeader.player.id === p.id);
                const spotlightLabel =
                  isUserLeader && runLeader
                    ? `Líder · ${runLeader.acs} ACS · ${runLeader.kdRatio.toFixed(2)} K/D`
                    : null;

                return (
                  <motion.div
                    key={`left-${role}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, delay: idx * 0.035, ease: 'easeOut' }}
                  >
                    <MirroredPlayerCard
                      player={p}
                      role={role}
                      side="left"
                      teamColor={teamIdentity.color}
                      teamShortLabel={teamIdentity.name}
                      isFinals={isFinals}
                      isFocused={focusedRole === role}
                      isDimmed={focusedRole !== null && focusedRole !== role}
                      spotlightBadge={spotlightLabel}
                      onHoverChange={setFocusedRole}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* CENTER CORRIDOR: VERTICAL ATMOSPHERIC DIVIDER + CENTRAL MAP WINDOW */}
            <div className="relative flex flex-col items-center justify-between py-1">
              {/* Vertical blurred split beam (matching sketch center texture) */}
              <div
                className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px]"
                style={{
                  background: isFinals
                    ? 'linear-gradient(180deg, transparent 0%, rgba(226,183,20,0.65) 20%, rgba(226,183,20,0.85) 50%, rgba(226,183,20,0.65) 80%, transparent 100%)'
                    : 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.28) 20%, rgba(255,70,85,0.55) 50%, rgba(255,255,255,0.28) 80%, transparent 100%)',
                }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-y-6 left-1/2 -translate-x-1/2 w-24 blur-[38px] opacity-35"
                style={{
                  background: isFinals
                    ? 'linear-gradient(180deg, #e2b714 0%, transparent 50%, #e2b714 100%)'
                    : `linear-gradient(180deg, ${teamIdentity.color} 0%, transparent 50%, ${series.opponent.logoColor} 100%)`,
                }}
                aria-hidden
              />

              {/* Top Emblem */}
              <div className="relative z-10 flex flex-col items-center">
                <img
                  src="/brand/mark.png"
                  alt=""
                  aria-hidden="true"
                  className={`w-10 h-10 object-contain select-none ${
                    isFinals ? 'opacity-90 drop-shadow-[0_0_14px_rgba(226,183,20,0.45)]' : 'opacity-75'
                  }`}
                />
                {focusedRole && (
                  <span
                    className="mt-1 px-2 py-0.5 rounded-[2px] bg-[#070b12]/80 backdrop-blur-md border border-white/15 font-mono-vct text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: ROLE_COLORS[focusedRole] }}
                  >
                    Duelo · {ROLE_NAMES_PT[focusedRole]}
                  </span>
                )}
              </div>

              {/* CENTERPIECE: MAP FOCUS WINDOW OVER FULL-BLEED MAP */}
              <div
                className={`relative z-10 w-full rounded-[5px] border p-3.5 text-center shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85)] backdrop-blur-md ${
                  isFinals
                    ? 'bg-[#090d16]/62 border-[#e2b714]/45'
                    : 'bg-[#090d16]/55 border-white/20'
                }`}
              >
                {/* Top map label */}
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <MapPin
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: isFinals ? '#e2b714' : activeMapArt.accentColor }}
                  />
                  <span className="font-mono-vct text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200">
                    {isSelectedDecider
                      ? `Mapa ${selectedMapIdx + 1} · Decider`
                      : `Mapa ${selectedMapIdx + 1} de ${mapQueue.length}`}
                  </span>
                </div>

                {/* Big crisp Map Name */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMapArt.name}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.16 }}
                  >
                    <h3 className="font-display text-4xl xl:text-5xl leading-[0.9] text-white uppercase tracking-wider drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
                      {activeMapArt.name}
                    </h3>
                    <span
                      className="block font-mono-vct text-[10px] uppercase tracking-widest mt-1"
                      style={{ color: activeMapArt.accentColor }}
                    >
                      {activeMapArt.location}
                    </span>
                  </motion.div>
                </AnimatePresence>

                {/* Grand Finals Bans inside the center map card */}
                {isFinals && bannedMaps.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center justify-center gap-1.5">
                    {bannedMaps.map((b, i) => (
                      <span
                        key={`${b.mapName}-${i}`}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-rose-950/60 border border-rose-500/35 font-mono-vct text-[9px] uppercase text-rose-200"
                        title={`Banido por ${b.bannedBy === 'player' ? teamIdentity.name : oppShort}`}
                      >
                        <Ban className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                        <span className="line-through">{b.mapName}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Interactive Map Switcher Pills (swap the full-bleed background map!) */}
                <div className="mt-3 pt-2.5 border-t border-white/10">
                  <span className="block font-mono-vct text-[9px] uppercase tracking-widest text-slate-300/80 mb-1.5">
                    Ordem da Série · Clique para visualizar
                  </span>
                  <div
                    className={`grid gap-1 ${
                      mapQueue.length >= 5 ? 'grid-cols-5' : 'grid-cols-3'
                    }`}
                  >
                    {mapQueue.map((mName, idx) => {
                      const active = idx === selectedMapIdx;
                      const decider = idx === mapQueue.length - 1;
                      return (
                        <button
                          key={`${mName}-${idx}`}
                          type="button"
                          onClick={() => {
                            playSelectSound();
                            setSelectedMapIdx(idx);
                          }}
                          className={`px-1 py-1.5 rounded-[3px] border text-center transition-all cursor-pointer ${
                            active
                              ? isFinals
                                ? 'bg-[#e2b714]/25 border-[#e2b714] text-white shadow-sm'
                                : 'bg-[#ff4655]/25 border-[#ff4655] text-white shadow-sm'
                              : 'bg-[#070a10]/65 border-white/10 text-slate-300 hover:border-white/30 hover:text-white'
                          }`}
                          title={`Mapa ${idx + 1}: ${mName}`}
                        >
                          <span className="block font-mono-vct text-[9px] font-bold uppercase leading-none opacity-80">
                            {decider ? 'DEC' : `M${idx + 1}`}
                          </span>
                          <span className="block font-display text-xs xl:text-sm leading-tight uppercase truncate mt-0.5">
                            {mName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom center tag */}
              <div className="relative z-10 text-center">
                <span className="inline-block px-2.5 py-1 rounded-[2px] bg-[#070b12]/70 backdrop-blur-md border border-white/10 font-mono-vct text-[10px] uppercase tracking-wider text-slate-200">
                  Vence em {Math.ceil(series.bestOf / 2)} mapas · MD{series.bestOf}
                </span>
              </div>
            </div>

            {/* RIGHT WING: 5 MIRRORED OPPONENT BANNERS */}
            <div className="flex flex-col gap-2">
              {ROLE_ORDER.map((role, idx) => {
                const opp = opponentSlots[role];
                const isOppStar =
                  isFinals &&
                  Boolean(opp && opponentStar && opponentStar.id === opp.id);

                return (
                  <motion.div
                    key={`right-${role}`}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, delay: idx * 0.035, ease: 'easeOut' }}
                  >
                    <MirroredPlayerCard
                      player={opp}
                      role={role}
                      side="right"
                      teamColor={series.opponent.logoColor}
                      teamShortLabel={realOpponentTeam?.shortName || series.opponent.tag}
                      isFinals={isFinals}
                      isFocused={focusedRole === role}
                      isDimmed={focusedRole !== null && focusedRole !== role}
                      spotlightBadge={isOppStar ? 'Estrela Rival' : null}
                      onHoverChange={setFocusedRole}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* MOBILE & TABLET LAYOUT (< lg) */}
          <div className="lg:hidden space-y-3">
            {/* Compact Map Switcher Card */}
            <div
              className={`rounded-[4px] border p-3 text-center backdrop-blur-md ${
                isFinals
                  ? 'bg-[#090d16]/65 border-[#e2b714]/45'
                  : 'bg-[#090d16]/60 border-white/15'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-left">
                  <span className="block font-mono-vct text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    {isSelectedDecider
                      ? `Mapa ${selectedMapIdx + 1} · Decider`
                      : `Mapa ${selectedMapIdx + 1} de ${mapQueue.length}`}
                  </span>
                  <span className="font-display text-3xl leading-none text-white uppercase tracking-wide">
                    {activeMapArt.name}
                  </span>
                </div>
                <span
                  className="font-mono-vct text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-[#070a10]/70 border border-white/10"
                  style={{ color: activeMapArt.accentColor }}
                >
                  {activeMapArt.location}
                </span>
              </div>

              {isFinals && bannedMaps.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {bannedMaps.map((b, i) => (
                    <span
                      key={`${b.mapName}-${i}`}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-rose-950/60 border border-rose-500/35 font-mono-vct text-[10px] uppercase text-rose-200"
                    >
                      <Ban className="w-2.5 h-2.5 text-rose-400" />
                      <span className="line-through">{b.mapName}</span>
                    </span>
                  ))}
                </div>
              )}

              <div
                className={`grid gap-1.5 ${
                  mapQueue.length >= 5 ? 'grid-cols-5' : 'grid-cols-3'
                }`}
              >
                {mapQueue.map((mName, idx) => {
                  const active = idx === selectedMapIdx;
                  return (
                    <button
                      key={`${mName}-${idx}`}
                      type="button"
                      onClick={() => {
                        playSelectSound();
                        setSelectedMapIdx(idx);
                      }}
                      className={`px-1.5 py-1.5 rounded-[3px] border text-center cursor-pointer ${
                        active
                          ? isFinals
                            ? 'bg-[#e2b714]/25 border-[#e2b714] text-white'
                            : 'bg-[#ff4655]/25 border-[#ff4655] text-white'
                          : 'bg-[#070a10]/70 border-white/10 text-slate-300'
                      }`}
                    >
                      <span className="block font-mono-vct text-[9px] font-bold opacity-80">
                        M{idx + 1}
                      </span>
                      <span className="block font-display text-sm leading-tight uppercase truncate">
                        {mName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5 Stacked Compact Mirrored Duels on Mobile */}
            <div className="space-y-2">
              {ROLE_ORDER.map(role => {
                const myP = lineup[role];
                const oppP = opponentSlots[role];
                const myAgent = myP?.signatureAgent
                  ? AGENT_FULL_PORTRAITS[myP.signatureAgent]
                  : null;
                const oppAgent = oppP?.signatureAgent
                  ? AGENT_FULL_PORTRAITS[oppP.signatureAgent]
                  : null;

                return (
                  <div
                    key={`mob-${role}`}
                    className="rounded-[4px] overflow-hidden border border-white/12 bg-[#090d16]/65 backdrop-blur-md"
                  >
                    <div className="px-2.5 py-1 bg-[#070a10]/70 border-b border-white/[0.07] flex items-center justify-center gap-1.5">
                      <RoleEmblem role={role} size="xs" showBackground={false} />
                      <span
                        className="font-mono-vct text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: ROLE_COLORS[role] }}
                      >
                        {ROLE_NAMES_PT[role]}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-white/10 h-[58px]">
                      {/* Left Player */}
                      <div className="relative flex items-stretch overflow-hidden">
                        <PlayerSquarePortrait
                          player={myP}
                          role={role}
                          accentColor={teamIdentity.color}
                          side="left"
                          sizeClass="w-[50px]"
                        />
                        <div className="relative flex-1 min-w-0 px-2 flex flex-col justify-center overflow-hidden">
                          {myAgent && (
                            <img
                              src={myAgent}
                              alt=""
                              aria-hidden
                              referrerPolicy="no-referrer"
                              className="pointer-events-none absolute right-[-15%] top-[-15%] h-[170%] w-auto opacity-35 blur-[2px]"
                            />
                          )}
                          <div className="relative z-10 flex items-center gap-1">
                            <span className="font-display text-lg leading-none text-white truncate">
                              {myP?.ign || '—'}
                            </span>
                            {myP?.countryCode && (
                              <CountryFlag code={myP.countryCode} size="xs" />
                            )}
                          </div>
                          <span className="relative z-10 font-mono-vct text-[9px] text-slate-300 truncate">
                            {myP?.signatureAgent || '—'}
                          </span>
                        </div>
                      </div>

                      {/* Right Player (Mirrored) */}
                      <div className="relative flex items-stretch overflow-hidden">
                        <div className="relative flex-1 min-w-0 px-2 flex flex-col justify-center text-right overflow-hidden">
                          {oppAgent && (
                            <img
                              src={oppAgent}
                              alt=""
                              aria-hidden
                              referrerPolicy="no-referrer"
                              className="pointer-events-none absolute left-[-15%] top-[-15%] h-[170%] w-auto opacity-35 blur-[2px] -scale-x-100"
                            />
                          )}
                          <div className="relative z-10 flex items-center justify-end gap-1">
                            {oppP?.countryCode && (
                              <CountryFlag code={oppP.countryCode} size="xs" />
                            )}
                            <span className="font-display text-lg leading-none text-white truncate">
                              {oppP?.ign || '—'}
                            </span>
                          </div>
                          <span className="relative z-10 font-mono-vct text-[9px] text-slate-300 truncate">
                            {oppP?.signatureAgent || '—'}
                          </span>
                        </div>
                        <PlayerSquarePortrait
                          player={oppP}
                          role={role}
                          accentColor={series.opponent.logoColor}
                          side="right"
                          sizeClass="w-[50px]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===================================================================
            4. FROSTED GLASS TACTICAL DESK (SCOUTING + 3 STANCES + CTA)
           =================================================================== */}
        <div
          className={`p-3.5 sm:p-5 border-t backdrop-blur-xl space-y-3.5 ${
            isFinals
              ? 'bg-[#070b12]/78 border-[#e2b714]/25'
              : 'bg-[#070b12]/74 border-white/[0.10]'
          }`}
        >
          {/* Compact Scouting Bar */}
          <div className="rounded-[4px] bg-[#0a0f18]/75 border border-white/10 px-3.5 py-2.5 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {report.visibility === 'blind' ? (
                  <EyeOff className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <Eye className="w-4 h-4 text-[#38bdf8] shrink-0" />
                )}
                <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-white">
                  Scouting · {series.opponent.name}
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

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
              <p className="text-xs sm:text-sm text-slate-100 leading-snug">
                {report.headline}
              </p>
              {report.recommendedReason && (
                <div className="text-[11px] font-mono-vct text-emerald-300 bg-emerald-500/12 border border-emerald-500/30 px-2.5 py-1 rounded-[2px] flex items-center gap-1.5 shrink-0">
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span>{report.recommendedReason}</span>
                </div>
              )}
            </div>

            {lowSynergyMasterPenalty && (
              <div className="text-xs font-mono-vct text-rose-300 bg-rose-500/12 border border-rose-500/30 px-2.5 py-1 rounded-[2px]">
                Alerta Master: Química baixa ({teamSynergy}) gera -2% de coordenação em retakes.
              </div>
            )}
          </div>

          {/* 3 One-Click Tactical Stances */}
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
                  className={`text-left rounded-[4px] border p-3 transition-all cursor-pointer relative ${
                    active
                      ? 'bg-[#141c2b]/85'
                      : 'bg-[#090e17]/65 border-white/10 hover:border-white/25 hover:bg-[#101724]/75'
                  }`}
                  style={
                    active
                      ? {
                          borderColor: stance.accentColor,
                          boxShadow: `0 0 22px -6px ${stance.accentColor}77`,
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
                    className="font-mono-vct text-[10px] font-bold uppercase block mb-1"
                    style={{ color: stance.accentColor }}
                  >
                    {stance.tag}
                  </span>
                  <p className="text-xs text-slate-100 font-medium leading-snug">
                    {stance.summary}
                  </p>
                  <p className="text-[11px] text-slate-300/90 mt-0.5 leading-tight">
                    {stance.tradeoff}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Start CTA Bar */}
          <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
            <span className="text-xs text-slate-200/90 font-mono-vct">
              {isFinals
                ? `Grande Final MD5 · Abertura em ${mapQueue[0]}`
                : `Formato MD${series.bestOf} · Abertura em ${mapQueue[0]}`}
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
        </div>
      </div>
    </div>
  );
};
