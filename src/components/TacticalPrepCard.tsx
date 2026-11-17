import React from 'react';
import {
  Crosshair,
  Shield,
  Scale,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  Sparkles,
  Check,
} from 'lucide-react';
import { Difficulty, SeriesMatch, SeriesTacticBuff, TacticalStance } from '../types';
import { generateOpponentScoutReport, TACTICAL_STANCES } from '../utils/scouting';
import { playSelectSound } from '../utils/audio';
import { Badge, Card, PrimaryButton } from './ui';

interface TacticalPrepCardProps {
  series: SeriesMatch;
  difficulty: Difficulty;
  selectedStance: TacticalStance;
  onSelectStance: (stance: TacticalStance) => void;
  activeSeriesBuff: SeriesTacticBuff;
  teamSynergy: number;
  onStartSeries: () => void;
}

const STANCE_ICON: Record<TacticalStance, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  aggressive: Crosshair,
  balanced: Scale,
  disciplined: Shield,
};

const BUFF_LABEL: Record<Exclude<SeriesTacticBuff, 'none'>, string> = {
  rating_boost: 'Analista ativo: +2 Força nesta série',
  pistol_prep: 'Plano de Pistol: +5% Pistol/Forçado',
  clutch_prep: 'Treino de Retake: +5% Retake/Decider',
};

export const TacticalPrepCard: React.FC<TacticalPrepCardProps> = ({
  series,
  difficulty,
  selectedStance,
  onSelectStance,
  activeSeriesBuff,
  teamSynergy,
  onStartSeries,
}) => {
  const report = generateOpponentScoutReport(series.opponent, difficulty);
  const lowSynergyMasterPenalty = difficulty === 'master' && teamSynergy < 78;

  return (
    <Card id="tactical-prep-card" padding="md" className="space-y-4">
      {/* Scouting Header + Report */}
      <div className="rounded-[3px] bg-[#090c11] border border-white/10 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {report.visibility === 'blind' ? (
              <EyeOff className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Eye className="w-4 h-4 text-[#38bdf8] shrink-0" />
            )}
            <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-white">
              Scouting Pré-Série · {series.opponent.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {activeSeriesBuff !== 'none' && (
              <Badge tone="gold">
                <Sparkles className="w-3 h-3" />
                {BUFF_LABEL[activeSeriesBuff]}
              </Badge>
            )}
            <Badge
              tone={
                report.visibility === 'full'
                  ? 'green'
                  : report.visibility === 'partial'
                  ? 'gold'
                  : 'red'
              }
            >
              {report.visibility === 'full'
                ? 'Leitura Completa'
                : report.visibility === 'partial'
                ? 'Leitura Parcial'
                : 'Blind · Master'}
            </Badge>
          </div>
        </div>

        <p className="text-sm text-slate-100 leading-snug">{report.headline}</p>

        {report.recommendedReason && (
          <div className="text-xs font-mono-vct text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1.5 rounded-[2px] flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>Sugestão: {report.recommendedReason}</span>
          </div>
        )}

        {lowSynergyMasterPenalty && (
          <div className="text-xs font-mono-vct text-rose-300 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1.5 rounded-[2px]">
            Alerta Master: Química baixa ({teamSynergy}) gera -2% de coordenação em retakes.
          </div>
        )}

        {/* Opponent Roster Chips */}
        {report.rosterPreview.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/[0.06]">
            <span className="font-mono-vct text-[11px] uppercase text-slate-300 mr-1">
              Rival:
            </span>
            {report.rosterPreview.map((p, idx) => (
              <span
                key={`${p.ign}-${idx}`}
                className="text-xs font-mono-vct px-2 py-0.5 rounded-[2px] bg-[#11151d] border border-white/10 text-slate-200"
              >
                {p.ign}
                {p.agent ? <span className="text-slate-300"> · {p.agent}</span> : null}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3 One-Click Tactical Stances */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-slate-200">
            Postura Tática da Série
          </span>
          <span className="text-xs text-slate-300">Escolha 1 plano para os mapas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {TACTICAL_STANCES.map(stance => {
            const active = selectedStance === stance.id;
            const isRecommended = report.recommendedStance === stance.id;
            const StanceIcon = STANCE_ICON[stance.id];

            return (
              <button
                key={stance.id}
                id={`stance-${stance.id}-btn`}
                type="button"
                onClick={() => {
                  playSelectSound();
                  onSelectStance(stance.id);
                }}
                className={`text-left rounded-[3px] border p-3 transition-colors cursor-pointer relative ${
                  active
                    ? 'bg-[#171d29]'
                    : 'bg-[#0b0e14] border-white/10 hover:border-white/25 hover:bg-[#111620]'
                }`}
                style={
                  active
                    ? {
                        borderColor: stance.accentColor,
                        boxShadow: `0 0 18px -6px ${stance.accentColor}66`,
                      }
                    : undefined
                }
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 font-display text-xl leading-none text-white uppercase tracking-wide">
                    <StanceIcon className="w-4 h-4 shrink-0" style={{ color: stance.accentColor }} />
                    {stance.label}
                  </span>
                  {active ? (
                    <Check className="w-4 h-4 shrink-0" style={{ color: stance.accentColor }} />
                  ) : isRecommended ? (
                    <span className="font-mono-vct text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-[2px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/35">
                      Ideal
                    </span>
                  ) : null}
                </div>

                <span
                  className="font-mono-vct text-[11px] font-bold uppercase block mb-1.5"
                  style={{ color: stance.accentColor }}
                >
                  {stance.tag}
                </span>
                <p className="text-xs text-slate-100 font-medium leading-snug">{stance.summary}</p>
                <p className="text-[11px] text-slate-300 mt-1 leading-tight">{stance.tradeoff}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Start Series CTA */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10 flex-wrap">
        <span className="text-xs text-slate-300 font-mono-vct">
          Formato MD{series.bestOf} · O placar abre já com a postura selecionada.
        </span>
        <PrimaryButton
          id="start-series-prep-btn"
          size="md"
          onClick={() => {
            playSelectSound();
            onStartSeries();
          }}
          className="w-full sm:w-auto"
        >
          <span>Começar Série</span>
          <ArrowRight className="w-4 h-4" />
        </PrimaryButton>
      </div>
    </Card>
  );
};
