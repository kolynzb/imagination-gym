import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';

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
const timer = (overrides: Record<string, unknown> = {}) => ({
  timerMode: 'countdown', timerPartIndex: 0, timerTargetSeconds: 60, timerRemaining: 60,
  timerRunning: false, timerElapsed: 0, timerStartedAt: null, ...overrides,
});
const member = (progress = blank, version = 0) => ({ member: {
  _id: 'student', name: 'Student', roomCode: 'STUDIO', week: 1, day: 1,
  progressVersion: version, doneJson: JSON.stringify(progress),
} });
let store: typeof import('../src/lib/store');

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-23T10:00:00Z'));
  vi.stubGlobal('window', { location: { search: '', origin: 'http://localhost' } });
  vi.stubGlobal('document', { documentElement: { setAttribute: vi.fn() } });
  client.mutation.mockReset();
  store = await import('../src/lib/store');
});
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

async function signIn(progress = blank) {
  client.mutation.mockResolvedValueOnce(member(progress));
  await store.actions.signIn('Student');
}

describe('timer cloud recovery', () => {
  it('restores a paused timer without starting it', async () => {
    await signIn({ ...blank, timer: timer({ timerElapsed: 12, timerRemaining: 48 }) });

    expect(get(store.state)).toMatchObject({
      timerMode: 'countdown', timerPartIndex: 0, timerTargetSeconds: 60,
      timerRemaining: 48, timerElapsed: 12, timerRunning: false, timerStartedAt: null,
    });
  });

  it('credits elapsed wall time from a saved running countdown and pauses it', async () => {
    const startedAt = Date.now() - 4_000;
    await signIn({ ...blank, timer: timer({ timerRemaining: 20, timerRunning: true, timerStartedAt: startedAt }) });

    expect(get(store.state)).toMatchObject({ timerElapsed: 4, timerRemaining: 16, timerRunning: false, timerStartedAt: null });
    expect(client.mutation).toHaveBeenCalledTimes(2);
    const saved = JSON.parse(client.mutation.mock.calls[1][1].doneJson);
    expect(saved.timer).toMatchObject({ timerElapsed: 4, timerRemaining: 16, timerRunning: false, timerStartedAt: null });
  });

  it('caps restored countdown time at completion', async () => {
    const startedAt = Date.now() - 20_000;
    await signIn({ ...blank, timer: timer({ timerRemaining: 5, timerRunning: true, timerStartedAt: startedAt }) });

    expect(get(store.state)).toMatchObject({ timerElapsed: 5, timerRemaining: 0, timerRunning: false, timerStartedAt: null });
  });

  it('does not log a recovered session twice after another module reload', async () => {
    const stored = { ...blank, timer: timer({ timerElapsed: 30, timerRemaining: 30 }) };
    let remote = member(stored);
    client.mutation.mockImplementation(async (name: string, args?: { doneJson?: string }) => {
      if (name === 'signIn') return remote;
      remote = { member: { ...remote.member, progressVersion: remote.member.progressVersion + 1, doneJson: args!.doneJson! } };
      return remote.member.progressVersion;
    });

    await store.actions.signIn('Student');
    store.actions.logTimerElapsed(1, 1);
    await vi.advanceTimersByTimeAsync(300);
    const firstSaved = JSON.parse(remote.member.doneJson);
    expect(Number(firstSaved.dayHours.w1d1)).toBeCloseTo(30 / 3600, 5);
    expect(firstSaved.timer?.timerElapsed ?? 0).toBe(0);

    vi.resetModules();
    store = await import('../src/lib/store');
    await store.actions.signIn('Student');
    store.actions.logTimerElapsed(1, 1);
    await vi.advanceTimersByTimeAsync(300);
    const secondSaved = JSON.parse(remote.member.doneJson);
    expect(Number(secondSaved.dayHours.w1d1)).toBeCloseTo(30 / 3600, 5);
    expect(secondSaved.timer?.timerElapsed ?? 0).toBe(0);
  });

  it('keeps the persisted checkpoint stable while the running timer ticks', async () => {
    await signIn();
    store.actions.selectTimerPart(0, 0);
    store.actions.toggleTimer();
    await vi.advanceTimersByTimeAsync(300);
    const writesAfterStart = client.mutation.mock.calls.length;
    const checkpointAfterStart = JSON.parse(client.mutation.mock.calls.at(-1)![1].doneJson).timer;

    await vi.advanceTimersByTimeAsync(5_000);

    expect(client.mutation).toHaveBeenCalledTimes(writesAfterStart);
    expect(get(store.state).timerElapsed).toBe(5);
    expect(JSON.parse(client.mutation.mock.calls.at(-1)![1].doneJson).timer).toEqual(checkpointAfterStart);
  });

  it('rejects an invalid saved timer rather than accepting the cloud progress', async () => {
    await expect(signIn({ ...blank, timer: timer({ timerPartIndex: 99 }) })).rejects.toThrow('Invalid saved timer');
    expect(get(store.state).isSignedIn).toBe(false);
    expect(client.mutation).toHaveBeenCalledTimes(1);
  });
});
