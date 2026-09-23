<script lang="ts">
  import { state, actions } from '../lib/store';
  import { WEEKS, type Week } from '../lib/curriculum';
  import Icon from './Icon.svelte';

  let s = $state;
  $: s = $state;

  let selectedWeek = s.cw;
  $: week = WEEKS[selectedWeek - 1] as Week;

  function selectWeek(wNum: number) {
    selectedWeek = wNum;
  }

  function getEmbedUrl(url: string): string {
    const m = /[?&]v=([\w-]+)/.exec(url);
    const t = /[?&]t=(\d+)s?/.exec(url);
    if (!m) return url;
    return `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&modestbranding=1${t ? '&start=' + t[1] : ''}`;
  }
</script>

<div class="week-view">
  <!-- Week Switcher Tabs -->
  <div class="week-tabs-bar">
    {#each WEEKS as w}
      <button
        type="button"
        class="w-tab"
        class:active={selectedWeek === w.n}
        onclick={() => selectWeek(w.n)}
      >
        W{w.n}
      </button>
    {/each}
  </div>

  <header class="week-header">
    <div class="week-sub">Week {week.n} · {week.sub}</div>
    <h1 class="page-title">{week.title}</h1>
    <p class="objective-text">{week.objective}</p>
  </header>

  <div class="top-grid">
    <!-- Why it matters -->
    <div class="info-card">
      <div class="card-heading">Why this week matters</div>
      <p class="card-p">{week.why}</p>
    </div>

    <!-- Weekly Project & Milestones -->
    <div class="info-card project-card">
      <div class="card-heading">Weekly Project</div>
      <div class="project-title">{week.project}</div>
      <div class="divider"></div>
      <div class="card-heading">Milestones</div>
      <div class="milestones-row">
        {#each week.milestones as ms, i}
          {@const msKey = `w${week.n}m${i}`}
          {@const isDone = !!s.ms[msKey]}
          <button
            type="button"
            class="ms-chip"
            class:done={isDone}
            onclick={() => actions.toggleMilestone(msKey)}
          >
            {#if isDone}
              <Icon name="checkmark" size={13} />{" "}
            {/if}
            {ms}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Day by Day Listing -->
  <section class="days-section">
    <h2 class="section-title">Day by Day Progression</h2>
    <div class="days-list">
      {#each week.days as day, di}
        {@const dayNum = di + 1}
        {@const dayDone = day.parts.every((_, pi) => !!s.done[`w${week.n}d${dayNum}p${pi}`])}

        <button
          type="button"
          class="day-row"
          class:is-complete={dayDone}
          onclick={() => actions.jumpToDay(week.n, dayNum)}
        >
          <div class="day-badge">
            <span class="day-num">D{dayNum}</span>
          </div>

          <div class="day-details">
            <div class="day-title">{day.t}</div>
            <div class="day-parts-summary">
              {#each day.parts as p}
                <span class="part-chip part-{p.k.toLowerCase()}">{p.k}</span>
              {/each}
              <span class="parts-count">{day.parts.length} part{day.parts.length === 1 ? '' : 's'}</span>
            </div>
          </div>

          <div class="status-marker">
            {#if dayDone}
              <Icon name="checkmark" size={14} /> Done
            {:else}
              Open →
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </section>

  <!-- Reading & Study Resources -->
  <div class="reading-grid">
    <div class="info-card">
      <div class="card-heading">Required Reading</div>
      <div class="read-block">
        <span class="read-book">brokendraw Companion Book</span>
        <p class="read-pages">{week.book}</p>
      </div>
      <div class="divider"></div>
      <div class="read-block">
        <span class="read-book">The Dynamic Bible (Peter Han)</span>
        <p class="read-pages">{week.han}</p>
      </div>
    </div>

    <!-- YouTube Videos for Week -->
    <div class="info-card">
      <div class="card-heading">Watch & Study This Week</div>
      <div class="videos-list">
        {#each week.links.filter((l) => l.u.includes('youtube.com')) as vid}
          <div class="vid-item">
            <iframe
              src={getEmbedUrl(vid.u)}
              title={vid.l}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
            <a href={vid.u} target="_blank" rel="noreferrer" class="vid-link">
              {vid.l} ↗
            </a>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .week-view {
    padding: 36px 44px 80px;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
  }

  .week-tabs-bar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 28px;
  }

  .w-tab {
    appearance: none;
    border: 1.5px solid var(--line-2);
    background: transparent;
    border-radius: var(--radius-pill);
    padding: 8px 18px;
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .w-tab:hover {
    border-color: var(--ink);
  }

  .w-tab.active {
    background: var(--ink);
    color: var(--canvas);
    border-color: var(--ink);
    font-weight: 700;
  }

  .week-header {
    margin-bottom: 30px;
  }

  .week-sub {
    font-size: 14px;
    color: var(--ink-62);
  }

  .page-title {
    font-family: var(--font-display);
    font-size: 64px;
    line-height: 1.05;
    letter-spacing: 0.02em;
    margin: 8px 0 0;
    color: var(--ink);
  }

  .objective-text {
    font-size: 17px;
    line-height: 1.55;
    color: var(--ink-78);
    max-width: 65ch;
    margin: 12px 0 0;
  }

  .top-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }

  .info-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius-panel);
    padding: 22px 24px;
  }

  .card-heading {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-55);
    margin-bottom: 8px;
  }

  .card-p {
    font-size: var(--text-body);
    line-height: var(--leading-body);
    color: var(--ink-78);
    margin: 0;
  }

  .project-title {
    font-family: var(--font-display);
    font-size: 28px;
    letter-spacing: 0.02em;
    color: var(--ink);
  }

  .divider {
    height: 1px;
    background: var(--line);
    margin: 16px 0;
  }

  .milestones-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .ms-chip {
    appearance: none;
    border: 1px solid var(--line-2);
    background: transparent;
    padding: 6px 14px;
    border-radius: var(--radius-pill);
    font-size: 13px;
    color: var(--ink);
    cursor: pointer;
  }

  .ms-chip.done {
    background: var(--ink);
    color: var(--canvas);
    border-color: var(--ink);
    font-weight: 600;
  }

  .days-section {
    margin-bottom: 40px;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 32px;
    letter-spacing: 0.02em;
    margin: 0 0 16px;
    color: var(--ink);
  }

  .days-list {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius-panel);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .day-row {
    appearance: none;
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--line);
    padding: 16px 22px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s ease;
  }

  .day-row:last-child {
    border-bottom: 0;
  }

  .day-row:hover {
    background: var(--canvas);
  }

  .day-badge {
    width: 36px;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 700;
    color: var(--ink-55);
  }

  .day-details {
    flex: 1;
    min-width: 0;
  }

  .day-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
  }

  .day-parts-summary {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
  }

  .part-chip {
    font-size: 10px;
    font-weight: 700;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .part-chip.part-a { background: var(--sulfur); color: var(--on-accent); }
  .part-chip.part-b { background: var(--accent); color: var(--on-accent); }
  .part-chip.part-c { background: var(--ink); color: var(--canvas); }
  .part-chip.part-d { background: var(--line-3); color: var(--ink); }

  .parts-count {
    font-size: 12px;
    color: var(--ink-62);
    margin-left: 6px;
  }

  .status-marker {
    font-size: 13px;
    font-weight: 500;
    color: var(--accent-ink);
  }

  .day-row.is-complete .status-marker {
    color: var(--success);
    font-weight: 700;
  }

  .reading-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
  }

  .read-block {
    margin-bottom: 8px;
  }

  .read-book {
    font-size: 14px;
    font-weight: 700;
    color: var(--ink);
  }

  .read-pages {
    font-size: var(--text-body);
    color: var(--ink-78);
    margin: 4px 0 0;
    line-height: var(--leading-body);
  }

  .videos-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .vid-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .vid-item iframe {
    width: 100%;
    aspect-ratio: 16 / 9;
    border: 0;
    border-radius: var(--radius-control);
    background: var(--ink);
  }

  .vid-link {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    font-size: var(--text-control);
    color: var(--accent-ink);
    text-decoration: none;
    border-bottom: 1px solid var(--accent-14);
    align-self: flex-start;
  }

  @media (max-width: 600px) {
    .week-view {
      padding: 24px 18px 80px;
    }
    .page-title {
      font-size: 44px;
    }
  }
</style>
