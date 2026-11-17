import React from 'react';
import { motion } from 'motion/react';
import { Home, Trophy, Volume2, VolumeX, HelpCircle, Gamepad2, Grid3X3, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Difficulty } from '../types';
import { isAudioEnabled, toggleAudio, playSelectSound } from '../utils/audio';

export type TabId = 'home' | 'draft' | 'grid' | 'trivia' | 'history';

interface NavbarProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  difficulty: Difficulty;
  onDifficultyChange: (diff: Difficulty) => void;
  onOpenHelp: () => void;
  trophiesCount: number;
}

const TABS: { id: TabId; label: string; Icon: LucideIcon; accent: string }[] = [
  { id: 'home', label: 'Início', Icon: Home, accent: '#ffffff' },
  { id: 'draft', label: 'Mayhem', Icon: Gamepad2, accent: '#ff4655' },
  { id: 'grid', label: 'Grid VCT', Icon: Grid3X3, accent: '#e2b714' },
  { id: 'trivia', label: 'Trivia', Icon: Search, accent: '#38bdf8' },
  { id: 'history', label: 'Troféus', Icon: Trophy, accent: '#10b981' },
];

const DIFFICULTIES: { id: Difficulty; label: string; title: string; color: string; text: string }[] = [
  { id: 'normal', label: 'Normal', title: 'Normal: 3 rerolls, sem vetos, scouting completo', color: '#10b981', text: '#0b0e14' },
  { id: 'hard', label: 'Difícil', title: 'Difícil: 2 rerolls, 3 vetos, scouting parcial', color: '#e2b714', text: '#0b0e14' },
  { id: 'master', label: 'Master', title: 'Master: 1 reroll, 6 vetos, scouting cego e punição de química baixa', color: '#ff4655', text: '#ffffff' },
];

const SPRING = { type: 'spring' as const, stiffness: 460, damping: 36 };

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  difficulty,
  onDifficultyChange,
  onOpenHelp,
  trophiesCount,
}) => {
  const [audioOn, setAudioOn] = React.useState<boolean>(true);

  React.useEffect(() => {
    setAudioOn(isAudioEnabled());
  }, []);

  const handleSoundToggle = () => {
    const newState = toggleAudio();
    setAudioOn(newState);
    if (newState) playSelectSound();
  };

  return (
    <header className="sticky top-0 shrink-0 z-40 glass-nav">
      <div className="max-w-[1400px] mx-auto px-2.5 py-1.5 md:px-4 md:py-2 flex flex-wrap items-center justify-between gap-1.5 md:gap-2">
        {/* Brand Lockup */}
        <button
          id="brand-home-btn"
          type="button"
          onClick={() => {
            playSelectSound();
            onTabChange('home');
          }}
          className="flex items-center gap-2 md:gap-2.5 shrink-0 cursor-pointer group"
          title="Voltar para o início"
        >
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-[2px] bg-[#ff4655] vct-cut-sm flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-4 h-4 md:w-5 md:h-5 fill-white">
              <path d="M15 25 L45 75 L30 75 L5 33 Z" />
              <path d="M85 25 L55 75 L70 75 L95 33 Z" />
              <polygon points="50,42 62,62 38,62" />
            </svg>
          </div>
          <h1 className="font-display text-xl md:text-2xl leading-none text-white tracking-wide flex items-center gap-1.5 pt-0.5 uppercase">
            <span className="hidden md:inline">VALORANT CHAMPIONS</span>
            <span className="hidden sm:inline md:hidden">VCT</span>
            <span className="font-display text-base leading-none px-2 pt-0.5 pb-0.5 rounded-[2px] bg-[#e2b714] text-[#0b0e14] tracking-wider">
              MAYHEM
            </span>
          </h1>
        </button>

        {/* Center Navigation Tabs */}
        <nav className="order-3 lg:order-2 w-full lg:w-auto flex items-center justify-between sm:justify-center gap-0.5 md:gap-1 overflow-x-auto scrollbar-none border-t lg:border-t-0 border-white/10 pt-1 lg:pt-0">
          {TABS.map(t => {
            const active = currentTab === t.id;
            return (
              <button
                key={t.id}
                id={`tab-${t.id}-btn`}
                onClick={() => {
                  playSelectSound();
                  onTabChange(t.id);
                }}
                className={`relative h-9 md:h-10 px-2 sm:px-3 md:px-4 flex items-center gap-1.5 md:gap-2 whitespace-nowrap font-bold text-xs sm:text-sm tracking-wide transition-colors cursor-pointer ${
                  active ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-x-0.5 inset-y-1 rounded-[3px] bg-white/[0.06] border border-white/10"
                    transition={SPRING}
                  />
                )}
                {active && (
                  <motion.span
                    layoutId="nav-active-bar"
                    className="absolute left-2 right-2 md:left-3 md:right-3 bottom-0 h-[2px]"
                    style={{ background: t.accent }}
                    transition={SPRING}
                  />
                )}
                <t.Icon className="relative z-10 w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: active ? t.accent : undefined }} />
                <span className="relative z-10">{t.label}</span>
                {t.id === 'history' && trophiesCount > 0 && (
                  <span className="relative z-10 px-1.5 py-0.5 rounded-[2px] bg-[#e2b714]/20 text-[#e2b714] text-xs font-mono-vct font-bold">
                    {trophiesCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Difficulty + Audio + Help */}
        <div className="order-2 lg:order-3 flex items-center gap-1.5 md:gap-2 shrink-0">
          <div className="relative flex items-center rounded-[3px] p-0.5 bg-[#161b24] border border-white/10 text-xs">
            {DIFFICULTIES.map(d => {
              const active = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  id={`diff-${d.id}-btn`}
                  onClick={() => {
                    playSelectSound();
                    onDifficultyChange(d.id);
                  }}
                  title={d.title}
                  className={`relative px-2 md:px-2.5 py-1 rounded-[2px] font-mono-vct text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                    active ? '' : 'text-slate-300 hover:text-white'
                  }`}
                  style={active ? { color: d.text } : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="diff-active"
                      className="absolute inset-0 rounded-[2px]"
                      style={{ background: d.color }}
                      transition={SPRING}
                    />
                  )}
                  <span className="relative z-10">{d.label}</span>
                </button>
              );
            })}
          </div>

          <button
            id="sound-toggle-btn"
            onClick={handleSoundToggle}
            className="p-1.5 md:p-2 rounded-[3px] bg-[#161b24] border border-white/10 text-slate-300 hover:text-white hover:border-white/25 transition-colors cursor-pointer"
            title={audioOn ? 'Silenciar som' : 'Ligar som'}
            aria-label="Ativar ou desativar sons"
          >
            {audioOn ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            id="help-btn"
            onClick={() => {
              playSelectSound();
              onOpenHelp();
            }}
            className="p-1.5 md:p-2 rounded-[3px] bg-[#161b24] border border-white/10 text-slate-300 hover:text-white hover:border-white/25 transition-colors cursor-pointer"
            title="Como jogar"
            aria-label="Como jogar"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
