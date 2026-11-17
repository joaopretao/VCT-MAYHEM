import { Difficulty, SeriesMatch, TacticalStance } from '../types';
import { TEAMS_DATABASE } from '../data/teamsAndPlayers';

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
