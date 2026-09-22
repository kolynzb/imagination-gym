import { writable, derived, get } from 'svelte/store';
import { WEEKS, type Week, type Day, type DayPart } from './curriculum';
import { playChime, playBlip } from './audio';
import { api, clearCloudAuth, convex, isConvexEnabled } from './convex';
import { calendarDayIndex, formatLocalDate, getMondayOf as localMondayOf, shiftLocalDate, parseLocalDate } from './dates';
import { parseProgress, parseCloudProgress, serializeProgress, type Progress } from './progress';

export const LS_KEY = 'imaginationGym.v2';

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
  localCrew: Array<{ id: string; name: string; week: number; day: number; hours: number; streak: number }>;
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

let localLoadFailed = false;

function getInitialState(): AppState {
  const defaultStart = formatLocalDate(new Date());
  let saved: Partial<AppState> | null = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LS_KEY) || localStorage.getItem('imaginationGym.v1');
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        const progress = parseProgress(parsed);
        saved = { ...progress };
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          const legacy = parsed as Record<string, unknown>;
          if (typeof legacy.roomCode === 'string') saved.roomCode = legacy.roomCode;
          if (typeof legacy.userName === 'string') saved.userName = legacy.userName;
          if (legacy.theme === 'light' || legacy.theme === 'dark') saved.theme = legacy.theme;
          if (typeof legacy.onboarded === 'boolean') saved.onboarded = legacy.onboarded;
          if (Array.isArray(legacy.localCrew)) {
            saved.localCrew = legacy.localCrew.filter((member: unknown): member is AppState['localCrew'][number] => {
              if (typeof member !== 'object' || member === null) return false;
              return 'id' in member && typeof member.id === 'string'
                && 'name' in member && typeof member.name === 'string'
                && 'week' in member && typeof member.week === 'number' && Number.isInteger(member.week) && member.week >= 1 && member.week <= 8
                && 'day' in member && typeof member.day === 'number' && Number.isInteger(member.day) && member.day >= 1 && member.day <= 7
                && 'hours' in member && typeof member.hours === 'number' && Number.isFinite(member.hours) && member.hours >= 0
                && 'streak' in member && typeof member.streak === 'number' && Number.isFinite(member.streak) && member.streak >= 0;
            });
          }
          if (typeof legacy.userEmail === 'string' || legacy.userEmail === null) saved.userEmail = legacy.userEmail;
          if (typeof legacy.userAvatar === 'string' || legacy.userAvatar === null) saved.userAvatar = legacy.userAvatar;
        }
      }
    } catch (e) {
      localLoadFailed = true;
      console.warn('Stored progress could not be read. Leaving it untouched:', e);
    }
  }

  // Parse invite / room parameter from URL: e.g. ?room=CREW-8MJE or ?invite=STUDIO-4K
  let urlRoom: string | null = null;
  if (typeof window !== 'undefined' && window.location?.search) {
    try {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('room') || params.get('invite');
      if (r && r.trim()) {
        urlRoom = r.trim().toUpperCase();
      }
    } catch (e) {
      console.warn('Failed to parse URL query params:', e);
    }
  }

  const activeRoom = urlRoom || saved?.roomCode || 'GYM-CREW';
  const isInvited = !!urlRoom && urlRoom !== saved?.roomCode;

  return {
    view: 'today',
    cw: saved?.cw || 1,
    cd: saved?.cd || 1,
    done: saved?.done || {},
    dayHours: saved?.dayHours || {},
    dayNotes: saved?.dayNotes || {},
    weekNotes: saved?.weekNotes || {},
    ms: saved?.ms || {},
    counters: saved?.counters || {
      boxes: 0,
      cyl: 0,
      sil: 0,
      sym: 0,
      refman: 0,
      imgman: 0,
      intman: 0,
      texbar: 0,
      blob: 0,
      highlight: 0
    },
    start: saved?.start || defaultStart,
    theme: saved?.theme || 'light',
    paceFlex: saved?.paceFlex ?? false,
    focus: false,
    activeExerciseDrawer: null,
    roomCode: activeRoom,
    userName: saved?.userName || 'You',
    localCrew: saved?.localCrew || [],
    ...sessionTimer(saved?.cw || 1, saved?.cd || 1),
    onboarded: saved?.onboarded ?? false,
    onboardingOpen: saved?.onboarded ? false : !isInvited,
    onboardingStep: 1,
    kitChecked: saved?.kitChecked || {},
    authModalOpen: isInvited && !saved?.isSignedIn,
    isSignedIn: false,
    invitedRoomCode: urlRoom,
    inviteBannerDismissed: false,
    userEmail: null,
    userAvatar: null
  };
}

