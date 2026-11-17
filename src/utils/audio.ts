// Premium, calm & delicate Web Audio API synthesizer for VALORANT Champions Mayhem
// Pure sine + warm low-level triangle waves, lowpass filter, algorithmic reverb,
// soft master compressor, pentatonic/major-9th harmony, and ±8 cents organic detune.

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let compressor: DynamicsCompressorNode | null = null;
let dryBus: GainNode | null = null;
let reverbConvolver: ConvolverNode | null = null;
let wetGain: GainNode | null = null;

let soundEnabled = true;

// Active voice tracking to avoid overlapping clutter (smooth 25ms fade-out when stealing)
interface ActiveVoice {
  gain: GainNode;
  stopTime: number;
  tag: string;
}
const activeVoices: ActiveVoice[] = [];
const MAX_POLYPHONY = 14;

/**
 * Generates a warm, smooth stereo impulse response for subtle ambient reverb (~1.05s tail)
 */
function createSoftReverbImpulse(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const duration = 1.05;
  const length = Math.floor(sampleRate * duration);
  const impulse = ctx.createBuffer(2, length, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const channelData = impulse.getChannelData(ch);
    let lastSample = 0;
    for (let i = 0; i < length; i++) {
      const t = i / length;
      // Smooth fade-in over first 12ms and exponential decay
      const attackEnv = Math.min(1, i / (sampleRate * 0.012));
      const decayEnv = Math.pow(1 - t, 2.8);
      const white = Math.random() * 2 - 1;
      // Simple one-pole lowpass on the noise so the reverb tail is warm and velvety
      lastSample = lastSample * 0.72 + white * 0.28;
      channelData[i] = lastSample * attackEnv * decayEnv * 0.35;
    }
  }
  return impulse;
}

/**
 * Lazily initializes the AudioContext and master processing chain on first user gesture
 */
function getAudioGraph(): { ctx: AudioContext; destination: AudioNode } | null {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    audioCtx = new AudioContextClass();

    // Master Compressor (prevents any peaks)
    compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-20, audioCtx.currentTime);
    compressor.knee.setValueAtTime(24, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(4, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0.005, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.18, audioCtx.currentTime);

    // Master Gain (~0.20 for calm, comfortable volume)
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.2, audioCtx.currentTime);

    // Dry + Wet Reverb buses
    dryBus = audioCtx.createGain();
    dryBus.gain.setValueAtTime(0.82, audioCtx.currentTime);

    wetGain = audioCtx.createGain();
    wetGain.gain.setValueAtTime(0.22, audioCtx.currentTime);

    reverbConvolver = audioCtx.createConvolver();
    reverbConvolver.buffer = createSoftReverbImpulse(audioCtx);

    dryBus.connect(compressor);
    dryBus.connect(reverbConvolver);
    reverbConvolver.connect(wetGain);
    wetGain.connect(compressor);
    compressor.connect(masterGain);
    masterGain.connect(audioCtx.destination);
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return dryBus ? { ctx: audioCtx, destination: dryBus } : null;
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
 * Fades out previous voices with the same tag (or oldest voices if exceeding polyphony)
 */
function pruneVoices(ctx: AudioContext, replaceTag?: string) {
  const now = ctx.currentTime;
  for (let i = activeVoices.length - 1; i >= 0; i--) {
    if (activeVoices[i].stopTime <= now) {
      activeVoices.splice(i, 1);
    }
  }

  if (replaceTag) {
    for (let i = activeVoices.length - 1; i >= 0; i--) {
      const v = activeVoices[i];
      if (v.tag === replaceTag) {
        try {
          v.gain.gain.cancelScheduledValues(now);
          v.gain.gain.setValueAtTime(Math.max(0.0001, v.gain.gain.value), now);
          v.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
        } catch {
          // ignore
        }
        activeVoices.splice(i, 1);
      }
    }
  }

  while (activeVoices.length >= MAX_POLYPHONY) {
    const oldest = activeVoices.shift();
    if (oldest) {
      try {
        oldest.gain.gain.cancelScheduledValues(now);
        oldest.gain.gain.setValueAtTime(Math.max(0.0001, oldest.gain.gain.value), now);
        oldest.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      } catch {
        // ignore
      }
    }
  }
}

