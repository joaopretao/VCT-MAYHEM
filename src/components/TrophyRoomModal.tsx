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
  Zap,
  Snowflake,
  Crosshair,
  Target,
  CheckCircle2,
  Lock,
  Medal,
} from 'lucide-react';
import { CampaignHistory, Achievement, PlayerRecords, CardFrameId } from '../types';
import { evaluateAchievements } from '../data/achievements';
import { CARD_FRAMES, getUnlockedFrameIds } from '../data/frames';
import { getRunRuleMeta } from '../utils/runRules';
import { ROLE_NAMES_PT } from '../data/roleIcons';
import { playSelectSound } from '../utils/audio';
import { buildRecordsFromCampaigns, getMostUsedBonus } from '../utils/records';
import { TeamLogo } from './TeamLogo';
import { TeamCrest } from './TeamCrest';
import { MayhemBonusChip } from './MayhemBonusChip';
import { Card } from './ui';

interface TrophyRoomModalProps {
  history: CampaignHistory[];
  records?: PlayerRecords;
  equippedFrameId?: CardFrameId;
  onSelectFrame?: (frameId: CardFrameId) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

const STAGE_NAMES_PT: Record<string, string> = {
  group: 'Grupos',
  quarters: 'Quartas',
  semis: 'Semis',
  finals: 'Final',
};

const DIFFICULTY_NAMES_PT: Record<string, string> = {
  normal: 'Normal',
  hard: 'Difícil',
  master: 'Master',
};

export const TrophyRoomModal: React.FC<TrophyRoomModalProps> = ({
  history,
  records,
  equippedFrameId = 'default',
  onSelectFrame,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'achievements'>('campaigns');
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const resolvedRecords = records && records.runsPlayed > 0 ? records : buildRecordsFromCampaigns(history);
  const mostUsedBonus = getMostUsedBonus(resolvedRecords);

  const championshipsWon = history.filter(h => h.wonChampionship).length;
  const totalCampaigns = history.length;
  const winRate = totalCampaigns > 0 ? Math.round((championshipsWon / totalCampaigns) * 100) : 0;

  const achievements: Achievement[] = evaluateAchievements(history);
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const unlockedFrameIds = getUnlockedFrameIds(achievements);

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
      case 'Sparkles':
        return <Star className={className} />;
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
    <div className="max-w-4xl mx-auto my-4 space-y-5">
      {/* Header Banner */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="vct-slash h-8" aria-hidden />
            <div>
              <span className="text-xs font-mono-vct font-bold text-[#e2b714] uppercase tracking-wider block">
                Histórico
              </span>
              <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wide leading-none">
                Sala de Troféus
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Campanhas jogadas, campeões e conquistas desbloqueadas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalCampaigns > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Limpar todo o histórico de campanhas?')) {
                    playSelectSound();
                    onClearHistory();
                  }
                }}
                className="px-3 py-1.5 rounded-[3px] border border-rose-500/35 bg-[#170c10] hover:bg-rose-950/50 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Limpar histórico</span>
              </button>
            )}
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/[0.08]">
          <div className="surface-sub p-3 text-center">
            <span className="text-xs uppercase text-slate-300 font-semibold block mb-1">Títulos</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono-vct tabular-nums">
              {championshipsWon}
            </span>
          </div>

          <div className="surface-sub p-3 text-center">
            <span className="text-xs uppercase text-slate-300 font-semibold block mb-1">Campanhas</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono-vct tabular-nums">
              {totalCampaigns}
            </span>
          </div>

          <div className="surface-sub p-3 text-center">
            <span className="text-xs uppercase text-slate-300 font-semibold block mb-1">Aproveitamento</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono-vct tabular-nums">
              {winRate}%
            </span>
          </div>

          <div className="surface-sub p-3 text-center">
            <span className="text-xs uppercase text-slate-300 font-semibold block mb-1">Conquistas</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono-vct tabular-nums">
              {unlockedCount}/{achievements.length}
            </span>
          </div>
        </div>

        {/* Personal Records Section ("Seu histórico") */}
        <div
          id="player-records-section"
          className="mt-4 pt-4 border-t border-white/[0.08]"
        >
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-mono-vct font-bold uppercase tracking-wider text-[#e2b714]">
              Seu histórico · Recordes Salvos
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="surface-sub px-3 py-2 text-center">
              <span className="text-xs text-slate-300 block">Runs jogadas</span>
              <strong className="text-sm sm:text-base font-mono-vct text-white">
                {resolvedRecords.runsPlayed}
              </strong>
            </div>
            <div className="surface-sub px-3 py-2 text-center">
              <span className="text-xs text-slate-300 block">Títulos</span>
              <strong className="text-sm sm:text-base font-mono-vct text-amber-400">
                {resolvedRecords.titles}
              </strong>
            </div>
            <div className="surface-sub px-3 py-2 text-center">
              <span className="text-xs text-slate-300 block">Melhor sequência</span>
              <strong className="text-sm sm:text-base font-mono-vct text-emerald-400">
                {resolvedRecords.bestStreak}
              </strong>
            </div>
            <div className="surface-sub px-3 py-2 text-center">
              <span className="text-xs text-slate-400 block">Melhor OVR</span>
              <strong className="text-sm sm:text-base font-mono-vct text-sky-400">
                {resolvedRecords.bestOverallRating > 0 ? `${resolvedRecords.bestOverallRating} OVR` : '--'}
              </strong>
            </div>
            <div className="col-span-2 sm:col-span-1 surface-sub px-3 py-2 text-center">
              <span className="text-xs text-slate-400 block">Bônus mais usado</span>
              <strong className="text-xs sm:text-sm font-mono-vct text-white truncate block">
                {mostUsedBonus ? `${mostUsedBonus.name} (${mostUsedBonus.count}x)` : '--'}
              </strong>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-1 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playSelectSound();
              setActiveTab('campaigns');
            }}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
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
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'achievements'
                ? 'border-[#ff4655] text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Medal className="w-4 h-4 text-amber-400" />
            <span>Conquistas ({unlockedCount}/{achievements.length})</span>
          </button>
        </div>

        {activeTab === 'achievements' && (
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setAchievementFilter('all')}
              className={`px-2.5 py-1 rounded-[2px] transition-colors cursor-pointer ${
                achievementFilter === 'all'
                  ? 'bg-[#1e2531] text-white font-bold border border-white/15'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({achievements.length})
            </button>
            <button
              onClick={() => setAchievementFilter('unlocked')}
              className={`px-2.5 py-1 rounded-[2px] transition-colors cursor-pointer ${
                achievementFilter === 'unlocked'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Desbloqueadas ({unlockedCount})
            </button>
            <button
              onClick={() => setAchievementFilter('locked')}
              className={`px-2.5 py-1 rounded-[2px] transition-colors cursor-pointer ${
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

      {/* Tab 1: Campaigns */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <Card padding="lg" className="text-center text-slate-400 text-sm">
              Nenhuma campanha salva ainda. Fecha uma line no Mayhem e joga o torneio pra registrar aqui.
            </Card>
          ) : (
            <div className="space-y-3">
              {history.map(camp => (
                <Card
                  key={camp.id}
                  padding="md"
                  className={camp.wonChampionship ? 'border-amber-500/40' : ''}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/[0.07]">
                    <div className="flex items-center gap-2 flex-wrap">
                      {camp.teamName && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#0b0e14] border border-white/10 text-xs font-bold text-white uppercase">
                          <TeamCrest
                            emblemId={camp.teamEmblemId}
                            color={camp.teamColor}
                            size="xs"
                          />
                          <span>{camp.teamName}</span>
                        </span>
                      )}
                      {camp.wonChampionship ? (
                        <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center gap-1 border border-amber-500/35">
                          <Trophy className="w-3.5 h-3.5" /> Campeão
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-[2px] bg-[#0b0e14] text-slate-300 text-xs font-semibold border border-white/10">
                          Caiu: {STAGE_NAMES_PT[camp.stageReached] || camp.stageReached}
                        </span>
                      )}

                      <span className="text-xs text-slate-300">
                        {camp.date} · {DIFFICULTY_NAMES_PT[camp.difficulty] || camp.difficulty}
                      </span>
                      {camp.runRule && camp.runRule !== 'standard' && (
                        <span className="font-mono-vct text-[11px] font-bold px-2 py-0.5 rounded-[2px] bg-[#0b0e14] border border-white/15 text-[#e2b714]">
                          {getRunRuleMeta(camp.runRule).label}
                        </span>
                      )}
                      {camp.isDaily && (
                        <span className="font-mono-vct text-[11px] font-bold px-2 py-0.5 rounded-[2px] bg-[#e2b714]/15 border border-[#e2b714]/40 text-[#fde047]">
                          Diário
                        </span>
                      )}
                      {camp.seed && (
                        <span className="font-mono-vct text-[11px] text-slate-300">
                          Seed: {camp.seed}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {camp.mvp && (
                        <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1 font-bold">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>MVP: {camp.mvp} {camp.mvpDetails ? `(${camp.mvpDetails.acs} ACS)` : ''}</span>
                        </span>
                      )}
                      <span className="text-slate-300 font-mono-vct">
                        Elenco: <strong className="text-white">{camp.overallRating} OVR</strong>
                      </span>
                    </div>
                  </div>

                  {/* 5 Roster Players */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {camp.lineup.map((p, pIdx) => {
                      const isMvp = camp.mvp === p.ign;
                      return (
                        <div
                          key={pIdx}
                          className={`surface-sub p-2.5 text-xs ${
                            isMvp ? 'border-amber-500/45' : ''
                          }`}
                        >
                          <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                            <span className="flex items-center gap-1 font-semibold">
                              {ROLE_NAMES_PT[p.role] || p.role}
                              {isMvp && <Award className="w-3 h-3 text-amber-400" />}
                            </span>
                            <span className="text-amber-400 font-bold font-mono-vct">{p.rating}</span>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className={`font-bold block truncate text-sm ${isMvp ? 'text-amber-300' : 'text-white'}`}>
                              {p.ign}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <TeamLogo teamName={p.team} size="xs" />
                            <span className="truncate">{p.team} '{p.year.toString().slice(2)}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Optional Roguelike Bonuses & Run Summary (backward compatible with legacy saves) */}
                  {(camp.bonuses?.length || camp.runSummary) && (
                    <div className="mt-3 pt-2.5 border-t border-white/[0.07] space-y-2">
                      {camp.bonuses && camp.bonuses.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono-vct text-xs text-slate-400 uppercase font-bold mr-1">
                            Bônus:
                          </span>
                          {camp.bonuses.map(b => (
                            <MayhemBonusChip
                              key={b.id}
                              id={b.id}
                              name={b.name}
                              rarity={b.rarity}
                              subtitle={b.usageText}
                              compact
                            />
                          ))}
                        </div>
                      )}
                      {camp.runSummary && (
                        <p className="text-xs text-slate-300 leading-snug">
                          {camp.runSummary}
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Unlockable Card Frames + Achievements */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {onSelectFrame && (
            <Card id="unlockable-frames-section" padding="md" className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-[#e2b714] block">
                    Personalização por Conquista
                  </span>
                  <h3 className="font-display text-2xl leading-none text-white uppercase tracking-wide">
                    Molduras do Card ({unlockedFrameIds.size}/{CARD_FRAMES.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-300">
                  Aplicada no lobby e no cartão PNG compartilhável
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {CARD_FRAMES.map(frame => {
                  const isUnlocked = unlockedFrameIds.has(frame.id);
                  const isEquipped = equippedFrameId === frame.id;
                  return (
                    <button
                      key={frame.id}
                      id={`frame-option-${frame.id}`}
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => {
                        if (!isUnlocked) return;
                        playSelectSound();
                        onSelectFrame(frame.id);
                      }}
                      className={`relative text-left p-3 rounded-[3px] border bg-[#0b0e14] transition-colors overflow-hidden ${
                        isEquipped
                          ? 'bg-[#141b27]'
                          : isUnlocked
                          ? 'hover:bg-[#121722] cursor-pointer'
                          : 'opacity-55 cursor-not-allowed'
                      }`}
                      style={{
                        borderColor: isEquipped
                          ? frame.accentColor
                          : isUnlocked
                          ? frame.borderColor
                          : 'rgba(255,255,255,0.08)',
                        boxShadow: isEquipped ? frame.glowShadow : 'none',
                      }}
                    >
                      <div
                        className="absolute inset-x-0 top-0 h-[3px]"
                        style={{ background: frame.topStripGradient }}
                        aria-hidden
                      />
                      <div className="flex items-center justify-between gap-2 mb-1 pt-0.5">
                        <span className="font-bold text-sm text-white truncate">{frame.name}</span>
                        {isEquipped ? (
                          <span className="text-[11px] font-mono-vct font-bold px-1.5 py-0.5 rounded-[2px] bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                            Equipada
                          </span>
                        ) : isUnlocked ? (
                          <span className="text-[11px] font-mono-vct font-bold text-slate-200">
                            Equipar
                          </span>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">{frame.description}</p>
                      {!isUnlocked && (
                        <span className="text-[11px] font-mono-vct text-amber-300 block mt-1.5">
                          {frame.unlockHint}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredAchievements.map(ach => (
            <Card
              key={ach.id}
              padding="md"
              className={`flex items-start gap-3.5 ${
                ach.isUnlocked ? 'border-amber-500/40' : 'opacity-65'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-[3px] flex items-center justify-center shrink-0 border ${
                  ach.isUnlocked
                    ? 'bg-amber-500/15 border-amber-500/35 text-amber-400'
                    : 'bg-[#0b0e14] border-white/10 text-slate-500'
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
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-[2px] border border-emerald-500/30 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      Feito
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-slate-400 bg-[#0b0e14] px-1.5 py-0.5 rounded-[2px] border border-white/10 shrink-0">
                      <Lock className="w-3 h-3" />
                      Bloqueada
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {ach.description}
                </p>
                <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-white/[0.06] text-xs font-mono-vct">
                  <span className={ach.isUnlocked ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                    {ach.progressText}
                  </span>
                  {ach.rewardLabel && (
                    <span className="text-amber-400 font-semibold">
                      {ach.rewardLabel}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};
