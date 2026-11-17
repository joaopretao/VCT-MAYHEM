import React from 'react';
import { X, Award, Crosshair, CheckCircle, Zap, Shield } from 'lucide-react';
import { Player, Lineup, Role } from '../types';
import { playLockSound, playSelectSound } from '../utils/audio';
import { TeamLogo } from './TeamLogo';
import { RoleEmblem } from './RoleEmblem';
import { TraitBadge } from './TraitBadge';
import { PlayerAvatar } from './PlayerAvatar';
import { CountryFlag } from './CountryFlag';
import { ROLE_NAMES_PT } from '../data/roleIcons';
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

  const compatibleRoles: Role[] = Array.from(
    new Set([player.primaryRole, ...player.secondaryRoles, 'Flex' as Role])
  );

  if (!isCurrentlyIn) {
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

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <Card variant="modal" padding="lg" className="w-full max-w-lg text-white animate-popIn">
        {/* Close button */}
        <button
          onClick={() => {
            playSelectSound();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-[3px] text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Player Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative shrink-0">
            <PlayerAvatar player={player} size="xl" />
            <div className="absolute -bottom-1.5 -right-1.5 rounded-[2px] bg-[#0b0e14] p-0.5 border border-white/15">
              <RoleEmblem role={player.primaryRole} size="xs" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-[2px] bg-[#0b0e14] text-slate-200 font-semibold border border-white/10">
                <CountryFlag code={player.countryCode} country={player.country} size="xs" />
                {player.country}
              </span>
              {player.isChampionsWinner && (
                <span className="text-xs px-2 py-0.5 rounded-[2px] bg-amber-500/15 text-amber-300 border border-amber-500/35 flex items-center gap-1 font-bold">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Campeão
                </span>
              )}
            </div>
            <h3 className="text-3xl font-display font-bold text-white tracking-wide mt-1 leading-none">
              {player.ign}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-300 flex-wrap">
              <span>{player.name}</span>
              <span className="text-slate-600">·</span>
              <span className="inline-flex items-center gap-1.5 text-slate-200 font-medium">
                <TeamLogo teamName={player.team} size="xs" />
                {player.team} ({player.year})
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-white font-semibold">
                {ROLE_NAMES_PT[player.primaryRole] || player.primaryRole}
              </span>
            </div>
          </div>
        </div>

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
      </Card>
    </div>
  );
};
