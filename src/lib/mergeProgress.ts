import type { Progress, TimerProgress } from './progress';

export type ProgressWithTimer = Progress;

export interface ProgressConflict {
  path: string;
  local: unknown;
  remote: unknown;
}

export interface ProgressMergeResult {
  progress: ProgressWithTimer;
  conflicts: ProgressConflict[];
}

const mapFields = ['done', 'dayNotes', 'weekNotes', 'ms', 'counters', 'kitChecked'] as const;
type MapField = (typeof mapFields)[number];

const scalarFields = ['start', 'paceFlex', 'theme', 'onboarded'] as const;
type ScalarField = (typeof scalarFields)[number];

type Session = Pick<Progress, 'cw' | 'cd' | 'dayHours'> & { timer?: TimerProgress };

function same(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) return false;
  const aRecord = a as Record<string, unknown>;
  const bRecord = b as Record<string, unknown>;
  const keys = Object.keys(aRecord);
  return keys.length === Object.keys(bRecord).length && keys.every(key => Object.hasOwn(bRecord, key) && same(aRecord[key], bRecord[key]));
}

function sessionOf(progress: Progress): Session {
  return {
    cw: progress.cw,
    cd: progress.cd,
    dayHours: progress.dayHours,
    ...(Object.hasOwn(progress, 'timer') ? { timer: progress.timer } : {})
  };
}

export function conflictValue(progress: Progress, path: string): unknown {
  if (path === 'session') return sessionOf(progress);
  const [field, ...parts] = path.split('.');
  const value = (progress as unknown as Record<string, unknown>)[field];
  return parts.length && value && typeof value === 'object'
    ? (value as Record<string, unknown>)[parts.join('.')]
    : value;
}

function applySession(target: Progress, session: Session): void {
  target.cw = session.cw;
  target.cd = session.cd;
  target.dayHours = { ...session.dayHours };
  if (Object.hasOwn(session, 'timer')) target.timer = session.timer ? { ...session.timer } : undefined;
  else delete target.timer;
}

/**
 * Merge independent map entries and scalar fields. The cursor, timer snapshot,
 * and all credited day hours are one atomic session value. A local checkpoint
 * therefore cannot be combined with remote hours credited from the same timer.
 */
export function mergeProgress(
  base: Progress,
  local: Progress,
  remote: Progress
): ProgressMergeResult {
  const progress: Progress = structuredClone(local);
  const conflicts: ProgressConflict[] = [];

  const baseSession = sessionOf(base);
  const localSession = sessionOf(local);
  const remoteSession = sessionOf(remote);
  if (same(localSession, baseSession)) applySession(progress, remoteSession);
  else if (same(remoteSession, baseSession) || same(localSession, remoteSession)) applySession(progress, localSession);
  else conflicts.push({ path: 'session', local: localSession, remote: remoteSession });

  for (const field of scalarFields) {
    const b = base[field];
    const l = local[field];
    const r = remote[field];
    if (same(l, b)) (progress as unknown as Record<string, unknown>)[field] = r;
    else if (!same(r, b) && !same(l, r)) conflicts.push({ path: field, local: l, remote: r });
  }

  for (const field of mapFields) {
    const bMap = base[field] as Record<string, unknown>;
    const lMap = local[field] as Record<string, unknown>;
    const rMap = remote[field] as Record<string, unknown>;
    const result = { ...lMap };
    const keys = new Set([...Object.keys(bMap), ...Object.keys(lMap), ...Object.keys(rMap)]);
    for (const key of keys) {
      const hadBase = Object.hasOwn(bMap, key);
      const hasLocal = Object.hasOwn(lMap, key);
      const hasRemote = Object.hasOwn(rMap, key);
      const b = hadBase ? bMap[key] : undefined;
      const l = hasLocal ? lMap[key] : undefined;
      const r = hasRemote ? rMap[key] : undefined;
      const localChanged = hasLocal !== hadBase || !same(l, b);
      const remoteChanged = hasRemote !== hadBase || !same(r, b);
      if (!localChanged && remoteChanged) {
        if (hasRemote) result[key] = r;
        else delete result[key];
      } else if (localChanged && remoteChanged && (hasLocal !== hasRemote || !same(l, r))) {
        conflicts.push({ path: `${field}.${key}`, local: hasLocal ? l : undefined, remote: hasRemote ? r : undefined });
      }
    }
    (progress as unknown as Record<string, unknown>)[field] = result;
  }

  return { progress, conflicts };
}

export function resolveProgressConflict(
  progress: Progress,
  conflict: ProgressConflict,
  choice: 'local' | 'remote'
): Progress {
  const resolved = structuredClone(progress);
  const value = conflict[choice];
  if (conflict.path === 'session') {
    applySession(resolved, value as Session);
    return resolved;
  }
  const [field, ...keyParts] = conflict.path.split('.');
  const key = keyParts.join('.');
  if (!field) throw new Error(`Invalid progress conflict path "${conflict.path}"`);
  if ((mapFields as readonly string[]).includes(field)) {
    if (!key || ['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error(`Invalid progress conflict path "${conflict.path}"`);
    const map = { ...(resolved as unknown as Record<string, Record<string, unknown>>)[field] };
    if (value === undefined) delete map[key];
    else map[key] = value;
    (resolved as unknown as Record<string, unknown>)[field] = map;
    return resolved;
  }
  if ((scalarFields as readonly string[]).includes(field)) {
    if (keyParts.length) throw new Error(`Invalid progress conflict path "${conflict.path}"`);
    (resolved as unknown as Record<string, unknown>)[field] = value;
    return resolved;
  }
  throw new Error(`Invalid progress conflict path "${conflict.path}"`);
}
