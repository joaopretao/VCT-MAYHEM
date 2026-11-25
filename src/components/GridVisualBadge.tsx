import React from 'react';
import { GridCriterion } from '../data/gridPuzzles';
import { TeamLogo } from './TeamLogo';
import { CountryFlag, resolveCountryIso } from './CountryFlag';

interface GridVisualBadgeProps {
  criterion: GridCriterion;
  size?: 'sm' | 'md' | 'lg';
}

export const GridVisualBadge: React.FC<GridVisualBadgeProps> = ({ criterion, size = 'md' }) => {
  const { type, value, label } = criterion;

  const boxClass =
    size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-11 h-11' : 'w-8 h-8 sm:w-9 sm:h-9';

  // 1. NATIONALITY — Official ISO SVG flag via flag-icons
  if (type === 'nationality') {
    const iso = resolveCountryIso(undefined, value);
    if (iso) {
      return (
        <div className="inline-flex items-center justify-center shrink-0">
          <CountryFlag
            code={iso}
            country={label}
            size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
          />
        </div>
      );
    }

    return (
      <div
        className={`${boxClass} rounded-[3px] bg-[#161b24] border border-white/15 flex items-center justify-center text-xs font-mono-vct font-bold text-white shrink-0`}
      >
        {criterion.shortCode || label.slice(0, 3).toUpperCase()}
      </div>
    );
  }

  // 2. TEAM LOGOS
  const teams = value.split('|').map(s => s.trim()).filter(Boolean);
  const primaryTeam = teams[0] || value;

  return (
    <div
      className={`${boxClass} rounded-[3px] bg-[#0b0e14] border border-white/10 flex items-center justify-center p-1 overflow-hidden shrink-0`}
    >
      <TeamLogo
        teamName={primaryTeam}
        size={size === 'sm' ? 18 : size === 'lg' ? 36 : 26}
      />
    </div>
  );
};
