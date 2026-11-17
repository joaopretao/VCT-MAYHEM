import {
  Lineup,
  MatchEvent,
  MapGame,
  SeriesMatch,
  TournamentStage,
  Difficulty,
  Player,
  PlayerPerformance,
  TournamentMvpStats,
  MayhemBonus,
  BonusUsageSummary,
  TacticalStance,
  SeriesTacticBuff,
} from '../types';
import { TEAMS_DATABASE } from '../data/teamsAndPlayers';

const MAPS_POOL = [
  'Ascent',
  'Haven',
  'Bind',
  'Split',
  'Lotus',
  'Sunset',
  'Abyss',
  'Pearl',
];

export interface TeamStatsCalculation {
  overallRating: number;
  consistency: number;
  clutch: number;
  synergy: number;
  flexibility: number;
  synergyBonuses: string[];
  hasSameNationBonus?: boolean;
  sameNationCode?: string;
  sameNationCount?: number;
  mestreFlexCoveredRole?: boolean;
}

export function calculateTeamStats(
  lineup: Lineup,
  bonuses: MayhemBonus[] = []
): TeamStatsCalculation {
  const players = Object.values(lineup).filter((p): p is Player => p !== null);
  if (players.length === 0) {
    return {
      overallRating: 0,
      consistency: 0,
      clutch: 0,
      synergy: 0,
      flexibility: 0,
      synergyBonuses: [],
    };
  }

  // Sum declarative modifiers when Mayhem Bonuses are active
  let extraPlayerRating = 0;
  let bonusRatingFlat = 0;
  let bonusConsistencyFlat = 0;
  let bonusClutchFlat = 0;
  let bonusClutchPerChamp = 0;
  let bonusPositiveSynergyFlat = 0;
  let bonusNegativeSynergyFlat = 0;
  let synergyMult = 1;
  let nationThreshold = 0;
  let nationSynergyValue = 0;
  let flexCoversMissing = false;

  for (const b of bonuses) {
    const m = b.modifiers;
    if (m.allPlayersRatingFlat) extraPlayerRating += m.allPlayersRatingFlat;
    if (m.ratingFlat) bonusRatingFlat += m.ratingFlat;
    if (m.consistencyFlat) bonusConsistencyFlat += m.consistencyFlat;
    if (m.clutchFlat) bonusClutchFlat += m.clutchFlat;
    if (m.clutchPerChampWinner) bonusClutchPerChamp += m.clutchPerChampWinner;
    if (m.synergyFlat) {
      if (m.synergyFlat >= 0) bonusPositiveSynergyFlat += m.synergyFlat;
      else bonusNegativeSynergyFlat += m.synergyFlat;
    }
    if (m.synergyMultiplier && m.synergyMultiplier > synergyMult) {
      synergyMult = m.synergyMultiplier;
    }
    if (m.sameNationThreshold && m.sameNationSynergy) {
      nationThreshold = m.sameNationThreshold;
      nationSynergyValue += m.sameNationSynergy;
    }
    if (m.flexCountsAsMissingRole) {
      flexCoversMissing = true;
    }
  }

  const avg = (fn: (p: Player) => number) =>
    Math.round(players.reduce((acc, p) => acc + fn(p), 0) / players.length);

  let overallRating = avg(p =>
    extraPlayerRating > 0 ? Math.min(99, p.rating + extraPlayerRating) : p.rating
  );
  let consistency = avg(p => p.consistency);
  let clutch = avg(p => p.clutch);
  let synergy = avg(p => p.synergy);
  const flexibility = avg(p => p.flexibility);

  const synergyBonuses: string[] = [];
  let synergyGain = 0;

  // Team pairing synergy (players from same team)
  const teamCounts: Record<string, number> = {};
  players.forEach(p => {
    teamCounts[p.team] = (teamCounts[p.team] || 0) + 1;
  });

  Object.entries(teamCounts).forEach(([teamName, count]) => {
    if (count >= 2) {
      const bonus = (count - 1) * 2;
      synergyGain += bonus;
      overallRating += Math.round(bonus / 2);
      synergyBonuses.push(`Química de Elenco (${count}x ${teamName}): +${bonus} Sinergia`);
    }
  });

  // Role balance bonus
  const hasDuelist = !!lineup.Duelist;
  const hasController = !!lineup.Controller;
  const hasInitiator = !!lineup.Initiator;
  const hasSentinel = !!lineup.Sentinel;
  const hasFlex = !!lineup.Flex;

  const coreMissingSlots = [!hasDuelist, !hasController, !hasInitiator, !hasSentinel].filter(Boolean).length;
  const corePrimaryRoles = new Set(players.map(p => p.primaryRole));
  const missingCorePrimary = (['Duelist', 'Controller', 'Initiator', 'Sentinel'] as const).some(
    r => !corePrimaryRoles.has(r)
  );

  let mestreFlexCoveredRole = false;
  if (hasDuelist && hasController && hasInitiator && hasSentinel && hasFlex) {
    synergyGain += 4;
    overallRating += 2;
    synergyBonuses.push('Composição Balanceada (5 Funções Ativas): +4 Sinergia');
    if (flexCoversMissing && missingCorePrimary) {
      synergyGain += 2;
      mestreFlexCoveredRole = true;
      synergyBonuses.push('Mestre Flex (Função coberta): +2 Sinergia extra');
    }
  } else if (flexCoversMissing && hasFlex && coreMissingSlots <= 1) {
    synergyGain += 4;
    overallRating += 2;
    mestreFlexCoveredRole = true;
    synergyBonuses.push('Mestre Flex (Composição Fechada): +4 Sinergia');
  }

  // Bandeira Unida (same nationality bonus)
  let hasSameNationBonus = false;
  let sameNationCode = '';
  let sameNationCount = 0;
  if (nationThreshold > 0 && nationSynergyValue > 0) {
    const nationCounts: Record<string, number> = {};
    players.forEach(p => {
      const code = (p.countryCode || '').toUpperCase();
      if (code) nationCounts[code] = (nationCounts[code] || 0) + 1;
    });
    for (const [code, cnt] of Object.entries(nationCounts)) {
      if (cnt > sameNationCount) {
        sameNationCount = cnt;
        sameNationCode = code;
      }
    }
    if (sameNationCount >= nationThreshold) {
      hasSameNationBonus = true;
      synergyGain += nationSynergyValue;
      synergyBonuses.push(`Bandeira Unida (${sameNationCount}x ${sameNationCode}): +${nationSynergyValue} Sinergia`);
    }
  }

  // Champions Winners Aura bonus
  const championsWinners = players.filter(p => p.isChampionsWinner);
  if (championsWinners.length > 0) {
    const baseChampClutch = championsWinners.length * 2;
    const bonusVeteranClutch = championsWinners.length * bonusClutchPerChamp;
    const totalChampClutch = baseChampClutch + bonusVeteranClutch;
    clutch += totalChampClutch;
    synergyBonuses.push(`Pedigree de Campeão (${championsWinners.length}x): +${totalChampClutch} Clutch`);
  }

  // Trait impacts on team stat sheet (balanced & tactical)
  players.forEach(p => {
    if (p.trait?.id === 'natural_synergy') {
      synergyGain += 3;
      synergyBonuses.push(`Química Natural (${p.ign}): +3 Sinergia`);
    } else if (p.trait?.id === 'ice_in_the_veins') {
      clutch += 2;
      synergyBonuses.push(`Sangue Frio (${p.ign}): +2 Clutch`);
    } else if (p.trait?.id === 'final_boss') {
      overallRating += 1;
      clutch += 2;
      synergyBonuses.push(`Aura de Final Boss (${p.ign}): +1 Rating, +2 Clutch`);
    } else if (p.trait?.id === 'choke_artist') {
      clutch -= 2;
      synergyBonuses.push(`Pressão Decisiva (${p.ign}): -2 Clutch`);
    }
  });

  if (bonusPositiveSynergyFlat > 0) {
    synergyGain += bonusPositiveSynergyFlat;
  }

  const finalSynergyGain =
    synergyMult > 1 ? Math.round(synergyGain * synergyMult) : synergyGain;

  synergy += finalSynergyGain + bonusNegativeSynergyFlat;
  overallRating += bonusRatingFlat;
  consistency += bonusConsistencyFlat;
  clutch += bonusClutchFlat;

  if (synergyMult > 1 && synergyGain > 0) {
    synergyBonuses.push(`Química Instantânea (×${synergyMult}): +${finalSynergyGain - synergyGain} Sinergia`);
  }

  return {
    overallRating: Math.min(99, Math.max(60, overallRating)),
    consistency: Math.min(99, Math.max(60, consistency)),
    clutch: Math.min(99, Math.max(60, clutch)),
    synergy: Math.min(99, Math.max(60, synergy)),
    flexibility: Math.min(99, Math.max(60, flexibility)),
    synergyBonuses,
    hasSameNationBonus,
    sameNationCode,
    sameNationCount,
    mestreFlexCoveredRole,
  };
}

