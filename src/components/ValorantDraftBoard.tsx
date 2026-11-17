import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CardFrameId, Team, Player, Lineup, Role, MayhemBonus, RunRuleId, UserTeamIdentity } from '../types';
import { ROLE_NAMES_PT, ROLE_COLORS } from '../data/roleIcons';
import { TeamLogo } from './TeamLogo';
import { TraitBadge } from './TraitBadge';
import { PlayerAvatar } from './PlayerAvatar';
import { CountryFlag } from './CountryFlag';
import { LineupBar } from './LineupBar';
import { isPlayerBanned } from '../utils/bans';
import { getRunRuleMeta, isPlayerEligibleForRule, isPlayerInLineup } from '../utils/runRules';
import { playSelectSound } from '../utils/audio';
import { Info, Check, Trophy } from 'lucide-react';
import { Card } from './ui';

interface ValorantDraftBoardProps {
  availableTeams: Team[];
  lineup: Lineup;
  rerollsLeft: number;
  selectedBonuses?: MayhemBonus[];
  teamIdentity?: UserTeamIdentity;
  frameId?: CardFrameId;
  runRule?: RunRuleId;
  seed?: string;
  isDaily?: boolean;
  onCopySeedUrl?: () => void;
  seedCopied?: boolean;
  onEditTeamIdentity?: () => void;
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
  selectedBonuses = [],
  teamIdentity,
  frameId = 'default',
  runRule = 'standard',
  seed,
  isDaily = false,
  onCopySeedUrl,
  seedCopied = false,
  onEditTeamIdentity,
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
  const [mobileTeamIdx, setMobileTeamIdx] = useState<number>(0);

  const batchKey = availableTeams.map(t => t.id).join('|');

  useEffect(() => {
    setMobileTeamIdx(0);
  }, [batchKey]);

  const flashWarning = (msg: string) => {
    setLocalWarning(msg);
    setTimeout(() => setLocalWarning(null), 3000);
  };

  const isPlayerDrafted = (player: Player) => isPlayerInLineup(player, lineup);

