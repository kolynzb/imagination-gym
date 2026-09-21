/**
 * Web Audio API synthesized bell & gong sounds for interval training.
 * Zero external audio assets required; runs 100% offline and in all modern browsers.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a calm, resonant Japanese temple bell / Tibetan singing bowl chime.
 * Used when a timer interval finishes (e.g. 10m Warmup -> 50m Drill).
 */
export function playChime(freq = 528, duration = 2.8) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Fundamental + 2 natural harmonics for rich resonance
    const harmonics = [
      { f: freq, gain: 0.35, decay: duration },
      { f: freq * 2.02, gain: 0.15, decay: duration * 0.7 },
      { f: freq * 3.01, gain: 0.08, decay: duration * 0.4 },
    ];

    harmonics.forEach(({ f, gain, decay }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      // Strike attack and smooth exponential decay
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(gain, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + decay);
    });
  } catch (err) {
    console.warn('Could not play audio chime:', err);
  }
}

/**
 * Short acoustic tick for start/pause toggle.
 */
export function playBlip(pitch = 880) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // ignore
  }
}
