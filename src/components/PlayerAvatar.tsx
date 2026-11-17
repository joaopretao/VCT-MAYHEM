import React, { useState, useEffect, useRef } from 'react';
import { Player } from '../types';
import { AGENT_ICONS } from '../data/agentIcons';
import { getPlayerPhotoUrl } from '../data/playerPhotos';
import { getTeamLogoData } from '../data/teamLogos';

export type PlayerAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'draft' | 'xl';

interface PlayerAvatarProps {
  player: Player;
  size?: PlayerAvatarSize;
  showAgentBadge?: boolean;
  teamColor?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  size = 'md',
  showAgentBadge = false,
  teamColor,
}) => {
  const [photoError, setPhotoError] = useState(false);
  const [agentError, setAgentError] = useState(false);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const playerPhotoUrl = getPlayerPhotoUrl(player.ign);
  const agentIconUrl = player.signatureAgent ? AGENT_ICONS[player.signatureAgent] : null;
  const resolvedTeamColor = teamColor || getTeamLogoData(player.team)?.primaryColor || '#334155';

  useEffect(() => {
    setPhotoError(false);
    setAgentError(false);
    setPhotoLoaded(
      Boolean(imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0)
    );
  }, [player.id, player.ign, playerPhotoUrl]);

  const sizeClasses: Record<PlayerAvatarSize, string> = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    draft: 'w-[52px] h-[52px] sm:w-14 sm:h-14 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={`${sizeClasses[size]} rounded-[3px] overflow-hidden border flex items-center justify-center font-vct font-bold text-[#e2b714] relative`}
        style={{
          background: `radial-gradient(circle at 50% 25%, ${resolvedTeamColor}50 0%, #0d1118 82%), linear-gradient(180deg, ${resolvedTeamColor}28 0%, #090c11 100%)`,
          borderColor: `${resolvedTeamColor}55`,
        }}
      >
        {playerPhotoUrl && !photoError ? (
          <>
            {!photoLoaded && (
              <div className="absolute inset-0 bg-[#1a2230] animate-pulse" aria-hidden />
            )}
            <img
              ref={imgRef}
              src={playerPhotoUrl}
              alt={player.ign}
              className={`w-full h-full object-cover object-top transition-opacity duration-150 ${
                photoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setPhotoLoaded(true)}
              onError={() => setPhotoError(true)}
            />
          </>
        ) : agentIconUrl && !agentError ? (
          <img
            src={agentIconUrl}
            alt={player.signatureAgent}
            className="w-full h-full object-cover p-0.5"
            referrerPolicy="no-referrer"
            onError={() => setAgentError(true)}
          />
        ) : (
          <span className="tracking-tighter">
            {player.ign.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      {showAgentBadge && player.signatureAgent && (
        <span
          title={player.signatureAgent}
          className="absolute -bottom-1 -right-1 px-1 rounded-[2px] bg-[#0b0e14] border border-white/20 text-xs leading-tight font-mono-vct text-slate-200"
        >
          {player.signatureAgent.slice(0, 3)}
        </span>
      )}
    </div>
  );
};