export function generateTournamentSeries(
  stage: TournamentStage,
  difficulty: Difficulty,
  usedOpponents: string[] = []
): SeriesMatch {
  // Select an appropriate opponent from the database
  const candidateTeams = TEAMS_DATABASE.filter(t => !usedOpponents.includes(t.id));
  const opponentTeam = candidateTeams.length > 0 
    ? candidateTeams[Math.floor(Math.random() * candidateTeams.length)] 
    : TEAMS_DATABASE[Math.floor(Math.random() * TEAMS_DATABASE.length)];

  let stageTitle = '';
  let bestOf: 1 | 3 | 5 = 3;
  let baseOpponentRating = 86;

  switch (stage) {
    case 'group':
      stageTitle = 'FASE DE GRUPOS - ABERTURA';
      bestOf = 3;
      baseOpponentRating = 90;
      break;
    case 'quarters':
      stageTitle = 'QUARTAS DE FINAL - PLAYOFFS';
      bestOf = 3;
      baseOpponentRating = 93;
      break;
    case 'semis':
      stageTitle = 'SEMIFINAIS - PLAYOFFS';
      bestOf = 3;
      baseOpponentRating = 95;
      break;
    case 'finals':
      stageTitle = 'GRANDE FINAL DO CHAMPIONS';
      bestOf = 5;
      baseOpponentRating = 97;
      break;
  }

  // Calculate actual opponent roster average rating
  const opponentAvg = Math.round(
    opponentTeam.roster.reduce((acc, p) => acc + (p?.rating || 88), 0) / opponentTeam.roster.length
  );
  // Blend stage expectation with team prestige, ensuring challenging, authentic high-tier competition
  let finalOpponentRating = Math.round((baseOpponentRating * 0.50) + (opponentAvg * 0.50));

  if (difficulty === 'normal') finalOpponentRating += 1;
  if (difficulty === 'hard') finalOpponentRating += 3;
  if (difficulty === 'master') finalOpponentRating += 5;
  finalOpponentRating = Math.min(99, Math.max(87, finalOpponentRating));

  return {
    stage,
    stageTitle,
    opponent: {
      id: opponentTeam.id,
      name: `${opponentTeam.name} (${opponentTeam.year})`,
      tag: opponentTeam.shortName,
      region: opponentTeam.region,
      rating: finalOpponentRating,
      logoColor: opponentTeam.primaryColor,
      logoUrl: opponentTeam.logoUrl,
      rosterNames: opponentTeam.roster.map(p => p.ign),
    },
    bestOf,
    playerWins: 0,
    opponentWins: 0,
    currentMapIndex: 0,
    maps: [],
    isFinished: false,
    playerWonSeries: null,
  };
}

