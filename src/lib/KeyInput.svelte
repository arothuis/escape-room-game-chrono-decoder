<script>
  import { selectedMission, currentAnswers, solvedParts, timer, bounceTimer } from './stores.js';
  import { playAudio } from './audio.js';
  import { fade } from 'svelte/transition';
  import { sparks } from './sparks.js';

  let { index } = $props();

  const keyMap = {
    A: 1, B: 6, C: 5, D: 2, E: 4, F: 3,
    a: 1, b: 6, c: 5, d: 2, e: 4, f: 3,
  };

  let value = $state('');
  let reveal = $state('');
  let statusClass = $state('');
  let shake = $state(false);
  let locked = $derived(!$timer.hasStarted);
  let inputEl = $state(null);

  $effect(() => {
    if (locked || $solvedParts[index]) return;

    function onKeyDown(e) {
      if (e.target === inputEl) return;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        value = value.slice(0, -1);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        value = '';
        return;
      }
      if (/^[1-6]$/.test(e.key)) {
        e.preventDefault();
        pressKey(Number(e.key));
        return;
      }
      if (/^[a-fA-F]$/.test(e.key)) {
        e.preventDefault();
        value = value + e.key.toUpperCase();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  $effect(() => {
    if (!$selectedMission) {
      value = '';
      reveal = '';
      statusClass = '';
    }
  });

  $effect(() => {
    if ($solvedParts[index]) {
      reveal = 'Correct';
      statusClass = 'correct';
    }
  });

  function handleInput(e) {
    value = e.target.value.replace(/[^1-6a-fA-F]/g, '');
  }

  function handleKeyDown(e) {
    if (!/^[1-6a-fA-F]$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
      e.preventDefault();
    }
  }

  $effect(() => {
    if (value.length < 4) {
      reveal = '';
      statusClass = '';
      return;
    }

    const answers = $currentAnswers;
    if (!answers) return;

    const mapped = [...value].map((k) => keyMap[k] ?? k).join('');
    const expected = answers[index];

    if (mapped === expected) {
      reveal = 'Correct';
      statusClass = 'correct';
      playAudio('assets/correct.wav');
      sparks.green();
      solvedParts.update((parts) => {
        const updated = [...parts];
        updated[index] = true;
        return updated;
      });
    } else {
      reveal = 'Wrong';
      statusClass = 'incorrect';
      shake = true;
      setTimeout(() => (shake = false), 500);
      playAudio('assets/wrong.wav');
      sparks.red();
      timer.penalize();
      bounceTimer.set(true);
    }
  });

  function getMappedKey(pos) {
    if (pos >= value.length) return null;
    return keyMap[value[pos]] ?? value[pos];
  }

  function pressKey(digit) {
    if (locked || $solvedParts[index] || value.length >= 4) return;
    value = value + String(digit);
  }

  function pressBackspace() {
    if (locked || $solvedParts[index]) return;
    value = value.slice(0, -1);
  }

  function pressClear() {
    if (locked || $solvedParts[index]) return;
    value = '';
  }
</script>

<div class="key-input-wrapper">
  <div class="key-input {statusClass}" class:shake class:locked>
  {#if locked}
    <button class="locked-overlay" onclick={() => timer.toggle()} transition:fade={{ duration: 300 }}>
      Press START to begin
    </button>
  {/if}

  <span class="part-label">Code {index + 1}</span>

  <div class="keys-display">
    {#each [0, 1, 2, 3] as pos}
      <div class="key-slot" class:filled={pos < value.length}>
        {#if getMappedKey(pos)}
          <img src="assets/key{getMappedKey(pos)}.png" alt="Key {getMappedKey(pos)}" />
        {:else}
          <span class="slot-dot"></span>
        {/if}
      </div>
    {/each}
  </div>

  <div class="input-row">
    <input
      type="text"
      maxlength="4"
      value={value}
      disabled={locked}
      oninput={handleInput}
      onkeydown={handleKeyDown}
      placeholder="Enter 4-key code"
      autocomplete="off"
      bind:this={inputEl}
    />
    <button
      class="backspace-btn"
      disabled={locked || $solvedParts[index]}
      onclick={() => pressBackspace()}
      title="Delete"
    >
      <span>&#9003;</span>
    </button>
    <button
      class="backspace-btn"
      disabled={locked || $solvedParts[index]}
      onclick={() => pressClear()}
      title="Clear"
    >
      <span class="clear-icon"></span>
    </button>
  </div>

  <div class="keypad">
    {#each [1, 2, 3, 4, 5, 6] as digit}
      <button
        class="keypad-btn"
        disabled={locked || $solvedParts[index]}
        onclick={() => pressKey(digit)}
        title="Key {digit}"
      >
        <img src="assets/key{digit}.png" alt="Key {digit}" />
      </button>
    {/each}
  </div>
  </div>

  <div class="reveal {statusClass}" aria-live="polite">
    {#if reveal}
      {reveal}
    {/if}
  </div>
</div>

<style>
  .key-input-wrapper {
    position: relative;
    z-index: 2;
    padding-bottom: 28px;
  }

  .key-input {
    background: #262626;
    border: 2px solid #444;
    border-radius: 8px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: border-color 0.3s, box-shadow 0.3s;
    position: relative;
  }

  .key-input.locked {
    opacity: 0.6;
  }

  .locked-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(18, 18, 18, 0.7);
    border: none;
    border-radius: 6px;
    z-index: 10;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: #ffc107;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: background 0.2s;
    width: 100%;
  }

  .locked-overlay:hover {
    background: rgba(18, 18, 18, 0.55);
  }

  :global(.key-input.correct) {
    border-color: #4caf50;
    box-shadow: 0 0 24px rgba(76, 175, 80, 0.45), 0 0 8px rgba(76, 175, 80, 0.25), inset 0 0 16px rgba(76, 175, 80, 0.08);
  }

  :global(.key-input.incorrect) {
    border-color: #e53935;
    box-shadow: 0 0 24px rgba(229, 57, 53, 0.45), 0 0 8px rgba(229, 57, 53, 0.25), inset 0 0 16px rgba(229, 57, 53, 0.08);
  }

  .part-label {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: #999;
    text-transform: uppercase;
  }

  .keys-display {
    display: flex;
    gap: 6px;
    padding: 6px;
    border-radius: 6px;
    background: #1a1a1a;
    transition: background 0.3s;
  }

  .correct .keys-display {
    background: rgba(76, 175, 80, 0.06);
  }

  .incorrect .keys-display {
    background: rgba(229, 57, 53, 0.06);
  }

  .key-slot {
    flex: 1;
    aspect-ratio: 1;
    border: 1px dashed #444;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1e1e1e;
    transition: all 0.2s;
    overflow: hidden;
  }

  .key-slot.filled {
    border-color: #555;
    border-style: solid;
    background: #222;
    position: relative;
  }

  .key-slot.filled::after {
    content: '';
    position: absolute;
    inset: 0;
    background: #c9a84c;
    mix-blend-mode: multiply;
    pointer-events: none;
    border-radius: 5px;
  }

  .key-slot img {
    width: 75%;
    height: 75%;
    object-fit: contain;
    animation: drop-in 0.2s ease-out;
    filter: saturate(0) brightness(1.5);
  }

  @keyframes drop-in {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .slot-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #333;
  }

  .input-row {
    display: flex;
    gap: 6px;
    min-width: 0;
  }

  input {
    font-family: 'SF Mono', 'Cascadia Code', 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 1.25rem;
    letter-spacing: 1.2em;
    padding: 0.6rem 0.5rem 0.6rem 1rem;
    border: 1px solid #444;
    border-radius: 6px;
    background: #1a1a1a;
    color: #eee;
    outline: none;
    transition: border-color 0.3s;
    text-transform: uppercase;
    flex: 1;
    min-width: 0;
    box-sizing: border-box;
  }

  input:disabled {
    color: #555;
    cursor: not-allowed;
  }

  input::placeholder {
    color: #555;
    letter-spacing: 0.05em;
    font-size: 0.85rem;
  }

  input:focus {
    border-color: #ffc107;
  }

  .backspace-btn {
    width: 44px;
    border: 1px solid #444;
    border-radius: 6px;
    background: #1e1e1e;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    color: #888;
    font-size: 1.1rem;
  }

  .backspace-btn:hover:not(:disabled) {
    border-color: #e53935;
    color: #e53935;
    background: rgba(229, 57, 53, 0.08);
  }

  .backspace-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .clear-icon {
    position: relative;
    width: 14px;
    height: 14px;
  }

  .clear-icon::before,
  .clear-icon::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 100%;
    background: #888;
    border-radius: 1px;
    transition: background 0.15s;
  }

  .clear-icon::before {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  .clear-icon::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }

  .backspace-btn:hover:not(:disabled) .clear-icon::before,
  .backspace-btn:hover:not(:disabled) .clear-icon::after {
    background: #e53935;
  }

  .reveal {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -28px;
    height: 24px;
    line-height: 24px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0.1em;
    text-align: center;
    text-transform: uppercase;
  }

  .reveal.correct { color: #4caf50; }
  .reveal.incorrect { color: #e53935; }

  @keyframes reveal-pop {
    from { opacity: 0; transform: scale(0.8); }
    to   { opacity: 1; transform: scale(1); }
  }

  .shake {
    animation: shake-anim 0.5s ease-in-out;
  }

  @keyframes shake-anim {
    0%, 100% { transform: translateX(0); }
    10%, 50%, 90% { transform: translateX(-3px); }
    30%, 70% { transform: translateX(3px); }
  }

  .keypad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  .keypad-btn {
    aspect-ratio: 1;
    border: 1px solid #444;
    border-radius: 8px;
    background: #1e1e1e;
    cursor: pointer;
    padding: 8px;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .keypad-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: #c9a84c;
    mix-blend-mode: multiply;
    pointer-events: none;
    border-radius: 6px;
  }

  .keypad-btn:hover:not(:disabled) {
    border-color: #ffc107;
    background: #2a2a2a;
    transform: translateY(-1px);
  }

  .keypad-btn:active:not(:disabled) {
    transform: translateY(0) scale(0.95);
  }

  .keypad-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .keypad-btn img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
    filter: saturate(0) brightness(1.5);
  }
</style>
