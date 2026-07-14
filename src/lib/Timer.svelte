<script>
  import { timer, bounceTimer, muteTick, muteSfx, allSolved, selectedMission, solvedParts } from './stores.js';
  import { playAudio, playTick } from './audio.js';

  let isBouncing = $derived($bounceTimer);
  let isRunning = $derived($timer.running);
  let isOvertime = $derived($timer.overtime);
  let mins = $derived($timer.minutes);
  let secs = $derived($timer.seconds);

  let timesupPlayed = false;

  $effect(() => {
    if ($timer.overtime && !timesupPlayed) {
      timesupPlayed = true;
      playAudio('assets/timesup.wav');
    }
    if (!$timer.overtime) {
      timesupPlayed = false;
    }
  });

  $effect(() => {
    if (isRunning && !isOvertime && mins > 0 && mins % 5 === 0 && secs === 0) {
      playAudio('assets/info.wav');
    }
  });

  $effect(() => {
    if ($timer.tickCount > 0 && $timer.running && !$timer.overtime) {
      playTick();
    }
  });

  $effect(() => {
    if ($bounceTimer) {
      const t = setTimeout(() => bounceTimer.set(false), 500);
      return () => clearTimeout(t);
    }
  });

  function restart() {
    timer.reset();
    solvedParts.set([false, false, false]);
    selectedMission.set(null);
  }
</script>

<div class="timer-bar">
  {#if $allSolved}
    <button class="timer-btn restart" onclick={restart}>
      RESTART
    </button>
  {:else}
    <button
      class="timer-btn"
      class:running={isRunning}
      onclick={() => timer.toggle()}
    >
      {#if isRunning}
        STOP
      {:else if $timer.hasStarted}
        RESUME
      {:else}
        START
      {/if}
    </button>
  {/if}

  <div class="timer-display" class:overtime={isOvertime} class:bouncing={isBouncing}>
    <span class="prefix">{isOvertime ? '+' : '\u00A0'}</span>
    <span class="segment">{String(mins).padStart(2, '0')}</span>
    <span class="colon">:</span>
    <span class="segment">{String(secs).padStart(2, '0')}</span>
  </div>

  <span class="timer-status">
    {#if isOvertime}
      Time's up
    {:else if isRunning}
      Running
    {:else if $timer.hasStarted}
      Paused
    {:else}
      Ready
    {/if}
  </span>

  <div class="mute-toggles">
    <button
      class="mute-btn"
      class:active={!$muteTick}
      onclick={() => muteTick.update((v) => !v)}
      title={$muteTick ? 'Unmute tick' : 'Mute tick'}
    >
      TICK
    </button>
    <button
      class="mute-btn"
      class:active={!$muteSfx}
      onclick={() => muteSfx.update((v) => !v)}
      title={$muteSfx ? 'Unmute sounds' : 'Mute sounds'}
    >
      SFX
    </button>
  </div>
</div>

<style>
  .timer-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.75rem 2rem;
    background: #1a1a1a;
    border-top: 2px solid #ffc107;
    flex-wrap: wrap;
  }

  .timer-btn {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0.1em;
    padding: 0.5rem 1.5rem;
    border: 2px solid #ffc107;
    border-radius: 6px;
    background: transparent;
    color: #ffc107;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
  }

  .timer-btn:hover {
    background: #ffc107;
    color: #1a1a1a;
  }

  .timer-btn.running {
    border-color: #e53935;
    color: #e53935;
  }

  .timer-btn.running:hover {
    background: #e53935;
    color: #fff;
  }

  .timer-btn.restart {
    border-color: #4caf50;
    color: #4caf50;
  }

  .timer-btn.restart:hover {
    background: #4caf50;
    color: #fff;
  }

  .timer-display {
    font-family: 'Plus Jakarta Sans', monospace;
    font-weight: 800;
    font-size: 2.25rem;
    letter-spacing: 0.05em;
    color: #ffc107;
    background: #111;
    padding: 0.3rem 1.25rem;
    border-radius: 6px;
    border: 1px solid #333;
    display: flex;
    align-items: center;
    gap: 2px;
    min-width: 170px;
    justify-content: center;
  }

  .timer-display.overtime {
    color: #e53935;
    animation: overtime-pulse 1s ease-in-out infinite;
  }

  @keyframes overtime-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .prefix {
    font-size: 1.5rem;
    opacity: 0.3;
    transition: opacity 0.2s;
  }

  .overtime .prefix {
    opacity: 1;
  }

  .segment {
    font-variant-numeric: tabular-nums;
  }

  .colon {
    opacity: 1;
  }

  :global(.bouncing) .timer-display {
    animation: bounce-out-down 0.5s ease-in-out;
  }

  @keyframes bounce-out-down {
    0%   { transform: scale(1.15); }
    25%  { opacity: 1; transform: translateY(-3px) scale(0.9); }
    100% { opacity: 0; transform: translateY(120px) scaleY(0.8); }
  }

  .timer-status {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    color: #777;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    min-width: 70px;
    text-align: center;
  }

  .mute-toggles {
    display: flex;
    gap: 4px;
  }

  .mute-btn {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    padding: 4px 8px;
    border: 1px solid #555;
    border-radius: 4px;
    background: transparent;
    color: #555;
    cursor: pointer;
    transition: all 0.2s;
  }

  .mute-btn.active {
    border-color: #ffc107;
    color: #ffc107;
  }

  .mute-btn:hover {
    border-color: #888;
    color: #888;
  }

  .mute-btn.active:hover {
    border-color: #ffc107;
    color: #ffc107;
  }

  @media (max-width: 500px) {
    .timer-bar {
      padding: 0.75rem 1rem;
    }

    .timer-display {
      font-size: 1.6rem;
      padding: 0.25rem 0.75rem;
    }
  }
</style>
