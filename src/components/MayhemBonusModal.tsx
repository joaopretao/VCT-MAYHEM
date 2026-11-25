import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Difficulty, Lineup, MayhemBonus } from '../types';
import { BONUS_RARITY_META } from '../data/mayhemBonuses';
import { calculateTeamStats } from '../utils/simulation';
import { MayhemBonusIconSvg } from './MayhemBonusChip';
import { Card } from './ui';

interface MayhemBonusModalProps {
  choices: MayhemBonus[];
  stepNumber: 1 | 2;
  lineup?: Lineup;
  selectedBonuses?: MayhemBonus[];
  difficulty?: Difficulty;
  onSelect: (bonus: MayhemBonus) => void;
}

export const MayhemBonusModal: React.FC<MayhemBonusModalProps> = ({
  choices,
  stepNumber,
  lineup,
  selectedBonuses = [],
  difficulty = 'normal',
  onSelect,
}) => {
  const baselineStats = lineup ? calculateTeamStats(lineup, selectedBonuses) : null;
  const hidePreviewNumbers = difficulty === 'master';
  const showClutchPreview = difficulty === 'normal';
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.key === '1' && choices[0]) {
        e.preventDefault();
        onSelect(choices[0]);
      } else if (e.key === '2' && choices[1]) {
        e.preventDefault();
        onSelect(choices[1]);
      } else if (e.key === '3' && choices[2]) {
        e.preventDefault();
        onSelect(choices[2]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [choices, onSelect]);

  return (
    <div
      id="mayhem-bonus-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mayhem-bonus-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-4xl my-auto"
      >
        <Card variant="modal" padding="none" cutCorner className="p-3.5 sm:p-6 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-[#ff4655]" aria-hidden />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 sm:mb-5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="vct-slash h-6 sm:h-7" aria-hidden />
              <div>
                <span className="font-mono-vct text-xs font-bold uppercase tracking-widest text-[#e2b714] block">
                  Roguelike · Bônus {stepNumber} de 2
                </span>
                <h2
                  id="mayhem-bonus-modal-title"
                  className="font-display text-2xl sm:text-4xl leading-none text-white uppercase tracking-wide"
                >
                  ESCOLHA UM BÔNUS MAYHEM
                </h2>
              </div>
            </div>

            <span className="font-mono-vct text-xs text-slate-300 bg-[#0b0e14] border border-white/10 px-2.5 py-1 rounded-[2px] w-fit">
              <span className="hidden sm:inline">Clique ou aperte 1, 2 ou 3</span>
              <span className="sm:hidden">Toque em 1 bônus para seguir</span>
            </span>
          </div>

          {/* 3 Bonus Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-4">
            {choices.map((bonus, idx) => {
              const meta = BONUS_RARITY_META[bonus.rarity];
              const hotkey = idx + 1;
              const projectedStats =
                lineup && baselineStats && !hidePreviewNumbers
                  ? calculateTeamStats(lineup, [...selectedBonuses, bonus])
                  : null;
              const synDelta =
                projectedStats && baselineStats
                  ? projectedStats.synergy - baselineStats.synergy
                  : 0;
              const clutchDelta =
                projectedStats && baselineStats
                  ? projectedStats.clutch - baselineStats.clutch
                  : 0;

              return (
                <motion.button
                  key={bonus.id}
                  id={`mayhem-bonus-card-${idx}`}
                  type="button"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: idx * 0.05,
                    duration: 0.18,
                    ease: 'easeOut',
                  }}
                  onClick={() => onSelect(bonus)}
                  className="group relative text-left rounded-[4px] border bg-[#11151d] hover:bg-[#161c27] active:bg-[#1a212e] p-3.5 sm:p-5 flex flex-row md:flex-col items-center md:items-stretch justify-between gap-3 sm:gap-4 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/60 overflow-hidden"
                  style={{
                    borderColor: meta.borderColor,
                    boxShadow: meta.glowShadow,
                  }}
                >
                  {/* Top/Left Rarity Accent Strip */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px] hidden md:block"
                    style={{ backgroundColor: meta.color }}
                    aria-hidden
                  />
                  <div
                    className="absolute top-0 bottom-0 left-0 w-[3px] md:hidden"
                    style={{ backgroundColor: meta.color }}
                    aria-hidden
                  />

                  {/* Icon + Rarity Header */}
                  <div className="flex md:items-center md:justify-between gap-3 shrink-0">
                    <div
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-[3px] border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: meta.bgTint,
                        borderColor: meta.borderColor,
                      }}
                    >
                      <MayhemBonusIconSvg
                        icon={bonus.icon}
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        color={meta.color}
                      />
                    </div>

                    <div className="hidden md:flex items-center gap-1.5">
                      <span
                        className="font-mono-vct text-xs font-bold uppercase px-2 py-0.5 rounded-[2px] border"
                        style={{
                          backgroundColor: meta.bgTint,
                          borderColor: meta.borderColor,
                          color: meta.textColor,
                        }}
                      >
                        {meta.label}
                      </span>
                      <span className="font-mono-vct text-xs font-bold px-2 py-0.5 rounded-[2px] bg-[#0b0e14] border border-white/15 text-slate-300 group-hover:text-white">
                        {hotkey}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 md:hidden">
                      <span
                        className="font-mono-vct text-xs font-bold uppercase"
                        style={{ color: meta.textColor }}
                      >
                        {meta.label}
                      </span>
                      <span className="font-mono-vct text-xs font-bold px-1.5 py-0.5 rounded-[2px] bg-[#0b0e14] border border-white/15 text-slate-300">
                        {hotkey}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl leading-none text-white uppercase tracking-wide truncate">
                      {bonus.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-200 leading-snug">
                      {bonus.description}
                    </p>

                    {/* Live Preview (Synergy X -> Y / Clutch / Rerolls), hidden on Master */}
                    {hidePreviewNumbers ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#0b0e14] border border-white/10 font-mono-vct text-xs text-slate-300">
                        Impacto exato oculto no Master
                      </div>
                    ) : baselineStats && projectedStats ? (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {synDelta !== 0 && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#0b0e14] border font-mono-vct text-xs font-bold ${
                              synDelta > 0
                                ? 'border-emerald-500/40 text-emerald-300'
                                : 'border-rose-500/40 text-rose-300'
                            }`}
                          >
                            <span>Química +{baselineStats.synergy}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>+{projectedStats.synergy}</span>
                          </span>
                        )}
                        {showClutchPreview && clutchDelta !== 0 && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#0b0e14] border font-mono-vct text-xs font-bold ${
                              clutchDelta > 0
                                ? 'border-amber-500/40 text-amber-300'
                                : 'border-rose-500/40 text-rose-300'
                            }`}
                          >
                            <span>Clutch {baselineStats.clutch}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>{projectedStats.clutch}</span>
                          </span>
                        )}
                        {synDelta === 0 && (!showClutchPreview || clutchDelta === 0) && bonus.modifiers.extraRerolls && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#0b0e14] border border-[#e2b714]/40 font-mono-vct text-xs font-bold text-[#e2b714]">
                            +{bonus.modifiers.extraRerolls} Rerolls na hora
                          </span>
                        )}
                        {synDelta === 0 && (!showClutchPreview || clutchDelta === 0) && bonus.modifiers.zeroRerolls && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#0b0e14] border border-rose-500/40 font-mono-vct text-xs font-bold text-rose-300">
                            Rerolls zeram agora
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Action cue */}
                  <div className="hidden md:flex items-center justify-between pt-2.5 border-t border-white/[0.08] font-mono-vct text-xs font-bold uppercase tracking-wider">
                    <span style={{ color: meta.textColor }}>Escolher bônus</span>
                    <span className="text-slate-300 group-hover:text-white transition-colors">
                      [{hotkey}]
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
