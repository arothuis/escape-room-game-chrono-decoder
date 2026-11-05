import { muteTick, muteSfx } from './stores.js';

let _muteTick = false;
let _muteSfx = false;
muteTick.subscribe((v) => (_muteTick = v));
muteSfx.subscribe((v) => (_muteSfx = v));

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function playAudio(src) {
  if (_muteSfx) return;
  const audio = new Audio(src);
  audio.play().catch(() => {});
}

export function playTick() {
  if (_muteTick) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 900;
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.04);
}
