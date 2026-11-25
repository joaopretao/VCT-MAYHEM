// Minimal, dry tactical HUD audio engine (no melodic synth bells, no reverb chimes, no hover spam)

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let soundEnabled = true;

function getAudioGraph(): { ctx: AudioContext; out: GainNode } | null {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.22, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    // Pre-generate 60ms white noise buffer for dry mechanical switch clicks
    const len = Math.floor(audioCtx.sampleRate * 0.06);
    noiseBuffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.22));
    }
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return masterGain ? { ctx: audioCtx, out: masterGain } : null;
}

export function isAudioEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('vct_mayhem_audio');
    if (saved !== null) {
      soundEnabled = saved === 'true';
    }
  }
  return soundEnabled;
}

export function toggleAudio(): boolean {
  soundEnabled = !soundEnabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('vct_mayhem_audio', String(soundEnabled));
  }
  return soundEnabled;
}

/**
 * Dry mechanical transient (filtered noise burst, 10-25ms)
 */
function triggerClick(opts: {
  offset?: number;
  freq?: number;
  q?: number;
  duration?: number;
  gain?: number;
}) {
  const graph = getAudioGraph();
  if (!graph || !noiseBuffer) return;
  const { ctx, out } = graph;

  const now = ctx.currentTime + (opts.offset ?? 0);
  const duration = opts.duration ?? 0.018;

  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(opts.freq ?? 1600, now);
  filter.Q.setValueAtTime(opts.q ?? 1.8, now);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, now);
  env.gain.linearRampToValueAtTime(opts.gain ?? 0.32, now + 0.002);
  env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  src.connect(filter);
  filter.connect(env);
  env.connect(out);

  src.start(now);
  src.stop(now + duration + 0.01);
}

/**
 * Tight damped HUD pulse (short body thud or subtle tactical confirmation)
 */
function triggerPulse(opts: {
  startFreq: number;
  endFreq?: number;
  offset?: number;
  duration?: number;
  gain?: number;
  type?: OscillatorType;
}) {
  const graph = getAudioGraph();
  if (!graph) return;
  const { ctx, out } = graph;

  const now = ctx.currentTime + (opts.offset ?? 0);
  const duration = opts.duration ?? 0.08;

  const osc = ctx.createOscillator();
  osc.type = opts.type ?? 'triangle';
  osc.frequency.setValueAtTime(opts.startFreq, now);
  if (opts.endFreq) {
    osc.frequency.exponentialRampToValueAtTime(opts.endFreq, now + duration);
  }

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1400, now);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, now);
  env.gain.linearRampToValueAtTime(opts.gain ?? 0.25, now + 0.004);
  env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(filter);
  filter.connect(env);
  env.connect(out);

  osc.start(now);
  osc.stop(now + duration + 0.015);
}

/** Dry subtle UI switch click */
export function playSelectSound() {
  if (!isAudioEnabled()) return;
  triggerClick({ freq: 1850, q: 1.5, duration: 0.016, gain: 0.28 });
}

/** Heavy tactical lock-in (mechanical thud + crisp latch) */
export function playLockSound() {
  if (!isAudioEnabled()) return;
  triggerClick({ freq: 2200, q: 2.0, duration: 0.015, gain: 0.3 });
  triggerPulse({ startFreq: 190, endFreq: 95, duration: 0.075, gain: 0.38, type: 'triangle' });
  triggerClick({ offset: 0.045, freq: 1400, q: 1.6, duration: 0.02, gain: 0.24 });
}

/** Crisp 3-tick mechanical shuffle for reroll */
export function playRerollSound() {
  if (!isAudioEnabled()) return;
  triggerClick({ offset: 0, freq: 1500, duration: 0.015, gain: 0.22 });
  triggerClick({ offset: 0.045, freq: 1900, duration: 0.015, gain: 0.25 });
  triggerClick({ offset: 0.09, freq: 2300, duration: 0.018, gain: 0.28 });
}

/** Intentionally silent — hover sounds are distracting on desktop */
export function playHoverSound() {
  // no-op
}

/** Subtle two-step tactical confirm */
export function playRoundWinSound() {
  if (!isAudioEnabled()) return;
  triggerClick({ freq: 2100, duration: 0.014, gain: 0.2 });
  triggerPulse({ startFreq: 320, endFreq: 420, offset: 0, duration: 0.09, gain: 0.22 });
  triggerPulse({ startFreq: 480, endFreq: 520, offset: 0.065, duration: 0.14, gain: 0.24 });
}

/** Short muted low thud for miss/loss */
export function playRoundLossSound() {
  if (!isAudioEnabled()) return;
  triggerPulse({ startFreq: 155, endFreq: 92, duration: 0.13, gain: 0.3, type: 'triangle' });
}

/** Firm double-latch when completing 5/5 roster */
export function playRosterCompleteSound() {
  if (!isAudioEnabled()) return;
  triggerPulse({ startFreq: 220, endFreq: 140, offset: 0, duration: 0.08, gain: 0.32 });
  triggerClick({ offset: 0.06, freq: 2400, duration: 0.018, gain: 0.3 });
  triggerPulse({ startFreq: 440, endFreq: 460, offset: 0.075, duration: 0.18, gain: 0.24 });
}

/** Restrained clean confirmation for championship title */
export function playVictoryFanfare() {
  if (!isAudioEnabled()) return;
  triggerPulse({ startFreq: 261.63, offset: 0, duration: 0.18, gain: 0.24 });
  triggerPulse({ startFreq: 329.63, offset: 0.09, duration: 0.2, gain: 0.24 });
  triggerPulse({ startFreq: 392.0, offset: 0.18, duration: 0.24, gain: 0.26 });
  triggerPulse({ startFreq: 523.25, offset: 0.28, duration: 0.38, gain: 0.28 });
}

/** Subtle mechanical reveal for Mayhem bonus */
export function playBonusRevealSound() {
  if (!isAudioEnabled()) return;
  triggerClick({ freq: 2000, duration: 0.015, gain: 0.24 });
  triggerPulse({ startFreq: 360, endFreq: 440, offset: 0.02, duration: 0.12, gain: 0.2 });
}

/** Low muted impact for elimination */
export function playEliminationSound() {
  if (!isAudioEnabled()) return;
  triggerPulse({ startFreq: 140, endFreq: 68, offset: 0, duration: 0.28, gain: 0.34, type: 'triangle' });
}
