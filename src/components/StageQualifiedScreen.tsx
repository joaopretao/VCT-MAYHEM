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
import { AGENT_FULL_PORTRAITS } from '../data/agentIcons';
import { PlayerAvatar } from './PlayerAvatar';
import { CountryFlag } from './CountryFlag';
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
  group: { tag: 'Fase de Grupos', title: 'Classificado às Quartas', next: 'Ir para as Quartas' },
  quarters: { tag: 'Quartas de Final', title: 'Classificado às Semis', next: 'Ir para as Semis' },
  semis: { tag: 'Semifinal', title: 'Na Grande Final', next: 'Disputar a Final' },
  finals: { tag: 'Grande Final', title: 'Campeão Mundial', next: 'Continuar' },
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
          <TeamCrest
            emblemId={teamIdentity.emblemId}
            color={teamIdentity.color}
            logoTeamKey={teamIdentity.logoTeamKey}
            size="xs"
          />
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

        {/* Lineup showcase with crisp agent backdrops + real player portraits */}
        {lineup && (
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full mb-4">
            {ROLE_ORDER.map(role => {
              const p = lineup[role];
              if (!p) return null;
              const isSeriesMvp = seriesMvp?.player.id === p.id;
              const agentBg = p.signatureAgent ? AGENT_FULL_PORTRAITS[p.signatureAgent] : null;
              return (
                <div
                  key={role}
                  className={`relative overflow-hidden surface-sub p-1.5 sm:p-2 flex flex-col items-center gap-1 border-b-2 ${
                    isSeriesMvp ? 'border-[#e2b714]' : ''
                  }`}
                  style={{ borderBottomColor: isSeriesMvp ? '#e2b714' : ROLE_COLORS[role] }}
                >
                  {agentBg && (
                    <img
                      src={agentBg}
                      alt=""
                      aria-hidden="true"
                      referrerPolicy="no-referrer"
                      className="pointer-events-none select-none absolute inset-x-0 top-[-15%] mx-auto h-[145%] w-auto max-w-none object-contain opacity-30"
                    />
                  )}
                  <div className="relative z-10">
                    <PlayerAvatar player={p} size="sm" teamColor={teamIdentity.color} />
                  </div>
                  <span className="relative z-10 font-display text-base leading-none text-white uppercase tracking-wide truncate max-w-full">
                    {p.ign}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Series MVP Broadcast Hero Banner */}
        {seriesMvp && (
          <div
            id="series-mvp-highlight"
            className="relative overflow-hidden w-full rounded-[4px] bg-[#070b12] border border-[#e2b714]/45 p-3.5 mb-5 text-left flex items-center justify-between gap-3 flex-wrap"
          >
            {seriesMvp.player.signatureAgent &&
              AGENT_FULL_PORTRAITS[seriesMvp.player.signatureAgent] && (
                <img
                  src={AGENT_FULL_PORTRAITS[seriesMvp.player.signatureAgent]}
                  alt=""
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                  className="pointer-events-none select-none absolute right-[-4%] top-[-20%] h-[190%] w-auto max-w-none object-contain opacity-45"
                />
              )}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(7,11,18,0.95) 0%, rgba(7,11,18,0.75) 60%, rgba(7,11,18,0.42) 100%)',
              }}
              aria-hidden
            />

            <div className="relative z-10 flex items-center gap-3 min-w-0">
              <PlayerAvatar player={seriesMvp.player} size="lg" teamColor={teamIdentity.color} />
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
                  <strong className="font-display text-2xl leading-none text-white uppercase tracking-wide">
                    {seriesMvp.player.ign}
                  </strong>
                  {seriesMvp.player.countryCode && (
                    <CountryFlag code={seriesMvp.player.countryCode} size="xs" />
                  )}
                  {seriesMvp.player.trait && <TraitBadge trait={seriesMvp.player.trait} iconOnly size="xs" />}
                  <span className="text-xs font-mono-vct text-slate-300 truncate">
                    · {seriesMvp.player.signatureAgent}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-3 font-mono-vct text-xs bg-[#06090f]/85 px-2.5 py-1.5 rounded-[3px] border border-white/15 shrink-0">
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
