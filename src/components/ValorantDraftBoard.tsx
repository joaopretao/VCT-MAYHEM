import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Team, Player, Lineup, Role } from '../types';
import { ROLE_NAMES_PT, ROLE_COLORS } from '../data/roleIcons';
import { TeamLogo } from './TeamLogo';
import { TraitBadge } from './TraitBadge';
import { RoleEmblem } from './RoleEmblem';
import { PlayerAvatar } from './PlayerAvatar';
import { LineupBar } from './LineupBar';
import { isPlayerBanned } from '../utils/bans';
import { playSelectSound, playRerollSound } from '../utils/audio';
import { RotateCcw, AlertCircle, Info, ShieldAlert, Ban, Check } from 'lucide-react';
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
      flashWarning(`🚫 ${player.ign} foi banido pelo adversário nesta campanha!`);
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
      {/* BLOCK 1: LOBBY / ESCALAÇÃO */}
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
        {/* Left: Round Title + Progress Bar + Small Subtitle below */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="font-display text-3xl sm:text-4xl leading-none text-white tracking-wide">
              {isLineupFull ? (
                <span className="text-[#10b981]">ELENCO COMPLETO · 5/5</span>
              ) : (
                <>
                  RODADA <span className="text-[#ff4655]">{currentRound}</span>
                  <span className="text-slate-400">/5</span>
                </>
              )}
            </h2>

            {/* 5-Segment Progress Bar */}
            <div className="flex gap-1.5 w-36 sm:w-44" aria-label={`Progresso do draft: ${filledCount} de 5`}>
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < filledCount;
                const current = i === filledCount && !isLineupFull;
                return (
                  <div key={i} className="relative h-2.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{ width: filled ? '100%' : '0%' }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="absolute inset-y-0 left-0 rounded-full bg-[#ff4655]"
                    />
                    {current && <div className="absolute inset-0 rounded-full bg-[#e2b714]/80 animate-pulse" />}
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
              'Todos os 5 titulares estão prontos. Clique em "Iniciar Campeonato" no lobby acima.'
            ) : (
              'Escolha 1 jogador de qualquer uma das 3 equipes abaixo para preencher seu lobby.'
            )}
          </p>
        </div>

        {/* Right: Bans Button (if any) + Rerolls Counter + REROLL Button */}
        <div className="flex items-center gap-4 flex-wrap sm:justify-end">
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
              </strong>{' '}
              {rerollsLeft === 1 ? 'restante' : 'restantes'}
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
                className="group"
              >
                <RotateCcw className="w-4 h-4 transition-transform duration-500 group-hover:rotate-[-360deg]" />
                <span>REROLL</span>
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
                className="group"
              >
                <RotateCcw className="w-4 h-4 transition-transform duration-500 group-hover:rotate-[-360deg]" />
                <span>REROLL</span>
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
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          {availableTeams.map((team, idx) => {
            const color = team.primaryColor || '#ff4655';

            return (
              <motion.div
                key={`${team.id}-${idx}`}
                id={`team-card-${team.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.22 }}
              >
                {/* Same uniform border on all 3 team cards; team color only on crest glow */}
                <Card variant="interactive" padding="md" className="h-full flex flex-col gap-4">
                  {/* Standardized Team Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-white/12">
                    <div
                      className="w-12 h-12 rounded-xl bg-black/35 border border-white/15 flex items-center justify-center p-1.5 shrink-0"
                      style={{ boxShadow: `0 0 22px -4px ${color}66` }}
                    >
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
                        <span className="font-mono-vct text-xs font-bold px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-slate-200">
                          {team.year}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 truncate">
                        {team.region} · {team.editionLabel}
                      </p>
                    </div>
                  </div>

                  {/* 5 Compact, Scannable Player Rows */}
                  <div className="flex flex-col gap-2">
                    {team.roster.map(player => {
                      const drafted = isPlayerDrafted(player.id);
                      const banned = isPlayerBanned(player, bannedPlayers);
                      const slot = getDestinationSlot(player);
                      const selectable = slot.available;
                      const roleColor = ROLE_COLORS[player.primaryRole] || '#ff4655';

                      let rowCls = '';
                      if (banned) {
                        rowCls = 'bg-rose-950/25 border-rose-500/30 opacity-50 cursor-not-allowed';
                      } else if (drafted) {
                        rowCls = 'bg-emerald-950/25 border-emerald-500/35 opacity-75 cursor-default';
                      } else if (selectable) {
                        rowCls =
                          'glass-film cursor-pointer hover:border-[#ff4655] hover:bg-[#ff4655]/[0.12] focus-visible:border-[#ff4655]';
                      } else {
                        rowCls = 'bg-white/[0.02] border-white/[0.06] opacity-45 cursor-pointer';
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
                          className={`group/player relative h-13 rounded-xl border px-3 flex items-center justify-between gap-2 transition-colors duration-150 outline-none ${rowCls}`}
                        >
                          {/* Left: Avatar + Name + Role (in role color) + Agent */}
                          <div className="flex items-center gap-3 min-w-0">
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
                                  {player.primaryRole === 'Flex' ? 'Flex' : ROLE_NAMES_PT[player.primaryRole]}
                                  {player.secondaryRoles.length > 0
                                    ? ` / ${
                                        player.secondaryRoles[0] === 'Flex'
                                          ? 'Flex'
                                          : ROLE_NAMES_PT[player.secondaryRoles[0]]
                                      }`
                                    : ''}
                                </span>
                                <span className="text-slate-500">·</span>
                                <span className="text-slate-300 truncate">{player.signatureAgent}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Hover "ESCOLHER" or Status label + small (i) button */}
                          <div className="flex items-center gap-2 shrink-0">
                            {selectable ? (
                              <span className="opacity-0 group-hover/player:opacity-100 group-focus-visible/player:opacity-100 px-2.5 py-1 rounded-lg bg-[#ff4655] text-white font-mono-vct text-xs font-bold uppercase tracking-wider transition-opacity">
                                ESCOLHER
                              </span>
                            ) : banned ? (
                              <span className="inline-flex items-center gap-1 text-xs font-mono-vct font-semibold text-rose-300">
                                <Ban className="w-3.5 h-3.5" />
                                Banido
                              </span>
                            ) : drafted ? (
                              <span className="inline-flex items-center gap-1 text-xs font-mono-vct font-semibold text-emerald-300">
                                <Check className="w-3.5 h-3.5" />
                                Escalado
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">
                                Função preenchida
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                playSelectSound();
                                onInspectPlayer(player);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title={`Ver detalhes de ${player.ign}`}
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
