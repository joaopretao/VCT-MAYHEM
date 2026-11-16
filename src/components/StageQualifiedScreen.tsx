import React from 'react';
import { Award, ArrowRight } from 'lucide-react';
import { TournamentStage } from '../types';
import { playVictoryFanfare, playSelectSound } from '../utils/audio';
import { Card, Badge, PrimaryButton } from './ui';

interface StageQualifiedScreenProps {
  stage: TournamentStage;
  onNextStage: () => void;
}

const STAGE_LABELS: Record<TournamentStage, string> = {
  group: 'FASE DE GRUPOS',
  quarters: 'QUARTAS DE FINAL',
  semis: 'SEMIFINAIS',
  finals: 'GRANDE FINAL',
};

export const StageQualifiedScreen: React.FC<StageQualifiedScreenProps> = ({
  stage,
  onNextStage,
}) => {
  React.useEffect(() => {
    playVictoryFanfare();
  }, []);

  return (
    <div className="min-h-[55vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
      <Card padding="lg" className="border-emerald-500/35 max-w-lg w-full flex flex-col items-center animate-popIn">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
          <Award className="w-8 h-8" />
        </div>

        <Badge tone="gold" className="mb-2">
          {STAGE_LABELS[stage]}
        </Badge>

        <h2 className="text-4xl sm:text-5xl font-display font-bold uppercase text-white tracking-wider mb-3">
          Classificado!
        </h2>

        <p className="text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
          Sua escalação demonstrou excelente química tática e superou o adversário para avançar à próxima rodada do VCT Champions!
        </p>

        <PrimaryButton
          id="next-stage-btn"
          size="lg"
          onClick={() => {
            playSelectSound();
            onNextStage();
          }}
          className="group"
        >
          <span>Avançar para Próxima Fase</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </PrimaryButton>
      </Card>
    </div>
  );
};
