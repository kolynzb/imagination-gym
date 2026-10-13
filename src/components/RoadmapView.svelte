<script lang="ts">
  import { state } from '../lib/store';
  import { WEEKS, PIPELINE } from '../lib/curriculum';

  export let onOpenWeek: (week: number) => void;

  let s = $state;
  $: s = $state;

  function calculateWeekPct(weekNum: number): number {
    const week = WEEKS[weekNum - 1];
    if (!week) return 0;
    let total = 0;
    let doneCount = 0;
    week.days.forEach((day, di) => {
      day.parts.forEach((_, pi) => {
        total++;
        if (s.done[`w${weekNum}d${di + 1}p${pi}`]) doneCount++;
      });
    });
    return total > 0 ? Math.round((doneCount / total) * 100) : 0;
  }
</script>

<div class="roadmap-view">
  <header class="roadmap-header">
    <h1 class="page-title">Eight Weeks, One Ladder</h1>
    <p class="subtitle">
      Mechanics, form, manipulation, figure, anatomy, costume, surface, scene. Each week serves as scaffolding for the next, so nothing gets skipped.
    </p>
  </header>

  <!-- 8-Week Progress Ladder -->
  <section class="ladder-section">
    <div class="ladder-grid">
      {#each WEEKS as week}
        {@const pct = calculateWeekPct(week.n)}
        <button
          type="button"
          class="ladder-col"
          class:current={s.cw === week.n}
          onclick={() => onOpenWeek(week.n)}
        >
          <div class="week-card-top"><span class="bar-num">Week {week.n}</span><span class="pct-label">{s.cw === week.n ? 'Your current week' : pct === 100 ? 'Complete' : '7 sessions'}</span></div>
          <div class="col-title">{week.title}</div>
          <div class="col-sub">{week.sub}</div>
          <p class="week-project">{week.project}</p>
          <div class="bar-track"><div class="bar-fill" style="width: {pct}%"></div></div>
          <div class="week-card-bottom"><span>{pct}% complete</span><strong>Explore week →</strong></div>
        </button>
      {/each}
    </div>
  </section>

  <!-- 4-Phase Scene Pipeline -->
  <section class="pipeline-section">
    <h2 class="section-title">4-Phase Scene Building Pipeline</h2>
    <div class="pipeline-grid">
      {#each PIPELINE as phase}
        <div class="phase-card">
          <div class="phase-num">{phase.n}</div>
          <h3 class="phase-title">{phase.t}</h3>
          <ul class="phase-items">
            {#each phase.items as item}
              <li>{item}</li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </section>

  <!-- Reading & Curriculum Matrix -->
  <section class="matrix-section">
    <h2 class="section-title">Reading & Drill Matrix</h2>
    <div class="matrix-card">
      <div class="matrix-table">
        <div class="matrix-head">
          <span class="m-col wk-col">Wk</span>
          <span class="m-col book-col">brokendraw Companion Book</span>
          <span class="m-col han-col">The Dynamic Bible (Peter Han)</span>
          <span class="m-col proj-col">Weekly Project</span>
        </div>
        {#each WEEKS as week}
          <div class="matrix-row">
            <span class="m-col wk-col font-bold">W{week.n}</span>
            <span class="m-col book-col">{week.book}</span>
            <span class="m-col han-col">{week.han}</span>
            <span class="m-col proj-col font-bold">{week.project}</span>
          </div>
        {/each}
      </div>
    </div>
  </section>
</div>

<style>
  .roadmap-view {
    padding: 36px 44px 80px;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
  }

  .roadmap-header {
    margin-bottom: 36px;
  }

  .page-title {
    font-family: var(--font-display);
    font-size: clamp(36px, 4.5vw, 52px);
    line-height: 1.05;
    letter-spacing: 0.02em;
    margin: 0;
    color: var(--ink);
  }

  .subtitle {
    font-size: 16px;
    line-height: 1.55;
    color: var(--ink-78);
    max-width: 62ch;
    margin: 12px 0 0;
  }

  .ladder-section { margin-bottom: 40px; }
  .ladder-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
  .ladder-col { appearance: none; text-align: left; background: var(--card); border: 1px solid var(--line); border-radius: var(--radius-card); padding: 24px; cursor: pointer; display: flex; flex-direction: column; transition: border-color 150ms ease, transform 150ms ease; }
  .ladder-col:hover { border-color: var(--ink); transform: translateY(-2px); }
  .ladder-col.current { border: 2px solid var(--accent); padding: 23px; }
  .week-card-top, .week-card-bottom { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; font-size: 12px; }
  .bar-num { font-weight: 700; color: var(--accent-ink); }
  .pct-label { color: var(--ink-62); }
  .col-title { font-family: var(--font-body); font-weight: 700; font-size: 22px; line-height: 1.25; margin: 16px 0 6px; }
  .col-sub { font-size: 13px; color: var(--ink-62); }
  .week-project { font-size: 14px; line-height: 1.5; color: var(--ink-78); margin: 18px 0 24px; flex: 1; }
  .bar-track { width: 100%; height: 5px; background: var(--track); border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
  .bar-fill { height: 100%; background: var(--accent); }
  .week-card-bottom { color: var(--ink-62); }
  .week-card-bottom strong { color: var(--ink); }
  @media (max-width: 600px) { .ladder-grid { grid-template-columns: 1fr; } }

  .section-title {
    font-family: var(--font-display);
    font-size: 36px;
    letter-spacing: 0.02em;
    margin: 0 0 18px;
    color: var(--ink);
  }

  .pipeline-section {
    margin-bottom: 48px;
  }

  .pipeline-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    gap: 16px;
  }

  .phase-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius-card);
    padding: 22px;
  }

  .phase-num {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--ink-55);
  }

  .phase-title {
    font-family: var(--font-display);
    font-size: 44px;
    letter-spacing: 0.02em;
    margin: 6px 0 12px;
    color: var(--ink);
  }

  .phase-items {
    margin: 0;
    padding-left: 18px;
    font-size: 14px;
    line-height: 1.55;
    color: var(--ink-78);
  }

  .matrix-section {
    margin-bottom: 40px;
  }

  .matrix-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius-panel);
    overflow-x: auto;
  }

  .matrix-table {
    display: flex;
    flex-direction: column;
    min-width: 700px;
  }

  .matrix-head {
    display: flex;
    padding: 14px 20px;
    background: var(--canvas);
    border-bottom: 1px solid var(--line);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-55);
  }

  .matrix-row {
    display: flex;
    padding: 14px 20px;
    border-bottom: 1px solid var(--line);
    font-size: 14px;
    line-height: 1.5;
    color: var(--ink-78);
  }

  .matrix-row:last-child {
    border-bottom: 0;
  }

  .wk-col { width: 50px; flex: 0 0 50px; }
  .book-col { flex: 1.3; min-width: 180px; padding-right: 12px; }
  .han-col { flex: 1; min-width: 150px; padding-right: 12px; }
  .proj-col { flex: 1; min-width: 150px; color: var(--ink); }

  .font-bold {
    font-weight: 700;
  }

  @media (max-width: 600px) {
    .roadmap-view {
      padding: 24px 18px 80px;
    }
    .page-title {
      font-size: 44px;
    }
  }
</style>
