<script lang="ts">
  import { state, actions, cloudStatus } from '../lib/store';
  import { isConvexEnabled, setGoogleCredential } from '../lib/convex';
  import { isGoogleAuthAvailable, renderGoogleButton, type GoogleCredential } from '../lib/googleAuth';

  let s = $state;
  $: s = $state;

  const signInAvailable = isGoogleAuthAvailable() && isConvexEnabled();
  let isSubmitting = false;
  let message = '';
  let isError = false;

  function mountGoogleButton(container: HTMLElement) {
    let mounted = true;
    void renderGoogleButton(container, result => {
      if (mounted) void handleGoogleLogin(result);
    }).then(rendered => {
      if (mounted && !rendered) {
        message = 'Google sign-in is unavailable. Please try again later.';
        isError = true;
      }
    });
    return { destroy() { mounted = false; } };
  }

  async function handleGoogleLogin({ credential, profile }: GoogleCredential) {
    if (isSubmitting) return;
    isSubmitting = true;
    message = 'Signing in...';
    isError = false;
    try {
      setGoogleCredential(credential, authenticated => {
        if (!authenticated) actions.cloudSessionExpired();
      });
      await actions.signIn(profile.name, s.invitedRoomCode || undefined);
      message = '';
      actions.closeAuthModal();
    } catch (err) {
      console.error(err);
      message = err instanceof Error ? err.message : 'Google sign-in could not be verified. Please try again.';
      isError = true;
    } finally {
      isSubmitting = false;
    }
  }

  async function handleSignOut() {
    if (!await actions.signOut()) return;
    message = '';
    isError = false;
  }
</script>

