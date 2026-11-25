// Web Audio API Synthesizer for high-fidelity sleep soundscapes and smart alarms

class SleepAudioEngine {
  private ctx: AudioContext | null = null;
  private activeNodes: Map<string, { gainNode: GainNode; stop: () => void }> = new Map();
  private masterGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public setChannelVolume(trackId: string, volume: number) {
    const channel = this.activeNodes.get(trackId);
    if (channel && this.ctx) {
      channel.gainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05);
    }
  }

  public playTrack(trackId: string, initialVolume = 0.6) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.activeNodes.has(trackId)) {
      this.setChannelVolume(trackId, initialVolume);
      return;
    }

    const channelGain = this.ctx.createGain();
    channelGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    channelGain.gain.exponentialRampToValueAtTime(Math.max(0.01, initialVolume), this.ctx.currentTime + 0.8);
    channelGain.connect(this.masterGain);

    let stopFn: () => void = () => {};

    try {
      if (trackId === 'rain' || trackId === 'heavy_rain') {
        stopFn = this.createRainSynthesizer(channelGain);
      } else if (trackId === 'ocean' || trackId === 'tides') {
        stopFn = this.createOceanSynthesizer(channelGain);
      } else if (trackId === 'hearth' || trackId === 'campfire') {
        stopFn = this.createHearthSynthesizer(channelGain);
      } else if (trackId === 'binaural_alpha' || trackId === 'alpha_waves') {
        stopFn = this.createBinauralBeats(channelGain, 216, 8); // 8Hz alpha
      } else if (trackId === 'binaural_theta' || trackId === 'theta_dream') {
        stopFn = this.createBinauralBeats(channelGain, 136, 5); // 5Hz deep theta
      } else if (trackId === 'brown_noise' || trackId === 'deep_space') {
        stopFn = this.createBrownNoise(channelGain);
      } else if (trackId === 'forest' || trackId === 'crickets') {
        stopFn = this.createNightForest(channelGain);
      } else if (trackId === 'singing_bowl' || trackId === 'zen_meditation') {
        stopFn = this.createSingingBowlLoop(channelGain);
      } else {
        // Fallback: warm ambient pink noise drone
        stopFn = this.createBrownNoise(channelGain);
      }
    } catch (err) {
      console.warn('Audio synthesis initialized with fallback', err);
    }

    this.activeNodes.set(trackId, {
      gainNode: channelGain,
      stop: () => {
        if (this.ctx) {
          channelGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
          setTimeout(() => {
            stopFn();
            try {
              channelGain.disconnect();
            } catch {
              // ignore
            }
          }, 600);
        } else {
          stopFn();
        }
      },
    });
  }

  public stopTrack(trackId: string) {
    const channel = this.activeNodes.get(trackId);
    if (channel) {
      channel.stop();
      this.activeNodes.delete(trackId);
    }
  }

  public stopAll() {
    this.activeNodes.forEach((node) => node.stop());
    this.activeNodes.clear();
  }

  public isPlaying(trackId: string): boolean {
    return this.activeNodes.has(trackId);
  }

  // Preview an alarm sound effect
  public playAlarmPreview(soundName: string) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const chimeGain = this.ctx.createGain();
    chimeGain.connect(this.masterGain);
    const now = this.ctx.currentTime;

    const notes = soundName === 'harp' 
      ? [261.63, 329.63, 392.00, 523.25, 659.25] // C, E, G, C, E
      : soundName === 'cosmic'
      ? [196.00, 246.94, 293.66, 369.99, 440.00]
      : [440, 554.37, 659.25, 880]; // Forest dawn chime

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);
      
      noteGain.gain.setValueAtTime(0, now + idx * 0.18);
      noteGain.gain.linearRampToValueAtTime(0.2, now + idx * 0.18 + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.18 + 1.2);
      
      osc.connect(noteGain);
      noteGain.connect(chimeGain);
      
      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 1.3);
    });
  }

  // --- Synthesizer Helpers ---

  private createRainSynthesizer(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to sound like soothing rainfall
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(850, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(120, this.ctx.currentTime);

    whiteNoise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(targetGain);

    whiteNoise.start();

    return () => {
      try {
        whiteNoise.stop();
        whiteNoise.disconnect();
      } catch {
        // ignore
      }
    };
  }

  private createOceanSynthesizer(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.3;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Filter that sweeps like waves
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    // LFO to modulate wave swell
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.09, this.ctx.currentTime); // ~11 sec wave cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(targetGain);

    lfo.start();
    noise.start();

    return () => {
      try {
        noise.stop();
        lfo.stop();
        noise.disconnect();
      } catch {
        // ignore
      }
    };
  }

  private createHearthSynthesizer(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // brown noise rumble with occasional crackle clicks
      const isPop = Math.random() < 0.0018;
      const pop = isPop ? (Math.random() - 0.5) * 1.5 : 0;
      data[i] = (lastOut + 0.02 * white) / 1.02 + pop;
      lastOut = data[i];
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);

    src.connect(filter);
    filter.connect(targetGain);
    src.start();

    return () => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // ignore
      }
    };
  }

  private createBinauralBeats(targetGain: GainNode, baseFreq: number, beatFreq: number): () => void {
    if (!this.ctx) return () => {};
    // Left ear: baseFreq
    // Right ear: baseFreq + beatFreq
    const merger = this.ctx.createChannelMerger(2);

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(baseFreq + beatFreq, this.ctx.currentTime);

    // Warm sub harmonic pad for extra coziness
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(baseFreq / 2, this.ctx.currentTime);
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    subOsc.connect(subGain);

    oscLeft.connect(merger, 0, 0); // Left channel
    oscRight.connect(merger, 0, 1); // Right channel
    subGain.connect(merger, 0, 0);
    subGain.connect(merger, 0, 1);

    merger.connect(targetGain);

    oscLeft.start();
    oscRight.start();
    subOsc.start();

    return () => {
      try {
        oscLeft.stop();
        oscRight.stop();
        subOsc.stop();
        merger.disconnect();
      } catch {
        // ignore
      }
    };
  }

  private createBrownNoise(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // boost volume
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    src.connect(filter);
    filter.connect(targetGain);
    src.start();

    return () => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // ignore
      }
    };
  }

  private createNightForest(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    // Gentle wind + high subtle cricket chimes
    const wind = this.createRainSynthesizer(targetGain);

    const chirpOsc = this.ctx.createOscillator();
    chirpOsc.type = 'sine';
    chirpOsc.frequency.setValueAtTime(4200, this.ctx.currentTime);

    const chirpMod = this.ctx.createOscillator();
    chirpMod.frequency.setValueAtTime(14, this.ctx.currentTime); // pulsating chirp rhythm

    const chirpModGain = this.ctx.createGain();
    chirpModGain.gain.setValueAtTime(400, this.ctx.currentTime);
    chirpMod.connect(chirpModGain);
    chirpModGain.connect(chirpOsc.frequency);

    const chirpGain = this.ctx.createGain();
    chirpGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    chirpOsc.connect(chirpGain);
    chirpGain.connect(targetGain);

    chirpOsc.start();
    chirpMod.start();

    return () => {
      try {
        wind();
        chirpOsc.stop();
        chirpMod.stop();
        chirpGain.disconnect();
      } catch {
        // ignore
      }
    };
  }

  private createSingingBowlLoop(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(282, this.ctx.currentTime);

    const harmonic = this.ctx.createOscillator();
    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(564, this.ctx.currentTime);

    const harmGain = this.ctx.createGain();
    harmGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    harmonic.connect(harmGain);

    osc.connect(targetGain);
    harmGain.connect(targetGain);

    osc.start();
    harmonic.start();

    return () => {
      try {
        osc.stop();
        harmonic.stop();
      } catch {
        // ignore
      }
    };
  }
}

export const audioEngine = new SleepAudioEngine();
