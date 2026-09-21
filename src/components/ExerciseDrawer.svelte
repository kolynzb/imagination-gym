<script lang="ts">
  import { state, actions } from '../lib/store';
  import { EXERCISES, type Exercise } from '../lib/curriculum';
  import Icon from './Icon.svelte';

  let s = $state;
  $: s = $state;

  $: activeNum = s.activeExerciseDrawer;
  $: exercise = EXERCISES.find((e) => e.n === activeNum) as Exercise | undefined;

  function close() {
    actions.closeExerciseDrawer();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if exercise}
  <div class="drawer-overlay" role="dialog" aria-modal="true" aria-label="Exercise details">
    <button type="button" class="drawer-backdrop" onclick={close} aria-label="Close drawer"></button>
    <div class="drawer-content">
      <div class="drawer-header">
        <div class="header-meta">
          <span class="ex-num">Exercise {exercise.n}</span>
          <span class="ex-page">Companion Book p.{exercise.p}</span>
          <span class="ex-level">Level {exercise.lvl}</span>
        </div>
        <button type="button" class="close-btn" onclick={close} aria-label="Close drawer"><Icon name="cancel" size={16} /></button>
      </div>

      <h2 class="ex-title">{exercise.name}</h2>

      <div class="card-section">
        <div class="section-label">Purpose</div>
        <p class="section-text">{exercise.purpose}</p>
      </div>

      <div class="card-section highlight-box">
        <div class="section-label">Recommended Reps</div>
        <div class="reps-val">{exercise.reps}</div>
      </div>

      <div class="card-section pitfall-box">
        <div class="section-label">Common Pitfall</div>
        <p class="section-text pitfall-text"><Icon name="error" size={16} /> {exercise.pit}</p>
      </div>

      <div class="card-section fix-box">
        <div class="section-label">The Fix / Technique</div>
        <p class="section-text fix-text"><Icon name="checkmark" size={16} /> {exercise.fix}</p>
      </div>

      <div class="drawer-footer">
        <button
          type="button"
          class="full-dir-btn"
          onclick={() => {
            close();
            actions.setView('exercises');
          }}
        >
          View all 25 Exercises in Library →
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(7, 6, 7, 0.4);
    z-index: 100;
    display: flex;
    justify-content: flex-end;
    animation: fadeIn 200ms var(--ease-out);
  }

  .drawer-backdrop {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    border: 0;
    cursor: pointer;
  }

  .drawer-content {
    width: 100%;
    max-width: 440px;
    height: 100%;
    background: var(--card);
    border-left: 1px solid var(--line);
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.12);
    animation: slideIn 280ms var(--ease-drawer);
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .header-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    font-size: 13px;
  }

  .ex-num {
    font-weight: 700;
    color: var(--ink);
  }

  .ex-page {
    color: var(--ink-62);
  }

  .ex-level {
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: var(--line);
    padding: 2px 8px;
    border-radius: 800px;
    color: var(--ink-72);
  }

  .close-btn {
    background: transparent;
    border: 0;
    font-size: 20px;
    color: var(--ink-62);
    cursor: pointer;
    padding: 4px;
    border-radius: 800px;
  }

  .close-btn:hover {
    color: var(--ink);
  }

  .ex-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 44px;
    line-height: 1;
    letter-spacing: 0.02em;
    margin: 14px 0 20px;
    color: var(--ink);
  }

  .card-section {
    margin-bottom: 20px;
    border-radius: 16px;
  }

  .section-label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-55);
    margin-bottom: 6px;
  }

  .section-text {
    font-size: 16px;
    line-height: 1.55;
    color: var(--ink-78);
    margin: 0;
  }

  .highlight-box {
    background: var(--canvas);
    border: 1px solid var(--line);
    padding: 14px 16px;
  }

  .reps-val {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 28px;
    color: var(--accent);
    letter-spacing: 0.02em;
  }

  .pitfall-box {
    background: rgba(252, 80, 0, 0.06);
    border: 1px solid rgba(252, 80, 0, 0.2);
    padding: 14px 16px;
  }

  .pitfall-text {
    color: var(--ink);
    font-weight: 500;
  }

  .fix-box {
    background: var(--canvas);
    border: 1.5px solid var(--ink);
    padding: 14px 16px;
  }

  .fix-text {
    color: var(--ink);
    font-weight: 600;
  }

  .drawer-footer {
    margin-top: auto;
    padding-top: 24px;
    border-top: 1px solid var(--line);
  }

  .full-dir-btn {
    appearance: none;
    background: transparent;
    border: 0;
    color: var(--accent-ink);
    border-bottom: 1px solid var(--accent-14);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    padding: 4px 0;
  }

  .full-dir-btn:hover {
    color: var(--ink);
    border-bottom-color: var(--ink);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  @media (max-width: 600px) {
    .drawer-content {
      max-width: 100%;
    }
  }
</style>