export interface SimulateMapOptions {
  bonuses?: MayhemBonus[];
  lostPreviousMap?: boolean;
  difficulty?: Difficulty;
  stance?: TacticalStance;
  seriesBuff?: SeriesTacticBuff;
}

export function simulateSingleMap(
  lineup: Lineup,
  opponentRating: number,
  mapIndex: number,
  usedMaps: string[] = [],
  options?: SimulateMapOptions
): MapGame {
  const bonuses = options?.bonuses || [];
  const stats = calculateTeamStats(lineup, bonuses);
  const players = Object.values(lineup).filter((p): p is Player => p !== null);

  // Pick map
  const availableMaps = MAPS_POOL.filter(m => !usedMaps.includes(m));
  const mapName = availableMaps.length > 0 
    ? availableMaps[Math.floor(Math.random() * availableMaps.length)] 
    : MAPS_POOL[mapIndex % MAPS_POOL.length];

  const bonusTriggers: Record<string, number> = {};
  const addTrigger = (bonusId: string, amount: number = 1) => {
    bonusTriggers[bonusId] = (bonusTriggers[bonusId] || 0) + amount;
  };

  let allPlayersExtraRating = 0;
  let dynamicRatingDelta = 0;
  let dynamicConsistencyDelta = 0;
  let pistolBonus = 0;
  let ecoBonus = 0;
  let fullBuyBonus = 0;
  let retakeBonus = 0;
  let deciderBonus = 0;

  for (const b of bonuses) {
    const m = b.modifiers;
    if (m.allPlayersRatingFlat) allPlayersExtraRating += m.allPlayersRatingFlat;
    if (m.pistolWinBonus) pistolBonus += m.pistolWinBonus;
    if (m.ecoWinBonus) ecoBonus += m.ecoWinBonus;
    if (m.fullBuyBonus) fullBuyBonus += m.fullBuyBonus;
    if (m.retakeClutchBonus) retakeBonus += m.retakeClutchBonus;
    if (m.deciderMapPointBonus) deciderBonus += m.deciderMapPointBonus;

    if (m.comebackMapBonus && options?.lostPreviousMap) {
      dynamicRatingDelta += m.comebackMapBonus;
      addTrigger(b.id, 1);
    }
    if (m.underdogStrongBonus && stats.overallRating < opponentRating) {
      dynamicRatingDelta += m.underdogStrongBonus;
      addTrigger(b.id, 1);
    } else if (m.underdogWeakPenalty && stats.overallRating > opponentRating) {
      dynamicConsistencyDelta += m.underdogWeakPenalty;
    }

    if (m.ratingFlat || m.allPlayersRatingFlat || m.consistencyFlat) {
      addTrigger(b.id, 1);
    }
    if (m.synergyMultiplier) {
      addTrigger(b.id, 1);
    }
    if (m.flexCountsAsMissingRole && lineup.Flex) {
      addTrigger(b.id, 1);
    }
    if (m.sameNationThreshold && stats.hasSameNationBonus) {
      addTrigger(b.id, 1);
    }
    if (m.clutchPerChampWinner && players.some(p => p.isChampionsWinner)) {
      addTrigger(b.id, 1);
    }
  }

  // Apply Tactical Prep & Difficulty tactical pressure (Fase 3)
  const stance = options?.stance;
  const seriesBuff = options?.seriesBuff;
  const difficulty = options?.difficulty;

  if (seriesBuff === 'rating_boost') {
    dynamicRatingDelta += 2;
  } else if (seriesBuff === 'pistol_prep') {
    pistolBonus += 0.05;
    ecoBonus += 0.05;
  } else if (seriesBuff === 'clutch_prep') {
    retakeBonus += 0.05;
    deciderBonus += 0.05;
  }

  if (stance === 'aggressive') {
    pistolBonus += 0.045;
    ecoBonus += 0.045;
    retakeBonus -= 0.025;
  } else if (stance === 'balanced') {
    fullBuyBonus += 0.01;
    deciderBonus += 0.01;
  } else if (stance === 'disciplined') {
    retakeBonus += 0.04;
    deciderBonus += 0.04;
    pistolBonus -= 0.02;
    ecoBonus -= 0.02;
    dynamicConsistencyDelta += 1;
  }

  // Master difficulty punishes uncoordinated rosters with low team synergy
  if (difficulty === 'master' && stats.synergy < 78) {
    dynamicConsistencyDelta -= 2;
    retakeBonus -= 0.02;
  }

  // Base probability of winning a round situation - calibrated for harder authentic VCT tier competition
  const effectiveOverallRating = Math.max(60, stats.overallRating + dynamicRatingDelta);
  const ratingDiff = effectiveOverallRating - opponentRating;
  const synergyMod = (stats.synergy - 78) * 0.0022;
  const consistencyMod = (Math.max(60, stats.consistency + dynamicConsistencyDelta) - 78) * 0.0015;
  const clutchMod = (stats.clutch - 78) * 0.0020;

  // Composition balance check
  const hasMestreFlex = bonuses.some(b => b.modifiers.flexCountsAsMissingRole);
  const isFullComp =
    (!!lineup.Duelist && !!lineup.Controller && !!lineup.Initiator && !!lineup.Sentinel && !!lineup.Flex) ||
    (hasMestreFlex && !!lineup.Flex && players.length >= 4);
  const compModifier = isFullComp ? 0.015 : -0.065;

  // Champions winners aura
  const champWinnersCount = players.filter(p => p.isChampionsWinner).length;
  const champModifier = champWinnersCount * 0.007;

  // Detect active lineup traits
  const fbKingPlayer = players.find(p => p.trait?.id === 'first_blood_king');
  const finalBossPlayer = players.find(p => p.trait?.id === 'final_boss');
  const icePlayer = players.find(p => p.trait?.id === 'ice_in_the_veins');
  const clutchMasterPlayer = players.find(p => p.trait?.id === 'clutch_master');
  const chokePlayer = players.find(p => p.trait?.id === 'choke_artist');
  const tiltedPlayer = players.find(p => p.trait?.id === 'tilted');

  // Preserve exact historical clamps when no bonuses are active; allow modest headroom when tactics/bonuses apply
  const baseUpperCap = 0.59;
  const hasSitRoundBonus =
    pistolBonus > 0 ||
    ecoBonus > 0 ||
    fullBuyBonus > 0 ||
    retakeBonus > 0 ||
    deciderBonus > 0 ||
    Boolean(stance) ||
    (Boolean(seriesBuff) && seriesBuff !== 'none');
  const sitUpperCap = hasSitRoundBonus ? 0.63 : 0.605;

  // Calibrated base probability (+0.5% round edge -> ~2% softer tournament run)
  let baseRoundProb = 0.425 + (ratingDiff * 0.009) + synergyMod + consistencyMod + compModifier + champModifier;
  baseRoundProb = Math.min(baseUpperCap, Math.max(0.225, baseRoundProb));

  const events: MatchEvent[] = [];

  // Individual player tracking for this map
  const playerStatsMap: Record<string, { kills: number; deaths: number; assists: number; clutches: number; firstBloods: number }> = {};
  players.forEach(p => {
    playerStatsMap[p.id] = { kills: 0, deaths: 0, assists: 0, clutches: 0, firstBloods: 0 };
  });

  interface SituationMeta {
    title: string;
    roundNumber: number;
    winTemplates: ((p: Player) => string)[];
    lossTemplates: string[];
  }

  const SITUATIONS: SituationMeta[] = [
    {
      title: 'SITUAÇÃO 1 · PISTOL ROUND',
      roundNumber: 1,
      winTemplates: [
        (p: Player) => `${p.ign} acerta dois headshots relâmpago com a Classic, abre o bombsite e garante a primeira rodada!`,
        (p: Player) => `Mira cirúrgica de Ghost: ${p.ign} anota o First Blood e sua equipe conquista o pistol round sem baixas!`,
        (p: Player) => `${p.ign} lê a investida adversária no pistol, converte duelo 1v2 e abre o placar com moral!`,
      ],
      lossTemplates: [
        'Avanço coordenado do adversário na rodada de pistolas surpreende a defesa e custa o round inicial.',
        'Confronto tenso de Classic no pistol: o adversário leva a melhor nas trades e garante o primeiro ponto.',
      ],
    },
    {
      title: 'SITUAÇÃO 2 · ROUND FORÇADO & ANTI-ECO',
      roundNumber: 3,
      winTemplates: [
        (p: Player) => `${p.ign} impõe o ritmo com Spectre/Stinger, neutraliza o forçado inimigo e consolida a economia!`,
        (p: Player) => `Anti-eco exemplar: ${p.ign} segura o avanço rápido com utilitários perfeitos e anota um 3K avassalador!`,
        (p: Player) => `Eco round espetacular! Sua equipe surpreende com pistolas, rouba armamento pesado com ${p.ign} e vira o round!`,
      ],
      lossTemplates: [
        'Surpresa econômica: o adversário acerta miras afiadas de Sheriff na média distância e vence a rodada forçada.',
        'Sua equipe força o armamento mas é surpreendida pela postura recuada da equipe adversária.',
      ],
    },
    {
      title: 'SITUAÇÃO 3 · FULL BUY DE RIFLES',
      roundNumber: 9,
      winTemplates: [
        (p: Player) => `${p.ign} acha duas eliminações cruciais de Vandal no meio do mapa, quebrando a defesa adversária!`,
        (p: Player) => `Tiroteio de alto nível: ${p.ign} encaixa um tiro de Operator na longa distância e abre o mapa para o plant!`,
        (p: Player) => `Execução tática perfeita: utilitários sincronizados de ${p.ign} limpam as esquinas e garantem o round armado!`,
      ],
      lossTemplates: [
        'Trocação pesada no armamento total: o adversário se posiciona melhor no bombsite e garante a rodada de rifles.',
        'Ataque interceptado: a defesa adversária segura os ângulos com firmeza e anula a investida armada da sua equipe.',
      ],
    },
    {
      title: 'SITUAÇÃO 4 · RETAKE & CLUTCH',
      roundNumber: 18,
      winTemplates: [
        (p: Player) => `CLUTCH ÉPICO! ${p.ign} mantém a frieza sob extrema pressão, converte um 1v2 espetacular e desarma o Spike!`,
        (p: Player) => `Retake cirúrgico: coordenação impecável liderada por ${p.ign} limpa o bomb com 5 segundos restantes!`,
        (p: Player) => `${p.ign} protege o Spike plantado contra 3 defensores e garante a rodada mais tensa da partida!`,
      ],
      lossTemplates: [
        'Tempo esgotado no pós-plant: os utilitários adversários atrasam o avanço e impedem o defuse do Spike.',
        'O adversário surpreende com um lurk silencioso pelas costas e fatura o retake decisivo.',
      ],
    },
    {
      title: 'SITUAÇÃO 5 · PONTO DECISIVO DO MAPA',
      roundNumber: 24,
      winTemplates: [
        (p: Player) => `PONTO DO MAPA! ${p.ign} brilha no tiroteio decisivo, derruba o último oponente e garante a vitória no mapa!`,
        (p: Player) => `OVERTIME GLORIOSO! ${p.ign} crava a mira com frieza absurda e fecha a partida para a festa da torcida!`,
      ],
      lossTemplates: [
        'PONTO DECISIVO: o adversário arrisca uma investida agressiva, encaixa o abate final e vence o mapa.',
        'Round final disputado milésimo a milésimo, mas o adversário assegura o ponto do mapa na prorrogação.',
      ],
    },
  ];

  let playerSituationsWon = 0;
  let opponentSituationsWon = 0;
  let consecutiveLosses = 0;
  let clutchMasterRescued = false;

  // Simulate up to 5 situations. As soon as a team reaches 3 wins, they win the map!
  for (let i = 0; i < SITUATIONS.length; i++) {
    // If either team already has 3 wins, the map is decided!
    if (playerSituationsWon >= 3 || opponentSituationsWon >= 3) {
      break;
    }

    const situation = SITUATIONS[i];
    let sitProb = baseRoundProb;

    // Mayhem Bonuses per situation
    if (i === 0 && pistolBonus !== 0) sitProb += pistolBonus;
    if (i === 1 && ecoBonus !== 0) sitProb += ecoBonus;
    if (i === 2 && fullBuyBonus !== 0) sitProb += fullBuyBonus;
    if (i === 3 && retakeBonus !== 0) sitProb += retakeBonus;
    if (i === 4 && deciderBonus !== 0) sitProb += deciderBonus;

    // TRAIT: First Blood King boost in Pistol Round (Situation 1) - balanced
    if (i === 0 && fbKingPlayer) {
      sitProb += 0.07;
    }

    // Clutch adjustment for situations 4 and 5 (retake and map point)
    if (i >= 3) {
      sitProb += clutchMod * 1.2;

      // TRAIT: Final Boss tactical clutch boost
      if (finalBossPlayer) {
        sitProb += 0.06;
      }

      // TRAIT: Choke Artist penalty in high stakes
      if (chokePlayer) {
        sitProb -= 0.06;
      }
    }

    // TRAIT: Tiltado and Ice in the Veins after round drop
    if (consecutiveLosses >= 1) {
      if (tiltedPlayer) {
        // High synergy / IGL leadership can neutralize tilt
        if (stats.synergy < 82) {
          sitProb -= 0.04;
        }
      }
      if (icePlayer) {
        // Sangue Frio prevents drop and stabilizes team
        sitProb += 0.03;
      }
    }

    // Dynamic round variance (+/- 3%)
    sitProb += (Math.random() - 0.50) * 0.06;
    sitProb = Math.min(sitUpperCap, Math.max(0.265, sitProb));

    let wonSituation = Math.random() < sitProb;

    // TRAIT: Clutch Master tactical miracle rescue on map point
    if (!wonSituation && clutchMasterPlayer && opponentSituationsWon >= 2 && !clutchMasterRescued) {
      if (Math.random() < 0.35) {
        wonSituation = true;
        clutchMasterRescued = true;
      }
    }

    // Select performing players
    const duelist = players.find(p => p.primaryRole === 'Duelist') || players[0];
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    const activePlayer = Math.random() < 0.40 ? duelist : randomPlayer;

    if (wonSituation) {
      playerSituationsWon++;
      consecutiveLosses = 0;

      // Track situational Mayhem Bonus successes
      for (const b of bonuses) {
        const m = b.modifiers;
        if (i === 0 && m.pistolWinBonus) addTrigger(b.id, 1);
        if (i === 1 && m.ecoWinBonus) addTrigger(b.id, 1);
        if (i === 2 && m.fullBuyBonus) addTrigger(b.id, 1);
        if (i === 3 && m.retakeClutchBonus) addTrigger(b.id, 1);
        if (i === 4 && m.deciderMapPointBonus) addTrigger(b.id, 1);
      }

      let eventText = '';

      // Specific narrative hooks for traits
      if (i === 0 && fbKingPlayer && Math.random() < 0.75) {
        eventText = `[FIRST BLOOD] ${fbKingPlayer.ign} explode no bombsite de Classic, anota a primeira baixa relâmpago e garante o pistol!`;
        if (playerStatsMap[fbKingPlayer.id]) playerStatsMap[fbKingPlayer.id].firstBloods += 1;
      } else if (clutchMasterRescued) {
        eventText = `[CLUTCH MASTER] REVIRAVOLTA HEROICA! Quando tudo parecia perdido no map point, ${clutchMasterPlayer!.ign} acha um ângulo impossível, converte o 1v3 e salva a equipe!`;
        if (playerStatsMap[clutchMasterPlayer!.id]) playerStatsMap[clutchMasterPlayer!.id].clutches += 1;
      } else if ((i === 3 || i === 4) && finalBossPlayer && Math.random() < 0.70) {
        eventText = `[FINAL BOSS] Sob pressão sufocante, ${finalBossPlayer.ign} assume o servidor, fecha o round com frieza absurda e levanta a arena!`;
        if (playerStatsMap[finalBossPlayer.id]) playerStatsMap[finalBossPlayer.id].clutches += 1;
      } else {
        const template = situation.winTemplates[Math.floor(Math.random() * situation.winTemplates.length)];
        eventText = template(activePlayer);
      }

      // Update stats
      if (playerStatsMap[activePlayer.id]) {
        playerStatsMap[activePlayer.id].kills += Math.random() < 0.4 ? 2 : 1;
        if (i === 3 || i === 4) playerStatsMap[activePlayer.id].clutches += 1;
        if (i === 0) playerStatsMap[activePlayer.id].firstBloods += 1;
      }
      const assistPlayer = players[Math.floor(Math.random() * players.length)];
      if (assistPlayer.id !== activePlayer.id && playerStatsMap[assistPlayer.id]) {
        playerStatsMap[assistPlayer.id].assists += 1;
      }

      events.push({
        id: `sit-${i}-${situation.roundNumber}`,
        roundNumber: situation.roundNumber,
        text: eventText,
        type: 'win',
        clutchPlayer: activePlayer.ign,
        situationTitle: situation.title,
        situationIndex: i + 1,
      });
    } else {
      opponentSituationsWon++;
      consecutiveLosses++;

      let lossText = '';

      // Specific narrative hooks for negative traits
      if ((i === 3 || i === 4) && chokePlayer && Math.random() < 0.65) {
        lossText = `[AMARELÃO] As mãos suaram frio no round decisivo: ${chokePlayer.ign} erra a mira sob tensão máxima e o adversário fatura o ponto!`;
      } else if (consecutiveLosses >= 2 && tiltedPlayer && stats.synergy < 82 && Math.random() < 0.65) {
        lossText = `[TILTADO] ${tiltedPlayer.ign} perde o foco com a desvantagem no placar e a desorganização defensiva custa a rodada.`;
      } else {
        lossText = situation.lossTemplates[Math.floor(Math.random() * situation.lossTemplates.length)];
      }

      const deadPlayer = players[Math.floor(Math.random() * players.length)];
      if (playerStatsMap[deadPlayer.id]) {
        playerStatsMap[deadPlayer.id].deaths += 1;
      }

      events.push({
        id: `sit-${i}-${situation.roundNumber}`,
        roundNumber: situation.roundNumber,
        text: lossText,
        type: 'loss',
        situationTitle: situation.title,
        situationIndex: i + 1,
      });
    }
  }

  // Determine map result strictly based on who won 3 situations
  const playerWon = playerSituationsWon >= 3;

  // Realistic Valorant game score derived from round situations (first to 3 wins)
  let playerScore = 13;
  let opponentScore = 8;

  if (playerWon) {
    if (opponentSituationsWon === 0) {
      playerScore = 13;
      opponentScore = 5; // 3-0: Dominant victory
    } else if (opponentSituationsWon === 1) {
      playerScore = 13;
      opponentScore = 8; // 3-1: Solid victory
    } else {
      playerScore = 13;
      opponentScore = 11; // 3-2: Thriller overtime victory
    }
  } else {
    if (playerSituationsWon === 0) {
      playerScore = 5;
      opponentScore = 13; // 0-3: Tough loss
    } else if (playerSituationsWon === 1) {
      playerScore = 8;
      opponentScore = 13; // 1-3: Fought hard
    } else {
      playerScore = 11;
      opponentScore = 13; // 2-3: Close nailbiter
    }
  }

  const totalRounds = playerScore + opponentScore;

  // Build authentic per-map player performance stats with trait bonuses
  const playerPerformances: PlayerPerformance[] = players.map(p => {
    const raw = playerStatsMap[p.id];
    const effectivePlayerRating = allPlayersExtraRating > 0
      ? Math.min(99, p.rating + allPlayersExtraRating)
      : p.rating;
    const roleBaseMultiplier = p.primaryRole === 'Duelist' ? 1.15 : p.primaryRole === 'Flex' ? 1.05 : 0.95;
    const ratingBonus = (effectivePlayerRating - 75) * 0.14;
    let baseKills = Math.max(7, Math.round((totalRounds * 0.72 * roleBaseMultiplier * (effectivePlayerRating / 85)) + raw.kills * 0.8 + (Math.random() * 3 - 1)));
    let baseDeaths = Math.max(6, Math.round((totalRounds * (playerWon ? 0.62 : 0.78)) + raw.deaths + (Math.random() * 3 - 1)));
    let baseAssists = Math.max(3, Math.round(totalRounds * (p.primaryRole === 'Initiator' || p.primaryRole === 'Controller' ? 0.36 : 0.22) + raw.assists));
    let clutchesWon = raw.clutches;
    let kdRatio = Number((baseKills / Math.max(1, baseDeaths)).toFixed(2));
    
    // Calculate authentic ACS (Average Combat Score)
    const baseAcs = Math.round((baseKills * 12) + (baseAssists * 4) + (clutchesWon * 15) + (ratingBonus * 6));
    let acs = Math.max(150, Math.min(340, Math.round((baseAcs / totalRounds) * 24)));

    // TRAIT: Final Boss +25% ACS
    if (p.trait?.id === 'final_boss') {
      acs = Math.min(390, Math.round(acs * 1.25));
      baseKills += 3;
      clutchesWon += 1;
      kdRatio = Number((baseKills / Math.max(1, baseDeaths)).toFixed(2));
    }

    // TRAIT: Inconsistente swing (+/- 25% ACS)
    if (p.trait?.id === 'inconsistent') {
      const isGoodDay = Math.random() < 0.50;
      if (isGoodDay) {
        acs = Math.min(370, Math.round(acs * 1.22));
        baseKills += 3;
      } else {
        acs = Math.max(115, Math.round(acs * 0.72));
        baseKills = Math.max(5, baseKills - 4);
      }
      kdRatio = Number((baseKills / Math.max(1, baseDeaths)).toFixed(2));
    }

    const impactScore = Number(((acs / 200) * 0.6 + kdRatio * 0.4).toFixed(2));

    return {
      playerId: p.id,
      ign: p.ign,
      role: p.primaryRole,
      team: p.team,
      year: p.year,
      rating: effectivePlayerRating,
      kills: baseKills,
      deaths: baseDeaths,
      assists: baseAssists,
      kdRatio,
      acs,
      clutchesWon,
      impactScore,
      signatureAgent: p.signatureAgent,
    };
  });

  return {
    mapName,
    playerScore,
    opponentScore,
    playerWon,
    events,
    playerPerformances,
    bonusTriggers: bonuses.length > 0 ? bonusTriggers : undefined,
  };
}

