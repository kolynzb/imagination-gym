<script lang="ts">
  import { onMount, tick } from 'svelte';
  let dialog: HTMLDivElement;
  onMount(() => { const previous = document.activeElement as HTMLElement | null; dialog.querySelector<HTMLButtonElement>('button')?.focus(); return () => { previous?.focus(); }; });
  import { state, actions, cloudStatus } from '../lib/store';
  import { practiceStage } from '../lib/practicePilot';
  import DrawingSetup from './DrawingSetup.svelte';
  import DayOneGuide from './DayOneGuide.svelte';
  import PlaneGuide from './PlaneGuide.svelte';
  import Timer from './Timer.svelte';
  const stages = ['Get ready', 'See the movement', 'Try it', 'Inspect'];
  const frames = [
    { title: 'Plan the mark', body: 'Place two small dots. Turn the paper until the direction feels comfortable.' },
    { title: 'Rehearse above the page', body: 'Move between the dots with the pen tip off the paper. The orange path is movement, not ink.' },
    { title: 'Commit once', body: 'Make one continuous stroke. Leave it visible even if it misses the endpoint.' }
  ];
  let frame = 0;
  let movement: 'line' | 'plane' = 'line';
  const parts = ['Warm-up', 'Lines & planes', 'Baseline drawing'];
  const cues = [
    'Draw eight straight strokes, eight C-curves and eight S-curves. Repeat at different sizes for ten minutes.',
    'Plan, rehearse, draw once. Practise lines, then four-sided planes. Aim for smooth strokes before precise endpoints.',
    'Arrange your five household objects. Draw one from observation, date the page and keep it for comparison.'
  ];
  async function go(index: number) { practiceStage.set(index); await tick(); dialog.querySelector<HTMLElement>('main')?.focus({ preventScroll: true }); dialog.scrollTop = 0; }
  function keyboard(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, textarea, summary, [tabindex="0"]')).filter(el => el.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    if (event.key === 'Escape') actions.setFocus(false);
    if ($practiceStage !== 2 || event.code !== 'Space' || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    if (!(event.target instanceof HTMLElement) || event.target.isContentEditable || event.target.closest('button, input, textarea, select, summary, a')) return;
    event.preventDefault(); actions.toggleTimer();
  }
</script>

<svelte:window onkeydown={keyboard} />
<div bind:this={dialog} class="guided-practice" role="dialog" aria-modal="true" aria-label="Day 1 guided practice">
  <header>
    <div><span class="eyebrow">Week 1 / Day 1</span><h1>Make your first marks</h1></div>
    <button type="button" onclick={() => actions.setFocus(false)}>Back to Today</button>
  </header>
  <nav aria-label="Practice stages">
    {#each stages as stage, index}
      <button type="button" aria-current={$practiceStage === index ? 'step' : undefined} onclick={() => go(index)}><span class="step-number">0{index + 1}</span>{stage}</button>
    {/each}
  </nav>
  <main tabindex="-1">
    {#if $cloudStatus.status === 'error'}
      <div role="alert">{$cloudStatus.message} <button type="button" onclick={() => actions.syncToCloud()}>Retry save</button></div>
    {/if}
    {#if $practiceStage !== 2 && $state.timerRunning}
      <div class="running-note">Your practice timer is still running. <button type="button" onclick={() => actions.toggleTimer()}>Pause timer</button></div>
    {/if}
    {#if $practiceStage === 0}
      <div class="stage-heading"><h2>Give your arm room.</h2><span>Pen + plain paper</span></div>
      <p class="intro">Check your grip and movement, then try one stroke. The timer starts only when you choose Start in practice.</p>
      <DrawingSetup />
    {:else if $practiceStage === 1}
      <div class="movement-choice" role="group" aria-label="Choose a demonstration">
        <button type="button" aria-pressed={movement === 'line'} onclick={() => movement = 'line'}>One line</button>
        <button type="button" aria-pressed={movement === 'plane'} onclick={() => movement = 'plane'}>Build a plane</button>
      </div>
      {#if movement === 'plane'}
        <h2>Build it one stroke at a time.</h2>
        <PlaneGuide />
      {:else}
      <div class="stage-heading"><h2>One mark. Three decisions.</h2><span>{frame + 1} / 3</span></div>
      <div class="demonstration">
        <div class="frame" role="img" aria-label={frames[frame].body}><img src="/lessons/ghosting-sequence.png" alt="" style={`transform: translateX(-${frame * 100 / 3}%);`} /></div>
        <div class="frame-copy"><h3>{frames[frame].title}</h3><p>{frames[frame].body}</p>
          <div class="frame-controls"><button type="button" disabled={frame === 0} onclick={() => frame--}>Previous drawing</button><button type="button" disabled={frame === 2} onclick={() => frame++}>Next drawing</button></div>
          <a href="https://www.youtube.com/watch?v=LkJG6pKTuRc" target="_blank" rel="noreferrer">Watch Drawabox demonstrate ↗</a>
        </div>
      </div>
      {/if}
    {:else if $practiceStage === 2}
      <div class="stage-heading"><h2>{parts[$state.timerPartIndex] || parts[0]}</h2><span>Practise on paper</span></div>
      <div class="practice-layout">
        <div><p class="intro">{cues[$state.timerPartIndex] || cues[0]}</p>
          <div class="practice-mark" role="img" aria-label="One continuous ink stroke connects two endpoint dots."><img src="/lessons/ghosting-sequence.png" alt="" /></div>
          <div class="cue"><span>Remember</span><strong>Prepare above the page.<br />Draw once. Keep the attempt.</strong></div>
          <details><summary>Check your setup</summary><DrawingSetup /></details>
          <details><summary>Full instructions for this part</summary><DayOneGuide part={['A','B','C'][$state.timerPartIndex] || 'A'} /></details>
        </div>
        <Timer plannedMins={90} showFocus={false} embedded />
      </div>
    {:else}
      <div class="stage-heading"><h2>Notice one thing to adjust.</h2><span>No perfect page required</span></div>
      <ul class="checks"><li><strong>Smooth but misses the dot?</strong><span>Keep it. Prepare the next stroke more carefully.</span></li><li><strong>Wobbles or repeated corrections?</strong><span>Rehearse, then commit without steering the pen mid-stroke.</span></li><li><strong>What changed across the page?</strong><span>Compare early and later attempts. Choose one adjustment.</span></li></ul>
      <label for="pilot-note">Today's observation</label>
      <textarea id="pilot-note" rows="4" placeholder="My lines tend to… Next time I will…" value={$state.dayNotes.w1d1 || ''} oninput={(e) => actions.setDayNote(1, 1, e.currentTarget.value)}></textarea>
      <p class="muted">Uses your existing Day 1 notes. Mark only the parts you practised.</p>
      <div class="completion">{#each parts as part, index}<label><input type="checkbox" checked={!!$state.done[`w1d1p${index}`]} onchange={() => actions.togglePart(1, 1, index)} />{part}</label>{/each}</div>
    {/if}
  </main>
  <footer><span>Day 1 practice</span><button type="button" class="primary" onclick={() => $practiceStage < 3 ? go($practiceStage + 1) : actions.setFocus(false)}>{$practiceStage < 3 ? stages[$practiceStage + 1] + ' →' : 'Back to Today'}</button></footer>
</div>

<style>
  .movement-choice { display: flex; gap: 8px; margin-bottom: 24px; }
  .movement-choice button[aria-pressed="true"] { background: var(--ink); color: var(--canvas); border-color: var(--ink); }
  .guided-practice { position: fixed; inset: 0; z-index: 121; background: var(--canvas); color: var(--ink); overflow-y: auto; padding: 28px max(24px, calc((100vw - 1120px) / 2)); }
  header, .stage-heading, footer { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
  header { padding-bottom: 24px; }
  h1 { font-family: var(--font-display); font-size: 38px; margin: 4px 0 0; }
  h2 { font-family: var(--font-display); font-size: clamp(32px, 5vw, 48px); margin: 0; }
  h3 { font-family: var(--font-body); font-size: 24px; margin: 0 0 12px; }
  .eyebrow, .stage-heading > span, footer > span, .muted { color: var(--ink-62); font-size: var(--text-control); }
  button { cursor: pointer; border: 1px solid var(--line); background: var(--card); color: var(--ink); font: inherit; font-size: var(--text-control); font-weight: 600; min-height: 44px; padding: 10px 16px; border-radius: var(--radius-control); }
  button:disabled { opacity: .4; cursor: default; }
  :is(button, summary, textarea, a, input):focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  nav { display: grid; grid-template-columns: repeat(4, 1fr); border-bottom: 1px solid var(--line); gap: 8px; }
  nav button { display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; background: transparent; border: 0; border-radius: 0; border-bottom: 3px solid transparent; text-align: left; color: var(--ink-62); }
  nav button[aria-current] { border-bottom-color: var(--accent); color: var(--ink); font-weight: 700; }
  .step-number { display: block; font-family: var(--font-display); font-size: 24px; line-height: 1; margin-bottom: 8px; }
  nav button[aria-current] .step-number { color: var(--accent-ink); }
  button:not(:disabled):hover { border-color: var(--ink-62); }
  nav button:not([aria-current]):hover { color: var(--ink); background: var(--card); }
  main { padding: 32px 0; min-height: 55vh; }
  .intro { font-size: 18px; max-width: 62ch; line-height: 1.6; }
  .demonstration, .practice-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; margin-top: 24px; align-items: start; }
  .frame { width: 100%; max-width: 320px; margin: auto; overflow: hidden; border-radius: var(--radius-card); border: 1px solid var(--line); }
  .frame img { display: block; width: 300%; max-width: none; height: auto; }
  .frame-copy { align-self: center; }
  .frame-copy p { line-height: 1.6; }
  .frame-controls { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0; }
  a { color: var(--accent-ink); text-underline-offset: 3px; }
  .practice-mark { width: 160px; overflow: hidden; border-radius: var(--radius-control); }
  .practice-mark img { display: block; width: 300%; max-width: none; transform: translateX(-66.6667%); }
  .cue { border-left: 3px solid var(--accent); padding: 8px 20px; margin: 24px 0; }
  .cue span { display: block; color: var(--ink-62); margin-bottom: 8px; }
  .cue strong { font-size: 22px; line-height: 1.5; }
  summary { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 0; min-height: 44px; cursor: pointer; font-weight: 600; list-style: none; }
  summary::-webkit-details-marker { display: none; }
  summary::after { content: '+'; color: var(--ink-62); font-size: 22px; font-weight: 400; }
  details[open] > summary::after { content: '−'; }
  details[open] { padding-bottom: 20px; }
  details { border-top: 1px solid var(--line); }
  .checks { list-style: none; padding: 0; margin: 24px 0; }
  .checks li { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; border-bottom: 1px solid var(--line); padding: 18px 0; }
  .checks span { color: var(--ink-78); }
  textarea { display: block; width: 100%; margin-top: 10px; background: var(--card); color: var(--ink); border: 1px solid var(--line); border-radius: var(--radius-control); padding: 14px; font: inherit; }
  .completion { display: flex; flex-wrap: wrap; gap: 20px; }
  .completion label { display: flex; align-items: center; gap: 8px; min-height: 44px; }
  input { accent-color: var(--accent); width: 20px; height: 20px; }
  footer { border-top: 1px solid var(--line); padding: 20px 0; }
  .primary { border-radius: var(--radius-action); background: var(--accent); color: var(--on-accent); border-color: transparent; font-weight: 600; }
  .running-note { padding: 12px 0; margin-bottom: 16px; }
  @media(max-width: 650px) { .guided-practice { padding: 20px; } header { align-items: start; } h1 { font-size: 28px; } nav { gap: 0; } nav button { padding: 8px 4px; font-size: 13px; } .stage-heading { align-items: start; } .stage-heading > span { max-width: 100px; text-align: right; } .demonstration, .practice-layout { grid-template-columns: 1fr; gap: 20px; } .frame { max-width: 240px; margin: auto; } .practice-layout :global(.timer-box) { order: -1; } .checks li { grid-template-columns: 1fr; gap: 8px; } }
</style>
