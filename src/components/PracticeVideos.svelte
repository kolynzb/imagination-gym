<script lang="ts">
  import { WEEKS } from '../lib/curriculum';
  export let week = 1;
  export let day = 1;
  export let part = 0;
  let selected = 0;
  const dayOne = [
    [{ id: '0_AdsK8x9Lw', title: 'Wrist, elbow and shoulder', by: 'Drawabox', start: 0 }, { id: '_IR8zH4RCfU', title: 'Holding your pen', by: 'Drawabox', start: 0 }],
    [{ id: 'LkJG6pKTuRc', title: 'Ghosted lines', by: 'Drawabox', start: 0 }, { id: 'JsG7cMasVjo', title: 'Ghosted planes', by: 'Drawabox', start: 0 }],
    [{ id: 'zYzgxUVSpUc', title: 'Week 1 overview', by: 'brokendraw', start: 518 }]
  ];
  $: videos = week === 1 && day === 1 ? dayOne[part] || dayOne[2] : WEEKS[week - 1].links.flatMap(link => {
    const url = new URL(link.u);
    const id = url.hostname === 'www.youtube.com' ? url.searchParams.get('v') : null;
    return id ? [{ id, title: link.l, by: 'Course reference', start: parseInt(url.searchParams.get('t') || '0') || 0 }] : [];
  });
  $: video = videos[selected] || videos[0];
</script>
{#if video}
  <div class="videos">
    {#if videos.length > 1}<div class="choices" aria-label="Video demonstrations">{#each videos as item, i}<button type="button" aria-pressed={video === item} onclick={() => selected = i}>{item.title}</button>{/each}</div>{/if}
    <iframe src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&start=${video.start}`} title={`${video.by}: ${video.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    <div class="source"><span>{video.by} · {video.title}</span><a href={`https://www.youtube.com/watch?v=${video.id}&t=${video.start}s`} target="_blank" rel="noreferrer">Watch on YouTube ↗</a></div>
    {#if !(week === 1 && day === 1 && part < 2)}<p class="context">Week reference. Follow the practice instructions below for this part.</p>{/if}
  </div>
{/if}
<style>
iframe{width:100%;aspect-ratio:16/9;display:block;border:0;border-radius:16px;background:var(--ink)}.choices{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}button{font:inherit;font-size:14px;padding:10px 14px;min-height:44px;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:12px;cursor:pointer}button[aria-pressed=true]{background:var(--sulfur);color:#070607;border-color:var(--ink)}.source{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:12px;font-size:13px;color:var(--ink-62)}a{color:var(--accent-ink)}.context{font-size:13px;color:var(--ink-62)}button:focus-visible,a:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
</style>
