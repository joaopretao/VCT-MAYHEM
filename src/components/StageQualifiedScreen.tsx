import React from 'react';
import { ArrowRight, Award } from 'lucide-react';
import {
  IntermissionShopOffer,
  Lineup,
  MayhemBonus,
  Player,
  Role,
  SeriesTacticBuff,
  TournamentMvpStats,
  TournamentStage,
  UserTeamIdentity,
} from '../types';
import { playVictoryFanfare, playSelectSound } from '../utils/audio';
import { ROLE_ORDER } from './roleOrder';
import { ROLE_COLORS, ROLE_NAMES_PT } from '../data/roleIcons';
import { PlayerAvatar } from './PlayerAvatar';
import { TraitBadge } from './TraitBadge';
import { TeamCrest, DEFAULT_TEAM_IDENTITY } from './TeamCrest';
import { IntermissionShop } from './IntermissionShop';
import { Card, PrimaryButton } from './ui';

interface StageQualifiedScreenProps {
  stage: TournamentStage;
  lineup?: Lineup;
  teamIdentity?: UserTeamIdentity;
  opponentName?: string;
  scoreLabel?: string;
  seriesMvp?: TournamentMvpStats | null;
  credits?: number;
  lastEarnedCredits?: number;
  shopOffer?: IntermissionShopOffer | null;
  selectedBonuses?: MayhemBonus[];
  activeSeriesBuff?: SeriesTacticBuff;
  onSwapPlayer?: (newPlayer: Player, targetRole: Role) => void;
  onBuyBonus?: (bonus: MayhemBonus) => void;
  onRerollBonus?: () => void;
  onBuyTacticBuff?: (buffId: SeriesTacticBuff, cost: number) => void;
  onNextStage: () => void;
}

const STAGE_COPY: Record<TournamentStage, { tag: string; title: string; next: string }> = {
  group: { tag: 'Fase de Grupos', title: 'Passou. Próxima: Quartas.', next: 'Ir pras Quartas' },
  quarters: { tag: 'Quartas de Final', title: 'Nas Semis.', next: 'Ir pras Semis' },
  semis: { tag: 'Semifinal', title: 'Na Grande Final.', next: 'Disputar a Final' },
  finals: { tag: 'Grande Final', title: 'Campeão.', next: 'Continuar' },
};

