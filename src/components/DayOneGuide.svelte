<script lang="ts">
  export let part: string;
</script>

<details class="practice-guide" open={part === 'B'}>
  <summary>How to practise · Part {part}</summary>
  <div class="guide-content">
    {#if part === 'A'}
      <p>Get a pen and a sheet of plain paper. Make room to move your arm and turn the page.</p>
      <ol>
        <li>Draw eight separate straight strokes. Leave space between attempts so you can inspect each one.</li>
        <li>Draw eight C-shaped curves, then eight S-shaped curves. Rehearse each motion above the page before making the mark.</li>
        <li>Repeat with a different size or direction until your ten minutes are up. Turn the page to find a comfortable stroke direction.</li>
      </ol>
      <p><strong>Look for:</strong> a continuous stroke rather than several short corrections. Keep your grip comfortable. Move from your shoulder without deliberately stiffening your wrist.</p>
      <p class="context">This app's suggested warm-up follows today's assigned straight-line and curve practice. The original book exercise is Ex 01, p.7.</p>
    {:else if part === 'B'}
      <p><strong>Your task:</strong> practise planning a mark, rehearsing it, then drawing it once. Start with lines; apply the same process to the edges of flat four-sided shapes.</p>
      <p>Use a pen and plain paper. Keep a fresh area for each attempt. Today's roadmap target is two pages of ghosted lines and two of ghosted planes.</p>
      <figure>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to scroll this illustration region.) -->
        <div class="illustration-scroll" tabindex="0" role="region" aria-label="Ghosting sequence, scroll horizontally on small screens"><img src="/lessons/ghosting-sequence.png" alt="Three stages: place two endpoint dots; rehearse the path above the paper; connect the dots with one ink stroke." width="1774" height="887" /></div>
        <figcaption>Scroll across the illustration on a small screen. The orange path represents movement above the paper, not an extra line to draw.</figcaption>
      </figure>
      <h4>Start with one line</h4>
      <ol>
        <li>Place two small dots to choose the start and end. Turn the page until the movement feels comfortable.</li>
        <li>Move your pen above the page along that path several times. Keep the tip off the paper while rehearsing.</li>
        <li>Lower the pen and make one continuous stroke. Let it finish even if it misses the endpoint. Leave the attempt visible.</li>
        <li>Choose a new pair of points. Vary their distance and placement as you fill the page.</li>
      </ol>
      <details>
        <summary>Why rehearse before drawing?</summary>
        <p>Planning and rehearsal give you time to decide and prepare. During the stroke, focus on a smooth motion instead of steering the pen back toward the target. Accuracy develops through further attempts.</p>
      </details>
      <h4>Then build a plane</h4>
      <p>A plane here is a flat four-sided shape, not a box. Place four corner dots. Use the same plan, rehearse, draw process for every edge. Add the two corner-to-corner diagonals, then two lines across the shape joining opposite edges through the centre. Vary the shape and size on your next attempt.</p>
      <details>
        <summary>Check your work before the next attempt</summary>
        <ul>
          <li><strong>A smooth line misses its dot:</strong> keep it. Rehearse the next attempt more carefully rather than repairing this one.</li>
          <li><strong>A line wobbles:</strong> notice whether you slowed down to steer it. Prepare above the page, then commit to a continuous movement.</li>
          <li><strong>Several strokes cover one edge:</strong> leave the next edge as a single attempt, even when it is inaccurate.</li>
        </ul>
      </details>
      <p><strong>Suggested pacing:</strong> spend about 20 minutes on lines, 25 on planes and five reviewing. If the page target takes longer, record where you stopped and resume later. Don't rush strokes to fill pages.</p>
      <p><strong>Finish by noting:</strong> “My lines tend to ____. On the next page I will ____.” Completing this practice block does not mean mastering the skill or completing Drawabox Lesson 1.</p>
      <details>
        <summary>Watch the original demonstrations</summary>
        <p>Watch how the instructor separates preparation from the final stroke. These are the original Drawabox demonstrations, not new Imagination Gym lessons.</p>
        <a href="https://www.youtube.com/watch?v=LkJG6pKTuRc" target="_blank" rel="noreferrer">Ghosted lines · Drawabox ↗</a>
        <a href="https://www.youtube.com/watch?v=JsG7cMasVjo" target="_blank" rel="noreferrer">Ghosted planes · Drawabox ↗</a>
        <a href="https://drawabox.com/lesson/1" target="_blank" rel="noreferrer">Read the full original lesson ↗</a>
      </details>
      <p class="context">Exercise method: Drawabox / Uncomfortable. Wording, illustration, pacing and reflection prompts: Imagination Gym companion notes. This session is a selection from the roadmap, not the full Drawabox curriculum.</p>
    {:else if part === 'C'}
      <p>Prepare the objects you will study this week: a mug, shoe, scissors, spray bottle and a tool, or five similarly varied household objects.</p>
      <ol>
        <li>Clear a drawing surface and arrange a light so the objects are easy to see.</li>
        <li>Choose one object. Spend a few minutes looking at its outside shape and the larger surfaces inside it.</li>
        <li>Make a small observational drawing and date it. Keep this first attempt so you can compare it with later work.</li>
        <li>Write one thing you found difficult in today's session notes. Leave your materials ready for the next session.</li>
      </ol>
      <p><strong>Done for today:</strong> your workspace and objects are ready, and you have a dated starting drawing. It does not need to look polished.</p>
      <p class="context">The baseline drawing and reflection are suggested additions from Imagination Gym. They make today's setup useful for comparing your progress later.</p>
    {/if}
  </div>
</details>

<style>
  .practice-guide { margin-top: 16px; border-top: 1px solid var(--line); }
  summary { cursor: pointer; padding: 12px 0; min-height: 44px; font-weight: 600; color: var(--ink); }
  summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 4px; }
  .guide-content { font-size: var(--text-body); line-height: var(--leading-body); color: var(--ink-78); max-width: 68ch; }
  p { margin: 0 0 16px; }
  ol, ul { padding-left: 24px; margin: 0 0 16px; }
  li + li { margin-top: 10px; }
  h4 { font-family: var(--font-body); color: var(--ink); font-size: inherit; margin: 24px 0 12px; }
  strong { color: var(--ink); }
  figure { margin: 20px 0; }
  .illustration-scroll { overflow-x: auto; border-radius: var(--radius-control); }
  .illustration-scroll:focus-visible { outline: 2px solid var(--accent); }
  img { min-width: 580px; display: block; width: 100%; height: auto; border-radius: var(--radius-control); }
  figcaption, .context { font-size: var(--text-control); line-height: 1.5; }
  figcaption { margin-top: 8px; }
  .context { margin-top: 16px; color: var(--ink-62); }
  .guide-content details { border-top: 1px solid var(--line); margin-bottom: 12px; }
  a { display: block; padding: 10px 0; min-height: 44px; color: var(--accent-ink); text-underline-offset: 3px; }
</style>
