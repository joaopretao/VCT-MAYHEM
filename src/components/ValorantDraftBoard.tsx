import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CardFrameId, Team, Player, Lineup, Role, MayhemBonus, RunRuleId, UserTeamIdentity } from '../types';
import { ROLE_NAMES_PT, ROLE_COLORS } from '../data/roleIcons';
import { AGENT_FULL_PORTRAITS, AGENT_ICONS } from '../data/agentIcons';
import { getPlayerPhotoUrl } from '../data/playerPhotos';
import { TeamLogo } from './TeamLogo';
import { TraitBadge } from './TraitBadge';
import { RoleEmblem } from './RoleEmblem';
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
  const [photoErrors, setPhotoErrors] = useState<Record<string, boolean>>({});

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
                <Card
                  variant="interactive"
                  padding="none"
                  className="overflow-hidden h-full flex flex-col"
                >
                  {/* Top Team Accent Line */}
                  <div
                    className="h-[2px] w-full shrink-0"
                    style={{ backgroundColor: team.primaryColor }}
                    aria-hidden
                  />

                  {/* Team Header */}
                  <div
                    className="flex items-center gap-3.5 px-3.5 py-3 border-b border-white/[0.09]"
                    style={{
                      background: `linear-gradient(90deg, ${team.primaryColor}20 0%, rgba(6,10,17,0.45) 75%)`,
                    }}
                  >
                    <div
                      className="w-13 h-13 rounded-[4px] border flex items-center justify-center p-1.5 shrink-0"
                      style={{
                        background: `radial-gradient(circle, ${team.primaryColor}30 0%, #070b12 80%)`,
                        borderColor: `${team.primaryColor}60`,
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
                        <span className="font-mono-vct text-xs font-bold px-1.5 py-0.5 rounded-[2px] bg-[#06090f]/80 border border-white/12 text-slate-200">
                          {team.year}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 truncate">
                        {team.region} · {team.editionLabel}
                      </p>
                    </div>
                  </div>

                  {/* 5 Crisp Agent-Backdrop Player Banners */}
                  <div className="flex flex-col gap-2 p-2.5 md:p-3 flex-1">
                    {team.roster.map(player => {
                      const drafted = isPlayerDrafted(player);
                      const banned = isPlayerBanned(player, bannedPlayers);
                      const ruleBlocked = !isPlayerEligibleForRule(player, runRule);
                      const slot = getDestinationSlot(player);
                      const selectable = slot.available;
                      const roleColor = ROLE_COLORS[player.primaryRole] || '#ff4655';
                      const agentPortrait = player.signatureAgent
                        ? AGENT_FULL_PORTRAITS[player.signatureAgent]
                        : null;
                      const photoUrl = getPlayerPhotoUrl(player.ign);
                      const photoFailed = Boolean(photoErrors[player.id]);
                      const agentIcon = player.signatureAgent
                        ? AGENT_ICONS[player.signatureAgent]
                        : null;

                      let rowCls = '';
                      let edgeColor = team.primaryColor;
                      if (banned) {
                        rowCls = 'bg-[#170c10]/85 border-rose-500/35 opacity-70 cursor-not-allowed';
                        edgeColor = '#f43f5e';
                      } else if (ruleBlocked) {
                        rowCls = 'bg-[#070b12]/70 border-white/[0.06] opacity-45 cursor-not-allowed';
                        edgeColor = '#475569';
                      } else if (drafted) {
                        rowCls = 'bg-emerald-950/35 border-emerald-500/45 opacity-85 cursor-default';
                        edgeColor = '#10b981';
                      } else if (selectable) {
                        rowCls =
                          'bg-[#070b12]/82 border-white/[0.12] cursor-pointer hover:border-[#ff4655] focus-visible:border-[#ff4655]';
                      } else {
                        rowCls = 'bg-[#070b12]/65 border-white/[0.06] opacity-50 cursor-pointer';
                      }

                      return (
                        <motion.div
                          key={player.id}
                          id={`player-chip-${player.id}`}
                          role="button"
                          tabIndex={0}
                          whileTap={selectable ? { scale: 0.985 } : undefined}
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
                          className={`group/player relative h-[68px] rounded-[4px] border overflow-hidden flex items-stretch transition-colors duration-150 outline-none ${rowCls}`}
                        >
                          {drafted && <div className="vct-sheen-once z-30" aria-hidden />}
                          {/* Left 3px Accent Edge */}
                          <div
                            className="absolute inset-y-0 left-0 w-[3px] z-20"
                            style={{ backgroundColor: edgeColor }}
                            aria-hidden
                          />

                          {/* Flush Outer-Left Player Photo Square */}
                          <div
                            className="relative w-[62px] sm:w-[66px] h-full shrink-0 border-r border-white/12 overflow-hidden flex items-center justify-center"
                            style={{
                              background: `radial-gradient(circle at 50% 25%, ${team.primaryColor}40 0%, #070b12 88%)`,
                            }}
                          >
                            {photoUrl && !photoFailed ? (
                              <img
                                src={photoUrl}
                                alt={player.ign}
                                loading="lazy"
                                onError={() =>
                                  setPhotoErrors(prev => ({ ...prev, [player.id]: true }))
                                }
                                className={`w-full h-full object-cover object-top select-none ${
                                  banned || ruleBlocked ? 'grayscale opacity-75' : ''
                                }`}
                              />
                            ) : agentIcon ? (
                              <img
                                src={agentIcon}
                                alt={player.signatureAgent}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover p-1.5 select-none"
                              />
                            ) : (
                              <RoleEmblem role={player.primaryRole} size="sm" showBackground={false} />
                            )}
                            <div
                              className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#06090f]/80 to-transparent"
                              aria-hidden
                            />
                          </div>

                          {/* Wide Banner with Crisp Agent in Background ("Boneco no fundo") */}
                          <div className="relative flex-1 min-w-0 px-2.5 sm:px-3 py-1.5 flex items-center justify-between gap-2 overflow-hidden">
                            {agentPortrait && (
                              <img
                                src={agentPortrait}
                                alt=""
                                aria-hidden="true"
                                referrerPolicy="no-referrer"
                                className={`pointer-events-none select-none absolute right-[-8%] top-[-18%] h-[185%] w-auto max-w-none object-contain transition-all duration-200 ${
                                  banned || ruleBlocked
                                    ? 'grayscale opacity-15'
                                    : selectable
                                    ? 'opacity-45 group-hover/player:opacity-75 group-hover/player:-translate-x-1'
                                    : 'opacity-35'
                                }`}
                              />
                            )}

                            {/* Directional Dark Readability Veil */}
                            <div
                              className="pointer-events-none absolute inset-0"
                              style={{
                                background:
                                  'linear-gradient(90deg, rgba(6,10,17,0.92) 0%, rgba(6,10,17,0.68) 60%, rgba(6,10,17,0.28) 100%)',
                              }}
                              aria-hidden
                            />

                            {/* Left Foreground Info */}
                            <div className="relative z-10 min-w-0 text-left">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className={`font-display text-xl sm:text-[22px] leading-none uppercase tracking-wide truncate drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] ${
                                    banned ? 'text-rose-300 line-through' : 'text-white'
                                  }`}
                                >
                                  {player.ign}
                                </span>
                                <CountryFlag
                                  code={player.countryCode}
                                  country={player.country}
                                  size="xs"
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

                              <div className="flex items-center gap-1.5 text-[11px] font-mono-vct leading-tight mt-0.5">
                                <span className="font-bold uppercase shrink-0" style={{ color: roleColor }}>
                                  {ROLE_NAMES_PT[player.primaryRole]}
                                  {player.secondaryRoles.length > 0
                                    ? ` / ${ROLE_NAMES_PT[player.secondaryRoles[0]].slice(0, 4)}`
                                    : ''}
                                </span>
                                <span className="text-slate-500">·</span>
                                <span className="text-slate-200 truncate">{player.signatureAgent}</span>
                              </div>
                            </div>

                            {/* Right Action / Status + Info */}
                            <div className="relative z-10 flex items-center gap-1 shrink-0">
                              {selectable ? (
                                <span className="opacity-0 group-hover/player:opacity-100 group-focus-visible/player:opacity-100 px-2 py-1 rounded-[2px] bg-[#ff4655] text-white font-mono-vct text-[11px] font-bold uppercase tracking-wider transition-opacity shadow-md">
                                  Pegar
                                </span>
                              ) : banned ? (
                                <span className="ban-stamp px-1.5 py-0.5 font-mono-vct text-[10px] font-bold uppercase">
                                  BANIDO
                                </span>
                              ) : ruleBlocked ? (
                                <span className="text-[11px] font-mono-vct text-slate-300 bg-[#06090f]/80 px-1.5 py-0.5 rounded-[2px]">
                                  Fora
                                </span>
                              ) : drafted ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono-vct font-semibold text-emerald-300 bg-[#06090f]/80 px-1.5 py-0.5 rounded-[2px] border border-emerald-500/30">
                                  <Check className="w-3 h-3" />
                                  No time
                                </span>
                              ) : (
                                <span className="text-[11px] font-mono-vct text-slate-300 bg-[#06090f]/80 px-1.5 py-0.5 rounded-[2px]">
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
                                className="p-1.5 rounded-[2px] bg-[#06090f]/75 border border-white/10 text-slate-200 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
                                title={`Perfil de ${player.ign}`}
                                aria-label={`Ver detalhes de ${player.ign}`}
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
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
