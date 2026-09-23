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
const member = (progress = blank, version = 0, id = 'student') => ({ member: {
  _id: id, name: 'Student', roomCode: 'STUDIO', week: progress.cw, day: progress.cd,
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
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

async function signIn(progress = blank, version = 1) {
  client.mutation.mockResolvedValueOnce(member(progress, version));
  await store.actions.signIn('Student');
}

describe('cloud progress conflict recovery', () => {
  it('merges independent notes and retries with the merged snapshot', async () => {
    const base = { ...blank, dayNotes: { w1d1: 'unchanged' } };
    const remote = { ...base, dayNotes: { w1d1: 'unchanged', w1d2: 'remote note' } };
    await signIn(base, 4);
    store.actions.setDayNote(1, 1, 'local note');
    client.mutation.mockRejectedValueOnce(conflict(remote, 5));
    client.mutation.mockResolvedValueOnce(6);

    expect(await store.actions.syncToCloud()).toBe(true);

    expect(client.mutation).toHaveBeenCalledTimes(3);
    const firstWrite = client.mutation.mock.calls[1][1];
    const retry = client.mutation.mock.calls[2][1];
    expect(firstWrite.expectedVersion).toBe(4);
    expect(retry.expectedVersion).toBe(5);
    expect(JSON.parse(retry.doneJson).dayNotes).toEqual({ w1d1: 'local note', w1d2: 'remote note' });
    expect(get(store.progressConflicts)).toEqual([]);
    expect(get(store.savePending)).toBe(false);
  });

  it('exposes same-field choices and saves the selected remote value', async () => {
    const base = { ...blank, dayNotes: { w1d1: 'base' } };
    const remote = { ...blank, dayNotes: { w1d1: 'remote edit' } };
    await signIn(base, 7);
    store.actions.setDayNote(1, 1, 'local edit');
    store.actions.setDayNote(1, 2, 'independent local note');
    client.mutation.mockRejectedValueOnce(conflict(remote, 8));

    expect(await store.actions.syncToCloud()).toBe(false);
    expect(get(store.progressConflicts)).toEqual([{
      path: 'dayNotes.w1d1', local: 'local edit', remote: 'remote edit',
    }]);
    expect(get(store.savePending)).toBe(true);

    client.mutation.mockResolvedValueOnce(9);
    await store.actions.resolveConflict('dayNotes.w1d1', 'remote');

    expect(get(store.progressConflicts)).toEqual([]);
    expect(get(store.state).dayNotes.w1d1).toBe('remote edit');
    expect(client.mutation).toHaveBeenCalledTimes(3);
    expect(client.mutation.mock.calls[2][1].expectedVersion).toBe(8);
    expect(JSON.parse(client.mutation.mock.calls[2][1].doneJson).dayNotes).toEqual({
      w1d1: 'remote edit', w1d2: 'independent local note',
    });
  });

  it('keeps the second conflict after an automatic merge and a local resolution', async () => {
    const base = { ...blank, dayNotes: { w1d1: 'base', w1d2: 'base2' } };
    const remoteFirst = { ...base, dayNotes: { w1d1: 'remote first', w1d2: 'remote independent' } };
    const remoteSecond = { ...remoteFirst, dayNotes: { ...remoteFirst.dayNotes, w1d1: 'remote second' } };
    await signIn(base, 10);
    store.actions.setDayNote(1, 1, 'local edit');
    store.actions.setDayNote(1, 3, 'local independent');
    client.mutation.mockRejectedValueOnce(conflict(remoteFirst, 11));

    expect(await store.actions.syncToCloud()).toBe(false);
    expect(get(store.progressConflicts)).toMatchObject([{ path: 'dayNotes.w1d1', local: 'local edit', remote: 'remote first' }]);

    client.mutation.mockRejectedValueOnce(conflict(remoteSecond, 12));
    await store.actions.resolveConflict('dayNotes.w1d1', 'local');

    expect(client.mutation).toHaveBeenCalledTimes(3);
    expect(client.mutation.mock.calls[2][1].expectedVersion).toBe(11);
    expect(get(store.progressConflicts)).toMatchObject([{ path: 'dayNotes.w1d1', local: 'local edit', remote: 'remote second' }]);
    expect(get(store.state).dayNotes).toMatchObject({
      w1d1: 'local edit', w1d2: 'remote independent', w1d3: 'local independent',
    });

    client.mutation.mockResolvedValueOnce(13);
    await store.actions.resolveConflict('dayNotes.w1d1', 'remote');
    expect(get(store.progressConflicts)).toEqual([]);
    expect(get(store.state).dayNotes.w1d1).toBe('remote second');
    expect(client.mutation).toHaveBeenCalledTimes(4);
    expect(client.mutation.mock.calls[3][1].expectedVersion).toBe(12);
    expect(JSON.parse(client.mutation.mock.calls[3][1].doneJson).dayNotes).toEqual({
      w1d1: 'remote second', w1d2: 'remote independent', w1d3: 'local independent',
    });
  });

  it('preserves pending edits across reauthentication against a newer revision', async () => {
    const base = { ...blank, dayNotes: { w1d1: 'base' } };
    const remote = { ...base, dayNotes: { w1d1: 'base', w1d2: 'other device' } };
    await signIn(base, 2);
    store.actions.setDayNote(1, 1, 'unsaved local edit');
    store.actions.cloudSessionExpired();
    client.mutation.mockResolvedValueOnce(member(remote, 3));
    client.mutation.mockResolvedValueOnce(4);

    await store.actions.signIn('Student');

    expect(get(store.state).isSignedIn).toBe(true);
    expect(get(store.state).dayNotes).toEqual({ w1d1: 'unsaved local edit', w1d2: 'other device' });
    expect(get(store.savePending)).toBe(false);
    expect(client.mutation).toHaveBeenCalledTimes(3);
    expect(client.mutation.mock.calls[2][1].expectedVersion).toBe(3);
    expect(JSON.parse(client.mutation.mock.calls[2][1].doneJson).dayNotes).toEqual({ w1d1: 'unsaved local edit', w1d2: 'other device' });
  });

  it('keeps edits pending after a typed transient network failure and saves them on retry', async () => {
    await signIn(blank, 20);
    store.actions.setDayNote(1, 1, 'keep through retry');
    client.mutation.mockRejectedValueOnce(Object.assign(new Error('Temporary network failure'), {
      data: { code: 'NETWORK_ERROR', retryable: true },
    }));
    expect(await store.actions.syncToCloud()).toBe(false);
    expect(get(store.savePending)).toBe(true);
    expect(client.mutation).toHaveBeenCalledTimes(2);

    client.mutation.mockResolvedValueOnce(21);
    expect(await store.actions.syncToCloud()).toBe(true);

    expect(client.mutation).toHaveBeenCalledTimes(3);
    expect(client.mutation.mock.calls[2][1].expectedVersion).toBe(20);
    expect(JSON.parse(client.mutation.mock.calls[2][1].doneJson).dayNotes.w1d1).toBe('keep through retry');
    expect(get(store.savePending)).toBe(false);
  });
});
