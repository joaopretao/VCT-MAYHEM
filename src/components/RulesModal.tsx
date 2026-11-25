import React from 'react';
import { X, Trophy, Users, Swords } from 'lucide-react';
import { playSelectSound } from '../utils/audio';
import { Card, PrimaryButton } from './ui';

interface RulesModalProps {
  onClose: () => void;
  onReplayTutorial?: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose, onReplayTutorial }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <Card variant="modal" padding="lg" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white animate-popIn">
        {/* Close Button */}
        <button
          onClick={() => {
            playSelectSound();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-[3px] text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <span className="vct-slash h-7" aria-hidden />
          <div>
            <span className="text-xs font-mono-vct font-bold text-[#e2b714] uppercase tracking-wider block">
              Como funciona
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white tracking-wide leading-none">
              Fluxo de uma Run no Mayhem
            </h3>
          </div>
        </div>

        {/* Clean 3-Step Flow: Draft -> Torneio -> Troféu */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="surface-sub p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono-vct">
              <span className="text-[#ff4655] font-bold">01 · DRAFT</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Escolha 1 jogador entre os 3 times da rodada até fechar as 5 funções. Jogadores do mesmo elenco somam química extra.
            </p>
          </div>

          <div className="surface-sub p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono-vct">
              <span className="text-white font-bold">02 · TORNEIO</span>
              <Swords className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dispute 4 séries seguidas (MD3 até as semis e Grande Final MD5). O Overall fica oculto durante o draft.
            </p>
          </div>

          <div className="surface-sub p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono-vct">
              <span className="text-[#e2b714] font-bold">03 · TROFÉU</span>
              <Trophy className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ao vencer a final, seu elenco campeão, o MVP da campanha e as conquistas ficam salvos na Sala de Troféus.
            </p>
          </div>
        </div>

        {/* Difficulties Quick Reference */}
        <div className="surface-sub p-4 space-y-2 text-xs mb-5">
          <span className="font-mono-vct font-bold uppercase tracking-wider text-slate-300 block">
            Dificuldades
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 bg-[#080b10] border border-emerald-500/25 rounded-[2px]">
              <strong className="text-emerald-400 block">Normal</strong>
              <span className="text-slate-300">3 rerolls · Sem vetos · Scouting total</span>
            </div>
            <div className="p-2.5 bg-[#080b10] border border-amber-500/25 rounded-[2px]">
              <strong className="text-amber-300 block">Difícil</strong>
              <span className="text-slate-300">2 rerolls · 3 vetos · Scouting parcial</span>
            </div>
            <div className="p-2.5 bg-[#080b10] border border-rose-500/25 rounded-[2px]">
              <strong className="text-rose-400 block">Master</strong>
              <span className="text-slate-300">1 reroll · 6 vetos · Scouting cego</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {onReplayTutorial && (
            <button
              type="button"
              onClick={() => {
                playSelectSound();
                onClose();
                onReplayTutorial();
              }}
              className="px-4 py-2.5 rounded-[3px] border border-white/15 bg-[#0b0e14] hover:bg-white/10 text-xs font-mono-vct font-bold uppercase tracking-wider text-slate-200 cursor-pointer transition-colors"
            >
              Rever tutorial (3 passos)
            </button>
          )}
          <PrimaryButton
            size="md"
            onClick={() => {
              playSelectSound();
              onClose();
            }}
            className="flex-1"
          >
            Entendido, voltar
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
};
