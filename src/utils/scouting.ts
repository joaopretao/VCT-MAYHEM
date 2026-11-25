import { Difficulty, Player, Role, SeriesMatch, TacticalStance, Team } from '../types';
import { TEAMS_DATABASE } from '../data/teamsAndPlayers';

const SLOT_ORDER: Role[] = ['Duelist', 'Controller', 'Initiator', 'Sentinel', 'Flex'];

export function getOpponentTeam(opponent: SeriesMatch['opponent']): Team | null {
  if (opponent.id) {
    const exact = TEAMS_DATABASE.find(t => t.id === opponent.id);
    if (exact) return exact;
  }
  const normalizedName = opponent.name.toLowerCase();
  return (
    TEAMS_DATABASE.find(
      t =>
        normalizedName.includes(t.name.toLowerCase()) &&
        normalizedName.includes(String(t.year))
    ) ?? null
  );
}

/**
 * Aligns the 5 real opponent players onto the 5 mirrored tactical roles
 * (Duelist, Controller, Initiator, Sentinel, Flex) for a broadcast 5v5 face-off.
 */
export function alignOpponentRosterToSlots(
  opponent: SeriesMatch['opponent']
): Record<Role, Player | null> {
  const result: Record<Role, Player | null> = {
    Duelist: null,
    Controller: null,
    Initiator: null,
    Sentinel: null,
    Flex: null,
  };

  const realTeam = getOpponentTeam(opponent);
  const pool: Player[] = realTeam
    ? [...realTeam.roster]
    : opponent.rosterNames.slice(0, 5).map((ign, idx) => ({
        id: `opp_${idx}_${ign}`,
        name: ign,
        ign,
        country: opponent.region,
        countryCode: '',
        team: opponent.tag,
        year: 2024,
        championsYears: [],
        primaryRole: SLOT_ORDER[idx] || 'Flex',
        secondaryRoles: [],
        signatureAgent: '',
        rating: opponent.rating,
        consistency: opponent.rating - 2,
        clutch: opponent.rating - 2,
        synergy: opponent.rating - 2,
        flexibility: opponent.rating - 4,
      }));

  const used = new Set<string>();

  // Pass 1: exact primaryRole match
  for (const role of SLOT_ORDER) {
    const match = pool.find(p => !used.has(p.id) && p.primaryRole === role);
    if (match) {
      result[role] = match;
      used.add(match.id);
    }
  }

  // Pass 2: secondaryRoles match for remaining open slots
  for (const role of SLOT_ORDER) {
    if (result[role]) continue;
    const match = pool.find(p => !used.has(p.id) && p.secondaryRoles.includes(role));
    if (match) {
      result[role] = match;
      used.add(match.id);
    }
  }

  // Pass 3: fill any remaining open slots cleanly
  for (const role of SLOT_ORDER) {
    if (result[role]) continue;
    const match = pool.find(p => !used.has(p.id));
    if (match) {
      result[role] = match;
      used.add(match.id);
    }
  }

  return result;
}

export function getOpponentStarPlayer(opponent: SeriesMatch['opponent']): Player | null {
  const realTeam = getOpponentTeam(opponent);
  if (!realTeam || realTeam.roster.length === 0) return null;
  return [...realTeam.roster].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.clutch !== a.clutch) return b.clutch - a.clutch;
    return b.consistency - a.consistency;
  })[0];
}

export interface TacticalStanceMeta {
  id: TacticalStance;
  label: string;
  tag: string;
  summary: string;
  tradeoff: string;
  accentColor: string;
}

export const TACTICAL_STANCES: TacticalStanceMeta[] = [
  {
    id: 'aggressive',
    label: 'Agressiva',
    tag: 'Pressão Inicial',
    summary: '+3,5% em Pistol & Forçados/Eco',
    tradeoff: '-2% em Retake & Ponto Decisivo',
    accentColor: '#ff4655',
  },
  {
    id: 'balanced',
    label: 'Equilibrada',
    tag: 'Leitura Padrão',
    summary: '+2,5% em Full Buy & +1,5% em Retake/Decisivo',
    tradeoff: 'Sem penalidades situacionais',
    accentColor: '#38bdf8',
  },
  {
    id: 'disciplined',
    label: 'Disciplinada',
    tag: 'Controle & Retake',
    summary: '+3,5% em Retake & Ponto Decisivo (+1 Cons.)',
    tradeoff: '-2% em Pistol & Forçados/Eco',
    accentColor: '#10b981',
  },
];

