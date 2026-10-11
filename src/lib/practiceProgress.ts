import { WEEKS } from './curriculum';

export const PART_XP = 20;
export const LEVEL_XP = 200;
export function practiceProgress(done: Record<string, boolean>) {
  let parts = 0;
  let sessions = 0;
  WEEKS.forEach((week, w) => week.days.forEach((day, d) => {
    const completed = day.parts.filter((_, p) => done[`w${w + 1}d${d + 1}p${p}`]).length;
    parts += completed;
    if (completed === day.parts.length) sessions++;
  }));
  const xp = parts * PART_XP;
  return { xp, level: Math.floor(xp / LEVEL_XP) + 1, withinLevel: xp % LEVEL_XP, parts, sessions };
}
