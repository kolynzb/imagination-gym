import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { readPendingDraft, removePendingDraft, savePendingDraft } from '../src/lib/pendingDraft';
import { parseProgress } from '../src/lib/progress';

const progress = parseProgress({
  done: { w1d1p0: true }, dayHours: {}, dayNotes: { w1d1: 'Keep this sketch' },
  weekNotes: {}, ms: {}, counters: {}, start: '2026-09-22', cw: 1, cd: 1,
  paceFlex: false, kitChecked: {}, theme: 'light', onboarded: true,
});
const draft = { progress, baseJson: JSON.stringify({ ...progress, done: {} }), version: 4 };

let items: Map<string, string>;
let storage: Storage;

beforeEach(() => {
  items = new Map();
  storage = {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => { items.set(key, value); },
    removeItem: (key: string) => { items.delete(key); },
    clear: () => { items.clear(); },
    key: (index: number) => [...items.keys()][index] ?? null,
    get length() { return items.size; },
  };
  vi.stubGlobal('sessionStorage', storage);
});

afterEach(() => vi.unstubAllGlobals());

describe('pending progress drafts', () => {
  test('round-trips validated progress, base, and version', () => {
    expect(savePendingDraft('member-a', draft)).toBe(true);
    expect(readPendingDraft('member-a')).toEqual(draft);
    expect([...items.values()][0]).not.toContain('credential');
    expect(removePendingDraft('member-a')).toBe(true);
    expect(readPendingDraft('member-a')).toBeNull();
  });

  test('keeps member drafts separate and handles empty ids', () => {
    expect(savePendingDraft('member-a', draft)).toBe(true);
    expect(readPendingDraft('member-b')).toBeNull();
    expect(savePendingDraft('member-b', { ...draft, version: 5 })).toBe(true);
    expect(removePendingDraft('member-a')).toBe(true);
    expect(readPendingDraft('member-b')?.version).toBe(5);
    expect(savePendingDraft('', draft)).toBe(false);
    expect(readPendingDraft('')).toBeNull();
    expect(removePendingDraft('')).toBe(false);
  });

  test('rejects malformed storage and invalid progress without throwing', () => {
    expect(savePendingDraft('member-a', { ...draft, progress: {} as typeof progress })).toBe(false);
    expect(savePendingDraft('member-a', { ...draft, baseJson: '{bad' })).toBe(false);
    expect(savePendingDraft('member-a', { ...draft, version: -1 })).toBe(false);
    items.set('imagination-gym:pending-progress:member-a', '{broken');
    expect(readPendingDraft('member-a')).toBeNull();
    items.set('imagination-gym:pending-progress:member-a', JSON.stringify({ ...draft, progress: {} }));
    expect(readPendingDraft('member-a')).toBeNull();
  });

  test('returns failure values when storage access is denied', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => { throw new Error('denied'); },
      setItem: () => { throw new Error('denied'); },
      removeItem: () => { throw new Error('denied'); },
    });
    expect(savePendingDraft('member-a', draft)).toBe(false);
    expect(readPendingDraft('member-a')).toBeNull();
    expect(removePendingDraft('member-a')).toBe(false);
  });
});
