<script lang="ts">
  import { actions } from '../lib/store';
  import { EXERCISES, type Exercise } from '../lib/curriculum';
  import Icon from './Icon.svelte';

  let selectedLevel = 0; // 0 = all
  let searchQuery = '';

  const LEVELS = [
    { lvl: 0, label: 'All 25' },
    { lvl: 1, label: 'L1 Mechanics' },
    { lvl: 2, label: 'L2 Basic Forms' },
    { lvl: 3, label: 'L3 Form Control' },
    { lvl: 4, label: 'L4 Construction' },
    { lvl: 5, label: 'L5 Imagination' }
  ];

  $: filteredExercises = EXERCISES.filter((e) => {
    const matchesLevel = selectedLevel === 0 || e.lvl === selectedLevel;
    if (!matchesLevel) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      e.name.toLowerCase().includes(q) ||
      e.purpose.toLowerCase().includes(q) ||
      e.pit.toLowerCase().includes(q) ||
      e.fix.toLowerCase().includes(q) ||
      `ex ${e.n}`.includes(q) ||
      e.n.includes(q)
    );
  });
</script>

<div class="exercises-view">
  <header class="ex-header">
    <h1 class="page-title">The 25 Exercises</h1>
    <p class="subtitle">
      The core spine of the curriculum from brokendraw's companion book. Twenty-five progressive drills arranged across five levels.
    </p>

    <!-- Search Box -->
    <div class="search-row">
      <div class="search-input-wrap">
        <span class="search-icon"><Icon name="pencil" size={16} /></span>
        <input
          type="text"
          class="search-input"
          aria-label="Search exercises"
          placeholder="Search by drill, topic, or pitfall (e.g. cylinder, ghosting, box)..."
          bind:value={searchQuery}
        />
        {#if searchQuery}
          <button
            type="button"
            class="clear-search-btn"
            onclick={() => (searchQuery = '')}
            aria-label="Clear search"
          >
            <Icon name="cancel" size={12} />
          </button>
        {/if}
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      {#each LEVELS as l}
        <button
          type="button"
          class="filter-btn"
          class:active={selectedLevel === l.lvl}
          onclick={() => (selectedLevel = l.lvl)}
        >
          {l.label}
        </button>
      {/each}
    </div>
  </header>

  {#if filteredExercises.length === 0}
    <div class="empty-state">
      <Icon name="ruler" size={40} />
      <h3 class="empty-title">No exercises match "{searchQuery}"</h3>
      <p class="empty-desc">Try searching for broader keywords like "line", "contour", "box", or reset the level filter.</p>
      <button
        type="button"
        class="reset-filter-btn"
        onclick={() => { searchQuery = ''; selectedLevel = 0; }}
      >
        Reset Filters
      </button>
    </div>
  {:else}
    <div class="exercises-grid">
      {#each filteredExercises as ex}
        <div class="exercise-card">
          <div class="card-meta">
            <span class="ex-number">Ex {ex.n} · p.{ex.p}</span>
            <span class="lvl-badge">Level {ex.lvl}</span>
          </div>

          <h2 class="ex-name">{ex.name}</h2>

          <p class="ex-purpose">{ex.purpose}</p>

          <div class="reps-box">
            <span class="reps-label">Recommended:</span>
            <span class="reps-val">{ex.reps}</span>
          </div>

          <div class="pitfall-box">
            <div class="item-line">
              <Icon name="error" size={14} /> <strong>Pitfall:</strong> {ex.pit}
            </div>
            <div class="item-line fix-line">
              <Icon name="checkmark" size={14} /> <strong>Fix:</strong> {ex.fix}
            </div>
          </div>

          <button
            type="button"
            class="open-drawer-btn"
            onclick={() => actions.openExerciseDrawer(ex.n)}
          >
            Open Slide Drawer ↗
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .exercises-view {
    padding: 36px 44px 80px;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
  }

  .ex-header {
    margin-bottom: 36px;
  }

  .page-title {
    font-family: var(--font-display);
    font-size: 64px;
    line-height: 1.05;
    letter-spacing: 0.02em;
    margin: 0;
    color: var(--ink);
  }

  .subtitle {
    font-size: 16px;
    line-height: 1.55;
    color: var(--ink-78);
    max-width: 65ch;
    margin: 12px 0 0;
  }

  .search-row {
    margin-top: 24px;
  }

  .search-input-wrap {
    position: relative;
    max-width: 520px;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 14px;
    pointer-events: none;
    opacity: 0.6;
  }

  .search-input {
    width: 100%;
    padding: 12px 48px 12px 42px;
    min-height: 44px;
    border-radius: var(--radius-pill);
    background: var(--card);
    border: 1px solid var(--line);
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--ink);
    outline: none;
    transition: border-color 150ms var(--ease-out), box-shadow 150ms var(--ease-out);
  }

  .search-input:focus {
    border-color: var(--ink);
    box-shadow: 0 0 0 2px var(--accent);
  }

  .clear-search-btn {
    position: absolute;
    right: 2px;
    width: 44px;
    height: 44px;
    color: var(--ink);
    background: transparent;
    border: 0;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition: opacity 120ms ease;
  }

  .clear-search-btn:hover {
    opacity: 1;
  }

  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }

  .filter-btn {
    appearance: none;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius-pill);
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    color: var(--ink-78);
    cursor: pointer;
    transition: background 140ms var(--ease-out), color 140ms var(--ease-out), border-color 140ms var(--ease-out);
  }

  .filter-btn:hover {
    color: var(--ink);
    border-color: var(--line-2);
  }

  .filter-btn.active {
    background: var(--ink);
    color: var(--canvas);
    border-color: var(--ink);
  }

  .exercises-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
    gap: 20px;
  }

  .exercise-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius-card);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
    transition: transform 180ms var(--ease-out), box-shadow 180ms var(--ease-out);
  }

  @media (hover: hover) and (pointer: fine) {
    .exercise-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px var(--track);
    }
  }

  .card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ex-number {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-62);
  }

  .lvl-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: var(--radius-pill);
    background: var(--line);
    color: var(--ink);
  }

  .ex-name {
    font-family: var(--font-display);
    font-size: 26px;
    line-height: 1.15;
    letter-spacing: 0.02em;
    margin: 0;
    color: var(--ink);
  }

  .ex-purpose {
    font-size: 14px;
    line-height: 1.55;
    color: var(--ink-78);
    margin: 0;
  }

  .reps-box {
    display: flex;
    gap: 8px;
    align-items: baseline;
    font-size: 14px;
  }

  .reps-label {
    color: var(--ink-62);
  }

  .reps-val {
    font-weight: 700;
    color: var(--accent);
  }

  .pitfall-box {
    background: var(--canvas);
    border: 1px solid var(--line);
    border-radius: var(--radius-action);
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: var(--text-body);
    line-height: var(--leading-body);
  }

  .item-line {
    color: var(--ink-78);
  }

  .fix-line {
    color: var(--ink);
    font-weight: 500;
  }

  .open-drawer-btn {
    min-height: 44px;
    appearance: none;
    background: transparent;
    border: 0;
    color: var(--accent-ink);
    border-bottom: 1px solid var(--accent-14);
    font-size: var(--text-control);
    font-weight: 600;
    cursor: pointer;
    align-self: flex-start;
    padding: 4px 0;
    margin-top: auto;
    transition: color 120ms ease, border-color 120ms ease;
  }

  .open-drawer-btn:hover {
    color: var(--ink);
    border-bottom-color: var(--ink);
  }

  .empty-state {
    background: var(--card);
    border: 1px dashed var(--line);
    border-radius: var(--radius-card);
    padding: 60px 24px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .empty-title {
    font-family: var(--font-display);
    font-size: 28px;
    margin: 8px 0 0;
    color: var(--ink);
  }

  .empty-desc {
    font-size: 14px;
    color: var(--ink-62);
    max-width: 45ch;
    margin: 0;
  }

  .reset-filter-btn {
    appearance: none;
    background: var(--ink);
    color: var(--canvas);
    border: 0;
    border-radius: var(--radius-pill);
    padding: 8px 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 8px;
    transition: transform 140ms var(--ease-out);
  }

  .reset-filter-btn:active {
    transform: scale(0.97);
  }

  @media (max-width: 600px) {
    .exercises-view {
      padding: 24px 18px 80px;
    }
    .page-title {
      font-size: 44px;
    }
  }
</style>
