import React from 'react';
import { getMapArt } from '../data/mapArt';

export interface AppBackdropConfig {
  mapName?: string | null;
  leftGlowColor?: string | null;
  rightGlowColor?: string | null;
  isFinals?: boolean;
  /** 'stage' for pre-match/live tournament (brighter), 'ambient' for menus/draft/grid/trivia */
  intensity?: 'stage' | 'ambient';
}

interface AppBackgroundProps {
  backdrop?: AppBackdropConfig | null;
}

// Crisp Full-HD / 4K map backdrop across the entire game (zero blur, clean broadcast vignette)
export const AppBackground: React.FC<AppBackgroundProps> = ({ backdrop }) => {
  const mapArt = getMapArt(backdrop?.mapName || 'Ascent');
  const isStage = backdrop?.intensity === 'stage';

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#06090f]">
      {/* Crisp Full-HD / 4K Map Image (No blur) */}
      <img
        key={mapArt.splash}
        src={mapArt.splash}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isStage
            ? 'brightness-[0.46] saturate-[1.06]'
            : 'brightness-[0.34] saturate-[1.02]'
        }`}
      />

      {/* Directional dark readability scrim */}
      <div
        className="absolute inset-0"
        style={{
          background: isStage
            ? 'radial-gradient(ellipse 68% 65% at 50% 38%, rgba(6,9,15,0.22) 0%, rgba(6,9,15,0.72) 75%, rgba(6,9,15,0.92) 100%)'
            : 'radial-gradient(ellipse 75% 70% at 50% 32%, rgba(6,9,15,0.38) 0%, rgba(6,9,15,0.78) 72%, rgba(6,9,15,0.94) 100%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#06090f]/75 via-transparent to-[#06090f]/94" />

      {/* Subtle directional team-color / Champions edge tints (no blurred blobs) */}
      {backdrop?.leftGlowColor && (
        <div
          className="absolute inset-y-0 left-0 w-1/3 opacity-[0.12]"
          style={{
            background: `linear-gradient(90deg, ${backdrop.leftGlowColor} 0%, transparent 100%)`,
          }}
        />
      )}
      {backdrop?.rightGlowColor && (
        <div
          className="absolute inset-y-0 right-0 w-1/3 opacity-[0.12]"
          style={{
            background: `linear-gradient(270deg, ${backdrop.rightGlowColor} 0%, transparent 100%)`,
          }}
        />
      )}
      {backdrop?.isFinals && (
        <div
          className="absolute inset-x-0 top-0 h-44 opacity-[0.16]"
          style={{
            background: 'linear-gradient(180deg, #e2b714 0%, transparent 100%)',
          }}
        />
      )}

      {/* Subtle VCT Mayhem monochrome brand watermarks */}
      <img
        src="/brand/mark.png"
        alt=""
        className="hidden lg:block absolute -right-24 -bottom-24 w-[480px] h-auto opacity-[0.03] grayscale select-none"
      />
      <img
        src="/brand/logo-mono.png"
        alt=""
        className="hidden sm:block fixed bottom-3 right-4 w-24 h-auto opacity-[0.16] select-none"
      />
    </div>
  );
};
