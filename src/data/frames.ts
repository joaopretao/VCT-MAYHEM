import { Achievement, CardFrameId } from '../types';

export interface CardFrameMeta {
  id: CardFrameId;
  name: string;
  description: string;
  unlockAchievementId: string | null;
  unlockHint: string;
  borderColor: string;
  accentColor: string;
  glowShadow: string;
  topStripGradient: string;
}

export const CARD_FRAMES: CardFrameMeta[] = [
  {
    id: 'default',
    name: 'VCT Padrão',
    description: 'Chassi tático clássico do circuito Champions.',
    unlockAchievementId: null,
    unlockHint: 'Disponível desde a 1ª partida',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    accentColor: '#ff4655',
    glowShadow: 'none',
    topStripGradient: 'linear-gradient(90deg, #ff4655, #38bdf8)',
  },
  {
    id: 'challenger_emerald',
    name: 'Playoffs Esmeralda',
    description: 'Borda metálica esmeralda para campeões consagrados.',
    unlockAchievementId: 'first_glory',
    unlockHint: 'Desbloqueia com: Primeira Glória (1º título)',
    borderColor: 'rgba(16, 185, 129, 0.55)',
    accentColor: '#10b981',
    glowShadow: '0 0 24px -8px rgba(16, 185, 129, 0.35)',
    topStripGradient: 'linear-gradient(90deg, #10b981, #34d399)',
  },
  {
    id: 'gold_champions',
    name: 'Coroa Dourada',
    description: 'Moldura de ouro exclusiva de quem venceu sem usar rerolls.',
    unlockAchievementId: 'no_reroll_champ',
    unlockHint: 'Desbloqueia com: Campeão Sem Reroll',
    borderColor: 'rgba(226, 183, 20, 0.65)',
    accentColor: '#e2b714',
    glowShadow: '0 0 26px -8px rgba(226, 183, 20, 0.45)',
    topStripGradient: 'linear-gradient(90deg, #e2b714, #fde047)',
  },
  {
    id: 'cyan_prodigy',
    name: 'Neon Radiante',
    description: 'Acabamento ciano de precisão para líderes de ACS.',
    unlockAchievementId: 'mvp_beast',
    unlockHint: 'Desbloqueia com: Monstro do Servidor (MVP ≥ 270 ACS)',
    borderColor: 'rgba(56, 189, 248, 0.58)',
    accentColor: '#38bdf8',
    glowShadow: '0 0 24px -8px rgba(56, 189, 248, 0.38)',
    topStripGradient: 'linear-gradient(90deg, #38bdf8, #818cf8)',
  },
  {
    id: 'ruby_master',
    name: 'Rubi do Mestre',
    description: 'Armadura carmesim forjada sob 6 vetos na dificuldade Master.',
    unlockAchievementId: 'master_conquest',
    unlockHint: 'Desbloqueia com: Desafio Supremo do Mestre',
    borderColor: 'rgba(255, 70, 85, 0.65)',
    accentColor: '#ff4655',
    glowShadow: '0 0 28px -8px rgba(255, 70, 85, 0.48)',
    topStripGradient: 'linear-gradient(90deg, #ff4655, #fb7185)',
  },
  {
    id: 'obsidian_legend',
    name: 'Obsidiana Especial',
    description: 'Chassi escuro com friso real para campeões de Regras Especiais.',
    unlockAchievementId: 'special_rule_champ',
    unlockHint: 'Desbloqueia com: Especialista de Circuito (título com regra especial)',
    borderColor: 'rgba(168, 85, 247, 0.62)',
    accentColor: '#a855f7',
    glowShadow: '0 0 26px -8px rgba(168, 85, 247, 0.42)',
    topStripGradient: 'linear-gradient(90deg, #a855f7, #e2b714)',
  },
];

const FRAME_STORAGE_KEY = 'vct_mayhem_equipped_frame_v1';

export function getFrameMeta(frameId: CardFrameId = 'default'): CardFrameMeta {
  return CARD_FRAMES.find(f => f.id === frameId) || CARD_FRAMES[0];
}

export function getUnlockedFrameIds(achievements: Achievement[]): Set<CardFrameId> {
  const unlockedAchIds = new Set(achievements.filter(a => a.isUnlocked).map(a => a.id));
  const result = new Set<CardFrameId>(['default']);
  for (const frame of CARD_FRAMES) {
    if (!frame.unlockAchievementId || unlockedAchIds.has(frame.unlockAchievementId)) {
      result.add(frame.id);
    }
  }
  return result;
}

export function loadEquippedFrame(achievements: Achievement[]): CardFrameId {
  const unlocked = getUnlockedFrameIds(achievements);
  try {
    const raw = localStorage.getItem(FRAME_STORAGE_KEY) as CardFrameId | null;
    if (raw && unlocked.has(raw)) return raw;
  } catch {
    // ignore storage errors
  }
  return 'default';
}

export function saveEquippedFrame(frameId: CardFrameId): void {
  try {
    localStorage.setItem(FRAME_STORAGE_KEY, frameId);
  } catch {
    // ignore
  }
}
