import { writable, derived, get } from 'svelte/store';
import { WEEKS, type Week, type Day, type DayPart } from './curriculum';
import { playChime, playBlip } from './audio';
import { api, clearCloudAuth, convex } from './convex';
import { calendarDayIndex, formatLocalDate, getMondayOf as localMondayOf, shiftLocalDate, parseLocalDate } from './dates';
import { parseCloudProgress, serializeProgress } from './progress';

export interface AppState {
  view: 'today' | 'week' | 'roadmap' | 'exercises' | 'vault' | 'progress' | 'crew' | 'method';
  cw: number; // Current week 1..8
  cd: number; // Current day 1..7
  done: Record<string, boolean>; // e.g. "w1d1p0": true
  dayHours: Record<string, string>; // e.g. "w1d1": "1.5"
  dayNotes: Record<string, string>;
  weekNotes: Record<number, string>;
  ms: Record<string, boolean>; // Milestones e.g. "w1m0": true
  counters: Record<string, number>;
  start: string; // ISO YYYY-MM-DD
  theme: 'light' | 'dark';
  paceFlex: boolean;
  focus: boolean;
  activeExerciseDrawer: string | null; // e.g. "01"
  roomCode: string;
  userName: string;
  timerRunning: boolean;
  timerMode: 'countdown' | 'stopwatch';
  timerTargetSeconds: number; // e.g. 600 for 10 min
  timerRemaining: number;
  timerElapsed: number;
  timerStartedAt: number | null;
  timerPartIndex: number; // 0, 1, 2 for parts A, B, C
  onboarded: boolean;
  onboardingOpen: boolean;
  onboardingStep: 1 | 2 | 3;
  kitChecked: Record<string, boolean>;
  authModalOpen: boolean;
  isSignedIn: boolean;
  invitedRoomCode: string | null;
  inviteBannerDismissed: boolean;
  userEmail: string | null;
  userAvatar: string | null;
}

function sessionTimer(cw: number, cd: number) {
  const seconds = (WEEKS[cw - 1].days[cd - 1].parts[0]?.m || 0) * 60;
  const timerMode: AppState['timerMode'] = seconds > 0 ? 'countdown' : 'stopwatch';
  return { timerMode, timerPartIndex: 0, timerTargetSeconds: seconds, timerRemaining: seconds,
    timerRunning: false, timerElapsed: 0, timerStartedAt: null };
}

function getInitialState(): AppState {
  const invitedRoom = typeof window !== 'undefined'
    ? new URLSearchParams(window.location?.search || '').get('room')?.toUpperCase().trim() || null
    : null;
  return {
    view: 'today', cw: 1, cd: 1,
    done: {}, dayHours: {}, dayNotes: {}, weekNotes: {}, ms: {}, counters: {},
    start: formatLocalDate(new Date()), theme: 'light', paceFlex: false,
    focus: false, activeExerciseDrawer: null,
    roomCode: invitedRoom || 'GYM-CREW', userName: 'You',
    ...sessionTimer(1, 1),
    onboarded: false, onboardingOpen: false, onboardingStep: 1,
    kitChecked: {}, authModalOpen: true, isSignedIn: false,
    invitedRoomCode: invitedRoom, inviteBannerDismissed: false,
    userEmail: null, userAvatar: null,
  };
}

export function getMondayOf(d: Date): Date {
  return localMondayOf(d);
}

export const state = writable<AppState>(getInitialState());
export const cloudStatus = writable<{ status: 'idle' | 'syncing' | 'synced' | 'error'; message: string }>({ status: 'idle', message: '' });
export const savePending = writable(false);
let authAttempt = 0;
let cloudVersion = 0;
let activeMemberId: string | null = null;
let lastSavedJson = '';
let lastObservedJson = '';
let cloudSyncQueue = Promise.resolve(false);
let cloudSyncTimer: ReturnType<typeof setTimeout> | null = null;
let cloudRestoreComplete = false;

state.subscribe((s) => {
  if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', s.theme);
  if (!s.isSignedIn || !cloudRestoreComplete) return;
  const json = JSON.stringify(serializeProgress(s));
  savePending.set(json !== lastSavedJson);
  if (json === lastObservedJson) return;
  lastObservedJson = json;
  if (typeof window === 'undefined' || json === lastSavedJson) return;
  cloudStatus.set({ status: 'syncing', message: 'Saving...' });
  if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => { void actions.syncToCloud(); }, 300);
});

