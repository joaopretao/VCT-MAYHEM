import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Calendar,
  Flame,
  Lock,
  Lightbulb,
  HelpCircle,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { Player, TriviaGuess } from '../types';
import { PLAYERS_DATABASE, TEAMS_DATABASE } from '../data/teamsAndPlayers';
import { getTeamLogoData } from '../data/teamLogos';
import { ROLE_COLORS, ROLE_NAMES_PT } from '../data/roleIcons';
import { AGENT_FULL_PORTRAITS, AGENT_ICONS } from '../data/agentIcons';
import { getPlayerPhotoUrl } from '../data/playerPhotos';
import { getPlayerTeamHistory, isTeamMatch } from '../data/gridPuzzles';
import { getLocalDateKey, getPreviousDateKey, formatDateKeyPtBr } from '../data/infiniteGridGenerator';
import {
  getNameInitials,
  getTriviaPlayerMeta,
  isPopularTriviaPlayer,
  TriviaPlayerStatus,
} from '../data/triviaMetadata';
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
  isPopular: boolean;
}

const MAX_TRIVIA_ATTEMPTS = 8;
const HINT_1_THRESHOLD = 4; // Unlocks Signature Agent
const HINT_2_THRESHOLD = 6; // Unlocks Team Logo + Real Name Initials
const DAILY_TRIVIA_PREFIX = 'vct_trivia_daily_v2_';
const DAILY_TRIVIA_STREAK_KEY = 'vct_trivia_daily_streak_v1';

interface StoredDailyTrivia {
  guessIgns: string[];
  targetIgn: string;
  hintsUsed?: number[];
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
        isPopular: isPopularTriviaPlayer(latestPlayer.ign),
      };
    })
    .sort((a, b) => a.player.ign.localeCompare(b.player.ign));
};

const CANONICAL_TRIVIA_PLAYERS: CanonicalTriviaPlayer[] = buildCanonicalTriviaRoster();
const POPULAR_TRIVIA_PLAYERS: CanonicalTriviaPlayer[] = CANONICAL_TRIVIA_PLAYERS.filter(
  e => e.isPopular
);

const CANONICAL_BY_IGN = new Map<string, CanonicalTriviaPlayer>(
  CANONICAL_TRIVIA_PLAYERS.map(entry => [entry.player.ign.trim().toLowerCase(), entry])
);

