import { describe, expect, it } from 'vitest';
import { practiceProgress } from '../src/lib/practiceProgress';
import { WEEKS } from '../src/lib/curriculum';

describe('practice XP', () => {
  it('counts existing saved work, ignores invalid keys, and does not compound repeated completion', () => {
    const done = { w1d1p0: true, w1d1p1: false, w99d1p0: true };
    expect(practiceProgress(done)).toMatchObject({ xp: 20, level: 1, sessions: 0 });
    done.w1d1p0 = true;
    expect(practiceProgress(done).xp).toBe(20);
    done.w1d1p0 = false;
    expect(practiceProgress(done).xp).toBe(0);
    done.w1d1p0 = true;
    expect(practiceProgress(done).xp).toBe(20);
  });
  it('advances levels at 200 XP and counts only fully completed sessions', () => {
    const keys = WEEKS.flatMap((w, wi) => w.days.flatMap((d, di) => d.parts.map((_, p) => `w${wi+1}d${di+1}p${p}`)));
    const done = Object.fromEntries(keys.slice(0, 10).map(k => [k, true]));
    expect(practiceProgress(done)).toMatchObject({ xp: 200, level: 2, withinLevel: 0, parts: 10 });
    expect(practiceProgress(done).sessions).toBeGreaterThan(0);
  });
});