interface ToneOptions {
  freq: number;
  startOffset?: number;
  attack?: number;
  decay: number;
  volume?: number;
  triangleBlend?: number;
  cutoff?: number;
  tag?: string;
}

/**
 * Plays a single warm, filtered crystal tone (sine + subtle triangle body)
 */
function playCrystalNote(opts: ToneOptions) {
  const graph = getAudioGraph();
  if (!graph) return;
  const { ctx, destination } = graph;

  const now = ctx.currentTime + (opts.startOffset ?? 0);
  const attack = opts.attack ?? 0.01;
  const decay = opts.decay;
  const peakVolume = opts.volume ?? 0.35;
  const triangleBlend = opts.triangleBlend ?? 0.14;
  const cutoff = opts.cutoff ?? 2800;

  // ±8 cents organic pitch variation
  const randomDetune = (Math.random() * 16 - 8);

  // Lowpass filter to keep timbre silky and free of harshness
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(cutoff, now);
  filter.Q.setValueAtTime(0.7, now);

  // Envelope gain
  const envGain = ctx.createGain();
  envGain.gain.setValueAtTime(0.0001, now);
  envGain.gain.linearRampToValueAtTime(peakVolume, now + attack);
  envGain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);

  // Primary sine oscillator
  const sineOsc = ctx.createOscillator();
  sineOsc.type = 'sine';
  sineOsc.frequency.setValueAtTime(opts.freq, now);
  sineOsc.detune.setValueAtTime(randomDetune, now);
  sineOsc.connect(filter);

  // Subtle triangle oscillator for warm body
  let triOsc: OscillatorNode | null = null;
  if (triangleBlend > 0) {
    triOsc = ctx.createOscillator();
    const triGain = ctx.createGain();
    triOsc.type = 'triangle';
    triOsc.frequency.setValueAtTime(opts.freq, now);
    triOsc.detune.setValueAtTime(randomDetune, now);
    triGain.gain.setValueAtTime(triangleBlend, now);
    triOsc.connect(triGain);
    triGain.connect(filter);
  }

  filter.connect(envGain);
  envGain.connect(destination);

  const stopTime = now + attack + decay + 0.03;
  sineOsc.start(now);
  sineOsc.stop(stopTime);
  if (triOsc) {
    triOsc.start(now);
    triOsc.stop(stopTime);
  }

  activeVoices.push({
    gain: envGain,
    stopTime,
    tag: opts.tag || 'default',
  });
}

// Musical frequencies (Hz) - C Major / Pentatonic palette
const NOTE = {
  C3: 130.81,
  G3: 196.0,
  A3: 220.0,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  B5: 987.77,
  C6: 1046.5,
  D6: 1174.66,
  E6: 1318.51,
};

/**
 * 1. Selecionar Jogador / Clique de UI:
 * "Toque de cristal", 2 notas sine curtas (~120 ms), sutil e elegante.
 */
export function playSelectSound() {
  if (!isAudioEnabled()) return;
  const graph = getAudioGraph();
  if (!graph) return;
  pruneVoices(graph.ctx, 'select');

  playCrystalNote({
    freq: NOTE.G5,
    startOffset: 0,
    attack: 0.006,
    decay: 0.09,
    volume: 0.26,
    triangleBlend: 0.08,
    cutoff: 3200,
    tag: 'select',
  });
  playCrystalNote({
    freq: NOTE.C6,
    startOffset: 0.045,
    attack: 0.006,
    decay: 0.12,
    volume: 0.3,
    triangleBlend: 0.08,
    cutoff: 3400,
    tag: 'select',
  });
}

/**
 * Confirmar Jogador no Lobby (Lock-in):
 * Toque de cristal duplo com harmônico suave (E5 -> G5 -> C6)
 */
