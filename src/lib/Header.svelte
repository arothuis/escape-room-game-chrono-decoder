<script>
  import { selectedMission, solvedParts } from './stores.js';
  import { missionNames } from './answers.js';

  function selectMission(e) {
    const name = e.target.value;
    if (name) {
      selectedMission.set(name);
      solvedParts.set([false, false, false]);
    }
  }
</script>

<header>
  <div class="logo-area">
    <img
      src="assets/escaperoom.png"
      alt="Escape Room The Game"
      class="logo-img"
    />
  </div>

  <select class="mission-select" onchange={selectMission}>
    <option value="">Choose a mission…</option>
    {#each missionNames as name}
      <option value={name} selected={$selectedMission === name}>{name}</option>
    {/each}
  </select>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 2rem;
    background: #1a1a1a;
    border-bottom: 2px solid #ffc107;
    flex-wrap: wrap;
  }

  .logo-area {
    display: flex;
    align-items: center;
  }

  .logo-img {
    height: 44px;
    width: auto;
  }

  .mission-select {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    padding: 0.5rem 2.25rem 0.5rem 1rem;
    border: 2px solid #444;
    border-radius: 6px;
    background: #262626;
    color: #eee;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23ffc107' stroke-width='2' fill='none'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    transition: border-color 0.2s;
  }

  .mission-select:hover,
  .mission-select:focus {
    border-color: #ffc107;
    outline: none;
  }

  @media (max-width: 600px) {
    header {
      padding: 0.75rem 1rem;
      justify-content: center;
    }

    .mission-select {
      width: 100%;
    }
  }
</style>
