import React, { useState, useEffect } from 'react';
import { Search, Check, X, ArrowUp, ArrowDown, HelpCircle, Trophy, RotateCcw, Lightbulb } from 'lucide-react';
import { Player, TriviaGuess } from '../types';
import { PLAYERS_DATABASE, TEAMS_DATABASE } from '../data/teamsAndPlayers';
import { getTeamLogoData } from '../data/teamLogos';
import { ROLE_NAMES_PT } from '../data/roleIcons';
import { playRoundWinSound, playRoundLossSound, playSelectSound } from '../utils/audio';
import { TeamLogo } from './TeamLogo';
import { PlayerAvatar } from './PlayerAvatar';
import { RoleEmblem } from './RoleEmblem';
import { Confetti } from './Confetti';
import { Card, PrimaryButton, SecondaryButton } from './ui';

export const TriviaMode: React.FC = () => {
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [guesses, setGuesses] = useState<TriviaGuess[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const [streak, setStreak] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Load target player on mount or mode switch
  useEffect(() => {
    initRound(mode);
    const savedStreak = localStorage.getItem('vct_trivia_streak');
    if (savedStreak) {
      setStreak(parseInt(savedStreak, 10) || 0);
    }
  }, [mode]);

  const initRound = (gameMode: 'daily' | 'practice') => {
    let chosen: Player;
    if (gameMode === 'daily') {
      // Deterministic daily player based on day string
      const dateStr = new Date().toISOString().slice(0, 10);
      let hash = 0;
      for (let i = 0; i < dateStr.length; i++) {
        hash = (hash << 5) - hash + dateStr.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % PLAYERS_DATABASE.length;
      chosen = PLAYERS_DATABASE[index];
    } else {
      // Random player
      chosen = PLAYERS_DATABASE[Math.floor(Math.random() * PLAYERS_DATABASE.length)];
    }

    setTargetPlayer(chosen);
    setGuesses([]);
    setIsGameOver(false);
    setSearchTerm('');
    setShowHint(false);
  };

  const getRegionForTeam = (teamName: string): string => {
    const dbTeam = TEAMS_DATABASE.find(t => t.name.toLowerCase() === teamName.toLowerCase());
    if (dbTeam) return dbTeam.region;

    const logoData = getTeamLogoData(teamName);
    if (logoData) return logoData.category;

    return 'Americas';
  };

  const handleMakeGuess = (selected: Player) => {
    if (!targetPlayer || isGameOver) return;
    if (guesses.some(g => g.player.id === selected.id)) return;

    playSelectSound();

    const isMatch =
      selected.id === targetPlayer.id ||
      selected.ign.toLowerCase() === targetPlayer.ign.toLowerCase();

    const targetRegion = getRegionForTeam(targetPlayer.team);
    const guessRegion = getRegionForTeam(selected.team);

    let yearComparison: 'correct' | 'higher' | 'lower' = 'correct';
    if (selected.year < targetPlayer.year) {
      yearComparison = 'higher';
    } else if (selected.year > targetPlayer.year) {
      yearComparison = 'lower';
    }

    const newGuess: TriviaGuess = {
      player: selected,
      isCorrect: isMatch,
      matches: {
        region: targetRegion === guessRegion ? 'correct' : 'wrong',
        team: selected.team === targetPlayer.team ? 'correct' : 'wrong',
        role: selected.primaryRole === targetPlayer.primaryRole ? 'correct' : 'wrong',
        year: yearComparison,
        agent: selected.signatureAgent === targetPlayer.signatureAgent ? 'correct' : 'wrong',
      },
    };

    const updatedGuesses = [newGuess, ...guesses];
    setGuesses(updatedGuesses);
    setSearchTerm('');

    if (isMatch) {
      setIsGameOver(true);
      playRoundWinSound();
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('vct_trivia_streak', String(newStreak));
    } else if (updatedGuesses.length >= 8) {
      setIsGameOver(true);
      playRoundLossSound();
      setStreak(0);
      localStorage.setItem('vct_trivia_streak', '0');
    } else {
      playRoundLossSound();
    }
  };

  const guessedIds = new Set(guesses.map(g => g.player.id));

  const filteredPlayers = PLAYERS_DATABASE.filter(p => {
    if (!searchTerm.trim()) return false;
    if (guessedIds.has(p.id)) return false;
    const term = searchTerm.toLowerCase();
    return (
      p.ign.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term) ||
      p.team.toLowerCase().includes(term)
    );
  }).slice(0, 7);

  return (
    <div className="max-w-3xl mx-auto my-1 sm:my-4 space-y-3 sm:space-y-4">
      {/* Confetti on victory */}
      <Confetti fire={isGameOver && Boolean(guesses[0]?.isCorrect)} />

      {/* Header Banner */}
      <div className="text-center space-y-1 sm:space-y-1.5">
        <span className="font-mono-vct text-xs font-bold uppercase tracking-widest text-[#38bdf8] block">
          Trivia VCT
        </span>
        <h2 className="text-2xl sm:text-4xl font-display font-bold uppercase text-white tracking-wide leading-none">
          Descubra o Pro Player
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          8 tentativas usando time, região, temporada, função e agente assinatura.
        </p>
      </div>

      {/* Mode Selector & Streak */}
      <Card padding="none" className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300">
              <span className="hidden sm:inline">Sequência: </span>
              <strong className="text-amber-400 font-bold font-mono-vct">{streak} vitórias</strong>
            </span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 font-mono-vct">
            <span className="hidden sm:inline">Tentativas: </span>
            <strong className="text-white">{guesses.length}/8</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {guesses.length >= 3 && !isGameOver && targetPlayer && (
            <SecondaryButton
              size="sm"
              onClick={() => {
                playSelectSound();
                setShowHint(true);
              }}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Dica</span>
            </SecondaryButton>
          )}

          <div className="flex items-center gap-1 bg-[#0b0e14] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                playSelectSound();
                setMode('daily');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                mode === 'daily'
                  ? 'bg-[#ff4655] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Desafio Diário
            </button>
            <button
              onClick={() => {
                playSelectSound();
                setMode('practice');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                mode === 'practice'
                  ? 'bg-[#ff4655] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Treino Livre
            </button>
          </div>
        </div>
      </Card>

      {/* Optional Hint Banner */}
      {showHint && targetPlayer && !isGameOver && (
        <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Dica Tática:</strong> O atleta misterioso é natural de{' '}
            <strong className="text-white">{targetPlayer.country} ({targetPlayer.countryCode})</strong> e seu nick começa com a letra{' '}
            <strong className="text-white">"{targetPlayer.ign[0].toUpperCase()}"</strong>.
          </span>
        </div>
      )}

      {/* Input Search Box */}
      {!isGameOver && (
        <div className="relative max-w-lg mx-auto">
          <div className="relative">
            <input
              id="trivia-player-input"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Digite o nick ou time (ex: aspas, TenZ, ZmjjKK, Fnatic)..."
              className="w-full bg-[#11151d] border border-white/15 rounded-[3px] px-4 py-2.5 pl-10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#ff4655]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Autocomplete Dropdown */}
          {filteredPlayers.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#11151d] border border-white/15 rounded-[3px] shadow-2xl z-30 overflow-hidden divide-y divide-white/[0.06]">
              {filteredPlayers.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleMakeGuess(p)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-[#191f2b] transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <PlayerAvatar player={p} size="xs" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white group-hover:text-[#ff4655] text-sm">
                          {p.ign}
                        </span>
                        <span className="text-xs text-slate-400">({p.name})</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#0b0e14] border border-white/10">
                      <TeamLogo teamName={p.team} size="xs" />
                      <span>{p.team} '{p.year.toString().slice(2)}</span>
                    </span>
                    <span className="text-slate-400 text-xs hidden sm:inline">
                      {ROLE_NAMES_PT[p.primaryRole] || p.primaryRole}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Victory / Defeat Announcement */}
      {isGameOver && targetPlayer && (
        <Card variant="modal" padding="lg" className="text-center max-w-md mx-auto animate-popIn">
          {guesses[0]?.isCorrect ? (
            <div>
              <div className="w-12 h-12 rounded-[3px] bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center mx-auto mb-2.5 text-emerald-400">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-display font-bold uppercase tracking-wider text-emerald-400">
                Acertou em {guesses.length}.
              </h3>
              <div className="text-sm text-slate-300 mt-2 mb-5 flex items-center justify-center gap-1.5 flex-wrap">
                <span>Era</span>
                <strong className="text-white font-bold">{targetPlayer.ign}</strong>
                <span className="inline-flex items-center gap-1">
                  (<TeamLogo teamName={targetPlayer.team} size="xs" />
                  {targetPlayer.team} {targetPlayer.year}).
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div className="w-12 h-12 rounded-[3px] bg-rose-500/15 border border-rose-500/35 flex items-center justify-center mx-auto mb-2.5 text-rose-400">
                <X className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-display font-bold uppercase tracking-wider text-rose-400">
                Não foi dessa vez.
              </h3>
              <div className="text-sm text-slate-300 mt-2 mb-5 flex items-center justify-center gap-1.5 flex-wrap">
                <span>A resposta era</span>
                <strong className="text-white font-bold">{targetPlayer.ign}</strong>
                <span className="inline-flex items-center gap-1">
                  (<TeamLogo teamName={targetPlayer.team} size="xs" />
                  {targetPlayer.team} {targetPlayer.year}).
                </span>
              </div>
            </div>
          )}

          <PrimaryButton
            onClick={() => {
              playSelectSound();
              setMode('practice');
              initRound('practice');
            }}
            size="md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Jogar de novo</span>
          </PrimaryButton>
        </Card>
      )}

      {/* Pre-First-Guess Guide Panel (6 Clue Columns Explanation) */}
      {guesses.length === 0 && !isGameOver && (
        <Card padding="none" className="p-3 sm:p-4 animate-fadeIn">
          <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#38bdf8]" />
              <h3 className="text-xs sm:text-sm font-mono-vct font-bold uppercase tracking-wider text-white">
                Guia das 6 Colunas de Pistas
              </h3>
            </div>
            <span className="text-xs font-mono-vct text-slate-300">
              Faça seu 1º palpite acima para começar
            </span>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2 text-center mb-3 sm:mb-4">
            {[
              { col: 'Jogador', desc: 'Foto e Nick do pro player' },
              { col: 'Equipe', desc: 'Organização no Champions' },
              { col: 'Região', desc: 'Americas, EMEA, Pacific ou CN' },
              { col: 'Temporada', desc: 'Ano da edição (2022 a 2026)' },
              { col: 'Função', desc: 'Duelista, Controlador, etc.' },
              { col: 'Agente', desc: 'Agente assinatura do atleta' },
            ].map(item => (
              <div
                key={item.col}
                className="tracker-subcard p-2 sm:p-3 flex flex-col items-center justify-center"
              >
                <span className="text-xs font-mono-vct font-bold uppercase text-[#e2b714] mb-0.5 sm:mb-1">
                  {item.col}
                </span>
                <span className="text-xs text-slate-300 leading-tight line-clamp-2 sm:line-clamp-none">
                  {item.desc}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-2.5 sm:pt-3 border-t border-white/10 text-xs font-mono-vct">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500/40 border border-emerald-400 inline-block" />
              <span className="text-slate-300">Verde = Pista Exata</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500/40 border border-rose-400 inline-block" />
              <span className="text-slate-300">Vermelho = Incorreto</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500/40 border border-amber-400 inline-block" />
              <span className="text-slate-300">Âmbar (↑ / ↓) = Temporada mais recente ou antiga</span>
            </div>
          </div>
        </Card>
      )}

      {/* Guess Feedback Table */}
      {guesses.length > 0 && (
        <div>
          <span className="block sm:hidden text-xs font-mono-vct text-slate-400 mb-1 text-right">
            Deslize a tabela lateralmente →
          </span>
          <div className="overflow-x-auto">
          <div className="min-w-[640px] bg-[#11151d] border border-white/10 rounded-[3px] p-3.5">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-2 text-center text-xs font-mono-vct text-slate-400 font-semibold uppercase pb-2.5 border-b border-white/[0.08]">
              <div>Jogador</div>
              <div>Equipe</div>
              <div>Região</div>
              <div>Temporada</div>
              <div>Função</div>
              <div>Agente</div>
            </div>

            {/* Guess Rows */}
            <div className="space-y-2 mt-2.5">
              {guesses.map((guess, idx) => {
                const guessReg = getRegionForTeam(guess.player.team);

                return (
                  <div
                    key={idx}
                    className="grid grid-cols-6 gap-2 text-center text-xs font-mono-vct font-semibold animate-fadeIn"
                  >
                    {/* Player Name */}
                    <div
                      className={`p-2.5 rounded flex items-center justify-center gap-2 border ${
                        guess.isCorrect
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : 'bg-[#151f2e] border-slate-700 text-white'
                      }`}
                    >
                      <PlayerAvatar player={guess.player} size="xs" />
                      <span className="truncate">{guess.player.ign}</span>
                    </div>

                    {/* Team */}
                    <div
                      className={`p-2.5 rounded flex items-center justify-center gap-1.5 border ${
                        guess.matches.team === 'correct'
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : 'bg-rose-950/30 border-rose-800 text-rose-300'
                      }`}
                    >
                      <TeamLogo teamName={guess.player.team} size="xs" />
                      <span className="truncate">{guess.player.team}</span>
                    </div>

                    {/* Region */}
                    <div
                      className={`p-2.5 rounded flex items-center justify-center border ${
                        guess.matches.region === 'correct'
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : 'bg-rose-950/30 border-rose-800 text-rose-300'
                      }`}
                    >
                      <span>{guessReg}</span>
                    </div>

                    {/* Year */}
                    <div
                      className={`p-2.5 rounded flex items-center justify-center gap-1 border ${
                        guess.matches.year === 'correct'
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : 'bg-amber-950/40 border-amber-600 text-amber-300'
                      }`}
                    >
                      <span>{guess.player.year}</span>
                      {guess.matches.year === 'higher' && <ArrowUp className="w-3.5 h-3.5 text-amber-400" />}
                      {guess.matches.year === 'lower' && <ArrowDown className="w-3.5 h-3.5 text-amber-400" />}
                    </div>

                    {/* Role */}
                    <div
                      className={`p-2.5 rounded flex items-center justify-center gap-1.5 border ${
                        guess.matches.role === 'correct'
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : 'bg-rose-950/30 border-rose-800 text-rose-300'
                      }`}
                    >
                      <RoleEmblem role={guess.player.primaryRole} size="xs" showBackground={false} />
                      <span className="truncate">{ROLE_NAMES_PT[guess.player.primaryRole] || guess.player.primaryRole}</span>
                    </div>

                    {/* Agent */}
                    <div
                      className={`p-2.5 rounded flex items-center justify-center border ${
                        guess.matches.agent === 'correct'
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : 'bg-rose-950/30 border-rose-800 text-rose-300'
                      }`}
                    >
                      <span>{guess.player.signatureAgent}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};
