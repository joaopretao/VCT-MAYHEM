import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, RotateCcw, Check } from 'lucide-react';
import { Lineup, Role, Player } from '../types';
import { ROLE_NAMES_PT, ROLE_COLORS } from '../data/roleIcons';
import { AGENT_FULL_PORTRAITS, AGENT_ICONS, ROLE_SILHOUETTES } from '../data/agentIcons';
import { getPlayerPhotoUrl } from '../data/playerPhotos';
import { calculateTeamStats } from '../utils/simulation';
import { playSelectSound, playRosterCompleteSound } from '../utils/audio';
import { RoleEmblem } from './RoleEmblem';
import { TeamLogo } from './TeamLogo';
import { TraitBadge } from './TraitBadge';
import { Confetti } from './Confetti';
import { ROLE_ORDER, getNextOpenRole } from './roleOrder';
import { Card, StatPill, PrimaryButton, SecondaryButton } from './ui';

interface LineupBarProps {
  lineup: Lineup;
  hoveredPlayer?: Player | null;
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
  onRemovePlayer,
  onInspectPlayer,
  onClearLineup,
  onStartTournament,
}) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const filledCount = ROLE_ORDER.filter(r => lineup[r]).length;
  const isComplete = filledCount === 5;
  const nextOpenRole = getNextOpenRole(lineup);
  const stats = calculateTeamStats(lineup);
  const prevCompleteRef = React.useRef(false);

  React.useEffect(() => {
    if (isComplete && !prevCompleteRef.current) {
      playRosterCompleteSound();
    }
    prevCompleteRef.current = isComplete;
  }, [isComplete]);

  const preview = computePreviewAssignment(lineup, hoveredPlayer);

  const markImgError = (key: string) => {
    setImgErrors(prev => ({ ...prev, [key]: true }));
  };

  return (
    <Card padding="md" className="relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="vct-slash" aria-hidden />
          <h2 className="font-display text-3xl leading-none text-white tracking-wide uppercase">
            Seu Time
          </h2>
          <span
            className={`font-mono-vct text-xs font-bold px-2 py-0.5 rounded-[2px] border ${
              isComplete
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-white/[0.05] border-white/10 text-slate-300'
            }`}
          >
            {filledCount}/5 {isComplete ? 'fechado' : 'escalados'}
          </span>

          {stats.synergyBonuses.length > 0 && (
            <span className="hidden xl:inline-block font-mono-vct text-xs text-emerald-300 pl-2 border-l border-white/10">
              {stats.synergyBonuses[0]}
            </span>
          )}
        </div>

        {/* StatPills + Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <StatPill
              label="Química"
              value={stats.synergy ? `+${stats.synergy}` : '0'}
              color="#38bdf8"
              title="Sinergia entre jogadores do mesmo time ou composição completa"
            />
            <StatPill
              label="Clutch"
              value={stats.clutch || '--'}
              color="#ff4655"
              title="Média do elenco em rounds decisivos"
            />
          </div>

          {filledCount > 0 && (
            <SecondaryButton
              id="clear-roster-btn"
              size="md"
              onClick={() => {
                playSelectSound();
                onClearLineup();
              }}
              title="Resetar escolhas e começar outro draft"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar</span>
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
            >
              <Trophy className="w-4 h-4" />
              <span>Iniciar Campeonato</span>
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* 5 Album-Sticker Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
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
              className={`group/slot relative h-[174px] rounded-[3px] border transition-colors duration-150 overflow-hidden flex flex-col justify-between select-none ${
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
              <div className="relative z-20 h-7 px-2.5 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <RoleEmblem role={role} size="xs" showBackground={false} />
                  <span
                    className="font-mono-vct text-xs font-bold uppercase tracking-wider truncate"
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
                    className="p-1 rounded-[2px] text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    title={`Tirar ${lockedPlayer.ign}`}
                    aria-label={`Remover ${lockedPlayer.ign}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : isPreviewTarget ? (
                  <span className="font-mono-vct text-xs font-bold text-[#ff4655] uppercase">
                    Prévia
                  </span>
                ) : isShiftedDestination ? (
                  <span className="font-mono-vct text-xs font-bold text-[#38bdf8] uppercase">
                    Troca
                  </span>
                ) : isNextSlot ? (
                  <span className="font-mono-vct text-xs font-bold text-[#e2b714] uppercase">
                    Próximo
                  </span>
                ) : null}
              </div>

              {/* Sticker Portrait Frame */}
              <div className="relative flex-1 min-h-0 flex items-end justify-center overflow-hidden">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: lockedPlayer
                      ? `radial-gradient(circle at 50% 65%, ${roleColor}22 0%, transparent 72%)`
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
                          <div className="my-auto w-[112px] h-[82px] rounded-[2px] overflow-hidden border border-white/15 relative">
                            <img
                              src={portraitUrl}
                              alt={activePlayer.ign}
                              onError={() => markImgError(`photo-${portraitKey}`)}
                              className={`w-full h-full object-cover object-top select-none pointer-events-none ${
                                lockedPlayer ? 'opacity-100' : 'opacity-75'
                              }`}
                            />
                            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#0b0e14]/70 to-transparent pointer-events-none" />
                          </div>
                        ) : (
                          <img
                            src={portraitUrl}
                            alt={usingRealPhoto ? activePlayer.ign : activePlayer.signatureAgent}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              markImgError(usingRealPhoto ? `photo-${portraitKey}` : portraitKey)
                            }
                            className={`h-full max-h-[96px] w-auto object-contain object-bottom select-none pointer-events-none ${
                              lockedPlayer ? 'opacity-100' : 'opacity-75'
                            }`}
                          />
                        )
                      ) : (
                        <div className="my-auto">
                          <RoleEmblem role={role} size="md" />
                        </div>
                      )}

                      {lockedPlayer && (
                        <div className="absolute top-1 left-2 z-20 flex items-center gap-1 px-1 py-0.5 rounded-[2px] bg-[#0b0e14]/90 border border-white/10">
                          <TeamLogo teamName={lockedPlayer.team} size="xs" />
                        </div>
                      )}

                      {lockedPlayer?.trait && (
                        <div className="absolute top-1 right-2 z-20">
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
                          className="absolute inset-x-0 bottom-0 mx-auto h-full max-h-[86px] w-auto object-contain opacity-[0.08] brightness-0 invert pointer-events-none select-none"
                        />
                      )}
                      <div
                        className={`relative z-10 w-10 h-10 rounded-[3px] border flex items-center justify-center ${
                          isNextSlot
                            ? 'bg-[#e2b714]/10 border-[#e2b714]/50'
                            : 'bg-[#11151d] border-white/10 opacity-55'
                        }`}
                      >
                        <RoleEmblem role={role} size="xs" showBackground={false} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Sticker Nameplate */}
              <div className="relative z-20 h-12 px-2.5 bg-[#090c11] border-t border-white/[0.08] flex flex-col justify-center shrink-0">
                {activePlayer ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div
                        className={`font-display text-xl leading-none tracking-wide truncate ${
                          lockedPlayer ? 'text-white' : 'text-[#e2b714]'
                        }`}
                      >
                        {activePlayer.ign}
                      </div>
                      <div className="text-xs text-slate-300 truncate leading-tight mt-0.5">
                        {activePlayer.team} · {activePlayer.signatureAgent}
                      </div>
                    </div>
                    {lockedPlayer && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-semibold truncate ${
                        isNextSlot ? 'text-[#e2b714]' : 'text-slate-400'
                      }`}
                    >
                      {isNextSlot ? 'Vaga aberta' : 'Vazio'}
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
