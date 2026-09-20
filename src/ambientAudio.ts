import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { SoundMode } from './soundOptions';
export type { SoundMode };
export { SOUND_OPTIONS } from './soundOptions';

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private currentMode: SoundMode = 'none';
  private masterGain: GainNode | null = null;
  private activeNodes: { stop: () => void }[] = [];
  private volume = 0.6;
  private listeners = new Set<() => void>();

  private getContext(): AudioContext | null {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getMode(): SoundMode {
    return this.currentMode;
  }

  public getVolume(): number {
    return this.volume;
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    this.notify();
  }

  public setSound(mode: SoundMode) {
    if (this.currentMode === mode) return;
    this.stopCurrent();
    this.currentMode = mode;
    if (mode === 'none') {
      this.notify();
      return;
    }

    const ctx = this.getContext();
    if (!ctx) {
      this.notify();
      return;
    }

    // Master gain
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 1.2);
    master.connect(ctx.destination);
    this.masterGain = master;

    if (mode === 'rain') {
      this.startRain(ctx, master);
    } else if (mode === 'fireplace') {
      this.startFireplace(ctx, master);
    } else if (mode === 'crickets') {
      this.startCrickets(ctx, master);
    } else if (mode === 'brown') {
      this.startBrownNoise(ctx, master);
    }

    this.notify();
  }

  private stopCurrent() {
    if (this.masterGain && this.ctx) {
      try {
        const ctx = this.ctx;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      } catch {}
    }
    const nodes = [...this.activeNodes];
    this.activeNodes = [];
    setTimeout(() => {
      nodes.forEach(n => {
        try { n.stop(); } catch {}
      });
    }, 600);
  }

  // Generate pink/white noise buffer
  private createNoiseBuffer(ctx: AudioContext, seconds = 5): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Generate brown noise buffer
  private createBrownBuffer(ctx: AudioContext, seconds = 5): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 2.8; // Boost level
    }
    return buffer;
  }

  private startRain(ctx: AudioContext, destination: GainNode) {
    const noiseBuffer = this.createNoiseBuffer(ctx, 4);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Filter to simulate raindrops against glass
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    // LFO to create rain surges
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(150, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(destination);

    noise.start();
    lfo.start();

    this.activeNodes.push({
      stop: () => {
        noise.stop();
        lfo.stop();
        noise.disconnect();
        filter.disconnect();
      },
    });
  }

  private startFireplace(ctx: AudioContext, destination: GainNode) {
    // Warm low-frequency roar
    const brownBuffer = this.createBrownBuffer(ctx, 4);
    const brown = ctx.createBufferSource();
    brown.buffer = brownBuffer;
    brown.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(450, ctx.currentTime);

    brown.connect(lowpass);
    lowpass.connect(destination);
    brown.start();

    // Random crackle impulses generator using periodic timer
    let crackleTimer: NodeJS.Timeout | null = null;
    const playCrackle = () => {
      if (this.currentMode !== 'fireplace' || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const crackleGain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200 + Math.random() * 1600, now);
        crackleGain.gain.setValueAtTime(0.12 * Math.random(), now);
        crackleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04 + Math.random() * 0.05);

        osc.connect(crackleGain);
        crackleGain.connect(destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } catch {}

      const nextInterval = 200 + Math.random() * 700;
      crackleTimer = setTimeout(playCrackle, nextInterval);
    };
    crackleTimer = setTimeout(playCrackle, 300);

    this.activeNodes.push({
      stop: () => {
        if (crackleTimer) clearTimeout(crackleTimer);
        brown.stop();
        brown.disconnect();
        lowpass.disconnect();
      },
    });
  }

  private startCrickets(ctx: AudioContext, destination: GainNode) {
    // Soft wind background
    const noiseBuffer = this.createNoiseBuffer(ctx, 4);
    const wind = ctx.createBufferSource();
    wind.buffer = noiseBuffer;
    wind.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(400, ctx.currentTime);
    windFilter.Q.setValueAtTime(1.5, ctx.currentTime);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.3, ctx.currentTime);

    wind.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(destination);
    wind.start();

    // High pitched crickets pattern
    let cricketTimer: NodeJS.Timeout | null = null;
    const playCricket = () => {
      if (this.currentMode !== 'crickets' || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(4500 + Math.random() * 300, now);

        // Rapid trill
        cGain.gain.setValueAtTime(0, now);
        for (let i = 0; i < 4; i++) {
          const t = now + i * 0.035;
          cGain.gain.setValueAtTime(0.06, t);
          cGain.gain.setValueAtTime(0, t + 0.02);
        }

        osc.connect(cGain);
        cGain.connect(destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } catch {}

      const nextInterval = 800 + Math.random() * 1500;
      cricketTimer = setTimeout(playCricket, nextInterval);
    };
    cricketTimer = setTimeout(playCricket, 400);

    this.activeNodes.push({
      stop: () => {
        if (cricketTimer) clearTimeout(cricketTimer);
        wind.stop();
        wind.disconnect();
        windFilter.disconnect();
      },
    });
  }

  private startBrownNoise(ctx: AudioContext, destination: GainNode) {
    const brownBuffer = this.createBrownBuffer(ctx, 4);
    const brown = ctx.createBufferSource();
    brown.buffer = brownBuffer;
    brown.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(600, ctx.currentTime);

    brown.connect(lowpass);
    lowpass.connect(destination);
    brown.start();

    this.activeNodes.push({
      stop: () => {
        brown.stop();
        brown.disconnect();
        lowpass.disconnect();
      },
    });
  }
}

export const ambientAudio = new AmbientAudioEngine();

export function useAmbientAudio() {
  const [mode, setMode] = useState<SoundMode>(ambientAudio.getMode());
  const [volume, setVolumeState] = useState<number>(ambientAudio.getVolume());

  useEffect(() => {
    return ambientAudio.subscribe(() => {
      setMode(ambientAudio.getMode());
      setVolumeState(ambientAudio.getVolume());
    });
  }, []);

  return {
    mode,
    volume,
    setMode: (m: SoundMode) => ambientAudio.setSound(m),
    setVolume: (v: number) => ambientAudio.setVolume(v),
    isPlaying: mode !== 'none',
    error: null as string | null,
  };
}
