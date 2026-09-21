<script lang="ts">
  import { state, actions } from '../lib/store';
  import { WEEKS, KIT, DIGITAL } from '../lib/curriculum';
  import Icon from './Icon.svelte';

  let s = $state;
  $: s = $state;

  $: currentStep = s.onboardingStep;

  const ALL_KIT_ITEMS = [
    { id: 'k_fineliner', t: 'Primary line pen', v: '0.5mm black fineliner', why: 'Ink is permanent — denies the eraser, forces planning, and exposes chicken-scratching.' },
    { id: 'k_ballpoint', t: 'Secondary tone pen', v: 'Standard ballpoint (Bic Cristal)', why: 'Responds to hand pressure for soft volumetric under-drawing and smooth cross-hatching.' },
    { id: 'k_paper', t: 'Paper', v: '80gsm unruled copy paper', why: 'Loose paper has zero preciousness. Burn 10 pages without flinching.' },
    { id: 'k_newsprint', t: 'Shoulder pad', v: 'A3 / 11×17 newsprint', why: 'You physically cannot draw from the wrist across 17 inches. Forces whole-arm pivot.' },
    { id: 'k_brush', t: 'Digital Brush', v: 'Hard round or 6B pencil', why: 'Size dynamics ON, opacity jitter OFF. Crisp edges teach form construction.' },
    { id: 'k_stab', t: 'Digital Stabilization', v: '0–15% for drills', why: 'Heavy smoothing fakes confidence. Your real neuromuscular shoulder control must develop.' },
    { id: 'k_zoom', t: 'The Golden Rule', v: 'Never zoom past 100%', why: 'Zooming during construction destroys spatial proportion and produces bobbleheads.' },
  ];

  $: checkedCount = ALL_KIT_ITEMS.filter((item) => !!s.kitChecked[item.id]).length;

  function calculateEndDate(startDateStr: string): string {
    const d = new Date(startDateStr + 'T00:00:00');
    d.setDate(d.getDate() + 55);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  $: startDateFormatted = new Date(s.start + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  $: endDateFormatted = calculateEndDate(s.start);

  $: dayOne = WEEKS[0]?.days[0];
</script>

{#if s.onboardingOpen}
  <div class="onboarding-overlay" role="dialog" aria-modal="true" aria-label="Course onboarding walkthrough">
    <!-- Top Header -->
    <header class="ob-header">
      <div class="brand-group">
        <div class="logo">IG</div>
        <span class="ob-title">Start Here</span>
      </div>

      <div class="ob-progress">
        <div class="dots-row">
          <span class="step-dot" class:active={currentStep === 1}></span>
          <span class="step-dot" class:active={currentStep === 2}></span>
          <span class="step-dot" class:active={currentStep === 3}></span>
        </div>
        <button type="button" class="skip-btn" onclick={() => actions.closeOnboarding()}>
          Skip, I know the method
        </button>
      </div>
    </header>

    <!-- Content Area -->
    <div class="ob-body">
      <!-- STEP 1 -->
      {#if currentStep === 1}
        <div class="step-pane">
          <div class="step-meta">Step 1 of 3</div>
          <h1 class="step-heading">Eight weeks to draw from imagination</h1>
          <p class="step-intro">
            You cannot draw from imagination what your brain cannot construct mechanically. So this is not a course about talent — it is eight weeks of isolating one technical variable a day until spatial construction becomes unconscious, leaving your mind free for storytelling.
          </p>

          <div class="video-embed-card">
            <div class="embed-wrapper">
              <iframe
                src="https://www.youtube-nocookie.com/embed/zYzgxUVSpUc?rel=0&modestbranding=1"
                title="brokendraw — giving away my entire drawing class"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
            <div class="embed-info">
              <div class="embed-title">Giving away my entire drawing class</div>
              <div class="embed-desc">brokendraw · 43 min · The master roadmap video this entire curriculum is built from.</div>
            </div>
          </div>

          <div class="cards-triad">
            <div class="triad-card">
              <h3 class="triad-title">Medicine, not diet</h3>
              <p class="triad-desc">Drills are medicine for a specific weakness. The project is the meal. Drills alone produce exercise technicians who draw 250 perfect cubes and freeze at a blank page.</p>
            </div>
            <div class="triad-card">
              <h3 class="triad-title">The 50% rule</h3>
              <p class="triad-desc">Day seven of every week belongs strictly to joy, play, and curiosity. Zero drills, zero self-critique. If every session is an exam, your brain learns to associate drawing with stress.</p>
            </div>
            <div class="triad-card">
              <h3 class="triad-title">Whole-arm pivot</h3>
              <p class="triad-desc">Lock the wrist for long curves and perspective lines. Pivot from the shoulder and elbow. Drawing from the wrist produces timid, scratchy lines and repetitive strain.</p>
            </div>
          </div>

          <div class="three-parts-section">
            <h2 class="sub-heading">A day has three parts</h2>
            <div class="parts-table">
              <div class="table-row">
                <span class="p-name">A · Warm-up</span>
                <span class="p-time">10 min</span>
                <span class="p-desc">Motor calibration. Activates the kinetic chain from core to shoulder so you commit clean single-pass strokes.</span>
              </div>
              <div class="table-row">
                <span class="p-name">B · The drill</span>
                <span class="p-time">45–60 min</span>
                <span class="p-desc">The medicine. Isolates one variable — convergence, minor axes, boolean cuts — with no pressure to make finished artwork.</span>
              </div>
              <div class="table-row">
                <span class="p-name">C · The project</span>
                <span class="p-time">30–45 min</span>
                <span class="p-desc">The meal. Stress-tests the day's drill inside a real creative problem, burning the mechanical skill into your visual library.</span>
              </div>
              <div class="table-row">
                <span class="p-name">D · Day seven</span>
                <span class="p-time">All day</span>
                <span class="p-desc">Play. Doodles, fan art, imagination sketches. Scheduled psychological recovery, not a skipped day.</span>
              </div>
            </div>
          </div>

          <div class="five-levels-section">
            <h2 class="sub-heading">What you're actually doing: 5 Levels</h2>
            <p class="sub-desc">Twenty-five exercises arranged in five levels from brokendraw's book. The eight weeks are just a schedule laid over them — the levels are the real spine.</p>
            <div class="levels-grid">
              <div class="level-box"><span class="lvl-num">L1</span><span class="lvl-name">Mechanics</span></div>
              <div class="level-box"><span class="lvl-num">L2</span><span class="lvl-name">Basic forms</span></div>
              <div class="level-box"><span class="lvl-num">L3</span><span class="lvl-name">Form control</span></div>
              <div class="level-box"><span class="lvl-num">L4</span><span class="lvl-name">Construction</span></div>
              <div class="level-box"><span class="lvl-num">L5</span><span class="lvl-name">Imagination</span></div>
            </div>
          </div>
        </div>

      <!-- STEP 2 -->
      {:else if currentStep === 2}
        <div class="step-pane">
          <div class="step-meta">Step 2 of 3</div>
          <h1 class="step-heading">Pick a start date and get your kit</h1>

          <div class="date-picker-card">
            <div class="picker-label">Day one falls on</div>
            <div class="picker-row">
              <input
                type="date"
                class="date-input-lg"
                value={s.start}
                onchange={(e) => actions.setStartDate((e.target as HTMLInputElement).value)}
              />
              <span class="date-summary">{startDateFormatted} → finishes {endDateFormatted}</span>
            </div>
          </div>

          <div class="kit-head-row">
            <h2 class="sub-heading">Your Kit Checklist</h2>
            <span class="ticked-count">{checkedCount} of {ALL_KIT_ITEMS.length} ready</span>
          </div>
          <p class="sub-desc">Nothing here is expensive. Loose copy paper over a bound sketchbook is deliberate: expensive books trigger performance anxiety, and you need to discard pages without flinching.</p>

          <div class="kit-checklist">
            {#each ALL_KIT_ITEMS as item}
              {@const isChecked = !!s.kitChecked[item.id]}
              <div class="kit-check-row" class:checked={isChecked}>
                <button
                  type="button"
                  class="kit-box"
                  class:checked={isChecked}
                  onclick={() => actions.toggleKitItem(item.id)}
                  aria-label="Toggle kit item"
                >
                  {#if isChecked}
                    <Icon name="checkmark" size={13} />
                  {/if}
                </button>
                <div class="kit-item-label">{item.t}</div>
                <div class="kit-item-val">{item.v}</div>
                <div class="kit-item-why">{item.why}</div>
              </div>
            {/each}
          </div>

          <div class="callout-grid">
            <div class="callout-card">
              <h3 class="callout-title">Working Digitally?</h3>
              <p class="callout-p">Hard round brush, size dynamics ON, opacity jitter OFF. Stabilization 0–15% for drills. And never zoom past 100% during construction — that is what causes bobblehead figures.</p>
            </div>
            <div class="callout-card">
              <h3 class="callout-title">One Thing to Buy</h3>
              <p class="callout-p">Every drill references a page in brokendraw's companion book. The rest of the sources are free.</p>
              <a href="https://brokendraw.com/book" target="_blank" rel="noreferrer" class="buy-link">Get the book →</a>
            </div>
          </div>
        </div>

      <!-- STEP 3 -->
      {:else if currentStep === 3}
        <div class="step-pane">
          <div class="step-meta">Step 3 of 3 · {startDateFormatted}</div>
          <h1 class="step-heading">{dayOne?.t || 'Shoulder Calibration & Ghosting'}</h1>
          <p class="step-intro">This is day one, end to end. 90 minutes total. Work top to bottom and tick each part as you finish it.</p>

          <div class="preview-parts-list">
            {#if dayOne}
              {#each dayOne.parts as part}
                <div class="preview-part-card part-{part.k.toLowerCase()}">
                  <div class="preview-meta">
                    <span class="preview-tag">Part {part.k} · {part.t}</span>
                    <span class="preview-mins">{part.m} min</span>
                  </div>
                  <div class="preview-purpose">{part.p}</div>
                  <div class="preview-desc">{part.d}</div>
                </div>
              {/each}
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- Sticky Bottom Navigation Bar -->
    <footer class="ob-footer">
      {#if currentStep > 1}
        <button type="button" class="back-btn" onclick={() => actions.setOnboardingStep((currentStep - 1) as 1 | 2)}>
          ← Back
        </button>
      {/if}
      <div class="footer-spacer"></div>
      {#if currentStep < 3}
        <button type="button" class="next-btn" onclick={() => actions.setOnboardingStep((currentStep + 1) as 2 | 3)}>
          Next →
        </button>
      {:else}
        <button type="button" class="next-btn launch-btn" onclick={() => actions.closeOnboarding()}>
          Let's Draw →
        </button>
      {/if}
    </footer>
  </div>
{/if}

<style>
  .onboarding-overlay {
    position: fixed;
    inset: 0;
    z-index: 150;
    background: var(--canvas);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .ob-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 28px;
    border-bottom: 1px solid var(--line);
    background: var(--canvas);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .brand-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo {
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background: var(--ink);
    color: var(--canvas);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 19px;
  }

  .ob-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 22px;
    letter-spacing: 0.03em;
  }

  .ob-progress {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .dots-row {
    display: flex;
    gap: 6px;
  }

  .step-dot {
    width: 8px;
    height: 8px;
    border-radius: 800px;
    background: var(--line-3);
  }

  .step-dot.active {
    background: var(--accent);
    width: 20px;
  }

  .skip-btn {
    background: transparent;
    border: 0;
    font-size: 14px;
    color: var(--ink-62);
    cursor: pointer;
  }

  .skip-btn:hover {
    color: var(--ink);
  }

  .ob-body {
    flex: 1;
    width: 100%;
    max-width: 860px;
    margin: 0 auto;
    padding: 44px 28px 64px;
  }

  .step-meta {
    font-size: 14px;
    color: var(--ink-62);
  }

  .step-heading {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 60px;
    line-height: 1.05;
    letter-spacing: 0.02em;
    margin: 8px 0 16px;
    color: var(--ink);
  }

  .step-intro {
    font-size: 17px;
    line-height: 1.6;
    color: var(--ink-78);
    margin: 0 0 32px;
    max-width: 65ch;
  }

  .video-embed-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    overflow: hidden;
    margin-bottom: 32px;
  }

  .embed-wrapper {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: var(--ink);
  }

  .embed-wrapper iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }

  .embed-info {
    padding: 18px 22px;
  }

  .embed-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--ink);
  }

  .embed-desc {
    font-size: 14px;
    color: var(--ink-62);
    margin-top: 4px;
  }

  .cards-triad {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 40px;
  }

  .triad-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 20px;
  }

  .triad-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 28px;
    letter-spacing: 0.02em;
    margin: 0 0 8px;
    color: var(--ink);
  }

  .triad-desc {
    font-size: 14px;
    line-height: 1.55;
    color: var(--ink-72);
    margin: 0;
  }

  .sub-heading {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 32px;
    letter-spacing: 0.02em;
    margin: 0 0 8px;
    color: var(--ink);
  }

  .sub-desc {
    font-size: 15px;
    color: var(--ink-72);
    margin: 0 0 16px;
    max-width: 65ch;
  }

  .three-parts-section {
    margin-bottom: 40px;
  }

  .parts-table {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .table-row {
    display: flex;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--line);
    font-size: 14px;
    align-items: flex-start;
  }

  .table-row:last-child {
    border-bottom: 0;
  }

  .p-name { width: 130px; flex: 0 0 130px; font-weight: 700; color: var(--ink); }
  .p-time { width: 90px; flex: 0 0 90px; color: var(--ink-62); }
  .p-desc { flex: 1; color: var(--ink-78); line-height: 1.5; }

  .five-levels-section {
    margin-bottom: 40px;
  }

  .levels-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 10px;
  }

  .level-box {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .lvl-num {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 26px;
    color: var(--accent);
  }

  .lvl-name {
    font-size: 14px;
    color: var(--ink-72);
  }

  /* Step 2 Styles */
  .date-picker-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 22px;
    margin-bottom: 32px;
  }

  .picker-label {
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 10px;
  }

  .picker-row {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  .date-input-lg {
    background: var(--canvas);
    border: 1px solid var(--line-2);
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 15px;
    color: var(--ink);
  }

  .date-summary {
    font-size: 14px;
    color: var(--ink-72);
  }

  .kit-head-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 6px;
  }

  .ticked-count {
    font-size: 14px;
    font-weight: 700;
    color: var(--accent);
  }

  .kit-checklist {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    margin-bottom: 32px;
  }

  .kit-check-row {
    display: flex;
    gap: 14px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--line);
    font-size: 14px;
    align-items: flex-start;
  }

  .kit-check-row:last-child {
    border-bottom: 0;
  }

  .kit-box {
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    border: 1.5px solid var(--line-2);
    background: var(--canvas);
    color: var(--canvas);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    cursor: pointer;
    flex: 0 0 22px;
    margin-top: 2px;
  }

  .kit-box.checked {
    background: var(--ink);
    border-color: var(--ink);
  }

  .kit-item-label { width: 140px; flex: 0 0 140px; color: var(--ink-62); }
  .kit-item-val { width: 180px; flex: 0 0 180px; font-weight: 700; color: var(--ink); }
  .kit-item-why { flex: 1; color: var(--ink-78); line-height: 1.5; }

  .callout-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }

  .callout-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 20px;
  }

  .callout-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 28px;
    letter-spacing: 0.02em;
    margin: 0 0 8px;
    color: var(--ink);
  }

  .callout-p {
    font-size: 14px;
    line-height: 1.55;
    color: var(--ink-72);
    margin: 0;
  }

  .buy-link {
    display: inline-block;
    font-size: 14px;
    font-weight: 600;
    color: var(--accent-ink);
    margin-top: 10px;
    text-decoration: none;
    border-bottom: 1px solid var(--accent-14);
  }

  /* Step 3 Styles */
  .preview-parts-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .preview-part-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 0 20px 20px 0;
    padding: 20px 24px;
  }

  .preview-part-card.part-a { border-left: 8px solid var(--sulfur); }
  .preview-part-card.part-b { border-left: 8px solid var(--accent); }
  .preview-part-card.part-c { border-left: 8px solid var(--ink); }

  .preview-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin-bottom: 8px;
  }

  .preview-tag {
    font-weight: 700;
    text-transform: uppercase;
    color: var(--accent-ink);
  }

  .preview-mins {
    color: var(--ink-62);
  }

  .preview-purpose {
    font-size: 16px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 4px;
  }

  .preview-desc {
    font-size: 14px;
    line-height: 1.55;
    color: var(--ink-78);
  }

  /* Sticky Footer */
  .ob-footer {
    position: sticky;
    bottom: 0;
    background: var(--canvas);
    border-top: 1px solid var(--line);
    padding: 16px 28px;
    display: flex;
    align-items: center;
    z-index: 10;
  }

  .footer-spacer {
    flex: 1;
  }

  .back-btn {
    appearance: none;
    border: 1.5px solid var(--line-2);
    background: transparent;
    padding: 10px 22px;
    border-radius: 800px;
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
    cursor: pointer;
  }

  .next-btn {
    appearance: none;
    background: var(--accent);
    color: var(--on-accent);
    border: 1.5px solid var(--accent);
    padding: 10px 28px;
    border-radius: 800px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
  }

  .launch-btn {
    background: var(--ink);
    color: var(--canvas);
    border-color: var(--ink);
  }

  @media (max-width: 600px) {
    .ob-body {
      padding: 24px 18px 64px;
    }
    .step-heading {
      font-size: 42px;
    }
    .table-row, .kit-check-row {
      flex-direction: column;
      gap: 6px;
    }
    .p-name, .p-time, .kit-item-label, .kit-item-val {
      width: 100%;
    }
  }
</style>
