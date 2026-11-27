import React from 'react';
import { X, Award, Crosshair, CheckCircle, Zap, Shield } from 'lucide-react';
import { Player, Lineup, Role } from '../types';
import { playLockSound, playSelectSound } from '../utils/audio';
import { isPlayerInLineup } from '../utils/runRules';
import { TeamLogo } from './TeamLogo';
import { RoleEmblem } from './RoleEmblem';
import { TraitBadge } from './TraitBadge';
import { PlayerAvatar } from './PlayerAvatar';
import { CountryFlag } from './CountryFlag';
import { ROLE_COLORS, ROLE_NAMES_PT } from '../data/roleIcons';
import { AGENT_FULL_PORTRAITS } from '../data/agentIcons';
import { getTeamLogoData } from '../data/teamLogos';
import { Card, PrimaryButton, SecondaryButton } from './ui';

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
  if (!player) return null;

  // Determine compatible slots
  const availableSlots: Role[] = [];
  const isCurrentlyIn = Object.entries(lineup).find(([_, p]) => p?.id === player.id)?.[0] as Role | undefined;
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

  const agentPortrait = player.signatureAgent
    ? AGENT_FULL_PORTRAITS[player.signatureAgent]
    : null;
  const teamAccent = getTeamLogoData(player.team)?.primaryColor || ROLE_COLORS[player.primaryRole] || '#ff4655';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <Card variant="modal" padding="none" className="w-full max-w-lg text-white animate-popIn overflow-hidden">
        {/* Top Team Accent Line */}
        <div className="h-[2px] w-full" style={{ backgroundColor: teamAccent }} aria-hidden />

        {/* Broadcast Hero Header with Crisp Agent Artwork */}
        <div
          className="relative overflow-hidden px-6 pt-5 pb-5 border-b border-white/10"
          style={{
            background: `linear-gradient(100deg, ${teamAccent}22 0%, rgba(7,11,18,0.92) 60%, rgba(7,11,18,0.85) 100%)`,
          }}
        >
          {agentPortrait && (
            <img
              src={agentPortrait}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="pointer-events-none select-none absolute right-[-4%] top-[-16%] h-[185%] w-auto max-w-none object-contain opacity-50"
            />
          )}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(7,11,18,0.92) 0%, rgba(7,11,18,0.68) 58%, rgba(7,11,18,0.28) 100%)',
            }}
            aria-hidden
          />

          {/* Close button */}
          <button
            onClick={() => {
              playSelectSound();
              onClose();
            }}
            className="relative z-20 float-right p-1.5 rounded-[3px] text-slate-300 hover:text-white bg-[#06090f]/80 hover:bg-[#06090f] border border-white/15 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Player Header */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="relative shrink-0">
              <PlayerAvatar player={player} size="xl" teamColor={teamAccent} />
              <div className="absolute -bottom-1.5 -right-1.5 rounded-[2px] bg-[#06090f] p-0.5 border border-white/20">
                <RoleEmblem role={player.primaryRole} size="xs" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-[2px] bg-[#06090f]/85 text-slate-200 font-semibold border border-white/12">
                  <CountryFlag code={player.countryCode} country={player.country} size="xs" />
                  {player.country}
                </span>
                {player.isChampionsWinner && (
                  <span className="text-xs px-2 py-0.5 rounded-[2px] bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-bold">
                    <Award className="w-3.5 h-3.5 text-amber-400" /> Campeão
                  </span>
                )}
              </div>
              <h3 className="text-4xl font-display font-bold uppercase text-white tracking-wide mt-1 leading-none drop-shadow">
                {player.ign}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-200 flex-wrap">
                <span>{player.name}</span>
                <span className="text-slate-500">·</span>
                <span className="inline-flex items-center gap-1.5 text-white font-medium">
                  <TeamLogo teamName={player.team} size="xs" />
                  {player.team} ({player.year})
                </span>
                <span className="text-slate-500">·</span>
                <span className="font-bold" style={{ color: ROLE_COLORS[player.primaryRole] }}>
                  {ROLE_NAMES_PT[player.primaryRole] || player.primaryRole}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">

        {/* Performance Attributes */}
        <div className="surface-sub p-4 mb-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Overall</span>
            <span className="text-xs font-mono-vct font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-[2px] border border-amber-500/30">
              Oculto no draft
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono-vct border-t border-white/[0.06]">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Consistência</span>
                <span className="text-white font-bold">{player.consistency}</span>
              </div>
              <div className="w-full bg-[#1a212e] rounded-[1px] h-1.5 overflow-hidden">
                <div className="bg-sky-400 h-full" style={{ width: `${player.consistency}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Clutch</span>
                <span className="text-amber-300 font-bold">{player.clutch}</span>
              </div>
              <div className="w-full bg-[#1a212e] rounded-[1px] h-1.5 overflow-hidden">
                <div className="bg-amber-400 h-full" style={{ width: `${player.clutch}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Sinergia</span>
                <span className="text-emerald-300 font-bold">{player.synergy}</span>
              </div>
              <div className="w-full bg-[#1a212e] rounded-[1px] h-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-full" style={{ width: `${player.synergy}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Flexibilidade</span>
                <span className="text-purple-300 font-bold">{player.flexibility}</span>
              </div>
              <div className="w-full bg-[#1a212e] rounded-[1px] h-1.5 overflow-hidden">
                <div className="bg-purple-400 h-full" style={{ width: `${player.flexibility}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Special Trait */}
        {player.trait ? (
          <div className="mb-4 surface-sub p-3.5 border-amber-500/25">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono-vct font-bold text-white uppercase tracking-wider">
                  Característica
                </span>
              </div>
              <span
                className="text-xs uppercase px-2 py-0.5 rounded-[2px] font-bold font-mono-vct"
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
          <div className="mb-4 px-3 py-2 rounded-[3px] bg-[#0b0e14] border border-white/[0.07] flex items-center justify-between text-xs text-slate-400">
            <span>Característica</span>
            <span>Padrão</span>
          </div>
        )}

        {/* Roles & Agent metadata (100% Portuguese) */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-5">
          <div className="surface-sub p-3">
            <span className="text-slate-400 block mb-1 text-xs">Função principal</span>
            <span className="text-white font-bold text-sm flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-[#ff4655]" />
              {ROLE_NAMES_PT[player.primaryRole] || player.primaryRole}
            </span>
            {player.secondaryRoles.length > 0 && (
              <span className="text-xs text-slate-300 block mt-1">
                Secundárias: {player.secondaryRoles.map(r => ROLE_NAMES_PT[r] || r).join(', ')}
              </span>
            )}
          </div>

          <div className="surface-sub p-3">
            <span className="text-slate-400 block mb-1 text-xs">Agente assinatura</span>
            <span className="text-amber-300 font-bold text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              {player.signatureAgent}
            </span>
            <span className="text-xs text-slate-300 block mt-1 font-mono-vct">
              Edições: {player.championsYears.join(', ')}
            </span>
          </div>
        </div>

        {/* Action */}
        <div>
          {isCurrentlyIn ? (
            <div className="space-y-2.5">
              <div className="w-full py-2 px-3 rounded-[3px] bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-center text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Escalado como {ROLE_NAMES_PT[isCurrentlyIn] || isCurrentlyIn}
              </div>
              {availableSlots.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs text-slate-300 block">
                    Mover {player.ign} para outra vaga:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map(slot => (
                      <SecondaryButton
                        key={slot}
                        size="sm"
                        onClick={() => {
                          onAssignToRole(player, slot);
                          onClose();
                        }}
                        className="flex-1"
                      >
                        Mover para {ROLE_NAMES_PT[slot] || slot}
                      </SecondaryButton>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : isAnotherEditionIn ? (
            <div className="w-full py-2.5 px-3 rounded-[3px] bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-center text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {player.ign} já está escalado no seu time (outra edição)
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="space-y-2">
              <span className="text-xs text-slate-300 block">
                Escolha a vaga de {player.ign}:
              </span>
              <div className="flex flex-wrap gap-2">
                {availableSlots.map(slot => (
                  <PrimaryButton
                    key={slot}
                    size="md"
                    onClick={() => {
                      playLockSound();
                      onAssignToRole(player, slot);
                      onClose();
                    }}
                    className="flex-1"
                  >
                    Escalar como {ROLE_NAMES_PT[slot] || slot}
                  </PrimaryButton>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full py-2.5 rounded-[3px] bg-[#0b0e14] border border-white/10 text-slate-400 text-center text-xs">
              Todas as funções desse jogador já estão ocupadas.
            </div>
          )}
        </div>
        </div>
      </Card>
    </div>
  );
};
