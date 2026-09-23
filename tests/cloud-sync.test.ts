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
let store: typeof import('../src/lib/store');

beforeEach(async () => {
  vi.resetModules();
  client.mutation.mockReset();
  store = await import('../src/lib/store');
});
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('Convex-only course state', () => {
  it('starts behind sign-in and restores only verified progress', async () => {
    expect(get(store.state).isSignedIn).toBe(false);
    expect(get(store.state).authModalOpen).toBe(true);
    client.mutation.mockResolvedValueOnce(member({ ...blank, cd: 7 }));
    await store.actions.signIn('Student');
    expect(client.mutation.mock.calls[0][1]).toEqual({ name: 'Student' });
    expect(get(store.state).roomCode).toBe('STUDIO');
    expect(get(store.state).isSignedIn).toBe(true);
    expect(get(store.state).timerMode).toBe('stopwatch');
    expect(get(store.state).onboardingOpen).toBe(false);
  });

  it('restores theme and onboarding from the account', async () => {
    client.mutation.mockResolvedValueOnce(member({ ...blank, theme: 'dark', onboarded: false }));
    await store.actions.signIn('Student');
    expect(get(store.state).theme).toBe('dark');
    expect(get(store.state).onboardingOpen).toBe(true);
    store.actions.closeOnboarding();
    client.mutation.mockResolvedValueOnce(1);
    await store.actions.syncToCloud();
    expect(JSON.parse(client.mutation.mock.calls[1][1].doneJson).onboarded).toBe(true);
  });

  it('saves elapsed practice before switching rooms', async () => {
    client.mutation.mockResolvedValueOnce(member());
    await store.actions.signIn('Student');
    store.state.update(s => ({ ...s, timerElapsed: 60 }));
    client.mutation.mockResolvedValueOnce(1);
    client.mutation.mockResolvedValueOnce(member(blank, 0, 'other-room-membership'));
    await store.actions.setRoomCode('OTHER-ROOM');
    expect(Number(JSON.parse(client.mutation.mock.calls[1][1].doneJson).dayHours.w1d1)).toBeCloseTo(1 / 60, 5);
  });

  it('does not offer a nickname-only fallback after failed authentication', async () => {
    client.mutation.mockRejectedValueOnce(new Error('Sign in with Google'));
    await expect(store.actions.signIn('Student')).rejects.toThrow('Sign in');
    expect(get(store.state).isSignedIn).toBe(false);
    expect(get(store.state).authModalOpen).toBe(true);
  });

  it('autosaves without reading or writing browser storage', async () => {
    vi.useFakeTimers();
    vi.resetModules();
    const storage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };
    vi.stubGlobal('window', {});
    vi.stubGlobal('document', { documentElement: { setAttribute: vi.fn() } });
    vi.stubGlobal('localStorage', storage);
    store = await import('../src/lib/store');
    client.mutation.mockResolvedValueOnce(member());
    client.mutation.mockResolvedValueOnce(1);
    await store.actions.signIn('Student');
    store.actions.setDayNote(1, 1, 'Save to my account');
    await vi.advanceTimersByTimeAsync(400);
    expect(JSON.parse(client.mutation.mock.calls[1][1].doneJson).dayNotes.w1d1).toBe('Save to my account');
    expect(get(store.savePending)).toBe(false);
    for (const method of Object.values(storage)) expect(method).not.toHaveBeenCalled();
  });

  it('serializes snapshots using each returned revision', async () => {
    client.mutation.mockResolvedValueOnce(member(blank, 3));
    await store.actions.signIn('Student');
    let finishFirst: (version: number) => void = () => { throw new Error('Save not started'); };
    client.mutation.mockImplementationOnce(() => new Promise<number>(resolve => { finishFirst = resolve; }));
    client.mutation.mockResolvedValueOnce(5);
    store.actions.setDayNote(1, 1, 'First');
    const first = store.actions.syncToCloud();
    await Promise.resolve();
    store.actions.setDayNote(1, 1, 'Second');
    const second = store.actions.syncToCloud();
    await Promise.resolve();
    expect(client.mutation).toHaveBeenCalledTimes(2);
    finishFirst(4);
    expect(await first).toBe(true);
    expect(await second).toBe(true);
    expect(client.mutation.mock.calls[1][1].expectedVersion).toBe(3);
    expect(client.mutation.mock.calls[2][1].expectedVersion).toBe(4);
    expect(JSON.parse(client.mutation.mock.calls[2][1].doneJson).dayNotes.w1d1).toBe('Second');
  });

  it('does not discard changes or sign out when saving fails', async () => {
    client.mutation.mockResolvedValueOnce(member());
    await store.actions.signIn('Student');
    store.actions.setDayNote(1, 1, 'Not saved yet');
    client.mutation.mockRejectedValueOnce(new Error('Offline'));
    expect(await store.actions.signOut()).toBe(false);
    expect(get(store.state).isSignedIn).toBe(true);
    expect(get(store.state).dayNotes.w1d1).toBe('Not saved yet');
    expect(get(store.savePending)).toBe(true);
    expect(get(store.cloudStatus).status).toBe('error');
  });

  it('flushes changes and clears account data on sign-out', async () => {
    client.mutation.mockResolvedValueOnce(member());
    await store.actions.signIn('Student');
    store.actions.setDayNote(1, 1, 'Saved before leaving');
    client.mutation.mockResolvedValueOnce(1);
    expect(await store.actions.signOut()).toBe(true);
    expect(JSON.parse(client.mutation.mock.calls[1][1].doneJson).dayNotes.w1d1).toBe('Saved before leaving');
    expect(get(store.state).dayNotes).toEqual({});
    expect(get(store.state).isSignedIn).toBe(false);
  });

  it('preserves pending edits across same-account reauthentication', async () => {
    client.mutation.mockResolvedValueOnce(member());
    await store.actions.signIn('Student');
    store.actions.setDayNote(1, 1, 'Keep working');
    store.actions.cloudSessionExpired();
    expect(get(store.state).isSignedIn).toBe(false);
    client.mutation.mockResolvedValueOnce(member());
    client.mutation.mockResolvedValueOnce(1);
    await store.actions.signIn('Student');
    expect(get(store.state).dayNotes.w1d1).toBe('Keep working');
    expect(get(store.savePending)).toBe(false);
  });

  it('does not upload one account’s pending notes to a different account', async () => {
    client.mutation.mockResolvedValueOnce(member());
    await store.actions.signIn('Student');
    store.actions.setDayNote(1, 1, 'Private');
    store.actions.cloudSessionExpired();
    client.mutation.mockResolvedValueOnce(member(blank, 0, 'other-student'));
    await expect(store.actions.signIn('Other Student')).rejects.toThrow('previous account');
    expect(get(store.state).dayNotes.w1d1).toBe('Private');
    expect(get(store.state).isSignedIn).toBe(false);
    expect(client.mutation).toHaveBeenCalledTimes(2);
  });

  it('does not replace cloud data when its saved payload is invalid', async () => {
    client.mutation.mockResolvedValueOnce({ member: { ...member().member, doneJson: '{}' } });
    await expect(store.actions.signIn('Student')).rejects.toThrow();
    expect(get(store.state).isSignedIn).toBe(false);
    expect(client.mutation).toHaveBeenCalledTimes(1);
  });
});
