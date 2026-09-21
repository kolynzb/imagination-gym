import type { Day, Week } from './curriculum';

export interface DailyExportParams {
  week: Week;
  day: Day;
  weekNum: number;
  dayNum: number;
  dateStr: string;
  completedParts: boolean[];
  hoursLogged: string;
  note: string;
  totalCoursePct: number;
  streak: number;
}

/**
 * Formats a daily session into clean GitHub-Flavored / Obsidian Markdown
 * ready to paste into `01 Journal/` daily notes.
 */
export function formatObsidianDay(params: DailyExportParams): string {
  const { week, day, weekNum, dayNum, dateStr, completedParts, hoursLogged, note, totalCoursePct, streak } = params;

  const partsMarkdown = day.parts.map((part, i) => {
    const isDone = !!completedParts[i];
    const check = isDone ? 'x' : ' ';
    const duration = part.m > 0 ? ` (${part.m}m)` : '';
    return `- [${check}] **Part ${part.k} · ${part.t}${duration}:** ${part.p} — ${part.d}`;
  }).join('\n');

  return `### ${dateStr} — Week ${weekNum} Day ${dayNum}: ${day.t}
*Curriculum: [[02 Sources/Courses/Drawing from Imagination in 8 Weeks - brokendraw|Drawing from Imagination in 8 Weeks]]*

${partsMarkdown}

${hoursLogged ? `- **Time Logged:** ${hoursLogged} hrs` : ''}
${note ? `- **Blind Spot / Reflection:** ${note}` : ''}
- **Progress:** Day ${((weekNum - 1) * 7 + dayNum)}/56 (${totalCoursePct}% Course Complete) · Streak: ${streak} days
`;
}