export function playLockSound() {
  if (!isAudioEnabled()) return;
  const graph = getAudioGraph();
  if (!graph) return;
  pruneVoices(graph.ctx, 'lock');

  const notes = [NOTE.E5, NOTE.G5, NOTE.C6];
  notes.forEach((freq, i) => {
    playCrystalNote({
      freq,
      startOffset: i * 0.045,
      attack: 0.008,
      decay: 0.24,
      volume: 0.28,
      triangleBlend: 0.12,
      cutoff: 3200,
      tag: 'lock',
    });
  });
}

/**
 * 2. Reroll:
 * Arpejo pentatônico ascendente suave e curto, como um brilho passando.
 */
export function playRerollSound() {
  if (!isAudioEnabled()) return;
  const graph = getAudioGraph();
  if (!graph) return;
  pruneVoices(graph.ctx, 'reroll');

  const shimmer = [NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5, NOTE.C6];
  shimmer.forEach((freq, i) => {
    playCrystalNote({
      freq,
      startOffset: i * 0.036,
      attack: 0.007,
      decay: 0.22,
      volume: 0.22,
      triangleBlend: 0.1,
      cutoff: 3400,
      tag: 'reroll',
    });
  });
}

/**
 * 3. Hover (Discreto, disponível para teste):
 * Tick cristalino quase inaudível.
 */
export function playHoverSound() {
  if (!isAudioEnabled()) return;
  const graph = getAudioGraph();
  if (!graph) return;
  pruneVoices(graph.ctx, 'hover');

  playCrystalNote({
    freq: NOTE.A5,
    startOffset: 0,
    attack: 0.005,
    decay: 0.045,
    volume: 0.1,
    triangleBlend: 0,
    cutoff: 2200,
    tag: 'hover',
  });
}

/**
 * 4. Rodada / Mapa Vencido:
 * Acorde maior em arpejo (C5 - E5 - G5 - C6), som de sino suave, cauda de ~0.8 s.
 */
export function playRoundWinSound() {
  if (!isAudioEnabled()) return;
  const graph = getAudioGraph();
  if (!graph) return;
  pruneVoices(graph.ctx, 'round');

  const arpeggio = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6];
  arpeggio.forEach((freq, i) => {
    playCrystalNote({
      freq,
      startOffset: i * 0.065,
      attack: 0.01,
      decay: 0.78,
      volume: 0.3,
      triangleBlend: 0.14,
      cutoff: 3000,
      tag: 'round',
    });
  });
}

/**
 * 5. Rodada / Mapa Perdido:
 * Duas notas descendo suavemente (E4 -> C4), tom quente e neutro, sem drama.
 */
export function playRoundLossSound() {
  if (!isAudioEnabled()) return;
  const graph = getAudioGraph();
  if (!graph) return;
  pruneVoices(graph.ctx, 'round');

  playCrystalNote({
    freq: NOTE.E4,
    startOffset: 0,
    attack: 0.012,
    decay: 0.36,
    volume: 0.28,
    triangleBlend: 0.18,
    cutoff: 1900,
    tag: 'round',
  });
  playCrystalNote({
    freq: NOTE.C4,
    startOffset: 0.11,
    attack: 0.014,
    decay: 0.48,
    volume: 0.26,
    triangleBlend: 0.18,
    cutoff: 1700,
    tag: 'round',
  });
}

/**
 * 6. Elenco Completo (5/5):
 * Arpejo elegante de acorde maior com 7ª e 9ª (Cmaj9: C5 - E5 - G5 - B5 - D6), cauda com reverb.
 */
export function playRosterCompleteSound() {
  if (!isAudioEnabled()) return;
  const graph = getAudioGraph();
  if (!graph) return;
  pruneVoices(graph.ctx, 'complete');

  const cmaj9 = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.B5, NOTE.D6];
  cmaj9.forEach((freq, i) => {
    playCrystalNote({
      freq,
      startOffset: i * 0.07,
      attack: 0.01,
      decay: 0.95,
      volume: 0.28,
      triangleBlend: 0.14,
      cutoff: 3300,
      tag: 'complete',
    });
  });
}

