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
  <div class="auth-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-heading">
    {#if s.isSignedIn}
      <button type="button" class="backdrop-btn" onclick={() => actions.closeAuthModal()} aria-label="Close account"></button>
    {/if}
    <div class="auth-card">
      <img src="/android-chrome-192x192.png" alt="" class="auth-modal-logo" />
      <h1 id="auth-heading">{s.isSignedIn ? 'Your account' : 'Imagination Gym'}</h1>
      {#if s.isSignedIn}
        <p class="account-name">{s.userName}</p>
        <div class="action-buttons">
          <button type="button" onclick={handleSignOut}>Sign out</button>
          <button type="button" onclick={() => actions.closeAuthModal()}>Close</button>
        </div>
      {:else}
        <p>Sign in with Google to start your drawing practice.</p>
        {#if signInAvailable}
          <div class="google-slot-wrap" aria-busy={isSubmitting} use:mountGoogleButton></div>
        {:else}
          <p class="error" role="alert">Sign-in is unavailable. Please try again later.</p>
        {/if}
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
</style>
