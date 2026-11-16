import React from 'react';
import { Lineup, Role, Player } from '../types';
import { RoleEmblem } from './RoleEmblem';
import { ROLE_NAMES_PT, ROLE_COLORS } from '../data/roleIcons';
import { TeamLogo } from './TeamLogo';
import { calculateTeamStats } from '../utils/simulation';
import { playSelectSound } from '../utils/audio';
import { TraitBadge } from './TraitBadge';
import { Trophy, X, RotateCcw, Lock } from 'lucide-react';

interface TacticalMapBoardProps {
  lineup: Lineup;
  onRemovePlayer: (role: Role) => void;
  onInspectPlayer: (player: Player) => void;
  onClearLineup: () => void;
  onStartTournament: () => void;
}

interface NodePosition {
  role: Role;
  label: string;
  siteCallout: string;
  style: React.CSSProperties;
}

// 5 tactical positions on Ascent
const MAP_POSITIONS: NodePosition[] = [
  {
    role: 'Duelist',
    label: 'Duelista',
    siteCallout: 'Site A',
    style: { top: '23%', left: '33%' },
  },
  {
    role: 'Initiator',
    label: 'Iniciador',
    siteCallout: 'A Main',
    style: { top: '27%', left: '73%' },
  },
  {
    role: 'Controller',
    label: 'Controlador',
    siteCallout: 'Mid Link',
    style: { top: '49%', left: '48%' },
  },
  {
    role: 'Sentinel',
    label: 'Sentinela',
    siteCallout: 'Site B',
    style: { top: '78%', left: '33%' },
  },
  {
    role: 'Flex',
    label: 'Flex',
    siteCallout: 'B Main',
    style: { top: '74%', left: '73%' },
  },
];

