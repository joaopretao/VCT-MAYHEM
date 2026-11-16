import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { AGENT_ICONS } from '../data/agentIcons';
import { getPlayerPhotoUrl } from '../data/playerPhotos';

interface PlayerAvatarProps {
  player: Player;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showAgentBadge?: boolean;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  size = 'md',
  showAgentBadge = false,
}) => {
  const [photoError, setPhotoError] = useState(false);
  const [agentError, setAgentError] = useState(false);

  useEffect(() => {
    setPhotoError(false);
    setAgentError(false);
  }, [player.id, player.ign]);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  };

  const playerPhotoUrl = getPlayerPhotoUrl(player.ign);
  const agentIconUrl = player.signatureAgent ? AGENT_ICONS[player.signatureAgent] : null;

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={`${sizeClasses[size]} rounded-[3px] overflow-hidden bg-[#0d1118] border border-white/15 flex items-center justify-center font-vct font-bold text-[#e2b714] relative`}
      >
        {playerPhotoUrl && !photoError ? (
          <img
            src={playerPhotoUrl}
            alt={player.ign}
            className="w-full h-full object-cover object-top"
            loading="lazy"
            onError={() => setPhotoError(true)}
          />
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
