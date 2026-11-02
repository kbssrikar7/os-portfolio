import { useOS } from './store';

/**
 * Tiny synthesized UI sounds (no audio files). The AudioContext is created on
 * first use, which always follows a user gesture (login click), so browsers
 * never block it. Volume and mute come from Settings.
 */
type Cue = 'login' | 'notify' | 'click' | 'error';

let ctx: AudioContext | null = null;

function tone(c: AudioContext, out: GainNode, freq: number, start: number, dur: number, type: OscillatorType = 'sine', peak = 0.5) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(peak, start + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(out);
  o.start(start);
  o.stop(start + dur + 0.05);
}

export const sound = {
  play(cue: Cue) {
    const { volume, muted } = useOS.getState().settings;
    if (muted || volume === 0) return;
    try {
      ctx ??= new AudioContext();
      if (ctx.state === 'suspended') void ctx.resume();
      const c = ctx;
      const out = c.createGain();
      out.gain.value = (volume / 100) * 0.35;
      out.connect(c.destination);
      const t = c.currentTime + 0.01;
      if (cue === 'login') {
        // A soft rising pentatonic arpeggio.
        [392, 523.25, 659.25, 783.99].forEach((f, i) => tone(c, out, f, t + i * 0.11, 0.9 - i * 0.1, 'sine', 0.42));
        tone(c, out, 196, t, 1.3, 'triangle', 0.18);
      } else if (cue === 'notify') {
        tone(c, out, 880, t, 0.22, 'sine', 0.35);
        tone(c, out, 1318.5, t + 0.08, 0.32, 'sine', 0.3);
      } else if (cue === 'click') {
        tone(c, out, 660, t, 0.06, 'triangle', 0.2);
      } else {
        tone(c, out, 220, t, 0.18, 'square', 0.12);
      }
    } catch {
      /* Web Audio unavailable: stay silent */
    }
  },
};
