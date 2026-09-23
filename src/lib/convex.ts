import { writable } from "svelte/store";
import { ConvexClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

declare global {
  interface ImportMetaEnv {
    readonly VITE_CONVEX_URL?: string;
    readonly VITE_CONVEX_SITE_URL?: string;
    readonly VITE_GOOGLE_CLIENT_ID?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const CONVEX_URL = (import.meta.env.VITE_CONVEX_URL || '').trim().replace(/\/+$/, '');
const CONVEX_SITE_URL = import.meta.env.VITE_CONVEX_SITE_URL || '';

export let convex: ConvexClient | null = null;

if (CONVEX_URL) {
  try {
    convex = new ConvexClient(CONVEX_URL);
  } catch (err) {
    console.warn('Convex client initialization skipped:', err);
  }
}

export function isConvexEnabled(): boolean {
  return !!convex;
}

export function getConvexSiteUrl(): string {
  if (CONVEX_SITE_URL) return CONVEX_SITE_URL.replace(/\/$/, '');
  try {
    const url = new URL(CONVEX_URL);
    if (url.hostname.endsWith('.convex.cloud')) {
      url.hostname = `${url.hostname.slice(0, -'.convex.cloud'.length)}.convex.site`;
      return url.toString().replace(/\/$/, '');
    }
  } catch {
    // Cloud upload remains disabled until a valid public Convex site URL is configured.
  }
  return '';
}

export { api };

export const sessionLoading = writable(false);
export const sessionError = writable('');
interface SessionActions {
  signIn(credential: string): Promise<void>;
  signOut(): Promise<void>;
  restore(): Promise<void>;
}
let sessionActions: SessionActions | null = null;
export function registerSession(actions: SessionActions): void { sessionActions = actions; }
export async function setGoogleCredential(credential: string): Promise<void> {
  if (!sessionActions) throw new Error('Sign-in is still loading. Please try again.');
  await sessionActions.signIn(credential);
}
export async function retrySession(): Promise<void> { await sessionActions?.restore(); }
export async function revokeCloudSession(): Promise<void> {
  await sessionActions?.signOut();
}
export function clearCloudAuth(): void {
  if (sessionActions) void sessionActions.signOut();
  else convex?.setAuth(async () => null);
}

export interface CrewMember {
  _id: string;
  name: string;
  week: number;
  day: number;
  hours: number;
  streak: number;
  lastActive?: number;
  locked?: boolean;
}

export interface CritPost {
  _id?: string;
  roomCode: string;
  authorName: string;
  week: number;
  day: number;
  imageUrl?: string | null;
  storageId?: string;
  prompt: string;
  createdAt: number;
}