export interface OpponentScoutReport {
  visibility: 'full' | 'partial' | 'blind';
  headline: string;
  strengthText: string;
  weaknessText: string | null;
  recommendedStance: TacticalStance | null;
  recommendedReason: string | null;
  rosterPreview: { ign: string; agent: string }[];
}

export function generateOpponentScoutReport(
  opponent: SeriesMatch['opponent'],
  difficulty: Difficulty
): OpponentScoutReport {
  const realTeam = opponent.id
    ? TEAMS_DATABASE.find(t => t.id === opponent.id)
    : undefined;

  const rosterPreview = realTeam
    ? realTeam.roster.map(p => ({ ign: p.ign, agent: p.signatureAgent }))
    : opponent.rosterNames.map(ign => ({ ign, agent: '' }));

  // Compute genuine tendencies from opponent roster stats
  const avgClutch = realTeam
    ? realTeam.roster.reduce((sum, p) => sum + p.clutch, 0) / realTeam.roster.length
    : opponent.rating - 4;
  const avgConsistency = realTeam
    ? realTeam.roster.reduce((sum, p) => sum + p.consistency, 0) / realTeam.roster.length
    : opponent.rating - 5;
  const avgSynergy = realTeam
    ? realTeam.roster.reduce((sum, p) => sum + p.synergy, 0) / realTeam.roster.length
    : opponent.rating - 4;
  const duelistCount = realTeam
    ? realTeam.roster.filter(p => p.primaryRole === 'Duelist' || p.secondaryRoles.includes('Duelist')).length
    : 2;

  let strengthText = 'Forte em trocas armadas de meio de mapa';
  let weaknessText = 'Oscila nos pistol rounds iniciais';
  let recommendedStance: TacticalStance = 'aggressive';
  let recommendedReason = 'Agressiva pressiona o pistol e economia antes do time encaixar.';

  if (duelistCount >= 3 || avgClutch < avgConsistency - 1.5) {
    strengthText = 'Agressivo nos primeiros duelos e pistol rounds';
    weaknessText = 'Oscila em retakes e pós-plant tensos';
    recommendedStance = 'disciplined';
    recommendedReason = 'Disciplinada segura o ímpeto inicial e pune no retake/decider.';
  } else if (avgClutch >= 87 && avgSynergy >= 86) {
    strengthText = 'Muito frio em situações de retake e clutch (1vX)';
    weaknessText = 'Demora a aquecer nos rounds econômicos';
    recommendedStance = 'aggressive';
    recommendedReason = 'Agressiva abre vantagem cedo em pistol/forçado antes do clutch rival.';
  } else if (avgConsistency >= 88) {
    strengthText = 'Macro disciplinado e sólido no Full Buy de rifles';
    weaknessText = 'Previsível contra pressão alternada nos rounds-chave';
    recommendedStance = 'balanced';
    recommendedReason = 'Equilibrada mantém duelo parelho no Full Buy sem abrir flancos.';
  } else if (avgSynergy < 83) {
    strengthText = 'Depende de talento individual em rodadas soltas';
    weaknessText = 'Peca em coordenação nos retakes fechados';
    recommendedStance = 'disciplined';
    recommendedReason = 'Disciplinada explora a falta de coordenação rival no pós-plant.';
  }

  if (difficulty === 'master') {
    return {
      visibility: 'blind',
      headline: `Relatório restrito (${opponent.region}) — leitura detalhada indisponível no Master.`,
      strengthText: 'Dados táticos bloqueados nesta dificuldade',
      weaknessText: null,
      recommendedStance: null,
      recommendedReason: null,
      rosterPreview,
    };
  }

  if (difficulty === 'hard') {
    return {
      visibility: 'partial',
      headline: `${strengthText}.`,
      strengthText,
      weaknessText: null,
      recommendedStance: null,
      recommendedReason: null,
      rosterPreview,
    };
  }

  return {
    visibility: 'full',
    headline: `${strengthText} · ${weaknessText}.`,
    strengthText,
    weaknessText,
    recommendedStance,
    recommendedReason,
    rosterPreview,
  };
}