export const TacticalMapBoard: React.FC<TacticalMapBoardProps> = ({
  lineup,
  onRemovePlayer,
  onInspectPlayer,
  onClearLineup,
  onStartTournament,
}) => {
  const stats = calculateTeamStats(lineup);
  const filledCount = Object.values(lineup).filter(p => p !== null).length;
  const isComplete = filledCount === 5;
  const [minimapSrc, setMinimapSrc] = React.useState('./ascent-minimap.png');

  return (
    <div className="w-full flex flex-col h-full tracker-card bg-[#151e29] border border-[#223042] overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="px-5 py-3.5 bg-[#1a2533] border-b border-[#223042] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-extrabold text-sm text-white tracking-wide uppercase">
            Mapa Tático · Ascent
          </span>
          <span className="text-xs font-mono-vct px-2 py-0.5 rounded-[2px] bg-[#0b0e14] text-slate-300 border border-white/10">
            5 Vagas
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-mono-vct">
            Escalação: <strong className="text-white font-bold">{filledCount}/5</strong>
          </div>
          {filledCount > 0 && (
            <button
              onClick={() => {
                playSelectSound();
                onClearLineup();
              }}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-[#131c28] hover:bg-[#1a2738] border border-[#223042]"
              title="Limpar todas as posições"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map Stage: Ascent Floorplan */}
      <div className="relative flex-1 min-h-[440px] sm:min-h-[480px] max-h-[520px] bg-[#07080b] overflow-hidden flex items-center justify-center">
        {/* Scenic Ascent Splash */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-[1px] pointer-events-none scale-105"
          style={{ backgroundImage: 'url(./ascent-splash.png), url(./public/ascent-splash.png)' }}
        />

        {/* Dark Scrim */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(7,8,11,0.3)_0%,_#07080b_90%)] pointer-events-none" />

        {/* Map Header Label */}
        <div className="absolute top-3 inset-x-0 flex flex-col items-center pointer-events-none z-10">
          <h3 className="text-base sm:text-lg font-black tracking-[0.25em] text-white uppercase drop-shadow-md">
            ASCENT
          </h3>
          <span className="text-xs uppercase tracking-wider text-slate-400 -mt-0.5">
            Posicionamento Competitivo
          </span>
        </div>

        {/* Ascent Minimap Container */}
        <div className="relative w-[340px] h-[340px] sm:w-[390px] sm:h-[390px] flex items-center justify-center">
          <img
            src={minimapSrc}
            onError={() => {
              if (minimapSrc === './ascent-minimap.png') {
                setMinimapSrc('./public/ascent-minimap.png');
              }
            }}
            alt="Ascent Minimap"
            className="w-full h-full object-contain filter drop-shadow-xl opacity-90 select-none pointer-events-none"
            loading="eager"
          />

          {/* Site A Callout Badge */}
          <div className="absolute top-[17%] left-[30%] -translate-x-1/2 pointer-events-none">
            <div className="px-2 py-0.5 rounded-[2px] bg-[#0b140f] border border-emerald-500/40 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Site A
            </div>
          </div>

          {/* Site B Callout Badge */}
          <div className="absolute top-[72%] left-[30%] -translate-x-1/2 pointer-events-none">
            <div className="px-2 py-0.5 rounded-[2px] bg-[#141008] border border-amber-500/40 text-xs font-bold text-amber-400 uppercase tracking-wider">
              Site B
            </div>
          </div>

          {/* Mid Callout Badge */}
          <div className="absolute top-[43%] left-[48%] -translate-x-1/2 pointer-events-none">
            <div className="px-2 py-0.5 rounded-[2px] bg-[#0b121a] border border-sky-500/40 text-xs font-semibold text-sky-400 uppercase tracking-wider">
              Mid
            </div>
          </div>

          {/* 5 Tactical Nodes */}
          {MAP_POSITIONS.map(({ role, label, siteCallout, style }) => {
            const player = lineup[role];
            const roleColor = ROLE_COLORS[role] || '#e61c24';

            return (
              <div
                key={role}
                style={style}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-150"
              >
                {player ? (
                  /* Filled Node */
                  <div className="group relative flex flex-col items-center">
                    {/* Quick Remove Button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        playSelectSound();
                        onRemovePlayer(role);
                      }}
                      title={`Remover ${player.ign}`}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow transition-transform hover:scale-110 z-30"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>

                    {/* Circular Token with Official Team Crest */}
                    <div
                      onClick={() => {
                        playSelectSound();
                        onInspectPlayer(player);
                      }}
                      className="w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full bg-[#07080a] border-2 shadow-xl flex items-center justify-center cursor-pointer transition-transform group-hover:scale-105 relative p-2"
                      style={{
                        borderColor: roleColor,
                        boxShadow: `0 0 16px ${roleColor}40`,
                      }}
                    >
                      {/* Prominent Team Logo */}
                      <div className="w-full h-full flex items-center justify-center">
                        <TeamLogo teamName={player.team} size={42} className="w-full h-full" />
                      </div>

                      {/* Mini Role Emblem in Corner */}
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#090a0d] border flex items-center justify-center shadow"
                        style={{ borderColor: roleColor }}
                      >
                        <RoleEmblem role={player.primaryRole} size="xs" />
                      </div>
                    </div>

                    {/* Compact Attached Badge (IGN + Team + Role) */}
                    <div
                      onClick={() => {
                        playSelectSound();
                        onInspectPlayer(player);
                      }}
                      className="mt-1 px-2.5 py-1 rounded bg-[#0d0e14] border border-[#1e202a] text-center shadow cursor-pointer group-hover:border-[#e61c24] transition-colors flex flex-col items-center min-w-[90px] max-w-[120px]"
                    >
                      <span className="text-xs font-extrabold text-white truncate max-w-[95px] group-hover:text-[#e61c24] transition-colors">
                        {player.ign}
                      </span>
                      {player.trait && (
                        <span
                          className="text-xs font-bold px-1 rounded-[2px] uppercase tracking-tight my-0.5"
                          style={{
                            color: player.trait.color,
                            backgroundColor: player.trait.badgeBg,
                            border: `1px solid ${player.trait.badgeBorder}`,
                          }}
                        >
                          {player.trait.badgeLabel}
                        </span>
                      )}
                      <div className="flex items-center gap-1 my-0.5">
                        <TeamLogo teamName={player.team} size="xs" />
                        <span className="text-xs font-medium text-slate-300 truncate max-w-[70px]">
                          {player.team}
                        </span>
                      </div>
                      <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: roleColor }}
                      >
                        {ROLE_NAMES_PT[role]}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Empty Node */
                  <div className="flex flex-col items-center group cursor-pointer">
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0a0b0e]/90 border-2 border-dashed flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-[#121319] shadow backdrop-blur-sm"
                      style={{ borderColor: `${roleColor}80` }}
                      title={`Vaga: ${label} (${siteCallout})`}
                    >
                      <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                        <RoleEmblem role={role} size="sm" />
                      </div>
                    </div>

                    <div className="mt-1 px-2 py-0.5 rounded-[2px] bg-[#0c0d12] border border-white/10 text-center">
                      <span
                        className="text-xs font-bold uppercase tracking-wider block"
                        style={{ color: roleColor }}
                      >
                        {ROLE_NAMES_PT[role]}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Lineup Traits Bar */}
      {(() => {
        const draftedWithTraits = Object.values(lineup).filter((p): p is Player => !!p?.trait);
        if (draftedWithTraits.length === 0) return null;
        return (
          <div className="px-5 py-2 bg-[#0d1118] border-t border-white/10 flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Traits ativos ({draftedWithTraits.length})
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {draftedWithTraits.map(p => (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5 bg-[#16202c] px-2 py-0.5 rounded border border-amber-500/30 shadow-sm"
                  title={`${p.ign} (${p.team}): ${p.trait?.name} - ${p.trait?.description}`}
                >
                  <TeamLogo teamName={p.team} size="xs" />
                  <span className="text-xs font-semibold text-white">{p.ign}</span>
                  <TraitBadge trait={p.trait} iconOnly size="xs" />
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Bottom Summary Bar & Start Tournament CTA */}
      <div className="px-5 py-3.5 bg-[#131b26] border-t border-[#223042] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-5 w-full sm:w-auto justify-around sm:justify-start">
          {/* Rating */}
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Overall</span>
            </div>
            <div className="text-xs font-semibold text-amber-300 mt-0.5">
              <span>Oculto</span>
            </div>
          </div>

          <div className="w-[1px] h-7 bg-white/10" />

          {/* Sinergia */}
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">
              Sinergia
            </div>
            <div className="text-base font-bold text-emerald-400 flex items-center gap-1 mt-0.5 font-mono-vct">
              <span>{stats.synergy ? `+${stats.synergy}` : '0'}</span>
            </div>
          </div>

          <div className="w-[1px] h-7 bg-white/10" />

          {/* Status */}
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">
              Status
            </div>
            <div className="text-xs font-bold text-slate-300 mt-1">
              {isComplete ? (
                <span className="text-emerald-400 flex items-center gap-1">5/5 Prontos</span>
              ) : (
                <span className="text-amber-400">{filledCount}/5 Escalados</span>
              )}
            </div>
          </div>
        </div>

        {/* Start Tournament Action Button */}
        {isComplete ? (
          <button
            id="start-tournament-btn"
            onClick={() => {
              playSelectSound();
              onStartTournament();
            }}
            className="w-full sm:w-auto px-7 py-2.5 rounded bg-[#ff4655] hover:bg-[#e03240] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Trophy className="w-4 h-4 fill-white" />
            <span>Iniciar Torneio VCT</span>
          </button>
        ) : (
          <div className="text-xs text-slate-400 text-center sm:text-right">
            Preencha os 5 atletas para disputar o Champions
          </div>
        )}
      </div>
    </div>
  );
};