function settleTimer(s: AppState, now = Date.now()): AppState {
  if (!s.timerRunning || s.timerStartedAt === null) return s;
  const delta = Math.max(0, now - s.timerStartedAt) / 1000;
  const counted = s.timerMode === 'countdown' ? Math.min(delta, s.timerRemaining) : delta;
  const remaining = s.timerMode === 'countdown' ? Math.max(0, s.timerRemaining - counted) : 0;
  const finished = s.timerMode === 'countdown' && remaining === 0;
  if (finished) playChime(528, 3.5);
  return {
    ...s,
    timerElapsed: s.timerElapsed + counted,
    timerRemaining: remaining,
    timerRunning: !finished,
    timerStartedAt: finished ? null : now,
  };
}

function creditTimer(s: AppState): AppState {
  const settled = settleTimer(s);
  const key = `w${s.cw}d${s.cd}`;
  const hours = Number(settled.dayHours[key] || 0) + settled.timerElapsed / 3600;
  return {
    ...settled,
    dayHours: settled.timerElapsed > 0
      ? { ...settled.dayHours, [key]: Math.min(24, hours).toFixed(6) }
      : settled.dayHours,
    timerElapsed: 0,
    timerRunning: false,
    timerStartedAt: null,
    timerRemaining: settled.timerTargetSeconds,
  };
}

function navigateDay(s: AppState, cw: number, cd: number): AppState {
  if (cw === s.cw && cd === s.cd) return s;
  return { ...creditTimer(s), cw, cd, ...sessionTimer(cw, cd) };
}

// Timer ticker loop
let timerInterval: ReturnType<typeof setInterval> | null = null;

if (typeof window !== 'undefined') {
  timerInterval = setInterval(() => {
    if (get(state).timerRunning) state.update((s) => settleTimer(s));
  }, 1000);
}

