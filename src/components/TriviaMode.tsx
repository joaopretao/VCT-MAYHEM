import React, { useState, useEffect, useMemo } from 'react';
import { Search, Check, X, ArrowUp, ArrowDown, HelpCircle, Trophy, RotateCcw, MapPin, Calendar, Flame } from 'lucide-react';
import { Player, TriviaGuess } from '../types';
import { PLAYERS_DATABASE, TEAMS_DATABASE } from '../data/teamsAndPlayers';
import { getTeamLogoData } from '../data/teamLogos';
import { ROLE_NAMES_PT } from '../data/roleIcons';
import { AGENT_FULL_PORTRAITS } from '../data/agentIcons';
import { getLocalDateKey, getPreviousDateKey, formatDateKeyPtBr } from '../data/infiniteGridGenerator';
import { getTriviaPlayerMeta, TriviaPlayerStatus } from '../data/triviaMetadata';
import { playRoundWinSound, playRoundLossSound, playSelectSound } from '../utils/audio';
import { TeamLogo } from './TeamLogo';
import { PlayerAvatar } from './PlayerAvatar';
import { CountryFlag } from './CountryFlag';
import { RoleEmblem } from './RoleEmblem';
import { Card, PrimaryButton } from './ui';

interface CanonicalTriviaPlayer {
  player: Player;
  debutYear: number;
  trophies: number;
  birthDate: string;
  age: number;
  status: TriviaPlayerStatus;
}

const MAX_TRIVIA_ATTEMPTS = 8;
const DAILY_TRIVIA_PREFIX = 'vct_trivia_daily_v1_';
const DAILY_TRIVIA_STREAK_KEY = 'vct_trivia_daily_streak_v1';

interface StoredDailyTrivia {
  guessIgns: string[];
  targetIgn: string;
}

interface TriviaStreakData {
  streak: number;
  lastCompletedDate: string | null;
}

const buildCanonicalTriviaRoster = (): CanonicalTriviaPlayer[] => {
  const byIgn = new Map<string, Player[]>();
  for (const p of PLAYERS_DATABASE) {
    const key = p.ign.trim().toLowerCase();
    const list = byIgn.get(key) || [];
    list.push(p);
    byIgn.set(key, list);
  }
  return Array.from(byIgn.values())
    .map(entries => {
      const sorted = [...entries].sort((a, b) => b.year - a.year);
      const earliestDbYear = Math.min(...entries.map(e => e.year));
      const latestPlayer = sorted[0];
      const meta = getTriviaPlayerMeta(latestPlayer, earliestDbYear);
      return {
        player: latestPlayer,
        ...meta,
      };
    })
    .sort((a, b) => a.player.ign.localeCompare(b.player.ign));
};

const CANONICAL_TRIVIA_PLAYERS: CanonicalTriviaPlayer[] = buildCanonicalTriviaRoster();

const CANONICAL_BY_IGN = new Map<string, CanonicalTriviaPlayer>(
  CANONICAL_TRIVIA_PLAYERS.map(entry => [entry.player.ign.trim().toLowerCase(), entry])
);

const getDailyTarget = (dateKey: string): CanonicalTriviaPlayer => {
  let hash = 2166136261;
  const seedStr = `vct-daily-trivia-${dateKey}`;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const index = (hash >>> 0) % CANONICAL_TRIVIA_PLAYERS.length;
  return CANONICAL_TRIVIA_PLAYERS[index];
};

const loadTriviaStreak = (todayKey: string): TriviaStreakData => {
  try {
    const raw = localStorage.getItem(DAILY_TRIVIA_STREAK_KEY);
    if (!raw) return { streak: 0, lastCompletedDate: null };
    const parsed = JSON.parse(raw) as TriviaStreakData;
    const yesterdayKey = getPreviousDateKey(todayKey);
    if (
      parsed.lastCompletedDate &&
      parsed.lastCompletedDate !== todayKey &&
      parsed.lastCompletedDate !== yesterdayKey
    ) {
      return { streak: 0, lastCompletedDate: parsed.lastCompletedDate };
    }
    return {
      streak: parsed.streak || 0,
      lastCompletedDate: parsed.lastCompletedDate || null,
    };
  } catch {
    return { streak: 0, lastCompletedDate: null };
  }
};

