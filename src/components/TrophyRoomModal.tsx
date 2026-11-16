import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Calendar,
  Trash2,
  Crown,
  ShieldAlert,
  Flame,
  Star,
  Sparkles,
  Zap,
  Snowflake,
  Crosshair,
  Target,
  CheckCircle2,
  Lock,
  Medal,
} from 'lucide-react';
import { CampaignHistory, Achievement } from '../types';
import { evaluateAchievements } from '../data/achievements';
import { ROLE_NAMES_PT } from '../data/roleIcons';
import { playSelectSound } from '../utils/audio';
import { TeamLogo } from './TeamLogo';

interface TrophyRoomModalProps {
  history: CampaignHistory[];
  onClearHistory: () => void;
  onClose: () => void;
}

export const TrophyRoomModal: React.FC<TrophyRoomModalProps> = ({
  history,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'achievements'>('campaigns');
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const championshipsWon = history.filter(h => h.wonChampionship).length;
  const totalCampaigns = history.length;
  const winRate = totalCampaigns > 0 ? Math.round((championshipsWon / totalCampaigns) * 100) : 0;

  const achievements: Achievement[] = evaluateAchievements(history);
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  const getAchievementIcon = (iconName: string, isUnlocked: boolean) => {
    const className = `w-5 h-5 ${isUnlocked ? 'text-amber-400' : 'text-slate-500'}`;
    switch (iconName) {
      case 'Trophy':
        return <Trophy className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'ShieldAlert':
        return <ShieldAlert className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Star':
        return <Star className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Snowflake':
        return <Snowflake className={className} />;
      case 'Calendar':
        return <Calendar className={className} />;
      case 'Crosshair':
        return <Crosshair className={className} />;
      case 'Target':
        return <Target className={className} />;
      default:
        return <Medal className={className} />;
    }
  };

  const filteredAchievements = achievements.filter(a => {
    if (achievementFilter === 'unlocked') return a.isUnlocked;
    if (achievementFilter === 'locked') return !a.isUnlocked;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto my-6 space-y-6">
      {/* Trophy Header Banner (Tracker.gg Stat Dashboard) */}
      <div className="tracker-card p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Histórico Competitivo &amp; Recordes
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Sala de Troféus do Champions
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Registro oficial de títulos, campanhas e conquistas desbloqueadas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalCampaigns > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Deseja realmente limpar o histórico de campanhas?')) {
                    playSelectSound();
                    onClearHistory();
                  }
                }}
                className="px-3 py-1.5 rounded border border-rose-900/60 bg-[#160e13] hover:bg-[#20121a] text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Limpar Histórico</span>
              </button>
            )}
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#222f42]">
          <div className="tracker-subcard p-3.5 text-center">
            <span className="text-[11px] uppercase text-slate-400 font-semibold block mb-1">Títulos VCT</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
              {championshipsWon}
            </span>
          </div>

          <div className="tracker-subcard p-3.5 text-center">
            <span className="text-[11px] uppercase text-slate-400 font-semibold block mb-1">Torneios Disputados</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
              {totalCampaigns}
            </span>
          </div>

          <div className="tracker-subcard p-3.5 text-center">
            <span className="text-[11px] uppercase text-slate-400 font-semibold block mb-1">Taxa de Títulos</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
              {winRate}%
            </span>
          </div>

          <div className="tracker-subcard p-3.5 text-center">
            <span className="text-[11px] uppercase text-slate-400 font-semibold block mb-1">Conquistas VCT</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tabular-nums">
              {unlockedCount}/{achievements.length}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Tracker Horizontal Underline) */}
      <div className="flex items-center justify-between border-b border-[#222f42] pb-1 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playSelectSound();
              setActiveTab('campaigns');
            }}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'campaigns'
                ? 'border-[#ff4655] text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Campanhas ({history.length})</span>
          </button>

          <button
            onClick={() => {
              playSelectSound();
              setActiveTab('achievements');
            }}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'achievements'
                ? 'border-[#ff4655] text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Medal className="w-4 h-4 text-amber-400" />
            <span>Conquistas ({unlockedCount}/{achievements.length})</span>
          </button>
        </div>

        {/* Tab 2 Filter Shortcuts */}
        {activeTab === 'achievements' && (
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setAchievementFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                achievementFilter === 'all'
                  ? 'bg-[#1e2a3b] text-white font-bold border border-[#2e3e57]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({achievements.length})
            </button>
            <button
              onClick={() => setAchievementFilter('unlocked')}
              className={`px-2.5 py-1 rounded transition-colors ${
                achievementFilter === 'unlocked'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Desbloqueadas ({unlockedCount})
            </button>
            <button
              onClick={() => setAchievementFilter('locked')}
              className={`px-2.5 py-1 rounded transition-colors ${
                achievementFilter === 'locked'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bloqueadas ({achievements.length - unlockedCount})
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Campaigns List */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="tracker-card p-8 text-center text-slate-400 text-xs">
              Nenhuma campanha registrada ainda. Monte seu elenco no modo Draft e dispute o torneio para salvar seus resultados aqui!
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(camp => (
                <div
                  key={camp.id}
                  className={`tracker-card p-4 transition-colors ${
                    camp.wonChampionship
                      ? 'border-amber-500/40 bg-[#16212e]'
                      : 'border-[#222f42]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#1f2c3f]">
                    <div className="flex items-center gap-2">
                      {camp.wonChampionship ? (
                        <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center gap-1 border border-amber-500/30">
                          <Trophy className="w-3.5 h-3.5" /> Campeão VCT
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded bg-[#101722] text-slate-300 text-xs font-semibold border border-[#222f42]">
                          Eliminado: {camp.stageReached.toUpperCase()}
                        </span>
                      )}

                      <span className="text-xs text-slate-400">
                        • {camp.date} • Dificuldade: {camp.difficulty}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {camp.mvp && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1 font-bold">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>MVP: {camp.mvp} {camp.mvpDetails ? `(${camp.mvpDetails.acs} ACS)` : ''}</span>
                        </span>
                      )}
                      <span className="text-slate-300">
                        Rating da Equipe: <strong className="text-white font-mono">{camp.overallRating} OVR</strong>
                      </span>
                    </div>
                  </div>

                  {/* 5 Roster Players with Team Logos */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {camp.lineup.map((p, pIdx) => {
                      const isMvp = camp.mvp === p.ign;
                      return (
                        <div
                          key={pIdx}
                          className={`tracker-subcard p-2 text-xs transition-colors ${
                            isMvp
                              ? 'border-amber-500/50 bg-[#192434]'
                              : 'border-[#1c2738]'
                          }`}
                        >
                          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                            <span className="flex items-center gap-1 font-semibold">
                              {ROLE_NAMES_PT[p.role] || p.role}
                              {isMvp && <Award className="w-3 h-3 text-amber-400" />}
                            </span>
                            <span className="text-amber-400 font-bold font-mono">{p.rating}</span>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className={`font-bold block truncate ${isMvp ? 'text-amber-300' : 'text-white'}`}>
                              {p.ign}
                            </span>
                            {p.traitName && (
                              <span className="text-[9px] px-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 truncate shrink-0">
                                {p.traitName}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <TeamLogo teamName={p.team} size="xs" />
                            <span className="truncate">{p.team} ({p.year})</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Achievements Gallery */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredAchievements.map(ach => (
              <div
                key={ach.id}
                className={`tracker-card p-4 transition-colors flex items-start gap-3.5 ${
                  ach.isUnlocked
                    ? 'border-amber-500/40 bg-[#16212e]'
                    : 'border-[#1f2c3f] opacity-65 bg-[#101722]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded flex items-center justify-center shrink-0 border ${
                    ach.isUnlocked
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-[#0c1219] border-[#1c2738] text-slate-500'
                  }`}
                >
                  {getAchievementIcon(ach.icon, ach.isUnlocked)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className={`text-sm font-bold truncate ${ach.isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                      {ach.title}
                    </h4>
                    {ach.isUnlocked ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Desbloqueado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-[#0d141e] px-1.5 py-0.2 rounded border border-[#1b2738] shrink-0">
                        <Lock className="w-3 h-3" />
                        Bloqueado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">
                    {ach.description}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-[#1c2738] text-[10px] font-mono-vct">
                    <span className={ach.isUnlocked ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                      Progresso: {ach.progressText}
                    </span>
                    {ach.rewardLabel && (
                      <span className="text-amber-400/90 font-semibold">
                        🏅 {ach.rewardLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
