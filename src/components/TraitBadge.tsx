import React from 'react';
import { PlayerTrait } from '../types';
import { Crown, Shield, Zap, Flame, AlertTriangle, Snowflake, Shuffle, Star } from 'lucide-react';

interface TraitBadgeProps {
  trait?: PlayerTrait;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  showDescription?: boolean;
  showShortEffect?: boolean;
}

export const TraitBadge: React.FC<TraitBadgeProps> = ({
  trait,
  size = 'sm',
  iconOnly = false,
  showDescription = false,
  showShortEffect = false,
}) => {
  if (!trait) return null;

  const getIcon = (iconClass: string) => {
    switch (trait.id) {
      case 'final_boss':
        return <Crown className={`${iconClass} text-amber-300`} />;
      case 'ice_in_the_veins':
        return <Snowflake className={`${iconClass} text-sky-300`} />;
      case 'first_blood_king':
        return <Zap className={`${iconClass} text-rose-400`} />;
      case 'natural_synergy':
        return <Shield className={`${iconClass} text-emerald-300`} />;
      case 'clutch_master':
        return <Flame className={`${iconClass} text-purple-300`} />;
      case 'choke_artist':
        return <AlertTriangle className={`${iconClass} text-orange-400`} />;
      case 'tilted':
        return <AlertTriangle className={`${iconClass} text-rose-400`} />;
      case 'inconsistent':
        return <Shuffle className={`${iconClass} text-slate-300`} />;
      default:
        return <Star className={`${iconClass} text-amber-300`} />;
    }
  };

  if (iconOnly) {
    const iconSizes = {
      xs: 'w-3 h-3',
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    }[size];

    const containerSizes = {
      xs: 'w-5 h-5 p-0.5',
      sm: 'w-6 h-6 p-1',
      md: 'w-7 h-7 p-1.5',
      lg: 'w-8 h-8 p-1.5',
    }[size];

    return (
      <span
        className={`inline-flex items-center justify-center rounded-[2px] border shrink-0 cursor-help ${containerSizes}`}
        style={{
          color: trait.color,
          backgroundColor: trait.badgeBg,
          borderColor: trait.badgeBorder,
        }}
        title={`${trait.name}: ${trait.shortEffect}`}
      >
        {getIcon(iconSizes)}
      </span>
    );
  }

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5 gap-1 font-bold',
    sm: 'text-xs px-2 py-0.5 gap-1.5 font-bold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
    lg: 'text-sm px-3 py-1.5 gap-2 font-extrabold',
  }[size];

  const iconSizeClass = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
  }[size];

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center rounded-[2px] font-mono-vct tracking-wider uppercase border ${sizeClasses}`}
        style={{
          color: trait.color,
          backgroundColor: trait.badgeBg,
          borderColor: trait.badgeBorder,
        }}
        title={`${trait.name}: ${trait.description}`}
      >
        {getIcon(iconSizeClass)}
        <span>{trait.badgeLabel}</span>
      </span>

      {showShortEffect && trait.shortEffect && (
        <span
          className="text-xs font-mono-vct font-semibold px-1.5 py-0.5 rounded-[2px] border bg-[#0d1118]"
          style={{ color: trait.color, borderColor: `${trait.color}40` }}
        >
          {trait.shortEffect}
        </span>
      )}

      {showDescription && (
        <div className="w-full text-xs font-mono-vct text-slate-300 bg-[#0d1118] p-3 rounded-sm border border-white/10 space-y-1.5 mt-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-xs" style={{ color: trait.color }}>
              {trait.name}
            </span>
            {trait.shortEffect && (
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-[2px] bg-white/[0.06]"
                style={{ color: trait.color }}
              >
                {trait.shortEffect}
              </span>
            )}
          </div>
          <p className="font-medium text-slate-200 font-sans text-sm">
            {trait.description}
          </p>
          <p className="text-xs text-slate-400 italic pt-1 border-t border-white/[0.06] font-sans">
            "{trait.flavorText}"
          </p>
        </div>
      )}
    </div>
  );
};
