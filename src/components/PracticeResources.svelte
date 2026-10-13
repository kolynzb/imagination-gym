<script lang="ts">
  import type { Week } from '../lib/curriculum';
  export let week: Week;

  function videoId(url: string) {
    const parsed = new URL(url);
    return ['www.youtube.com', 'youtube.com'].includes(parsed.hostname) ? parsed.searchParams.get('v') : null;
  }

  $: videos = week.links.filter(link => videoId(link.u));
  $: references = week.links.filter(link => !videoId(link.u));
</script>

{#if videos.length}
  <div class="resource-grid">
    {#each videos as link}
      <a class="resource-card video" href={link.u} target="_blank" rel="noreferrer" aria-label={link.l}>
        <div class="thumbnail"><img src={`https://i.ytimg.com/vi/${videoId(link.u)}/mqdefault.jpg`} alt="" loading="lazy" /><span aria-hidden="true">▶</span></div>
        <div class="card-copy"><span class="kind">Video lesson <span aria-hidden="true">↗</span></span><strong>{link.l}</strong><span class="open-label">Watch on YouTube</span></div>
      </a>
    {/each}
  </div>
{/if}
<div class="resource-grid">
  {#each references as link}
    {@const board = link.u.includes('pin.it')}
    <a class="resource-card" href={link.u} target="_blank" rel="noreferrer" aria-label={link.l}>
      <div class="card-copy"><span class="kind">{board ? 'Reference board' : 'Drawing exercise'} <span aria-hidden="true">↗</span></span><strong>{link.l}</strong><span class="open-label">{board ? 'Explore references' : 'Open the exercise'}</span></div>
    </a>
  {/each}
  <article class="reading-card"><span class="kind">On your bookshelf</span><h3>25 Drawing Exercises</h3><span class="author">brokendraw</span><p>{week.book}</p></article>
  <article class="reading-card"><span class="kind">On your bookshelf</span><h3>The Dynamic Bible</h3><span class="author">Peter Han</span><p>{week.han}</p></article>
</div>

<style>
  .resource-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 12px; margin: 12px 0 20px; }
  .resource-card, .reading-card { min-width: 0; border: 1px solid var(--line-2); border-radius: 14px; background: var(--card); overflow: hidden; }
  .resource-card { display: flex; flex-direction: column; color: var(--ink); text-decoration: none; transition: transform 160ms ease, border-color 160ms ease; }
  .resource-card:hover { transform: translateY(-2px); border-color: var(--accent); }
  .resource-card:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
  .card-copy, .reading-card { padding: 18px; }
  .card-copy { display: flex; flex-direction: column; flex: 1; }
  .kind { display: flex; justify-content: space-between; gap: 8px; font-size: 10px; letter-spacing: .09em; text-transform: uppercase; font-weight: 700; color: var(--ink-62); }
  strong { display: block; font-size: 15px; line-height: 1.45; margin: 9px 0 14px; overflow-wrap: anywhere; }
  .open-label { font-size: 12px; color: var(--accent-ink); font-weight: 600; margin-top: auto; }
  .thumbnail { position: relative; aspect-ratio: 16/9; background: var(--ink); overflow: hidden; }
  .thumbnail img { width: 100%; height: 100%; object-fit: cover; }
  .thumbnail > span { position: absolute; bottom: 12px; left: 12px; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: var(--sulfur); color: #070607; font-size: 12px; }
  .reading-card { border-top: 3px solid var(--accent); }
  h3 { font-family: var(--font-body); font-weight: 700; font-size: 16px; line-height: 1.3; margin: 12px 0 4px; }
  .author { font-size: 12px; color: var(--ink-62); }
  p { font-size: 13px; line-height: 1.65; margin: 12px 0 0; }
  @media(prefers-reduced-motion: reduce) { .resource-card { transition: none; } .resource-card:hover { transform: none; } }
</style>
