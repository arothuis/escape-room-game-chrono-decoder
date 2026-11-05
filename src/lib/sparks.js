import { writable } from 'svelte/store';

function createSparkStore() {
  const { subscribe, set } = writable([]);

  function trigger(colors) {
    const pieces = Array.from({ length: 36 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 36;
      const distance = 60 + Math.random() * 150;
      return {
        id: Date.now() + i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        delay: `${Math.random() * 0.15}s`,
        duration: `${0.6 + Math.random() * 0.6}s`,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: `${12 + Math.random() * 16}px`,
      };
    });
    set(pieces);
    setTimeout(() => set([]), 1500);
  }

  function green() {
    trigger(['#4caf50', '#81c784', '#00e676', '#69f0ae', '#b9f6ca', '#1b5e20']);
  }

  function red() {
    trigger(['#e53935', '#ef5350', '#ff1744', '#ff5252', '#ff8a80', '#b71c1c']);
  }

  return { subscribe, green, red };
}

export const sparks = createSparkStore();