// Calculate tournament-wide MVP and overall team roster statistics
export function calculateTournamentMvp(lineup: Lineup, maps: MapGame[]): TournamentMvpStats | null {
  const players = Object.values(lineup).filter((p): p is Player => p !== null);
  if (players.length === 0 || maps.length === 0) return null;

  const performances = aggregateTournamentPerformances(lineup, maps);
  if (performances.length === 0) return null;

  // Sort by impact score descending, then ACS
  const sorted = [...performances].sort((a, b) => {
    if (b.impactScore !== a.impactScore) return b.impactScore - a.impactScore;
    return b.acs - a.acs;
  });

  const topPerformer = sorted[0];
  const playerObj = players.find(p => p.id === topPerformer.playerId) || players[0];

  let highlight = `Liderou a equipe com ${topPerformer.acs} ACS e foi fundamental nas entradas de bomb!`;
  if (topPerformer.clutchesWon >= 3) {
    highlight = `Mestre do clutch: converteu ${topPerformer.clutchesWon} situações decisivas sob pressão máxima!`;
  } else if (topPerformer.kdRatio >= 1.35) {
    highlight = `Poder de fogo avassalador com K/D de ${topPerformer.kdRatio} e ${topPerformer.totalKills} abates totais!`;
  } else if (topPerformer.role === 'Controller' || topPerformer.role === 'Initiator') {
    highlight = `Comando tático absoluto com controle milimétrico de utilitários e presença constante!`;
  }

  return {
    player: playerObj,
    acs: topPerformer.acs,
    kdRatio: topPerformer.kdRatio,
    totalKills: topPerformer.kills,
    totalDeaths: topPerformer.deaths,
    clutchesWon: topPerformer.clutchesWon,
    highlightText: highlight,
  };
}