{#if !s.isSignedIn || s.authModalOpen}
  <div class="auth-overlay" class:welcome={!s.isSignedIn} role={s.isSignedIn ? 'dialog' : 'region'} aria-modal={s.isSignedIn ? 'true' : undefined} aria-labelledby="auth-heading">
    {#if !s.isSignedIn}
      <div class="welcome-story">
        <div class="welcome-brand"><img src="/android-chrome-192x192.png" alt="" /><span>Imagination Gym</span></div>
        <p class="eyebrow">An eight-week drawing practice</p>
        <h1 id="auth-heading">Make room<br />for drawing.</h1>
        <p class="welcome-intro">Build the skills to draw from imagination, one focused session at a time. Bring a sketchbook or an iPad. We’ll bring the plan.</p>
        <svg class="practice-sketch" viewBox="0 0 560 170" fill="none" aria-hidden="true">
          <path d="M16 133C72 30 117 22 158 116M30 139C83 40 119 41 147 121M13 146L173 146" stroke="currentColor" stroke-width="1.5" />
          <path d="M235 59L289 31L343 59L289 90L235 59ZM235 59V119L289 151L343 120V59M289 90V151" stroke="currentColor" stroke-width="1.8" />
          <path d="M235 119L289 89L343 120M289 31V89" stroke="currentColor" stroke-opacity=".28" stroke-dasharray="4 5" />
          <ellipse cx="455" cy="55" rx="49" ry="21" stroke="currentColor" stroke-width="1.5" />
          <path d="M406 55V123C406 151 504 151 504 123V55" stroke="currentColor" stroke-width="1.5" />
          <path d="M405 120C411 95 499 95 505 120" stroke="currentColor" stroke-opacity=".3" stroke-dasharray="4 5" />
          <path d="M194 23L218 11M354 146L377 154M448 15L457 5" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" />
        </svg>
        <ol class="practice-path">
          <li><span>01</span><strong>Warm up</strong><p>Loosen your shoulder and find your line.</p></li>
          <li><span>02</span><strong>Practise one skill</strong><p>Work through a focused drawing drill.</p></li>
          <li><span>03</span><strong>Make something</strong><p>Put the skill to work in your own project.</p></li>
        </ol>
        <p class="practice-commitment">Plan around 90 minutes for a typical practice day. Every seventh day is for free drawing.</p>
      </div>
    {/if}
    {#if s.isSignedIn}
      <button type="button" class="backdrop-btn" onclick={() => actions.closeAuthModal()} aria-label="Close account"></button>
    {/if}
    <div class="auth-card">
      {#if s.isSignedIn}
        <img src="/android-chrome-192x192.png" alt="" class="auth-modal-logo" />
        <h1 id="auth-heading">Your account</h1>
        <p class="account-name">{s.userName}</p>
        <div class="action-buttons">
          <button type="button" onclick={handleSignOut}>Sign out</button>
          <button type="button" onclick={() => actions.closeAuthModal()}>Close</button>
        </div>
      {:else}
        <h2>Your practice starts here</h2>
        <p>Sign in to open your course, follow today’s session and keep your notes together.</p>
        {#if signInAvailable}
          <div class="google-slot-wrap" aria-busy={isSubmitting} use:mountGoogleButton></div>
        {:else}
          <p class="error" role="alert">Sign-in is unavailable. Please try again later.</p>
        {/if}
        <p class="saving-explainer">Your progress saves to your account. Use the same Google account when you return, on this device or another.</p>
        <p class="connection-note">A Google account and internet connection are required.</p>
      {/if}
      {#if !message && $cloudStatus.status === 'error'}
        <p class="error" role="alert">{$cloudStatus.message}</p>
      {/if}
      {#if message}
        <p class:error={isError} role={isError ? 'alert' : 'status'}>{message}</p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .auth-overlay {
    position: fixed;
    inset: 0;
    z-index: 160;
    background: rgba(7, 6, 7, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
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
    max-height: 92dvh;
    overflow-y: auto;
    text-align: center;
  }

  .auth-modal-logo {
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }

  h1 {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 32px;
    letter-spacing: 0.02em;
    margin: 16px 0;
    color: var(--ink);
  }

  p {
    font-size: 16px;
    line-height: 1.5;
    color: var(--ink-78);
    margin: 16px 0;
  }

  .account-name { font-weight: 700; overflow-wrap: anywhere; }
  .error { color: var(--danger, #9d2b2b); }
  .google-slot-wrap { display: flex; justify-content: center; min-height: 42px; }
  .action-buttons { display: flex; gap: 12px; }
  .action-buttons button {
    flex: 1;
    padding: 12px 20px;
    border-radius: 14px;
    border: 1px solid var(--line-2);
    background: var(--card);
    color: var(--ink);
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
  }
  .action-buttons button:hover { background: var(--line); }

  .welcome {
    position: relative;
    z-index: auto;
    min-height: 100dvh;
    width: 100%;
    background: var(--canvas);
    display: grid;
    grid-template-columns: minmax(0, 680px) minmax(300px, 380px);
    gap: clamp(32px, 6vw, 96px);
    padding: clamp(24px, 5vw, 72px);
    align-content: center;
  }
  .welcome-story { min-width: 0; }
  .welcome-brand { display: flex; align-items: center; gap: 12px; font-weight: 700; }
  .welcome-brand img { width: 34px; height: 34px; }
  .welcome .eyebrow { margin: 44px 0 12px; font-size: 14px; color: var(--ink-72); }
  .welcome h1 { font-size: clamp(60px, 7vw, 96px); line-height: .96; margin: 0 0 24px; }
  .welcome-intro { max-width: 540px; font-size: 18px; line-height: 1.6; }
  .practice-sketch { width: min(100%, 560px); height: auto; margin: 12px 0 24px; color: var(--ink-72); }
  .practice-path { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; padding: 0; margin: 0; list-style: none; }
  .practice-path li { border-top: 1px solid var(--line-2); padding-top: 14px; }
  .practice-path span { display: block; font-size: 12px; color: var(--accent-ink); margin-bottom: 8px; }
  .practice-path strong { font-size: 15px; }
  .practice-path p { font-size: 14px; margin: 8px 0 0; line-height: 1.5; }
  .welcome .practice-commitment { max-width: 520px; font-size: 13px; color: var(--ink-72); margin: 24px 0 0; }
  .welcome .auth-card { text-align: left; max-height: none; overflow: visible; border: 0; border-radius: 18px; padding: 32px; background: var(--card); }
  .welcome h2 { font-family: 'DM Sans', sans-serif; font-size: 24px; font-weight: 700; line-height: 1.2; margin: 0 0 16px; }
  .welcome .auth-card p { font-size: 15px; }
  .welcome .google-slot-wrap { justify-content: flex-start; width: 100%; margin: 24px 0; }
  .welcome .auth-card .saving-explainer { border-top: 1px solid var(--line); padding-top: 20px; font-size: 14px; }
  .welcome .auth-card .connection-note { font-size: 12px; color: var(--ink-72); margin-bottom: 0; }
  @media(max-width: 860px) {
    .welcome { grid-template-columns: minmax(0, 1fr); gap: 28px; padding: 28px 24px 40px; }
    .welcome-story { display: contents; }
    .welcome-brand { grid-row: 1; }
    .welcome .eyebrow { grid-row: 2; margin: 8px 0 -18px; }
    .welcome h1 { grid-row: 3; margin-bottom: 0; }
    .welcome-intro { grid-row: 4; margin: 0; }
    .welcome .auth-card { grid-row: 5; max-width: none; padding: 24px; }
    .practice-sketch { grid-row: 6; margin: 0 auto; }
    .practice-path { grid-row: 7; gap: 16px; }
    .welcome .practice-commitment { grid-row: 8; margin: 0; }
  }
  @media(max-width: 420px) {
    .practice-path { grid-template-columns: 1fr; gap: 20px; }
    .practice-path span { float: left; margin: 3px 12px 0 0; }
    .practice-path p { margin-left: 28px; }
  }
</style>
