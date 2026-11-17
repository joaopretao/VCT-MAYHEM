import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Sparkles, Trophy, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { playSelectSound } from '../utils/audio';
import { Card, PrimaryButton, SecondaryButton } from './ui';

const TUTORIAL_STORAGE_KEY = 'vct_mayhem_tutorial_v1';

export function hasSeenDraftTutorial(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'seen';
  } catch {
    return true;
  }
}

export function markDraftTutorialSeen(): void {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'seen');
  } catch {
    // ignore
  }
}

interface DraftTutorialModalProps {
  onClose: () => void;
}

const STEPS = [
  {
    tag: 'Passo 1 de 3 · O Draft',
    title: 'Monte sua line com 5 funções',
    description:
      'Em cada rodada aparecem 3 equipes reais do VCT. Escolha 1 jogador para preencher Duelista, Controlador, Iniciador, Sentinela e Flex.',
    tip: 'Dica: jogadores do mesmo time dão Química extra e ativam bônus de elenco.',
    accent: '#ff4655',
    icon: Users,
  },
  {
    tag: 'Passo 2 de 3 · Roguelike',
    title: 'Escolha 2 Bônus Mayhem na run',
    description:
      'Depois do 2º e do 4º pick, aparecem 3 cartas de bônus aleatórias (Comum, Raro ou Épico). Elas fortalecem pistols, economia, clutch ou sinergia.',
    tip: 'Dica: bônus Épicos têm poder alto, mas pedem estratégia na composição.',
    accent: '#e2b714',
    icon: Sparkles,
  },
  {
    tag: 'Passo 3 de 3 · Champions',
    title: 'Overall oculto e playoffs MD3/MD5',
    description:
      'Para deixar a corrida justa, o nível geral (OVR) dos atletas fica escondido no draft. Gerencie Rerolls, supere os Vetos e conquiste o título!',
    tip: 'Sua run salva automaticamente — pode fechar a aba e continuar depois.',
    accent: '#38bdf8',
    icon: Trophy,
  },
];

export const DraftTutorialModal: React.FC<DraftTutorialModalProps> = ({ onClose }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];
  const Icon = step.icon;
  const isLast = stepIdx === STEPS.length - 1;

  const finish = () => {
    playSelectSound();
    markDraftTutorialSeen();
    onClose();
  };

  return (
    <div
      id="draft-tutorial-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="draft-tutorial-title"
    >
      <Card variant="modal" padding="lg" cutCorner className="w-full max-w-lg relative overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-1 transition-colors"
          style={{ backgroundColor: step.accent }}
          aria-hidden
        />

        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, idx) => (
              <span
                key={s.tag}
                className="h-1.5 rounded-[1px] transition-all"
                style={{
                  width: idx === stepIdx ? '28px' : '12px',
                  backgroundColor: idx <= stepIdx ? step.accent : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>

          <button
            id="tutorial-skip-btn"
            type="button"
            onClick={finish}
            className="inline-flex items-center gap-1 text-xs font-mono-vct font-semibold text-slate-300 hover:text-white px-2 py-1 rounded-[2px] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span>Pular tutorial</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.16 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-[3px] border flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${step.accent}1a`,
                  borderColor: `${step.accent}55`,
                }}
              >
                <Icon className="w-5 h-5" style={{ color: step.accent }} />
              </div>
              <div>
                <span
                  className="font-mono-vct text-xs font-bold uppercase tracking-wider block"
                  style={{ color: step.accent }}
                >
                  {step.tag}
                </span>
                <h3
                  id="draft-tutorial-title"
                  className="font-display text-2xl sm:text-3xl leading-none text-white uppercase tracking-wide"
                >
                  {step.title}
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed">{step.description}</p>

            <div className="surface-sub px-3 py-2.5 text-xs text-slate-200 border-l-2" style={{ borderLeftColor: step.accent }}>
              {step.tip}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-white/10">
          {stepIdx > 0 ? (
            <SecondaryButton
              size="sm"
              onClick={() => {
                playSelectSound();
                setStepIdx(prev => prev - 1);
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </SecondaryButton>
          ) : (
            <span className="text-xs font-mono-vct text-slate-300">Guia rápido · 1ª partida</span>
          )}

          {!isLast ? (
            <PrimaryButton
              id="tutorial-next-btn"
              size="md"
              onClick={() => {
                playSelectSound();
                setStepIdx(prev => prev + 1);
              }}
            >
              <span>Próximo</span>
              <ArrowRight className="w-4 h-4" />
            </PrimaryButton>
          ) : (
            <PrimaryButton id="tutorial-finish-btn" size="md" onClick={finish}>
              <span>Começar Draft</span>
              <ArrowRight className="w-4 h-4" />
            </PrimaryButton>
          )}
        </div>
      </Card>
    </div>
  );
};
