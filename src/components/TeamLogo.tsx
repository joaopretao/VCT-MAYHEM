import React, { useState, useEffect } from 'react';
import { getTeamLogoData } from '../data/teamLogos';

interface TeamLogoProps {
  teamName: string;
  shortName?: string;
  logoUrl?: string;
  primaryColor?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showGlow?: boolean;
}

const DARK_LOGOS = new Set([
  'furia',
  'mibr',
  '100t',
  'thieves',
  'giant',
  'acend',
  'fullsense',
  'optic',
  'xset',
  'secret',
]);

export const TeamLogo: React.FC<TeamLogoProps> = ({
  teamName,
  shortName = '',
  logoUrl,
  primaryColor,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const [triedPublicPrefix, setTriedPublicPrefix] = useState(false);

  const logoData = getTeamLogoData(teamName) || (shortName ? getTeamLogoData(shortName) : null);
  const rawUrl = logoUrl || logoData?.logoUrl;

  useEffect(() => {
    setImgError(false);
    setTriedPublicPrefix(false);
  }, [rawUrl, teamName]);

  const effectiveUrl = rawUrl
    ? triedPublicPrefix && rawUrl.startsWith('./')
      ? `./public/${rawUrl.slice(2)}`
      : rawUrl
    : undefined;

  const color = primaryColor || logoData?.primaryColor || '#94a3b8';

  const sizeMap = {
    xs: 'w-4 h-4 text-[8px]',
    sm: 'w-6 h-6 text-[9px]',
    md: 'w-9 h-9 text-[11px]',
    lg: 'w-12 h-12 text-xs',
    xl: 'w-16 h-16 text-sm',
  };

  const dimClass = typeof size === 'number' ? '' : sizeMap[size];
  const customStyle = typeof size === 'number' ? { width: size, height: size } : undefined;
  const key = (teamName || shortName || '').toLowerCase().replace(/[\s.-]/g, '');
  const needsLightBacking = Array.from(DARK_LOGOS).some(k => key.includes(k));
  const abbr = (shortName || logoData?.shortName || teamName || 'VCT').slice(0, 3).toUpperCase();

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-[3px] overflow-hidden ${
        needsLightBacking && effectiveUrl && !imgError ? 'bg-white/[0.08]' : ''
      } ${dimClass} ${className}`}
      style={customStyle}
      title={teamName}
    >
      {effectiveUrl && !imgError ? (
        <img
          src={effectiveUrl}
          alt={`${teamName} logo`}
          className="w-full h-full object-contain p-0.5 select-none"
          referrerPolicy="no-referrer"
          onError={() => {
            if (!triedPublicPrefix && rawUrl?.startsWith('./')) {
              setTriedPublicPrefix(true);
            } else {
              setImgError(true);
            }
          }}
        />
      ) : (
        <span
          className="w-full h-full flex items-center justify-center rounded-[3px] bg-[#141923] border font-mono-vct font-bold tracking-tight text-slate-200 select-none"
          style={{ borderColor: `${color}55` }}
        >
          {abbr}
        </span>
      )}
    </div>
  );
};
