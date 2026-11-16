import React from 'react';
import { ShieldAlert, X, Check } from 'lucide-react';
import { Player, Difficulty } from '../types';
import { RoleEmblem } from './RoleEmblem';
import { TeamLogo } from './TeamLogo';
import { PlayerAvatar } from './PlayerAvatar';
import { ROLE_NAMES_PT } from '../data/roleIcons';
import { playSelectSound } from '../utils/audio';
import { Card, PrimaryButton } from './ui';

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
      <Card variant="modal" padding="lg" className="w-full max-w-2xl text-white animate-popIn">
        {/* Close Button */}
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

        {/* Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-[3px] bg-rose-500/15 border border-rose-500/35 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-vct font-bold text-rose-400 uppercase tracking-wider">
                Vetos · Modo {difficulty === 'master' ? 'Master' : difficulty === 'hard' ? 'Difícil' : 'Normal'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide uppercase mt-0.5 leading-none">
              Jogadores vetados nessa run
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Os rivais travaram <strong className="text-rose-300">{count} jogadores</strong>. Monte sua line sem contar com eles.
            </p>
          </div>
        </div>

        {/* Banned Players Grid */}
        <div className={`grid gap-2.5 mb-5 ${count <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {bannedPlayers.map(p => (
            <div
              key={p.id}
              className="surface-sub p-3 border-rose-500/25 flex flex-col justify-between gap-2 relative"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="ban-stamp px-1.5 py-0.5 font-mono-vct text-xs font-bold uppercase">
                  BANIDO
                </span>
                <span className="text-xs text-slate-400 font-mono-vct">
                  {p.team} '{p.year.toString().slice(2)}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <PlayerAvatar player={p} size="sm" />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-rose-200 truncate">
                    {p.ign}
                  </h4>
                  <span className="text-xs text-slate-400 block truncate">
                    {p.name}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <RoleEmblem role={p.primaryRole} size="xs" />
                  <span className="text-slate-300 font-medium">
                    {ROLE_NAMES_PT[p.primaryRole] || p.primaryRole}
                  </span>
                </div>
                <TeamLogo teamName={p.team} size="xs" />
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <PrimaryButton
            size="md"
            onClick={() => {
              playSelectSound();
              onClose();
            }}
            className="w-full sm:w-auto"
          >
            <Check className="w-4 h-4" />
            <span>Bora pro Draft</span>
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
};
