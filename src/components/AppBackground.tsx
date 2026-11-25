import React from 'react';
import { getMapArt } from '../data/mapArt';

export interface AppBackdropConfig {
  mapName?: string | null;
  leftGlowColor?: string | null;
  rightGlowColor?: string | null;
  isFinals?: boolean;
}

interface AppBackgroundProps {
  backdrop?: AppBackdropConfig | null;
}

// Atmospheric depth-of-field backdrop synced with the active tournament map
export const AppBackground: React.FC<AppBackgroundProps> = ({ backdrop }) => {
  const hasActiveMap = Boolean(backdrop?.mapName);
  const mapArt = getMapArt(backdrop?.mapName);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#070a10]">
      {hasActiveMap ? (
        <>
          <img
            key={mapArt.splash}
            src={mapArt.splash}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-[22px] brightness-[0.38] saturate-[1.15] transition-opacity duration-500"
          />
          {backdrop?.leftGlowColor && (
            <div
              className="absolute -left-24 top-1/4 w-[420px] h-[420px] rounded-full blur-[120px] opacity-20"
              style={{ backgroundColor: backdrop.leftGlowColor }}
            />
          )}
          {backdrop?.rightGlowColor && (
            <div
              className="absolute -right-24 top-1/4 w-[420px] h-[420px] rounded-full blur-[120px] opacity-20"
              style={{ backgroundColor: backdrop.rightGlowColor }}
            />
          )}
          {backdrop?.isFinals && (
            <div
              className="absolute left-1/2 -translate-x-1/2 -top-24 w-[520px] h-[300px] rounded-full blur-[120px] opacity-20"
              style={{ backgroundColor: '#e2b714' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#070a10]/65 via-[#070a10]/55 to-[#070a10]/90" />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.04] grayscale contrast-125"
            style={{ backgroundImage: 'url(/ascent-splash.png), url(./ascent-splash.png)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b0e14]/70 via-[#0b0e14]/88 to-[#0b0e14]" />
        </>
      )}

      <img
        src="/brand/mark.png"
        alt=""
        className="hidden lg:block absolute -right-24 -bottom-24 w-[480px] h-auto opacity-[0.025] grayscale select-none"
      />
      <img
        src="/brand/logo-mono.png"
        alt=""
        className="hidden sm:block fixed bottom-3 right-4 w-24 h-auto opacity-[0.14] select-none"
      />
    </div>
  );
};