export function getMondayOf(d: Date): Date {
  return localMondayOf(d);
}

export const state = writable<AppState>(getInitialState());
export const localSaveFailed = writable(false);
export const cloudStatus = writable<{ status: 'local' | 'syncing' | 'synced' | 'error'; message: string }>({ status: 'local', message: 'Saved on this device.' });
let authAttempt = 0;
let cloudVersion = 0;
let cloudSyncQueue = Promise.resolve(false);
const DEVICE_BACKUP_KEY = `${LS_KEY}.beforeCloudRestore`;
let deviceBackup: Progress | null = null;
try {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(DEVICE_BACKUP_KEY) : null;
  if (raw) deviceBackup = parseProgress(JSON.parse(raw));
} catch { /* An unreadable recovery file must not prevent local practice. */ }
export const hasDeviceBackup = writable(deviceBackup !== null);

let cloudSyncTimer: ReturnType<typeof setTimeout> | null = null;
let cloudRestoreComplete = false;
function triggerDebouncedCloudSync() {
  if (typeof window === 'undefined') return;
  if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => {
    if (cloudRestoreComplete) actions.syncToCloud().catch(() => {});
  }, 1500);
}

// Auto-persist to localStorage on state changes (memoized to avoid write churn during timer ticks)
if (typeof window !== 'undefined') {
  let lastPersistedJson = '';
  let lastObservedJson = '';
  state.subscribe((s) => {
    const { timerRunning, timerElapsed, timerRemaining, timerStartedAt, focus, activeExerciseDrawer, onboardingOpen, authModalOpen, isSignedIn, userEmail, userAvatar, ...persisted } = s;
    const currentJson = JSON.stringify(persisted);
    document.documentElement.setAttribute('data-theme', s.theme);
    if (currentJson !== lastObservedJson) {
      lastObservedJson = currentJson;
      if (s.isSignedIn && isConvexEnabled() && cloudRestoreComplete) triggerDebouncedCloudSync();
    }
    try {
      if (localLoadFailed) throw new Error('Stored progress could not be read. Import a valid backup before replacing it.');
      if (currentJson !== lastPersistedJson) {
        localStorage.setItem(LS_KEY, currentJson);
        lastPersistedJson = currentJson;
        localSaveFailed.set(false);
      }
    } catch {
      localSaveFailed.set(true);
    }
  });
}

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
    state.update((s) => {
      return settleTimer(s);
    });
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
    try { await actions.signIn(s.userName, roomCode, s.isSignedIn); }
    catch { /* The cloud status explains the failure; keep the current room. */ }
  },

  setUserName(userName: string) {
    state.update((s) => ({ ...s, userName: userName.trim() }));
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

  importBackup(data: unknown): void {
    const progress = parseProgress(data);
    localLoadFailed = false;
    actions.signOut();
    state.update((s) => ({ ...s, ...progress, ...sessionTimer(progress.cw, progress.cd), isSignedIn: false }));
  },

  restoreDeviceBackup() {
    if (!deviceBackup) throw new Error('No previous device backup is available.');
    actions.importBackup(deviceBackup);
  },

  exportBackup(): Progress {
    return serializeProgress(get(state));
  },

  // Crew & Code Sync (Prevents Duplication Bug!)
  pasteSyncCode(rawCode: string) {
    const match = /^\s*(?:([^:]+):)?\s*IG-([1-8])\.([1-7])\.(\d+(?:\.\d+)?)\s*$/i.exec(rawCode);
    if (!match) return false;

    const name = (match[1] || 'Friend').trim();
    const week = parseInt(match[2], 10) || 1;
    const day = parseInt(match[3], 10) || 1;
    const hours = parseFloat(match[4]) || 0;
    if (!Number.isFinite(hours) || hours < 0) return false;
    const streak = 0; // The share code contains no streak information.

    state.update((s) => {
      // Check if friend with this name already exists -> update in place!
      const existingIdx = s.localCrew.findIndex((m) => m.name.toLowerCase() === name.toLowerCase());
      let localCrew = [...s.localCrew];

      if (existingIdx >= 0) {
        localCrew[existingIdx] = {
          ...localCrew[existingIdx],
          week,
          day,
          hours,
          streak
        };
      } else {
        localCrew.push({
          id: 'm_' + Date.now(),
          name,
          week,
          day,
          hours,
          streak
        });
      }

      return { ...s, localCrew };
    });

    return true;
  },

  removeFriend(id: string) {
    state.update((s) => ({
      ...s,
      localCrew: s.localCrew.filter((m) => m.id !== id)
    }));
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
      view: 'today',
      cw: 1,
      cd: 1
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
      cloudStatus.set({ status: 'syncing', message: 'Saving progress to cloud...' });
      try {
        const version = await client.mutation(api.crew.syncProgress, { ...payload, expectedVersion: cloudVersion });
        if (attempt === authAttempt) {
          cloudVersion = version;
          cloudStatus.set({ status: 'synced', message: 'Cloud progress saved.' });
        }
        return true;
      } catch {
        if (attempt === authAttempt) cloudStatus.set({ status: 'error', message: 'Cloud save failed or another device has newer progress. Your work is saved here. Sign in again to restore cloud progress.' });
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

  async signIn(name: string, roomCode: string, cloudSignIn = false) {
    const cleanName = name.trim();
    const cleanRoom = roomCode.toUpperCase().trim();
    if (!cleanName || !/^[A-Z0-9-]{3,48}$/.test(cleanRoom)) throw new Error('Enter a name and a room code of 3 to 48 letters, numbers or hyphens.');
    const attempt = ++authAttempt;
    cloudRestoreComplete = false;
    if (cloudSyncTimer) clearTimeout(cloudSyncTimer);

    if (!cloudSignIn) {
      clearCloudAuth();
      state.update((s) => ({ ...s, userName: cleanName, roomCode: cleanRoom, isSignedIn: false, userEmail: null, userAvatar: null, invitedRoomCode: null, inviteBannerDismissed: true }));
      cloudStatus.set({ status: 'local', message: 'Saved on this device. Google sign-in is optional.' });
      return;
    }
    if (!convex) throw new Error('Cloud sync is not configured. Local practice is still available.');
    state.update((s) => ({ ...creditTimer(s), isSignedIn: false }));
    cloudStatus.set({ status: 'syncing', message: 'Verifying sign-in and loading cloud progress...' });
    try {
      const result = await convex.mutation(api.crew.signInOrRegister, { roomCode: cleanRoom, name: cleanName });
      if (attempt !== authAttempt) return;
      const local = serializeProgress(get(state));
      const restored = result.member.doneJson ? parseCloudProgress(JSON.parse(result.member.doneJson), {
        start: local.start, cw: result.member.week, cd: result.member.day,
      }) : null;
      if (restored && JSON.stringify(restored) !== JSON.stringify(local)) {
        // Save first. If browser storage is full, abort the restore instead of losing device work.
        if (typeof localStorage !== 'undefined') localStorage.setItem(DEVICE_BACKUP_KEY, JSON.stringify(local));
        deviceBackup = local;
        hasDeviceBackup.set(true);
      }
      cloudVersion = result.member.progressVersion;
      state.update((s) => {
        const progress = restored || serializeProgress(s);
        return {
          ...s, ...progress, userName: cleanName, roomCode: cleanRoom, isSignedIn: true,
          invitedRoomCode: null, inviteBannerDismissed: true, userEmail: null,
          userAvatar: result.member.avatarUrl || null,
          ...sessionTimer(progress.cw, progress.cd),
        };
      });
      cloudRestoreComplete = true;
      if (!restored) {
        if (!await actions.syncToCloud()) throw new Error('Signed in, but the initial cloud save failed. Your progress is still on this device.');
      } else {
        cloudStatus.set({ status: 'synced', message: 'Cloud progress restored. Previous device progress is available under Stats & Streak > Restore Device Backup.' });
      }
    } catch (error) {
      if (attempt === authAttempt) {
        cloudRestoreComplete = false;
        clearCloudAuth();
        state.update((s) => ({ ...s, isSignedIn: false }));
        cloudStatus.set({ status: 'error', message: 'Cloud sign-in or restore failed. Local progress is preserved. Please try again.' });
      }
      throw error;
    }
  },

  cloudSessionExpired() {
    if (!get(state).isSignedIn) return;
    actions.signOut();
    cloudStatus.set({ status: 'error', message: 'Your Google session expired. Sign in again to resume cloud sync. Device progress is unchanged.' });
  },

  signOut() {
    authAttempt++;
    clearCloudAuth();
    cloudRestoreComplete = false;
    if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
    cloudStatus.set({ status: 'local', message: 'Saved on this device.' });
    state.update((s) => ({ ...s, userName: 'You', userEmail: null, userAvatar: null, isSignedIn: false, authModalOpen: false }));
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

  const shareCode = `IG-${$s.cw}.${$s.cd}.${totalHoursNum.toFixed(1)}`;

  return {
    doneDaysCount,
    totalHoursNum: totalHoursNum.toFixed(1),
    streak,
    coursePct,
    liveDayIndex,
    liveN,
    liveD,
    missed,
    shareCode
  };
});
