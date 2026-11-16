import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, RotateCcw, Sparkles, Check } from 'lucide-react';
import { Lineup, Role, Player } from '../types';
import { ROLE_NAMES_PT, ROLE_COLORS } from '../data/roleIcons';
import { AGENT_FULL_PORTRAITS, AGENT_ICONS, ROLE_SILHOUETTES } from '../data/agentIcons';
import { calculateTeamStats } from '../utils/simulation';
import { playSelectSound, playRosterCompleteSound } from '../utils/audio';
import { RoleEmblem } from './RoleEmblem';
import { TeamLogo } from './TeamLogo';
import { TraitBadge } from './TraitBadge';
import { Confetti } from './Confetti';
import { ROLE_ORDER, getNextOpenRole } from './roleOrder';
import { Card, StatPill, PrimaryButton, SecondaryButton, Badge } from './ui';

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
      {/* Lobby Header: Title on left, unified StatPills block + actions on right */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="font-display text-3xl leading-none text-white tracking-wide uppercase">
            SEU LOBBY
          </h2>
          <Badge tone={isComplete ? 'green' : 'gold'}>
            {filledCount}/5 {isComplete ? 'Pronto' : 'Escalados'}
          </Badge>

          {stats.synergyBonuses.length > 0 && (
            <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-white/10">
              {stats.synergyBonuses.slice(0, 2).map((bonus, idx) => (
                <Badge key={idx} tone="green">
                  <Sparkles className="w-3.5 h-3.5" />
                  {bonus}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Unified StatPills block + Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <StatPill
              label="OVR"
              value={filledCount > 0 ? '??' : '--'}
              color="#e2b714"
              title="Rating geral oculto durante o draft"
            />
            <StatPill
              label="QUÍMICA"
              value={stats.synergy ? `+${stats.synergy}` : '0'}
              color="#38bdf8"
              title="Bônus de sinergia entre atletas da mesma equipe/região"
            />
            <StatPill
              label="CLUTCH"
              value={stats.clutch || '--'}
              color="#ff4655"
              title="Média de decisão em rounds críticos"
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
              title="Limpar escalação e reiniciar draft"
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
              className="animate-glow-red"
            >
              <Trophy className="w-4 h-4" />
              <span>INICIAR CAMPEONATO</span>
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* 5 Equal-Sized Lobby Slots (Fixed 172px height so hover never shifts layout) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
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
          const portraitUrl = activePlayer ? getAgentPortraitUrl(activePlayer.signatureAgent) : null;
          const portraitKey = activePlayer ? `${activePlayer.id}-${activePlayer.signatureAgent}` : role;

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
              className={`group/slot relative h-[172px] rounded-xl border transition-colors duration-200 overflow-hidden flex flex-col justify-between select-none ${
                lockedPlayer
                  ? 'glass-film border-white/20 cursor-pointer hover:border-white/35'
                  : isPreviewTarget
                  ? 'bg-[#ff4655]/15 border-[#ff4655]'
                  : isShiftedDestination
                  ? 'bg-[#38bdf8]/15 border-[#38bdf8]'
                  : isNextSlot
                  ? 'bg-[#e2b714]/[0.08] border-[#e2b714]/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
                  : 'glass-film'
              }`}
            >
              {/* Top Role Accent Line */}
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
                    : 'transparent',
                }}
              />

              {/* Slot Top Header (Fixed 28px height) */}
              <div className="relative z-20 h-7 px-3 flex items-center justify-between gap-2 shrink-0">
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
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    title={`Remover ${lockedPlayer.ign}`}
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

              {/* Center Stage: Agent Portrait (Fixed flex-1 area, never shifts) */}
              <div className="relative flex-1 min-h-0 flex items-end justify-center overflow-hidden">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: lockedPlayer
                      ? `radial-gradient(circle at 50% 65%, ${roleColor}2e 0%, transparent 70%)`
                      : isPreviewTarget
                      ? 'radial-gradient(circle at 50% 65%, rgba(255,70,85,0.22) 0%, transparent 70%)'
                      : 'none',
                  }}
                />

                <AnimatePresence mode="wait" initial={false}>
                  {activePlayer ? (
                    <motion.div
                      key={activePlayer.id}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.15 }}
                      className="relative w-full h-full flex items-end justify-center"
                    >
                      {portraitUrl && !imgErrors[portraitKey] ? (
                        <img
                          src={portraitUrl}
                          alt={activePlayer.signatureAgent}
                          referrerPolicy="no-referrer"
                          onError={() => markImgError(portraitKey)}
                          className={`h-full max-h-[92px] w-auto object-contain object-bottom select-none pointer-events-none ${
                            lockedPlayer ? 'opacity-100' : 'opacity-75'
                          }`}
                        />
                      ) : (
                        <div className="my-auto">
                          <RoleEmblem role={role} size="md" />
                        </div>
                      )}

                      {lockedPlayer && (
                        <div className="absolute top-1 left-2.5 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/75 border border-white/10">
                          <TeamLogo teamName={lockedPlayer.team} size="xs" />
                        </div>
                      )}

                      {lockedPlayer?.trait && (
                        <div className="absolute top-1 right-2.5 z-20">
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
                          className="absolute inset-x-0 bottom-0 mx-auto h-full max-h-[88px] w-auto object-contain opacity-[0.1] brightness-0 invert pointer-events-none select-none"
                        />
                      )}
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full border flex items-center justify-center ${
                          isNextSlot
                            ? 'bg-[#e2b714]/15 border-[#e2b714]/50'
                            : 'bg-black/40 border-white/15 opacity-60'
                        }`}
                      >
                        <RoleEmblem role={role} size="xs" showBackground={false} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Nameplate (Fixed 48px height so layout never shifts) */}
              <div className="relative z-20 h-12 px-3 bg-black/35 border-t border-white/10 flex flex-col justify-center shrink-0">
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
                      {isNextSlot ? 'Próxima escolha sugerida' : 'Aguardando escolha'}
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
