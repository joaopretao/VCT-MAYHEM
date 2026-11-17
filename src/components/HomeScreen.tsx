import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Trophy, HelpCircle } from 'lucide-react';
import { Difficulty } from '../types';
import { Card, PrimaryButton, SecondaryButton } from './ui';
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
  hasActiveRun?: boolean;
  activeRunLabel?: string | null;
}

const FEATURED_CRESTS = [
  { name: 'LOUD', label: 'LOUD' },
  { name: 'Fnatic', label: 'Fnatic' },
  { name: 'Evil Geniuses', label: 'EG' },
  { name: 'EDward Gaming', label: 'EDG' },
  { name: 'NRG', label: 'NRG' },
  { name: 'Team Vitality', label: 'Vitality' },
];

const DIFFICULTY_OPTIONS: { id: Difficulty; label: string; hint: string; color: string; text: string }[] = [
  { id: 'normal', label: 'Normal', hint: '3 rerolls · Sem vetos', color: '#10b981', text: '#0b0e14' },
  { id: 'hard', label: 'Difícil', hint: '2 rerolls · 3 vetos', color: '#e2b714', text: '#0b0e14' },
  { id: 'master', label: 'Master', hint: '1 reroll · 6 vetos', color: '#ff4655', text: '#ffffff' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  difficulty,
  onDifficultyChange,
  onSelectMode,
  onOpenHelp,
  trophiesCount,
  totalCampaigns,
  hasActiveRun = false,
  activeRunLabel = null,
}) => {
  const activeDiff = DIFFICULTY_OPTIONS.find(d => d.id === difficulty) || DIFFICULTY_OPTIONS[0];

  return (
    <div className="flex-1 flex flex-col justify-start md:justify-center max-w-6xl w-full mx-auto py-1 md:py-5 gap-3 md:gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center md:items-end justify-between gap-2 md:gap-3 px-0.5">
        <div className="flex items-center gap-2.5 md:gap-3">
          <span className="vct-slash h-6 md:h-7" aria-hidden />
          <div>
            <span className="font-mono-vct text-xs font-bold uppercase tracking-widest text-slate-300 hidden md:block">
              VCT 2022–2026
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-white uppercase tracking-wide leading-none">
              Escolha o modo
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalCampaigns > 0 && (
            <div className="surface-sub px-2.5 py-1 md:px-3 md:py-1.5 flex items-center gap-1.5 text-xs font-mono-vct text-slate-200">
              <Trophy className="w-3.5 h-3.5 text-[#e2b714]" />
              <span className="md:hidden">
                {trophiesCount}/{totalCampaigns}
              </span>
              <span className="hidden md:inline">
                {trophiesCount} {trophiesCount === 1 ? 'título' : 'títulos'} em {totalCampaigns}{' '}
                {totalCampaigns === 1 ? 'campanha' : 'campanhas'}
              </span>
            </div>
          )}
          <SecondaryButton
            id="home-help-btn"
            size="sm"
            onClick={() => {
              playSelectSound();
              onOpenHelp();
            }}
          >
            <HelpCircle className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline">Como jogar</span>
          </SecondaryButton>
        </div>
      </div>

      {/* HERO SPOTLIGHT: MAYHEM */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <Card
          padding="none"
          cutCorner
          className="p-3.5 md:p-6 relative overflow-hidden border-[#ff4655]/35"
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-[#ff4655]" aria-hidden />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-center pl-1.5 md:pl-1">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-3 md:space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono-vct text-xs font-bold uppercase tracking-widest text-[#ff4655]">
                    Modo Principal
                  </span>
                  {hasActiveRun && activeRunLabel && (
                    <span className="font-mono-vct text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                      Run salva · {activeRunLabel}
                    </span>
                  )}
                </div>
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[0.92] text-white uppercase tracking-wide">
                  CHAMPIONS MAYHEM
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl leading-relaxed">
                  Cinco picks, três times por rodada. Monta tua line com jogadores reais do VCT (2022–2026) e busca o título mundial.
                </p>
              </div>

              <div className="hidden sm:flex flex-wrap items-center gap-3 text-xs font-mono-vct text-slate-300">
                <span>5 funções</span>
                <span className="text-slate-600">/</span>
                <span>Overall oculto na run</span>
                <span className="text-slate-600">/</span>
                <span>Grupos, playoffs e final MD5</span>
              </div>

              {/* Difficulty & Primary CTA */}
              <div className="pt-0.5 flex flex-col sm:flex-row sm:items-center gap-2.5 md:gap-3">
                <PrimaryButton
                  id="home-play-mayhem-btn"
                  size="lg"
                  onMouseEnter={() => playHoverSound()}
                  onClick={() => {
                    playSelectSound();
                    onSelectMode('draft');
                  }}
                  className="w-full sm:w-auto text-sm md:text-base px-6 py-2.5 md:px-8 md:py-3.5"
                >
                  <span>{hasActiveRun ? 'CONTINUAR RUN' : 'JOGAR MAYHEM'}</span>
                  <ArrowRight className="w-4 h-4" />
                </PrimaryButton>

                <div className="flex flex-row sm:flex-col items-center sm:items-start justify-between gap-2 sm:gap-1">
                  <div className="flex items-center gap-1 p-1 rounded-[3px] bg-[#0b0e14] border border-white/10 w-fit">
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
                          className={`px-2.5 md:px-3 py-1 rounded-[2px] font-mono-vct text-xs font-bold transition-colors cursor-pointer ${
                            active ? '' : 'text-slate-300 hover:text-white'
                          }`}
                          style={active ? { backgroundColor: opt.color, color: opt.text } : undefined}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-mono-vct text-slate-300">
                    {activeDiff.hint}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Champion Crests Showcase (Desktop / Tablet large only so mobile never scrolls) */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="surface-sub p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono-vct">
                  <span className="text-slate-200 font-bold uppercase tracking-wider">
                    Campeões e elencos no pool
                  </span>
                  <span className="text-slate-300">+40 times</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {FEATURED_CRESTS.map(team => (
                    <div
                      key={team.name}
                      className="rounded-[3px] bg-[#11151d] border border-white/[0.07] p-2.5 flex flex-col items-center justify-center text-center gap-1.5"
                    >
                      <TeamLogo teamName={team.name} size="md" />
                      <span className="text-xs font-semibold text-slate-200 truncate max-w-full">
                        {team.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* SECONDARY MODES: Compact 1-line strips on mobile, full 3-column cards on md+ desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 md:gap-4">
        <Card
          variant="interactive"
          padding="none"
          onMouseEnter={() => playHoverSound()}
          onClick={() => {
            playSelectSound();
            onSelectMode('grid');
          }}
          className="p-3 md:p-4 h-full flex flex-row md:flex-col items-center md:items-stretch justify-between gap-3 md:gap-4 cursor-pointer hover:border-[#e2b714]/55"
        >
          <div className="space-y-0.5 md:space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 md:justify-between text-xs font-mono-vct">
              <span className="text-[#e2b714] font-bold uppercase tracking-wider">3×3</span>
              <span className="text-slate-300">5 tabuleiros</span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl leading-none text-white uppercase tracking-wide">
              GRID VCT
            </h3>
            <p className="hidden md:block text-sm text-slate-300 leading-relaxed">
              Cruza camisas, janelas de transferência e nacionalidades sem dar um chute aleatório.
            </p>
          </div>

          <SecondaryButton id="home-play-grid-btn" size="sm" className="shrink-0 md:w-full md:justify-between">
            <span className="md:hidden">Jogar</span>
            <span className="hidden md:inline">Abrir Grid</span>
            <ArrowRight className="w-4 h-4 text-[#e2b714]" />
          </SecondaryButton>
        </Card>

        <Card
          variant="interactive"
          padding="none"
          onMouseEnter={() => playHoverSound()}
          onClick={() => {
            playSelectSound();
            onSelectMode('trivia');
          }}
          className="p-3 md:p-4 h-full flex flex-row md:flex-col items-center md:items-stretch justify-between gap-3 md:gap-4 cursor-pointer hover:border-[#38bdf8]/55"
        >
          <div className="space-y-0.5 md:space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 md:justify-between text-xs font-mono-vct">
              <span className="text-[#38bdf8] font-bold uppercase tracking-wider">Diário</span>
              <span className="text-slate-300">8 chances</span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl leading-none text-white uppercase tracking-wide">
              TRIVIA DOS PROS
            </h3>
            <p className="hidden md:block text-sm text-slate-300 leading-relaxed">
              Descobre o jogador misterioso pelas pistas de time, região, função e agente assinatura.
            </p>
          </div>

          <SecondaryButton id="home-play-trivia-btn" size="sm" className="shrink-0 md:w-full md:justify-between">
            <span className="md:hidden">Jogar</span>
            <span className="hidden md:inline">Jogar Trivia</span>
            <ArrowRight className="w-4 h-4 text-[#38bdf8]" />
          </SecondaryButton>
        </Card>

        <Card
          variant="interactive"
          padding="none"
          onMouseEnter={() => playHoverSound()}
          onClick={() => {
            playSelectSound();
            onSelectMode('history');
          }}
          className="p-3 md:p-4 h-full flex flex-row md:flex-col items-center md:items-stretch justify-between gap-3 md:gap-4 cursor-pointer hover:border-[#10b981]/55"
        >
          <div className="space-y-0.5 md:space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 md:justify-between text-xs font-mono-vct">
              <span className="text-[#10b981] font-bold uppercase tracking-wider">Histórico</span>
              <span className="text-slate-300">
                {trophiesCount} {trophiesCount === 1 ? 'título' : 'títulos'}
              </span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl leading-none text-white uppercase tracking-wide">
              SALA DE TROFÉUS
            </h3>
            <p className="hidden md:block text-sm text-slate-300 leading-relaxed">
              Teus campeões salvos, MVPs de cada campanha e conquistas desbloqueadas.
            </p>
          </div>

          <SecondaryButton id="home-open-history-btn" size="sm" className="shrink-0 md:w-full md:justify-between">
            <span className="md:hidden">Abrir</span>
            <span className="hidden md:inline">Ver Troféus</span>
            <ArrowRight className="w-4 h-4 text-[#10b981]" />
          </SecondaryButton>
        </Card>
      </div>
    </div>
  );
};
