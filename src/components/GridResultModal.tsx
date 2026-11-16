import React from 'react';
import { Trophy, X, Share2, ArrowRight } from 'lucide-react';
import { GridCellState } from '../types';
import { GridPuzzle } from '../data/gridPuzzles';

interface GridResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzle: GridPuzzle;
  cells: GridCellState[][];
  totalScore: number;
  solvedCount: number;
  onNextPuzzle: () => void;
  hasNextPuzzle: boolean;
  isInfiniteMode?: boolean;
  streak?: number;
}

export const GridResultModal: React.FC<GridResultModalProps> = ({
  isOpen,
  onClose,
  puzzle,
  cells,
  totalScore,
  solvedCount,
  onNextPuzzle,
  hasNextPuzzle,
  isInfiniteMode = false,
  streak = 0,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const maxPossible = 540;
  const isPerfect = solvedCount === 9 && totalScore === maxPossible;

  const getRankBadge = () => {
    if (isPerfect) return { title: 'IMMACULATE GRID · RADIANTE', color: '#f59e0b', desc: 'Perfeito! 9 de 9 acertos de primeira tentativa!' };
    if (totalScore >= 450) return { title: 'IMORTAL DO VCT', color: '#ff4655', desc: 'Conhecimento absurdo do circuito competitivo!' };
    if (totalScore >= 300) return { title: 'ASCENDENTE / DIAMANTE', color: '#38bdf8', desc: 'Excelente leitura dos times e atletas!' };
    if (solvedCount >= 5) return { title: 'OURO / PLATINA', color: '#10b981', desc: 'Bom desempenho nas principais conexões!' };
    return { title: 'PRATA / FERRO', color: '#94a3b8', desc: 'Continue praticando para dominar o VCT!' };
  };

  const rank = getRankBadge();

  const handleShare = () => {
    const text = `VCT GRID #${puzzle.number} (${puzzle.title})
Resultado: ${solvedCount}/9 células
Pontuação: ${totalScore}/${maxPossible} pts 🏆
${rank.title}
Jogue também no VALORANT Champions Mayhem!`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg glass-card shadow-2xl overflow-hidden flex flex-col animate-popIn">
        {/* Top Header */}
        <div className="p-6 text-center bg-[#111822] border-b border-[#222f42] relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded bg-[#16202e] hover:bg-[#1f2c3e] border border-[#243347] transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 mx-auto rounded bg-amber-500/15 border border-amber-500/30 mb-3 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>

          <span
            className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border inline-block mb-1.5"
            style={{ color: rank.color, borderColor: `${rank.color}40`, backgroundColor: `${rank.color}15` }}
          >
            {rank.title}
          </span>

          <h3 className="text-xl font-bold text-white tracking-tight">
            Resumo do Desafio
          </h3>
          <p className="text-xs text-slate-400 mt-1">{rank.desc}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-4 bg-[#101722] border-b border-[#1f2c3f] text-center">
          <div className="tracker-subcard p-3">
            <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
              {totalScore} <span className="text-xs text-slate-500 font-normal">/ {maxPossible}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              Pontuação
            </div>
          </div>

          <div className="tracker-subcard p-3">
            <div className="text-2xl font-bold text-white font-mono tabular-nums">
              {solvedCount} <span className="text-xs text-slate-500 font-normal">/ 9</span>
            </div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              Células
            </div>
          </div>

          {isInfiniteMode && (
            <div className="tracker-subcard p-3 border-amber-500/30 col-span-2 sm:col-span-1 flex flex-col justify-center">
              <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
                🔥 {streak}
              </div>
              <div className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider mt-0.5">
                Sequência
              </div>
            </div>
          )}
        </div>

        {/* Mini 3x3 Visual Matrix */}
        <div className="p-4 bg-[#141d2a] space-y-2">
          <span className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase block text-center">
            Gabarito do Seu Grid
          </span>

          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {cells.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`p-2 rounded text-center border transition-colors flex flex-col items-center justify-center min-h-[50px] ${
                    cell.isSolved
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-[#101722] border-[#1e2a3b] text-slate-600'
                  }`}
                >
                  {cell.isSolved && cell.player ? (
                    <>
                      <span className="text-xs font-bold text-white truncate max-w-full">
                        {cell.player.ign}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                        +{cell.points} pts
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
        <div className="p-4 bg-[#111822] border-t border-[#1f2c3f] space-y-2">
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded bg-[#182332] hover:bg-[#202e42] text-white text-xs font-bold transition-colors border border-[#26374f] cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>{copied ? 'Copiado!' : 'Compartilhar Resultado'}</span>
          </button>

          {hasNextPuzzle && (
            <button
              onClick={onNextPuzzle}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <span>{isInfiniteMode ? 'Continuar Sequência Infinita 🔥' : 'Jogar Próximo Grid'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
