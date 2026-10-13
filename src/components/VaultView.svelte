<script lang="ts">
  import { VAULT } from '../lib/curriculum';
  import Icon from './Icon.svelte';

  let searchQuery = '';
  let selectedGroup = '';
  let playingVideo: string | null = null;

  function getEmbedUrl(id: string): string {
    return `https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`;
  }

  $: filteredVault = VAULT.filter(group => !selectedGroup || group.g === selectedGroup).map((group) => {
    if (!searchQuery.trim()) return group;
    const q = searchQuery.toLowerCase().trim();
    const filteredVideos = group.v.filter(
      (v) =>
        v.t.toLowerCase().includes(q) ||
        v.by.toLowerCase().includes(q) ||
        group.g.toLowerCase().includes(q)
    );
    return { ...group, v: filteredVideos };
  }).filter((group) => group.v.length > 0);

  $: totalVideos = filteredVault.reduce((acc, g) => acc + g.v.length, 0);
  $: totalVaultVideos = VAULT.reduce((acc, group) => acc + group.v.length, 0);
</script>

<div class="vault-view">
  <header class="vault-header">
    <h1 class="page-title">The Video Vault</h1>
    <p class="subtitle">
      All {totalVaultVideos} curated videos from the 8-week curriculum roadmap, organized by learning phase. Watch directly here without algorithmic distractions.
    </p>

    <!-- Search Box -->
    <div class="search-row">
      <div class="search-input-wrap">
        <span class="search-icon"><Icon name="pencil" size={16} /></span>
        <input
          type="text"
          class="search-input"
          aria-label="Search videos"
          placeholder="Search videos by title, instructor, or topic (e.g. Peter Han, Drawabox, ghosting)..."
          bind:value={searchQuery}
        />
        {#if searchQuery}
          <button
            type="button"
            class="clear-search-btn"
            onclick={() => { searchQuery = ''; selectedGroup = ''; }}
            aria-label="Clear search"
          >
            <Icon name="cancel" size={12} />
          </button>
        {/if}
      </div>
      {#if searchQuery}
        <span class="match-count">{totalVideos} video{totalVideos === 1 ? '' : 's'} found</span>
      {/if}
    </div>
    <label class="topic-select">Topic
      <select bind:value={selectedGroup} onchange={() => playingVideo = null}>
        <option value="">All videos</option>
        {#each VAULT as group}<option value={group.g}>{group.g}</option>{/each}
      </select>
    </label>
    <div class="phase-filters" aria-label="Video topics">
      <button type="button" class:active={!selectedGroup} aria-pressed={!selectedGroup} onclick={() => { selectedGroup = ''; playingVideo = null; }}>All videos</button>
      {#each VAULT as group}<button type="button" class:active={selectedGroup === group.g} aria-pressed={selectedGroup === group.g} onclick={() => { selectedGroup = group.g; playingVideo = null; }}>{group.g}</button>{/each}
    </div>
    <p class="library-count" aria-live="polite">{totalVideos} videos · Choose a lesson to watch</p>
  </header>

  {#if filteredVault.length === 0}
    <div class="empty-state">
      <Icon name="book" size={40} />
      <h3 class="empty-title">No videos match "{searchQuery}"</h3>
      <p class="empty-desc">Try searching by instructor ("brokendraw", "Peter Han", "Drawabox", "Proko") or technique ("boxes", "spheres").</p>
      <button
        type="button"
        class="reset-filter-btn"
        onclick={() => { searchQuery = ''; selectedGroup = ''; }}
      >
        Clear Search
      </button>
    </div>
  {:else}
    <div class="groups-container">
      {#each filteredVault as group}
        <section class="vault-group">
          <h2 class="group-title">
            {group.g} <span class="group-count">({group.v.length})</span>
          </h2>
          <div class="videos-grid">
            {#each group.v as video}
              <div class="video-card">
                <div class="player-wrapper">
                  {#if playingVideo === video.id}
                  <iframe
                    src={getEmbedUrl(video.id)}
                    title={video.t}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                  {:else}
                    <button class="video-preview" type="button" aria-label={`Watch ${video.t}`} onclick={() => playingVideo = video.id}>
                      <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" />
                      <span class="play-mark" aria-hidden="true">▶</span>
                    </button>
                  {/if}
                </div>
                <div class="video-info">
                  <h3 class="video-title">{video.t}</h3>
                  <div class="video-author">{video.by}</div>
                  <a
                    href="https://www.youtube.com/watch?v={video.id}"
                    target="_blank"
                    rel="noreferrer"
                    class="yt-link"
                  >
                    Open on YouTube ↗
                  </a>
                </div>
              </div>
            {/each}
          </div>
        </section>
      {/each}
    </div>
  {/if}
</div>

<style>
  .topic-select { display: none; }
  .topic-select select { width: 100%; min-width: 0; padding: 12px; min-height: 44px; border: 1px solid var(--line); border-radius: var(--radius-control); color: var(--ink); background: var(--card); font-size: 14px; }
  .phase-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
  .phase-filters button { border: 1px solid var(--line); background: var(--card); border-radius: var(--radius-pill); padding: 10px 14px; min-height: 44px; font-size: 13px; cursor: pointer; }
  .phase-filters button.active { background: var(--ink); color: var(--canvas); }
  .library-count { color: var(--ink-62); font-size: 13px; margin: 16px 0 0; }
  .video-preview { position: absolute; inset: 0; border: 0; padding: 0; width: 100%; height: 100%; display: block; cursor: pointer; background: var(--ink); }
  .video-preview img { width: 100%; height: 100%; object-fit: cover; }
  .play-mark { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: var(--accent); color: var(--on-accent); box-shadow: 0 3px 20px #0005; }

  .vault-view {
    padding: 36px 44px 80px;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
  }

  .vault-header {
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
    max-width: 65ch;
    margin: 12px 0 0;
  }

  .search-row {
    margin-top: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .search-input-wrap {
    position: relative;
    max-width: 520px;
    width: 100%;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 14px;
    pointer-events: none;
    opacity: 0.6;
  }

  .search-input {
    width: 100%;
    padding: 12px 48px 12px 42px;
    min-height: 44px;
    border-radius: var(--radius-pill);
    background: var(--card);
    border: 1px solid var(--line);
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--ink);
    outline: none;
    transition: border-color 150ms var(--ease-out), box-shadow 150ms var(--ease-out);
  }

  .search-input:focus {
    border-color: var(--ink);
    box-shadow: 0 0 0 2px var(--accent);
  }

  .clear-search-btn {
    position: absolute;
    right: 2px;
    width: 44px;
    height: 44px;
    color: var(--ink);
    background: transparent;
    border: 0;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition: opacity 120ms ease;
  }

  .clear-search-btn:hover {
    opacity: 1;
  }

  .match-count {
    font-size: 13px;
    font-weight: 600;
    color: var(--ink-62);
  }

  .groups-container {
    display: flex;
    flex-direction: column;
    gap: 48px;
  }

  .group-title {
    font-family: var(--font-display);
    font-size: 32px;
    letter-spacing: 0.02em;
    margin: 0 0 20px;
    color: var(--ink);
    border-bottom: 1px solid var(--line);
    padding-bottom: 10px;
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .group-count {
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    color: var(--ink-42);
  }

  .videos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 310px), 1fr));
    gap: 20px;
  }

  .video-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius-card);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 180ms var(--ease-out), box-shadow 180ms var(--ease-out);
  }

  @media (hover: hover) and (pointer: fine) {
    .video-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px var(--track);
    }
  }

  .player-wrapper {
    flex-shrink: 0;
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: var(--ink);
  }

  .player-wrapper iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }

  .video-info {
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 8px;
  }

  .video-title {
    font-family: var(--font-body);
    font-size: var(--text-body);
    font-weight: 700;
    line-height: var(--leading-body);
    color: var(--ink);
    margin: 0;
  }

  .video-author {
    font-size: 13px;
    color: var(--ink-62);
  }

  .yt-link {
    font-size: var(--text-control);
    font-weight: 600;
    color: var(--accent-ink);
    text-decoration: none;
    margin-top: auto;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    transition: color 120ms ease;
  }

  .yt-link:hover {
    color: var(--ink);
  }

  .empty-state {
    background: var(--card);
    border: 1px dashed var(--line);
    border-radius: var(--radius-card);
    padding: 60px 24px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .empty-title {
    font-family: var(--font-display);
    font-size: 28px;
    margin: 8px 0 0;
    color: var(--ink);
  }

  .empty-desc {
    font-size: 14px;
    color: var(--ink-62);
    max-width: 45ch;
    margin: 0;
  }

  .reset-filter-btn {
    appearance: none;
    background: var(--ink);
    color: var(--canvas);
    border: 0;
    border-radius: var(--radius-pill);
    padding: 8px 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 8px;
    transition: transform 140ms var(--ease-out);
  }

  .reset-filter-btn:active {
    transform: scale(0.97);
  }

  @media (max-width: 600px) {
    .phase-filters { display: none; }
    .topic-select { display: grid; gap: 8px; margin-top: 18px; font-size: 13px; font-weight: 700; }
    .vault-view {
      padding: 24px 18px 80px;
    }
    .page-title {
      font-size: 44px;
    }
  }
</style>
