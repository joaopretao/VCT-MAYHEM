import React from 'react';
import { X, ArrowRight, Trophy, Users, Swords } from 'lucide-react';
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

        {/* Visual 3-Step Flow: Draft -> Torneio -> Troféu */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {/* Step 1: Draft */}
          <div className="surface-sub p-4 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between text-xs font-mono-vct">
              <span className="text-[#ff4655] font-bold">01 · DRAFT</span>
              <Users className="w-4 h-4 text-[#ff4655]" />
            </div>

            {/* Visual mini mockup */}
            <div className="bg-[#080b10] border border-white/[0.06] rounded-[2px] p-2.5 space-y-1.5">
              <div className="grid grid-cols-5 gap-1">
                {['#ff4655', '#38bdf8', '#a855f7', '#eab308', '#10b981'].map((c, idx) => (
                  <div
                    key={idx}
                    className="h-5 rounded-[1px] bg-[#141a24] border-t-2"
                    style={{ borderTopColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs font-mono-vct text-slate-400">
                <span>5 funções</span>
                <span className="text-emerald-400">+Química</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Pega 1 jogador entre os 3 times da rodada até fechar as 5 vagas. Jogadores do mesmo elenco dão química extra.
            </p>
          </div>

          {/* Step 2: Torneio */}
          <div className="surface-sub p-4 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between text-xs font-mono-vct">
              <span className="text-[#38bdf8] font-bold">02 · TORNEIO</span>
              <Swords className="w-4 h-4 text-[#38bdf8]" />
            </div>

            {/* Visual mini mockup */}
            <div className="bg-[#080b10] border border-white/[0.06] rounded-[2px] p-2.5 space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 font-mono-vct text-xs font-bold">
                <span className="px-1.5 py-0.5 bg-[#141a24] text-emerald-400">2</span>
                <span className="text-slate-500">:</span>
                <span className="px-1.5 py-0.5 bg-[#141a24] text-rose-400">1</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-xs font-mono-vct text-slate-400">
                <span>Grupos</span>
                <ArrowRight className="w-3 h-3" />
                <span>Quartas</span>
                <ArrowRight className="w-3 h-3" />
                <span>Final</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Disputa 4 séries seguidas (MD3 até as semis e Grande Final MD5). O Overall fica oculto pra ninguém resetar antes da hora.
            </p>
          </div>

          {/* Step 3: Troféu */}
          <div className="surface-sub p-4 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between text-xs font-mono-vct">
              <span className="text-[#e2b714] font-bold">03 · TROFÉU</span>
              <Trophy className="w-4 h-4 text-[#e2b714]" />
            </div>

            {/* Visual mini mockup */}
            <div className="bg-[#080b10] border border-white/[0.06] rounded-[2px] p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono-vct">
                <span className="text-[#e2b714] font-bold">MVP</span>
                <span className="text-slate-200">248 ACS</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-[1px] overflow-hidden">
                <div className="w-4/5 h-full bg-[#e2b714]" />
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Venceu a final, o título, os 5 jogadores e o MVP ficam salvos na tua Sala de Troféus.
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
              <span className="text-slate-300">3 rerolls · Sem vetos</span>
            </div>
            <div className="p-2.5 bg-[#080b10] border border-amber-500/25 rounded-[2px]">
              <strong className="text-amber-300 block">Difícil</strong>
              <span className="text-slate-300">2 rerolls · 3 vetos</span>
            </div>
            <div className="p-2.5 bg-[#080b10] border border-rose-500/25 rounded-[2px]">
              <strong className="text-rose-400 block">Master</strong>
              <span className="text-slate-300">1 reroll · 6 vetos</span>
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