export function aggregateTournamentPerformances(
  lineup: Lineup,
  maps: MapGame[]
): (PlayerPerformance & { totalKills: number; totalDeaths: number })[] {
  const players = Object.values(lineup).filter((p): p is Player => p !== null);
  if (players.length === 0) return [];

  return players.map(p => {
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let totalClutches = 0;
    let totalAcsSum = 0;
    let mapCount = 0;

    maps.forEach(m => {
      const perf = m.playerPerformances?.find(pf => pf.playerId === p.id);
      if (perf) {
        totalKills += perf.kills;
        totalDeaths += perf.deaths;
        totalAssists += perf.assists;
        totalClutches += perf.clutchesWon;
        totalAcsSum += perf.acs;
        mapCount++;
      }
    });

    if (mapCount === 0) {
      // Fallback if simulated before map stats were attached
      totalKills = Math.round(p.rating * 0.22);
      totalDeaths = 14;
      totalAssists = 5;
      totalAcsSum = p.rating * 2.8;
      mapCount = 1;
    }

    const avgAcs = Math.round(totalAcsSum / Math.max(1, mapCount));
    const kdRatio = Number((totalKills / Math.max(1, totalDeaths)).toFixed(2));
    const impactScore = Number(((avgAcs / 200) * 0.6 + kdRatio * 0.4).toFixed(2));

    return {
      playerId: p.id,
      ign: p.ign,
      role: p.primaryRole,
      team: p.team,
      year: p.year,
      rating: p.rating,
      kills: totalKills,
      deaths: totalDeaths,
      assists: totalAssists,
      totalKills,
      totalDeaths,
      kdRatio,
      acs: avgAcs,
      clutchesWon: totalClutches,
      impactScore,
      signatureAgent: p.signatureAgent,
    };
  });
}

