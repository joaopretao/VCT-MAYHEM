import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Lineup, TournamentStage } from '../types';
import { playVictoryFanfare, playSelectSound } from '../utils/audio';
import { ROLE_ORDER } from './roleOrder';
import { ROLE_COLORS } from '../data/roleIcons';
import { PlayerAvatar } from './PlayerAvatar';
import { Card, PrimaryButton } from './ui';

interface StageQualifiedScreenProps {
  stage: TournamentStage;
  lineup?: Lineup;
  opponentName?: string;
  scoreLabel?: string;
  onNextStage: () => void;
}

const STAGE_COPY: Record<TournamentStage, { tag: string; title: string; next: string }> = {
  group: { tag: 'Fase de Grupos', title: 'Passou. Próxima: Quartas.', next: 'Ir pras Quartas' },
  quarters: { tag: 'Quartas de Final', title: 'Nas Semis.', next: 'Ir pras Semis' },
  semis: { tag: 'Semifinal', title: 'Na Grande Final.', next: 'Disputar a Final' },
  finals: { tag: 'Grande Final', title: 'Campeão.', next: 'Continuar' },
};

export const StageQualifiedScreen: React.FC<StageQualifiedScreenProps> = ({
  stage,
  lineup,
  opponentName,
  scoreLabel,
  onNextStage,
}) => {
  React.useEffect(() => {
    playVictoryFanfare();
  }, []);

  const copy = STAGE_COPY[stage];

  return (
    <div className="min-h-[58vh] flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-in fade-in duration-200">
      <Card
        padding="lg"
        cutCorner
        className="border-emerald-500/35 max-w-xl w-full flex flex-col items-center animate-popIn relative overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-emerald-400" aria-hidden />

        <span className="font-mono-vct text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
          {copy.tag}
        </span>

        <h2 className="text-4xl sm:text-5xl font-display font-bold uppercase text-white tracking-wide mb-2 leading-none">
          {copy.title}
        </h2>

        {opponentName && (
          <p className="text-sm text-slate-300 mb-5">
            {scoreLabel ? `${scoreLabel} ` : ''}em cima de <strong className="text-white">{opponentName}</strong>.
          </p>
        )}

        {/* Lineup showcase with real player portraits */}
        {lineup && (
          <div className="grid grid-cols-5 gap-2 w-full mb-6">
            {ROLE_ORDER.map(role => {
              const p = lineup[role];
              if (!p) return null;
              return (
                <div
                  key={role}
                  className="surface-sub p-2 flex flex-col items-center gap-1 border-b-2"
                  style={{ borderBottomColor: ROLE_COLORS[role] }}
                >
                  <PlayerAvatar player={p} size="sm" />
                  <span className="text-xs font-bold text-white truncate max-w-full">
                    {p.ign}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <PrimaryButton
          id="next-stage-btn"
          size="lg"
          onClick={() => {
            playSelectSound();
            onNextStage();
          }}
        >
          <span>{copy.next}</span>
          <ArrowRight className="w-4 h-4" />
        </PrimaryButton>
      </Card>
    </div>
  );
};