/**
 * 7. Campeão / Vitória:
 * Progressão curta e elegante (~2 s), sem fanfarra agressiva de metais.
 */
export function playVictoryFanfare() {
  if (!isAudioEnabled()) return;
  const graph = getAudioGraph();
  if (!graph) return;
  pruneVoices(graph.ctx, 'fanfare');

  // Warm Fmaj7 -> G6 -> Cmaj9 resolution (~2.0s total)
  const sequence: { freq: number; offset: number; decay: number; vol: number }[] = [
    // Chord 1: Fmaj7
    { freq: NOTE.F4, offset: 0.0, decay: 0.7, vol: 0.22 },
    { freq: NOTE.A4, offset: 0.05, decay: 0.7, vol: 0.22 },
    { freq: NOTE.C5, offset: 0.1, decay: 0.7, vol: 0.24 },
    { freq: NOTE.E5, offset: 0.15, decay: 0.75, vol: 0.26 },
    // Chord 2: Gadd6
    { freq: NOTE.G4, offset: 0.48, decay: 0.7, vol: 0.22 },
    { freq: NOTE.B4, offset: 0.53, decay: 0.7, vol: 0.22 },
    { freq: NOTE.D5, offset: 0.58, decay: 0.7, vol: 0.24 },
    { freq: NOTE.G5, offset: 0.63, decay: 0.8, vol: 0.28 },
    // Final resolution: Cmaj9 arpeggio
    { freq: NOTE.C4, offset: 1.0, decay: 1.2, vol: 0.26 },
    { freq: NOTE.G4, offset: 1.06, decay: 1.15, vol: 0.24 },
    { freq: NOTE.E5, offset: 1.12, decay: 1.1, vol: 0.26 },
    { freq: NOTE.B5, offset: 1.18, decay: 1.1, vol: 0.25 },
    { freq: NOTE.D6, offset: 1.25, decay: 1.15, vol: 0.26 },
    { freq: NOTE.C6, offset: 1.38, decay: 1.25, vol: 0.3 },
  ];

  sequence.forEach(n => {
    playCrystalNote({
      freq: n.freq,
      startOffset: n.offset,
      attack: 0.012,
      decay: n.decay,
      volume: n.vol,
      triangleBlend: 0.15,
      cutoff: 3100,
      tag: 'fanfare',
    });
  });
}

/**
 * 9. Revelação dos Bônus Mayhem:
 * Acorde suave com brilho cristalino ascendente, no mesmo estilo calmo da UI.
 */
export function playBonusRevealSound() {
  if (!isAudioEnabled()) return;
  const graph = getAudioGraph();
  if (!graph) return;
  pruneVoices(graph.ctx, 'bonus');

  const notes = [NOTE.E5, NOTE.G5, NOTE.B5, NOTE.D6];
  notes.forEach((freq, i) => {
    playCrystalNote({
      freq,
      startOffset: i * 0.055,
      attack: 0.01,
      decay: 0.55,
      volume: 0.24,
      triangleBlend: 0.12,
      cutoff: 3200,
      tag: 'bonus',
    });
  });
}

/**
 * 8. Derrota / Eliminação:
 * Nota grave suave, longa e resolvida, nada triste demais.
 */
export function playEliminationSound() {
  if (!isAudioEnabled()) return;
  const graph = getAudioGraph();
  if (!graph) return;
  pruneVoices(graph.ctx, 'elimination');

  const chord = [
    { freq: NOTE.C3, offset: 0, vol: 0.3, decay: 1.3 },
    { freq: NOTE.G3, offset: 0.04, vol: 0.24, decay: 1.25 },
    { freq: NOTE.D4, offset: 0.09, vol: 0.2, decay: 1.15 },
    { freq: NOTE.E4, offset: 0.22, vol: 0.22, decay: 1.2 },
  ];

  chord.forEach(n => {
    playCrystalNote({
      freq: n.freq,
      startOffset: n.offset,
      attack: 0.015,
      decay: n.decay,
      volume: n.vol,
      triangleBlend: 0.18,
      cutoff: 1800,
      tag: 'elimination',
    });
  });
}