  const getDestinationSlot = (player: Player): { role: Role | null; available: boolean } => {
    if (!isPlayerEligibleForRule(player, runRule)) {
      return { role: null, available: false };
    }
    if (isPlayerBanned(player, bannedPlayers) || isPlayerDrafted(player)) {
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
    if (!isPlayerEligibleForRule(player, runRule)) {
      flashWarning(`${player.ign} não participa desta regra (${getRunRuleMeta(runRule).label}).`);
      return;
    }
    const banned = isPlayerBanned(player, bannedPlayers);
    if (banned) {
      flashWarning(`${player.ign} foi vetado pelo adversário nessa run.`);
      return;
    }
    if (isPlayerDrafted(player)) return;
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
    <div className="flex flex-col gap-2.5 md:gap-4">
      {/* BLOCK 1: UNIFIED LOBBY + PICK STRIP */}
      <LineupBar
        lineup={lineup}
        hoveredPlayer={hoveredPlayer}
        selectedBonuses={selectedBonuses}
        teamIdentity={teamIdentity}
        frameId={frameId}
        runRule={runRule}
        seed={seed}
        isDaily={isDaily}
        onCopySeedUrl={onCopySeedUrl}
        seedCopied={seedCopied}
        onEditTeamIdentity={onEditTeamIdentity}
        rerollsLeft={rerollsLeft}
        bannedPlayers={bannedPlayers}
        onOpenBansModal={onOpenBansModal}
        onReroll={onReroll}
        warningMessage={activeWarning}
        onRemovePlayer={onRemovePlayer}
        onInspectPlayer={onInspectPlayer}
        onClearLineup={onClearLineup}
        onStartTournament={onStartTournament}
      />

      {/* MOBILE ONLY (< lg): 3-Team Tab Switcher so there is no 1,000px vertical team stack */}
      {availableTeams.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 lg:hidden">
          {availableTeams.map((team, idx) => {
            const active = idx === mobileTeamIdx;
            return (
              <button
                key={`${team.id}-tab-${idx}`}
                type="button"
                onClick={() => {
                  playSelectSound();
                  setMobileTeamIdx(idx);
                }}
                className={`px-2 py-2 rounded-[3px] border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#161c26] border-[#ff4655] text-white'
                    : 'bg-[#0d1118] border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <TeamLogo
                  teamName={team.name}
                  shortName={team.shortName}
                  logoUrl={team.logoUrl}
                  primaryColor={team.primaryColor}
                  size="sm"
                  showGlow={active}
                  className="shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-display text-base leading-none uppercase truncate">
                    {team.shortName || team.name}
                  </div>
                  <div className="text-xs font-mono-vct text-slate-300 leading-none mt-0.5">
                    '{team.year.toString().slice(2)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* BLOCK 2: AS 3 EQUIPES */}
      <AnimatePresence mode="wait">
        <motion.div
          key={batchKey}
          className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4"
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
                className={idx === mobileTeamIdx ? 'block' : 'hidden lg:block'}
              >
                <Card variant="interactive" padding="none" className="p-3 md:p-4 h-full flex flex-col gap-2.5 md:gap-3.5">
                  {/* Team Header */}
                  <div className="flex items-center gap-3.5 pb-2.5 md:pb-3 border-b border-white/[0.08]">
                    <div
                      className="w-14 h-14 rounded-[4px] border flex items-center justify-center p-2 shrink-0"
                      style={{
                        background: `radial-gradient(circle, ${team.primaryColor}30 0%, #0d1118 78%)`,
                        borderColor: `${team.primaryColor}55`,
                        boxShadow: `0 0 18px -4px ${team.primaryColor}55`,
                      }}
                    >
                      <TeamLogo
                        teamName={team.name}
                        shortName={team.shortName}
                        logoUrl={team.logoUrl}
                        primaryColor={team.primaryColor}
                        size="lg"
                        showGlow
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
                      <p className="text-xs text-slate-300 mt-1 truncate">
                        {team.region} · {team.editionLabel}
                      </p>
                    </div>
                  </div>

                  {/* 5 Player Rows */}
                  <div className="flex flex-col gap-2">
                    {team.roster.map(player => {
                      const drafted = isPlayerDrafted(player);
                      const banned = isPlayerBanned(player, bannedPlayers);
                      const ruleBlocked = !isPlayerEligibleForRule(player, runRule);
                      const slot = getDestinationSlot(player);
                      const selectable = slot.available;
                      const roleColor = ROLE_COLORS[player.primaryRole] || '#ff4655';

                      let rowCls = '';
                      if (banned) {
                        rowCls = 'bg-[#170c10] border-rose-500/30 opacity-65 cursor-not-allowed';
                      } else if (ruleBlocked) {
                        rowCls = 'bg-[#0b0e14] border-white/[0.05] opacity-40 cursor-not-allowed';
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
                          className={`group/player relative min-h-[64px] rounded-[3px] border px-2.5 py-1.5 flex items-center justify-between gap-2.5 transition-colors duration-150 outline-none ${rowCls}`}
                        >
                          {/* Left: Player Face + Name + Flag + Champion + Role + Agent */}
                          <div className="flex items-center gap-3 min-w-0">
                            <PlayerAvatar
                              player={player}
                              size="draft"
                              teamColor={team.primaryColor}
                            />

                            <div className="min-w-0 text-left">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className={`text-base font-bold leading-tight truncate ${
                                    banned ? 'text-rose-300 line-through' : 'text-white'
                                  }`}
                                >
                                  {player.ign}
                                </span>
                                <CountryFlag
                                  code={player.countryCode}
                                  country={player.country}
                                  size="sm"
                                />
                                {player.isChampionsWinner && (
                                  <span
                                    title="Campeão do VALORANT Champions"
                                    className="inline-flex shrink-0"
                                  >
                                    <Trophy className="w-3.5 h-3.5 text-[#e2b714]" aria-label="Campeão" />
                                  </span>
                                )}
                                {player.trait && !banned && (
                                  <TraitBadge trait={player.trait} iconOnly size="xs" />
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 text-xs leading-tight mt-0.5">
                                <span className="font-bold shrink-0" style={{ color: roleColor }}>
                                  {ROLE_NAMES_PT[player.primaryRole]}
                                  {player.secondaryRoles.length > 0
                                    ? ` / ${ROLE_NAMES_PT[player.secondaryRoles[0]]}`
                                    : ''}
                                </span>
                                <span className="text-slate-500">·</span>
                                <span className="text-slate-200 truncate">{player.signatureAgent}</span>
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
                            ) : ruleBlocked ? (
                              <span className="text-[11px] font-mono-vct text-slate-300">
                                Fora
                              </span>
                            ) : drafted ? (
                              <span className="inline-flex items-center gap-1 text-xs font-mono-vct font-semibold text-emerald-300">
                                <Check className="w-3.5 h-3.5" />
                                No time
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300">
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
                              className="p-1.5 rounded-[2px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
