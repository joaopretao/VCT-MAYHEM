import React, { useState, useMemo, useEffect } from 'react';
import {
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Info,
  Eye,
  Layers,
  AlertTriangle,
  Flag,
} from 'lucide-react';
import { GridCellState, Player } from '../types';
import { GRID_PUZZLES, GridPuzzle, playerMatchesCriterion, GRID_PLAYERS_DATABASE } from '../data/gridPuzzles';
import { GridPlayerSearchModal } from './GridPlayerSearchModal';
import { GridResultModal } from './GridResultModal';
import { GridVisualBadge } from './GridVisualBadge';
import { PlayerAvatar } from './PlayerAvatar';
import { TeamLogo } from './TeamLogo';
import { playSelectSound, playRoundLossSound, playRoundWinSound } from '../utils/audio';
import { Card, PrimaryButton, SecondaryButton, StatPill } from './ui';

const MAX_GRID_ATTEMPTS = 9;

export const ValorantGridMode: React.FC = () => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);

  const puzzle: GridPuzzle = GRID_PUZZLES[currentPuzzleIndex] || GRID_PUZZLES[0];

  const createEmptyCells = (): GridCellState[][] =>
    Array(3)
      .fill(null)
      .map((_, r) =>
        Array(3)
          .fill(null)
          .map((_, c) => ({
            row: r,
            col: c,
            player: null,
            isSolved: false,
            points: 60,
            wrongGuessesCount: 0,
          }))
      );

  const [cells, setCells] = useState<GridCellState[][]>(createEmptyCells);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_GRID_ATTEMPTS);
  const [hasSurrendered, setHasSurrendered] = useState(false);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [showRulesInfo, setShowRulesInfo] = useState(false);
  const [showGridPicker, setShowGridPicker] = useState(false);
  const [showSolutionsWarning, setShowSolutionsWarning] = useState(false);
  const [showSolutionsModal, setShowSolutionsModal] = useState(false);

  const solvedCount = useMemo(() => {
    return cells.reduce((acc, row) => acc + row.filter(c => c.isSolved).length, 0);
  }, [cells]);

  const totalScore = useMemo(() => {
    return cells.reduce(
      (acc, row) => acc + row.filter(c => c.isSolved).reduce((sum, c) => sum + c.points, 0),
      0
    );
  }, [cells]);

  const usedPlayerIds = useMemo(() => {
    const ids: string[] = [];
    cells.forEach(row => {
      row.forEach(cell => {
        if (cell.player) ids.push(cell.player.id);
      });
    });
    return ids;
  }, [cells]);

  // Compute all valid solutions for each of the 9 cells of the current grid
  const cellSolutions = useMemo(() => {
    const sol: Record<string, string[]> = {};
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const rowCrit = puzzle.rows[r];
        const colCrit = puzzle.cols[c];
        const seenLower = new Set<string>();
        const valid: string[] = [];
        for (const p of GRID_PLAYERS_DATABASE) {
          const low = p.ign.toLowerCase();
          if (seenLower.has(low)) continue;
          if (playerMatchesCriterion(p, rowCrit) && playerMatchesCriterion(p, colCrit)) {
            seenLower.add(low);
            valid.push(p.ign);
          }
        }
        sol[`${r}-${c}`] = valid;
      }
    }
    return sol;
  }, [puzzle]);

  const isGameOver = solvedCount === 9 || attemptsLeft <= 0 || hasSurrendered;

  useEffect(() => {
    if (solvedCount === 9) {
      playRoundWinSound();
      const timer = setTimeout(() => {
        setIsResultModalOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
    if (attemptsLeft <= 0 && !hasSurrendered) {
      playRoundLossSound();
      const timer = setTimeout(() => {
        setIsResultModalOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [solvedCount, attemptsLeft, hasSurrendered]);

  const resetBoardState = (nextIndex: number) => {
    setCurrentPuzzleIndex(nextIndex);
    setCells(createEmptyCells());
    setAttemptsLeft(MAX_GRID_ATTEMPTS);
    setHasSurrendered(false);
    setActiveCell(null);
    setIsResultModalOpen(false);
    setShowSolutionsWarning(false);
    setShowSolutionsModal(false);
  };

  const handlePrevPuzzle = () => {
    playSelectSound();
    const prev = (currentPuzzleIndex - 1 + GRID_PUZZLES.length) % GRID_PUZZLES.length;
    resetBoardState(prev);
  };

  const handleNextPuzzle = () => {
    playSelectSound();
    const next = (currentPuzzleIndex + 1) % GRID_PUZZLES.length;
    resetBoardState(next);
  };

  const selectPuzzle = (index: number) => {
    playSelectSound();
    resetBoardState(index);
    setShowGridPicker(false);
  };

  const handleCellClick = (row: number, col: number) => {
    if (isGameOver || cells[row][col].isSolved) return;
    playSelectSound();
    setActiveCell({ row, col });
  };

  const handleSelectCorrectPlayer = (player: Player) => {
    if (!activeCell || isGameOver) return;
    const { row, col } = activeCell;
    setCells(prev => {
      const copy = prev.map(r => [...r]);
      copy[row][col] = {
        ...copy[row][col],
        player,
        isSolved: true,
      };
      return copy;
    });
    setAttemptsLeft(prev => Math.max(0, prev - 1));
    setActiveCell(null);
  };

  const handleWrongGuess = () => {
    if (!activeCell || isGameOver) return;
    const { row, col } = activeCell;
    setCells(prev => {
      const copy = prev.map(r => [...r]);
      const cur = copy[row][col];
      const newWrong = cur.wrongGuessesCount + 1;
      const newPts = Math.max(10, 60 - newWrong * 15);
      copy[row][col] = {
        ...cur,
        wrongGuessesCount: newWrong,
        points: newPts,
      };
      return copy;
    });
    setAttemptsLeft(prev => {
      const next = Math.max(0, prev - 1);
      if (next <= 0) {
        setActiveCell(null);
      }
      return next;
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-1 sm:py-2 space-y-2.5 sm:space-y-4">
      {/* Top Header Card */}
      <Card padding="none" className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-[#e2b714]">
              Grid {puzzle.number}/{GRID_PUZZLES.length}
            </span>
            <span className="text-slate-600">·</span>
            <span className="font-mono-vct text-xs font-bold text-slate-300">
              {solvedCount}/9 células
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 mt-1">
            <span className="vct-slash" aria-hidden />
            <h2 className="font-display text-2xl sm:text-3xl leading-none text-white tracking-wide uppercase">
              {puzzle.title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-1 sm:line-clamp-none">{puzzle.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <StatPill
            label="VIDAS"
            value={`${attemptsLeft}/${MAX_GRID_ATTEMPTS}`}
            color={attemptsLeft <= 2 ? '#ff4655' : '#38bdf8'}
          />
          <StatPill label="PTS" value={totalScore} color="#e2b714" />

          <SecondaryButton
            id="open-grid-picker-btn"
            size="sm"
            onClick={() => setShowGridPicker(prev => !prev)}
            title="Escolher um dos tabuleiros temáticos"
          >
            <Layers className="w-4 h-4 text-[#e2b714]" />
            <span>
              {`Tabuleiro ${puzzle.number}/${GRID_PUZZLES.length}`}
            </span>
          </SecondaryButton>

          <SecondaryButton
            id="prev-grid-puzzle-btn"
            size="sm"
            onClick={handlePrevPuzzle}
            title="Tabuleiro Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </SecondaryButton>

          <SecondaryButton
            id="switch-grid-puzzle-btn"
            size="sm"
            onClick={handleNextPuzzle}
            title="Próximo Tabuleiro"
          >
            <ChevronRight className="w-4 h-4" />
          </SecondaryButton>
        </div>
      </Card>

      {/* Grid Picker Drawer */}
      {showGridPicker && (
        <Card padding="md" className="animate-fadeIn">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <span className="text-xs font-mono-vct font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#e2b714]" />
              Tabuleiros disponíveis ({GRID_PUZZLES.length})
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {GRID_PUZZLES.map((g, idx) => {
              const isSelected = idx === currentPuzzleIndex;
              return (
                <button
                  key={g.id}
                  onClick={() => selectPuzzle(idx)}
                  className={`p-3 rounded-[3px] text-left border transition-colors text-xs flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#ff4655]/15 border-[#ff4655] text-white'
                      : 'surface-sub text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-mono-vct font-bold text-xs text-[#e2b714]">
                      Grid #{g.number}
                    </span>
                    {isSelected && <span className="w-2 h-2 rounded-[1px] bg-[#ff4655]" />}
                  </div>
                  <span className="font-bold text-sm text-white leading-tight line-clamp-2">
                    {g.title}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* 4x4 Grid Board */}
      <Card padding="none" className="p-2 sm:p-4 overflow-x-auto">
        <div className="w-full sm:min-w-[340px] max-w-xl mx-auto grid grid-cols-4 gap-1.5 sm:gap-3 aspect-square">
          {/* Top-Left Corner: GRID Brand */}
          <div className="surface-sub flex flex-col items-center justify-center p-1 sm:p-2 text-center select-none">
            <span className="font-display text-lg sm:text-2xl leading-none text-white tracking-wider">
              GRID
            </span>
            <span className="text-xs font-mono-vct text-[#ff4655] font-bold uppercase tracking-wider mt-0.5">
              VCT
            </span>
          </div>

          {/* Column Headers (Top Row: cols 0, 1, 2) */}
          {puzzle.cols.map(colCrit => (
            <div
              key={colCrit.id}
              className="surface-sub p-1 sm:p-2.5 flex flex-col items-center justify-center text-center select-none"
            >
              <div className="mb-0.5 sm:mb-1.5">
                <GridVisualBadge criterion={colCrit} size="md" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2 sm:line-clamp-1">
                {colCrit.label}
              </span>
              <span className="hidden sm:block text-xs text-slate-400 font-mono-vct line-clamp-1 mt-0.5">
                {colCrit.subLabel}
              </span>
            </div>
          ))}

          {/* 3 Rows with Left Header + 3 Cells */}
          {puzzle.rows.map((rowCrit, rIdx) => (
            <React.Fragment key={rowCrit.id}>
              {/* Row Header (Left Column) */}
              <div className="surface-sub p-1 sm:p-2.5 flex flex-col items-center justify-center text-center select-none">
                <div className="mb-0.5 sm:mb-1.5">
                  <GridVisualBadge criterion={rowCrit} size="md" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2">
                  {rowCrit.label}
                </span>
                <span className="hidden sm:block text-xs text-slate-400 font-mono-vct line-clamp-1 mt-0.5">
                  {rowCrit.subLabel}
                </span>
              </div>

              {/* 3 Interactive Cells in this row */}
              {cells[rIdx].map((cell, cIdx) => {
                const isSolved = cell.isSolved;
                const player = cell.player;

                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    id={`grid-cell-${rIdx}-${cIdx}`}
                    onClick={() => handleCellClick(rIdx, cIdx)}
                    disabled={isSolved || isGameOver}
                    className={`relative rounded-[3px] border transition-colors flex flex-col items-center justify-center p-1 sm:p-2 text-center select-none ${
                      isSolved
                        ? 'bg-emerald-500/10 border-emerald-500/45 cursor-default'
                        : isGameOver
                          ? 'bg-[#0b0e14]/70 border-white/[0.06] cursor-default opacity-60'
                          : 'surface-sub hover:border-[#ff4655] hover:bg-[#1a151c] cursor-pointer group'
                    }`}
                  >
                    {isSolved && player ? (
                      <div className="w-full flex flex-col items-center justify-center">
                        <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5">
                          <span className="text-xs font-mono-vct font-bold px-1 sm:px-1.5 rounded-[2px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            +{cell.points}
                          </span>
                        </div>

                        <div className="mb-0.5 sm:mb-1">
                          <PlayerAvatar player={player} size="sm" />
                        </div>
                        <span className="font-display text-sm sm:text-lg leading-none text-white tracking-wide truncate max-w-full">
                          {player.ign}
                        </span>
                        <div className="hidden sm:flex items-center gap-1 text-xs text-slate-300 truncate max-w-full justify-center mt-0.5">
                          <TeamLogo teamName={player.team} size="xs" />
                          <span className="truncate">{player.team}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-xs sm:text-sm font-mono-vct font-bold text-slate-300 group-hover:text-white transition-colors uppercase">
                          {isGameOver ? '—' : 'Escolher'}
                        </span>
                        {cell.wrongGuessesCount > 0 && (
                          <span className="text-xs font-mono-vct text-rose-400 mt-1">
                            {cell.points} pts
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Grid Action Controls Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SecondaryButton
            id="grid-rules-toggle-btn"
            size="sm"
            onClick={() => setShowRulesInfo(prev => !prev)}
          >
            <HelpCircle className="w-4 h-4 text-[#38bdf8]" />
            <span>Como Jogar</span>
          </SecondaryButton>

          {!isGameOver ? (
            <SecondaryButton
              id="grid-surrender-btn"
              size="sm"
              onClick={() => {
                playSelectSound();
                setShowSolutionsWarning(true);
              }}
            >
              <Flag className="w-4 h-4 text-rose-400" />
              <span>Desistir</span>
            </SecondaryButton>
          ) : (
            <SecondaryButton
              id="grid-show-solutions-btn"
              size="sm"
              onClick={() => {
                playSelectSound();
                setShowSolutionsModal(true);
              }}
            >
              <Eye className="w-4 h-4 text-[#e2b714]" />
              <span>Ver Gabarito</span>
            </SecondaryButton>
          )}
        </div>
      </div>

      {/* Rules Explanations Drawer */}
      {showRulesInfo && (
        <Card padding="md" className="space-y-2 text-xs sm:text-sm text-slate-300 animate-fadeIn">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Info className="w-4 h-4 text-[#38bdf8]" />
            <span>Regras do Grid VCT (Transferências &amp; Nacionalidades)</span>
          </div>
          <p>
            1. Você tem <strong className="text-white">{MAX_GRID_ATTEMPTS} vidas (tentativas)</strong>{' '}
            para preencher as 9 células. Cada célula exige um pro player que cumpra{' '}
            <strong className="text-[#e2b714]">simultaneamente</strong> o critério da linha e o da
            coluna. O gabarito só é liberado após o fim da partida.
          </p>
          <p>
            2. <strong>Janelas de Transferência (Times × Times):</strong> Quando a linha e a coluna
            forem equipes, escolha um atleta que tenha atuado por <strong>ambas</strong> as
            organizações ao longo da carreira no VCT (ex.: <em>aspas</em> em LOUD × Leviatán ou
            MIBR; <em>Sacy</em> em LOUD × Sentinels; <em>Derke</em> em Fnatic × Team Vitality).
          </p>
          <p>
            3. <strong>Nacionalidades (País × Time):</strong> Escolha um atleta daquele país ou
            região que já tenha defendido a organização da coluna.
          </p>
        </Card>
      )}

      {/* Solutions Warning Confirmation Modal */}
      {showSolutionsWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <Card variant="modal" padding="lg" className="relative w-full max-w-md border-amber-500/40 text-center space-y-4 animate-popIn">
            <div className="w-11 h-11 mx-auto rounded-[3px] bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <span className="text-xs font-mono-vct uppercase tracking-widest text-rose-400 font-bold block">
                Encerrar tabuleiro?
              </span>
              <h3 className="text-2xl font-display text-white tracking-wide uppercase mt-1">
                Desistir da partida?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Isso vai finalizar sua tentativa atual e liberar o gabarito completo deste tabuleiro.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <SecondaryButton
                id="cancel-solutions-warning-btn"
                size="md"
                onClick={() => {
                  playSelectSound();
                  setShowSolutionsWarning(false);
                }}
                className="flex-1"
              >
                Voltar pro jogo
              </SecondaryButton>

              <PrimaryButton
                id="confirm-solutions-warning-btn"
                size="md"
                onClick={() => {
                  playRoundLossSound();
                  setShowSolutionsWarning(false);
                  setHasSurrendered(true);
                  setShowSolutionsModal(true);
                }}
                className="flex-1"
              >
                <Eye className="w-4 h-4" />
                <span>Desistir e ver gabarito</span>
              </PrimaryButton>
            </div>
          </Card>
        </div>
      )}

      {/* Solutions / Answers Modal (Only accessible after Game Over) */}
      {showSolutionsModal && isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <Card
            variant="modal"
            padding="lg"
            className="relative w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-popIn"
          >
            <div className="pb-4 mb-4 border-b border-white/10 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono-vct uppercase tracking-widest text-[#e2b714] font-bold">
                  Respostas válidas
                </span>
                <h3 className="text-2xl font-display text-white tracking-wide uppercase mt-0.5">
                  {puzzle.title}
                </h3>
              </div>
              <SecondaryButton
                id="close-solutions-modal-btn"
                size="sm"
                onClick={() => setShowSolutionsModal(false)}
              >
                Fechar
              </SecondaryButton>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {puzzle.rows.map((rowCrit, rIdx) =>
                  puzzle.cols.map((colCrit, cIdx) => {
                    const sol = cellSolutions[`${rIdx}-${cIdx}`] || [];
                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className="surface-sub p-3 flex flex-col"
                      >
                        <div className="text-xs font-bold text-[#e2b714] mb-2 leading-tight">
                          {rowCrit.label} ✕ {colCrit.label}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {sol.length > 0 ? (
                            sol.map(ign => (
                              <span
                                key={ign}
                                className="px-2 py-0.5 rounded-[2px] bg-[#080b10] border border-white/10 text-xs font-mono-vct font-semibold text-slate-200"
                              >
                                {ign}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-rose-400">Nenhum</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Player Search Modal */}
      {activeCell && !isGameOver && (
        <GridPlayerSearchModal
          isOpen={true}
          onClose={() => setActiveCell(null)}
          rowCriterion={puzzle.rows[activeCell.row]}
          colCriterion={puzzle.cols[activeCell.col]}
          currentPoints={cells[activeCell.row][activeCell.col].points}
          attemptsLeft={attemptsLeft}
          onSelectCorrectPlayer={handleSelectCorrectPlayer}
          onWrongGuess={handleWrongGuess}
          usedPlayerIds={usedPlayerIds}
        />
      )}

      {/* Result Modal */}
      <GridResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        puzzle={puzzle}
        cells={cells}
        totalScore={totalScore}
        solvedCount={solvedCount}
        attemptsLeft={attemptsLeft}
        maxAttempts={MAX_GRID_ATTEMPTS}
        hasSurrendered={hasSurrendered}
        onViewSolutions={() => {
          playSelectSound();
          setIsResultModalOpen(false);
          setShowSolutionsModal(true);
        }}
        onNextPuzzle={handleNextPuzzle}
        hasNextPuzzle={true}
        isInfiniteMode={false}
        streak={0}
      />
    </div>
  );
};