export const TriviaMode: React.FC = () => {
  const [todayKey] = useState<string>(() => getLocalDateKey());
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const [targetEntry, setTargetEntry] = useState<CanonicalTriviaPlayer | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [guesses, setGuesses] = useState<TriviaGuess[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(() => loadTriviaStreak(todayKey).streak);

  const getRegionForTeam = (teamName: string): string => {
    const dbTeam = TEAMS_DATABASE.find(t => t.name.toLowerCase() === teamName.toLowerCase());
    if (dbTeam) return dbTeam.region;

    const logoData = getTeamLogoData(teamName);
    if (logoData) return logoData.category;

    return 'Americas';
  };

  const evaluateGuess = (
    guessEntry: CanonicalTriviaPlayer,
    target: CanonicalTriviaPlayer
  ): TriviaGuess => {
    const selected = guessEntry.player;
    const targetPlayer = target.player;
    const isMatch =
      selected.id === targetPlayer.id ||
      selected.ign.toLowerCase() === targetPlayer.ign.toLowerCase();

    const targetRegion = getRegionForTeam(targetPlayer.team);
    const guessRegion = getRegionForTeam(selected.team);

    let debutComparison: 'correct' | 'higher' | 'lower' = 'correct';
    if (guessEntry.debutYear < target.debutYear) {
      debutComparison = 'higher';
    } else if (guessEntry.debutYear > target.debutYear) {
      debutComparison = 'lower';
    }

    let trophiesComparison: 'correct' | 'higher' | 'lower' = 'correct';
    if (guessEntry.trophies < target.trophies) {
      trophiesComparison = 'higher';
    } else if (guessEntry.trophies > target.trophies) {
      trophiesComparison = 'lower';
    }

    let ageComparison: 'correct' | 'higher' | 'lower' = 'correct';
    if (guessEntry.age < target.age) {
      ageComparison = 'higher';
    } else if (guessEntry.age > target.age) {
      ageComparison = 'lower';
    }
    const ageDiff = Math.abs(guessEntry.age - target.age);
    const ageClose = ageDiff > 0 && ageDiff <= 2;

    let statusMatch: 'correct' | 'partial' | 'wrong' = 'wrong';
    if (guessEntry.status === target.status) {
      statusMatch = 'correct';
    } else if (guessEntry.status !== 'Ativo' && target.status !== 'Ativo') {
      statusMatch = 'partial';
    }

    const countryMatch =
      (selected.countryCode || selected.country || '').toLowerCase() ===
      (targetPlayer.countryCode || targetPlayer.country || '').toLowerCase();

    return {
      player: selected,
      debutYear: guessEntry.debutYear,
      trophies: guessEntry.trophies,
      age: guessEntry.age,
      status: guessEntry.status,
      isCorrect: isMatch,
      matches: {
        country: countryMatch ? 'correct' : 'wrong',
        region: targetRegion === guessRegion ? 'correct' : 'wrong',
        team: selected.team.toLowerCase() === targetPlayer.team.toLowerCase() ? 'correct' : 'wrong',
        debut: debutComparison,
        trophies: trophiesComparison,
        age: ageComparison,
        ageClose,
        status: statusMatch,
        role: selected.primaryRole === targetPlayer.primaryRole ? 'correct' : 'wrong',
        agent: selected.signatureAgent === targetPlayer.signatureAgent ? 'correct' : 'wrong',
      },
    };
  };

  // Load target player on mount or mode switch
  useEffect(() => {
    initRound(mode);
  }, [mode]);

  const initRound = (gameMode: 'daily' | 'practice') => {
    setSearchTerm('');

    if (gameMode === 'daily') {
      const dailyTarget = getDailyTarget(todayKey);
      setTargetEntry(dailyTarget);

      try {
        const raw = localStorage.getItem(`${DAILY_TRIVIA_PREFIX}${todayKey}`);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredDailyTrivia;
          if (parsed.targetIgn === dailyTarget.player.ign.toLowerCase() && Array.isArray(parsed.guessIgns)) {
            const restored: TriviaGuess[] = [];
            for (const ign of parsed.guessIgns) {
              const found = CANONICAL_BY_IGN.get(ign.toLowerCase());
              if (found) restored.push(evaluateGuess(found, dailyTarget));
            }
            const won = restored.some(g => g.isCorrect);
            const done = won || restored.length >= MAX_TRIVIA_ATTEMPTS;
            setGuesses(restored);
            setIsGameOver(done);
            return;
          }
        }
      } catch {
        // ignore invalid storage
      }

      setGuesses([]);
      setIsGameOver(false);
      return;
    }

    const randomEntry =
      CANONICAL_TRIVIA_PLAYERS[Math.floor(Math.random() * CANONICAL_TRIVIA_PLAYERS.length)];
    setTargetEntry(randomEntry);
    setGuesses([]);
    setIsGameOver(false);
  };

  const handleMakeGuess = (guessEntry: CanonicalTriviaPlayer) => {
    if (!targetEntry || isGameOver) return;
    const guessedIgn = guessEntry.player.ign.toLowerCase();
    if (guesses.some(g => g.player.ign.toLowerCase() === guessedIgn)) return;

    playSelectSound();

    const newGuess = evaluateGuess(guessEntry, targetEntry);
    const updatedGuesses = [newGuess, ...guesses];
    const isMatch = newGuess.isCorrect;
    const roundEnded = isMatch || updatedGuesses.length >= MAX_TRIVIA_ATTEMPTS;

    setGuesses(updatedGuesses);
    setSearchTerm('');

    if (mode === 'daily') {
      try {
        const payload: StoredDailyTrivia = {
          targetIgn: targetEntry.player.ign.toLowerCase(),
          guessIgns: updatedGuesses.map(g => g.player.ign.toLowerCase()),
        };
        localStorage.setItem(`${DAILY_TRIVIA_PREFIX}${todayKey}`, JSON.stringify(payload));
      } catch {
        // ignore storage quota errors
      }
    }

    if (isMatch) {
      setIsGameOver(true);
      playRoundWinSound();

      if (mode === 'daily') {
        const streakData = loadTriviaStreak(todayKey);
        if (streakData.lastCompletedDate !== todayKey) {
          const yesterdayKey = getPreviousDateKey(todayKey);
          const nextStreak = streakData.lastCompletedDate === yesterdayKey ? streakData.streak + 1 : 1;
          setStreak(nextStreak);
          try {
            localStorage.setItem(
              DAILY_TRIVIA_STREAK_KEY,
              JSON.stringify({ streak: nextStreak, lastCompletedDate: todayKey })
            );
          } catch {
            // ignore
          }
        }
      }
    } else if (roundEnded) {
      setIsGameOver(true);
      playRoundLossSound();

      if (mode === 'daily') {
        const streakData = loadTriviaStreak(todayKey);
        if (streakData.lastCompletedDate !== todayKey) {
          setStreak(0);
          try {
            localStorage.setItem(
              DAILY_TRIVIA_STREAK_KEY,
              JSON.stringify({ streak: 0, lastCompletedDate: todayKey })
            );
          } catch {
            // ignore
          }
        }
      }
    } else {
      playRoundLossSound();
    }
  };

  const targetPlayer = targetEntry?.player ?? null;

  const guessedIgns = useMemo(
    () => new Set(guesses.map(g => g.player.ign.toLowerCase())),
    [guesses]
  );

  // Spoiler-free filter: matches ONLY by IGN or real name across the 220 unique athletes
  const filteredPlayers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    return CANONICAL_TRIVIA_PLAYERS.filter(entry => {
      if (guessedIgns.has(entry.player.ign.toLowerCase())) return false;
      return (
        entry.player.ign.toLowerCase().includes(term) ||
        entry.player.name.toLowerCase().includes(term)
      );
    }).slice(0, 7);
  }, [searchTerm, guessedIgns]);

  return (
    <div className="max-w-6xl mx-auto my-1 sm:my-4 space-y-3 sm:space-y-4">
      {/* Header Banner */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-4xl font-display font-bold uppercase text-white tracking-wide leading-none">
          Descubra o Player
        </h2>
      </div>

      {/* Mode Selector & Streak */}
      <Card padding="none" className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300">
              <span className="hidden sm:inline">Sequência Diária: </span>
              <strong className="text-amber-400 font-bold font-mono-vct">{streak}</strong>
            </span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 font-mono-vct">
            <span className="hidden sm:inline">Tentativas: </span>
            <strong className="text-white">{guesses.length}/{MAX_TRIVIA_ATTEMPTS}</strong>
          </span>
          {mode === 'daily' && (
            <>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <span className="hidden sm:inline font-mono-vct text-xs text-[#38bdf8]">
                {formatDateKeyPtBr(todayKey)}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1 bg-[#0b0e14] p-1 rounded-[3px] border border-white/10">
            <button
              onClick={() => {
                playSelectSound();
                setMode('daily');
              }}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'daily'
                  ? 'bg-[#ff4655] text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Desafio Diário</span>
            </button>
            <button
              onClick={() => {
                playSelectSound();
                if (mode === 'practice') {
                  initRound('practice');
                } else {
                  setMode('practice');
                }
              }}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'practice'
                  ? 'bg-[#ff4655] text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Treino Livre</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Input Search Box */}
      {!isGameOver && (
        <div className="relative max-w-lg mx-auto">
          <div className="relative">
            <input
              id="trivia-player-input"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Digite o nick ou nome real (ex: aspas, TenZ, ZmjjKK, Derke)..."
              className="w-full bg-[#11151d] border border-white/15 rounded-[3px] px-4 py-2.5 pl-10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#ff4655]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Spoiler-free Autocomplete Dropdown (Avatar + IGN + Name ONLY) */}
          {filteredPlayers.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#11151d] border border-white/15 rounded-[3px] shadow-2xl z-30 overflow-hidden divide-y divide-white/[0.06]">
              {filteredPlayers.map(entry => {
                const p = entry.player;
                return (
                  <button
                    key={p.ign}
                    onClick={() => handleMakeGuess(entry)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-[#191f2b] transition-colors group cursor-pointer"
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
                    <span className="text-[11px] font-mono-vct uppercase tracking-wider text-slate-400 group-hover:text-white">
                      Escolher
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Victory / Defeat Announcement with Crisp Agent Reveal Banner */}
      {isGameOver && targetPlayer && targetEntry && (
        <Card variant="modal" padding="lg" className="text-center max-w-xl mx-auto animate-popIn">
          {guesses[0]?.isCorrect ? (
            <div className="mb-4">
              <div className="w-11 h-11 rounded-[3px] bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto mb-2 text-emerald-400">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-display font-bold uppercase tracking-wider text-emerald-400">
                Acertou em {guesses.length}.
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Você descobriu o atleta secreto!
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <div className="w-11 h-11 rounded-[3px] bg-rose-500/15 border border-rose-500/40 flex items-center justify-center mx-auto mb-2 text-rose-400">
                <X className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-display font-bold uppercase tracking-wider text-rose-400">
                Sem vidas restantes.
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Você usou todas as 8 tentativas. O pro player secreto era:
              </p>
            </div>
          )}

          {/* Crisp Broadcast Player Reveal Card (Shown on Both Win & Loss) */}
          <div className="relative overflow-hidden max-w-md mx-auto mb-5 rounded-[4px] bg-[#070b12] border border-white/15 text-left">
            {targetPlayer.signatureAgent && AGENT_FULL_PORTRAITS[targetPlayer.signatureAgent] && (
              <img
                src={AGENT_FULL_PORTRAITS[targetPlayer.signatureAgent]}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                className="pointer-events-none select-none absolute right-[-6%] top-[-18%] h-[185%] w-auto max-w-none object-contain opacity-45"
              />
            )}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(7,11,18,0.95) 0%, rgba(7,11,18,0.78) 58%, rgba(7,11,18,0.42) 100%)',
              }}
              aria-hidden
            />

            <div className="relative z-10 p-3.5 space-y-3">
              <div className="flex items-center gap-3">
                <PlayerAvatar player={targetPlayer} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-display font-bold uppercase text-white tracking-wide leading-none truncate">
                      {targetPlayer.ign}
                    </span>
                    {targetPlayer.countryCode && (
                      <CountryFlag code={targetPlayer.countryCode} country={targetPlayer.country} size="xs" />
                    )}
                  </div>
                  <div className="text-xs text-slate-300 truncate mt-0.5">
                    {targetPlayer.name}
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-[2px] bg-[#06090f]/85 border border-white/15 text-xs font-mono-vct text-slate-200 shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[#ff4655]" />
                  <span>{targetPlayer.countryCode}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-vct">
                <div className="p-2 rounded-[3px] bg-[#06090f]/80 border border-white/[0.09]">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Equipe</span>
                  <span className="inline-flex items-center gap-1 text-white font-semibold mt-0.5 truncate max-w-full">
                    <TeamLogo teamName={targetPlayer.team} size="xs" />
                    <span className="truncate">{targetPlayer.team}</span>
                  </span>
                </div>
                <div className="p-2 rounded-[3px] bg-[#06090f]/80 border border-white/[0.09]">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Idade / Status</span>
                  <span className="text-white font-semibold mt-0.5 block truncate">
                    {targetEntry.age}a · {targetEntry.status}
                  </span>
                </div>
                <div className="p-2 rounded-[3px] bg-[#06090f]/80 border border-white/[0.09]">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Estreia / LANs</span>
                  <span className="text-white font-semibold mt-0.5 block">
                    {targetEntry.debutYear} · {targetEntry.trophies}
                  </span>
                </div>
                <div className="p-2 rounded-[3px] bg-[#06090f]/80 border border-white/[0.09]">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Agente</span>
                  <span className="inline-flex items-center gap-1 text-white font-semibold mt-0.5 truncate max-w-full">
                    <RoleEmblem role={targetPlayer.primaryRole} size="xs" showBackground={false} />
                    <span className="truncate">{targetPlayer.signatureAgent}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {mode === 'daily' && (
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono-vct text-slate-400 mb-3">
              <Calendar className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Desafio Diário concluído — volte amanhã para o próximo atleta</span>
            </div>
          )}

          <PrimaryButton
            onClick={() => {
              playSelectSound();
              if (mode === 'practice') {
                initRound('practice');
              } else {
                setMode('practice');
              }
            }}
            size="md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{mode === 'daily' ? 'Jogar Treino Livre' : 'Jogar de novo'}</span>
          </PrimaryButton>
        </Card>
      )}

      {/* Pre-First-Guess Guide Panel (10 Clue Columns Explanation) */}
      {guesses.length === 0 && !isGameOver && (
        <Card padding="none" className="p-3 sm:p-4 animate-fadeIn">
          <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#38bdf8]" />
              <h3 className="text-xs sm:text-sm font-mono-vct font-bold uppercase tracking-wider text-white">
                Guia das 10 Colunas de Pistas
              </h3>
            </div>
            <span className="text-xs font-mono-vct text-slate-300">
              Faça seu 1º palpite acima para começar
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 text-center mb-3 sm:mb-4">
            {[
              { col: 'Jogador', desc: 'Foto e Nick do pro' },
              { col: 'País', desc: 'Nacionalidade' },
              { col: 'Equipe', desc: 'Time no banco VCT' },
              { col: 'Região', desc: 'Americas, EMEA, Pacific ou CN' },
              { col: 'Idade', desc: 'Anos (âmbar = ±2 anos)' },
              { col: 'Estreia', desc: 'Ano no Tier 1 (2021–2026)' },
              { col: 'Títulos', desc: 'Troféus LAN VCT (2021–2025)' },
              { col: 'Status', desc: 'Ativo, Reserva/FA ou Aposentado' },
              { col: 'Função', desc: 'Duelista, Controlador...' },
              { col: 'Agente', desc: 'Agente assinatura' },
            ].map(item => (
              <div
                key={item.col}
                className="tracker-subcard p-2 sm:p-2.5 flex flex-col items-center justify-center"
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
              <span className="w-3 h-3 rounded-sm bg-amber-500/40 border border-amber-400 inline-block" />
              <span className="text-slate-300">Âmbar = Próximo (±2 anos / Inativo) / ↑↓</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500/40 border border-rose-400 inline-block" />
              <span className="text-slate-300">Vermelho = Incorreto</span>
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
          <div className="min-w-[940px] bg-[#070b12]/85 border border-white/12 rounded-[4px] p-3.5">
            {/* Table Header */}
            <div className="grid grid-cols-10 gap-1.5 text-center text-xs font-mono-vct text-slate-400 font-semibold uppercase pb-2.5 border-b border-white/[0.08]">
              <div>Jogador</div>
              <div>País</div>
              <div>Equipe</div>
              <div>Região</div>
              <div>Idade</div>
              <div>Estreia</div>
              <div>Títulos</div>
              <div>Status</div>
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
                    className="grid grid-cols-10 gap-1.5 text-center text-xs font-mono-vct font-semibold animate-fadeIn"
                  >
                    {/* Player Name */}
                    <div
                      className={`p-2 rounded flex items-center justify-center gap-1.5 border ${
                        guess.isCorrect
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : 'bg-[#151f2e] border-slate-700 text-white'
                      }`}
                    >
                      <PlayerAvatar player={guess.player} size="xs" />
                      <span className="truncate">{guess.player.ign}</span>
                    </div>

                    {/* Country */}
                    <div
                      title={guess.player.country}
                      className={`p-2 rounded flex items-center justify-center border ${
                        guess.matches.country === 'correct'
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : 'bg-rose-950/30 border-rose-800 text-rose-300'
                      }`}
                    >
                      <span className="truncate">{guess.player.countryCode || guess.player.country}</span>
                    </div>

                    {/* Team */}
                    <div
                      className={`p-2 rounded flex items-center justify-center gap-1 border ${
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
                      className={`p-2 rounded flex items-center justify-center border ${
                        guess.matches.region === 'correct'
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : 'bg-rose-950/30 border-rose-800 text-rose-300'
                      }`}
                    >
                      <span>{guessReg}</span>
                    </div>

                    {/* Age */}
                    <div
                      className={`p-2 rounded flex items-center justify-center gap-1 border ${
                        guess.matches.age === 'correct'
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : guess.matches.ageClose
                            ? 'bg-amber-950/40 border-amber-600 text-amber-300'
                            : 'bg-rose-950/30 border-rose-800 text-rose-300'
                      }`}
                    >
                      <span>{guess.age}</span>
                      {guess.matches.age === 'higher' && (
                        <ArrowUp className={`w-3.5 h-3.5 ${guess.matches.ageClose ? 'text-amber-400' : 'text-rose-400'}`} />
                      )}
                      {guess.matches.age === 'lower' && (
                        <ArrowDown className={`w-3.5 h-3.5 ${guess.matches.ageClose ? 'text-amber-400' : 'text-rose-400'}`} />
                      )}
                    </div>

                    {/* Tier 1 Debut Year */}
                    <div
                      className={`p-2 rounded flex items-center justify-center gap-1 border ${
                        guess.matches.debut === 'correct'
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : 'bg-amber-950/40 border-amber-600 text-amber-300'
                      }`}
                    >
                      <span>{guess.debutYear}</span>
                      {guess.matches.debut === 'higher' && <ArrowUp className="w-3.5 h-3.5 text-amber-400" />}
                      {guess.matches.debut === 'lower' && <ArrowDown className="w-3.5 h-3.5 text-amber-400" />}
                    </div>

                    {/* International Trophies */}
                    <div
                      className={`p-2 rounded flex items-center justify-center gap-1 border ${
                        guess.matches.trophies === 'correct'
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : 'bg-amber-950/40 border-amber-600 text-amber-300'
                      }`}
                    >
                      <span>{guess.trophies}</span>
                      {guess.matches.trophies === 'higher' && <ArrowUp className="w-3.5 h-3.5 text-amber-400" />}
                      {guess.matches.trophies === 'lower' && <ArrowDown className="w-3.5 h-3.5 text-amber-400" />}
                    </div>

                    {/* Competitive Status */}
                    <div
                      className={`p-2 rounded flex items-center justify-center border ${
                        guess.matches.status === 'correct'
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : guess.matches.status === 'partial'
                            ? 'bg-amber-950/40 border-amber-600 text-amber-300'
                            : 'bg-rose-950/30 border-rose-800 text-rose-300'
                      }`}
                    >
                      <span className="truncate">{guess.status}</span>
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
