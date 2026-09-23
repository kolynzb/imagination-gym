import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { calendarDayIndex, formatLocalDate, sessionDate } from '../src/lib/dates';
import { parseProgress } from '../src/lib/progress';
import { actions, state } from '../src/lib/store';

const backup = {
  done: { w1d1p0: true },
  dayHours: { w1d1: '0.125' },
  dayNotes: { w1d1: 'first session' },
  weekNotes: { 1: 'steady' },
  ms: { w1m0: true },
  counters: { boxes: 3 },
  start: '2026-01-05',
  cw: 1,
  cd: 1,
  paceFlex: false,
  kitChecked: { pencil: true }, theme: 'light', onboarded: true
};

describe('dates and progress', () => {
  beforeEach(() => {
    actions.resetTimer();
    state.update(s => ({ ...s, ...parseProgress(backup), isSignedIn: false }));
  });
  afterEach(() => vi.useRealTimers());

  it('formats local EAT dates and clamps session boundaries', () => {
    expect(formatLocalDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
    expect(sessionDate('2026-01-05', 1, 1)).toBe('2026-01-05');
    expect(sessionDate('2026-01-05', 99, 99)).toBe('2026-03-01');
    expect(sessionDate('2026-01-05', 0, 0)).toBe('2026-01-05');
    expect(calendarDayIndex('2026-01-05', new Date(2026, 0, 6, 12))).toBe(1);
  });

  it('validates progress and leaves state unchanged on invalid import', () => {
    const before = get(state);
    expect(() => parseProgress({ ...backup, dayHours: { w1d1: '25' } })).toThrow(/dayHours/);
    expect(get(state).dayHours).toEqual(before.dayHours);
    expect(() => parseProgress({ ...backup, done: { nope: true } })).toThrow(/done/);
  });

  it('does not accept authentication fields as saved progress', () => {
    const restored = parseProgress({ ...backup, isSignedIn: true, timerRunning: true });
    expect(restored).not.toHaveProperty('isSignedIn');
    expect(restored).not.toHaveProperty('timerRunning');
  });

  it('uses wall-clock elapsed time, keeps sub-hour precision, and logs once', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-05T10:00:00+03:00'));
    actions.resetTimer();
    actions.toggleTimer();
    vi.advanceTimersByTime(2500);
    actions.logTimerElapsed(1, 1);
    const first = get(state).dayHours.w1d1;
    actions.logTimerElapsed(1, 1);
    expect(Number(first) - Number(backup.dayHours.w1d1)).toBeGreaterThan(0.0005);
    expect(Number(first) - Number(backup.dayHours.w1d1)).toBeLessThan(0.002);
    expect(get(state).dayHours.w1d1).toBe(first);
    vi.useRealTimers();
  });

  it('gives every interval its full duration while preserving unlogged session time', () => {
    vi.useFakeTimers();
    actions.selectTimerPart(0, 10);
    actions.toggleTimer();
    vi.advanceTimersByTime(600_000);
    actions.selectTimerPart(1, 50);
    expect(get(state).timerElapsed).toBe(600);
    expect(get(state).timerRemaining).toBe(3000);
    actions.toggleTimer();
    vi.advanceTimersByTime(300_000);
    actions.setAllDayParts(1, 1, true);
    const hours = Number(get(state).dayHours.w1d1);
    expect(hours).toBeCloseTo(0.375, 5);
    actions.logTimerElapsed(1, 1);
    expect(Number(get(state).dayHours.w1d1)).toBe(hours);
  });

  it('logs elapsed time against the old day before navigation', () => {
    vi.useFakeTimers();
    actions.selectTimerPart(0, 10);
    actions.toggleTimer();
    vi.advanceTimersByTime(60_000);
    actions.jumpToDay(2, 1);
    expect(Number(get(state).dayHours.w1d1)).toBeCloseTo(0.125 + 1 / 60, 5);
    expect(get(state).dayHours.w2d1).toBeUndefined();
    expect(get(state).timerElapsed).toBe(0);
    actions.jumpToDay(1, 1);
    actions.stepDay(-1);
    expect([get(state).cw, get(state).cd]).toEqual([1, 1]);
    actions.jumpToDay(8, 7);
    actions.stepDay(1);
    expect([get(state).cw, get(state).cd]).toEqual([8, 7]);
  });

  it('supports untimed practice without an immediate countdown finish', () => {
    vi.useFakeTimers();
    actions.startStopwatch(0);
    actions.toggleTimer();
    vi.advanceTimersByTime(90_000);
    actions.toggleTimer();
    expect(get(state).timerMode).toBe('stopwatch');
    expect(get(state).timerElapsed).toBe(90);
    expect(get(state).timerRunning).toBe(false);
  });

  it('keeps preset changes from discarding elapsed time and resets finished countdowns', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-05T10:00:00+03:00'));
    actions.resetTimer();
    actions.toggleTimer();
    vi.advanceTimersByTime(1500);
    actions.selectTimerPart(1, 1);
    expect(get(state).timerElapsed).toBeGreaterThan(1);
    actions.resetTimer();
    actions.toggleTimer();
    vi.advanceTimersByTime(60_000);
    actions.selectTimerPart(1, 1);
    actions.toggleTimer();
    expect(get(state).timerElapsed).toBe(60);
    expect(get(state).timerRemaining).toBe(60);
    expect(get(state).timerRunning).toBe(true);
    actions.jumpToDay(8, 7);
    expect(get(state).timerRunning).toBe(false);
    expect(get(state).timerElapsed).toBe(0);
    expect(get(state).cw).toBe(8);
    expect(get(state).cd).toBe(7);
    vi.useRealTimers();
  });
});

describe('parseProgress', () => {
  it('accepts legacy AppState fields while selecting progress fields', () => {
    expect(parseProgress({ ...backup, view: 'today', roomCode: 'SECRET', isSignedIn: true })).toEqual(backup);
  });
});
