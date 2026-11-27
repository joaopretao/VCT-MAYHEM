import React from 'react';
import {
  Coins,
  RefreshCw,
  ArrowLeftRight,
  Sparkles,
  Check,
  Trophy,
  Crosshair,
} from 'lucide-react';
import {
  IntermissionShopOffer,
  Lineup,
  MayhemBonus,
  Player,
  Role,
  SeriesTacticBuff,
} from '../types';
import { ROLE_COLORS, ROLE_NAMES_PT } from '../data/roleIcons';
import { AGENT_FULL_PORTRAITS } from '../data/agentIcons';
import { BONUS_RARITY_META } from '../data/mayhemBonuses';
import {
  MAX_RUN_BONUSES,
  PLAYER_SWAP_COST,
  SHOP_BONUS_COST,
  SHOP_REROLL_COST,
} from '../utils/shop';
import { playLockSound, playRerollSound } from '../utils/audio';
import { PlayerAvatar } from './PlayerAvatar';
import { CountryFlag } from './CountryFlag';
import { TraitBadge } from './TraitBadge';
import { MayhemBonusIconSvg } from './MayhemBonusChip';

interface IntermissionShopProps {
  credits: number;
  lastEarned: number;
  offer: IntermissionShopOffer;
  lineup: Lineup;
  selectedBonuses: MayhemBonus[];
  activeSeriesBuff: SeriesTacticBuff;
  onSwapPlayer: (newPlayer: Player, targetRole: Role) => void;
  onBuyBonus: (bonus: MayhemBonus) => void;
  onRerollBonus: () => void;
  onBuyTacticBuff: (buffId: SeriesTacticBuff, cost: number) => void;
}

