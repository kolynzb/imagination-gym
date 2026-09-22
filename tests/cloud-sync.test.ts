import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';

const client = vi.hoisted(() => ({ mutation: vi.fn() }));
vi.mock('../src/lib/convex', () => ({
  convex: client,
  api: { crew: { signInOrRegister: 'signIn', syncProgress: 'sync' } },
  clearCloudAuth: vi.fn(),
  isConvexEnabled: () => true,
}));

import { actions, state, hasDeviceBackup } from '../src/lib/store';

const blank = {
  done: {}, dayHours: {}, dayNotes: {}, weekNotes: {}, ms: {}, counters: {},
  start: '2026-09-22', cw: 1, cd: 1, paceFlex: false, kitChecked: {},
};

beforeEach(() => {
  actions.importBackup(blank);
  client.mutation.mockReset();
});

describe('cloud restore and save ordering', () => {
  it('returns to local mode when Google authentication expires', async () => {
    client.mutation.mockResolvedValueOnce({ member: { week: 1, day: 1, progressVersion: 0, doneJson: JSON.stringify(blank) } });
    await actions.signIn('Student', 'STUDIO', true);
    actions.setDayNote(1, 1, 'Keep working');
    actions.cloudSessionExpired();
    expect(get(state).isSignedIn).toBe(false);
    expect(get(state).dayNotes.w1d1).toBe('Keep working');
    expect(await actions.syncToCloud()).toBe(false);
  });

  it('autosaves to cloud even when browser storage is full', async () => {
    vi.useFakeTimers();
    vi.resetModules();
    vi.stubGlobal('window', {});
    vi.stubGlobal('document', { documentElement: { setAttribute: vi.fn() } });
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => key === 'imaginationGym.v2' ? JSON.stringify(blank) : null,
      setItem: () => { throw new Error('QuotaExceededError'); },
    });
    try {
      const store = await import('../src/lib/store');
      client.mutation.mockResolvedValueOnce({ member: { week: 1, day: 1, progressVersion: 0, doneJson: JSON.stringify(blank) } });
      client.mutation.mockResolvedValueOnce(1);
      await store.actions.signIn('Student', 'STUDIO', true);
      store.actions.setDayNote(1, 1, 'Cloud must still save this');
      await vi.advanceTimersByTimeAsync(1600);
      expect(get(store.localSaveFailed)).toBe(true);
      expect(client.mutation).toHaveBeenCalledTimes(2);
      expect(JSON.parse(client.mutation.mock.calls[1][1].doneJson).dayNotes.w1d1).toBe('Cloud must still save this');
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
      vi.unstubAllGlobals();
    }
  });

  it('keeps device work recoverable when cloud progress replaces it', async () => {
    actions.setDayNote(1, 1, 'Device-only work');
    client.mutation.mockResolvedValueOnce({ member: {
      week: 1, day: 7, progressVersion: 3,
      doneJson: JSON.stringify({ ...blank, cd: 7, dayNotes: { w1d7: 'Cloud work' } }),
    } });
    await actions.signIn('Student', 'STUDIO', true);
    expect(get(state).dayNotes.w1d7).toBe('Cloud work');
    expect(get(state).timerMode).toBe('stopwatch');
    expect(get(hasDeviceBackup)).toBe(true);
    actions.restoreDeviceBackup();
    expect(get(state).dayNotes.w1d1).toBe('Device-only work');
    expect(get(state).isSignedIn).toBe(false);
  });

  it('serializes snapshots and uses the revision returned by each save', async () => {
    client.mutation.mockResolvedValueOnce({ member: { week: 1, day: 1, progressVersion: 3, doneJson: JSON.stringify(blank) } });
    await actions.signIn('Student', 'STUDIO', true);
    let finishFirst: (version: number) => void = () => { throw new Error('First save was not started'); };
    client.mutation.mockImplementationOnce(() => new Promise<number>(resolve => { finishFirst = resolve; }));
    client.mutation.mockResolvedValueOnce(5);
    actions.setDayNote(1, 1, 'First');
    const first = actions.syncToCloud();
    await Promise.resolve();
    actions.setDayNote(1, 1, 'Second');
    const second = actions.syncToCloud();
    await Promise.resolve();
    expect(client.mutation).toHaveBeenCalledTimes(2);
    finishFirst(4);
    expect(await first).toBe(true);
    expect(await second).toBe(true);
    expect(client.mutation.mock.calls[1][1].expectedVersion).toBe(3);
    expect(client.mutation.mock.calls[2][1].expectedVersion).toBe(4);
    expect(JSON.parse(client.mutation.mock.calls[2][1].doneJson).dayNotes.w1d1).toBe('Second');
  });

  it('restores legacy progress owned by a verified member using its saved course position', async () => {
    client.mutation.mockResolvedValueOnce({ member: { week: 2, day: 4, progressVersion: 0,
      doneJson: JSON.stringify({ done: {}, dayHours: {}, dayNotes: { w2d4: 'Legacy note' } }),
    } });
    await actions.signIn('Student', 'STUDIO', true);
    expect(get(state).cw).toBe(2);
    expect(get(state).cd).toBe(4);
    expect(get(state).dayNotes.w2d4).toBe('Legacy note');
  });

  it('leaves local work untouched when cloud data is invalid', async () => {
    actions.setDayNote(1, 1, 'Keep this');
    client.mutation.mockResolvedValueOnce({ member: { week: 1, day: 1, progressVersion: 0, doneJson: '{}' } });
    await expect(actions.signIn('Student', 'STUDIO', true)).rejects.toThrow();
    expect(get(state).dayNotes.w1d1).toBe('Keep this');
    expect(get(state).isSignedIn).toBe(false);
  });
});
