import type { Day, Week } from './curriculum';

export interface SessionNotesParams {
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

/** Format one session as portable Markdown for clipboard or download. */
export function formatSessionNotes(params: SessionNotesParams): string {
  const {
    week,
    day,
    weekNum,
    dayNum,
    dateStr,
    completedParts,
    hoursLogged,
    note,
    totalCoursePct,
    streak
  } = params;

  const partsMarkdown = day.parts
    .map((part, index) => {
      const check = completedParts[index] ? 'x' : ' ';
      const duration = part.m > 0 ? ` (${part.m}m)` : '';
      return `- [${check}] **Part ${part.k} · ${part.t}${duration}:** ${part.p}: ${part.d}`;
    })
    .join('\n');

  const lines = [
    `# ${dateStr} · Week ${weekNum} Day ${dayNum}: ${day.t}`,
    '',
    `Course: Drawing from Imagination in 8 Weeks by brokendraw`,
    `Week theme: ${week.title}`,
    '',
    partsMarkdown,
    ''
  ];

  if (hoursLogged) lines.push(`- **Time Logged:** ${hoursLogged} hrs`);
  if (note) lines.push(`- **Daily Reflection:** ${note}`);
  lines.push(`- **Progress:** Day ${(weekNum - 1) * 7 + dayNum}/56 (${totalCoursePct}% complete) · Streak: ${streak} days`);
  return `${lines.join('\n')}\n`;
}
