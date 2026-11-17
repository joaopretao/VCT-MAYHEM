import { MayhemBonus, MayhemBonusRarity, RunRuleId } from '../types';

export const BONUS_RARITY_META: Record<
  MayhemBonusRarity,
  {
    label: string;
    color: string;
    textColor: string;
    bgTint: string;
    borderColor: string;
    glowShadow: string;
    weight: number;
  }
> = {
  common: {
    label: 'Comum',
    color: '#94a3b8',
    textColor: '#cbd5e1',
    bgTint: 'rgba(148, 163, 184, 0.10)',
    borderColor: 'rgba(148, 163, 184, 0.35)',
    glowShadow: '0 0 20px -6px rgba(148, 163, 184, 0.25)',
    weight: 60,
  },
  rare: {
    label: 'Raro',
    color: '#38bdf8',
    textColor: '#7dd3fc',
    bgTint: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.45)',
    glowShadow: '0 0 24px -6px rgba(56, 189, 248, 0.38)',
    weight: 30,
  },
  epic: {
    label: 'Épico',
    color: '#e2b714',
    textColor: '#fde047',
    bgTint: 'rgba(226, 183, 20, 0.13)',
    borderColor: 'rgba(226, 183, 20, 0.55)',
    glowShadow: '0 0 28px -6px rgba(226, 183, 20, 0.45)',
    weight: 10,
  },
};

/**
 * Declarative catalog of roguelike Mayhem Bonuses.
 * Simulation and draft read these modifiers directly.
 */
export const MAYHEM_BONUSES: MayhemBonus[] = [
  // ======================== COMUNS (60%) ========================
  {
    id: 'pistol_specialist',
    name: 'Especialista em Pistol',
    description: '+6% de chance de vitória nos pistol rounds de cada mapa.',
    shortEffect: '+6% nos pistols',
    rarity: 'common',
    icon: 'Crosshair',
    modifiers: {
      pistolWinBonus: 0.06,
    },
  },
  {
    id: 'economia_afiada',
    name: 'Economia Afiada',
    description: '+4% de chance nos rounds forçados e anti-eco.',
    shortEffect: '+4% force/eco',
    rarity: 'common',
    icon: 'Coins',
    modifiers: {
      ecoWinBonus: 0.04,
    },
  },
  {
    id: 'veteranos',
    name: 'Veteranos',
    description: 'Cada campeão mundial dá +3 de Clutch e o time recebe +1 de força.',
    shortEffect: '+3 Clutch/camp. / +1 força',
    rarity: 'common',
    icon: 'Award',
    modifiers: {
      clutchPerChampWinner: 3,
      ratingFlat: 1,
    },
  },
  {
    id: 'folego',
    name: 'Fôlego',
    description: 'Depois de perder um mapa na série, o time ganha +3 de força no próximo.',
    shortEffect: '+3 força pós-mapa',
    rarity: 'common',
    icon: 'Flame',
    modifiers: {
      comebackMapBonus: 3,
    },
  },
  {
    id: 'reforco_reroll',
    name: 'Reforço de Reroll',
    description: 'Concede +2 rerolls imediatos no draft e +1 de força no elenco.',
    shortEffect: '+2 rerolls / +1 força',
    rarity: 'common',
    icon: 'RotateCcw',
    modifiers: {
      extraRerolls: 2,
      ratingFlat: 1,
    },
  },
  {
    id: 'disciplina',
    name: 'Disciplina',
    description: '+5 de consistência e +1 de força no elenco durante toda a campanha.',
    shortEffect: '+5 cons. / +1 força',
    rarity: 'common',
    icon: 'Shield',
    modifiers: {
      consistencyFlat: 5,
      ratingFlat: 1,
    },
  },
  {
    id: 'leitura_de_demo',
    name: 'Leitura de Demo',
    description: '+4% de chance nos rounds armados de Full Buy (rifles).',
    shortEffect: '+4% Full Buy',
    rarity: 'common',
    icon: 'BookOpen',
    modifiers: {
      fullBuyBonus: 0.04,
    },
  },

  // ======================== RAROS (30%) ========================
  {
    id: 'quimica_instantanea',
    name: 'Química Instantânea',
    description: 'Multiplica os bônus de sinergia do elenco por ×1,5 e dá +1 de força.',
    shortEffect: 'Sinergia ×1,5 / +1 força',
    rarity: 'rare',
    icon: 'Zap',
    modifiers: {
      synergyMultiplier: 1.5,
      ratingFlat: 1,
    },
  },
  {
    id: 'bandeira_unida',
    name: 'Bandeira Unida',
    description: 'Com 3+ jogadores do mesmo país, +10 de sinergia (e +1 de força base).',
    shortEffect: '3+ país: +10 sin. / +1',
    rarity: 'rare',
    icon: 'Flag',
    modifiers: {
      sameNationThreshold: 3,
      sameNationSynergy: 10,
      ratingFlat: 1,
    },
  },
  {
    id: 'gene_clutch',
    name: 'Gene Clutch',
    description: '+7% de chance nas situações de retake e clutch (1vX).',
    shortEffect: '+7% retake/clutch',
    rarity: 'rare',
    icon: 'HeartPulse',
    modifiers: {
      retakeClutchBonus: 0.07,
    },
  },
  {
    id: 'segunda_chance',
    name: 'Segunda Chance',
    description: 'Uma vez por run, ao perder uma série, rejoga o último mapa (-2 de força na campanha e -3 no replay).',
    shortEffect: 'Rejoga mapa (-2 força)',
    rarity: 'rare',
    icon: 'RefreshCw',
    modifiers: {
      onceSecondChance: true,
      ratingFlat: -2,
    },
  },
  {
    id: 'mestre_flex',
    name: 'Mestre Flex',
    description: 'O jogador Flex cobre a função que faltar e dá +5 de sinergia no time.',
    shortEffect: 'Flex +5 sinergia',
    rarity: 'rare',
    icon: 'Layers',
    modifiers: {
      flexCountsAsMissingRole: true,
      synergyFlat: 5,
    },
  },

  // ======================== ÉPICOS (10%) ========================
  {
    id: 'all_in',
    name: 'All-in',
    description: '+3 de força no elenco, em troca de -5 de sinergia tática.',
    shortEffect: '+3 força / -5 sin.',
    rarity: 'epic',
    icon: 'Swords',
    modifiers: {
      ratingFlat: 3,
      synergyFlat: -5,
    },
  },
  {
    id: 'dream_team',
    name: 'Dream Team',
    description: '+2 de força em todos os jogadores, em troca de -3 de sinergia e 0 rerolls.',
    shortEffect: '+2 todos / -3 sin. / 0 rerolls',
    rarity: 'epic',
    icon: 'Crown',
    modifiers: {
      allPlayersRatingFlat: 2,
      synergyFlat: -3,
      zeroRerolls: true,
    },
  },
  {
    id: 'underdog',
    name: 'Underdog',
    description: '+7 de força contra adversários mais fortes (3+ OVR acima) e -3 de consistência contra os mais fracos.',
    shortEffect: '+7 forte / -3 cons. fraco',
    rarity: 'epic',
    icon: 'TrendingUp',
    modifiers: {
      underdogStrongBonus: 7,
      underdogWeakPenalty: -3,
    },
  },
];

