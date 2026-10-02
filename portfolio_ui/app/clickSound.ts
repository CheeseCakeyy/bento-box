// A soft synthesized "tick" for clicks: no audio file, one shared AudioContext,
// and a remembered on/off preference toggled from the header.
export const CLICK_SOUND_KEY = "portfolio-click-sound";

let context: AudioContext | null = null;
let lastPlayed = 0;

export function clickSoundEnabled() {
  try {
    return window.localStorage.getItem(CLICK_SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setClickSoundEnabled(enabled: boolean) {
  try {
    window.localStorage.setItem(CLICK_SOUND_KEY, enabled ? "on" : "off");
  } catch {
    // Storage can be unavailable (private mode); the toggle still works for this page view.
  }
}

export function playClickSound(force = false) {
  if (!force && !clickSoundEnabled()) return;
  // Nested spark layers (e.g. inside a dialog) can report the same click twice.
  const now = performance.now();
  if (now - lastPlayed < 40) return;
  lastPlayed = now;

  const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return;
  context ??= new AudioCtor();
  if (context.state === "suspended") void context.resume();

  const start = context.currentTime;
  const pitch = 1500 + Math.random() * 300;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(pitch, start);
  oscillator.frequency.exponentialRampToValueAtTime(pitch * 0.45, start + 0.05);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.07, start + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.07);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + 0.08);
}
