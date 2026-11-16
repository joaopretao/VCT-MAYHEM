import React from 'react';
import { X, Award, Crosshair, CheckCircle, Zap, Sparkles } from 'lucide-react';
import { Player, Lineup, Role } from '../types';
import { playLockSound, playSelectSound } from '../utils/audio';
import { TeamLogo } from './TeamLogo';
import { RoleEmblem } from './RoleEmblem';
import { TraitBadge } from './TraitBadge';
import { ROLE_NAMES_PT } from '../data/roleIcons';

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

  // Determine which roles this player can fit into
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
    // Allow moving/swapping an already drafted player into another compatible slot
    for (const r of compatibleRoles) {
      if (r !== isCurrentlyIn) {
        const occupant = lineup[r];
        // Either empty, or occupant can move to isCurrentlyIn
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
      <div className="relative glass-card w-full max-w-lg p-6 sm:p-7 shadow-2xl text-white animate-popIn">
        {/* Close button */}
        <button
          onClick={() => {
            playSelectSound();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Player Header - Tracker Profile Lockup */}
        <div className="flex items-center gap-4 mb-6">
          <div className="shrink-0">
            <RoleEmblem role={player.primaryRole} size="xl" glow showBackground />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#101722] text-slate-300 font-semibold border border-[#222f42]">
                {player.country} ({player.countryCode})
              </span>
              {player.isChampionsWinner && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-bold">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Campeão VCT
                </span>
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              {player.ign}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span>{player.name}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5 text-slate-300 font-medium">
                <TeamLogo teamName={player.team} size="xs" />
                {player.team} ({player.year})
              </span>
              <span>·</span>
              <span className="text-white font-semibold">
                {ROLE_NAMES_PT[player.primaryRole] || player.primaryRole}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Attributes Bar Grid with Hidden Rating */}
        <div className="tracker-subcard p-4 sm:p-5 mb-5 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Rating Geral do Atleta:</span>
            <span className="text-xs font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
              ?? OVR (Oculto durante o Draft)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 pt-2 text-xs font-mono-vct">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Consistência:</span>
                <span className="text-white font-bold">{player.consistency}</span>
              </div>
              <div className="w-full bg-[#182332] rounded h-1.5 overflow-hidden">
                <div className="bg-sky-400 h-full rounded transition-all duration-300" style={{ width: `${player.consistency}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Clutch (Sangue Frio):</span>
                <span className="text-amber-300 font-bold">{player.clutch}</span>
              </div>
              <div className="w-full bg-[#182332] rounded h-1.5 overflow-hidden">
                <div className="bg-amber-400 h-full rounded transition-all duration-300" style={{ width: `${player.clutch}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Sinergia de Equipe:</span>
                <span className="text-emerald-300 font-bold">{player.synergy}</span>
              </div>
              <div className="w-full bg-[#182332] rounded h-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-full rounded transition-all duration-300" style={{ width: `${player.synergy}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Flexibilidade:</span>
                <span className="text-purple-300 font-bold">{player.flexibility}</span>
              </div>
              <div className="w-full bg-[#182332] rounded h-1.5 overflow-hidden">
                <div className="bg-purple-400 h-full rounded transition-all duration-300" style={{ width: `${player.flexibility}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Special Player Trait Display */}
        {player.trait ? (
          <div className="mb-5 tracker-subcard p-4 border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Trait Especial Ativo
                </span>
              </div>
              <span
                className="text-[10px] uppercase px-2 py-0.5 rounded font-bold"
                style={{
                  color: player.trait.color,
                  backgroundColor: player.trait.badgeBg,
                  border: `1px solid ${player.trait.badgeBorder}`,
                }}
              >
                Raridade: {player.trait.rarity.toUpperCase()}
              </span>
            </div>
            <TraitBadge trait={player.trait} size="md" showDescription={true} />
          </div>
        ) : (
          <div className="mb-5 px-3 py-2 rounded bg-[#101722] border border-[#202d3e] flex items-center justify-between text-xs text-slate-400">
            <span>Trait de Jogador:</span>
            <span className="text-slate-500 italic">Padrão da Categoria</span>
          </div>
        )}

        {/* Roles & Agents metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-6">
          <div className="tracker-subcard p-3">
            <span className="text-slate-400 block mb-1 text-[11px]">Função Primária:</span>
            <span className="text-white font-bold text-sm flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-[#ff4655]" />
              {player.primaryRole}
            </span>
            {player.secondaryRoles.length > 0 && (
              <span className="text-[11px] text-slate-400 block mt-1">
                Secundárias: {player.secondaryRoles.join(', ')}
              </span>
            )}
          </div>

          <div className="tracker-subcard p-3">
            <span className="text-slate-400 block mb-1 text-[11px]">Agente Assinatura:</span>
            <span className="text-amber-300 font-bold text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              {player.signatureAgent}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1 font-mono-vct">
              Champions: {player.championsYears.join(', ')}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {isCurrentlyIn ? (
            <div className="space-y-2.5">
              <div className="w-full py-2 px-3 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-center text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Escalado na posição: {ROLE_NAMES_PT[isCurrentlyIn] || isCurrentlyIn}
              </div>
              {availableSlots.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 block">
                    Mover ou trocar {player.ign} para outra função compatível:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => {
                          onAssignToRole(player, slot);
                          onClose();
                        }}
                        className="flex-1 py-2 px-3 rounded bg-[#1d2a3b] hover:bg-[#26374d] border border-[#2f435e] text-slate-200 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors text-center"
                      >
                        Mover para {ROLE_NAMES_PT[slot] || slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="space-y-2">
              <span className="text-xs text-slate-400 block">
                Selecione uma vaga para contratar {player.ign}:
              </span>
              <div className="flex flex-wrap gap-2">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => {
                      playLockSound();
                      onAssignToRole(player, slot);
                      onClose();
                    }}
                    className="btn-primary flex-1 py-2.5 px-4 rounded-lg text-white text-xs font-bold uppercase tracking-wider text-center cursor-pointer"
                  >
                    Escalar como {slot}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full py-2.5 rounded bg-[#101722] border border-[#202d3e] text-slate-400 text-center text-xs">
              Todas as funções compatíveis com este atleta já estão ocupadas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
