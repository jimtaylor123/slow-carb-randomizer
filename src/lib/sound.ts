import { loadSoundEnabled } from "./storage";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!loadSoundEnabled()) return null;
  if (ctx === null) {
    if (typeof window === "undefined") return null;
    const w = window as typeof window & { webkitAudioContext?: typeof AudioContext };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => {});
  }
  return ctx;
}

export function unlock(): void {
  getCtx();
}

export function playRattle(): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const dur = 0.12;
  const length = Math.ceil(audioCtx.sampleRate * dur);
  const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const bandpass = audioCtx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 2500;
  bandpass.Q.value = 1.2;
  const gain = audioCtx.createGain();
  const t0 = audioCtx.currentTime;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  source.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
  source.stop(t0 + dur);
}

export function playPop(): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;
  const dur = 0.08;
  const osc = audioCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(500, t0);
  osc.frequency.exponentialRampToValueAtTime(900, t0 + dur);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.15, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + dur);
}
