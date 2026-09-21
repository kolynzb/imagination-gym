<script lang="ts">
  import { state, actions } from '../lib/store';
  import { KIT, PARTS_DOC, SCAFFOLD } from '../lib/curriculum';
  import Icon from './Icon.svelte';

  let s = $state;
  $: s = $state;
</script>

<div class="method-view">
  <header class="method-header">
    <h1 class="page-title">Method & Kit</h1>
    <p class="subtitle">
      Drawing from imagination is a mechanical discipline, not a talent contest. Set up your tools, calibrate your posture, and respect the three anchor rules.
    </p>
  </header>

  <!-- Course Orientation Hero Banner -->
  <section class="orientation-hero-card">
    <div class="hero-info-text">
      <span class="hero-badge">COURSE ORIENTATION & ROADMAP</span>
      <h2 class="hero-title">Giving away my entire drawing class</h2>
      <p class="hero-desc">
        Re-watch brokendraw's 43-minute master curriculum breakdown, review your 7-item physical/digital kit checklist, or walk through Day 1 again.
      </p>
    </div>
    <button type="button" class="replay-guide-btn" onclick={() => actions.openOnboarding()}>
      <Icon name="goal" size={16} /> Replay Course Orientation
    </button>
  </section>

  <!-- Three Anchor Rules -->
  <section class="section-block">
    <h2 class="section-title">The Three Anchor Rules</h2>
    <div class="rules-grid">
      <div class="rule-card">
        <h3 class="rule-title">Medicine, not diet</h3>
        <p class="rule-text">
          Drills are medicine to fix a specific mechanical weakness, not a diet. The project is the meal. Drills without creative application produce exercise technicians who can draw 250 perfect cubes and freeze when facing a blank page.
        </p>
        <span class="rule-source">brokendraw, p. 4</span>
      </div>

      <div class="rule-card">
        <h3 class="rule-title">The 50% Rule</h3>
        <p class="rule-text">
          Exactly half of your artistic life belongs to joy, play, and curiosity. Day seven of every week belongs strictly to fan art, doodles, and rough sketches with zero drills and zero self-critique. If every session is an exam, your brain learns to associate drawing with failure.
        </p>
        <span class="rule-source">Drawabox, Lesson 0</span>
      </div>

      <div class="rule-card">
        <h3 class="rule-title">Whole-Arm Pivot</h3>
        <p class="rule-text">
          Lock your wrist for long perspective lines and ellipses. Pivot from the shoulder and elbow joint. Drawing from the wrist produces timid, scratchy, chicken-scratch lines and will cause repetitive strain injury over an 8-week cycle.
        </p>
        <span class="rule-source">Peter Han, The Dynamic Bible, pp. 4–10</span>
      </div>
    </div>
  </section>

  <!-- Start Date Configuration -->
  <section class="section-block">
    <div class="date-card">
      <div class="date-info">
        <h3 class="card-heading">Course Start Date</h3>
        <p class="card-desc">
          Sets the calendar anchor for all 56 days, streak calculations, and the "Today" marker across the app.
        </p>
      </div>
      <input
        type="date"
        class="date-input"
        value={s.start}
        onchange={(e) => actions.setStartDate((e.target as HTMLInputElement).value)}
      />
    </div>
  </section>

  <!-- 3 Parts Breakdown -->
  <section class="section-block">
    <h2 class="section-title">The Anatomy of a Daily Session</h2>
    <div class="parts-grid">
      {#each PARTS_DOC as part}
        <div class="part-doc-card part-{part.k.toLowerCase()}">
          <div class="part-doc-header">
            <span class="part-doc-tag">Part {part.k} · {part.m}</span>
            <h3 class="part-doc-title">{part.t}</h3>
          </div>
          <div class="part-doc-headline">{part.h}</div>
          <p class="part-doc-body">{part.d}</p>
        </div>
      {/each}
    </div>
  </section>

  <!-- Traditional & Digital Kits -->
  <section class="section-block">
    <h2 class="section-title">Physical & Digital Setup</h2>
    <div class="kit-grid">
      <!-- Traditional Kit -->
      <div class="kit-card">
        <h3 class="kit-type-title">Traditional Tools (Recommended)</h3>
        <ul class="kit-list">
          {#each KIT as item}
            <li class="kit-item">
              <div class="kit-item-head">
                <span class="kit-label">{item.t}:</span>
                <span class="kit-val">{item.v}</span>
              </div>
              <p class="kit-why">{item.why}</p>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Digital Setup Rules -->
      <div class="kit-card">
        <h3 class="kit-type-title">Digital Setup (iPad / Tablet)</h3>
        <ul class="kit-list">
          <li class="kit-item">
            <div class="kit-item-head">
              <span class="kit-label">Brush:</span>
              <span class="kit-val">Hard round or 6B pencil</span>
            </div>
            <p class="kit-why">Size dynamics ON for pressure-sensitive width. Opacity jitter OFF: semi-transparent overlaps hide structural errors.</p>
          </li>
          <li class="kit-item">
            <div class="kit-item-head">
              <span class="kit-label">Stabilization:</span>
              <span class="kit-val">0–15% for drills</span>
            </div>
            <p class="kit-why">Heavy stroke smoothing fakes line confidence. True neuromuscular shoulder control must develop on raw lines.</p>
          </li>
          <li class="kit-item">
            <div class="kit-item-head">
              <span class="kit-label">Canvas:</span>
              <span class="kit-val">3000 × 4000 px @ 300 DPI</span>
            </div>
            <p class="kit-why">Large enough that the full scene stays legible without zooming.</p>
          </li>
          <li class="kit-item">
            <div class="kit-item-head">
              <span class="kit-label">The Golden Rule:</span>
              <span class="kit-val">Never zoom past 100%</span>
            </div>
            <p class="kit-why">Zooming in during form construction destroys your perception of proportion, producing bobblehead anatomy.</p>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Goldilocks Scaffolding -->
  <section class="section-block">
    <h2 class="section-title">Goldilocks Scaffolding Ladder</h2>
    <div class="scaffold-grid">
      {#each SCAFFOLD as s}
        <div class="scaffold-card">
          <h3 class="scaffold-title">{s.d} Domain</h3>
          <div class="scaffold-steps">
            <div class="s-step"><strong>Easy Scaffolding:</strong> {s.low}</div>
            <div class="s-step"><strong>Target Mastery:</strong> {s.high}</div>
          </div>
          <div class="scaffold-fix"><Icon name="idea" size={15} /> {s.fix}</div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Credits & Links -->
  <footer class="credits-card">
    <h3 class="credits-title">Credits & Educational Sources</h3>
    <p class="credits-p">
      Imagination Gym is an open educational tracker and study companion. It contains no proprietary textbook pages. Please support the masters who created this pedagogy:
    </p>
    <ul class="credits-list">
      <li><strong>brokendraw</strong>: The 8-week roadmap, 25 exercises, and weekly projects. <a href="https://brokendraw.com/book" target="_blank" rel="noreferrer">Get the Companion Book ↗</a></li>
      <li><strong>Peter Han</strong>: Shoulder linework, dynamic sketching, and ellipse axes in <em>The Dynamic Bible</em>.</li>
      <li><strong>Drawabox</strong>: The 250 Box Challenge, mechanical drills, and the 50% rule. <a href="https://drawabox.com/" target="_blank" rel="noreferrer">Drawabox.com ↗</a></li>
    </ul>
  </footer>
</div>

<style>
  .method-view {
    padding: 36px 44px 80px;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
  }

  .method-header {
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

  .section-block {
    margin-bottom: 48px;
  }

  .section-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 34px;
    letter-spacing: 0.02em;
    margin: 0 0 18px;
    color: var(--ink);
  }

  .rules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .rule-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 22px;
    display: flex;
    flex-direction: column;
  }

  .rule-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 32px;
    letter-spacing: 0.02em;
    margin: 0 0 8px;
    color: var(--ink);
  }

  .rule-text {
    font-size: 14px;
    line-height: 1.6;
    color: var(--ink-78);
    margin: 0 0 14px;
    flex: 1;
  }

  .rule-source {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-55);
  }

  .date-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  .card-heading {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--ink);
    margin: 0 0 4px;
  }

  .card-desc {
    font-size: 13px;
    color: var(--ink-72);
    margin: 0;
  }

  .date-input {
    background: var(--canvas);
    border: 1px solid var(--line-2);
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 15px;
    color: var(--ink);
  }

  .parts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }

  .part-doc-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .part-doc-card.part-a { border-top: 6px solid var(--sulfur); }
  .part-doc-card.part-b { border-top: 6px solid var(--accent); }
  .part-doc-card.part-c { border-top: 6px solid var(--ink); }
  .part-doc-card.part-d { border-top: 6px solid var(--line-3); }

  .part-doc-tag {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-55);
  }

  .part-doc-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 28px;
    letter-spacing: 0.02em;
    margin: 4px 0 0;
    color: var(--ink);
  }

  .part-doc-headline {
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
  }

  .part-doc-body {
    font-size: 13px;
    line-height: 1.55;
    color: var(--ink-78);
    margin: 0;
  }

  .kit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
  }

  .kit-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    padding: 24px;
  }

  .kit-type-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 28px;
    letter-spacing: 0.02em;
    margin: 0 0 16px;
    color: var(--ink);
  }

  .kit-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .kit-item-head {
    display: flex;
    gap: 8px;
    font-size: 14px;
  }

  .kit-label {
    color: var(--ink-62);
  }

  .kit-val {
    font-weight: 700;
    color: var(--ink);
  }

  .kit-why {
    font-size: 13px;
    line-height: 1.5;
    color: var(--ink-78);
    margin: 4px 0 0;
  }

  .scaffold-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .scaffold-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .scaffold-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 26px;
    letter-spacing: 0.02em;
    margin: 0;
    color: var(--ink);
  }

  .scaffold-steps {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: var(--ink-78);
  }

  .scaffold-fix {
    font-size: 12px;
    line-height: 1.5;
    color: var(--accent-ink);
    border-top: 1px solid var(--line);
    padding-top: 8px;
    margin-top: 4px;
  }

  .credits-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    padding: 24px;
  }

  .credits-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 28px;
    letter-spacing: 0.02em;
    margin: 0 0 10px;
    color: var(--ink);
  }

  .credits-p {
    font-size: 14px;
    line-height: 1.55;
    color: var(--ink-78);
    margin: 0 0 14px;
  }

  .credits-list {
    margin: 0;
    padding-left: 20px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--ink-78);
  }

  .credits-list a {
    color: var(--accent-ink);
    text-decoration: none;
    border-bottom: 1px solid var(--accent-14);
  }

  .orientation-hero-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding: 24px 28px;
    border-radius: 24px;
    background: var(--card);
    border: 1px solid var(--line);
    margin-bottom: 32px;
  }

  .hero-info-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 600px;
  }

  .hero-badge {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: var(--accent);
    text-transform: uppercase;
  }

  .hero-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 26px;
    letter-spacing: 0.02em;
    margin: 0;
    color: var(--ink);
  }

  .hero-desc {
    font-size: 14px;
    color: var(--ink-78);
    margin: 0;
    line-height: 1.5;
  }

  .replay-guide-btn {
    appearance: none;
    background: var(--accent);
    color: #fff;
    border: 0;
    border-radius: 14px;
    padding: 12px 20px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    transition: transform 120ms ease;
  }

  .replay-guide-btn:active {
    transform: scale(0.96);
  }

  @media (max-width: 760px) {
    .orientation-hero-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }

  @media (max-width: 600px) {
    .method-view {
      padding: 24px 18px 80px;
    }
    .page-title {
      font-size: 44px;
    }
  }
</style>
