<script lang="ts">
  import { state, actions, derivedStats } from '../lib/store';
  import { WEEKS, RUBRIC } from '../lib/curriculum';
  import Icon from './Icon.svelte';

  let s = $state;
  let stats = $derivedStats;
  $: s = $state;
  $: stats = $derivedStats;

  const COUNTER_TARGETS = [
    { k: 'boxes', t: 'Boxes in Perspective', target: 100 },
    { k: 'cyl', t: 'Cylinders & Minor Axes', target: 100 },
    { k: 'sil', t: 'Silhouettes from Reference', target: 50 },
    { k: 'sym', t: 'Symmetry Mirror Shapes', target: 50 },
    { k: 'refman', t: 'Reference Mannequins', target: 50 },
    { k: 'imgman', t: 'Imagination Mannequins', target: 20 },
    { k: 'intman', t: 'Interacting Mannequins', target: 30 },
    { k: 'texbar', t: 'Texture Swatch Bars', target: 5 },
    { k: 'blob', t: 'Textured Organic Blobs', target: 10 },
    { k: 'highlight', t: 'Daily Memory Highlights', target: 56 }
  ];

  function handleExport() {
    const at = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `imagination-gym-backup-${at}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          state.set(data);
        } catch (err) {
          alert('Failed to parse backup file');
        }
      };
      reader.readAsText(input.files[0]);
    }
  }
</script>

<div class="progress-view">
  <header class="progress-header">
    <h1 class="page-title">Progress & Accountability</h1>
    <p class="subtitle">
      Measure volume and consistency over talent. Track your 56-day streak, bank milestones, and review your weekly reflection notes.
    </p>
  </header>

  <!-- Big 4 Metric Blocks -->
  <div class="metrics-grid">
    <div class="metric-card">
      <span class="m-label">Course Complete</span>
      <div class="m-value">{stats.coursePct}%</div>
      <div class="m-track"><div class="m-fill" style="width: {stats.coursePct}%"></div></div>
    </div>
    <div class="metric-card">
      <span class="m-label">Total Hours</span>
      <div class="m-value">{stats.totalHoursNum}h</div>
      <span class="m-sub">Target: 80–96 hrs</span>
    </div>
    <div class="metric-card">
      <span class="m-label">Days Finished</span>
      <div class="m-value">{stats.doneDaysCount}<span class="m-denom">/56</span></div>
      <span class="m-sub">{56 - stats.doneDaysCount} days remaining</span>
    </div>
    <div class="metric-card">
      <span class="m-label">Active Streak</span>
      <div class="m-value">{stats.streak}d</div>
      <span class="m-sub">Daily habit compounding</span>
    </div>
  </div>

  <!-- 56-Day Interactive Calendar Matrix -->
  <section class="cal-section">
    <div class="cal-head">
      <h2 class="section-title">56-Day Calendar</h2>
      <div class="pace-toggle">
        <button
          type="button"
          class="pace-btn"
          class:active={!s.paceFlex}
          onclick={() => actions.setPaceFlex(false)}
        >
          Calendar Paced
        </button>
        <button
          type="button"
          class="pace-btn"
          class:active={s.paceFlex}
          onclick={() => actions.setPaceFlex(true)}
        >
          Self Paced
        </button>
      </div>
    </div>

    <div class="cal-matrix-card">
      <div class="cal-days-header">
        <span class="w-col-label"></span>
        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun (Play)</span>
      </div>

      <div class="cal-weeks">
        {#each WEEKS as week}
          <div class="cal-week-row">
            <span class="cal-w-tag">W{week.n}</span>
            <div class="cal-cells-row">
              {#each [1, 2, 3, 4, 5, 6, 7] as dayNum}
                {@const isDone = week.days[dayNum - 1]?.parts.every((_, i) => !!s.done[`w${week.n}d${dayNum}p${i}`])}
                {@const isToday = stats.liveN === week.n && stats.liveD === dayNum}
                <button
                  type="button"
                  class="cal-cell"
                  class:done={isDone}
                  class:today={isToday}
                  class:rest={dayNum === 7}
                  onclick={() => actions.jumpToDay(week.n, dayNum)}
                  title="W{week.n} D{dayNum}"
                >
                  <span class="cell-num">{dayNum}</span>
                  {#if isDone}
                    <span class="cell-tick"><Icon name="checkmark" size={10} /></span>
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Milestone Counters -->
  <section class="milestones-section">
    <h2 class="section-title">Milestone Rep Counters</h2>
    <div class="counters-grid">
      {#each COUNTER_TARGETS as item}
        {@const val = s.counters[item.k] || 0}
        {@const pct = Math.min(100, Math.round((val / item.target) * 100))}
        <div class="counter-card">
          <div class="c-head">
            <span class="c-title">{item.t}</span>
            <span class="c-score">{val} / {item.target}</span>
          </div>
          <div class="c-bar"><div class="c-bar-fill" style="width: {pct}%"></div></div>
          <div class="c-buttons">
            <button type="button" onclick={() => actions.bumpCounter(item.k, -1)}>−1</button>
            <button type="button" onclick={() => actions.bumpCounter(item.k, 1)}>+1</button>
            <button type="button" onclick={() => actions.bumpCounter(item.k, 5)}>+5</button>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Backup & Export Card -->
  <section class="backup-section">
    <div class="backup-card">
      <div class="backup-info">
        <h3 class="backup-title">Local Data & Backup</h3>
        <p class="backup-desc">
          All your ticks, hours, and notes are preserved in your local browser storage. Export a JSON backup periodically so you never lose your training history.
        </p>
      </div>
      <div class="backup-btns">
        <button type="button" class="action-btn primary" onclick={handleExport}>
          <Icon name="download" size={15} /> Export Backup (.json)
        </button>
        <label class="action-btn outline file-label">
          <Icon name="upload" size={15} /> Import Backup
          <input type="file" accept=".json,application/json" onchange={handleImport} />
        </label>
      </div>
    </div>
  </section>

  <!-- Self-Critique Rubric -->
  <section class="rubric-section">
    <h2 class="section-title">Self-Critique Rubric</h2>
    <div class="rubric-grid">
      {#each RUBRIC as r}
        <div class="rubric-card">
          <h3 class="rubric-topic">{r.t}</h3>
          <div class="rubric-err"><strong>Trap:</strong> {r.err}</div>
          <div class="rubric-fix"><strong>Correction:</strong> {r.fix}</div>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .progress-view {
    padding: 36px 44px 80px;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
  }

  .progress-header {
    margin-bottom: 36px;
  }

  .page-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
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

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 48px;
  }

  .metric-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }

  .m-label {
    font-size: 13px;
    font-weight: 700;
    color: var(--ink-55);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .m-value {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 48px;
    letter-spacing: 0.02em;
    line-height: 1.1;
    margin: 8px 0 4px;
    color: var(--ink);
  }

  .m-denom {
    font-size: 20px;
    color: var(--ink-55);
  }

  .m-sub {
    font-size: 12px;
    color: var(--ink-62);
  }

  .m-track {
    height: 4px;
    background: var(--track);
    border-radius: 800px;
    overflow: hidden;
    margin-top: 8px;
  }

  .m-fill {
    height: 100%;
    background: var(--accent);
  }

  .section-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 34px;
    letter-spacing: 0.02em;
    margin: 0 0 18px;
    color: var(--ink);
  }

  .cal-section {
    margin-bottom: 48px;
  }

  .cal-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .pace-toggle {
    display: flex;
    gap: 4px;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 800px;
    padding: 3px;
  }

  .pace-btn {
    appearance: none;
    border: 0;
    background: transparent;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 800px;
    color: var(--ink-62);
    cursor: pointer;
  }

  .pace-btn.active {
    background: var(--ink);
    color: var(--canvas);
    font-weight: 700;
  }

  .cal-matrix-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    padding: 22px;
    overflow-x: auto;
  }

  .cal-days-header {
    display: grid;
    grid-template-columns: 48px repeat(7, 1fr);
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    color: var(--ink-55);
    text-align: center;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--line);
    min-width: 560px;
  }

  .cal-weeks {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
    min-width: 560px;
  }

  .cal-week-row {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 8px;
    align-items: center;
  }

  .cal-w-tag {
    font-size: 12px;
    font-weight: 700;
    color: var(--ink-55);
  }

  .cal-cells-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
  }

  .cal-cell {
    appearance: none;
    border: 1px solid var(--line-2);
    background: var(--canvas);
    border-radius: 12px;
    aspect-ratio: 1 / 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
  }

  .cal-cell:hover {
    border-color: var(--ink);
  }

  .cal-cell.today {
    border: 2px solid var(--accent);
    box-shadow: 0 0 0 3px var(--accent-14);
  }

  .cal-cell.done {
    background: var(--ink);
    border-color: var(--ink);
    color: var(--canvas);
  }

  .cal-cell.rest {
    background: var(--track);
  }

  .cell-num {
    font-size: 13px;
    font-weight: 600;
  }

  .cell-tick {
    font-size: 10px;
  }

  .milestones-section {
    margin-bottom: 48px;
  }

  .counters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 14px;
  }

  .counter-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 18px;
    display: flex;
    flex-direction: column;
  }

  .c-head {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 10px;
  }

  .c-bar {
    height: 5px;
    background: var(--track);
    border-radius: 800px;
    overflow: hidden;
    margin-bottom: 14px;
  }

  .c-bar-fill {
    height: 100%;
    background: var(--accent);
  }

  .c-buttons {
    display: flex;
    gap: 6px;
  }

  .c-buttons button {
    flex: 1;
    appearance: none;
    border: 1px solid var(--line-2);
    background: transparent;
    padding: 6px;
    border-radius: 800px;
    font-size: 13px;
    font-weight: 500;
    color: var(--ink);
    cursor: pointer;
  }

  .c-buttons button:hover {
    border-color: var(--ink);
  }

  .backup-section {
    margin-bottom: 48px;
  }

  .backup-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  .backup-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 28px;
    letter-spacing: 0.02em;
    margin: 0;
    color: var(--ink);
  }

  .backup-desc {
    font-size: 14px;
    line-height: 1.55;
    color: var(--ink-78);
    max-width: 55ch;
    margin: 6px 0 0;
  }

  .backup-btns {
    display: flex;
    gap: 10px;
  }

  .action-btn {
    appearance: none;
    padding: 10px 20px;
    border-radius: 800px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }

  .action-btn.primary {
    background: var(--accent);
    color: var(--on-accent);
    border: 1.5px solid var(--accent);
  }

  .action-btn.outline {
    background: transparent;
    border: 1.5px solid var(--line-2);
    color: var(--ink);
  }

  .file-label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .file-label input {
    display: none;
  }

  .rubric-section {
    margin-bottom: 40px;
  }

  .rubric-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .rubric-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rubric-topic {
    font-size: 16px;
    font-weight: 700;
    color: var(--ink);
    margin: 0;
  }

  .rubric-err, .rubric-fix {
    font-size: 13px;
    line-height: 1.5;
    color: var(--ink-78);
  }

  @media (max-width: 600px) {
    .progress-view {
      padding: 24px 18px 80px;
    }
    .page-title {
      font-size: 44px;
    }
  }
</style>
