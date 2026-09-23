import { WEEKS } from './curriculum';
import { parseLocalDate } from './dates';

export interface Progress {
  done: Record<string, boolean>;
  dayHours: Record<string, string>;
  dayNotes: Record<string, string>;
  weekNotes: Record<number, string>;
  ms: Record<string, boolean>;
  counters: Record<string, number>;
  start: string;
  cw: number;
  cd: number;
  paceFlex: boolean;
  kitChecked: Record<string, boolean>;
  theme: 'light' | 'dark';
  onboarded: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function mapOf<T>(value: unknown, name: string, check: (item: unknown) => item is T, keyCheck?: (key: string) => boolean): Record<string, T> {
  if (!isRecord(value)) throw new Error(`${name} must be an object map`);
  const result: Record<string, T> = {};
  for (const [key, item] of Object.entries(value)) {
    if (!key || ['__proto__', 'constructor', 'prototype'].includes(key) || key.length > 200 || (keyCheck && !keyCheck(key)) || !check(item)) throw new Error(`Invalid ${name} entry "${key}"`);
    result[key] = item;
  }
  return result;
}

const booleanValue = (value: unknown): value is boolean => typeof value === 'boolean';
const noteValue = (value: unknown): value is string => typeof value === 'string';
const counterValue = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 1_000_000;
const hoursValue = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  if (value.trim() === '') return true;
  if (!/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())) return false;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 24;
};

function optional<T>(source: Record<string, unknown>, key: string, fallback: T, check: (value: unknown) => value is T): T {
  if (!(key in source)) return fallback;
  const value = source[key];
  if (!check(value)) throw new Error(`Invalid progress field "${key}"`);
  return value;
}

export function serializeProgress(state: Progress): Progress {
  return {
    done: { ...state.done },
    dayHours: { ...state.dayHours },
    dayNotes: { ...state.dayNotes },
    weekNotes: { ...state.weekNotes },
    ms: { ...state.ms },
    counters: { ...state.counters },
    start: state.start,
    cw: state.cw,
    cd: state.cd,
    paceFlex: state.paceFlex,
    kitChecked: { ...state.kitChecked },
    theme: state.theme,
    onboarded: state.onboarded
  };
}

export function parseProgress(data: unknown): Progress {
  if (!isRecord(data)) throw new Error('Progress must be an object');
  const source = data;
  for (const field of ['done', 'dayHours', 'dayNotes', 'start', 'cw', 'cd']) {
    if (!Object.hasOwn(source, field)) throw new Error(`Progress is missing ${field}`);
  }
  const mapField = (key: string): unknown => key in source ? source[key] : {};
  const done = mapOf(mapField('done'), 'done', booleanValue, (key) => {
    const match = /^w([1-8])d([1-7])p(\d+)$/.exec(key);
    return !!match && Number(match[3]) < WEEKS[Number(match[1]) - 1].days[Number(match[2]) - 1].parts.length;
  });
  const dayHours = mapOf(mapField('dayHours'), 'dayHours', hoursValue, (key) => /^w[1-8]d[1-7]$/.test(key));
  const dayNotes = mapOf(mapField('dayNotes'), 'dayNotes', noteValue, (key) => /^w[1-8]d[1-7]$/.test(key));
  const weekNotesRaw = mapOf(mapField('weekNotes'), 'weekNotes', noteValue);
  const weekNotes: Record<number, string> = {};
  for (const [key, value] of Object.entries(weekNotesRaw)) {
    const week = Number(key);
    if (!Number.isInteger(week) || week < 1 || week > 8) throw new Error(`Invalid week note key "${key}"`);
    weekNotes[week] = value;
  }
  const ms = mapOf(mapField('ms'), 'ms', booleanValue, (key) => /^w[1-8]m\d+$/.test(key));
  const counters = mapOf(mapField('counters'), 'counters', counterValue);
  const kitChecked = mapOf(mapField('kitChecked'), 'kitChecked', booleanValue);
  const start = optional(source, 'start', '1970-01-01', (value): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value));
  const cw = optional(source, 'cw', 1, (value): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 8);
  const cd = optional(source, 'cd', 1, (value): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 7);
  const paceFlex = optional(source, 'paceFlex', false, booleanValue);
  const theme = optional(source, 'theme', 'light', (value): value is 'light' | 'dark' => value === 'light' || value === 'dark');
  const onboarded = optional(source, 'onboarded', true, booleanValue);
  parseLocalDate(start);
  return { done, dayHours, dayNotes, weekNotes, ms, counters, start, cw, cd, paceFlex, kitChecked, theme, onboarded };
}

export function parseCloudProgress(data: unknown, defaults: Pick<Progress, 'start' | 'cw' | 'cd'>): Progress {
  if (!isRecord(data)) throw new Error('Cloud progress must be an object');
  return parseProgress({
    ...data,
    start: Object.hasOwn(data, 'start') ? data.start : defaults.start,
    cw: Object.hasOwn(data, 'cw') ? data.cw : defaults.cw,
    cd: Object.hasOwn(data, 'cd') ? data.cd : defaults.cd,
  });
}
