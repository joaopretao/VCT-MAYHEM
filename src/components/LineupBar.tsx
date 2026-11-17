import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, RotateCcw, Check, ShieldAlert, AlertCircle, Pencil, Share2 } from 'lucide-react';
import { CardFrameId, Lineup, Role, Player, MayhemBonus, RunRuleId, UserTeamIdentity } from '../types';
import { ROLE_NAMES_PT, ROLE_COLORS } from '../data/roleIcons';
import { AGENT_FULL_PORTRAITS, AGENT_ICONS, ROLE_SILHOUETTES } from '../data/agentIcons';
import { getPlayerPhotoUrl } from '../data/playerPhotos';
import { getTeamLogoData } from '../data/teamLogos';
import { getFrameMeta } from '../data/frames';
import { getRunRuleMeta } from '../utils/runRules';
import { calculateTeamStats } from '../utils/simulation';
import { playSelectSound, playRosterCompleteSound, playRerollSound } from '../utils/audio';
import { RoleEmblem } from './RoleEmblem';
import { TeamLogo } from './TeamLogo';
import { TraitBadge } from './TraitBadge';
import { CountryFlag } from './CountryFlag';
import { TeamCrest, DEFAULT_TEAM_IDENTITY } from './TeamCrest';
import { MayhemBonusChip } from './MayhemBonusChip';
import { Confetti } from './Confetti';
import { ROLE_ORDER, getNextOpenRole } from './roleOrder';
import { Card, StatPill, PrimaryButton, SecondaryButton, AnimatedNumber } from './ui';

interface LineupBarProps {
  lineup: Lineup;
  hoveredPlayer?: Player | null;
  selectedBonuses?: MayhemBonus[];
  teamIdentity?: UserTeamIdentity;
  frameId?: CardFrameId;
  runRule?: RunRuleId;
  seed?: string;
  isDaily?: boolean;
  onCopySeedUrl?: () => void;
  seedCopied?: boolean;
  onEditTeamIdentity?: () => void;
  rerollsLeft?: number;
  bannedPlayers?: Player[];
  onOpenBansModal?: () => void;
  onReroll?: () => void;
  warningMessage?: string | null;
  onRemovePlayer: (role: Role) => void;
  onInspectPlayer: (player: Player) => void;
  onClearLineup: () => void;
  onStartTournament: () => void;
}

function getAgentPortraitUrl(agentName?: string): string | null {
  if (!agentName) return null;
  if (AGENT_FULL_PORTRAITS[agentName]) {
    return AGENT_FULL_PORTRAITS[agentName];
  }
  const iconUrl = AGENT_ICONS[agentName];
  if (iconUrl && iconUrl.includes('displayicon.png')) {
    return iconUrl.replace('displayicon.png', 'fullportrait.png');
  }
  return null;
}

export function computePreviewAssignment(
  lineup: Lineup,
  candidate: Player | null | undefined
): {
  targetRole: Role | null;
  shiftedRole: Role | null;
  shiftedPlayer: Player | null;
} {
  if (!candidate) return { targetRole: null, shiftedRole: null, shiftedPlayer: null };
  if (Object.values(lineup).some(p => p?.id === candidate.id)) {
    return { targetRole: null, shiftedRole: null, shiftedPlayer: null };
  }

  if (!lineup[candidate.primaryRole]) {
    return { targetRole: candidate.primaryRole, shiftedRole: null, shiftedPlayer: null };
  }

  for (const secRole of candidate.secondaryRoles) {
    if (!lineup[secRole]) {
      return { targetRole: secRole, shiftedRole: null, shiftedPlayer: null };
    }
  }

  if (!lineup.Flex) {
    return { targetRole: 'Flex', shiftedRole: null, shiftedPlayer: null };
  }

  const primaryOccupant = lineup[candidate.primaryRole];
  if (primaryOccupant) {
    for (const altRole of primaryOccupant.secondaryRoles) {
      if (!lineup[altRole]) {
        return {
          targetRole: candidate.primaryRole,
          shiftedRole: altRole,
          shiftedPlayer: primaryOccupant,
        };
      }
    }
  }

  const flexOccupant = lineup.Flex;
  if (flexOccupant) {
    const flexCandidates: Role[] = [flexOccupant.primaryRole, ...flexOccupant.secondaryRoles];
    for (const altRole of flexCandidates) {
      if (!lineup[altRole]) {
        return {
          targetRole: 'Flex',
          shiftedRole: altRole,
          shiftedPlayer: flexOccupant,
        };
      }
    }
  }

  return { targetRole: null, shiftedRole: null, shiftedPlayer: null };
}

