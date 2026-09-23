<script lang="ts">
  import { state, actions } from '../lib/store';
  import { api, getConvexSiteUrl, isConvexEnabled, convex, type CrewMember, type CritPost } from '../lib/convex';
  import { onDestroy } from 'svelte';
  import Icon from './Icon.svelte';

  let s = $state;
  $: s = $state;

  let uploadError = '';

  // Real-time Convex data
  let convexMembers: CrewMember[] = [];
  let critPosts: CritPost[] = [];
  let unsubscribeMembers: (() => void) | null = null;
  let unsubscribeCrits: (() => void) | null = null;
  let subscribedRoom = '';
  let subscriptionError = '';

  // New Crit Post Form State
  let critPrompt = '';
  let critFile: File | null = null;
  let critUploading = false;

  $: hasConvex = isConvexEnabled();
  $: crewReady = hasConvex && s.isSignedIn;
  $: if (crewReady && subscribedRoom !== s.roomCode) subscribeConvexRoom();
  $: if (!crewReady && subscribedRoom) clearSubscriptions();

  $: displayMembers = convexMembers.map(member => ({
    ...member,
    locked: member.name.toLowerCase() === s.userName.toLowerCase()
  }));

  onDestroy(() => {
    clearSubscriptions();
  });

  function clearSubscriptions() {
    unsubscribeMembers?.();
    unsubscribeCrits?.();
    unsubscribeMembers = null;
    unsubscribeCrits = null;
    subscribedRoom = '';
    convexMembers = [];
    critPosts = [];
    subscriptionError = '';
  }

  function subscribeConvexRoom() {
    if (!convex || !crewReady) return;
    clearSubscriptions();
    const roomCode = s.roomCode;
    subscribedRoom = roomCode;
    const onError = () => {
      if (subscribedRoom === roomCode) subscriptionError = 'Could not load this crew room.';
    };
    try {
      unsubscribeMembers = convex.onUpdate(api.crew.getMembers, { roomCode }, (members: CrewMember[]) => {
        if (subscribedRoom !== roomCode) return;
        convexMembers = members;
      }, onError);
      unsubscribeCrits = convex.onUpdate(api.crew.getCritPosts, { roomCode }, (posts: CritPost[]) => {
        if (subscribedRoom !== roomCode) return;
        critPosts = posts;
      }, onError);
    } catch (err) {
      console.warn('Convex subscription error:', err);
      subscriptionError = 'Could not load this crew room.';
    }
  }

  let inviteCopiedMsg = '';
  async function handleCopyInviteLink() {
    try {
      const link = await actions.copyInviteLink(s.roomCode);
      inviteCopiedMsg = `Invite link copied: ${link}`;
    } catch {
      inviteCopiedMsg = 'Could not copy the invite link. Please try again.';
    }
    setTimeout(() => (inviteCopiedMsg = ''), 4000);
  }

  async function handleUploadCrit() {
    if (!critFile || critUploading) return;
    critUploading = true;

    uploadError = '';
    try {
      if (!crewReady || !convex) throw new Error('Sign in to post a sketch');
      const siteUrl = getConvexSiteUrl();
      const auth = convex.getAuth();
      if (!siteUrl || !auth) throw new Error('Sketch uploads are unavailable');
      const res = await fetch(`${siteUrl}/crit-upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': critFile.type,
          'X-Crit-Room-Code': s.roomCode,
          'X-Crit-Week': String(s.cw),
          'X-Crit-Day': String(s.cd),
          'X-Crit-Size': String(critFile.size),
          'X-Crit-Prompt': encodeURIComponent(critPrompt || 'Check line convergence and minor axes.')
        },
        body: critFile
      });
      if (!res.ok) throw new Error('Image upload was rejected');

      critPrompt = '';
      critFile = null;
    } catch (err) {
      console.error('Crit upload error:', err);
      uploadError = 'Sketch was not posted. Check the image and Google sign-in, then try again.';
    } finally {
      critUploading = false;
    }
  }
</script>

<div class="crew-view">
  <header class="crew-header">
    <div class="crew-title-group">
      <h1 class="page-title">The Crew</h1>
      <p class="subtitle">
        Practice alongside your drawing crew. Follow their progress and share sketches for feedback.
      </p>
    </div>

    <!-- Room & Name Config -->
    <div class="room-pill-box">
      <div class="config-field">
        <label for="room-code-input">Room Code</label>
        <input
          id="room-code-input"
          type="text"
          value={s.roomCode}
          onchange={(e) => {
            if (e.currentTarget instanceof HTMLInputElement) actions.setRoomCode(e.currentTarget.value);
          }}
        />
      </div>
      <div class="config-field">
        <label for="user-name-input">Your Name</label>
        <input
          id="user-name-input"
          type="text"
          value={s.userName}
          onchange={(e) => {
            if (e.currentTarget instanceof HTMLInputElement) actions.setUserName(e.currentTarget.value);
          }}
        />
      </div>

    </div>
  </header>

  <!-- Pending Invitation Switch Banner -->
  {#if s.invitedRoomCode && s.invitedRoomCode !== s.roomCode}
    <div class="invite-switch-banner">
      <div class="invite-banner-text">
        <span class="invite-banner-icon">🎨</span>
        <span>You were invited to join crew <strong>{s.invitedRoomCode}</strong>. Switch now to draw with this crew?</span>
      </div>
      <div class="invite-banner-actions">
        <button type="button" class="switch-crew-btn" onclick={() => actions.acceptInvite(s.invitedRoomCode!)}>
          Switch to {s.invitedRoomCode}
        </button>
        <button type="button" class="dismiss-crew-btn" onclick={() => actions.dismissInviteBanner()}>
          Dismiss
        </button>
      </div>
    </div>
  {/if}

  <!-- Crew Room Sharing Bar -->
  <div class="crew-share-bar">
    <div class="room-summary-chip">
      <span class="room-tag-label">Room</span>
      <span class="room-tag-value">{s.roomCode}</span>
    </div>
    <div class="share-actions-group">
      <button type="button" class="action-chip-btn highlight" onclick={handleCopyInviteLink}>
        <Icon name="copy" size={14} /> Copy Invite Link
      </button>
      <button type="button" class="action-chip-btn" onclick={() => actions.openAuthModal()}>
        <Icon name="user" size={14} /> Your account
      </button>
    </div>
  </div>

  {#if inviteCopiedMsg}
    <div class="invite-toast">{inviteCopiedMsg}</div>
  {/if}

  <!-- Leaderboard Table -->
  <div class="table-card">
    <div class="table-header">
      <span class="col rank-col">#</span>
      <span class="col name-col">Artist</span>
      <span class="col num-col">Week</span>
      <span class="col num-col">Day</span>
      <span class="col num-col">Hours</span>
      <span class="col prog-col">Through</span>
    </div>

    <div class="table-rows">
      {#each displayMembers as member, idx}
        {@const pct = Math.min(100, Math.round((((member.week - 1) * 7 + member.day) / 56) * 100))}
        <div class="table-row" class:is-me={member.locked}>
          <span class="col rank-col">{String(idx + 1).padStart(2, '0')}</span>
          <div class="col name-col name-cell">
            <span class="member-name">{member.name}</span>
            {#if member.locked}
              <span class="you-badge">YOU</span>
            {/if}
          </div>
          <span class="col num-col">W{member.week}</span>
          <span class="col num-col">D{member.day}</span>
          <span class="col num-col">{member.hours}h</span>
          <div class="col prog-col progress-cell">
            <div class="row-progress-track">
              <div class="row-progress-fill" style="width: {pct}%"></div>
            </div>
            <span class="pct-text">{pct}%</span>
          </div>

        </div>
      {/each}
    </div>
  </div>

  {#if subscriptionError}
    <div class="feedback" role="alert">{subscriptionError}</div>
  {/if}

  <!-- Shared Crit Wall -->
  <section class="crit-section">
    <div class="section-heading">
      <h2 class="sub-title">Crit Wall & Sketch Feed</h2>
      <p class="section-desc">
        Drop photos of today's sketches for your crew to inspect. Use the rubric vocabulary: convergence, minor axes, overlap, and tension points.
      </p>
    </div>

    <!-- Upload Card -->
    <div class="upload-crit-card">
      <div class="upload-top">
        <label class="file-pick-label">
          <input
            type="file"
            accept="image/*"
            onchange={(e) => {
              if (e.currentTarget instanceof HTMLInputElement && e.currentTarget.files) critFile = e.currentTarget.files[0];
            }}
          />
          {#if critFile}
            <Icon name="camera" size={16} /> {critFile.name}
          {:else}
            <Icon name="opened-folder" size={16} /> Choose Drawing / Sketch Photo
          {/if}
        </label>
        <span class="posting-as">Posting as {s.userName} (W{s.cw} D{s.cd})</span>
      </div>
      <div class="upload-bottom">
        <input
          type="text"
          placeholder="What should the crew look at? (e.g. 'Struggling with cylinder minor axes on bottom row')"
          bind:value={critPrompt}
        />
        <button
          type="button"
          class="post-crit-btn"
          disabled={!crewReady || !critFile || critUploading}
          onclick={handleUploadCrit}
        >
          {critUploading ? 'Uploading...' : 'Post to Crit Wall'}
        </button>
      </div>
    </div>

    {#if uploadError}
      <p class="feedback" role="alert">{uploadError}</p>
    {/if}

    <!-- Feed of Posts -->
    <div class="crit-grid">
      {#if critPosts.length === 0}
        <div class="empty-crit-card">
          No sketches posted to this room yet. Be the first to drop a page from today's drills!
        </div>
      {:else}
        {#each critPosts as post}
          <div class="crit-card">
            {#if post.imageUrl}
              <div class="crit-img-container">
                <img src={post.imageUrl} alt="Crit Submission" />
              </div>
            {/if}
            <div class="crit-content">
              <div class="crit-author-row">
                <span class="crit-author">{post.authorName}</span>
                <span class="crit-meta">Week {post.week} · Day {post.day}</span>
              </div>
              <p class="crit-text">{post.prompt}</p>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </section>
</div>

<style>
  .crew-view {
    padding: 36px 44px 80px;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
  }

  .crew-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    flex-wrap: wrap;
    margin-bottom: 28px;
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
    max-width: 60ch;
    margin: 12px 0 0;
  }

  .room-pill-box {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 14px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 260px;
  }

  .config-field {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }

  .config-field label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--ink-55);
  }

  .config-field input {
    background: var(--canvas);
    border: 1px solid var(--line-2);
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 13px;
    width: 130px;
    color: var(--ink);
  }

  .table-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    overflow: hidden;
  }

  .table-header {
    display: flex;
    padding: 14px 20px;
    background: var(--canvas);
    border-bottom: 1px solid var(--line);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-55);
  }

  .table-rows {
    display: flex;
    flex-direction: column;
  }

  .table-row {
    display: flex;
    align-items: center;
    padding: 14px 20px;
    border-bottom: 1px solid var(--line);
    font-size: 14px;
    color: var(--ink);
    background: var(--card);
  }

  .table-row:last-child {
    border-bottom: 0;
  }

  .table-row.is-me {
    background: var(--canvas);
    font-weight: 600;
  }

  .rank-col { width: 36px; flex: 0 0 36px; color: var(--ink-55); }
  .name-col { flex: 1.5; min-width: 120px; }
  .num-col { width: 70px; flex: 0 0 70px; }
  .prog-col { flex: 1; min-width: 120px; }

  .name-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .you-badge {
    background: var(--accent);
    color: var(--on-accent);
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 800px;
  }

  .progress-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .row-progress-track {
    flex: 1;
    height: 5px;
    background: var(--track);
    border-radius: 800px;
    overflow: hidden;
  }

  .row-progress-fill {
    height: 100%;
    background: var(--ink);
  }

  .pct-text {
    font-size: 12px;
    color: var(--ink-62);
    width: 34px;
  }

  .feedback {
    margin-top: 10px;
    font-size: 14px;
    font-weight: 500;
    color: var(--accent-ink);
  }

  .crit-section {
    margin-top: 64px;
    border-top: 1px solid var(--line);
    padding-top: 36px;
  }

  .sub-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 36px;
    letter-spacing: 0.02em;
    margin: 0;
    color: var(--ink);
  }

  .section-desc {
    font-size: 15px;
    line-height: 1.5;
    color: var(--ink-72);
    margin: 8px 0 20px;
    max-width: 65ch;
  }

  .upload-crit-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 18px 20px;
    margin-bottom: 28px;
  }

  .upload-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  .file-pick-label {
    background: var(--canvas);
    border: 1px solid var(--line-2);
    padding: 8px 14px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    color: var(--ink);
    cursor: pointer;
  }

  .file-pick-label input {
    display: none;
  }

  .posting-as {
    font-size: 13px;
    color: var(--ink-62);
  }

  .upload-bottom {
    display: flex;
    gap: 10px;
  }

  .upload-bottom input {
    flex: 1;
    background: var(--canvas);
    border: 1px solid var(--line-2);
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 14px;
    color: var(--ink);
  }

  .post-crit-btn {
    appearance: none;
    border: 1.5px solid var(--ink);
    background: var(--ink);
    color: var(--canvas);
    border-radius: 12px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .post-crit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .crit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .empty-crit-card {
    grid-column: 1 / -1;
    border: 1px dashed var(--line-2);
    border-radius: 20px;
    padding: 36px 20px;
    text-align: center;
    color: var(--ink-62);
    font-size: 15px;
  }

  .crit-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .crit-img-container {
    width: 100%;
    aspect-ratio: 4 / 3;
    background: var(--canvas);
    overflow: hidden;
  }

  .crit-img-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .crit-content {
    padding: 16px 18px;
  }

  .crit-author-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    margin-bottom: 6px;
  }

  .crit-author {
    font-weight: 700;
    color: var(--ink);
  }

  .crit-meta {
    color: var(--ink-62);
  }

  .crit-text {
    font-size: 14px;
    line-height: 1.5;
    color: var(--ink-78);
    margin: 0;
  }

  @media (max-width: 600px) {
    .crew-view {
      padding: 24px 18px 80px;
    }
    .page-title {
      font-size: 44px;
    }
  }
</style>
