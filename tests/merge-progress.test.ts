import { describe, expect, it } from 'vitest';
import { mergeProgress, resolveProgressConflict } from '../src/lib/mergeProgress';
import type { Progress } from '../src/lib/progress';

const base: Progress = {
  done: { w1d1p0: false }, dayHours: {}, dayNotes: {}, weekNotes: {}, ms: {}, counters: {},
  start: '2026-09-22', cw: 1, cd: 1, paceFlex: false, kitChecked: {}, theme: 'light', onboarded: true
};

describe('mergeProgress', () => {
  it('combines independent map entries and scalar edits', () => {
    const local = { ...base, done: { ...base.done, w1d1p0: true }, dayNotes: { w1d1: 'local note' } };
    const remote = { ...base, done: { ...base.done, w1d1p1: true }, theme: 'dark' as const };

    const merged = mergeProgress(base, local, remote);

    expect(merged.progress.done).toEqual({ w1d1p0: true, w1d1p1: true });
    expect(merged.progress.dayNotes).toEqual({ w1d1: 'local note' });
    expect(merged.progress.theme).toBe('dark');
    expect(merged.conflicts).toEqual([]);
  });

  it('keeps local values and reports divergent edits to the same field', () => {
    const local = { ...base, start: '2026-09-23', dayHours: { w1d1: '1' } };
    const remote = { ...base, start: '2026-09-24', dayHours: { w1d1: '2' } };

    const merged = mergeProgress(base, local, remote);

    expect(merged.progress.start).toBe('2026-09-23');
    expect(merged.progress.dayHours).toEqual({ w1d1: '1' });
    expect(merged.conflicts).toEqual(expect.arrayContaining([
      { path: 'start', local: '2026-09-23', remote: '2026-09-24' },
      { path: 'session', local: expect.objectContaining({ dayHours: { w1d1: '1' } }), remote: expect.objectContaining({ dayHours: { w1d1: '2' } }) }
    ]));
  });

  it('treats cursor and timer as one session and does not pair a timer with another day', () => {
    const baseWithTimer: ProgressWithTimer = {
      ...base,
      timer: { timerMode: 'stopwatch', timerPartIndex: 0, timerTargetSeconds: 0, timerRemaining: 0, timerRunning: false, timerElapsed: 0, timerStartedAt: null }
    };
    const local: Progress = { ...baseWithTimer, cw: 1, cd: 2, timer: { ...baseWithTimer.timer!, timerElapsed: 30 } };
    const remote: Progress = { ...baseWithTimer, cw: 1, cd: 3, timer: { ...baseWithTimer.timer!, timerElapsed: 60 } };

    const merged = mergeProgress(baseWithTimer, local, remote);
    const conflict = merged.conflicts.find(item => item.path === 'session');

    expect(merged.progress.cd).toBe(2);
    expect(merged.progress.timer?.timerElapsed).toBe(30);
    expect(conflict).toBeDefined();
    expect(resolveProgressConflict(merged.progress, conflict!, 'remote')).toMatchObject({ cd: 3, timer: { timerElapsed: 60 } });
  });

  it('merges a remote session change when local session is unchanged', () => {
    const baseWithTimer: Progress = {
      ...base,
      timer: { timerMode: 'countdown', timerPartIndex: 1, timerTargetSeconds: 600, timerRemaining: 420, timerRunning: true, timerElapsed: 180, timerStartedAt: 123 }
    };
    const remote: Progress = { ...baseWithTimer, cd: 2, timer: { ...baseWithTimer.timer!, timerRunning: false, timerStartedAt: null } };

    const merged = mergeProgress(baseWithTimer, baseWithTimer, remote);

    expect(merged.progress.cd).toBe(2);
    expect(merged.progress.timer).toEqual(remote.timer);
    expect(merged.conflicts).toEqual([]);
  });

  it('supports resolving a concurrent deletion and edit', () => {
    const withEntry = { ...base, dayNotes: { w1d1: 'starting note' } };
    const local = { ...withEntry, dayNotes: {} };
    const remote = { ...withEntry, dayNotes: { w1d1: 'edited note' } };

    const merged = mergeProgress(withEntry, local, remote);
    const conflict = merged.conflicts.find(item => item.path === 'dayNotes.w1d1')!;

    expect(merged.progress.dayNotes).toEqual({});
    expect(resolveProgressConflict(merged.progress, conflict, 'remote').dayNotes).toEqual({ w1d1: 'edited note' });
  });

  it('keeps an unlogged local timer checkpoint separate from remote credited hours', () => {
    const baseWithTimer: Progress = {
      ...base,
      timer: { timerMode: 'stopwatch', timerPartIndex: 0, timerTargetSeconds: 0, timerRemaining: 0, timerRunning: false, timerElapsed: 60, timerStartedAt: null }
    };
    const local: Progress = {
      ...baseWithTimer,
      cd: 2,
      timer: { ...baseWithTimer.timer!, timerElapsed: 90 }
    };
    const remote: Progress = {
      ...baseWithTimer,
      dayHours: { w1d1: '0.016666666666666666' },
      timer: { ...baseWithTimer.timer!, timerElapsed: 0 }
    };

    const merged = mergeProgress(baseWithTimer, local, remote);

    expect(merged.conflicts).toEqual([
      { path: 'session', local: expect.objectContaining({ cd: 2, dayHours: {}, timer: expect.objectContaining({ timerElapsed: 90 }) }), remote: expect.objectContaining({ cd: 1, dayHours: { w1d1: '0.016666666666666666' }, timer: expect.objectContaining({ timerElapsed: 0 }) }) }
    ]);
    expect(merged.progress.dayHours).toEqual({});
    expect(merged.progress.timer?.timerElapsed).toBe(90);
  });
});
