<script lang="ts">
  let step = 0;
  const steps = [
    { title: 'Place four corner dots', body: 'Choose four corners for a flat shape. Make it a little tilted or uneven; it does not need to be a square.', check: 'Only four dots on your page so far.' },
    { title: 'Connect the four edges', body: 'For each edge, turn the paper, rehearse above it, then draw once between its dots. Repeat for all four edges.', check: 'Four edges. Keep each attempt, even if it misses a dot.' },
    { title: 'Join opposite corners', body: 'Draw from one corner to the corner across from it. Repeat for the other pair. Prepare each stroke separately.', check: 'Two diagonals cross inside the shape.' },
    { title: 'Add two centre lines', body: 'Mark a point around the middle of each edge. Connect opposite edges through the centre where the diagonals cross. Plan and rehearse each line before drawing it.', check: 'Four edges, two diagonals and two centre lines. Try a new shape next.' }
  ];
</script>

<section class="plane-guide" aria-label="Build a ghosted plane">
  <div class="drawing">
    <svg viewBox="0 0 360 290" role="img" aria-label={`Step ${step + 1}: ${steps[step].check}`}>
      {#if step >= 1}<path class:previous={step > 1} d="M60 70 L270 45 L305 225 L95 250 Z" />{/if}
      {#if step >= 2}<path class:previous={step > 2} d="M60 70 L305 225 M270 45 L95 250" />{/if}
      {#if step >= 3}
        <path d="M165 57.5 L200 237.5 M77.5 160 L287.5 135" />
        {#each [[165,57.5],[200,237.5],[77.5,160],[287.5,135]] as point}<circle cx={point[0]} cy={point[1]} r="3" />{/each}
      {/if}
      {#each [[60,70],[270,45],[305,225],[95,250]] as point}<circle cx={point[0]} cy={point[1]} r="4" />{/each}
    </svg>
    <span class="drawing-note">A flat shape on your page—not a box.</span>
  </div>
  <div class="instruction">
    <div aria-live="polite" aria-atomic="true">
      <span class="step">Step {step + 1} of {steps.length}</span>
      <h4>{steps[step].title}</h4>
      <p>{steps[step].body}</p>
      <p class="check"><strong>Check:</strong> {steps[step].check}</p>
    </div>
    <div class="controls">
      <button type="button" disabled={step === 0} onclick={() => step--}>Previous step</button>
      <button type="button" disabled={step === steps.length - 1} onclick={() => step++}>Next step</button>
    </div>
    <a href="https://www.youtube.com/watch?v=JsG7cMasVjo" target="_blank" rel="noreferrer">Watch the original plane demonstration ↗</a>
  </div>
</section>

<style>
  .plane-guide { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; margin: 24px 0; align-items: center; }
  .drawing { min-width: 0; }
  svg { display: block; width: 100%; height: auto; background: var(--card); border-radius: var(--radius-card); color: var(--ink); }
  path { fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  path.previous { opacity: .4; }
  circle { fill: currentColor; }
  .drawing-note, .step { display: block; font-size: var(--text-control); line-height: 1.5; color: var(--ink-62); }
  .drawing-note { margin-top: 10px; }
  .step { color: var(--accent-ink); font-weight: 600; }
  h4 { font-family: var(--font-body); font-size: 20px; line-height: 1.3; margin: 8px 0 12px; color: var(--ink); }
  p { font-size: var(--text-body); line-height: var(--leading-body); margin: 0 0 16px; }
  .check { color: var(--ink-78); }
  .controls { display: flex; flex-wrap: wrap; gap: 8px; }
  button { min-height: 44px; padding: 10px 14px; border: 1px solid var(--line); border-radius: var(--radius-control); background: var(--card); color: var(--ink); font: inherit; font-size: var(--text-control); cursor: pointer; }
  button:disabled { opacity: .4; cursor: default; }
  a { display: inline-block; margin-top: 16px; padding: 10px 0; color: var(--accent-ink); font-size: var(--text-control); text-underline-offset: 3px; }
  :is(button, a):focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  @media (max-width: 650px) { .plane-guide { grid-template-columns: 1fr; gap: 20px; } .drawing { width: 100%; max-width: 360px; margin: auto; } }
</style>
