<script>
  import { selectedMission, solvedParts, allSolved, timer } from './stores.js';
  import KeyInput from './KeyInput.svelte';
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  let currentPart = $state(0);
  let showInput = $state(true);

  $effect(() => {
    if (!$selectedMission) {
      currentPart = 0;
      showInput = true;
      return;
    }
  });

  $effect(() => {
    const parts = $solvedParts;
    if (parts[currentPart] && currentPart < 2) {
      const delay = setTimeout(() => {
        showInput = false;
      }, 250);
      return () => clearTimeout(delay);
    }
  });

  $effect(() => {
    if ($allSolved) {
      timer.stop();
    }
  });

  function onPartOutroEnd() {
    currentPart++;
    showInput = true;
  }

  const confettiColors = ['#ffc107', '#e53935', '#4caf50', '#2196f3', '#ff6f00', '#9c27b0'];

  function randomConfetti() {
    return Array.from({ length: 80 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 80 + (Math.random() - 0.5) * 0.5;
      const distance = 80 + Math.random() * 220;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        delay: `${Math.random() * 0.3}s`,
        duration: `${0.8 + Math.random() * 1.2}s`,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        size: `${6 + Math.random() * 10}px`,
      };
    });
  }

  let confettiPieces = $derived($allSolved ? randomConfetti() : []);
</script>

<main>
  {#if !$selectedMission}
    <div class="welcome">
      <h1>Chrono Decoder</h1>
      <p>Select a mission above to begin entering codes.</p>
      <p class="hint">Use keys <strong>1–6</strong> or letters <strong>A–F</strong>.</p>
    </div>
  {:else if $allSolved}
    <div class="victory">
      <div class="victory-text">
        <span class="check-mark">&#10003;</span>
        <h2>Mission Complete</h2>
        <p>
          {#if $timer.overtime}
            Overtime: +{String($timer.minutes).padStart(2, '0')}:{String($timer.seconds).padStart(2, '0')}
          {:else}
            Time: {String($timer.minutes).padStart(2, '0')}:{String($timer.seconds).padStart(2, '0')}
          {/if}
        </p>
      </div>
      {#each confettiPieces as piece (piece.id)}
        <span
          class="confetti"
          style="
            --x: {piece.x}px;
            --y: {piece.y}px;
            animation-delay: {piece.delay};
            animation-duration: {piece.duration};
            background: {piece.color};
            width: {piece.size};
            height: {piece.size};
          "
        ></span>
      {/each}
    </div>
  {:else}
    <div class="game-area">
      <div class="step-info">
        <span class="step-counter">Code {currentPart + 1} of 3</span>
        <div class="step-dots">
          {#each [0, 1, 2] as i}
            <span
              class="dot"
              class:active={i === currentPart}
              class:done={$solvedParts[i]}
            ></span>
          {/each}
        </div>
      </div>
      <div class="input-stage">
        {#if showInput}
          <div
            class="input-anim"
            in:fly={{ y: 24, duration: 300, easing: quintOut }}
            out:fly={{ y: -24, duration: 250, easing: quintOut }}
            onoutroend={onPartOutroEnd}
          >
            <KeyInput index={currentPart} />
          </div>
        {/if}
      </div>
    </div>
  {/if}
</main>

<style>
  main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    overflow: hidden;
  }

  .welcome {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  h1 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 2rem;
    color: #ffc107;
    margin: 0;
  }

  p {
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #aaa;
    margin: 0;
    font-size: 0.95rem;
  }

  .hint {
    margin-top: 0.5rem;
    padding: 0.4rem 1.25rem;
    background: #262626;
    border: 1px solid #444;
    border-radius: 6px;
    font-size: 0.8rem;
    color: #888;
  }

  .hint strong {
    color: #ddd;
  }

  .game-area {
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .step-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .step-counter {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    color: #ffc107;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .step-dots {
    display: flex;
    gap: 6px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #333;
    transition: all 0.3s;
  }

  .dot.active {
    background: #ffc107;
    box-shadow: 0 0 6px rgba(255, 193, 7, 0.4);
  }

  .dot.done {
    background: #4caf50;
  }

  .input-stage {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .input-anim {
    width: 100%;
  }

  .victory {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    position: relative;
    z-index: 1;
  }

  .victory-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .check-mark {
    font-size: 3.5rem;
    color: #4caf50;
    font-weight: 800;
    animation: scale-in 0.4s ease-out;
  }

  @keyframes scale-in {
    from { transform: scale(0); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }

  .victory-text h2 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 1.75rem;
    color: #ffc107;
    margin: 0;
  }

  .victory-text p {
    color: #aaa;
    font-size: 0.95rem;
  }

  .confetti {
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 2px;
    animation: confetti-burst ease-out forwards;
    pointer-events: none;
  }

  @keyframes confetti-burst {
    0% {
      transform: translate(0, 0) rotate(0deg) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(var(--x), var(--y)) rotate(720deg) scale(0.3);
      opacity: 0;
    }
  }

  @media (max-width: 600px) {
    main {
      padding: 1rem;
    }

    h1 {
      font-size: 1.5rem;
    }

    .victory-text h2 {
      font-size: 1.4rem;
    }
  }
</style>
