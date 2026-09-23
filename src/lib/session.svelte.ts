import { setupConvexAuth } from '@mmailaender/convex-auth-svelte/svelte';
import { convex, api, registerSession, sessionLoading, sessionError } from './convex';
import { actions, state } from './store';
import { get } from 'svelte/store';

export function initializeSession() {
  if (!convex) return;
  const client = convex;
  sessionLoading.set(true);
  const auth = setupConvexAuth({ client, convexUrl: import.meta.env.VITE_CONVEX_URL!.trim().replace(/\/+$/, '') });
  let signingOut: Promise<void> | null = null;
  let restoredSubject: string | null = null;
  let stopWatching: (() => void) | null = null;
  let restoring: Promise<void> | null = null;

  function subject(token: string | null): string | null {
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).sub ?? null; }
    catch { return null; }
  }

  async function restore() {
    if (restoring) return restoring;
    sessionError.set('');
    sessionLoading.set(true);
    stopWatching?.();
    stopWatching = null;
    actions.suspendSession();
    restoredSubject = subject(auth.token);
    client.setAuth(auth.fetchAccessToken);
    restoring = (async () => {
      const profile = await client.mutation(api.session.current, {});
      await actions.signIn(profile.name, get(state).invitedRoomCode || undefined);
      stopWatching = client.onUpdate(api.session.status, {}, account => {
        if (account === false) actions.cloudSessionExpired();
      });
    })();
    try { await restoring; }
    catch (error) {
      restoredSubject = null;
      sessionError.set('Your saved session could not be opened. Retry, or sign in again.');
      throw error;
    }
    finally { restoring = null; sessionLoading.set(false); }
  }

  registerSession({
    restore,
    async signIn(credential) {
      if (signingOut) await signingOut;
      const result = await auth.signIn('google-gis', { credential });
      if (!result.signingIn) throw new Error('Google sign-in could not be verified. Please try again.');
      await restore();
    },
    async signOut() {
      if (signingOut) return signingOut;
      stopWatching?.(); stopWatching = null;
      signingOut = auth.signOut();
      try { await signingOut; restoredSubject = null; }
      finally { signingOut = null; }
    },
  });

  $effect(() => {
    const loading = auth.isLoading;
    const currentSubject = subject(auth.token);
    if (loading) { sessionLoading.set(true); return; }
    if (!currentSubject) {
      sessionLoading.set(false);
      if (restoredSubject) {
        restoredSubject = null;
        actions.cloudSessionExpired();
      }
      return;
    }
    if (currentSubject !== restoredSubject) {
      void restore().catch(() => { /* The sign-in view offers session retry. */ });
    }
  });
}
