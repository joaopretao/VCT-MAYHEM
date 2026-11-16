import React from 'react';
import { GridCriterion } from '../data/gridPuzzles';
import { TeamLogo } from './TeamLogo';

interface GridVisualBadgeProps {
  criterion: GridCriterion;
  size?: 'sm' | 'md' | 'lg';
}

export const GridVisualBadge: React.FC<GridVisualBadgeProps> = ({ criterion, size = 'md' }) => {
  const { type, value, label } = criterion;
  const val = value.toLowerCase();

  const iconDimensions =
    size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8 sm:w-9 sm:h-9';

  // 1. NATIONALITY / COUNTRY FLAGS (Vector SVG)
  if (type === 'nationality') {
    if (val === 'brasil' || val === 'brazil') {
      return (
        <div
          className={`${iconDimensions} rounded-md overflow-hidden shadow-md bg-[#009c3b] flex items-center justify-center p-0.5 border border-white/20 shrink-0`}
        >
          <svg viewBox="0 0 100 70" className="w-full h-full">
            <polygon points="50,6 93,35 50,64 7,35" fill="#ffdf00" />
            <circle cx="50" cy="35" r="16" fill="#002776" />
            <path d="M35,36 Q50,30 65,36" stroke="#ffffff" strokeWidth="2.5" fill="none" />
          </svg>
        </div>
      );
    }

    if (val === 'estados unidos' || val === 'eua' || val === 'usa' || val === 'eua_canada' || val === 'na') {
      return (
        <div
          className={`${iconDimensions} rounded-md overflow-hidden shadow-md bg-[#b22234] border border-white/20 shrink-0 relative flex flex-col justify-between`}
        >
          <div className="w-full h-[14%] bg-white" />
          <div className="w-full h-[14%] bg-white" />
          <div className="w-full h-[14%] bg-white" />
          <div className="absolute top-0 left-0 w-[48%] h-[55%] bg-[#3c3b6e] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white">
              <polygon points="12,2 14.9,8.6 22,9.3 16.6,14 18.2,21 12,17.3 5.8,21 7.4,14 2,9.3 9.1,8.6" />
            </svg>
          </div>
        </div>
      );
    }

    if (val === 'canadá' || val === 'canada') {
      return (
        <div
          className={`${iconDimensions} rounded-md overflow-hidden shadow-md flex border border-white/20 shrink-0`}
        >
          <div className="w-[26%] h-full bg-[#ff0000]" />
          <div className="w-[48%] h-full bg-[#ffffff] flex items-center justify-center text-[#ff0000]">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M12 2l1.2 3.8 2.8-1-1.3 3.6 3.5.5-2.2 2.8 3.5 2-3.7 1.4.7 3.9-3.5-2.1L12 22l-1-4.1-3.5 2.1.7-3.9-3.7-1.4 3.5-2-2.2-2.8 3.5-.5-1.3-3.6 2.8 1z" />
            </svg>
          </div>
          <div className="w-[26%] h-full bg-[#ff0000]" />
        </div>
      );
    }

    if (val === 'turquia' || val === 'turkey') {
      return (
        <div
          className={`${iconDimensions} rounded-md overflow-hidden shadow-md bg-[#e30a17] flex items-center justify-center border border-white/20 shrink-0 relative`}
        >
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <circle cx="16" cy="12" r="7" fill="#ffffff" />
            <circle cx="18" cy="12" r="5.6" fill="#e30a17" />
            <polygon points="23,12 20.2,12.8 22,14.8 21.2,12 19,10.6 21.8,11.2" fill="#ffffff" />
          </svg>
        </div>
      );
    }

    if (val === 'coreia do sul' || val === 'south korea' || val === 'korea') {
      return (
        <div
          className={`${iconDimensions} rounded-md overflow-hidden shadow-md bg-white border border-slate-300 flex items-center justify-center shrink-0 relative`}
        >
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <path d="M18,7 A5,5 0 0,1 18,17 A2.5,2.5 0 0,1 18,12 A2.5,2.5 0 0,0 18,7" fill="#cd2e3a" />
            <path d="M18,17 A5,5 0 0,1 18,7 A2.5,2.5 0 0,1 18,12 A2.5,2.5 0 0,0 18,17" fill="#0047a0" />
            <line x1="8" y1="7" x2="11" y2="10" stroke="#000" strokeWidth="1.2" />
            <line x1="25" y1="14" x2="28" y2="17" stroke="#000" strokeWidth="1.2" />
          </svg>
        </div>
      );
    }

    if (val === 'rússia' || val === 'russia' || val === 'cis' || val === 'cis_tr') {
      return (
        <div
          className={`${iconDimensions} rounded-md overflow-hidden shadow-md flex flex-col border border-white/20 shrink-0`}
        >
          <div className="w-full h-1/3 bg-white" />
          <div className="w-full h-1/3 bg-[#0039a6]" />
          <div className="w-full h-1/3 bg-[#d52b1e]" />
        </div>
      );
    }

    if (val === 'chile' || val === 'latam' || val === 'chile_argentina') {
      return (
        <div
          className={`${iconDimensions} rounded-md overflow-hidden shadow-md flex flex-col border border-white/20 shrink-0`}
        >
          <div className="w-full h-1/2 flex">
            <div className="w-1/3 h-full bg-[#0039a6] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white">
                <polygon points="12,2 14.9,8.6 22,9.3 16.6,14 18.2,21 12,17.3 5.8,21 7.4,14 2,9.3 9.1,8.6" />
              </svg>
            </div>
            <div className="w-2/3 h-full bg-white" />
          </div>
          <div className="w-full h-1/2 bg-[#d52b1e]" />
        </div>
      );
    }

    if (val === 'finlândia' || val === 'finlandia' || val === 'finland' || val === 'nordic_uk') {
      return (
        <div
          className={`${iconDimensions} rounded-md overflow-hidden shadow-md bg-white border border-slate-300 shrink-0 relative`}
        >
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect x="10" y="0" width="5" height="24" fill="#003580" />
            <rect x="0" y="9.5" width="36" height="5" fill="#003580" />
          </svg>
        </div>
      );
    }

    if (val === 'china' || val === 'china_tw_hk') {
      return (
        <div
          className={`${iconDimensions} rounded-md overflow-hidden shadow-md bg-[#de2910] border border-white/20 flex items-center justify-center shrink-0 relative`}
        >
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <polygon points="9,5 10.2,8.5 13.8,8.5 10.9,10.6 12,14 9,11.9 6,14 7.1,10.6 4.2,8.5 7.8,8.5" fill="#ffde00" />
            <circle cx="16" cy="4.5" r="1" fill="#ffde00" />
            <circle cx="18" cy="7.5" r="1" fill="#ffde00" />
            <circle cx="18" cy="11" r="1" fill="#ffde00" />
            <circle cx="16" cy="14" r="1" fill="#ffde00" />
          </svg>
        </div>
      );
    }

    if (val === 'sea') {
      return (
        <div
          className={`${iconDimensions} rounded-md overflow-hidden shadow-md flex flex-col border border-white/20 shrink-0`}
        >
          <div className="w-full h-1/2 bg-[#ef3340] flex items-center px-1">
            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white">
              <polygon points="12,2 14.9,8.6 22,9.3 16.6,14 18.2,21 12,17.3 5.8,21 7.4,14 2,9.3 9.1,8.6" />
            </svg>
          </div>
          <div className="w-full h-1/2 bg-white" />
        </div>
      );
    }

    if (val === 'frança' || val === 'franca' || val === 'france' || val === 'frança_espanha') {
      return (
        <div
          className={`${iconDimensions} rounded-md overflow-hidden shadow-md flex border border-white/20 shrink-0`}
        >
          <div className="w-1/3 h-full bg-[#002654]" />
          <div className="w-1/3 h-full bg-[#FFFFFF]" />
          <div className="w-1/3 h-full bg-[#CE1126]" />
        </div>
      );
    }

    return (
      <div
        className={`${iconDimensions} rounded-md bg-[#1e293b] border border-white/20 flex items-center justify-center text-xs font-mono-vct font-bold text-white shadow-sm`}
      >
        {criterion.shortCode || label.slice(0, 3).toUpperCase()}
      </div>
    );
  }

  // 2. ACHIEVEMENTS (Masters Winner, Champions 2026, etc.)
  if (type === 'achievement') {
    if (val === 'masters_winner') {
      return (
        <div
          className={`${iconDimensions} rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shadow-md shrink-0 text-purple-300`}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M12 2L4.5 9.5 12 22l7.5-12.5L12 2zm0 3.8l4.4 4.2-4.4 7.5-4.4-7.5L12 5.8z" />
          </svg>
        </div>
      );
    }
    return (
      <div
        className={`${iconDimensions} rounded-xl bg-[#e2b714]/20 border border-[#e2b714]/45 flex items-center justify-center shadow-md shrink-0 text-[#e2b714] font-mono-vct font-bold text-xs`}
      >
        {criterion.shortCode || '★'}
      </div>
    );
  }

  // 3. TEAM LOGOS
  const teams = value.split('|').map(s => s.trim()).filter(Boolean);
  if (teams.length > 1 && size !== 'sm') {
    return (
      <div className="flex items-center -space-x-1.5 shrink-0">
        {teams.slice(0, 2).map((teamName, idx) => (
          <div
            key={idx}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0b0e14]/90 border border-white/20 flex items-center justify-center shadow-md p-1 overflow-hidden"
          >
            <TeamLogo teamName={teamName} size={22} showGlow />
          </div>
        ))}
      </div>
    );
  }

  const primaryTeam = teams[0] || value;
  return (
    <div
      className={`${iconDimensions} rounded-xl bg-black/50 border border-white/15 flex items-center justify-center shadow-lg p-1 overflow-hidden shrink-0`}
    >
      <TeamLogo
        teamName={primaryTeam}
        size={size === 'sm' ? 20 : size === 'lg' ? 38 : 28}
        showGlow
      />
    </div>
  );
};
