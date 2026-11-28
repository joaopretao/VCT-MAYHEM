import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { X, Trophy, CheckCircle, Shield, Calendar } from 'lucide-react';
import { Player, Lineup, Role } from '../types';
import { playLockSound, playSelectSound } from '../utils/audio';
import { isPlayerInLineup } from '../utils/runRules';
import { TeamLogo } from './TeamLogo';
import { RoleEmblem } from './RoleEmblem';
import { TraitBadge } from './TraitBadge';
import { CountryFlag } from './CountryFlag';
import { ROLE_COLORS, ROLE_NAMES_PT } from '../data/roleIcons';
import { AGENT_FULL_PORTRAITS, AGENT_ICONS } from '../data/agentIcons';
import { getPlayerPhotoUrl } from '../data/playerPhotos';
import { getTeamLogoData } from '../data/teamLogos';
import { Card } from './ui';

interface PlayerModalProps {
  player: Player | null;
  lineup: Lineup;
  onClose: () => void;
  onAssignToRole: (player: Player, role: Role) => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  player,
  lineup,
  onClose,
  onAssignToRole,
}) => {
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    setPhotoError(false);
  }, [player?.id]);

  useEffect(() => {
    if (!player) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [player, onClose]);

  if (!player || typeof document === 'undefined') return null;

  // Determine compatible slots
  const availableSlots: Role[] = [];
  const isCurrentlyIn = Object.entries(lineup).find(([_, p]) => p?.id === player.id)?.[0] as
    | Role
    | undefined;
  const isAnotherEditionIn = !isCurrentlyIn && isPlayerInLineup(player, lineup);

  const compatibleRoles: Role[] = Array.from(
    new Set([player.primaryRole, ...player.secondaryRoles, 'Flex' as Role])
  );

  if (!isCurrentlyIn && !isAnotherEditionIn) {
    if (!lineup[player.primaryRole]) availableSlots.push(player.primaryRole);
    if (!lineup.Flex && !availableSlots.includes('Flex')) availableSlots.push('Flex');
    for (const sec of player.secondaryRoles) {
      if (!lineup[sec] && !availableSlots.includes(sec)) availableSlots.push(sec);
    }
  } else {
    for (const r of compatibleRoles) {
      if (r !== isCurrentlyIn) {
        const occupant = lineup[r];
        const occupantCompatibleWithOld =
          !occupant ||
          isCurrentlyIn === 'Flex' ||
          occupant.primaryRole === isCurrentlyIn ||
          occupant.secondaryRoles.includes(isCurrentlyIn);
        if (occupantCompatibleWithOld) {
          availableSlots.push(r);
        }
      }
    }
  }

  const photoUrl = getPlayerPhotoUrl(player.ign);
  const agentPortrait = player.signatureAgent
    ? AGENT_FULL_PORTRAITS[player.signatureAgent]
    : null;
  const agentIcon = player.signatureAgent ? AGENT_ICONS[player.signatureAgent] : null;
  const teamAccent =
    getTeamLogoData(player.team)?.primaryColor || ROLE_COLORS[player.primaryRole] || '#ff4655';
  const roleColor = ROLE_COLORS[player.primaryRole] || '#ff4655';

  const attributes = [
    { label: 'Consistência', value: player.consistency, bar: '#38bdf8', text: 'text-sky-300' },
    { label: 'Clutch', value: player.clutch, bar: '#e2b714', text: 'text-amber-300' },
    { label: 'Sinergia', value: player.synergy, bar: '#10b981', text: 'text-emerald-300' },
    { label: 'Flexibilidade', value: player.flexibility, bar: '#a855f7', text: 'text-purple-300' },
  ];

  return createPortal(
    <div
      onClick={() => {
        playSelectSound();
        onClose();
      }}
      className="fixed inset-0 z-[75] bg-black/82 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl my-auto"
      >
        <Card
          variant="modal"
          padding="none"
          className="w-full text-white overflow-hidden border-white/15 bg-[#090d16] shadow-[0_24px_70px_-15px_rgba(0,0,0,0.9)]"
        >
          {/* Top Team Accent Strip */}
          <div className="h-[3px] w-full" style={{ backgroundColor: teamAccent }} aria-hidden />

          {/* VCT Broadcast Hero Banner: [Flush Photo] | [Crisp Info + Agent Backdrop] */}
          <div className="relative flex items-stretch min-h-[126px] sm:min-h-[138px] border-b border-white/10 overflow-hidden bg-[#060911]">
            {/* Left 3px Team Edge */}
            <div
              className="absolute inset-y-0 left-0 w-[3px] z-30"
              style={{ backgroundColor: teamAccent }}
              aria-hidden
            />

            {/* Flush Player Photo Square */}
            <div
              className="relative w-[108px] sm:w-[126px] shrink-0 border-r border-white/12 overflow-hidden flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 50% 25%, ${teamAccent}45 0%, #070b12 88%)`,
              }}
            >
              {photoUrl && !photoError ? (
                <img
                  src={photoUrl}
                  alt={player.ign}
                  onError={() => setPhotoError(true)}
                  className="w-full h-full object-cover object-top select-none"
                />
              ) : agentIcon ? (
                <img
                  src={agentIcon}
                  alt={player.signatureAgent}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover p-2 select-none"
                />
              ) : (
                <RoleEmblem role={player.primaryRole} size="lg" showBackground={false} />
              )}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-[#060911]/85 to-transparent"
                aria-hidden
              />
            </div>

            {/* Right Banner Content over Crisp Agent Artwork ("Boneco no fundo", Zero Blur) */}
            <div className="relative flex-1 min-w-0 px-4 sm:px-5 py-3.5 flex flex-col justify-center overflow-hidden">
              {agentPortrait && (
                <img
                  src={agentPortrait}
                  alt=""
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                  className="pointer-events-none select-none absolute right-[-6%] top-[-16%] h-[190%] w-auto max-w-none object-contain opacity-55"
                />
              )}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, rgba(6,9,17,0.95) 0%, rgba(6,9,17,0.74) 58%, ${teamAccent}22 100%)`,
                }}
                aria-hidden
              />

              {/* Close button */}
              <button
                type="button"
                onClick={() => {
                  playSelectSound();
                  onClose();
                }}
                className="absolute top-3 right-3 z-20 p-1.5 rounded-[3px] text-slate-300 hover:text-white bg-[#060911]/85 hover:bg-[#101624] border border-white/15 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10 pr-8 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-vct px-2 py-0.5 rounded-[2px] bg-[#060911]/90 text-slate-200 font-semibold border border-white/12">
                    <CountryFlag code={player.countryCode} country={player.country} size="xs" />
                    <span>{player.country}</span>
                  </span>
                  {player.isChampionsWinner && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono-vct px-2 py-0.5 rounded-[2px] bg-[#e2b714]/20 text-[#fde047] border border-[#e2b714]/45 font-bold uppercase">
                      <Trophy className="w-3 h-3 text-[#e2b714]" />
                      <span>Campeão</span>
                    </span>
                  )}
                </div>

                <h3 className="text-4xl sm:text-[42px] font-display font-bold uppercase text-white tracking-wide leading-[0.9] truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  {player.ign}
                </h3>

                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-200 flex-wrap">
                  <span className="text-slate-300">{player.name}</span>
                  <span className="text-slate-600">·</span>
                  <span className="inline-flex items-center gap-1.5 text-white font-semibold">
                    <TeamLogo teamName={player.team} size="xs" />
                    <span>
                      {player.team} '{String(player.year).slice(2)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5 space-y-3.5">
            {/* Compact Role / Agent / Editions Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="rounded-[4px] bg-[#060a12] border border-white/[0.09] px-3 py-2.5">
                <span className="font-mono-vct text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Função Principal
                </span>
                <div className="flex items-center gap-1.5">
                  <RoleEmblem role={player.primaryRole} size="xs" showBackground={false} />
                  <span className="font-display text-lg leading-none uppercase tracking-wide" style={{ color: roleColor }}>
                    {ROLE_NAMES_PT[player.primaryRole] || player.primaryRole}
                  </span>
                </div>
                {player.secondaryRoles.length > 0 && (
                  <span className="block font-mono-vct text-[10px] text-slate-400 mt-1 truncate">
                    Alt: {player.secondaryRoles.map(r => ROLE_NAMES_PT[r] || r).join(', ')}
                  </span>
                )}
              </div>

              <div className="rounded-[4px] bg-[#060a12] border border-white/[0.09] px-3 py-2.5">
                <span className="font-mono-vct text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Agente Assinatura
                </span>
                <div className="flex items-center gap-1.5">
                  {agentIcon && (
                    <img
                      src={agentIcon}
                      alt={player.signatureAgent}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-[2px] object-cover border border-white/15 shrink-0"
                    />
                  )}
                  <span className="font-display text-lg leading-none uppercase tracking-wide text-[#fde047] truncate">
                    {player.signatureAgent}
                  </span>
                </div>
                <span className="block font-mono-vct text-[10px] text-slate-400 mt-1">
                  Especialidade
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-[4px] bg-[#060a12] border border-white/[0.09] px-3 py-2.5">
                <span className="font-mono-vct text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Champions
                </span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span className="font-mono-vct text-xs font-bold text-white truncate">
                    {player.championsYears.join(' · ')}
                  </span>
                </div>
                <span className="block font-mono-vct text-[10px] text-slate-400 mt-1">
                  {player.championsYears.length === 1
                    ? '1 participação'
                    : `${player.championsYears.length} participações`}
                </span>
              </div>
            </div>

            {/* Clean Attributes Grid (Without "Overall / Oculto no draft") */}
            <div className="rounded-[4px] bg-[#060a12] border border-white/[0.09] p-3.5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs font-mono-vct">
                {attributes.map(attr => (
                  <div key={attr.label}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[11px] uppercase tracking-wider text-slate-300">
                        {attr.label}
                      </span>
                      <span className={`font-bold tabular-nums ${attr.text}`}>{attr.value}</span>
                    </div>
                    <div className="w-full bg-[#151c29] rounded-[1px] h-1.5 overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{ width: `${attr.value}%`, backgroundColor: attr.bar }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trait Section (Full highlight when present, sleek compact bar when standard) */}
            {player.trait ? (
              <div
                className="relative overflow-hidden rounded-[4px] bg-[#060a12] border p-3.5 pl-4"
                style={{ borderColor: player.trait.badgeBorder }}
              >
                <div
                  className="absolute inset-y-0 left-0 w-[3px]"
                  style={{ backgroundColor: player.trait.color }}
                  aria-hidden
                />
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" style={{ color: player.trait.color }} />
                    <span className="text-[11px] font-mono-vct font-bold text-white uppercase tracking-wider">
                      Característica Especial
                    </span>
                  </div>
                  <span
                    className="text-[10px] uppercase px-2 py-0.5 rounded-[2px] font-bold font-mono-vct"
                    style={{
                      color: player.trait.color,
                      backgroundColor: player.trait.badgeBg,
                      border: `1px solid ${player.trait.badgeBorder}`,
                    }}
                  >
                    {player.trait.rarity}
                  </span>
                </div>
                <TraitBadge trait={player.trait} size="md" showDescription={true} />
              </div>
            ) : (
              <div className="px-3 py-2 rounded-[4px] bg-[#060a12] border border-white/[0.07] flex items-center justify-between text-[11px] font-mono-vct text-slate-400">
                <span className="uppercase tracking-wider">Característica</span>
                <span className="text-slate-300">Padrão</span>
              </div>
            )}

            {/* Action Footer: Clean Uniform Grid for Role Selection */}
            <div className="pt-1">
              {isCurrentlyIn ? (
                <div className="space-y-2.5">
                  <div className="w-full py-2.5 px-3 rounded-[4px] bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-center text-xs font-mono-vct font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Escalado como {ROLE_NAMES_PT[isCurrentlyIn] || isCurrentlyIn}</span>
                  </div>
                  {availableSlots.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="font-mono-vct text-[11px] uppercase tracking-wider text-slate-400 block">
                        Mover {player.ign} para outra vaga
                      </span>
                      <div
                        className={`grid gap-2 ${
                          availableSlots.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                        }`}
                      >
                        {availableSlots.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              playSelectSound();
                              onAssignToRole(player, slot);
                              onClose();
                            }}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-[3px] bg-[#0e1522] hover:bg-[#162033] border border-white/15 hover:border-white/30 text-xs font-mono-vct font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
                          >
                            <RoleEmblem role={slot} size="xs" showBackground={false} />
                            <span>Mover · {ROLE_NAMES_PT[slot] || slot}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : isAnotherEditionIn ? (
                <div className="w-full py-2.5 px-3 rounded-[4px] bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-center text-xs font-mono-vct font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{player.ign} já está escalado no seu time (outra edição)</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="space-y-2">
                  <span className="font-mono-vct text-[11px] uppercase tracking-wider text-slate-300 block">
                    Escalar <strong className="text-white">{player.ign}</strong> como:
                  </span>
                  <div
                    className={`grid gap-2 ${
                      availableSlots.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                    }`}
                  >
                    {availableSlots.map(slot => {
                      const isPrimary = slot === player.primaryRole;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            playLockSound();
                            onAssignToRole(player, slot);
                            onClose();
                          }}
                          className={`group relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-[3px] border text-xs font-mono-vct font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.985] ${
                            isPrimary
                              ? 'bg-[#ff4655] hover:bg-[#e63947] border-white/20 text-white shadow-md'
                              : 'bg-[#101624] hover:bg-[#192235] border-white/15 hover:border-[#ff4655]/70 text-slate-100'
                          }`}
                        >
                          <RoleEmblem role={slot} size="xs" showBackground={false} />
                          <span className="truncate">{ROLE_NAMES_PT[slot] || slot}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="w-full py-2.5 rounded-[4px] bg-[#060a12] border border-white/10 text-slate-400 text-center text-xs font-mono-vct">
                  Todas as funções compatíveis já estão ocupadas.
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>,
    document.body
  );
};
