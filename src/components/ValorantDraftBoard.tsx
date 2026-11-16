import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Team, Player, Lineup, Role } from '../types';
import { ROLE_NAMES_PT, ROLE_COLORS } from '../data/roleIcons';
import { TeamLogo } from './TeamLogo';
import { TraitBadge } from './TraitBadge';
import { PlayerAvatar } from './PlayerAvatar';
import { LineupBar } from './LineupBar';
import { isPlayerBanned } from '../utils/bans';
import { playSelectSound, playRerollSound } from '../utils/audio';
import { RotateCcw, AlertCircle, Info, ShieldAlert, Check } from 'lucide-react';
import { Card, PrimaryButton, SecondaryButton } from './ui';

interface ValorantDraftBoardProps {
  availableTeams: Team[];
  lineup: Lineup;
  rerollsLeft: number;
  bannedPlayers?: Player[];
  onOpenBansModal?: () => void;
  onReroll: () => void;
  onSelectPlayer: (player: Player) => void;
  onInspectPlayer: (player: Player) => void;
  onRemovePlayer: (role: Role) => void;
  onClearLineup: () => void;
  onStartTournament: () => void;
  warningMessage: string | null;
}

export const ValorantDraftBoard: React.FC<ValorantDraftBoardProps> = ({
  availableTeams,
  lineup,
  rerollsLeft,
  bannedPlayers = [],
  onOpenBansModal,
  onReroll,
  onSelectPlayer,
  onInspectPlayer,
  onRemovePlayer,
  onClearLineup,
  onStartTournament,
  warningMessage,
}) => {
  const [localWarning, setLocalWarning] = useState<string | null>(null);
  const [hoveredPlayer, setHoveredPlayer] = useState<Player | null>(null);

  const filledCount = Object.values(lineup).filter(p => p !== null).length;
  const currentRound = Math.min(5, filledCount + 1);
  const isLineupFull = filledCount === 5;
  const batchKey = availableTeams.map(t => t.id).join('|');

  const flashWarning = (msg: string) => {
    setLocalWarning(msg);
    setTimeout(() => setLocalWarning(null), 3000);
  };

  const isPlayerDrafted = (playerId: string) => Object.values(lineup).some(p => p?.id === playerId);

  const getDestinationSlot = (player: Player): { role: Role | null; available: boolean } => {
    if (isPlayerBanned(player, bannedPlayers) || isPlayerDrafted(player.id)) {
      return { role: null, available: false };
    }
    if (!lineup[player.primaryRole]) {
      return { role: player.primaryRole, available: true };
    }
    for (const sec of player.secondaryRoles) {
      if (!lineup[sec]) {
        return { role: sec, available: true };
      }
    }
    if (!lineup.Flex) {
      return { role: 'Flex', available: true };
    }
    const primaryOccupant = lineup[player.primaryRole];
    if (primaryOccupant && primaryOccupant.secondaryRoles.some(alt => !lineup[alt])) {
      return { role: player.primaryRole, available: true };
    }
    const flexOccupant = lineup.Flex;
    if (flexOccupant && [flexOccupant.primaryRole, ...flexOccupant.secondaryRoles].some(alt => !lineup[alt])) {
      return { role: 'Flex', available: true };
    }
    return { role: null, available: false };
  };

  const handleTileClick = (player: Player) => {
    const banned = isPlayerBanned(player, bannedPlayers);
    if (banned) {
      flashWarning(`${player.ign} foi vetado pelo adversário nessa run.`);
      return;
    }
    if (isPlayerDrafted(player.id)) return;
    const slot = getDestinationSlot(player);
    if (slot.available) {
      setHoveredPlayer(null);
      onSelectPlayer(player);
    } else {
      playSelectSound();
      onInspectPlayer(player);
    }
  };

  const activeWarning = warningMessage || localWarning;

  return (
    <div className="flex flex-col gap-4">
      {/* BLOCK 1: LOBBY */}
      <LineupBar
        lineup={lineup}
        hoveredPlayer={hoveredPlayer}
        onRemovePlayer={onRemovePlayer}
        onInspectPlayer={onInspectPlayer}
        onClearLineup={onClearLineup}
        onStartTournament={onStartTournament}
      />

      {/* BLOCK 2: FAIXA DA RODADA */}
      <Card padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="vct-slash" aria-hidden />
              <h2 className="font-display text-3xl sm:text-4xl leading-none text-white tracking-wide uppercase">
                {isLineupFull ? (
                  <span className="text-[#10b981]">Line Fechada · 5/5</span>
                ) : (
                  <>
                    Pick <span className="text-[#ff4655]">{currentRound}</span>
                    <span className="text-slate-400">/5</span>
                  </>
                )}
              </h2>
            </div>

            {/* 5-Segment Progress Bar */}
            <div className="flex gap-1.5 w-36 sm:w-44" aria-label={`Progresso do draft: ${filledCount} de 5`}>
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < filledCount;
                const current = i === filledCount && !isLineupFull;
                return (
                  <div key={i} className="relative h-2 flex-1 rounded-[1px] bg-white/10 overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{ width: filled ? '100%' : '0%' }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="absolute inset-y-0 left-0 bg-[#ff4655]"
                    />
                    {current && <div className="absolute inset-0 bg-[#e2b714]/75" />}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300">
            {activeWarning ? (
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                {activeWarning}
              </span>
            ) : isLineupFull ? (
              'Time pronto. Clique em "Iniciar Campeonato" no lobby acima.'
            ) : (
              'Escolhe um jogador de qualquer uma das 3 equipes.'
            )}
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 flex-wrap sm:justify-end">
          {bannedPlayers.length > 0 && onOpenBansModal && (
            <SecondaryButton
              size="md"
              onClick={() => {
                playSelectSound();
                onOpenBansModal();
              }}
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Vetos ({bannedPlayers.length})</span>
            </SecondaryButton>
          )}

          <div className="flex items-center gap-3">
            <span className="font-mono-vct text-xs sm:text-sm text-slate-300">
              Rerolls:{' '}
              <strong className={rerollsLeft > 0 ? 'text-[#e2b714]' : 'text-slate-400'}>
                {rerollsLeft}
              </strong>
            </span>

            {isLineupFull ? (
              <SecondaryButton
                id="reroll-teams-btn"
                size="md"
                onClick={() => {
                  playRerollSound();
                  onReroll();
                }}
                disabled={rerollsLeft <= 0}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reroll</span>
              </SecondaryButton>
            ) : (
              <PrimaryButton
                id="reroll-teams-btn"
                size="md"
                onClick={() => {
                  playRerollSound();
                  onReroll();
                }}
                disabled={rerollsLeft <= 0}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reroll</span>
              </PrimaryButton>
            )}
          </div>
        </div>
      </Card>

      {/* BLOCK 3: AS 3 EQUIPES */}
      <AnimatePresence mode="wait">
        <motion.div
          key={batchKey}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
        >
          {availableTeams.map((team, idx) => {
            return (
              <motion.div
                key={`${team.id}-${idx}`}
                id={`team-card-${team.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.18 }}
              >
                <Card variant="interactive" padding="md" className="h-full flex flex-col gap-3.5">
                  {/* Team Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
                    <div className="w-11 h-11 rounded-[3px] bg-[#0d1118] border border-white/10 flex items-center justify-center p-1.5 shrink-0">
                      <TeamLogo
                        teamName={team.name}
                        shortName={team.shortName}
                        logoUrl={team.logoUrl}
                        primaryColor={team.primaryColor}
                        size="lg"
                        className="w-full h-full"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-2xl leading-none text-white uppercase tracking-wide truncate">
                          {team.name}
                        </h3>
                        <span className="font-mono-vct text-xs font-bold px-1.5 py-0.5 rounded-[2px] bg-[#0d1118] border border-white/10 text-slate-200">
                          {team.year}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 truncate">
                        {team.region} · {team.editionLabel}
                      </p>
                    </div>
                  </div>

                  {/* 5 Player Rows */}
                  <div className="flex flex-col gap-2">
                    {team.roster.map(player => {
                      const drafted = isPlayerDrafted(player.id);
                      const banned = isPlayerBanned(player, bannedPlayers);
                      const slot = getDestinationSlot(player);
                      const selectable = slot.available;
                      const roleColor = ROLE_COLORS[player.primaryRole] || '#ff4655';

                      let rowCls = '';
                      if (banned) {
                        rowCls = 'bg-[#170c10] border-rose-500/30 opacity-65 cursor-not-allowed';
                      } else if (drafted) {
                        rowCls = 'bg-emerald-950/25 border-emerald-500/35 opacity-75 cursor-default';
                      } else if (selectable) {
                        rowCls =
                          'surface-sub cursor-pointer hover:border-[#ff4655] hover:bg-[#1a151c] focus-visible:border-[#ff4655]';
                      } else {
                        rowCls = 'bg-[#0b0e14] border-white/[0.05] opacity-45 cursor-pointer';
                      }

                      return (
                        <div
                          key={player.id}
                          id={`player-chip-${player.id}`}
                          role="button"
                          tabIndex={0}
                          onMouseEnter={() => {
                            if (selectable) setHoveredPlayer(player);
                          }}
                          onMouseLeave={() => {
                            if (hoveredPlayer?.id === player.id) setHoveredPlayer(null);
                          }}
                          onFocus={() => {
                            if (selectable) setHoveredPlayer(player);
                          }}
                          onBlur={() => {
                            if (hoveredPlayer?.id === player.id) setHoveredPlayer(null);
                          }}
                          onClick={() => handleTileClick(player)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleTileClick(player);
                            }
                          }}
                          className={`group/player relative h-13 rounded-[3px] border px-2.5 flex items-center justify-between gap-2 transition-colors duration-150 outline-none ${rowCls}`}
                        >
                          {/* Left: Player Face + Name + Role + Agent */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <PlayerAvatar player={player} size="sm" />

                            <div className="min-w-0 text-left">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-base font-bold leading-tight truncate ${
                                    banned ? 'text-rose-300 line-through' : 'text-white'
                                  }`}
                                >
                                  {player.ign}
                                </span>
                                {player.trait && !banned && (
                                  <TraitBadge trait={player.trait} iconOnly size="xs" />
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 text-xs leading-tight mt-0.5">
                                <span className="font-bold" style={{ color: roleColor }}>
                                  {ROLE_NAMES_PT[player.primaryRole]}
                                  {player.secondaryRoles.length > 0
                                    ? ` / ${ROLE_NAMES_PT[player.secondaryRoles[0]]}`
                                    : ''}
                                </span>
                                <span className="text-slate-600">·</span>
                                <span className="text-slate-300 truncate">{player.signatureAgent}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Pick label / BANIDO stamp / Status + Info */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {selectable ? (
                              <span className="opacity-0 group-hover/player:opacity-100 group-focus-visible/player:opacity-100 px-2.5 py-1 rounded-[2px] bg-[#ff4655] text-white font-mono-vct text-xs font-bold uppercase tracking-wider transition-opacity">
                                Pegar
                              </span>
                            ) : banned ? (
                              <span className="ban-stamp px-2 py-0.5 font-mono-vct text-xs font-bold uppercase">
                                BANIDO
                              </span>
                            ) : drafted ? (
                              <span className="inline-flex items-center gap-1 text-xs font-mono-vct font-semibold text-emerald-300">
                                <Check className="w-3.5 h-3.5" />
                                No time
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">
                                Cheia
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                playSelectSound();
                                onInspectPlayer(player);
                              }}
                              className="p-1.5 rounded-[2px] text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title={`Perfil de ${player.ign}`}
                              aria-label={`Ver detalhes de ${player.ign}`}
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
