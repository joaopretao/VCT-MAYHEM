import React from 'react';
import { Home, Trophy, Volume2, VolumeX, HelpCircle, Gamepad2, Grid3X3, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { isAudioEnabled, toggleAudio, playSelectSound } from '../utils/audio';

export type TabId = 'home' | 'draft' | 'grid' | 'trivia' | 'history';

interface NavbarProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  onOpenHelp: () => void;
  trophiesCount: number;
}

const TABS: { id: TabId; label: string; Icon: LucideIcon }[] = [
  { id: 'home', label: 'Início', Icon: Home },
  { id: 'draft', label: 'Mayhem', Icon: Gamepad2 },
  { id: 'grid', label: 'Grid', Icon: Grid3X3 },
  { id: 'trivia', label: 'Trivia', Icon: Search },
  { id: 'history', label: 'Troféus', Icon: Trophy },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
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
    <header className="sticky top-0 shrink-0 z-40 bg-[#0b0e14]/95 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-[1400px] mx-auto h-13 md:h-14 px-3 md:px-5 flex items-center justify-between gap-2 md:gap-6">
        {/* Brand Lockup */}
        <button
          id="brand-home-btn"
          type="button"
          onClick={() => {
            playSelectSound();
            onTabChange('home');
          }}
          className="flex items-center shrink-0 cursor-pointer group py-1"
          title="VCT Mayhem — Voltar para o início"
        >
          <img
            src="/brand/logo-color.png"
            alt="VCT Mayhem"
            className="h-8 md:h-9 w-auto object-contain select-none"
          />
        </button>

        {/* Single-Row Sober Navigation */}
        <nav className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none h-full">
          {TABS.map(t => {
            const active = currentTab === t.id;
            return (
              <button
                key={t.id}
                id={`tab-${t.id}-btn`}
                type="button"
                onClick={() => {
                  playSelectSound();
                  onTabChange(t.id);
                }}
                className={`relative h-full px-2.5 sm:px-3.5 md:px-4 flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm font-semibold tracking-wide transition-colors cursor-pointer ${
                  active ? 'text-white' : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <t.Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${active ? 'text-[#ff4655]' : ''}`} />
                <span className="hidden xs:inline sm:inline">{t.label}</span>
                {t.id === 'history' && trophiesCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-[2px] bg-white/[0.08] text-slate-200 text-[11px] font-mono-vct font-bold leading-none">
                    {trophiesCount}
                  </span>
                )}
                {active && (
                  <span
                    className="absolute inset-x-2 bottom-0 h-[2px] bg-[#ff4655]"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Minimal Utility Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            id="sound-toggle-btn"
            type="button"
            onClick={handleSoundToggle}
            className="p-2 rounded-[3px] text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            title={audioOn ? 'Silenciar som' : 'Ligar som'}
            aria-label="Ativar ou desativar sons"
          >
            {audioOn ? (
              <Volume2 className="w-4 h-4 text-slate-200" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          <button
            id="help-btn"
            type="button"
            onClick={() => {
              playSelectSound();
              onOpenHelp();
            }}
            className="p-2 rounded-[3px] text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
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
