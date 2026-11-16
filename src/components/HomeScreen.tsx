import React from 'react';
import { motion } from 'motion/react';
import {
  Gamepad2,
  Grid3X3,
  Search,
  Trophy,
  Sparkles,
  Flame,
  ArrowRight,
  Users,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { Difficulty } from '../types';
import { Card, Badge, PrimaryButton, SecondaryButton } from './ui';
import { TeamLogo } from './TeamLogo';
import { playSelectSound, playHoverSound } from '../utils/audio';

type ModeTab = 'draft' | 'grid' | 'trivia' | 'history';

interface HomeScreenProps {
  difficulty: Difficulty;
  onDifficultyChange: (diff: Difficulty) => void;
  onSelectMode: (tab: ModeTab) => void;
  onOpenHelp: () => void;
  trophiesCount: number;
  totalCampaigns: number;
}

const FEATURED_CRESTS = [
  { name: 'LOUD', year: '22/26' },
  { name: 'Fnatic', year: '23' },
  { name: 'Evil Geniuses', year: '23' },
  { name: 'EDward Gaming', year: '24' },
  { name: 'NRG', year: '25' },
  { name: 'Team Vitality', year: '26' },
];

const DIFFICULTY_OPTIONS: { id: Difficulty; label: string; hint: string; color: string }[] = [
  { id: 'normal', label: 'Normal', hint: '3 Rerolls · 0 Vetos', color: '#10b981' },
  { id: 'hard', label: 'Difícil', hint: '2 Rerolls · 3 Vetos', color: '#e2b714' },
  { id: 'master', label: 'Master', hint: '1 Reroll · 6 Vetos', color: '#ff4655' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  difficulty,
  onDifficultyChange,
  onSelectMode,
  onOpenHelp,
  trophiesCount,
  totalCampaigns,
}) => {
  const activeDiff = DIFFICULTY_OPTIONS.find(d => d.id === difficulty) || DIFFICULTY_OPTIONS[0];

  return (
    <div className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto py-2 sm:py-4 gap-4 sm:gap-5">
      {/* Friendly Welcome Strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-wrap items-center justify-between gap-3 px-1"
      >
        <div>
          <span className="font-mono-vct text-xs font-bold uppercase tracking-widest text-[#e2b714] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            BEM-VINDO AO VALORANT CHAMPIONS MAYHEM
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-white uppercase tracking-wide mt-0.5 leading-none">
            Escolha seu modo de jogo
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {totalCampaigns > 0 && (
            <Badge tone="gold">
              <Trophy className="w-3.5 h-3.5" />
              {trophiesCount} {trophiesCount === 1 ? 'Título' : 'Títulos'} · {totalCampaigns}{' '}
              {totalCampaigns === 1 ? 'Campanha' : 'Campanhas'}
            </Badge>
          )}
          <SecondaryButton
            id="home-help-btn"
            size="sm"
            onClick={() => {
              playSelectSound();
              onOpenHelp();
            }}
          >
            <HelpCircle className="w-4 h-4 text-[#38bdf8]" />
            <span>Como Jogar</span>
          </SecondaryButton>
        </div>
      </motion.div>

      {/* HERO SPOTLIGHT: MODO PRINCIPAL MAYHEM */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card
          padding="lg"
          className="relative overflow-hidden border-[#ff4655]/40 shadow-[0_24px_60px_-14px_rgba(255,70,85,0.28)]"
        >
          {/* Hero Ambient Tint */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 88% 22%, rgba(255, 70, 85, 0.22) 0%, transparent 48%), radial-gradient(circle at 12% 88%, rgba(226, 183, 20, 0.14) 0%, transparent 45%)',
            }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Info & Main Action */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Badge tone="red">
                  <Flame className="w-3.5 h-3.5" />
                  Modo Principal · Destaque
                </Badge>
                <Badge tone="gold">Champions 2022–2026</Badge>
              </div>

              <div>
                <h1 className="font-display text-5xl sm:text-6xl leading-[0.92] text-white uppercase tracking-wide">
                  CHAMPIONS <span className="text-[#ff4655]">MAYHEM</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-200 mt-2.5 max-w-xl leading-relaxed">
                  Monte seu elenco dos sonhos em <strong className="text-white">5 rodadas de draft</strong> com
                  craques reais do VCT, ative química entre companheiros e dispute os playoffs rumo ao
                  troféu mundial!
                </p>
              </div>

              {/* Quick Feature Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono-vct text-slate-200">
                <span className="glass-film px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#38bdf8]" />
                  5 Funções Táticas
                </span>
                <span className="glass-film px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#e2b714]" />
                  Traits &amp; Sinergia Real
                </span>
                <span className="glass-film px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#10b981]" />
                  Overall Oculto na Run
                </span>
              </div>

              {/* Difficulty Selector + Primary Play Button */}
              <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3">
                <PrimaryButton
                  id="home-play-mayhem-btn"
                  size="lg"
                  onMouseEnter={() => playHoverSound()}
                  onClick={() => {
                    playSelectSound();
                    onSelectMode('draft');
                  }}
                  className="animate-glow-red text-base px-8 py-3.5"
                >
                  <Gamepad2 className="w-5 h-5" />
                  <span>JOGAR MAYHEM</span>
                  <ArrowRight className="w-4 h-4" />
                </PrimaryButton>

                {/* Inline Friendly Difficulty Selector */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-black/35 border border-white/10 w-fit">
                    {DIFFICULTY_OPTIONS.map(opt => {
                      const active = opt.id === difficulty;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            playSelectSound();
                            onDifficultyChange(opt.id);
                          }}
                          className={`px-3 py-1 rounded-lg font-mono-vct text-xs font-bold transition-all cursor-pointer ${
                            active
                              ? 'text-[#0b0e14] shadow-md'
                              : 'text-slate-300 hover:text-white'
                          }`}
                          style={active ? { backgroundColor: opt.color } : undefined}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-mono-vct text-slate-300 pl-1">
                    {activeDiff.hint}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Visual Showcase: Team Crests & Trophy Aura */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="w-full glass-film rounded-2xl p-4 sm:p-5 border border-white/15 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-slate-200">
                    Elencos Lendários no Draft
                  </span>
                  <span className="font-mono-vct text-xs font-bold text-[#e2b714]">
                    +40 Equipes VCT
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {FEATURED_CRESTS.map(team => (
                    <div
                      key={team.name}
                      className="rounded-xl bg-black/40 border border-white/10 p-2.5 flex flex-col items-center justify-center text-center gap-1.5 hover:border-white/25 transition-colors"
                    >
                      <TeamLogo teamName={team.name} size="md" showGlow />
                      <span className="text-xs font-bold text-white truncate max-w-full">
                        {team.name === 'Evil Geniuses'
                          ? 'EG'
                          : team.name === 'EDward Gaming'
                          ? 'EDG'
                          : team.name === 'Team Vitality'
                          ? 'Vitality'
                          : team.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-white/10">
                  <span>Grupos · Quartas · Semis · Final</span>
                  <span className="font-mono-vct text-[#ff4655] font-bold">Bo3 &amp; Bo5</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* SECONDARY MODES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: GRID VCT */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card
            variant="interactive"
            padding="md"
            onMouseEnter={() => playHoverSound()}
            onClick={() => {
              playSelectSound();
              onSelectMode('grid');
            }}
            className="h-full flex flex-col justify-between gap-4 cursor-pointer hover:border-[#e2b714]/50"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#e2b714]/15 border border-[#e2b714]/35 flex items-center justify-center text-[#e2b714]">
                  <Grid3X3 className="w-5 h-5" />
                </div>
                <Badge tone="gold">5 Desafios</Badge>
              </div>
              <h3 className="font-display text-3xl leading-none text-white uppercase tracking-wide">
                GRID VCT
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Teste seu conhecimento das janelas de transferência, conquistas e nacionalidades no tabuleiro 3×3.
              </p>
            </div>

            <SecondaryButton
              id="home-play-grid-btn"
              size="sm"
              className="w-full justify-between"
            >
              <span>Jogar Grid VCT</span>
              <ArrowRight className="w-4 h-4 text-[#e2b714]" />
            </SecondaryButton>
          </Card>
        </motion.div>

        {/* Card 2: TRIVIA VCT */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card
            variant="interactive"
            padding="md"
            onMouseEnter={() => playHoverSound()}
            onClick={() => {
              playSelectSound();
              onSelectMode('trivia');
            }}
            className="h-full flex flex-col justify-between gap-4 cursor-pointer hover:border-[#38bdf8]/50"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/15 border border-[#38bdf8]/35 flex items-center justify-center text-[#38bdf8]">
                  <Search className="w-5 h-5" />
                </div>
                <Badge tone="cyan">Adivinhação</Badge>
              </div>
              <h3 className="font-display text-3xl leading-none text-white uppercase tracking-wide">
                TRIVIA DOS PROS
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Descubra o jogador misterioso usando pistas de região, organização, função e agente favorito.
              </p>
            </div>

            <SecondaryButton
              id="home-play-trivia-btn"
              size="sm"
              className="w-full justify-between"
            >
              <span>Jogar Trivia</span>
              <ArrowRight className="w-4 h-4 text-[#38bdf8]" />
            </SecondaryButton>
          </Card>
        </motion.div>

        {/* Card 3: SALA DE TROFÉUS */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card
            variant="interactive"
            padding="md"
            onMouseEnter={() => playHoverSound()}
            onClick={() => {
              playSelectSound();
              onSelectMode('history');
            }}
            className="h-full flex flex-col justify-between gap-4 cursor-pointer hover:border-[#10b981]/50"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#10b981]/15 border border-[#10b981]/35 flex items-center justify-center text-[#10b981]">
                  <Trophy className="w-5 h-5" />
                </div>
                <Badge tone="green">
                  {trophiesCount} {trophiesCount === 1 ? 'Troféu' : 'Troféus'}
                </Badge>
              </div>
              <h3 className="font-display text-3xl leading-none text-white uppercase tracking-wide">
                SALA DE TROFÉUS
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Confira seu histórico de campanhas no Mayhem, MVPs consagrados e conquistas desbloqueadas.
              </p>
            </div>

            <SecondaryButton
              id="home-open-history-btn"
              size="sm"
              className="w-full justify-between"
            >
              <span>Ver Troféus</span>
              <ArrowRight className="w-4 h-4 text-[#10b981]" />
            </SecondaryButton>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