export const LineupBar: React.FC<LineupBarProps> = ({
  lineup,
  hoveredPlayer = null,
  selectedBonuses = [],
  teamIdentity = DEFAULT_TEAM_IDENTITY,
  frameId = 'default',
  runRule = 'standard',
  seed,
  isDaily = false,
  onCopySeedUrl,
  seedCopied = false,
  onEditTeamIdentity,
  rerollsLeft,
  bannedPlayers = [],
  onOpenBansModal,
  onReroll,
  warningMessage = null,
  onRemovePlayer,
  onInspectPlayer,
  onClearLineup,
  onStartTournament,
}) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const filledCount = ROLE_ORDER.filter(r => lineup[r]).length;
  const currentRound = Math.min(5, filledCount + 1);
  const isComplete = filledCount === 5;
  const nextOpenRole = getNextOpenRole(lineup);
  const stats = calculateTeamStats(lineup, selectedBonuses);
  const prevCompleteRef = React.useRef(false);
  const frameMeta = getFrameMeta(frameId);
  const ruleMeta = getRunRuleMeta(runRule);

  React.useEffect(() => {
    if (isComplete && !prevCompleteRef.current) {
      playRosterCompleteSound();
    }
    prevCompleteRef.current = isComplete;
  }, [isComplete]);

  const preview = computePreviewAssignment(lineup, hoveredPlayer);
  const hasCustomIdentity = teamIdentity.name !== DEFAULT_TEAM_IDENTITY.name;

  const markImgError = (key: string) => {
    setImgErrors(prev => ({ ...prev, [key]: true }));
  };

  return (
    <Card
      padding="none"
      className="p-2.5 md:p-3.5 relative overflow-hidden"
      style={{
        borderColor: frameMeta.borderColor,
        boxShadow: frameMeta.glowShadow,
      }}
    >
      {frameId !== 'default' && (
        <div
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: frameMeta.topStripGradient }}
          aria-hidden
        />
      )}
      {/* Unified Header: SEU TIME + PICK X/5 + Progress + Stats + Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 md:gap-3 mb-2">
        <div className="flex items-center gap-2 md:gap-3 flex-wrap min-w-0">
          {onEditTeamIdentity ? (
            <button
              id="edit-team-identity-btn"
              type="button"
              onClick={() => {
                playSelectSound();
                onEditTeamIdentity();
              }}
              className="group/team inline-flex items-center gap-2 pr-1.5 rounded-[3px] hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Personalizar nome e escudo do seu time (opcional)"
            >
              <TeamCrest
                emblemId={teamIdentity.emblemId}
                color={teamIdentity.color}
                size="sm"
              />
              <span className="font-display text-2xl md:text-3xl leading-none text-white tracking-wide uppercase truncate max-w-[170px] sm:max-w-none">
                {hasCustomIdentity ? teamIdentity.name : 'Seu Time'}
              </span>
              <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover/team:text-white transition-colors shrink-0" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="vct-slash h-5 md:h-[22px]" aria-hidden />
              <h2 className="font-display text-2xl md:text-3xl leading-none text-white tracking-wide uppercase">
                Seu Time
              </h2>
            </div>
          )}
          <span
            className={`font-mono-vct text-xs sm:text-sm font-bold px-2 py-0.5 rounded-[2px] border uppercase tracking-wide ${
              isComplete
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-[#0b0e14] border-white/15 text-white'
            }`}
          >
            {isComplete ? (
              'Pick 5/5 · Fechado'
            ) : (
              <>
                Pick <span className="text-[#ff4655]">{currentRound}</span>
                <span className="text-slate-300">/5</span>
              </>
            )}
          </span>

          {/* Compact 5-Segment Progress Bar */}
          <div
            className="hidden sm:flex gap-1 w-20 md:w-28"
            aria-label={`Progresso do draft: ${filledCount} de 5`}
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = i < filledCount;
              const current = i === filledCount && !isComplete;
              return (
                <div key={i} className="relative h-2 flex-1 rounded-[1px] bg-white/10 overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: filled ? '100%' : '0%' }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 bg-[#ff4655]"
                  />
                  {current && <div className="absolute inset-0 bg-[#e2b714]/80" />}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <StatPill
              label="Química"
              value={<AnimatedNumber value={stats.synergy} prefix="+" />}
              color="#38bdf8"
              title="Sinergia entre jogadores do mesmo time ou composição completa"
            />
            <div className="hidden md:block">
              <StatPill
                label="Clutch"
                value={<AnimatedNumber value={stats.clutch > 0 ? stats.clutch : null} fallback="--" />}
                color="#ff4655"
                title="Média do elenco em rounds decisivos"
              />
            </div>
          </div>

          {stats.synergyBonuses.length > 0 && (
            <span className="hidden 2xl:inline-block font-mono-vct text-xs text-emerald-300 pl-2 border-l border-white/10">
              {stats.synergyBonuses[0]}
            </span>
          )}

          {isDaily && (
            <span className="font-mono-vct text-[11px] font-bold uppercase px-2 py-0.5 rounded-[2px] bg-[#e2b714]/15 border border-[#e2b714]/45 text-[#fde047]">
              Draft do Dia
            </span>
          )}

          {runRule !== 'standard' && (
            <span
              className="font-mono-vct text-[11px] font-bold uppercase px-2 py-0.5 rounded-[2px] bg-[#0b0e14] border"
              style={{ borderColor: `${ruleMeta.accentColor}66`, color: ruleMeta.accentColor }}
            >
              {ruleMeta.label}
            </span>
          )}

          {seed && onCopySeedUrl && (
            <button
              id="copy-draft-seed-btn"
              type="button"
              onClick={() => {
                playSelectSound();
                onCopySeedUrl();
              }}
              className="hidden sm:inline-flex items-center gap-1 font-mono-vct text-[11px] font-bold px-2 py-0.5 rounded-[2px] bg-[#0b0e14] border border-white/15 text-slate-300 hover:text-white hover:border-white/35 transition-colors cursor-pointer"
              title="Copiar link desta seed para um amigo tentar o mesmo draft"
            >
              <Share2 className="w-3 h-3 text-[#38bdf8]" />
              <span>{seedCopied ? 'Link copiado!' : seed}</span>
            </button>
          )}
        </div>

        {/* Right Controls: Vetos + Rerolls + Limpar + Iniciar */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap justify-end">
          {bannedPlayers.length > 0 && onOpenBansModal && (
            <SecondaryButton
              size="sm"
              onClick={() => {
                playSelectSound();
                onOpenBansModal();
              }}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Vetos ({bannedPlayers.length})</span>
            </SecondaryButton>
          )}

          {typeof rerollsLeft === 'number' && onReroll && (
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="font-mono-vct text-xs sm:text-sm text-slate-200">
                Rerolls:{' '}
                <strong className={rerollsLeft > 0 ? 'text-[#e2b714]' : 'text-slate-400'}>
                  {rerollsLeft}
                </strong>
              </span>

              {isComplete ? (
                <SecondaryButton
                  id="reroll-teams-btn"
                  size="sm"
                  onClick={() => {
                    playRerollSound();
                    onReroll();
                  }}
                  disabled={rerollsLeft <= 0}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reroll</span>
                </SecondaryButton>
              ) : (
                <PrimaryButton
                  id="reroll-teams-btn"
                  size="sm"
                  onClick={() => {
                    playRerollSound();
                    onReroll();
                  }}
                  disabled={rerollsLeft <= 0}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reroll</span>
                </PrimaryButton>
              )}
            </div>
          )}

          {filledCount > 0 && (
            <SecondaryButton
              id="clear-roster-btn"
              size="sm"
              onClick={() => {
                playSelectSound();
                onClearLineup();
              }}
              title="Resetar escolhas e começar outro draft"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </SecondaryButton>
          )}

          {isComplete && (
            <PrimaryButton
              id="start-championship-btn"
              size="md"
              onClick={() => {
                playSelectSound();
                onStartTournament();
              }}
              className="w-full sm:w-auto mt-1 sm:mt-0"
            >
              <Trophy className="w-4 h-4" />
              <span>Iniciar Campeonato</span>
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* Warning / Sub-instruction / Bonuses Strip */}
      {(warningMessage || selectedBonuses.length > 0 || !isComplete) && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-white/[0.07]">
          <p className="text-xs text-slate-300">
            {warningMessage ? (
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {warningMessage}
              </span>
            ) : isComplete ? (
              'Time pronto. Clique em "Iniciar Campeonato" acima.'
            ) : (
              'Escolha 1 jogador de qualquer uma das 3 equipes.'
            )}
          </p>

          {selectedBonuses.length > 0 && (
            <div
              id="lineup-bonuses-strip"
              className="flex items-center gap-1.5 sm:gap-2 flex-wrap"
            >
              <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-[#e2b714]">
                Bônus:
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
      )}

      {/* 5 Album-Sticker Slots (Always 5 in 1 horizontal row so mobile matches PC without vertical scroll) */}
      <div className="grid grid-cols-5 gap-1.5 md:gap-3">
        {ROLE_ORDER.map(role => {
          const lockedPlayer = lineup[role];
          const roleColor = ROLE_COLORS[role];
          const silhouette = ROLE_SILHOUETTES[role];
          const isNextSlot = !lockedPlayer && role === nextOpenRole && !hoveredPlayer;

          const isPreviewTarget = preview.targetRole === role && !!hoveredPlayer;
          const isShiftedDestination = preview.shiftedRole === role && !!preview.shiftedPlayer;

          const displayedPreviewPlayer = isPreviewTarget
            ? hoveredPlayer
            : isShiftedDestination
            ? preview.shiftedPlayer
            : null;

          const activePlayer = lockedPlayer || displayedPreviewPlayer;
          const activeTeamColor = activePlayer
            ? getTeamLogoData(activePlayer.team)?.primaryColor || roleColor
            : roleColor;
          const realPhotoUrl = activePlayer ? getPlayerPhotoUrl(activePlayer.ign) : null;
          const fallbackAgentUrl = activePlayer ? getAgentPortraitUrl(activePlayer.signatureAgent) : null;
          const portraitKey = activePlayer ? `${activePlayer.id}-${activePlayer.ign}` : role;
          const portraitUrl =
            realPhotoUrl && !imgErrors[`photo-${portraitKey}`] ? realPhotoUrl : fallbackAgentUrl;
          const usingRealPhoto = portraitUrl === realPhotoUrl && !!realPhotoUrl;
          const isCutoutPng = usingRealPhoto && portraitUrl!.toLowerCase().endsWith('.png');

          return (
            <div
              key={role}
              id={`lineup-slot-${role.toLowerCase()}`}
              onClick={() => {
                if (lockedPlayer) {
                  playSelectSound();
                  onInspectPlayer(lockedPlayer);
                }
              }}
              className={`group/slot relative h-[96px] md:h-[168px] rounded-[3px] border transition-colors duration-150 overflow-hidden flex flex-col justify-between select-none ${
                lockedPlayer
                  ? 'bg-[#0d1118] border-white/15 cursor-pointer hover:border-white/35'
                  : isPreviewTarget
                  ? 'bg-[#ff4655]/10 border-[#ff4655]'
                  : isShiftedDestination
                  ? 'bg-[#38bdf8]/10 border-[#38bdf8]'
                  : isNextSlot
                  ? 'bg-[#0d1118] border-[#e2b714]/55'
                  : 'bg-[#0d1118] border-white/[0.07]'
              }`}
            >
              {/* Top Role Accent Bar */}
              <div
                className="h-[3px] w-full shrink-0"
                style={{
                  backgroundColor: lockedPlayer
                    ? roleColor
                    : isPreviewTarget
                    ? '#ff4655'
                    : isShiftedDestination
                    ? '#38bdf8'
                    : isNextSlot
                    ? '#e2b714'
                    : 'rgba(255,255,255,0.06)',
                }}
              />

              {/* Top Slot Bar */}
              <div className="relative z-20 h-6 md:h-7 px-1 md:px-2.5 flex items-center justify-between gap-1 md:gap-2 shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <RoleEmblem role={role} size="xs" showBackground={false} />
                  <span
                    className="hidden md:inline font-mono-vct text-xs font-bold uppercase tracking-wider truncate"
                    style={{ color: roleColor }}
                  >
                    {ROLE_NAMES_PT[role]}
                  </span>
                </div>

                {lockedPlayer ? (
                  <button
                    id={`remove-${role.toLowerCase()}-btn`}
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      playSelectSound();
                      onRemovePlayer(role);
                    }}
                    className="p-0.5 md:p-1 rounded-[2px] text-slate-300 hover:text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    title={`Tirar ${lockedPlayer.ign}`}
                    aria-label={`Remover ${lockedPlayer.ign}`}
                  >
                    <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </button>
                ) : isPreviewTarget ? (
                  <span className="hidden md:inline font-mono-vct text-xs font-bold text-[#ff4655] uppercase">
                    Prévia
                  </span>
                ) : isShiftedDestination ? (
                  <span className="hidden md:inline font-mono-vct text-xs font-bold text-[#38bdf8] uppercase">
                    Troca
                  </span>
                ) : isNextSlot ? (
                  <span className="hidden md:inline font-mono-vct text-xs font-bold text-[#e2b714] uppercase">
                    Próximo
                  </span>
                ) : null}
              </div>

              {/* Sticker Portrait Frame */}
              <div className="relative flex-1 min-h-0 flex items-end justify-center overflow-hidden">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: activePlayer
                      ? `radial-gradient(circle at 50% 42%, ${activeTeamColor}45 0%, transparent 76%)`
                      : 'none',
                  }}
                />

                <AnimatePresence mode="wait" initial={false}>
                  {activePlayer ? (
                    <motion.div
                      key={activePlayer.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.14 }}
                      className="relative w-full h-full flex items-end justify-center"
                    >
                      {portraitUrl && !imgErrors[portraitKey] ? (
                        usingRealPhoto && !isCutoutPng ? (
                          <div
                            className="my-auto w-11 h-11 md:w-[114px] md:h-[84px] rounded-[2px] overflow-hidden border relative"
                            style={{
                              background: `radial-gradient(circle at 50% 25%, ${activeTeamColor}45 0%, #0d1118 85%)`,
                              borderColor: `${activeTeamColor}55`,
                            }}
                          >
                            <img
                              src={portraitUrl}
                              alt={activePlayer.ign}
                              onError={() => markImgError(`photo-${portraitKey}`)}
                              className={`w-full h-full object-cover object-top select-none pointer-events-none ${
                                lockedPlayer ? 'opacity-100' : 'opacity-80'
                              }`}
                            />
                            <div className="hidden md:block absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#0b0e14]/70 to-transparent pointer-events-none" />
                          </div>
                        ) : (
                          <img
                            src={portraitUrl}
                            alt={usingRealPhoto ? activePlayer.ign : activePlayer.signatureAgent}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              markImgError(usingRealPhoto ? `photo-${portraitKey}` : portraitKey)
                            }
                            className={`h-full max-h-[48px] md:max-h-[98px] w-auto object-contain object-bottom select-none pointer-events-none ${
                              lockedPlayer ? 'opacity-100' : 'opacity-80'
                            }`}
                          />
                        )
                      ) : (
                        <div className="my-auto">
                          <RoleEmblem role={role} size="sm" />
                        </div>
                      )}

                      {lockedPlayer && (
                        <div className="hidden md:flex absolute top-1 left-2 z-20 items-center gap-1 px-1 py-0.5 rounded-[2px] bg-[#0b0e14]/90 border border-white/10">
                          <TeamLogo teamName={lockedPlayer.team} size="xs" />
                        </div>
                      )}

                      {lockedPlayer?.trait && (
                        <div className="hidden md:block absolute top-1 right-2 z-20">
                          <TraitBadge trait={lockedPlayer.trait} iconOnly size="xs" />
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative w-full h-full flex items-center justify-center"
                    >
                      {silhouette && !imgErrors[`sil-${role}`] && (
                        <img
                          src={silhouette.portraitUrl}
                          alt={silhouette.agentName}
                          referrerPolicy="no-referrer"
                          onError={() => markImgError(`sil-${role}`)}
                          className="hidden md:block absolute inset-x-0 bottom-0 mx-auto h-full max-h-[86px] w-auto object-contain opacity-[0.08] brightness-0 invert pointer-events-none select-none"
                        />
                      )}
                      <div
                        className={`relative z-10 w-7 h-7 md:w-10 md:h-10 rounded-[3px] border flex items-center justify-center ${
                          isNextSlot
                            ? 'bg-[#e2b714]/12 border-[#e2b714]/55'
                            : 'bg-[#11151d] border-white/10 opacity-65'
                        }`}
                      >
                        <RoleEmblem role={role} size="xs" showBackground={false} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Sticker Nameplate */}
              <div className="relative z-20 h-6 md:h-12 px-1 md:px-2.5 bg-[#090c11] border-t border-white/[0.08] flex flex-col justify-center shrink-0">
                {activePlayer ? (
                  <div className="flex items-center justify-center md:justify-between gap-1 md:gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center justify-center md:justify-start gap-1 min-w-0">
                        <span
                          className={`font-display text-sm md:text-xl leading-none tracking-wide truncate ${
                            lockedPlayer ? 'text-white' : 'text-[#e2b714]'
                          }`}
                        >
                          {activePlayer.ign}
                        </span>
                        <span className="hidden md:inline-flex items-center gap-1 shrink-0">
                          <CountryFlag code={activePlayer.countryCode} country={activePlayer.country} size="xs" />
                          {activePlayer.isChampionsWinner && (
                            <Trophy className="w-3 h-3 text-[#e2b714]" aria-hidden />
                          )}
                        </span>
                      </div>
                      <div className="hidden md:block text-xs text-slate-300 truncate leading-tight mt-0.5">
                        {activePlayer.team} · {activePlayer.signatureAgent}
                      </div>
                    </div>
                    {lockedPlayer && (
                      <Check className="hidden md:block w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center md:justify-between gap-2">
                    <span
                      className={`text-xs font-semibold truncate ${
                        isNextSlot ? 'text-[#e2b714]' : 'text-slate-300'
                      }`}
                    >
                      <span className="md:hidden font-mono-vct" style={{ color: roleColor }}>
                        {ROLE_NAMES_PT[role].slice(0, 4)}
                      </span>
                      <span className="hidden md:inline">
                        {isNextSlot ? 'Vaga aberta' : 'Vazio'}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Confetti fire={isComplete} />
    </Card>
  );
};
