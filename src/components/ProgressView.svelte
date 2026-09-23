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
        <span>Day 1</span><span>Day 2</span><span>Day 3</span><span>Day 4</span><span>Day 5</span><span>Day 6</span><span>Day 7 (Play)</span>
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
                  aria-label="Week {week.n}, Day {dayNum}: {week.days[dayNum - 1]?.t || ''}{isDone ? ', complete' : ', incomplete'}"
                  aria-current={isToday ? 'date' : undefined}
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

  <section class="reflection-section">
    <h2 class="section-title">Weekly Reflections</h2>
    <p class="section-desc">Keep the lesson from each week in your reflection notes.</p>
    <div class="reflections-grid">
      {#each WEEKS as week}
        <label class="reflection-card">
          <span>Week {week.n} · {week.title}</span>
          <textarea
            value={s.weekNotes[week.n] || ''}
            placeholder="What changed in your drawing this week?"
            oninput={(e) => actions.setWeekNote(week.n, (e.target as HTMLTextAreaElement).value)}
          ></textarea>
        </label>
      {/each}
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
            <button type="button" aria-label="Subtract 1: {item.t}" onclick={() => actions.bumpCounter(item.k, -1)}>−1</button>
            <button type="button" aria-label="Add 1: {item.t}" onclick={() => actions.bumpCounter(item.k, 1)}>+1</button>
            <button type="button" aria-label="Add 5: {item.t}" onclick={() => actions.bumpCounter(item.k, 5)}>+5</button>
          </div>
        </div>
      {/each}
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

  .reflection-section {
    margin-bottom: 48px;
  }

  .section-desc {
    color: var(--ink-62);
    font-size: 14px;
    margin: -8px 0 18px;
  }

  .reflections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 14px;
  }

  .reflection-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 16px;
    color: var(--ink);
    font-size: 14px;
    font-weight: 700;
  }

  .reflection-card textarea {
    min-height: 96px;
    resize: vertical;
    border: 1px solid var(--line-2);
    border-radius: 12px;
    padding: 10px;
    background: var(--canvas);
    color: var(--ink);
    font: inherit;
    font-size: 14px;
    font-weight: 400;
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
