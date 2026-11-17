import {
  BonusUsageSummary,
  CardFrameId,
  Difficulty,
  Lineup,
  RunRuleId,
  TournamentMvpStats,
  TournamentStage,
  UserTeamIdentity,
} from '../types';
import { getPlayerPhotoUrl } from '../data/playerPhotos';
import { getFrameMeta } from '../data/frames';
import { getRunRuleMeta } from './runRules';
import { ROLE_COLORS, ROLE_NAMES_PT } from '../data/roleIcons';
import { ROLE_ORDER } from '../components/roleOrder';

const STAGE_LABEL_PT: Record<TournamentStage, string> = {
  group: 'FASE DE GRUPOS',
  quarters: 'QUARTAS DE FINAL',
  semis: 'SEMIFINALISTA',
  finals: 'VICE-CAMPEÃO',
};

const DIFF_LABEL_PT: Record<Difficulty, string> = {
  normal: 'NORMAL',
  hard: 'DIFÍCIL',
  master: 'MASTER',
};

function loadImageSafe(src: string | null): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = window.setTimeout(() => resolve(null), 3500);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

function drawCoverTop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / Math.max(1, img.height);
  const boxRatio = w / Math.max(1, h);
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (imgRatio > boxRatio) {
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / boxRatio;
    sy = 0; // crop from top so faces never clip
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

export interface ShareCardParams {
  teamIdentity: UserTeamIdentity;
  frameId: CardFrameId;
  lineup: Lineup;
  wonChampionship: boolean;
  stageReached: TournamentStage;
  seriesScore: string;
  opponentName: string;
  difficulty: Difficulty;
  runRule: RunRuleId;
  seed: string;
  mvp: TournamentMvpStats | null;
  bonuses: BonusUsageSummary[];
}

export async function generateShareResultPngDataUrl(params: ShareCardParams): Promise<string> {
  const width = 1200;
  const height = 630;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D indisponível');

  const frame = getFrameMeta(params.frameId);
  const ruleMeta = getRunRuleMeta(params.runRule);

  // 1. Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#090c12');
  bgGrad.addColorStop(0.55, '#0f141e');
  bgGrad.addColorStop(1, '#090b10');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle decorative glow matching frame accent
  const glow = ctx.createRadialGradient(width * 0.85, 80, 20, width * 0.85, 80, 520);
  glow.addColorStop(0, `${frame.accentColor}30`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Outer Frame Border (Static, crisp)
  ctx.strokeStyle = frame.accentColor;
  ctx.lineWidth = 5;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.strokeRect(28, 28, width - 56, height - 56);

  // Top Header Strip
  ctx.fillStyle = frame.accentColor;
  ctx.fillRect(18, 18, width - 36, 8);

  // 2. Title & Status
  ctx.fillStyle = params.wonChampionship ? '#e2b714' : '#ff4655';
  ctx.font = '700 18px monospace';
  const topSubtitle = params.wonChampionship
    ? 'VALORANT CHAMPIONS MAYHEM · TÍTULO MUNDIAL'
    : `VALORANT CHAMPIONS MAYHEM · ${STAGE_LABEL_PT[params.stageReached]}`;
  ctx.fillText(topSubtitle, 54, 72);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 50px system-ui, -apple-system, sans-serif';
  ctx.fillText(params.teamIdentity.name.slice(0, 22), 54, 128);

  // Result pill on top right
  const scoreBadgeText = params.wonChampionship
    ? `CAMPEÃO (${params.seriesScore})`
    : `VS ${params.opponentName.toUpperCase()} · ${params.seriesScore}`;
  ctx.font = '700 17px monospace';
  const badgeW = Math.min(440, ctx.measureText(scoreBadgeText).width + 36);
  ctx.fillStyle = params.wonChampionship ? 'rgba(226,183,20,0.16)' : 'rgba(255,70,85,0.16)';
  ctx.fillRect(width - 54 - badgeW, 56, badgeW, 42);
  ctx.strokeStyle = params.wonChampionship ? '#e2b714' : '#ff4655';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(width - 54 - badgeW, 56, badgeW, 42);
  ctx.fillStyle = params.wonChampionship ? '#fde047' : '#fda4af';
  ctx.fillText(scoreBadgeText.slice(0, 38), width - 36 - badgeW, 83);

  // Sub-chips (Difficulty, Rule, Seed)
  ctx.font = '700 15px monospace';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(
    `DIFICULDADE: ${DIFF_LABEL_PT[params.difficulty]}   ·   REGRA: ${ruleMeta.label.toUpperCase()}   ·   SEED: ${params.seed}`,
    54,
    160
  );

  // 3. Load and draw the 5 Player Cards
  const photos = await Promise.all(
    ROLE_ORDER.map(role => {
      const p = params.lineup[role];
      return loadImageSafe(p ? getPlayerPhotoUrl(p.ign) : null);
    })
  );

  const cardStartX = 54;
  const cardGap = 18;
  const cardW = (width - 108 - cardGap * 4) / 5;
  const cardY = 192;
  const cardH = 266;

  ROLE_ORDER.forEach((role, idx) => {
    const player = params.lineup[role];
    const x = cardStartX + idx * (cardW + cardGap);
    const roleColor = ROLE_COLORS[role] || '#ff4655';
    const isMvp = Boolean(params.mvp && player && params.mvp.player.id === player.id);

    ctx.fillStyle = '#111621';
    ctx.fillRect(x, cardY, cardW, cardH);

    ctx.strokeStyle = isMvp ? '#e2b714' : 'rgba(255,255,255,0.14)';
    ctx.lineWidth = isMvp ? 2.5 : 1.5;
    ctx.strokeRect(x, cardY, cardW, cardH);

    // Role accent bar
    ctx.fillStyle = isMvp ? '#e2b714' : roleColor;
    ctx.fillRect(x, cardY, cardW, 5);

    // Role header text
    ctx.fillStyle = roleColor;
    ctx.font = '700 13px monospace';
    ctx.fillText(ROLE_NAMES_PT[role].toUpperCase(), x + 12, cardY + 26);

    if (isMvp) {
      ctx.fillStyle = '#e2b714';
      ctx.fillText('MVP', x + cardW - 40, cardY + 26);
    }

    // Photo Box
    const photoX = x + 16;
    const photoY = cardY + 38;
    const photoW = cardW - 32;
    const photoH = 148;
    ctx.fillStyle = '#090c11';
    ctx.fillRect(photoX, photoY, photoW, photoH);

    const img = photos[idx];
    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(photoX, photoY, photoW, photoH);
      ctx.clip();
      drawCoverTop(ctx, img, photoX, photoY, photoW, photoH);
      ctx.restore();
    } else if (player) {
      ctx.fillStyle = roleColor;
      ctx.font = '800 36px system-ui, sans-serif';
      ctx.fillText(player.ign.slice(0, 2).toUpperCase(), photoX + photoW / 2 - 26, photoY + 88);
    }

    // Player Name + Team
    if (player) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 22px system-ui, sans-serif';
      ctx.fillText(player.ign.slice(0, 14), x + 14, cardY + 216);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 14px monospace';
      ctx.fillText(`${player.team} · ${player.signatureAgent}`.slice(0, 20), x + 14, cardY + 242);
    }
  });

  // 4. Footer: MVP Stats + Bonuses + Share prompt
  const footerY = 486;
  ctx.fillStyle = '#0b0e14';
  ctx.fillRect(54, footerY, width - 108, 92);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.strokeRect(54, footerY, width - 108, 92);

  if (params.mvp) {
    ctx.fillStyle = '#e2b714';
    ctx.font = '700 14px monospace';
    ctx.fillText('MVP DA CAMPANHA', 74, footerY + 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 24px system-ui, sans-serif';
    ctx.fillText(
      `${params.mvp.player.ign}  ·  ${params.mvp.acs} ACS  ·  ${params.mvp.kdRatio} K/D`,
      74,
      footerY + 60
    );
  }

  // Bonuses summary on right side of footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 13px monospace';
  const bonusLabel =
    params.bonuses.length > 0
      ? `BÔNUS: ${params.bonuses.map(b => b.name).join(' · ')}`
      : 'SEM BÔNUS ROGUELIKE';
  ctx.fillText(bonusLabel.slice(0, 56), 600, footerY + 28);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '700 15px monospace';
  ctx.fillText(`Jogue a mesma seed: ?seed=${params.seed}`, 600, footerY + 60);

  return canvas.toDataURL('image/png');
}

export async function downloadShareResultPng(params: ShareCardParams): Promise<void> {
  const dataUrl = await generateShareResultPngDataUrl(params);
  const link = document.createElement('a');
  const safeName = params.teamIdentity.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.download = `mayhem-${safeName || 'elenco'}-${params.seed.toLowerCase()}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
