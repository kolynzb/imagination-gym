import { parseProgress, type Progress } from './progress';

const KEY_PREFIX = 'imagination-gym:pending-progress:';

export interface PendingDraft {
  progress: Progress;
  baseJson: string;
  version: number;
}

function keyFor(memberId: string): string | null {
  return memberId.trim() ? `${KEY_PREFIX}${encodeURIComponent(memberId)}` : null;
}

function parseDraft(value: unknown): PendingDraft | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const draft = value as Record<string, unknown>;
  if (typeof draft.baseJson !== 'string' ||
    !Number.isSafeInteger(draft.version) || (draft.version as number) < 0) return null;
  try {
    const progress = parseProgress(draft.progress);
    if (draft.baseJson) parseProgress(JSON.parse(draft.baseJson));
    return { progress, baseJson: draft.baseJson, version: draft.version as number };
  } catch {
    return null;
  }
}

export function savePendingDraft(memberId: string, draft: PendingDraft): boolean {
  const key = keyFor(memberId);
  if (!key) return false;
  const valid = parseDraft(draft);
  if (!valid) return false;
  try {
    sessionStorage.setItem(key, JSON.stringify(valid));
    return true;
  } catch {
    return false;
  }
}

export function readPendingDraft(memberId: string): PendingDraft | null {
  const key = keyFor(memberId);
  if (!key) return null;
  try {
    const raw = sessionStorage.getItem(key);
    return raw === null ? null : parseDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function removePendingDraft(memberId: string): boolean {
  const key = keyFor(memberId);
  if (!key) return false;
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
