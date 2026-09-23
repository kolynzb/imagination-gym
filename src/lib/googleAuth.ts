/**
 * Google Identity Services (GIS) OAuth helper
 * Works natively with standard Google Cloud Console OAuth 2.0 Web Client IDs.
 */

export interface GoogleUserPayload {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

export interface GoogleCredential {
  credential: string;
  profile: GoogleUserPayload;
}

interface GoogleIdentityApi {
  accounts?: {
    id?: {
      initialize: (options: { client_id: string; auto_select: boolean; callback: (response: { credential: string }) => void }) => void;
      renderButton: (container: HTMLElement, options: Record<string, string | number>) => void;
      prompt?: () => void;
      cancel?: () => void;
      disableAutoSelect?: () => void;
    };
  };
}

function googleIdentity(): GoogleIdentityApi | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { google?: GoogleIdentityApi }).google;
}

export function disableAutomaticGoogleSignIn(): void {
  googleIdentity()?.accounts?.id?.disableAutoSelect?.();
  cancelGoogleSignInPrompt();
}

export function cancelGoogleSignInPrompt(): void {
  googleIdentity()?.accounts?.id?.cancel?.();
}

export function getGoogleClientId(): string {
  return ((import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_GOOGLE_CLIENT_ID || '').trim();
}

export function isGoogleAuthAvailable(): boolean {
  return !!getGoogleClientId();
}

let scriptLoadPromise: Promise<void> | null = null;

export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (googleIdentity()?.accounts?.id) return Promise.resolve();

  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  return scriptLoadPromise;
}

export function parseJwtPayload(token: string): GoogleUserPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return {
      name: parsed.name || parsed.given_name || 'Artist',
      email: parsed.email || '',
      picture: parsed.picture || '',
      sub: parsed.sub || '',
    };
  } catch (err) {
    console.warn('Failed to parse Google JWT payload:', err);
    return null;
  }
}

export async function renderGoogleButton(
  container: HTMLElement,
  onSuccess: (result: GoogleCredential) => void
): Promise<boolean> {
  const clientId = getGoogleClientId();
  if (!clientId) return false;

  try {
    await loadGoogleIdentityScript();
    const google = googleIdentity();
    if (!google?.accounts?.id) return false;

    google.accounts.id.initialize({
      client_id: clientId,
      auto_select: true,
      callback: (response: { credential: string }) => {
        if (response.credential) {
          const user = parseJwtPayload(response.credential);
          if (user) onSuccess({ credential: response.credential, profile: user });
        }
      },
    });

    google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: container.clientWidth || 280,
    });

    // A blocked or unavailable One Tap prompt must not hide the manual button.
    try {
      google.accounts.id.prompt?.();
    } catch (error) {
      console.warn('Automatic Google sign-in is unavailable:', error);
    }
    return true;
  } catch (e) {
    console.warn('Google Sign-In button render error:', e);
    return false;
  }
}
