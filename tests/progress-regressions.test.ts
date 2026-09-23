import { describe, expect, it } from 'vitest';
import { parseProgress, serializeProgress } from '../src/lib/progress';
import { calendarDayIndex } from '../src/lib/dates';
import { actions, state } from '../src/lib/store';
import { get } from 'svelte/store';

const progress = {
  done: {}, dayHours: {}, dayNotes: {}, weekNotes: {}, ms: {}, counters: {},
  start: '2026-09-22', cw: 1, cd: 1, paceFlex: false, kitChecked: {},
};

describe('progress boundary regressions', () => {
  it('round-trips every accepted hours entry and long student notes', () => {
    state.update(s => ({ ...s, ...parseProgress(progress) }));
    actions.setDayNote(1, 1, 'keep my work');
    for (const hours of ['1.', ' ', '1.5', '0.0000001', '1e-7']) {
      actions.setDayHours(1, 1, hours);
      expect(() => parseProgress(serializeProgress(get(state)))).not.toThrow();
    }
    actions.setDayNote(1, 1, 'n'.repeat(10001));
    actions.setWeekNote(1, 'r'.repeat(10001));
    expect(() => parseProgress(serializeProgress(get(state)))).not.toThrow();
  });

  it('resets play-day timers to the selected curriculum', () => {
    state.update(s => ({ ...s, ...parseProgress(progress) }));
    actions.selectTimerPart(2, 30);
    actions.jumpToDay(1, 7);
    expect(get(state).timerMode).toBe('stopwatch');
    expect(get(state).timerTargetSeconds).toBe(0);
    expect(get(state).timerPartIndex).toBe(0);
  });

  it('rejects unrelated or empty JSON instead of importing an empty course', () => {
    expect(() => parseProgress({})).toThrow();
    expect(() => parseProgress({ hello: 'world' })).toThrow();
  });

  it('preserves a cleared hours field in an otherwise valid backup', () => {
    expect(parseProgress({ ...progress, dayHours: { w1d1: '' } }).dayHours.w1d1).toBe('');
  });

  it('rejects checklist parts that do not exist in the syllabus', () => {
    expect(() => parseProgress({ ...progress, done: { w1d1p999: true } })).toThrow();
  });

  it('counts calendar dates rather than 24-hour intervals across daylight saving', () => {
    const previous = process.env.TZ;
    process.env.TZ = 'America/New_York';
    try {
      expect(calendarDayIndex('2026-03-08', new Date(2026, 2, 9))).toBe(1);
    } finally {
      process.env.TZ = previous;
    }
  });
});
