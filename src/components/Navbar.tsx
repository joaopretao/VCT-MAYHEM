import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Volume2, VolumeX, HelpCircle, Gamepad2, Grid3X3, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Difficulty } from '../types';
import { isAudioEnabled, toggleAudio, playSelectSound } from '../utils/audio';

type TabId = 'draft' | 'grid' | 'trivia' | 'history';

interface NavbarProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  difficulty: Difficulty;
  onDifficultyChange: (diff: Difficulty) => void;
  onOpenHelp: () => void;
  trophiesCount: number;
}

const TABS: { id: TabId; label: string; Icon: LucideIcon; accent: string }[] = [
  { id: 'draft', label: 'Lobby & Draft', Icon: Gamepad2, accent: '#ff4655' },
  { id: 'grid', label: 'Grid VCT', Icon: Grid3X3, accent: '#e2b714' },
  { id: 'trivia', label: 'Trivia', Icon: Search, accent: '#38bdf8' },
  { id: 'history', label: 'Troféus', Icon: Trophy, accent: '#e2b714' },
];

const DIFFICULTIES: { id: Difficulty; label: string; title: string; color: string; text: string }[] = [
  { id: 'normal', label: 'Normal', title: 'Normal: 3 Rerolls, 0 Vetos', color: '#10b981', text: '#ffffff' },
  { id: 'hard', label: 'Difícil', title: 'Difícil: 2 Rerolls, 3 Vetos', color: '#e2b714', text: '#0b0e14' },
  { id: 'master', label: 'Master', title: 'Master: 1 Reroll, 6 Vetos', color: '#ff4655', text: '#ffffff' },
];

const SPRING = { type: 'spring' as const, stiffness: 420, damping: 34 };

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
    <header className="sticky top-0 shrink-0 z-40 border-b border-white/15 bg-gradient-to-b from-white/[0.09] to-[#0b0e14]/55 backdrop-blur-[18px] backdrop-saturate-[160%] shadow-[inset_0_-1px_0_rgba(255,255,255,0.12),0_12px_30px_-12px_rgba(0,0,0,0.55)]">
      <div className="max-w-[1400px] mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff4655] to-[#b8202d] flex items-center justify-center shadow-[0_0_16px_rgba(255,70,85,0.45)]">
            <svg viewBox="0 0 100 100" className="w-5 h-5 fill-white">
              <path d="M15 25 L45 75 L30 75 L5 33 Z" />
              <path d="M85 25 L55 75 L70 75 L95 33 Z" />
              <polygon points="50,42 62,62 38,62" />
            </svg>
          </div>
          <h1 className="font-display text-2xl leading-none text-white tracking-wide flex items-center gap-1.5 pt-0.5">
            <span className="hidden md:inline">VALORANT CHAMPIONS</span>
            <span className="md:hidden">VCT</span>
            <span className="font-display text-base leading-none px-2 pt-0.5 pb-0.5 rounded-md bg-[#e2b714] text-[#0b0e14] tracking-wider">
              MAYHEM
            </span>
          </h1>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="order-3 lg:order-2 w-full lg:w-auto flex items-center justify-between sm:justify-center gap-1 overflow-x-auto scrollbar-none border-t lg:border-t-0 border-white/10 pt-1.5 lg:pt-0">
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
                className={`relative h-10 px-3 sm:px-4 flex items-center gap-2 whitespace-nowrap font-bold text-xs sm:text-sm tracking-wide transition-colors cursor-pointer ${
                  active ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-x-0.5 inset-y-1 rounded-xl bg-white/[0.07] border border-white/10"
                    transition={SPRING}
                  />
                )}
                {active && (
                  <motion.span
                    layoutId="nav-active-bar"
                    className="absolute left-3 right-3 bottom-0 h-[3px] rounded-full"
                    style={{ background: t.accent, boxShadow: `0 0 12px ${t.accent}` }}
                    transition={SPRING}
                  />
                )}
                <t.Icon className="relative z-10 w-4 h-4" style={{ color: active ? t.accent : undefined }} />
                <span className="relative z-10">{t.label}</span>
                {t.id === 'history' && trophiesCount > 0 && (
                  <span className="relative z-10 px-1.5 py-0.5 rounded-md bg-[#e2b714]/20 text-[#e2b714] text-xs font-mono-vct font-bold">
                    {trophiesCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Difficulty + Audio + Help */}
        <div className="order-2 lg:order-3 flex items-center gap-2 shrink-0">
          <div className="relative flex items-center rounded-xl p-0.5 bg-white/[0.05] border border-white/10 text-xs">
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
                  className={`relative px-2.5 py-1 rounded-lg font-mono-vct text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                    active ? '' : 'text-slate-300 hover:text-white'
                  }`}
                  style={active ? { color: d.text } : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="diff-active"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: d.color, boxShadow: `0 0 10px ${d.color}88` }}
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
            className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
            title={audioOn ? 'Desativar Sons' : 'Ativar Sons'}
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
            className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
            title="Como Jogar"
            aria-label="Ajuda e Regras"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
