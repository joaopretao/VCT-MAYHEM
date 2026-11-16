import React, { useState, useMemo } from 'react';
import { Search, X, AlertCircle, CheckCircle, User } from 'lucide-react';
import { Player } from '../types';
import { GridCriterion, playerMatchesCriterion, GRID_PLAYERS_DATABASE } from '../data/gridPuzzles';
import { playLockSound } from '../utils/audio';
import { GridVisualBadge } from './GridVisualBadge';
import { PlayerAvatar } from './PlayerAvatar';

interface GridPlayerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowCriterion: GridCriterion;
  colCriterion: GridCriterion;
  currentPoints: number;
  usedPlayerIds: string[];
  onSelectCorrectPlayer: (player: Player, pointsEarned: number) => void;
  onWrongGuess: () => void;
}

export const GridPlayerSearchModal: React.FC<GridPlayerSearchModalProps> = ({
  isOpen,
  onClose,
  rowCriterion,
  colCriterion,
  currentPoints,
  usedPlayerIds,
  onSelectCorrectPlayer,
  onWrongGuess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Deduplicate players by IGN (keep latest entry)
  const allUniquePlayers = useMemo(() => {
    const map = new Map<string, Player>();
    GRID_PLAYERS_DATABASE.forEach(p => {
      const key = p.ign.toLowerCase();
      if (!map.has(key)) {
        map.set(key, p);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.ign.localeCompare(b.ign));
  }, []);

  // Filter strictly by player IGN or real name (no team/country spoilers!)
  const filteredPlayers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allUniquePlayers.slice(0, 25);
    return allUniquePlayers.filter(
      p => p.ign.toLowerCase().includes(term) || p.name.toLowerCase().includes(term)
    );
  }, [allUniquePlayers, searchTerm]);

  if (!isOpen) return null;

  // Check if this cell has any valid player that hasn't been used yet
  const hasUnusedValidCandidate = allUniquePlayers.some(p => {
    const valid = playerMatchesCriterion(p, rowCriterion) && playerMatchesCriterion(p, colCriterion);
    if (!valid) return false;
    const used = usedPlayerIds.some(id => {
      const usedObj = GRID_PLAYERS_DATABASE.find(u => u.id === id);
      return id === p.id || (usedObj && usedObj.ign.toLowerCase() === p.ign.toLowerCase());
    });
    return !used;
  });

  const handlePlayerClick = (player: Player) => {
    const isAlreadyUsed = usedPlayerIds.some(id => {
      const usedObj = GRID_PLAYERS_DATABASE.find(p => p.id === id);
      return id === player.id || (usedObj && usedObj.ign.toLowerCase() === player.ign.toLowerCase());
    });

    if (isAlreadyUsed && hasUnusedValidCandidate) {
      setFeedback({
        type: 'error',
        message: `${player.ign} já foi utilizado em outra célula deste tabuleiro!`,
      });
      return;
    }

    const matchesRow = playerMatchesCriterion(player, rowCriterion);
    const matchesCol = playerMatchesCriterion(player, colCriterion);

    if (matchesRow && matchesCol) {
      playLockSound();
      setFeedback({
        type: 'success',
        message: `Correto! ${player.ign} cumpre ambos os critérios! (+${currentPoints} pts)`,
      });
      setTimeout(() => {
        onSelectCorrectPlayer(player, currentPoints);
        setFeedback(null);
        setSearchTerm('');
        onClose();
      }, 450);
    } else {
      onWrongGuess();
      let hint = '';
      if (!matchesRow && !matchesCol) {
        hint = `${player.ign} não cumpre nenhum dos dois critérios.`;
      } else if (!matchesRow) {
        hint = `${player.ign} não cumpre o critério "${rowCriterion.label}".`;
      } else {
        hint = `${player.ign} não cumpre o critério "${colCriterion.label}".`;
      }
      setFeedback({
        type: 'error',
        message: `Incorreto! ${hint} (-15 pts)`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl glass-modal overflow-hidden flex flex-col max-h-[88vh] animate-popIn">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-vct uppercase tracking-wider text-[#ff4655] font-bold">
                Grid VCT
              </span>
              <span className="px-2 py-0.5 rounded-[2px] bg-[#e2b714]/15 text-[#e2b714] text-xs font-mono-vct font-bold border border-[#e2b714]/35">
                {currentPoints} pts
              </span>
            </div>
            <h3 className="text-2xl font-display text-white tracking-wide uppercase mt-1">
              Quem fecha os dois critérios?
            </h3>
          </div>
          <button
            id="close-grid-search-btn"
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-[3px] bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clues Banner */}
        <div className="px-4 py-3 bg-[#090c11] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Linha</span>
            <div className="flex items-center gap-2 px-2.5 py-1 surface-sub">
              <GridVisualBadge criterion={rowCriterion} size="sm" />
              <span className="font-bold text-white">{rowCriterion.label}</span>
            </div>
          </div>

          <div className="text-slate-500 font-bold">✕</div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Coluna</span>
            <div className="flex items-center gap-2 px-2.5 py-1 surface-sub">
              <GridVisualBadge criterion={colCriterion} size="sm" />
              <span className="font-bold text-white">{colCriterion.label}</span>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/80 border-b border-rose-500/30 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Search Input */}
        <div className="p-3.5 border-b border-white/10 bg-black/20">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input
              id="grid-player-search-input"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Digite o nick ou nome real do jogador (ex: aspas, Sacy, Derke, Ethan)..."
              autoFocus
              className="w-full pl-10 pr-8 py-2.5 bg-black/40 border border-white/15 rounded-xl text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#ff4655]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Player List (Spoiler-Free: Shows only Avatar, IGN and Real Name) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {filteredPlayers.length === 0 ? (
            <div className="py-10 text-center text-slate-300 space-y-1.5">
              <User className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
              <p className="text-sm font-medium">Nenhum jogador encontrado para "{searchTerm}"</p>
              <p className="text-xs text-slate-400">Tente buscar pelo nick oficial no VCT.</p>
            </div>
          ) : (
            filteredPlayers.map(player => {
              const isUsed =
                hasUnusedValidCandidate &&
                usedPlayerIds.some(id => {
                  const usedObj = GRID_PLAYERS_DATABASE.find(p => p.id === id);
                  return (
                    id === player.id ||
                    (usedObj && usedObj.ign.toLowerCase() === player.ign.toLowerCase())
                  );
                });
              return (
                <div
                  key={player.id}
                  onClick={() => !isUsed && handlePlayerClick(player)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-colors ${
                    isUsed
                      ? 'opacity-40 cursor-not-allowed bg-black/30 border-white/5'
                      : 'glass-film cursor-pointer hover:border-[#ff4655] hover:bg-[#ff4655]/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <PlayerAvatar player={player} size="sm" />
                    <div className="min-w-0">
                      <span className="text-sm text-white font-bold block truncate">
                        {player.ign}
                      </span>
                      <span className="text-xs text-slate-300 block truncate">
                        {player.name}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={isUsed}
                    className={`px-3 py-1 rounded-lg text-xs font-mono-vct font-bold uppercase tracking-wider transition-colors ${
                      isUsed
                        ? 'bg-white/5 text-slate-400'
                        : 'bg-[#ff4655] hover:bg-[#e03b49] text-white'
                    }`}
                  >
                    {isUsed ? 'Usado' : 'Escolher'}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-black/30 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <span>Palpites incorretos descontam 15 pts nesta célula.</span>
          <span className="font-mono-vct font-semibold">{allUniquePlayers.length} atletas no banco</span>
        </div>
      </div>
    </div>
  );
};