export const StageQualifiedScreen: React.FC<StageQualifiedScreenProps> = ({
  stage,
  lineup,
  teamIdentity = DEFAULT_TEAM_IDENTITY,
  opponentName,
  scoreLabel,
  seriesMvp,
  credits = 0,
  lastEarnedCredits = 0,
  shopOffer = null,
  selectedBonuses = [],
  activeSeriesBuff = 'none',
  onSwapPlayer,
  onBuyBonus,
  onRerollBonus,
  onBuyTacticBuff,
  onNextStage,
}) => {
  React.useEffect(() => {
    playVictoryFanfare();
  }, []);

  const copy = STAGE_COPY[stage];

  return (
    <div className="min-h-[58vh] flex flex-col items-center justify-center p-3 sm:p-5 text-center animate-in fade-in duration-200">
      <Card
        padding="lg"
        cutCorner
        className={`border-emerald-500/35 ${
          shopOffer ? 'max-w-3xl' : 'max-w-xl'
        } w-full flex flex-col items-center animate-popIn relative overflow-hidden`}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-emerald-400" aria-hidden />

        <div className="flex items-center gap-2 mb-1">
          <TeamCrest emblemId={teamIdentity.emblemId} color={teamIdentity.color} size="xs" />
          <span className="font-mono-vct text-xs font-bold uppercase tracking-widest text-emerald-400">
            {teamIdentity.name} · {copy.tag}
          </span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-display font-bold uppercase text-white tracking-wide mb-2 leading-none">
          {copy.title}
        </h2>

        {opponentName && (
          <p className="text-sm text-slate-300 mb-4">
            {scoreLabel ? `${scoreLabel} ` : ''}em cima de <strong className="text-white">{opponentName}</strong>.
          </p>
        )}

        {/* Lineup showcase with real player portraits */}
        {lineup && (
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full mb-4">
            {ROLE_ORDER.map(role => {
              const p = lineup[role];
              if (!p) return null;
              const isSeriesMvp = seriesMvp?.player.id === p.id;
              return (
                <div
                  key={role}
                  className={`surface-sub p-1.5 sm:p-2 flex flex-col items-center gap-1 border-b-2 ${
                    isSeriesMvp ? 'border-[#e2b714]' : ''
                  }`}
                  style={{ borderBottomColor: isSeriesMvp ? '#e2b714' : ROLE_COLORS[role] }}
                >
                  <PlayerAvatar player={p} size="sm" />
                  <span className="text-xs font-bold text-white truncate max-w-full">
                    {p.ign}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Series MVP Highlight (embedded directly so there is no extra modal) */}
        {seriesMvp && (
          <div
            id="series-mvp-highlight"
            className="w-full rounded-[3px] bg-[#090c11] border border-[#e2b714]/40 p-3 mb-5 text-left flex items-center justify-between gap-3 flex-wrap"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <PlayerAvatar player={seriesMvp.player} size="md" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs font-mono-vct font-bold uppercase tracking-wider text-[#e2b714]">
                    <Award className="w-3.5 h-3.5" />
                    MVP da Série
                  </span>
                  <span className="text-xs font-mono-vct text-slate-300">
                    · {ROLE_NAMES_PT[seriesMvp.player.primaryRole]}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <strong className="font-display text-xl leading-none text-white tracking-wide">
                    {seriesMvp.player.ign}
                  </strong>
                  {seriesMvp.player.trait && <TraitBadge trait={seriesMvp.player.trait} iconOnly size="xs" />}
                  <span className="text-xs text-slate-300 truncate">{seriesMvp.player.signatureAgent}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono-vct text-xs bg-[#11151d] px-2.5 py-1.5 rounded-[3px] border border-white/10 shrink-0">
              <div className="text-center">
                <span className="text-[10px] uppercase text-slate-300 block leading-none">ACS</span>
                <strong className="text-sm text-amber-400">{seriesMvp.acs}</strong>
              </div>
              <div className="w-px h-6 bg-white/10" aria-hidden />
              <div className="text-center">
                <span className="text-[10px] uppercase text-slate-300 block leading-none">K/D</span>
                <strong className="text-sm text-emerald-400">{seriesMvp.kdRatio}</strong>
              </div>
              <div className="w-px h-6 bg-white/10" aria-hidden />
              <div className="text-center">
                <span className="text-[10px] uppercase text-slate-300 block leading-none">Clutch</span>
                <strong className="text-sm text-sky-400">{seriesMvp.clutchesWon}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Balatro-style Compact Intermission Shop */}
        {shopOffer && lineup && onSwapPlayer && onBuyBonus && onRerollBonus && onBuyTacticBuff && (
          <div className="w-full mb-5">
            <IntermissionShop
              credits={credits}
              lastEarned={lastEarnedCredits}
              offer={shopOffer}
              lineup={lineup}
              selectedBonuses={selectedBonuses}
              activeSeriesBuff={activeSeriesBuff}
              onSwapPlayer={onSwapPlayer}
              onBuyBonus={onBuyBonus}
              onRerollBonus={onRerollBonus}
              onBuyTacticBuff={onBuyTacticBuff}
            />
          </div>
        )}

        <PrimaryButton
          id="next-stage-btn"
          size="lg"
          onClick={() => {
            playSelectSound();
            onNextStage();
          }}
        >
          <span>{copy.next}</span>
          <ArrowRight className="w-4 h-4" />
        </PrimaryButton>
      </Card>
    </div>
  );
};