// State Action Methods
export const actions = {
  setView(view: AppState['view']) {
    state.update((s) => ({ ...s, view, focus: false }));
  },

  setTheme(theme: 'light' | 'dark') {
    state.update((s) => ({ ...s, theme }));
  },

  setStartDate(start: string) {
    if (!start) return;
    parseLocalDate(start);
    state.update((s) => ({ ...s, start }));
  },

  setPaceFlex(paceFlex: boolean) {
    state.update((s) => ({ ...s, paceFlex }));
  },

  async setRoomCode(roomCode: string) {
    const s = get(state);
    if (!s.isSignedIn) return;
    state.update(current => creditTimer(current));
    if (get(savePending) && !await actions.syncToCloud()) return;
    if (get(savePending)) return;
    try { await actions.signIn(s.userName, roomCode); }
    catch { /* The cloud status explains the failure; keep the current room. */ }
  },

  async setUserName(userName: string) {
    const s = get(state);
    if (!s.isSignedIn || !convex || !userName.trim()) return;
    try {
      const result = await convex.mutation(api.crew.signInOrRegister, { roomCode: s.roomCode, name: userName.trim() });
      state.update((current) => ({ ...current, userName: result.member.name }));
    } catch {
      cloudStatus.set({ status: 'error', message: 'Your name could not be updated. Try again.' });
    }
  },

  openExerciseDrawer(exerciseNum: string) {
    state.update((s) => ({ ...s, activeExerciseDrawer: exerciseNum }));
  },

  closeExerciseDrawer() {
    state.update((s) => ({ ...s, activeExerciseDrawer: null }));
  },

  setFocus(focus: boolean) {
    state.update((s) => ({ ...s, focus }));
  },

  jumpToDay(cw: number, cd: number) {
    if (!Number.isFinite(cw) || !Number.isFinite(cd)) return;
    const week = Math.min(8, Math.max(1, Math.trunc(cw)));
    const day = Math.min(7, Math.max(1, Math.trunc(cd)));
    state.update((s) => ({ ...navigateDay(s, week, day), view: 'today' }));
  },

  stepDay(delta: number) {
    if (!Number.isFinite(delta)) return;
    state.update((s) => {
      const index = Math.min(55, Math.max(0, (s.cw - 1) * 7 + s.cd - 1 + Math.trunc(delta)));
      return navigateDay(s, Math.floor(index / 7) + 1, index % 7 + 1);
    });
  },

  togglePart(cw: number, cd: number, partIndex: number) {
    if (!WEEKS[cw - 1]?.days[cd - 1]?.parts[partIndex]) return;
    state.update((s) => {
      const key = `w${cw}d${cd}p${partIndex}`;
      const done = { ...s.done, [key]: !s.done[key] };
      return { ...s, done };
    });
  },

  setPartDone(cw: number, cd: number, partIndex: number, isDone: boolean) {
    if (!WEEKS[cw - 1]?.days[cd - 1]?.parts[partIndex]) return;
    state.update((s) => {
      const key = `w${cw}d${cd}p${partIndex}`;
      const done = { ...s.done, [key]: isDone };
      return { ...s, done };
    });
  },

  setAllDayParts(cw: number, cd: number, isDone: boolean) {
    state.update((s) => {
      const week = WEEKS[cw - 1];
      if (!week) return s;
      const day = week.days[cd - 1];
      if (!day) return s;

      const done = { ...s.done };
      day.parts.forEach((_, i) => {
        done[`w${cw}d${cd}p${i}`] = isDone;
      });

      const logged = isDone && cw === s.cw && cd === s.cd ? creditTimer(s) : s;
      return { ...logged, done };
    });
  },

  setDayHours(cw: number, cd: number, hours: string) {
    if (hours !== '' && (!Number.isFinite(Number(hours)) || Number(hours) < 0 || Number(hours) > 24)) return;
    hours = hours.trim() === '' ? '' : String(Number(hours));
    state.update((s) => {
      const dayHours = { ...s.dayHours, [`w${cw}d${cd}`]: hours };
      return { ...s, dayHours };
    });
  },

  setDayNote(cw: number, cd: number, note: string) {
    state.update((s) => {
      const dayNotes = { ...s.dayNotes, [`w${cw}d${cd}`]: note };
      return { ...s, dayNotes };
    });
  },

  setWeekNote(weekNum: number, note: string) {
    state.update((s) => {
      const weekNotes = { ...s.weekNotes, [weekNum]: note };
      return { ...s, weekNotes };
    });
  },

  toggleMilestone(key: string) {
    state.update((s) => {
      const ms = { ...s.ms, [key]: !s.ms[key] };
      return { ...s, ms };
    });
  },

  bumpCounter(key: string, delta: number) {
    state.update((s) => {
      const counters = {
        ...s.counters,
        [key]: Math.max(0, (s.counters[key] || 0) + delta)
      };
      return { ...s, counters };
    });
  },

  // Each interval has its own remaining time; elapsed time is unlogged session time.
  selectTimerPart(partIndex: number, minutes: number) {
    if (!Number.isInteger(partIndex) || partIndex < 0 || !Number.isFinite(minutes) || minutes < 0) return;
    state.update((s) => ({
      ...settleTimer(s),
      timerMode: minutes > 0 ? 'countdown' : 'stopwatch',
      timerPartIndex: partIndex,
      timerTargetSeconds: minutes * 60,
      timerRemaining: minutes * 60,
      timerRunning: false,
      timerStartedAt: null,
    }));
  },

  startStopwatch(partIndex: number) {
    actions.selectTimerPart(partIndex, 0);
  },

  toggleTimer() {
    state.update((s) => {
      const settled = settleTimer(s);
      const nextRun = !settled.timerRunning;
      playBlip(nextRun ? 660 : 440);
      return {
        ...settled,
        timerRemaining: nextRun && settled.timerMode === 'countdown' && settled.timerRemaining <= 0
          ? settled.timerTargetSeconds : settled.timerRemaining,
        timerRunning: nextRun,
        timerStartedAt: nextRun ? Date.now() : null,
      };
    });
  },

  resetTimer() {
    state.update((s) => ({
      ...s, timerRunning: false, timerElapsed: 0,
      timerRemaining: s.timerTargetSeconds, timerStartedAt: null,
    }));
  },

  logTimerElapsed(cw: number, cd: number) {
    state.update((s) => cw === s.cw && cd === s.cd ? creditTimer(s) : s);
  },

  // Schedule Shift (move start date by N missed days)
  shiftSchedule(daysToShift: number) {
    state.update((s) => {
      return { ...s, start: shiftLocalDate(s.start, daysToShift) };
    });
  },

  // Onboarding Actions
  openOnboarding() {
    state.update((s) => ({ ...s, onboardingOpen: true, onboardingStep: 1 }));
  },

  closeOnboarding() {
    state.update((s) => ({
      ...s,
      onboardingOpen: false,
      onboarded: true,
      view: 'today'
    }));
  },

  setOnboardingStep(step: 1 | 2 | 3) {
    state.update((s) => ({ ...s, onboardingStep: step }));
  },

  toggleKitItem(itemId: string) {
    state.update((s) => ({
      ...s,
      kitChecked: { ...s.kitChecked, [itemId]: !s.kitChecked[itemId] }
    }));
  },

  // Auth / Sign In Actions
  openAuthModal() {
    state.update((s) => ({ ...s, authModalOpen: true }));
  },

  closeAuthModal() {
    state.update((s) => ({ ...s, authModalOpen: false }));
  },

  async syncToCloud() {
    const s = get(state);
    const client = convex;
    if (!s.isSignedIn || !client || !cloudRestoreComplete) return false;
    const attempt = authAttempt;
    const stats = get(derivedStats);
    const payload = {
      roomCode: s.roomCode, week: s.cw, day: s.cd,
      hours: Number(stats.totalHoursNum), streak: stats.streak,
      doneJson: JSON.stringify(serializeProgress(s)),
    };
    cloudSyncQueue = cloudSyncQueue.then(async () => {
      if (attempt !== authAttempt || !cloudRestoreComplete) return false;
      if (payload.doneJson === lastSavedJson) return true;
      cloudStatus.set({ status: 'syncing', message: 'Saving...' });
      try {
        const version = await client.mutation(api.crew.syncProgress, { ...payload, expectedVersion: cloudVersion });
        if (attempt === authAttempt) {
          cloudVersion = version;
          lastSavedJson = payload.doneJson;
          savePending.set(JSON.stringify(serializeProgress(get(state))) !== lastSavedJson);
          cloudStatus.set({ status: 'synced', message: 'Saved' });
        }
        return true;
      } catch {
        if (attempt === authAttempt) cloudStatus.set({ status: 'error', message: 'Your changes have not saved. Keep this tab open and retry.' });
        return false;
      }
    });
    return cloudSyncQueue;
  },

  async copyInviteLink(roomCode?: string): Promise<string> {
    const s = get(state);
    const code = (roomCode || s.roomCode || 'GYM-CREW').toUpperCase().trim();
    let link = `https://imagination-gym.collinsbenda.com/?room=${encodeURIComponent(code)}`;
    if (typeof window !== 'undefined' && window.location) {
      link = `${window.location.origin}/?room=${encodeURIComponent(code)}`;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(link);
      } catch (err) {
        console.warn('Clipboard write failed:', err);
      }
    }
    return link;
  },

  dismissInviteBanner() {
    state.update((s) => ({ ...s, inviteBannerDismissed: true }));
  },

  acceptInvite(roomCode: string) {
    const cleanRoom = roomCode.toUpperCase().trim();
    const current = get(state);
    if (current.isSignedIn) {
      void actions.setRoomCode(cleanRoom);
      return;
    }
    state.update((s) => ({
      ...s,
      roomCode: cleanRoom,
      invitedRoomCode: null,
      inviteBannerDismissed: true,
      authModalOpen: !s.isSignedIn
    }));
  },

  async signIn(name: string, roomCode?: string) {
    if (!convex) throw new Error('Sign-in is unavailable. Please try again later.');
    const cleanName = name.trim();
    const cleanRoom = roomCode?.toUpperCase().trim();
    if (!cleanName || (cleanRoom !== undefined && !/^[A-Z0-9-]{3,48}$/.test(cleanRoom))) throw new Error('Invalid name or room code.');
    const attempt = ++authAttempt;
    cloudRestoreComplete = false;
    if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
    state.update((s) => ({ ...creditTimer(s), timerRunning: false, timerStartedAt: null, isSignedIn: false }));
    cloudStatus.set({ status: 'syncing', message: 'Opening your course...' });
    try {
      const result = await convex.mutation(api.crew.signInOrRegister, { name: cleanName, ...(cleanRoom ? { roomCode: cleanRoom } : {}) });
      if (attempt !== authAttempt) return;
      if (activeMemberId && activeMemberId !== result.member._id && get(savePending)) throw new Error('Sign back into your previous account to save your changes before switching accounts.');
      const pending = activeMemberId === result.member._id && get(savePending);
      if (pending && result.member.progressVersion !== cloudVersion) throw new Error('Your course changed on another device. Keep this tab open so your unsaved changes are not lost.');
      const initial = getInitialState();
      const restored = result.member.doneJson ? parseCloudProgress(JSON.parse(result.member.doneJson), {
        start: initial.start, cw: result.member.week, cd: result.member.day,
      }) : null;
      const progress = pending ? serializeProgress(get(state)) : restored || serializeProgress(initial);
      activeMemberId = result.member._id;
      cloudVersion = result.member.progressVersion;
      lastSavedJson = restored ? JSON.stringify(restored) : '';
      lastObservedJson = JSON.stringify(progress);
      state.update((s) => ({
        ...s, ...progress, userName: result.member.name, roomCode: result.member.roomCode,
        isSignedIn: true, authModalOpen: false,
        onboardingOpen: !progress.onboarded,
        invitedRoomCode: null, inviteBannerDismissed: true, userEmail: null,
        userAvatar: result.member.avatarUrl || null, ...sessionTimer(progress.cw, progress.cd),
      }));
      cloudRestoreComplete = true;
      savePending.set(lastObservedJson !== lastSavedJson);
      if (get(savePending)) {
        if (!await actions.syncToCloud()) throw new Error('Your course could not be saved. Please retry.');
      } else cloudStatus.set({ status: 'synced', message: 'Saved' });
    } catch (error) {
      if (attempt === authAttempt) {
        cloudRestoreComplete = false;
        clearCloudAuth();
        state.update((s) => ({ ...s, isSignedIn: false, authModalOpen: true }));
        cloudStatus.set({ status: 'error', message: error instanceof Error ? error.message : 'Sign-in failed. Please try again.' });
      }
      throw error;
    }
  },

  cloudSessionExpired() {
    if (!get(state).isSignedIn) return;
    authAttempt++;
    cloudRestoreComplete = false;
    if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
    state.update((s) => ({ ...creditTimer(s), timerRunning: false, timerStartedAt: null, isSignedIn: false, authModalOpen: true }));
    savePending.set(JSON.stringify(serializeProgress(get(state))) !== lastSavedJson);
    clearCloudAuth();
    cloudStatus.set({ status: 'error', message: 'Sign in again to continue.' });
  },

  async signOut() {
    if (get(state).isSignedIn) state.update(s => creditTimer(s));
    if (get(savePending) && !await actions.syncToCloud()) return false;
    if (get(savePending)) return false;
    authAttempt++;
    cloudRestoreComplete = false;
    if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
    activeMemberId = null;
    lastSavedJson = '';
    lastObservedJson = '';
    state.set(getInitialState());
    savePending.set(false);
    clearCloudAuth();
    cloudStatus.set({ status: 'idle', message: '' });
    return true;
  }
};

