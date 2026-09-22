import { describe, expect, it } from 'vitest';
import { WEEKS } from '../src/lib/curriculum';
import { formatSessionNotes } from '../src/lib/journal';

describe('formatSessionNotes', () => {
  it('formats a complete session as portable Markdown', () => {
    const markdown = formatSessionNotes({
      week: WEEKS[0],
      day: WEEKS[0].days[0],
      weekNum: 1,
      dayNum: 1,
      dateStr: '2026-09-22',
      completedParts: [true, false, true, true],
      hoursLogged: '1.5',
      note: 'The ellipse warm-up helped.',
      totalCoursePct: 4,
      streak: 2
    });

    expect(markdown).toContain('# 2026-09-22 · Week 1 Day 1:');
    expect(markdown).toContain('- [x] **Part A');
    expect(markdown).toContain('- [ ] **Part B');
    expect(markdown).toContain('Week theme: Measurements & Mechanics');
    expect(markdown).toContain('The ellipse warm-up helped.');
    expect(markdown).not.toContain('[[');
    expect(markdown).not.toContain('01 Journal');
  });

  it('omits empty optional fields', () => {
    const markdown = formatSessionNotes({
      week: WEEKS[0],
      day: WEEKS[0].days[6],
      weekNum: 1,
      dayNum: 7,
      dateStr: '2026-09-28',
      completedParts: [false],
      hoursLogged: '',
      note: '',
      totalCoursePct: 0,
      streak: 0
    });

    expect(markdown).not.toContain('Time Logged');
    expect(markdown).not.toContain('Daily Reflection');
  });
});
