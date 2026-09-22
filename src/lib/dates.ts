const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMondayOf(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  result.setHours(0, 0, 0, 0);
  return result;
}

export function parseLocalDate(value: string): Date {
  const match = DATE_RE.exec(value);
  if (!match) throw new Error(`Invalid date "${value}"; expected YYYY-MM-DD`);
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (formatLocalDate(date) !== value) throw new Error(`Invalid calendar date "${value}"`);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function sessionDate(start: string, week: number, day: number): string {
  const date = parseLocalDate(start);
  const safeWeek = Math.min(8, Math.max(1, Math.trunc(week)));
  const safeDay = Math.min(7, Math.max(1, Math.trunc(day)));
  date.setDate(date.getDate() + (safeWeek - 1) * 7 + safeDay - 1);
  return formatLocalDate(date);
}

export function shiftLocalDate(start: string, days: number): string {
  const date = parseLocalDate(start);
  date.setDate(date.getDate() + Math.trunc(days));
  return formatLocalDate(date);
}

export function calendarDayIndex(start: string, today = new Date()): number {
  const first = parseLocalDate(start);
  const firstUtc = Date.UTC(first.getFullYear(), first.getMonth(), first.getDate());
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((todayUtc - firstUtc) / DAY_MS);
}
