import React from 'react';
import { ShieldAlert, X, Check, Lock, AlertTriangle } from 'lucide-react';
import { Player, Difficulty } from '../types';
import { RoleEmblem } from './RoleEmblem';
import { TeamLogo } from './TeamLogo';
import { ROLE_NAMES_PT } from '../data/roleIcons';
import { playSelectSound } from '../utils/audio';

interface OpponentBansModalProps {
  bannedPlayers: Player[];
  difficulty: Difficulty;
  onClose: () => void;
}

export const OpponentBansModal: React.FC<OpponentBansModalProps> = ({
  bannedPlayers,
  difficulty,
  onClose,
}) => {
  if (bannedPlayers.length === 0) return null;

  const count = bannedPlayers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl glass-card p-6 sm:p-7 shadow-2xl text-white animate-popIn">
        {/* Close Button */}
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

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30">
                Fase de Vetos
              </span>
              <span className="text-xs text-slate-400">
                Modo {difficulty === 'master' ? 'Master' : difficulty === 'hard' ? 'Difícil' : 'Normal'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Atletas Vetados pelo Adversário
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              O adversário analisou o meta e vetou <strong className="text-rose-400 font-semibold">{count} jogadores</strong>. 
              Eles não poderão ser escalados nesta rodada.
            </p>
          </div>
        </div>

        {/* Banned Players Grid */}
        <div className={`grid gap-2.5 mb-5 ${count <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {bannedPlayers.map(p => (
            <div
              key={p.id}
              className="tracker-subcard p-3 border-rose-900/50 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.2 rounded flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Vetado
                </span>
                <span className="text-[10px] text-slate-400 font-mono-vct">
                  {p.team} '{p.year.toString().slice(2)}
                </span>
              </div>

              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded bg-[#0b1017] border border-[#202d3e] flex items-center justify-center p-1 shrink-0">
                  <TeamLogo teamName={p.team} size="sm" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-rose-200 truncate">
                    {p.ign}
                  </h4>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {p.name}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1c2738] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <RoleEmblem role={p.primaryRole} size="xs" />
                  <span className="text-slate-300 text-[11px] font-medium">
                    {ROLE_NAMES_PT[p.primaryRole]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tactical Advice Note */}
        <div className="mb-6 p-3 rounded bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            Adapte sua tática! Busque atletas com sinergia e alta consistência para compensar esses vetos.
          </span>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              playSelectSound();
              onClose();
            }}
            className="btn-primary w-full sm:w-auto px-6 py-2.5 rounded-lg text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Entendido, Continuar Draft</span>
          </button>
        </div>
      </div>
    </div>
  );
};
