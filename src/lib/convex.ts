import { ConvexClient } from 'convex/browser';

const CONVEX_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_CONVEX_URL || '';

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

export interface CrewMember {
  _id?: string;
  id?: string;
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
  imageUrl?: string;
  storageId?: string;
  prompt: string;
  createdAt: number;
}
