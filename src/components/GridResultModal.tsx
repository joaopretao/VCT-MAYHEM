import React from 'react';
import { Trophy, X, Share2, ArrowRight, Eye, ShieldAlert, RotateCcw, Calendar } from 'lucide-react';
import { GridCellState } from '../types';
import { GridPuzzle } from '../data/gridPuzzles';
import { Card, PrimaryButton, SecondaryButton } from './ui';

interface GridResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzle: GridPuzzle;
  cells: GridCellState[][];
  totalScore: number;
  solvedCount: number;
  attemptsLeft?: number;
  maxAttempts?: number;
  hasSurrendered?: boolean;
  onViewSolutions?: () => void;
  onNextPuzzle: () => void;
  hasNextPuzzle: boolean;
  isDailyMode?: boolean;
  streak?: number;
  onSwitchToClassic?: () => void;
  onReplayClassic?: () => void;
}

export const GridResultModal: React.FC<GridResultModalProps> = ({
  isOpen,
  onClose,
  puzzle,
  cells,
  totalScore,
  solvedCount,
  attemptsLeft = 0,
  maxAttempts = 9,
  hasSurrendered = false,
  onViewSolutions,
  onNextPuzzle,
  hasNextPuzzle,
  isDailyMode = false,
  streak = 0,
  onSwitchToClassic,
  onReplayClassic,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const maxPossible = 540;
  const isCompleted = solvedCount === 9;
  const isPerfect = isCompleted && totalScore === maxPossible;

  const getRankBadge = () => {
    if (isPerfect) return { title: 'Radiante', color: '#f59e0b', desc: '9/9 sem erros.' };
    if (isCompleted && totalScore >= 450) return { title: 'Imortal', color: '#ff4655', desc: 'Tabuleiro completo com alta precisão.' };
    if (totalScore >= 300) return { title: 'Ascendente / Diamante', color: '#38bdf8', desc: 'Bom domínio de elencos e transferências.' };
    if (solvedCount >= 5) return { title: 'Ouro / Platina', color: '#10b981', desc: 'Mais da metade das interseções resolvidas.' };
    return { title: 'Ferro / Prata', color: '#94a3b8', desc: 'Confira o gabarito para ver as conexões válidas.' };
  };

  const rank = getRankBadge();
  const modalHeadline = isCompleted
    ? isDailyMode
      ? `Grid Diário #${puzzle.number} fechado`
      : 'Grid fechado'
    : hasSurrendered
      ? 'Partida encerrada'
      : 'Sem vidas restantes';

  const handleShare = () => {
    const label = isDailyMode ? `VCT GRID DIÁRIO #${puzzle.number}` : `VCT GRID CLÁSSICO #${puzzle.number}`;
    const text = `${label} (${puzzle.title})
Resultado: ${solvedCount}/9 células
Pontuação: ${totalScore}/${maxPossible} pts
Rank: ${rank.title}
Jogue também no VALORANT Champions Mayhem.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <Card variant="modal" padding="none" className="relative w-full max-w-lg overflow-hidden flex flex-col animate-popIn">
        {/* Top Header */}
        <div className="p-6 text-center bg-[#0d1118] border-b border-white/10 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-[3px] bg-[#161b24] hover:bg-[#1e2531] border border-white/10 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className={`w-11 h-11 mx-auto rounded-[3px] border mb-3 flex items-center justify-center ${
              isCompleted
                ? 'bg-amber-500/15 border-amber-500/35 text-amber-400'
                : 'bg-rose-500/15 border-rose-500/35 text-rose-400'
            }`}
          >
            {isCompleted ? <Trophy className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>

          <span
            className="text-xs font-mono-vct font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-[2px] border inline-block mb-1.5"
            style={{ color: rank.color, borderColor: `${rank.color}40`, backgroundColor: `${rank.color}15` }}
          >
            {rank.title}
          </span>

          <h3 className="text-2xl font-display font-bold uppercase text-white tracking-wide">
            {modalHeadline}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">{rank.desc}</p>
        </div>

        {/* Stats Row */}
        <div className={`grid gap-2.5 p-4 bg-[#11151d] border-b border-white/[0.08] text-center ${isDailyMode ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
          <div className="surface-sub p-3">
            <div className="text-2xl font-bold text-amber-400 font-mono-vct tabular-nums">
              {totalScore} <span className="text-xs text-slate-400 font-normal">/ {maxPossible}</span>
            </div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              Pontos
            </div>
          </div>

          <div className="surface-sub p-3">
            <div className="text-2xl font-bold text-white font-mono-vct tabular-nums">
              {solvedCount} <span className="text-xs text-slate-400 font-normal">/ 9</span>
            </div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              Células
            </div>
          </div>

          <div className="surface-sub p-3">
            <div className={`text-2xl font-bold font-mono-vct tabular-nums ${attemptsLeft > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {attemptsLeft} <span className="text-xs text-slate-400 font-normal">/ {maxAttempts}</span>
            </div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              Vidas rest.
            </div>
          </div>

          {isDailyMode && (
            <div className="surface-sub p-3 border-amber-500/30 flex flex-col justify-center">
              <div className="text-2xl font-bold text-amber-400 font-mono-vct tabular-nums">
                {streak}
              </div>
              <div className="text-xs text-amber-300 font-semibold uppercase tracking-wider mt-0.5">
                Sequência
              </div>
            </div>
          )}
        </div>

        {/* Mini 3x3 Visual Matrix */}
        <div className="p-4 bg-[#0b0e14] space-y-2">
          <span className="text-xs text-slate-400 font-mono-vct font-semibold tracking-wider uppercase block text-center">
            Suas escolhas
          </span>

          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {cells.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`p-2 rounded-[3px] text-center border transition-colors flex flex-col items-center justify-center min-h-[52px] ${
                    cell.isSolved
                      ? 'bg-emerald-950/35 border-emerald-500/40 text-emerald-300'
                      : 'bg-[#11151d] border-white/[0.08] text-slate-500'
                  }`}
                >
                  {cell.isSolved && cell.player ? (
                    <>
                      <span className="text-xs font-bold text-white truncate max-w-full">
                        {cell.player.ign}
                      </span>
                      <span className="text-xs text-emerald-400 font-mono-vct font-semibold">
                        +{cell.points}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500">—</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-[#0d1118] border-t border-white/10 space-y-2">
          {onViewSolutions && (
            <SecondaryButton
              id="grid-result-view-solutions-btn"
              onClick={onViewSolutions}
              size="md"
              className="w-full"
            >
              <Eye className="w-4 h-4 text-[#e2b714]" />
              <span>Ver Gabarito Completo</span>
            </SecondaryButton>
          )}

          <SecondaryButton
            onClick={handleShare}
            size="md"
            className="w-full"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>{copied ? 'Copiado!' : 'Compartilhar resultado'}</span>
          </SecondaryButton>

          {isDailyMode ? (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono-vct text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Volte amanhã para o próximo Grid Diário</span>
              </div>
              {onSwitchToClassic && (
                <PrimaryButton
                  onClick={onSwitchToClassic}
                  size="md"
                  className="w-full"
                >
                  <span>Jogar Tabuleiros Clássicos</span>
                  <ArrowRight className="w-4 h-4" />
                </PrimaryButton>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              {onReplayClassic && (
                <SecondaryButton
                  onClick={onReplayClassic}
                  size="md"
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Tentar Novamente</span>
                </SecondaryButton>
              )}
              {hasNextPuzzle && (
                <PrimaryButton
                  onClick={onNextPuzzle}
                  size="md"
                  className="flex-1"
                >
                  <span>Próximo Grid</span>
                  <ArrowRight className="w-4 h-4" />
                </PrimaryButton>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
