<script>
  import Header from './lib/Header.svelte';
  import Main from './lib/Main.svelte';
  import Timer from './lib/Timer.svelte';
  import { sparks } from './lib/sparks.js';
</script>

<Header />
<Main />
<Timer />

{#each $sparks as spark (spark.id)}
  <span
    class="spark"
    style="
      --sx: {spark.x}px;
      --sy: {spark.y}px;
      --sc: {spark.color};
      animation-delay: {spark.delay};
      animation-duration: {spark.duration};
      background: {spark.color};
      width: {spark.size};
      height: {spark.size};
    "
  ></span>
{/each}

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(html),
  :global(body) {
    height: 100%;
    overflow: hidden;
  }

  :global(body) {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #121212;
    color: #e0e0e0;
    -webkit-font-smoothing: antialiased;
    display: flex;
    flex-direction: column;
  }

  :global(#app) {
    display: contents;
  }

  .spark {
    position: fixed;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    box-shadow: 0 0 8px var(--sc);
    animation: spark-burst ease-out forwards;
    pointer-events: none;
    z-index: 100;
  }

  @keyframes spark-burst {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 0.8;
    }
    100% {
      transform: translate(var(--sx), var(--sy)) scale(0);
      opacity: 0;
    }
  }
</style>
