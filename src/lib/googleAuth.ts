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

export function getGoogleClientId(): string {
  // @ts-ignore
  return (import.meta.env?.VITE_GOOGLE_CLIENT_ID || '').trim();
}

export function isGoogleAuthAvailable(): boolean {
  return !!getGoogleClientId();
}

let scriptLoadPromise: Promise<void> | null = null;

export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  // @ts-ignore
  if (window.google?.accounts?.id) return Promise.resolve();

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
  onSuccess: (user: GoogleUserPayload) => void
): Promise<boolean> {
  const clientId = getGoogleClientId();
  if (!clientId) return false;

  try {
    await loadGoogleIdentityScript();
    // @ts-ignore
    const google = window.google;
    if (!google?.accounts?.id) return false;

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => {
        if (response.credential) {
          const user = parseJwtPayload(response.credential);
          if (user) onSuccess(user);
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

    return true;
  } catch (e) {
    console.warn('Google Sign-In button render error:', e);
    return false;
  }
}