export const IntermissionShop: React.FC<IntermissionShopProps> = ({
  credits,
  lastEarned,
  offer,
  lineup,
  selectedBonuses,
  activeSeriesBuff,
  onSwapPlayer,
  onBuyBonus,
  onRerollBonus,
  onBuyTacticBuff,
}) => {
  const canHoldMoreBonuses = selectedBonuses.length < MAX_RUN_BONUSES;

  return (
    <div
      id="intermission-shop-panel"
      className="w-full rounded-[3px] bg-[#090c11] border border-white/15 p-3.5 sm:p-4 text-left space-y-3.5"
    >
      {/* Shop Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
        <div>
          <span className="font-mono-vct text-[11px] font-bold uppercase tracking-wider text-[#e2b714] block">
            Mercado Entre Séries
          </span>
          <h3 className="font-display text-2xl leading-none text-white uppercase tracking-wide">
            Ajustes para a Próxima Série
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {lastEarned > 0 && (
            <span className="font-mono-vct text-xs px-2 py-1 rounded-[2px] bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 font-bold">
              +{lastEarned} na série
            </span>
          )}
          <span
            id="shop-credits-pill"
            className="inline-flex items-center gap-1.5 font-mono-vct text-sm font-bold px-2.5 py-1 rounded-[3px] bg-[#141a24] border border-[#e2b714]/50 text-[#e2b714]"
          >
            <Coins className="w-4 h-4" />
            <span>{credits} cr.</span>
          </span>
        </div>
      </div>

      {/* 1. Market Player Swap (max 1 per intermission) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-mono-vct font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#38bdf8]" />
            Troca Pontual de Atleta
          </span>
          <span className="font-mono-vct text-slate-300">
            {offer.swapUsed ? 'Troca realizada' : `${PLAYER_SWAP_COST} cr. · OVR oculto`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {offer.swapCandidates.map(({ player, targetRole }) => {
            const currentOccupant = lineup[targetRole];
            const canAfford = credits >= PLAYER_SWAP_COST && !offer.swapUsed;
            const roleColor = ROLE_COLORS[targetRole] || '#38bdf8';
            const agentPortrait = player.signatureAgent
              ? AGENT_FULL_PORTRAITS[player.signatureAgent]
              : null;

            return (
              <button
                key={player.id}
                type="button"
                disabled={!canAfford}
                onClick={() => {
                  playLockSound();
                  onSwapPlayer(player, targetRole);
                }}
                className={`group/swap relative overflow-hidden p-2.5 pl-3.5 rounded-[4px] border text-left flex items-center justify-between gap-2.5 transition-colors ${
                  canAfford
                    ? 'bg-[#070b12]/85 border-white/15 hover:border-[#38bdf8] cursor-pointer'
                    : 'bg-[#070b12]/60 border-white/[0.06] opacity-55 cursor-not-allowed'
                }`}
              >
                <div
                  className="absolute inset-y-0 left-0 w-[3px] z-20"
                  style={{ backgroundColor: roleColor }}
                  aria-hidden
                />
                {agentPortrait && (
                  <img
                    src={agentPortrait}
                    alt=""
                    aria-hidden="true"
                    referrerPolicy="no-referrer"
                    className={`pointer-events-none select-none absolute right-[-6%] top-[-18%] h-[185%] w-auto max-w-none object-contain transition-opacity ${
                      canAfford ? 'opacity-40 group-hover/swap:opacity-65' : 'opacity-20 grayscale'
                    }`}
                  />
                )}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(6,10,17,0.92) 0%, rgba(6,10,17,0.72) 60%, rgba(6,10,17,0.38) 100%)',
                  }}
                  aria-hidden
                />

                <div className="relative z-10 flex items-center gap-2.5 min-w-0">
                  <PlayerAvatar player={player} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-display text-xl leading-none uppercase tracking-wide text-white truncate">
                        {player.ign}
                      </span>
                      <CountryFlag code={player.countryCode} country={player.country} size="xs" />
                      {player.isChampionsWinner && (
                        <Trophy className="w-3 h-3 text-[#e2b714] shrink-0" />
                      )}
                      {player.trait && <TraitBadge trait={player.trait} iconOnly size="xs" />}
                    </div>
                    <span className="text-[11px] font-mono-vct text-slate-200 block truncate mt-0.5">
                      Entra em {ROLE_NAMES_PT[targetRole]} (sai {currentOccupant?.ign || '—'})
                    </span>
                  </div>
                </div>

                <span
                  className={`relative z-10 font-mono-vct text-xs font-bold px-2 py-1 rounded-[2px] shrink-0 ${
                    canAfford
                      ? 'bg-[#06090f]/85 border border-[#38bdf8]/55 text-[#7dd3fc]'
                      : 'bg-white/[0.05] text-slate-400'
                  }`}
                >
                  {offer.swapUsed ? 'Usado' : `${PLAYER_SWAP_COST} cr.`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Extra Bonus Card + 3. Next-Series Tactical Prep */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Bonus Offer */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono-vct font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#e2b714]" />
              Carta Bônus Extra
            </span>
            {!offer.bonusBought && offer.bonusOffer && canHoldMoreBonuses && (
              <button
                type="button"
                disabled={credits < SHOP_REROLL_COST}
                onClick={() => {
                  playRerollSound();
                  onRerollBonus();
                }}
                className={`inline-flex items-center gap-1 font-mono-vct text-[11px] font-bold px-2 py-0.5 rounded-[2px] border transition-colors ${
                  credits >= SHOP_REROLL_COST
                    ? 'bg-[#11151d] border-white/15 text-slate-200 hover:border-white/40 cursor-pointer'
                    : 'bg-[#0b0e14] border-white/5 text-slate-500 cursor-not-allowed'
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                <span>Trocar ({SHOP_REROLL_COST} cr.)</span>
              </button>
            )}
          </div>

          {offer.bonusBought ? (
            <div className="p-3 rounded-[3px] bg-emerald-500/10 border border-emerald-500/35 text-xs font-mono-vct text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              Bônus adicionado à sua campanha!
            </div>
          ) : !canHoldMoreBonuses || !offer.bonusOffer ? (
            <div className="p-3 rounded-[3px] bg-[#11151d] border border-white/10 text-xs text-slate-300">
              Limite máximo de {MAX_RUN_BONUSES} bônus na run atingido.
            </div>
          ) : (
            (() => {
              const b = offer.bonusOffer;
              const meta = BONUS_RARITY_META[b.rarity];
              const canBuyBonus = credits >= SHOP_BONUS_COST;
              return (
                <button
                  type="button"
                  disabled={!canBuyBonus}
                  onClick={() => {
                    playLockSound();
                    onBuyBonus(b);
                  }}
                  className={`w-full p-2.5 rounded-[3px] border text-left flex items-center justify-between gap-2.5 transition-colors ${
                    canBuyBonus
                      ? 'bg-[#11151d] hover:bg-[#161d2b] cursor-pointer'
                      : 'bg-[#0d1118] opacity-55 cursor-not-allowed'
                  }`}
                  style={{ borderColor: meta.borderColor }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-[3px] border flex items-center justify-center shrink-0"
                      style={{ backgroundColor: meta.bgTint, borderColor: meta.borderColor }}
                    >
                      <MayhemBonusIconSvg icon={b.icon} className="w-4 h-4" color={meta.color} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white truncate">{b.name}</span>
                        <span
                          className="text-[10px] font-mono-vct font-bold uppercase px-1.5 py-0.2 rounded-[2px]"
                          style={{ color: meta.textColor, backgroundColor: meta.bgTint }}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-300 block truncate">
                        {b.shortEffect}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-mono-vct text-xs font-bold px-2 py-1 rounded-[2px] shrink-0 ${
                      canBuyBonus
                        ? 'bg-[#e2b714]/15 border border-[#e2b714]/45 text-[#fde047]'
                        : 'bg-white/[0.05] text-slate-400'
                    }`}
                  >
                    {SHOP_BONUS_COST} cr.
                  </span>
                </button>
              );
            })()
          )}
        </div>

        {/* Next-Series Tactical Prep */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono-vct font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-[#ff4655]" />
              Preparo Tático (Próx. Série)
            </span>
          </div>

          <div className="space-y-1.5">
            {offer.tacticOptions.map(opt => {
              const isPicked = activeSeriesBuff === opt.id;
              const canBuy = credits >= opt.cost && !offer.tacticBought;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={!canBuy && !isPicked}
                  onClick={() => {
                    if (!canBuy) return;
                    playLockSound();
                    onBuyTacticBuff(opt.id, opt.cost);
                  }}
                  className={`w-full px-2.5 py-2 rounded-[3px] border text-left flex items-center justify-between gap-2 transition-colors ${
                    isPicked
                      ? 'bg-emerald-500/15 border-emerald-500/45'
                      : canBuy
                      ? 'bg-[#11151d] border-white/15 hover:border-[#ff4655] cursor-pointer'
                      : 'bg-[#0d1118] border-white/[0.06] opacity-55 cursor-not-allowed'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{opt.name}</span>
                    <span className="text-[11px] text-slate-300 block truncate">
                      {opt.description}
                    </span>
                  </div>
                  <span
                    className={`font-mono-vct text-xs font-bold px-2 py-0.5 rounded-[2px] shrink-0 ${
                      isPicked
                        ? 'text-emerald-300'
                        : canBuy
                        ? 'bg-[#ff4655]/15 border border-[#ff4655]/40 text-rose-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {isPicked ? 'Ativo' : `${opt.cost} cr.`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
