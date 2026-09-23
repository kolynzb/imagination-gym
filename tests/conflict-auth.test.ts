import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';

const client = vi.hoisted(() => ({ mutation: vi.fn() }));
vi.mock('../src/lib/convex', () => ({
  convex: client,
  api: { crew: { signInOrRegister: 'signIn', syncProgress: 'sync' } },
  clearCloudAuth: vi.fn(),
}));

const blank = {
  done: {}, dayHours: {}, dayNotes: {}, weekNotes: {}, ms: {}, counters: {},
  start: '2026-09-22', cw: 1, cd: 1, paceFlex: false, kitChecked: {}, theme: 'light', onboarded: true,
};
const member = (progress: typeof blank | (typeof blank & { dayNotes: Record<string, string> }), version: number) => ({ member: {
  _id: 'student', name: 'Student', roomCode: 'STUDIO', week: progress.cw, day: progress.cd,
  progressVersion: version, doneJson: JSON.stringify(progress),
} });
const conflict = (progress: unknown, version: number) => Object.assign(new Error('Progress changed on another device'), {
  data: { code: 'PROGRESS_CONFLICT', progressVersion: version, doneJson: JSON.stringify(progress) },
});
let store: typeof import('../src/lib/store');

beforeEach(async () => {
  vi.resetModules();
  client.mutation.mockReset();
  store = await import('../src/lib/store');
});
afterEach(() => { vi.clearAllTimers(); vi.unstubAllGlobals(); });

async function signIn(progress = blank, version = 1) {
  client.mutation.mockResolvedValueOnce(member(progress, version));
  await store.actions.signIn('Student');
}

describe('reauthentication during conflict resolution', () => {
  it('keeps the conflict dialog available after same-revision reauthentication', async () => {
    const base = { ...blank, dayNotes: { w1d1: 'base' } };
    const remote = { ...base, dayNotes: { w1d1: 'remote' } };
    await signIn(base, 7);
    store.actions.setDayNote(1, 1, 'local');
    client.mutation.mockRejectedValueOnce(conflict(remote, 8));
    expect(await store.actions.syncToCloud()).toBe(false);
    expect(get(store.progressConflicts)).toHaveLength(1);

    store.actions.cloudSessionExpired();
    client.mutation.mockResolvedValueOnce(member(remote, 8));
    await expect(store.actions.signIn('Student')).resolves.toBeUndefined();

    expect(get(store.state).isSignedIn).toBe(true);
    expect(get(store.progressConflicts)).toHaveLength(1);
  });

  it('preserves earlier choices and merges new remote notes after reauthentication', async () => {
    const base = { ...blank, dayNotes: { w1d1: 'base 1', w1d2: 'base 2' } };
    const remote = { ...base, dayNotes: { w1d1: 'remote 1', w1d2: 'remote 2' } };
    const latest = { ...remote, dayNotes: { ...remote.dayNotes, w1d3: 'remote independent' } };
    await signIn(base, 10);
    store.actions.setDayNote(1, 1, 'local 1');
    store.actions.setDayNote(1, 2, 'local 2');
    client.mutation.mockRejectedValueOnce(conflict(remote, 11));
    expect(await store.actions.syncToCloud()).toBe(false);
    expect(get(store.progressConflicts)).toHaveLength(2);

    await store.actions.resolveConflict('dayNotes.w1d1', 'remote');
    expect(get(store.progressConflicts)).toHaveLength(1);
    store.actions.cloudSessionExpired();
    client.mutation.mockResolvedValueOnce(member(latest, 12));
    await expect(store.actions.signIn('Student')).resolves.toBeUndefined();

    expect(get(store.state).isSignedIn).toBe(true);
    expect(store.actions.conflictDrafts().merged?.dayNotes).toEqual({ w1d1: 'remote 1', w1d2: 'local 2', w1d3: 'remote independent' });
    client.mutation.mockResolvedValueOnce(13);
    await store.actions.resolveConflict('dayNotes.w1d2', 'local');
    expect(get(store.state).dayNotes).toEqual({ w1d1: 'remote 1', w1d2: 'local 2', w1d3: 'remote independent' });
    expect(get(store.progressConflicts)).toHaveLength(0);
  });
});
