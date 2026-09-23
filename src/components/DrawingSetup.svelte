<script lang="ts">
  let demonstration = '';
  const videos = [
    { id: '_IR8zH4RCfU', title: 'Holding your pen', note: 'Watch the grip and where the pen contacts the paper.' },
    { id: '0_AdsK8x9Lw', title: 'Wrist, elbow and shoulder', note: 'Watch which parts of the arm move together.' }
  ];
  $: selected = videos.find(video => video.id === demonstration);
</script>

<section class="setup" aria-label="Before you start drawing">
  <h4>Before you start: pen, arm and paper</h4>
  <p>For today's pen exercises, start with a relaxed writing-style grip. You don't need to copy an overhand pencil grip.</p>
  <ol>
    <li><strong>Hold the pen.</strong> A common tripod grip rests the pen on the middle finger, with the thumb and index finger holding it. Keep it secure without squeezing hard.</li>
    <li><strong>Make room to move.</strong> Place the paper where your arm can travel freely. Turn it to suit your stroke direction, whether you draw left- or right-handed.</li>
    <li><strong>Rehearse with your whole arm.</strong> Move the pen above the page and notice your upper arm moving too. A fixed wrist with only the hand turning gives a smaller arc; an anchored elbow limits the upper arm. Don't force your joints rigid.</li>
    <li><strong>Use light contact.</strong> Let the nib make a mark without pressing hard. The side of your hand or a finger can lightly touch the page for support. Avoid planting your elbow as the pivot for this drill.</li>
  </ol>
  <p><strong>Try it now:</strong> rehearse one long stroke above the page, then draw it once. Check that your grip stayed comfortable and your arm had room to move. Adjust the paper before repeating.</p>
  <details ontoggle={(event) => { if (!event.currentTarget.open) demonstration = ''; }}>
    <summary>Show me the grip and movement</summary>
    <p>Original demonstrations by Uncomfortable / Drawabox. Choose one to watch here.</p>
    <div class="choices">
      {#each videos as video}
        <button type="button" aria-pressed={demonstration === video.id} onclick={() => demonstration = video.id}>{video.title}</button>
      {/each}
    </div>
    {#if selected}
      <p>{selected.note}</p>
      {#key selected.id}
        <iframe src={`https://www.youtube-nocookie.com/embed/${selected.id}?rel=0`} title={`Drawabox: ${selected.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      {/key}
      <a href={`https://www.youtube.com/watch?v=${selected.id}`} target="_blank" rel="noreferrer">Open {selected.title.toLowerCase()} on YouTube ↗</a>
      <button type="button" class="close-video" onclick={() => demonstration = ''}>Close video</button>
    {/if}
  </details>
  <p class="source">Shoulder-led movement is the focus of this drill, not a rule for every drawing. Take breaks rather than forcing the motion. <a href="https://drawabox.com/lesson/1/2" target="_blank" rel="noreferrer">Source: Drawabox, Using Your Arm ↗</a></p>
</section>

<style>
  .setup { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--line); max-width: 68ch; color: var(--ink-78); font-size: var(--text-body); line-height: var(--leading-body); }
  h4 { font-family: var(--font-body); font-size: inherit; color: var(--ink); margin: 0 0 12px; }
  p { margin: 0 0 14px; }
  ol { padding-left: 24px; margin: 0 0 16px; }
  li + li { margin-top: 12px; }
  strong { color: var(--ink); }
  summary { cursor: pointer; min-height: 44px; padding: 12px 0; font-weight: 600; color: var(--ink); }
  .choices { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
  button { min-height: 44px; padding: 10px 14px; border: 1px solid var(--line); border-radius: var(--radius-control); background: var(--card); color: var(--ink); font: inherit; cursor: pointer; }
  button[aria-pressed="true"] { border-color: var(--accent-ink); background: var(--accent); color: var(--on-accent); }
  :is(button, summary, a):focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  iframe { display: block; width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: var(--radius-control); }
  a { color: var(--accent-ink); text-underline-offset: 3px; }
  iframe + a { display: block; min-height: 44px; padding: 10px 0; }
  .source { font-size: var(--text-control); margin-top: 14px; }
  .close-video { margin-bottom: 12px; }
</style>
