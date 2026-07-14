import { writable, derived } from 'svelte/store';
import { missions } from './answers.js';

export const selectedMission = writable(null);
export const solvedParts = writable([false, false, false]);

export const currentAnswers = derived(selectedMission, ($mission) => {
  return $mission ? missions[$mission] : null;
});

export const allSolved = derived(solvedParts, ($parts) => {
  return $parts.every(Boolean);
});

function createTimerStore() {
  const { subscribe, set, update } = writable({
    running: false,
    hasStarted: false,
    overtime: false,
    tickCount: 0,
    minutes: 60,
    seconds: 0,
  });

  let intervalId = null;

  function tick() {
    update((t) => {
      if (!t.running) return t;
      let { minutes, seconds, overtime } = t;

      if (overtime) {
        seconds++;
        if (seconds >= 60) {
          minutes++;
          seconds = 0;
        }
        return { ...t, minutes, seconds };
      }

      seconds--;
      if (seconds < 0) {
        minutes--;
        seconds = 59;
      }

      if (minutes <= 0 && seconds <= 0) {
        return { ...t, minutes: 0, seconds: 0, overtime: true, tickCount: t.tickCount + 1 };
      }

      return { ...t, minutes, seconds, tickCount: t.tickCount + 1 };
    });
  }

  function start() {
    clearInterval(intervalId);
    intervalId = setInterval(tick, 1000);
    update((t) => ({ ...t, running: true, hasStarted: true }));
  }

  function stop() {
    clearInterval(intervalId);
    intervalId = null;
    update((t) => ({ ...t, running: false }));
  }

  function toggle() {
    let current;
    const unsub = subscribe((v) => {
      current = v;
    });
    unsub();

    if (current.running) {
      stop();
    } else {
      start();
    }
  }

  function penalize() {
    update((t) => {
      if (t.overtime) return t;
      if (t.minutes > 0) {
        return { ...t, minutes: t.minutes - 1 };
      }
      return { ...t, seconds: 1 };
    });
  }

  function reset() {
    clearInterval(intervalId);
    intervalId = null;
    set({
      running: false,
      hasStarted: false,
      overtime: false,
      tickCount: 0,
      minutes: 60,
      seconds: 0,
    });
  }

  return { subscribe, toggle, penalize, start, stop, reset };
}

export const timer = createTimerStore();
export const bounceTimer = writable(false);
export const muteTick = writable(false);
export const muteSfx = writable(false);