const getDailyTarget = (dateKey: string): CanonicalTriviaPlayer => {
  const pool = POPULAR_TRIVIA_PLAYERS.length > 0 ? POPULAR_TRIVIA_PLAYERS : CANONICAL_TRIVIA_PLAYERS;
  let hash = 2166136261;
  const seedStr = `vct-daily-trivia-curated-${dateKey}`;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const index = (hash >>> 0) % pool.length;
  return pool[index];
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

function getRegionForTeam(teamName: string): string {
  const dbTeam = TEAMS_DATABASE.find(t => t.name.toLowerCase() === teamName.toLowerCase());
  if (dbTeam) return dbTeam.region;
  const logoData = getTeamLogoData(teamName);
  if (logoData) return logoData.category;
  return 'Americas';
}

function hasSharedTeamHistory(ignA: string, teamA: string, ignB: string, teamB: string): boolean {
  const histA = Array.from(new Set([...getPlayerTeamHistory(ignA), teamA].filter(Boolean)));
  const histB = Array.from(new Set([...getPlayerTeamHistory(ignB), teamB].filter(Boolean)));
  return histA.some(a => histB.some(b => isTeamMatch(a, b) || isTeamMatch(b, a)));
}

function formatNumericRange(
  exact: number | null,
  minBound: number | null,
  maxBound: number | null,
  suffix: string = ''
): string | null {
  if (exact !== null) return `${exact}${suffix}`;
  if (minBound !== null && maxBound !== null) {
    if (minBound === maxBound) return `${minBound}${suffix}`;
    return `${minBound}–${maxBound}${suffix}`;
  }
  if (minBound !== null) return `≥ ${minBound}${suffix}`;
  if (maxBound !== null) return `≤ ${maxBound}${suffix}`;
  return null;
}

export const TriviaMode: React.FC = () => {
  const [todayKey] = useState<string>(() => getLocalDateKey());
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const [practicePool, setPracticePool] = useState<'popular' | 'all'>('popular');
  const [targetEntry, setTargetEntry] = useState<CanonicalTriviaPlayer | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [guesses, setGuesses] = useState<TriviaGuess[]>([]);
  const [hintsUsed, setHintsUsed] = useState<number[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(() => loadTriviaStreak(todayKey).streak);
  const [photoError, setPhotoError] = useState<boolean>(false);

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
    if (guessEntry.debutYear < target.debutYear) debutComparison = 'higher';
    else if (guessEntry.debutYear > target.debutYear) debutComparison = 'lower';

    let trophiesComparison: 'correct' | 'higher' | 'lower' = 'correct';
    if (guessEntry.trophies < target.trophies) trophiesComparison = 'higher';
    else if (guessEntry.trophies > target.trophies) trophiesComparison = 'lower';

    let ageComparison: 'correct' | 'higher' | 'lower' = 'correct';
    if (guessEntry.age < target.age) ageComparison = 'higher';
    else if (guessEntry.age > target.age) ageComparison = 'lower';
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

    const exactTeam =
      selected.team.toLowerCase() === targetPlayer.team.toLowerCase() ||
      isTeamMatch(selected.team, targetPlayer.team);
    const sharedTeam =
      !exactTeam &&
      hasSharedTeamHistory(selected.ign, selected.team, targetPlayer.ign, targetPlayer.team);
    const teamMatch: 'correct' | 'partial' | 'wrong' = exactTeam
      ? 'correct'
      : sharedTeam
      ? 'partial'
      : 'wrong';

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
        team: teamMatch,
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

  const persistDailyProgress = (
    targetIgn: string,
    updatedGuesses: TriviaGuess[],
    updatedHints: number[]
  ) => {
    try {
      const payload: StoredDailyTrivia = {
        targetIgn: targetIgn.toLowerCase(),
        guessIgns: updatedGuesses.map(g => g.player.ign.toLowerCase()),
        hintsUsed: updatedHints,
      };
      localStorage.setItem(`${DAILY_TRIVIA_PREFIX}${todayKey}`, JSON.stringify(payload));
    } catch {
      // ignore storage quota errors
    }
  };

  const initRound = (gameMode: 'daily' | 'practice', poolType: 'popular' | 'all' = practicePool) => {
    setSearchTerm('');
    setPhotoError(false);

    if (gameMode === 'daily') {
      const dailyTarget = getDailyTarget(todayKey);
      setTargetEntry(dailyTarget);

      try {
        const raw = localStorage.getItem(`${DAILY_TRIVIA_PREFIX}${todayKey}`);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredDailyTrivia;
          if (
            parsed.targetIgn === dailyTarget.player.ign.toLowerCase() &&
            Array.isArray(parsed.guessIgns)
          ) {
            const restored: TriviaGuess[] = [];
            for (const ign of parsed.guessIgns) {
              const found = CANONICAL_BY_IGN.get(ign.toLowerCase());
              if (found) restored.push(evaluateGuess(found, dailyTarget));
            }
            const won = restored.some(g => g.isCorrect);
            const done = won || restored.length >= MAX_TRIVIA_ATTEMPTS;
            setGuesses(restored);
            setHintsUsed(Array.isArray(parsed.hintsUsed) ? parsed.hintsUsed : []);
            setIsGameOver(done);
            return;
          }
        }
      } catch {
        // ignore invalid storage
      }

      setGuesses([]);
      setHintsUsed([]);
      setIsGameOver(false);
      return;
    }

    const pool =
      poolType === 'popular' && POPULAR_TRIVIA_PLAYERS.length > 0
        ? POPULAR_TRIVIA_PLAYERS
        : CANONICAL_TRIVIA_PLAYERS;
    const randomEntry = pool[Math.floor(Math.random() * pool.length)];
    setTargetEntry(randomEntry);
    setGuesses([]);
    setHintsUsed([]);
    setIsGameOver(false);
  };

  useEffect(() => {
    initRound(mode, practicePool);
  }, [mode, practicePool]);

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
      persistDailyProgress(targetEntry.player.ign, updatedGuesses, hintsUsed);
    }

    if (isMatch) {
      setIsGameOver(true);
      playRoundWinSound();

      if (mode === 'daily') {
        const streakData = loadTriviaStreak(todayKey);
        if (streakData.lastCompletedDate !== todayKey) {
          const yesterdayKey = getPreviousDateKey(todayKey);
          const nextStreak =
            streakData.lastCompletedDate === yesterdayKey ? streakData.streak + 1 : 1;
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

  const handleUnlockHint = (hintNum: 1 | 2) => {
    if (!targetEntry || isGameOver) return;
    if (hintsUsed.includes(hintNum)) return;
    const wrongCount = guesses.filter(g => !g.isCorrect).length;
    const needed = hintNum === 1 ? HINT_1_THRESHOLD : HINT_2_THRESHOLD;
    if (wrongCount < needed) return;

    playSelectSound();
    const nextHints = [...hintsUsed, hintNum];
    setHintsUsed(nextHints);
    if (mode === 'daily') {
      persistDailyProgress(targetEntry.player.ign, guesses, nextHints);
    }
  };

  const targetPlayer = targetEntry?.player ?? null;
  const wonRound = isGameOver && Boolean(guesses[0]?.isCorrect);
  const wrongCount = guesses.filter(g => !g.isCorrect).length;
  const hint1Used = hintsUsed.includes(1);
  const hint2Used = hintsUsed.includes(2);
  const hint1Available = wrongCount >= HINT_1_THRESHOLD;
  const hint2Available = wrongCount >= HINT_2_THRESHOLD;

  const guessedIgns = useMemo(
    () => new Set(guesses.map(g => g.player.ign.toLowerCase())),
    [guesses]
  );

  // Live consolidated intel derived from guesses + unlocked hints
  const intel = useMemo(() => {
    let country: { code: string; name: string } | null = null;
    let region: string | null = null;
    let team: string | null = null;
    let hasSharedTeamHint = false;
    let role: Player['primaryRole'] | null = null;
    let agent: string | null = null;
    let status: TriviaPlayerStatus | null = null;

    let ageExact: number | null = null;
    let ageMin: number | null = null;
    let ageMax: number | null = null;

    let debutExact: number | null = null;
    let debutMin: number | null = null;
    let debutMax: number | null = null;

    let trophiesExact: number | null = null;
    let trophiesMin: number | null = null;
    let trophiesMax: number | null = null;

    for (const g of guesses) {
      if (g.matches.country === 'correct') {
        country = { code: g.player.countryCode, name: g.player.country };
      }
      if (g.matches.region === 'correct') {
        region = getRegionForTeam(g.player.team);
      }
      if (g.matches.team === 'correct') {
        team = g.player.team;
      } else if (g.matches.team === 'partial') {
        hasSharedTeamHint = true;
      }
      if (g.matches.role === 'correct') {
        role = g.player.primaryRole;
      }
      if (g.matches.agent === 'correct') {
        agent = g.player.signatureAgent;
      }
      if (g.matches.status === 'correct') {
        status = g.status;
      }

      if (g.matches.age === 'correct') {
        ageExact = g.age;
      } else if (g.matches.age === 'higher') {
        ageMin = ageMin === null ? g.age + 1 : Math.max(ageMin, g.age + 1);
        if (g.matches.ageClose) {
          ageMax = ageMax === null ? g.age + 2 : Math.min(ageMax, g.age + 2);
        }
      } else if (g.matches.age === 'lower') {
        ageMax = ageMax === null ? g.age - 1 : Math.min(ageMax, g.age - 1);
        if (g.matches.ageClose) {
          ageMin = ageMin === null ? g.age - 2 : Math.max(ageMin, g.age - 2);
        }
      }

      if (g.matches.debut === 'correct') {
        debutExact = g.debutYear;
      } else if (g.matches.debut === 'higher') {
        debutMin = debutMin === null ? g.debutYear + 1 : Math.max(debutMin, g.debutYear + 1);
      } else if (g.matches.debut === 'lower') {
        debutMax = debutMax === null ? g.debutYear - 1 : Math.min(debutMax, g.debutYear - 1);
      }

      if (g.matches.trophies === 'correct') {
        trophiesExact = g.trophies;
      } else if (g.matches.trophies === 'higher') {
        trophiesMin = trophiesMin === null ? g.trophies + 1 : Math.max(trophiesMin, g.trophies + 1);
      } else if (g.matches.trophies === 'lower') {
        trophiesMax = trophiesMax === null ? g.trophies - 1 : Math.min(trophiesMax, g.trophies - 1);
      }
    }

    if (targetEntry) {
      if (hint1Used || isGameOver) agent = targetEntry.player.signatureAgent;
      if (hint2Used || isGameOver) team = targetEntry.player.team;
      if (isGameOver) {
        country = { code: targetEntry.player.countryCode, name: targetEntry.player.country };
        region = getRegionForTeam(targetEntry.player.team);
        role = targetEntry.player.primaryRole;
        status = targetEntry.status;
        ageExact = targetEntry.age;
        debutExact = targetEntry.debutYear;
        trophiesExact = targetEntry.trophies;
      }
    }

    return {
      country,
      region,
      team,
      hasSharedTeamHint,
      role,
      agent,
      status,
      ageLabel: formatNumericRange(ageExact, ageMin, ageMax, 'a'),
      ageConfirmed: ageExact !== null,
      debutLabel: formatNumericRange(debutExact, debutMin, debutMax),
      debutConfirmed: debutExact !== null,
      trophiesLabel: formatNumericRange(trophiesExact, trophiesMin, trophiesMax),
      trophiesConfirmed: trophiesExact !== null,
    };
  }, [guesses, hint1Used, hint2Used, isGameOver, targetEntry]);

  // Spoiler-free filter: matches ONLY by IGN or real name across all 220 unique athletes
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

  const revealedTeamColor =
    intel.team ? getTeamLogoData(intel.team)?.primaryColor || '#ff4655' : '#ff4655';
  const mysteryAgentPortrait = intel.agent ? AGENT_FULL_PORTRAITS[intel.agent] : null;
  const targetPhotoUrl = targetPlayer ? getPlayerPhotoUrl(targetPlayer.ign) : null;

  return (
    <div className="max-w-6xl mx-auto my-1 sm:my-3 space-y-3 sm:space-y-4">
      {/* Header Banner (strictly "Descubra o Player") */}
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-display font-bold uppercase text-white tracking-wide leading-none drop-shadow">
          Descubra o Player
        </h2>
      </div>

      {/* Mode Selector, VCT Round Attempt Pips & Pool Toggle */}
      <Card
        padding="none"
        className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 text-xs"
      >
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 font-mono-vct">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300">
              <span className="hidden sm:inline">Sequência: </span>
              <strong className="text-amber-400 font-bold">{streak}</strong>
            </span>
          </div>

          <span className="text-slate-600">|</span>

          {/* 8 Tactical Round-Style Attempt Pips */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono-vct text-slate-300 hidden sm:inline">Tentativas:</span>
            <div className="flex items-center gap-1" aria-label={`${guesses.length} de ${MAX_TRIVIA_ATTEMPTS} tentativas`}>
              {Array.from({ length: MAX_TRIVIA_ATTEMPTS }).map((_, idx) => {
                // Oldest guess is at the end of `guesses` (newest first), map chronologically left-to-right
                const chronologicalIdx = guesses.length - 1 - idx;
                const guessAtSlot = chronologicalIdx >= 0 ? guesses[chronologicalIdx] : null;
                let cls = 'bg-white/15 border-white/15';
                if (guessAtSlot) {
                  cls = guessAtSlot.isCorrect
                    ? 'bg-emerald-400 border-emerald-300'
                    : 'bg-[#ff4655] border-rose-400';
                }
                return (
                  <span
                    key={idx}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[1px] border transition-colors ${cls}`}
                  />
                );
              })}
            </div>
            <span className="font-mono-vct font-bold text-white ml-0.5">
              {guesses.length}/{MAX_TRIVIA_ATTEMPTS}
            </span>
          </div>

          {mode === 'daily' && (
            <span className="hidden md:inline-flex items-center gap-1 font-mono-vct text-[11px] text-[#38bdf8] pl-2 border-l border-white/10">
              <Calendar className="w-3.5 h-3.5" />
              {formatDateKeyPtBr(todayKey)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          {mode === 'practice' && (
            <div className="flex items-center gap-1 bg-[#06090f]/80 p-1 rounded-[3px] border border-white/10 font-mono-vct text-[11px]">
              <button
                type="button"
                onClick={() => {
                  playSelectSound();
                  setPracticePool('popular');
                }}
                className={`px-2 py-1 rounded-[2px] font-bold uppercase transition-colors cursor-pointer ${
                  practicePool === 'popular'
                    ? 'bg-[#e2b714]/20 text-[#fde047] border border-[#e2b714]/45'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Populares ({POPULAR_TRIVIA_PLAYERS.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  playSelectSound();
                  setPracticePool('all');
                }}
                className={`px-2 py-1 rounded-[2px] font-bold uppercase transition-colors cursor-pointer ${
                  practicePool === 'all'
                    ? 'bg-[#38bdf8]/20 text-[#7dd3fc] border border-[#38bdf8]/45'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({CANONICAL_TRIVIA_PLAYERS.length})
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 bg-[#06090f]/85 p-1 rounded-[3px] border border-white/10">
            <button
              type="button"
              onClick={() => {
                playSelectSound();
                setMode('daily');
              }}
              className={`px-2.5 py-1.5 rounded-[2px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'daily'
                  ? 'bg-[#ff4655] text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Diário</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playSelectSound();
                if (mode === 'practice') {
                  initRound('practice', practicePool);
                } else {
                  setMode('practice');
                }
              }}
              className={`px-2.5 py-1.5 rounded-[2px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'practice'
                  ? 'bg-[#38bdf8] text-[#070b12]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{mode === 'practice' ? 'Novo Pro' : 'Treino'}</span>
            </button>
          </div>
        </div>
      </Card>

      {/* =====================================================================
          LIVE MYSTERY BROADCAST CARD (FILLS UP AS YOU DISCOVER CLUES / HINTS)
         ===================================================================== */}
      {targetEntry && targetPlayer && (
        <Card
          padding="none"
          className={`relative overflow-hidden border ${
            wonRound
              ? 'border-emerald-500/60'
              : isGameOver
              ? 'border-rose-500/55'
              : intel.team
              ? 'border-white/20'
              : 'border-white/12'
          }`}
        >
          {/* Left 3px accent strip (lights up in team color when Team is revealed) */}
          <div
            className="absolute inset-y-0 left-0 w-[3px] z-20"
            style={{
              backgroundColor: wonRound
                ? '#10b981'
                : isGameOver
                ? '#f43f5e'
                : intel.team
                ? revealedTeamColor
                : '#ff4655',
            }}
            aria-hidden
          />

          <div className="relative flex flex-col sm:flex-row items-stretch">
            {/* Crisp Agent Artwork in Background (lights up when Agent is discovered or Hint 1 used) */}
            {mysteryAgentPortrait && (
              <img
                src={mysteryAgentPortrait}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                className="pointer-events-none select-none absolute right-[-4%] top-[-16%] h-[185%] w-auto max-w-none object-contain opacity-45"
              />
            )}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(95deg, rgba(6,10,17,0.94) 0%, rgba(6,10,17,0.82) 60%, rgba(6,10,17,0.45) 100%)',
              }}
              aria-hidden
            />

            {/* LEFT SQUARE PORTRAIT SLOT (? while secret, real photo on Game Over) */}
            <div
              className="relative z-10 w-full sm:w-[126px] h-[96px] sm:h-auto shrink-0 border-b sm:border-b-0 sm:border-r border-white/12 flex items-center justify-center overflow-hidden"
              style={{
                background: isGameOver
                  ? `radial-gradient(circle at 50% 25%, ${revealedTeamColor}45 0%, #070b12 88%)`
                  : 'radial-gradient(circle at 50% 35%, rgba(255,70,85,0.16) 0%, #070b12 85%)',
              }}
            >
              {isGameOver && targetPhotoUrl && !photoError ? (
                <img
                  src={targetPhotoUrl}
                  alt={targetPlayer.ign}
                  onError={() => setPhotoError(true)}
                  className="w-full h-full object-cover object-top select-none"
                />
              ) : isGameOver ? (
                <PlayerAvatar player={targetPlayer} size="xl" />
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 select-none">
                  <div className="w-12 h-12 rounded-[4px] bg-[#0b1019] border border-white/15 flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-[#ff4655]" />
                  </div>
                  <span className="font-mono-vct text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Secreto
                  </span>
                </div>
              )}
            </div>

            {/* RIGHT LIVE INTEL TRACKER & REVEAL CONTENT */}
            <div className="relative z-10 flex-1 min-w-0 p-3.5 sm:p-4 flex flex-col justify-between gap-3">
              {/* Top identity row */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isGameOver ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono-vct text-[10px] font-bold uppercase tracking-wider border ${
                          wonRound
                            ? 'bg-emerald-500/20 border-emerald-500/45 text-emerald-300'
                            : 'bg-rose-500/20 border-rose-500/45 text-rose-300'
                        }`}
                      >
                        {wonRound ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {wonRound
                          ? `Acertou em ${guesses.length}`
                          : 'Sem vidas restantes'}
                      </span>
                    ) : (
                      <span className="font-mono-vct text-[10px] font-bold uppercase tracking-widest text-slate-300">
                        {mode === 'daily' ? 'Atleta Secreto do Dia' : 'Atleta Secreto · Treino'}
                      </span>
                    )}

                    {isGameOver && (
                      <span className="font-mono-vct text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-[2px] bg-[#06090f]/80 border border-white/12 text-slate-300">
                        {hintsUsed.length === 0
                          ? 'Sem dicas'
                          : `${hintsUsed.length} ${hintsUsed.length === 1 ? 'dica usada' : 'dicas usadas'}`}
                      </span>
                    )}

                    {!isGameOver && hint2Used && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#e2b714]/15 border border-[#e2b714]/45 font-mono-vct text-[10px] font-bold uppercase text-[#fde047]">
                        <Sparkles className="w-3 h-3" />
                        Iniciais: {getNameInitials(targetPlayer.name)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <h3 className="font-display text-3xl sm:text-4xl leading-none uppercase tracking-wide text-white drop-shadow">
                      {isGameOver ? targetPlayer.ign : '???'}
                    </h3>
                    {isGameOver && (
                      <span className="text-xs font-mono-vct text-slate-300">
                        ({targetPlayer.name})
                      </span>
                    )}
                    {intel.country && (
                      <CountryFlag
                        code={intel.country.code}
                        country={intel.country.name}
                        size="sm"
                      />
                    )}
                    {intel.team && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#06090f]/85 border border-white/15 text-xs font-mono-vct text-white font-bold">
                        <TeamLogo teamName={intel.team} size="xs" />
                        <span>{intel.team}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* On Game Over: Next / Practice CTA right inside the banner */}
                {isGameOver && (
                  <PrimaryButton
                    size="sm"
                    onClick={() => {
                      playSelectSound();
                      if (mode === 'practice') {
                        initRound('practice', practicePool);
                      } else {
                        setMode('practice');
                      }
                    }}
                    className="shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{mode === 'daily' ? 'Jogar Treino Livre' : 'Próximo Player'}</span>
                  </PrimaryButton>
                )}
              </div>

              {/* Consolidated Live Intel Chips (auto-filled as guesses narrow down the target) */}
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 font-mono-vct text-[11px]">
                {/* País */}
                <div
                  className={`px-2 py-1.5 rounded-[3px] border ${
                    intel.country
                      ? 'bg-emerald-500/15 border-emerald-500/45 text-emerald-200'
                      : 'bg-[#06090f]/75 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="block text-[9px] uppercase opacity-75">País</span>
                  <span className="inline-flex items-center gap-1 font-bold text-white truncate max-w-full">
                    {intel.country ? (
                      <>
                        <CountryFlag code={intel.country.code} size="xs" />
                        <span className="truncate">{intel.country.code}</span>
                      </>
                    ) : (
                      '?'
                    )}
                  </span>
                </div>

                {/* Equipe */}
                <div
                  className={`px-2 py-1.5 rounded-[3px] border ${
                    intel.team
                      ? 'bg-emerald-500/15 border-emerald-500/45 text-emerald-200'
                      : intel.hasSharedTeamHint
                      ? 'bg-amber-500/15 border-amber-500/45 text-amber-200'
                      : 'bg-[#06090f]/75 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="block text-[9px] uppercase opacity-75">Equipe</span>
                  <span className="inline-flex items-center gap-1 font-bold text-white truncate max-w-full">
                    {intel.team ? (
                      <>
                        <TeamLogo teamName={intel.team} size="xs" />
                        <span className="truncate">{intel.team}</span>
                      </>
                    ) : intel.hasSharedTeamHint ? (
                      <span className="text-amber-300 truncate">Ex-time</span>
                    ) : (
                      '?'
                    )}
                  </span>
                </div>

                {/* Região */}
                <div
                  className={`px-2 py-1.5 rounded-[3px] border ${
                    intel.region
                      ? 'bg-emerald-500/15 border-emerald-500/45 text-emerald-200'
                      : 'bg-[#06090f]/75 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="block text-[9px] uppercase opacity-75">Região</span>
                  <span className="block font-bold text-white truncate">{intel.region || '?'}</span>
                </div>

                {/* Idade */}
                <div
                  className={`px-2 py-1.5 rounded-[3px] border ${
                    intel.ageConfirmed
                      ? 'bg-emerald-500/15 border-emerald-500/45 text-emerald-200'
                      : intel.ageLabel
                      ? 'bg-amber-500/15 border-amber-500/45 text-amber-200'
                      : 'bg-[#06090f]/75 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="block text-[9px] uppercase opacity-75">Idade</span>
                  <span className="block font-bold text-white truncate">
                    {intel.ageLabel || '?'}
                  </span>
                </div>

                {/* Estreia */}
                <div
                  className={`px-2 py-1.5 rounded-[3px] border ${
                    intel.debutConfirmed
                      ? 'bg-emerald-500/15 border-emerald-500/45 text-emerald-200'
                      : intel.debutLabel
                      ? 'bg-amber-500/15 border-amber-500/45 text-amber-200'
                      : 'bg-[#06090f]/75 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="block text-[9px] uppercase opacity-75">Estreia</span>
                  <span className="block font-bold text-white truncate">
                    {intel.debutLabel || '?'}
                  </span>
                </div>

                {/* Títulos */}
                <div
                  className={`px-2 py-1.5 rounded-[3px] border ${
                    intel.trophiesConfirmed
                      ? 'bg-emerald-500/15 border-emerald-500/45 text-emerald-200'
                      : intel.trophiesLabel
                      ? 'bg-amber-500/15 border-amber-500/45 text-amber-200'
                      : 'bg-[#06090f]/75 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="block text-[9px] uppercase opacity-75">Títulos</span>
                  <span className="inline-flex items-center gap-1 font-bold text-white truncate">
                    {intel.trophiesLabel ? (
                      <>
                        <Trophy className="w-3 h-3 text-[#e2b714] shrink-0" />
                        <span>{intel.trophiesLabel}</span>
                      </>
                    ) : (
                      '?'
                    )}
                  </span>
                </div>

                {/* Status */}
                <div
                  className={`px-2 py-1.5 rounded-[3px] border ${
                    intel.status
                      ? 'bg-emerald-500/15 border-emerald-500/45 text-emerald-200'
                      : 'bg-[#06090f]/75 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="block text-[9px] uppercase opacity-75">Status</span>
                  <span className="block font-bold text-white truncate">{intel.status || '?'}</span>
                </div>

                {/* Função */}
                <div
                  className={`px-2 py-1.5 rounded-[3px] border ${
                    intel.role
                      ? 'bg-emerald-500/15 border-emerald-500/45 text-emerald-200'
                      : 'bg-[#06090f]/75 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="block text-[9px] uppercase opacity-75">Função</span>
                  <span className="inline-flex items-center gap-1 font-bold text-white truncate max-w-full">
                    {intel.role ? (
                      <>
                        <RoleEmblem role={intel.role} size="xs" showBackground={false} />
                        <span className="truncate">{ROLE_NAMES_PT[intel.role]}</span>
                      </>
                    ) : (
                      '?'
                    )}
                  </span>
                </div>

                {/* Agente */}
                <div
                  className={`px-2 py-1.5 rounded-[3px] border ${
                    intel.agent
                      ? 'bg-emerald-500/15 border-emerald-500/45 text-emerald-200'
                      : 'bg-[#06090f]/75 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="block text-[9px] uppercase opacity-75">Agente</span>
                  <span className="inline-flex items-center gap-1 font-bold text-white truncate max-w-full">
                    {intel.agent ? (
                      <>
                        {AGENT_ICONS[intel.agent] && (
                          <img
                            src={AGENT_ICONS[intel.agent]}
                            alt={intel.agent}
                            className="w-3.5 h-3.5 rounded-[1px] object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <span className="truncate">{intel.agent}</span>
                      </>
                    ) : (
                      '?'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* =====================================================================
          SEARCH INPUT + 2 PROGRESSIVE HINT BUTTONS (4 ERRORS & 6 ERRORS)
         ===================================================================== */}
      {!isGameOver && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2.5 items-start">
          {/* Search Input */}
          <div className="relative z-30">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                id="trivia-search-input"
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Digite o nick ou nome real do jogador (ex: aspas, Derke, TenZ)..."
                className="w-full pl-10 pr-9 py-3 bg-[#070b12]/90 border border-white/18 rounded-[4px] text-white placeholder-slate-400 focus:outline-none focus:border-[#ff4655] transition-colors text-sm font-medium"
                autoComplete="off"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {filteredPlayers.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#070b12]/98 border border-white/18 rounded-[4px] shadow-2xl overflow-hidden divide-y divide-white/[0.07]">
                {filteredPlayers.map(entry => {
                  const p = entry.player;
                  return (
                    <button
                      key={p.ign}
                      type="button"
                      onClick={() => handleMakeGuess(entry)}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-[#141c2b] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <PlayerAvatar player={p} size="sm" />
                        <div className="min-w-0">
                          <span className="font-display text-xl leading-none uppercase tracking-wide text-white group-hover:text-[#ff4655] block truncate">
                            {p.ign}
                          </span>
                          <span className="text-[11px] font-mono-vct text-slate-400 block truncate">
                            {p.name}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono-vct uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-white/[0.05] text-slate-300 group-hover:bg-[#ff4655] group-hover:text-white transition-colors shrink-0">
                        Chutar
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2 Progressive Hint Buttons */}
          <div className="grid grid-cols-2 md:flex items-center gap-2">
            {/* Hint 1: Unlocks at 4 wrong guesses -> Reveals Signature Agent */}
            <button
              id="trivia-hint-1-btn"
              type="button"
              disabled={!hint1Available || hint1Used}
              onClick={() => handleUnlockHint(1)}
              className={`px-3 py-2.5 rounded-[4px] border font-mono-vct text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                hint1Used
                  ? 'bg-emerald-500/15 border-emerald-500/45 text-emerald-300 cursor-default'
                  : hint1Available
                  ? 'bg-[#e2b714]/15 border-[#e2b714]/65 text-[#fde047] hover:bg-[#e2b714]/25 cursor-pointer'
                  : 'bg-[#070b12]/75 border-white/10 text-slate-400 cursor-not-allowed'
              }`}
              title={
                hint1Used
                  ? 'Agente assinatura revelado no card acima'
                  : hint1Available
                  ? 'Revelar o agente assinatura do atleta'
                  : `Desbloqueia após ${HINT_1_THRESHOLD} erros (${wrongCount}/${HINT_1_THRESHOLD})`
              }
            >
              {hint1Used ? (
                <Check className="w-3.5 h-3.5 shrink-0" />
              ) : hint1Available ? (
                <Lightbulb className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>
                {hint1Used
                  ? 'Dica 1 · Agente'
                  : hint1Available
                  ? 'Dica 1 · Agente'
                  : `Dica 1 (${wrongCount}/${HINT_1_THRESHOLD})`}
              </span>
            </button>

            {/* Hint 2: Unlocks at 6 wrong guesses -> Reveals Team + Name Initials */}
            <button
              id="trivia-hint-2-btn"
              type="button"
              disabled={!hint2Available || hint2Used}
              onClick={() => handleUnlockHint(2)}
              className={`px-3 py-2.5 rounded-[4px] border font-mono-vct text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                hint2Used
                  ? 'bg-emerald-500/15 border-emerald-500/45 text-emerald-300 cursor-default'
                  : hint2Available
                  ? 'bg-[#e2b714]/15 border-[#e2b714]/65 text-[#fde047] hover:bg-[#e2b714]/25 cursor-pointer'
                  : 'bg-[#070b12]/75 border-white/10 text-slate-400 cursor-not-allowed'
              }`}
              title={
                hint2Used
                  ? 'Time e iniciais revelados no card acima'
                  : hint2Available
                  ? 'Revelar o clube e as iniciais do nome real'
                  : `Desbloqueia após ${HINT_2_THRESHOLD} erros (${wrongCount}/${HINT_2_THRESHOLD})`
              }
            >
              {hint2Used ? (
                <Check className="w-3.5 h-3.5 shrink-0" />
              ) : hint2Available ? (
                <Lightbulb className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>
                {hint2Used
                  ? 'Dica 2 · Clube'
                  : hint2Available
                  ? 'Dica 2 · Clube'
                  : `Dica 2 (${wrongCount}/${HINT_2_THRESHOLD})`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          GUESS HISTORY — DESKTOP BROADCAST TABLE (md+) + NATIVE MOBILE CARDS (< md)
         ===================================================================== */}
      {guesses.length > 0 && (
        <>
          {/* DESKTOP TABLE (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-[880px] bg-[#070b12]/88 border border-white/12 rounded-[4px] p-3.5">
              {/* Table Header */}
              <div className="grid grid-cols-10 gap-1.5 text-center text-[11px] font-mono-vct text-slate-400 font-bold uppercase tracking-wider pb-2.5 border-b border-white/[0.08]">
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
                  const agentIcon = AGENT_ICONS[guess.player.signatureAgent];

                  return (
                    <div
                      key={`${guess.player.ign}-${idx}`}
                      className="grid grid-cols-10 gap-1.5 text-center text-xs font-mono-vct font-semibold animate-fadeIn"
                    >
                      {/* Player */}
                      <div
                        className={`p-2 rounded-[3px] flex items-center justify-start gap-1.5 border ${
                          guess.isCorrect
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200'
                            : 'bg-[#0b1019] border-white/12 text-white'
                        }`}
                      >
                        <PlayerAvatar player={guess.player} size="xs" />
                        <span className="font-display text-lg leading-none uppercase tracking-wide truncate">
                          {guess.player.ign}
                        </span>
                      </div>

                      {/* Country (Real SVG Flag) */}
                      <div
                        title={guess.player.country}
                        className={`p-2 rounded-[3px] flex items-center justify-center gap-1.5 border ${
                          guess.matches.country === 'correct'
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200'
                            : 'bg-rose-950/45 border-rose-500/35 text-rose-200'
                        }`}
                      >
                        {guess.player.countryCode && (
                          <CountryFlag
                            code={guess.player.countryCode}
                            country={guess.player.country}
                            size="xs"
                          />
                        )}
                        <span className="truncate">{guess.player.countryCode || guess.player.country}</span>
                      </div>

                      {/* Team (Green exact / Amber shared history / Red wrong) */}
                      <div
                        title={
                          guess.matches.team === 'partial'
                            ? 'Jogou em um time em comum no histórico'
                            : guess.player.team
                        }
                        className={`p-2 rounded-[3px] flex items-center justify-center gap-1 border ${
                          guess.matches.team === 'correct'
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200'
                            : guess.matches.team === 'partial'
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                            : 'bg-rose-950/45 border-rose-500/35 text-rose-200'
                        }`}
                      >
                        <TeamLogo teamName={guess.player.team} size="xs" />
                        <span className="truncate">{guess.player.team}</span>
                      </div>

                      {/* Region */}
                      <div
                        className={`p-2 rounded-[3px] flex items-center justify-center border ${
                          guess.matches.region === 'correct'
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200'
                            : 'bg-rose-950/45 border-rose-500/35 text-rose-200'
                        }`}
                      >
                        <span>{guessReg}</span>
                      </div>

                      {/* Age */}
                      <div
                        className={`p-2 rounded-[3px] flex items-center justify-center gap-1 border ${
                          guess.matches.age === 'correct'
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200'
                            : guess.matches.ageClose
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                            : 'bg-rose-950/45 border-rose-500/35 text-rose-200'
                        }`}
                      >
                        <span>{guess.age}</span>
                        {guess.matches.age === 'higher' && (
                          <ArrowUp className={`w-3.5 h-3.5 ${guess.matches.ageClose ? 'text-amber-300' : 'text-rose-300'}`} />
                        )}
                        {guess.matches.age === 'lower' && (
                          <ArrowDown className={`w-3.5 h-3.5 ${guess.matches.ageClose ? 'text-amber-300' : 'text-rose-300'}`} />
                        )}
                      </div>

                      {/* Tier 1 Debut Year */}
                      <div
                        className={`p-2 rounded-[3px] flex items-center justify-center gap-1 border ${
                          guess.matches.debut === 'correct'
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200'
                            : 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                        }`}
                      >
                        <span>{guess.debutYear}</span>
                        {guess.matches.debut === 'higher' && <ArrowUp className="w-3.5 h-3.5 text-amber-300" />}
                        {guess.matches.debut === 'lower' && <ArrowDown className="w-3.5 h-3.5 text-amber-300" />}
                      </div>

                      {/* International Trophies */}
                      <div
                        className={`p-2 rounded-[3px] flex items-center justify-center gap-1 border ${
                          guess.matches.trophies === 'correct'
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200'
                            : 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                        }`}
                      >
                        <span>{guess.trophies}</span>
                        {guess.matches.trophies === 'higher' && <ArrowUp className="w-3.5 h-3.5 text-amber-300" />}
                        {guess.matches.trophies === 'lower' && <ArrowDown className="w-3.5 h-3.5 text-amber-300" />}
                      </div>

                      {/* Status */}
                      <div
                        className={`p-2 rounded-[3px] flex items-center justify-center border ${
                          guess.matches.status === 'correct'
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200'
                            : guess.matches.status === 'partial'
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                            : 'bg-rose-950/45 border-rose-500/35 text-rose-200'
                        }`}
                      >
                        <span className="truncate">{guess.status}</span>
                      </div>

                      {/* Role */}
                      <div
                        className={`p-2 rounded-[3px] flex items-center justify-center gap-1 border ${
                          guess.matches.role === 'correct'
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200'
                            : 'bg-rose-950/45 border-rose-500/35 text-rose-200'
                        }`}
                      >
                        <RoleEmblem role={guess.player.primaryRole} size="xs" showBackground={false} />
                        <span className="truncate">
                          {ROLE_NAMES_PT[guess.player.primaryRole] || guess.player.primaryRole}
                        </span>
                      </div>

                      {/* Agent (Real Official Icon) */}
                      <div
                        className={`p-2 rounded-[3px] flex items-center justify-center gap-1 border ${
                          guess.matches.agent === 'correct'
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200'
                            : 'bg-rose-950/45 border-rose-500/35 text-rose-200'
                        }`}
                      >
                        {agentIcon && (
                          <img
                            src={agentIcon}
                            alt={guess.player.signatureAgent}
                            className="w-4 h-4 rounded-[2px] object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <span className="truncate">{guess.player.signatureAgent}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MOBILE NATIVE 2-TIER CARDS (< md, ZERO HORIZONTAL SCROLL) */}
          <div className="md:hidden space-y-2.5">
            {guesses.map((guess, idx) => {
              const guessReg = getRegionForTeam(guess.player.team);
              const agentIcon = AGENT_ICONS[guess.player.signatureAgent];
              const roleColor = ROLE_COLORS[guess.player.primaryRole] || '#ff4655';

              return (
                <div
                  key={`mob-${guess.player.ign}-${idx}`}
                  className={`rounded-[4px] border bg-[#070b12]/90 overflow-hidden animate-fadeIn ${
                    guess.isCorrect ? 'border-emerald-500/65' : 'border-white/12'
                  }`}
                >
                  {/* Tier 1: Player + Country + Team + Region */}
                  <div className="px-3 py-2 bg-[#0b1019]/90 border-b border-white/[0.07] flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <PlayerAvatar player={guess.player} size="sm" />
                      <span className="font-display text-xl leading-none uppercase tracking-wide text-white truncate">
                        {guess.player.ign}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono-vct text-[11px] font-bold flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] border ${
                          guess.matches.country === 'correct'
                            ? 'bg-emerald-500/20 border-emerald-500/55 text-emerald-200'
                            : 'bg-rose-950/45 border-rose-500/35 text-rose-200'
                        }`}
                      >
                        {guess.player.countryCode && <CountryFlag code={guess.player.countryCode} size="xs" />}
                        {guess.player.countryCode}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] border ${
                          guess.matches.team === 'correct'
                            ? 'bg-emerald-500/20 border-emerald-500/55 text-emerald-200'
                            : guess.matches.team === 'partial'
                            ? 'bg-amber-500/20 border-amber-500/55 text-amber-200'
                            : 'bg-rose-950/45 border-rose-500/35 text-rose-200'
                        }`}
                      >
                        <TeamLogo teamName={guess.player.team} size="xs" />
                        {guess.player.team}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-[2px] border ${
                          guess.matches.region === 'correct'
                            ? 'bg-emerald-500/20 border-emerald-500/55 text-emerald-200'
                            : 'bg-rose-950/45 border-rose-500/35 text-rose-200'
                        }`}
                      >
                        {guessReg}
                      </span>
                    </div>
                  </div>

                  {/* Tier 2: 3x2 Stat Chips */}
                  <div className="p-2 grid grid-cols-3 gap-1.5 text-center font-mono-vct text-[11px] font-bold">
                    <div
                      className={`px-1.5 py-1.5 rounded-[3px] border ${
                        guess.matches.age === 'correct'
                          ? 'bg-emerald-500/20 border-emerald-500/55 text-emerald-200'
                          : guess.matches.ageClose
                          ? 'bg-amber-500/20 border-amber-500/55 text-amber-200'
                          : 'bg-rose-950/45 border-rose-500/35 text-rose-200'
                      }`}
                    >
                      <span className="block text-[9px] uppercase opacity-75">Idade</span>
                      <span className="inline-flex items-center gap-0.5">
                        {guess.age}
                        {guess.matches.age === 'higher' && <ArrowUp className="w-3 h-3" />}
                        {guess.matches.age === 'lower' && <ArrowDown className="w-3 h-3" />}
                      </span>
                    </div>

                    <div
                      className={`px-1.5 py-1.5 rounded-[3px] border ${
                        guess.matches.debut === 'correct'
                          ? 'bg-emerald-500/20 border-emerald-500/55 text-emerald-200'
                          : 'bg-amber-500/20 border-amber-500/55 text-amber-200'
                      }`}
                    >
                      <span className="block text-[9px] uppercase opacity-75">Estreia</span>
                      <span className="inline-flex items-center gap-0.5">
                        {guess.debutYear}
                        {guess.matches.debut === 'higher' && <ArrowUp className="w-3 h-3" />}
                        {guess.matches.debut === 'lower' && <ArrowDown className="w-3 h-3" />}
                      </span>
                    </div>

                    <div
                      className={`px-1.5 py-1.5 rounded-[3px] border ${
                        guess.matches.trophies === 'correct'
                          ? 'bg-emerald-500/20 border-emerald-500/55 text-emerald-200'
                          : 'bg-amber-500/20 border-amber-500/55 text-amber-200'
                      }`}
                    >
                      <span className="block text-[9px] uppercase opacity-75">Títulos</span>
                      <span className="inline-flex items-center gap-0.5">
                        {guess.trophies}
                        {guess.matches.trophies === 'higher' && <ArrowUp className="w-3 h-3" />}
                        {guess.matches.trophies === 'lower' && <ArrowDown className="w-3 h-3" />}
                      </span>
                    </div>

                    <div
                      className={`px-1.5 py-1.5 rounded-[3px] border ${
                        guess.matches.status === 'correct'
                          ? 'bg-emerald-500/20 border-emerald-500/55 text-emerald-200'
                          : guess.matches.status === 'partial'
                          ? 'bg-amber-500/20 border-amber-500/55 text-amber-200'
                          : 'bg-rose-950/45 border-rose-500/35 text-rose-200'
                      }`}
                    >
                      <span className="block text-[9px] uppercase opacity-75">Status</span>
                      <span className="block truncate">{guess.status}</span>
                    </div>

                    <div
                      className={`px-1.5 py-1.5 rounded-[3px] border ${
                        guess.matches.role === 'correct'
                          ? 'bg-emerald-500/20 border-emerald-500/55 text-emerald-200'
                          : 'bg-rose-950/45 border-rose-500/35 text-rose-200'
                      }`}
                    >
                      <span className="block text-[9px] uppercase opacity-75" style={{ color: roleColor }}>
                        Função
                      </span>
                      <span className="block truncate">
                        {ROLE_NAMES_PT[guess.player.primaryRole] || guess.player.primaryRole}
                      </span>
                    </div>

                    <div
                      className={`px-1.5 py-1.5 rounded-[3px] border ${
                        guess.matches.agent === 'correct'
                          ? 'bg-emerald-500/20 border-emerald-500/55 text-emerald-200'
                          : 'bg-rose-950/45 border-rose-500/35 text-rose-200'
                      }`}
                    >
                      <span className="block text-[9px] uppercase opacity-75">Agente</span>
                      <span className="inline-flex items-center justify-center gap-1 truncate max-w-full">
                        {agentIcon && (
                          <img
                            src={agentIcon}
                            alt={guess.player.signatureAgent}
                            className="w-3.5 h-3.5 rounded-[1px] shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <span className="truncate">{guess.player.signatureAgent}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Compact 1-Line Color Legend (replaces old 10-box tutorial wall) */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 px-3 py-2 rounded-[4px] bg-[#070b12]/75 border border-white/[0.08] text-[11px] font-mono-vct text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[1px] bg-emerald-500/50 border border-emerald-400" />
          Verde = Exato
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[1px] bg-amber-500/50 border border-amber-400" />
          Âmbar = Ex-time em comum / Perto (±2a) / ↑↓
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[1px] bg-rose-500/50 border border-rose-400" />
          Vermelho = Diferente
        </span>
      </div>
    </div>
  );
};
