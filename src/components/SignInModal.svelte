<script lang="ts">
  import { state, actions, derivedStats } from '../lib/store';
  import { isConvexEnabled } from '../lib/convex';
  import { isGoogleAuthAvailable, renderGoogleButton, type GoogleUserPayload } from '../lib/googleAuth';
  import Icon from './Icon.svelte';

  let s = $state;
  let stats = $derivedStats;

  $: s = $state;
  $: stats = $derivedStats;

  let inputName = s.userName === 'You' ? '' : s.userName;
  let inputRoom = s.invitedRoomCode || s.roomCode || 'GYM-CREW';
  let isSubmitting = false;
  let syncMessage = '';
  let isError = false;

  let prevModalOpen = false;
  let googleBtnSlot: HTMLElement | null = null;
  const hasGoogleAuth = isGoogleAuthAvailable();

  $: if (s.authModalOpen && !prevModalOpen) {
    inputName = s.userName === 'You' ? '' : s.userName;
    inputRoom = s.invitedRoomCode || s.roomCode || 'GYM-CREW';
    syncMessage = s.invitedRoomCode ? `Invited to join crew ${s.invitedRoomCode}!` : '';
    isError = false;
  }
  $: prevModalOpen = s.authModalOpen;

  $: if (googleBtnSlot && hasGoogleAuth && !s.isSignedIn) {
    renderGoogleButton(googleBtnSlot, handleGoogleLogin);
  }

  const convexLive = isConvexEnabled();

  async function handleGoogleLogin(user: GoogleUserPayload) {
    isSubmitting = true;
    syncMessage = `Signing in as ${user.name}...`;
    isError = false;
    try {
      const cleanRoom = inputRoom.toUpperCase().trim() || 'GYM-CREW';
      await actions.signIn(user.name, cleanRoom, user.email, user.picture, user.sub);
      syncMessage = `✓ Welcome, ${user.name}! Synced with ${cleanRoom}.`;
      setTimeout(() => {
        actions.closeAuthModal();
      }, 700);
    } catch (err) {
      console.error(err);
      syncMessage = 'Failed to sign in with Google.';
      isError = true;
    } finally {
      isSubmitting = false;
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const cleanName = inputName.trim();
    const cleanRoom = inputRoom.toUpperCase().trim();

    if (!cleanName) {
      syncMessage = 'Please enter an artist handle / name.';
      isError = true;
      return;
    }
    if (!cleanRoom) {
      syncMessage = 'Please enter a room code (e.g. GYM-CREW).';
      isError = true;
      return;
    }

    isSubmitting = true;
    syncMessage = 'Connecting & syncing progress...';
    isError = false;

    try {
      await actions.signIn(cleanName, cleanRoom);
      syncMessage = '✓ Signed in and synced!';
      setTimeout(() => {
        actions.closeAuthModal();
      }, 700);
    } catch (err) {
      console.error(err);
      syncMessage = 'Sync failed. Storing locally instead.';
      isError = true;
    } finally {
      isSubmitting = false;
    }
  }

  async function handleManualSync() {
    isSubmitting = true;
    syncMessage = 'Syncing to cloud...';
    isError = false;
    const ok = await actions.syncToCloud();
    isSubmitting = false;
    if (ok) {
      syncMessage = '✓ Synced with Convex cloud!';
    } else {
      syncMessage = 'Convex not connected. Progress saved locally.';
    }
    setTimeout(() => {
      syncMessage = '';
    }, 3000);
  }

  function handleSignOut() {
    actions.signOut();
    syncMessage = 'Signed out. Now using local profile.';
    setTimeout(() => {
      syncMessage = '';
    }, 2000);
  }

  function generateRoomCode(): string {
    const prefixes = ['GYM', 'STUDIO', 'ATELIER', 'CREW', 'INK', 'CUBE', 'LINE'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${code}`;
  }

  function handleGenerateRoomCode() {
    inputRoom = generateRoomCode();
    syncMessage = `Generated new room code: ${inputRoom}`;
    isError = false;
    setTimeout(() => {
      if (syncMessage.startsWith('Generated')) syncMessage = '';
    }, 2500);
  }

  async function handleCopyInviteLink() {
    const link = await actions.copyInviteLink(s.roomCode);
    syncMessage = `✓ Copied invite link: ${link}`;
    isError = false;
    setTimeout(() => {
      if (syncMessage.startsWith('✓ Copied invite')) syncMessage = '';
    }, 4000);
  }

  function handleCopyRoomCode() {
    navigator.clipboard.writeText(s.roomCode);
    syncMessage = `✓ Copied room code: ${s.roomCode}`;
    setTimeout(() => (syncMessage = ''), 3000);
  }

  function handleCopyShareCode() {
    navigator.clipboard.writeText(`${s.userName}: ${stats.shareCode}`);
    syncMessage = `✓ Copied code: ${s.userName}: ${stats.shareCode}`;
    setTimeout(() => (syncMessage = ''), 3000);
  }
</script>

{#if s.authModalOpen}
  <div class="auth-overlay" role="dialog" aria-modal="true" aria-label="Artist profile and cloud sync">
    <button
      type="button"
      class="backdrop-btn"
      onclick={() => actions.closeAuthModal()}
      aria-label="Close dialog"
    ></button>

    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-title-group">
          <div class="auth-badge">PROFILE & SYNC</div>
          <h2 class="auth-heading">Artist Cloud Sync</h2>
        </div>
        <button
          type="button"
          class="close-btn"
          onclick={() => actions.closeAuthModal()}
          aria-label="Close"
        >
          <Icon name="cancel" size={16} />
        </button>
      </div>

      <div class="status-banner" class:online={convexLive}>
        <div class="status-dot"></div>
        <div class="status-info">
          {#if convexLive}
            <span class="status-title">Convex BaaS Connected</span>
            <span class="status-desc">Real-time sync enabled across devices & crew members.</span>
          {:else}
            <span class="status-title">Offline Local Mode</span>
            <span class="status-desc">Progress saved locally in browser. Add VITE_CONVEX_URL for cloud sync.</span>
          {/if}
        </div>
      </div>

      {#if s.isSignedIn}
        <!-- ALREADY SIGNED IN -->
        <div class="signed-in-section">
          <div class="profile-summary">
            <div class="avatar-lg">
              {#if s.userAvatar}
                <img src={s.userAvatar} alt={s.userName} class="avatar-img-round" />
              {:else}
                {s.userName ? s.userName.charAt(0).toUpperCase() : 'A'}
              {/if}
            </div>
            <div class="profile-details">
              <div class="profile-handle">{s.userName}</div>
              {#if s.userEmail}
                <div class="profile-email-badge">
                  <Icon name="user" size={12} /> {s.userEmail}
                </div>
              {/if}
              <div class="profile-room-row">
                <span class="profile-room-tag">Room: <strong>{s.roomCode}</strong></span>
                <button type="button" class="copy-room-btn" onclick={handleCopyRoomCode}>
                  <Icon name="copy" size={13} /> Code
                </button>
                <button type="button" class="copy-invite-btn" onclick={handleCopyInviteLink}>
                  <Icon name="copy" size={13} /> Invite Link
                </button>
              </div>
              <div class="profile-stats-row">
                <span>Week {s.cw} · Day {s.cd}</span>
                <span>{stats.totalHoursNum}h logged</span>
                <span><Icon name="fire" size={14} /> {stats.streak}d streak</span>
              </div>
            </div>
          </div>

          {#if syncMessage}
            <div class="sync-alert" class:error={isError}>{syncMessage}</div>
          {/if}

          <div class="action-buttons">
            <button
              type="button"
              class="btn-primary"
              disabled={isSubmitting}
              onclick={handleManualSync}
            >
              {isSubmitting ? 'Syncing...' : 'Sync Cloud Now'}
            </button>
            <button
              type="button"
              class="btn-secondary"
              onclick={handleSignOut}
            >
              Sign Out / Switch
            </button>
          </div>
        </div>
      {:else}
        <!-- SIGN IN FORM -->
        <form class="auth-form" onsubmit={handleSubmit}>
          {#if s.invitedRoomCode}
            <div class="invite-banner">
              <div class="invite-badge">🎨 CREW INVITATION</div>
              <div class="invite-title">You've been invited to join <strong>{s.invitedRoomCode}</strong></div>
              <div class="invite-desc">Choose an artist handle or sign in to start practicing with your crew!</div>
            </div>
          {:else}
            <p class="auth-intro">
              Pick an artist handle and crew room code, or sign in with Google. Your 56-day progress, timer logs, and notes will sync in real time across your devices.
            </p>
          {/if}

          <!-- Google Auth Section -->
          <div class="google-auth-section">
            {#if hasGoogleAuth}
              <div class="google-slot-wrap" bind:this={googleBtnSlot}></div>
              <div class="or-separator">
                <span class="sep-line"></span>
                <span class="sep-text">OR ENTER ARTIST HANDLE</span>
                <span class="sep-line"></span>
              </div>
            {:else}
              <div class="google-callout">
                <div class="google-callout-icon">🔐</div>
                <div class="google-callout-text">
                  <strong>Google OAuth Supported:</strong> Add <code>VITE_GOOGLE_CLIENT_ID</code> to enable one-click Google Sign-In.
                </div>
              </div>
            {/if}
          </div>

          <div class="form-group">
            <label for="artist-name">Artist Handle / Name</label>
            <input
              id="artist-name"
              type="text"
              class="text-input"
              placeholder="e.g. Kofi, Elena, Ghoster"
              bind:value={inputName}
              required
            />
            <span class="field-hint">Your public identity on the Crew leaderboard.</span>
          </div>

          <div class="form-group">
            <div class="field-label-row">
              <label for="room-code">Crew Room Code</label>
              {#if !s.invitedRoomCode}
                <button
                  type="button"
                  class="generate-code-btn"
                  onclick={handleGenerateRoomCode}
                  title="Auto-generate a new unique room code"
                >
                  <Icon name="dice" size={15} /> Auto-Generate New Code
                </button>
              {/if}
            </div>
            <div class="room-input-box">
              <input
                id="room-code"
                type="text"
                class="text-input code-input"
                class:is-invited-code={!!s.invitedRoomCode}
                placeholder="GYM-CREW"
                bind:value={inputRoom}
                required
              />
              {#if s.invitedRoomCode}
                <span class="invited-badge">INVITED ROOM</span>
              {:else if inputRoom !== 'GYM-CREW'}
                <button
                  type="button"
                  class="reset-public-btn"
                  onclick={() => (inputRoom = 'GYM-CREW')}
                  title="Switch back to public gym room"
                >
                  Use Public (GYM-CREW)
                </button>
              {/if}
            </div>
            <span class="field-hint">
              {#if s.invitedRoomCode}
                You are joining crew <strong>{s.invitedRoomCode}</strong>.
              {:else}
                Join an existing crew with their code, or click <strong>Auto-Generate</strong> to create a private room and invite friends.
              {/if}
            </span>
          </div>

          {#if syncMessage}
            <div class="sync-alert" class:error={isError}>{syncMessage}</div>
          {/if}

          <div class="form-actions">
            <button type="submit" class="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Connecting...' : (s.invitedRoomCode ? `Join ${inputRoom} & Sync` : 'Sign In & Sync Device')}
            </button>
          </div>
        </form>
      {/if}

      <!-- Quick Share Code -->
      <div class="sync-code-box">
        <div class="sync-code-header">
          <span class="sync-code-label">Quick Share Code (Offline Sync)</span>
          <button type="button" class="copy-btn" onclick={handleCopyShareCode}>
            Copy Code
          </button>
        </div>
        <div class="sync-code-preview">
          <code>{s.userName}: {stats.shareCode}</code>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .auth-overlay {
    position: fixed;
    inset: 0;
    z-index: 160;
    background: rgba(7, 6, 7, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: fadeIn 200ms var(--ease-out);
  }

  .backdrop-btn {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    border: 0;
    cursor: pointer;
  }

  .auth-card {
    position: relative;
    width: 100%;
    max-width: 480px;
    background: var(--canvas);
    border: 1px solid var(--line-2);
    border-radius: 28px;
    padding: 32px 28px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
    z-index: 2;
    transform-origin: center;
    animation: modalEnter 220ms var(--ease-out);
    max-height: 92dvh;
    overflow-y: auto;
  }

  @keyframes modalEnter {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .auth-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .auth-badge {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--accent-ink);
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .auth-heading {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 32px;
    letter-spacing: 0.02em;
    margin: 0;
    line-height: 1;
    color: var(--ink);
  }

  .close-btn {
    appearance: none;
    background: transparent;
    border: 0;
    font-size: 20px;
    color: var(--ink-62);
    cursor: pointer;
    padding: 4px;
    border-radius: 800px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .close-btn:hover {
    color: var(--ink);
  }

  .status-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 16px;
    background: var(--card);
    border: 1px solid var(--line);
    margin-bottom: 20px;
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 800px;
    background: var(--ink-55);
    flex: 0 0 10px;
  }

  .status-banner.online .status-dot {
    background: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
  }

  .status-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .status-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
  }

  .status-desc {
    font-size: 12px;
    color: var(--ink-62);
  }

  .invite-banner {
    background: rgba(235, 94, 40, 0.08);
    border: 1px solid rgba(235, 94, 40, 0.3);
    border-radius: 16px;
    padding: 14px 16px;
    margin-bottom: 18px;
  }

  .invite-badge {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: var(--accent);
    margin-bottom: 4px;
  }

  .invite-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 2px;
  }

  .invite-desc {
    font-size: 12px;
    color: var(--ink-78);
  }

  .auth-intro {
    font-size: 13px;
    line-height: 1.5;
    color: var(--ink-78);
    margin: 0 0 16px;
  }

  .google-auth-section {
    margin-bottom: 16px;
  }

  .google-slot-wrap {
    display: flex;
    justify-content: center;
    min-height: 42px;
  }

  .or-separator {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 16px 0 6px;
  }

  .sep-line {
    flex: 1;
    height: 1px;
    background: var(--line);
  }

  .sep-text {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--ink-40);
  }

  .google-callout {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 12px;
    background: var(--card);
    border: 1px dashed var(--line-2);
  }

  .google-callout-icon {
    font-size: 16px;
  }

  .google-callout-text {
    font-size: 11px;
    line-height: 1.4;
    color: var(--ink-62);
  }

  .google-callout-text code {
    background: var(--line);
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 10px;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: var(--ink);
  }

  .generate-code-btn {
    appearance: none;
    background: transparent;
    border: 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .generate-code-btn:hover {
    text-decoration: underline;
  }

  .text-input {
    width: 100%;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid var(--line-2);
    background: var(--canvas);
    color: var(--ink);
    font-size: 14px;
    box-sizing: border-box;
    transition: border-color 150ms ease;
  }

  .text-input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .code-input {
    font-family: monospace;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .code-input.is-invited-code {
    border-color: rgba(235, 94, 40, 0.4);
    background: rgba(235, 94, 40, 0.03);
  }

  .room-input-box {
    position: relative;
    display: flex;
    align-items: center;
  }

  .invited-badge {
    position: absolute;
    right: 10px;
    font-size: 10px;
    font-weight: 800;
    color: var(--accent);
    background: rgba(235, 94, 40, 0.12);
    padding: 2px 8px;
    border-radius: 6px;
    letter-spacing: 0.05em;
  }

  .reset-public-btn {
    position: absolute;
    right: 8px;
    appearance: none;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 800px;
    font-size: 11px;
    font-weight: 600;
    color: var(--ink-78);
    padding: 4px 10px;
    cursor: pointer;
  }

  .reset-public-btn:hover {
    color: var(--ink);
    border-color: var(--line-2);
  }

  .field-hint {
    font-size: 11px;
    color: var(--ink-55);
    line-height: 1.4;
  }

  .sync-alert {
    padding: 10px 14px;
    border-radius: 12px;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #059669;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
  }

  .sync-alert.error {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #dc2626;
  }

  .form-actions {
    margin-top: 4px;
  }

  .btn-primary {
    width: 100%;
    padding: 12px 20px;
    border-radius: 14px;
    border: 0;
    background: var(--accent);
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: transform 120ms ease, opacity 150ms ease;
  }

  .btn-primary:active {
    transform: scale(0.98);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-secondary {
    padding: 12px 20px;
    border-radius: 14px;
    border: 1px solid var(--line-2);
    background: var(--card);
    color: var(--ink);
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background 150ms ease;
  }

  .btn-secondary:hover {
    background: var(--line);
  }

  /* Signed In Layout */
  .signed-in-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 24px;
  }

  .profile-summary {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border-radius: 18px;
    background: var(--card);
    border: 1px solid var(--line);
  }

  .avatar-lg {
    width: 52px;
    height: 52px;
    border-radius: 800px;
    background: var(--ink);
    color: var(--canvas);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 800;
    flex: 0 0 52px;
    overflow: hidden;
  }

  .avatar-img-round {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .profile-handle {
    font-size: 18px;
    font-weight: 700;
    color: var(--ink);
    line-height: 1.2;
  }

  .profile-email-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--ink-62);
  }

  .profile-room-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
    flex-wrap: wrap;
  }

  .profile-room-tag {
    font-size: 13px;
    color: var(--ink-78);
  }

  .copy-room-btn,
  .copy-invite-btn {
    appearance: none;
    background: var(--line);
    border: 0;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    color: var(--ink-78);
    padding: 3px 8px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .copy-room-btn:hover,
  .copy-invite-btn:hover {
    color: var(--ink);
    background: var(--line-2);
  }

  .copy-invite-btn {
    background: rgba(235, 94, 40, 0.1);
    color: var(--accent);
  }

  .copy-invite-btn:hover {
    background: rgba(235, 94, 40, 0.2);
    color: var(--accent);
  }

  .profile-stats-row {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: var(--ink-62);
    margin-top: 4px;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }

  .action-buttons button {
    flex: 1;
  }

  /* Quick Share Code */
  .sync-code-box {
    padding: 14px 16px;
    border-radius: 16px;
    background: var(--card);
    border: 1px solid var(--line);
  }

  .sync-code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .sync-code-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--ink-62);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .copy-btn {
    appearance: none;
    background: transparent;
    border: 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    cursor: pointer;
    padding: 0;
  }

  .copy-btn:hover {
    text-decoration: underline;
  }

  .sync-code-preview code {
    font-family: monospace;
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
    background: var(--canvas);
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid var(--line);
    display: block;
  }
</style>
