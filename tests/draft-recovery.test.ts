import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { get } from 'svelte/store';
import { readPendingDraft } from '../src/lib/pendingDraft';

const client = vi.hoisted(() => ({ mutation: vi.fn() }));
vi.mock('../src/lib/convex', () => ({
  convex: client,
  api: { crew: { signInOrRegister: 'signIn', syncProgress: 'sync' } },
  clearCloudAuth: vi.fn(),
  revokeCloudSession: vi.fn(),
}));

const blank = {
  done: {}, dayHours: {}, dayNotes: {}, weekNotes: {}, ms: {}, counters: {},
  start: '2026-09-22', cw: 1, cd: 1, paceFlex: false, kitChecked: {}, theme: 'light', onboarded: true,
};
const member = (id: string, progress = blank, version = 1) => ({ member: {
  _id: id, name: 'Student', roomCode: 'STUDIO', week: progress.cw, day: progress.cd,
  progressVersion: version, doneJson: JSON.stringify(progress),
} });

let store: typeof import('../src/lib/store');
const items = new Map<string, string>();

async function reloadStore() {
  vi.resetModules();
  store = await import('../src/lib/store');
}

beforeEach(async () => {
  items.clear();
  client.mutation.mockReset();
  vi.useFakeTimers();
  vi.stubGlobal('window', {});
  vi.stubGlobal('document', { documentElement: { setAttribute: vi.fn() } });
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => { items.set(key, value); },
    removeItem: (key: string) => { items.delete(key); },
  });
  await reloadStore();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('pending draft recovery after reload', () => {
  test('restores an unsaved note only for the same server-verified member', async () => {
    client.mutation.mockResolvedValueOnce(member('alice'));
    await store.actions.signIn('Student');
    store.actions.setDayNote(1, 1, 'Keep this drawing note');
    expect(get(store.savePending)).toBe(true);
    expect(readPendingDraft('alice')?.progress.dayNotes.w1d1).toBe('Keep this drawing note');

    await reloadStore();
    expect(get(store.state).dayNotes).toEqual({});
    client.mutation.mockResolvedValueOnce(member('alice'));
    client.mutation.mockResolvedValueOnce(2);
    await store.actions.signIn('Student');

    expect(get(store.state).dayNotes.w1d1).toBe('Keep this drawing note');
    expect(client.mutation.mock.calls[2][1].expectedVersion).toBe(1);
    expect(JSON.parse(client.mutation.mock.calls[2][1].doneJson).dayNotes.w1d1).toBe('Keep this drawing note');
    expect(get(store.savePending)).toBe(false);
    expect(readPendingDraft('alice')).toBeNull();
  });

  test('does not expose one member’s draft when another member signs in', async () => {
    client.mutation.mockResolvedValueOnce(member('alice'));
    await store.actions.signIn('Student');
    store.actions.setDayNote(1, 1, 'Alice private note');
    expect(readPendingDraft('alice')).not.toBeNull();

    await reloadStore();
    client.mutation.mockResolvedValueOnce(member('bob'));
    await store.actions.signIn('Student');

    expect(get(store.state).dayNotes).toEqual({});
    expect(readPendingDraft('alice')?.progress.dayNotes.w1d1).toBe('Alice private note');
    expect(readPendingDraft('bob')).toBeNull();
    expect(client.mutation).toHaveBeenCalledTimes(2);
  });

  test('shows a conflict instead of overwriting a newer remote note', async () => {
    const base = { ...blank, dayNotes: { w1d1: 'base' } };
    const remote = { ...blank, dayNotes: { w1d1: 'remote' } };
    client.mutation.mockResolvedValueOnce(member('alice', base, 7));
    await store.actions.signIn('Student');
    store.actions.setDayNote(1, 1, 'local');
    expect(readPendingDraft('alice')?.version).toBe(7);

    await reloadStore();
    client.mutation.mockResolvedValueOnce(member('alice', remote, 8));
    await store.actions.signIn('Student');

    expect(get(store.progressConflicts).map(item => item.path)).toContain('dayNotes.w1d1');
    expect(get(store.cloudStatus).status).toBe('error');
    expect(client.mutation).toHaveBeenCalledTimes(2);
    expect(readPendingDraft('alice')?.progress.dayNotes.w1d1).toBe('local');
  });

  test('suspending a session cancels a queued save before it reaches the backend', async () => {
    client.mutation.mockResolvedValueOnce(member('alice'));
    await store.actions.signIn('Student');
    store.actions.setDayNote(1, 1, 'Unsaved before account change');
    expect(readPendingDraft('alice')?.progress.dayNotes.w1d1).toBe('Unsaved before account change');

    const queuedSave = store.actions.syncToCloud();
    store.actions.suspendSession();
    expect(await queuedSave).toBe(false);

    expect(client.mutation).toHaveBeenCalledTimes(1);
    expect(get(store.state).isSignedIn).toBe(false);
    expect(get(store.savePending)).toBe(true);
    expect(readPendingDraft('alice')?.progress.dayNotes.w1d1).toBe('Unsaved before account change');
  });
});
