import React from 'react';
import {
  Crosshair,
  Coins,
  Award,
  Flame,
  RotateCcw,
  Shield,
  Zap,
  Flag,
  HeartPulse,
  RefreshCw,
  Layers,
  Swords,
  Crown,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { MayhemBonusIcon, MayhemBonusRarity } from '../types';
import { BONUS_RARITY_META, getMayhemBonusById } from '../data/mayhemBonuses';

export const MayhemBonusIconSvg: React.FC<{
  icon: MayhemBonusIcon;
  className?: string;
  color?: string;
}> = ({ icon, className = 'w-4 h-4', color }) => {
  const style = color ? { color } : undefined;
  switch (icon) {
    case 'Crosshair':
      return <Crosshair className={className} style={style} />;
    case 'Coins':
      return <Coins className={className} style={style} />;
    case 'Award':
      return <Award className={className} style={style} />;
    case 'Flame':
      return <Flame className={className} style={style} />;
    case 'RotateCcw':
      return <RotateCcw className={className} style={style} />;
    case 'Shield':
      return <Shield className={className} style={style} />;
    case 'Zap':
      return <Zap className={className} style={style} />;
    case 'Flag':
      return <Flag className={className} style={style} />;
    case 'HeartPulse':
      return <HeartPulse className={className} style={style} />;
    case 'RefreshCw':
      return <RefreshCw className={className} style={style} />;
    case 'Layers':
      return <Layers className={className} style={style} />;
    case 'Swords':
      return <Swords className={className} style={style} />;
    case 'Crown':
      return <Crown className={className} style={style} />;
    case 'TrendingUp':
      return <TrendingUp className={className} style={style} />;
    case 'BookOpen':
      return <BookOpen className={className} style={style} />;
  }
};

interface MayhemBonusChipProps {
  id: string;
  name?: string;
  rarity?: MayhemBonusRarity;
  subtitle?: string;
  compact?: boolean;
}

export const MayhemBonusChip: React.FC<MayhemBonusChipProps> = ({
  id,
  name,
  rarity,
  subtitle,
  compact = false,
}) => {
  const catalog = getMayhemBonusById(id);
  const resolvedName = name || catalog?.name || id;
  const resolvedRarity = rarity || catalog?.rarity || 'common';
  const meta = BONUS_RARITY_META[resolvedRarity];
  const tooltip = subtitle || catalog?.description || resolvedName;

  return (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1.5 rounded-[3px] border font-mono-vct text-xs font-semibold leading-none ${
        compact ? 'px-2 py-1' : 'px-2.5 py-1.5'
      }`}
      style={{
        backgroundColor: meta.bgTint,
        borderColor: meta.borderColor,
        color: meta.textColor,
      }}
    >
      {catalog ? (
        <MayhemBonusIconSvg icon={catalog.icon} className="w-3.5 h-3.5 shrink-0" color={meta.color} />
      ) : (
        <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: meta.color }} />
      )}
      <span className="truncate max-w-[160px] text-white font-bold">{resolvedName}</span>
      {subtitle && !compact && (
        <span className="hidden sm:inline text-slate-300 font-normal">· {subtitle}</span>
      )}
    </span>
  );
};