function plural(n: number, singular: string, pluralWord: string): string {
  return `${n} ${n === 1 ? singular : pluralWord}`;
}

const BONUS_USAGE_LABELS: Record<string, (count: number, bonus: MayhemBonus) => string> = {
  pistol_specialist: count =>
    count > 0 ? `Ajudou em ${plural(count, 'pistol round', 'pistol rounds')}` : 'Atuou nos pistols da run',
  economia_afiada: count =>
    count > 0
      ? `Ajudou em ${plural(count, 'round econômico', 'rounds econômicos')}`
      : 'Atuou em forçados/anti-eco',
  leitura_de_demo: count =>
    count > 0 ? `Ajudou em ${plural(count, 'full buy', 'full buys')}` : 'Atuou nos rounds armados',
  gene_clutch: count =>
    count > 0
      ? `Ajudou em ${plural(count, 'situação de clutch', 'situações de clutch')}`
      : 'Atuou nos retakes do torneio',
  folego: count =>
    count > 0
      ? `Ativou em ${plural(count, 'mapa', 'mapas')} após derrota`
      : 'Sem derrota prévia nas séries',
  reforco_reroll: (_count, bonus) =>
    `Concedeu +${bonus.modifiers.extraRerolls ?? 2} rerolls no draft`,
  segunda_chance: count =>
    count > 0 ? `Salvou sua eliminação ${count}x na run` : 'Não precisou ser ativada',
  veteranos: count =>
    count > 0
      ? `Deu Clutch extra em ${plural(count, 'mapa', 'mapas')}`
      : 'Nenhum campeão mundial no time',
  bandeira_unida: (count, bonus) =>
    count > 0
      ? `Ativou +${bonus.modifiers.sameNationSynergy ?? 6} sinergia em ${plural(count, 'mapa', 'mapas')}`
      : 'Menos de 3 jogadores do mesmo país',
  underdog: count =>
    count > 0
      ? `Bônus ativo em ${plural(count, 'mapa', 'mapas')} contra favoritos`
      : 'Enfrentou times de nível igual ou menor',
};