// Derived Stores for Computed Metrics
export const derivedStats = derived(state, ($s) => {
  const weeks = WEEKS;
  let doneDaysCount = 0;
  let totalHoursNum = 0;

  for (let n = 1; n <= 8; n++) {
    for (let d = 1; d <= 7; d++) {
      const week = weeks[n - 1];
      const day = week?.days[d - 1];
      if (day && day.parts.every((_, i) => $s.done[`w${n}d${d}p${i}`])) {
        doneDaysCount++;
      }
      const h = parseFloat($s.dayHours[`w${n}d${d}`] || '0');
      if (h) totalHoursNum += h;
    }
  }

  // Streak follows the selected curriculum day, so navigating days changes the anchor intentionally.
  let streak = 0;
  let currW = $s.cw;
  let currD = $s.cd;

  const currentDay = weeks[currW - 1]?.days[currD - 1];
  const currentDayDone = currentDay && currentDay.parts.length > 0 && currentDay.parts.every((_, i) => $s.done[`w${currW}d${currD}p${i}`]);

  // If today is not done yet, check if yesterday was done to preserve the active streak
  if (!currentDayDone) {
    currD--;
    if (currD < 1) {
      currW--;
      currD = 7;
    }
  }

  while (currW >= 1) {
    const day = weeks[currW - 1]?.days[currD - 1];
    const isDone = day && day.parts.length > 0 && day.parts.every((_, i) => $s.done[`w${currW}d${currD}p${i}`]);
    if (isDone) {
      streak++;
      currD--;
      if (currD < 1) {
        currW--;
        currD = 7;
      }
    } else {
      break;
    }
  }

  const coursePct = Math.round((doneDaysCount / 56) * 100);

  // Calendar calculations
  const liveDayIndex = calendarDayIndex($s.start);

  const boundedLiveIndex = Math.min(55, Math.max(0, liveDayIndex));
  const liveN = Math.floor(boundedLiveIndex / 7) + 1;
  const liveD = (boundedLiveIndex % 7) + 1;

  // Missed days
  const missed: Array<{ n: number; d: number }> = [];
  if (!$s.paceFlex && liveDayIndex > 0) {
    const limit = Math.min(liveDayIndex, 56);
    for (let k = 0; k < limit; k++) {
      const n = Math.floor(k / 7) + 1;
      const d = (k % 7) + 1;
      const day = weeks[n - 1]?.days[d - 1];
      const isDone = day && day.parts.every((_, i) => $s.done[`w${n}d${d}p${i}`]);
      if (!isDone) missed.push({ n, d });
    }
  }

  return {
    doneDaysCount,
    totalHoursNum: totalHoursNum.toFixed(1),
    streak,
    coursePct,
    liveDayIndex,
    liveN,
    liveD,
    missed
  };
});