export const MAYHEM_BONUS_MAP: Record<string, MayhemBonus> = Object.fromEntries(
  MAYHEM_BONUSES.map(b => [b.id, b])
);

export function getMayhemBonusById(id: string): MayhemBonus | undefined {
  return MAYHEM_BONUS_MAP[id];
}

function rollWeightedRarity(
  availableRarities: MayhemBonusRarity[],
  rng: () => number = Math.random
): MayhemBonusRarity {
  const totalWeight = availableRarities.reduce(
    (sum, r) => sum + BONUS_RARITY_META[r].weight,
    0
  );
  let cursor = rng() * totalWeight;
  for (const rarity of availableRarities) {
    cursor -= BONUS_RARITY_META[rarity].weight;
    if (cursor <= 0) return rarity;
  }
  return availableRarities[0];
}

/**
 * Rolls 3 distinct random bonuses respecting rarity weights (60% common / 30% rare / 10% epic)
 * and excluding any bonus already picked in the current run. Supports optional deterministic RNG.
 */
export function rollMayhemBonusChoices(
  alreadyChosenIds: string[] = [],
  count: number = 3,
  options?: { rng?: () => number; rule?: RunRuleId }
): MayhemBonus[] {
  const rng = options?.rng ?? Math.random;
  const rule = options?.rule ?? 'standard';
  const excluded = new Set(alreadyChosenIds);

  // Avoid offering extra rerolls if Dream Team already locked rerolls or rule forbids rerolls
  if (excluded.has('dream_team') || rule === 'no_reroll') {
    excluded.add('reforco_reroll');
  }

  const chosenThisOffer: MayhemBonus[] = [];

  for (let i = 0; i < count; i++) {
    const remaining = MAYHEM_BONUSES.filter(
      b => !excluded.has(b.id) && !chosenThisOffer.some(picked => picked.id === b.id)
    );
    if (remaining.length === 0) break;

    const availableRarities = Array.from(new Set(remaining.map(b => b.rarity)));
    const targetRarity = rollWeightedRarity(availableRarities, rng);
    const bucket = remaining.filter(b => b.rarity === targetRarity);
    const pool = bucket.length > 0 ? bucket : remaining;
    const selected = pool[Math.floor(rng() * pool.length)];
    chosenThisOffer.push(selected);
  }

  return chosenThisOffer;
}