export function buildBonusUsageSummaries(
  bonuses: MayhemBonus[],
  maps: MapGame[],
  secondChanceUsedCount: number = 0
): BonusUsageSummary[] {
  const counts: Record<string, number> = {};
  for (const map of maps) {
    if (!map.bonusTriggers) continue;
    for (const [id, val] of Object.entries(map.bonusTriggers)) {
      counts[id] = (counts[id] || 0) + val;
    }
  }

  return bonuses.map(bonus => {
    let usageCount = counts[bonus.id] || 0;
    if (bonus.id === 'segunda_chance') {
      usageCount = secondChanceUsedCount;
    } else if (bonus.id === 'reforco_reroll') {
      usageCount = bonus.modifiers.extraRerolls ?? 2;
    }

    const formatter = BONUS_USAGE_LABELS[bonus.id];
    const usageText = formatter
      ? formatter(usageCount, bonus)
      : `Aplicado em ${plural(usageCount, 'mapa', 'mapas')}`;

    return {
      id: bonus.id,
      name: bonus.name,
      rarity: bonus.rarity,
      usageCount,
      usageText,
    };
  });
}

export function generateRunSummaryLine(params: {
  wonChampionship: boolean;
  stageReached: TournamentStage;
  stats: TeamStatsCalculation;
  bonusSummaries: BonusUsageSummary[];
  secondChanceUsedCount: number;
  mvpIgn?: string;
  playerWins?: number;
  opponentWins?: number;
}): string {
  const {
    wonChampionship,
    stageReached,
    stats,
    bonusSummaries,
    secondChanceUsedCount,
    mvpIgn,
    playerWins = 0,
    opponentWins = 0,
  } = params;

  const underdogCount = bonusSummaries.find(b => b.id === 'underdog')?.usageCount ?? 0;

  if (wonChampionship) {
    if (secondChanceUsedCount > 0) {
      return 'Depois de escapar da eliminação com a Segunda Chance, o elenco cresceu e levantou a taça.';
    }
    if (underdogCount >= 3) {
      return `Entrando como zebra contra favoritos, o time superou elencos mais fortes e levou o Champions.`;
    }
    if (stats.synergy >= 88) {
      return `Sinergia alta (${stats.synergy}) deu ritmo constante ao elenco em todas as séries até o título.`;
    }
    if (mvpIgn) {
      return `Poder de fogo sólido e decisões precisas de ${mvpIgn} fecharam a Grande Final.`;
    }
    return 'Consistência coletiva e bônus bem aproveitados carregaram a campanha até o troféu.';
  }

  const closeSeries = Math.abs(playerWins - opponentWins) <= 1 && playerWins >= 1;
  if (stageReached === 'finals') {
    return closeSeries
      ? 'Bateu na trave na Grande Final: decisão foi equilibrada até os rounds finais.'
      : 'Chegou à Grande Final, mas o adversário impôs mais ritmo na série decisiva.';
  }
  if (stageReached === 'semis') {
    return closeSeries
      ? 'Campanha sólida até a semifinal, decidida nos últimos mapas por detalhes.'
      : 'Avançou bem até os playoffs, mas faltou resposta no confronto de semifinal.';
  }
  if (stats.synergy < 78) {
    return 'Sinergia baixa pesou nas trocas de meio de mapa e faltou encaixe nas séries iniciais.';
  }
  if (stats.clutch < 80) {
    return 'Os momentos de retake e ponto decisivo escaparam quando o confronto apertou.';
  }
  return 'Confronto duro desde o início e pouco fôlego econômico para virar a série.';
}


