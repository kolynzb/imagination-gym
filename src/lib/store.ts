import { writable, derived, get } from 'svelte/store';
import { WEEKS, type Week, type Day, type DayPart } from './curriculum';
import { playChime, playBlip } from './audio';
import { convex, isConvexEnabled } from './convex';

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

function getInitialState(): AppState {
  const defaultMonday = getMondayOf(new Date()).toISOString().slice(0, 10);
  let saved: Partial<AppState> | null = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LS_KEY) || localStorage.getItem('imaginationGym.v1');
      if (raw) saved = JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
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
    start: saved?.start || defaultMonday,
    theme: saved?.theme || 'light',
    paceFlex: saved?.paceFlex ?? false,
    focus: false,
    activeExerciseDrawer: null,
    roomCode: activeRoom,
    userName: saved?.userName || 'You',
    localCrew: saved?.localCrew || [],
    timerRunning: false,
    timerMode: 'countdown',
    timerTargetSeconds: 600, // 10 min warmup default
    timerRemaining: 600,
    timerElapsed: 0,
    timerPartIndex: 0,
    onboarded: saved?.onboarded ?? false,
    onboardingOpen: saved?.onboarded ? false : true,
    onboardingStep: 1,
    kitChecked: saved?.kitChecked || {},
    authModalOpen: isInvited && !saved?.isSignedIn,
    isSignedIn: saved?.isSignedIn ?? false,
    invitedRoomCode: urlRoom,
    inviteBannerDismissed: false,
    userEmail: saved?.userEmail || null,
    userAvatar: saved?.userAvatar || null
  };
}

export function getMondayOf(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

export const state = writable<AppState>(getInitialState());

let cloudSyncTimer: ReturnType<typeof setTimeout> | null = null;
function triggerDebouncedCloudSync() {
  if (typeof window === 'undefined') return;
  if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => {
    actions.syncToCloud().catch(() => {});
  }, 1500);
}

// Auto-persist to localStorage on state changes (memoized to avoid write churn during timer ticks)
if (typeof window !== 'undefined') {
  let lastPersistedJson = '';
  state.subscribe((s) => {
    try {
      const { timerRunning, timerElapsed, timerRemaining, focus, activeExerciseDrawer, onboardingOpen, authModalOpen, ...persisted } = s;
      const currentJson = JSON.stringify(persisted);
      if (currentJson !== lastPersistedJson) {
        lastPersistedJson = currentJson;
        localStorage.setItem(LS_KEY, currentJson);
        document.documentElement.setAttribute('data-theme', s.theme);
        if (s.isSignedIn && isConvexEnabled()) {
          triggerDebouncedCloudSync();
        }
      }
    } catch {
      // quota or private mode
    }
  });
}

// Timer ticker loop
let timerInterval: ReturnType<typeof setInterval> | null = null;

if (typeof window !== 'undefined') {
  timerInterval = setInterval(() => {
    state.update((s) => {
      if (!s.timerRunning) return s;

      const nextElapsed = s.timerElapsed + 1;
      let nextRemaining = s.timerRemaining - 1;

      if (s.timerMode === 'countdown' && nextRemaining <= 0) {
        nextRemaining = 0;
        playChime(528, 3.5); // Warm resonant chime!
        return {
          ...s,
          timerRunning: false,
          timerElapsed: nextElapsed,
          timerRemaining: 0
        };
      }

      return {
        ...s,
        timerElapsed: nextElapsed,
        timerRemaining: nextRemaining
      };
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
    state.update((s) => ({ ...s, start }));
  },

  setPaceFlex(paceFlex: boolean) {
    state.update((s) => ({ ...s, paceFlex }));
  },

  setRoomCode(roomCode: string) {
    state.update((s) => ({ ...s, roomCode: roomCode.toUpperCase().trim() }));
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
    state.update((s) => ({ ...s, cw, cd, view: 'today' }));
  },

  stepDay(delta: number) {
    state.update((s) => {
      let n = s.cw;
      let d = s.cd + delta;
      if (d > 7) {
        d = 1;
        n = Math.min(8, n + 1);
      }
      if (d < 1) {
        d = 7;
        n = Math.max(1, n - 1);
      }
      return { ...s, cw: n, cd: d };
    });
  },

  togglePart(cw: number, cd: number, partIndex: number) {
    state.update((s) => {
      const key = `w${cw}d${cd}p${partIndex}`;
      const done = { ...s.done, [key]: !s.done[key] };
      return { ...s, done };
    });
  },

  setPartDone(cw: number, cd: number, partIndex: number, isDone: boolean) {
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

      // Auto-log hours if timer has elapsed time
      let dayHours = { ...s.dayHours };
      if (isDone && s.timerElapsed > 60) {
        const hKey = `w${cw}d${cd}`;
        const prevH = parseFloat(dayHours[hKey] || '0') || 0;
        const addH = s.timerElapsed / 3600;
        dayHours[hKey] = (prevH + addH).toFixed(1);
      }

      return { ...s, done, dayHours };
    });
  },

  setDayHours(cw: number, cd: number, hours: string) {
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

  // Timer Controls
  selectTimerPart(partIndex: number, minutes: number) {
    state.update((s) => {
      const targetSeconds = minutes * 60;
      return {
        ...s,
        timerMode: 'countdown',
        timerPartIndex: partIndex,
        timerTargetSeconds: targetSeconds,
        timerRemaining: targetSeconds,
        timerRunning: false
      };
    });
  },

  toggleTimer() {
    state.update((s) => {
      const nextRun = !s.timerRunning;
      if (nextRun) {
        playBlip(660);
      } else {
        playBlip(440);
      }
      return { ...s, timerRunning: nextRun };
    });
  },

  resetTimer() {
    state.update((s) => ({
      ...s,
      timerRunning: false,
      timerRemaining: s.timerTargetSeconds,
      timerElapsed: 0
    }));
  },

  logTimerElapsed(cw: number, cd: number) {
    state.update((s) => {
      const hoursToAdd = s.timerElapsed / 3600;
      if (hoursToAdd <= 0.01) return s;

      const key = `w${cw}d${cd}`;
      const currentHours = parseFloat(s.dayHours[key] || '0') || 0;
      const dayHours = {
        ...s.dayHours,
        [key]: (currentHours + hoursToAdd).toFixed(1)
      };

      return {
        ...s,
        dayHours,
        timerRunning: false,
        timerElapsed: 0,
        timerRemaining: s.timerTargetSeconds
      };
    });
  },

  // Schedule Shift (move start date by N missed days)
  shiftSchedule(daysToShift: number) {
    state.update((s) => {
      const current = new Date(s.start + 'T00:00:00');
      current.setDate(current.getDate() + daysToShift);
      return { ...s, start: current.toISOString().slice(0, 10) };
    });
  },

  // Crew & Code Sync (Prevents Duplication Bug!)
  pasteSyncCode(rawCode: string) {
    const match = /^\s*(?:([^:]+):)?\s*IG-(\d+)\.(\d+)\.([\d.]+)\s*$/i.exec(rawCode);
    if (!match) return false;

    const name = (match[1] || 'Friend').trim();
    const week = parseInt(match[2], 10) || 1;
    const day = parseInt(match[3], 10) || 1;
    const hours = parseFloat(match[4]) || 0;
    const streak = Math.max(1, (week - 1) * 7 + day);

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
    const stats = get(derivedStats);
    if (!s.isSignedIn || !convex) return false;
    try {
      const donePayload = JSON.stringify({
        done: s.done,
        dayHours: s.dayHours,
        dayNotes: s.dayNotes,
        ms: s.ms,
        counters: s.counters
      });
      // @ts-ignore
      await convex.mutation('crew:syncProgress', {
        roomCode: s.roomCode,
        name: s.userName,
        week: s.cw,
        day: s.cd,
        hours: parseFloat(stats.totalHoursNum) || 0,
        streak: stats.streak,
        doneJson: donePayload
      });
      return true;
    } catch (e) {
      console.warn('Convex sync error:', e);
      return false;
    }
  },

  async copyInviteLink(roomCode?: string): Promise<string> {
    const s = get(state);
    const code = (roomCode || s.roomCode || 'GYM-CREW').toUpperCase().trim();
    let link = `https://imagination-gym.vercel.app/?room=${encodeURIComponent(code)}`;
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
    state.update((s) => ({
      ...s,
      roomCode: cleanRoom,
      invitedRoomCode: null,
      inviteBannerDismissed: true,
      authModalOpen: !s.isSignedIn
    }));
  },

  async signIn(name: string, roomCode: string, email?: string, avatarUrl?: string, authId?: string) {
    const cleanName = name.trim();
    const cleanRoom = roomCode.toUpperCase().trim();
    if (!cleanName || !cleanRoom) return;

    state.update((s) => ({
      ...s,
      userName: cleanName,
      roomCode: cleanRoom,
      isSignedIn: true,
      userEmail: email || s.userEmail || null,
      userAvatar: avatarUrl || s.userAvatar || null,
      invitedRoomCode: null,
      inviteBannerDismissed: true
    }));

    // If Convex is available, sync and fetch existing profile
    if (convex) {
      try {
        // @ts-ignore
        const member = await convex.mutation('crew:signInOrRegister', {
          roomCode: cleanRoom,
          name: cleanName,
          email: email || undefined,
          avatarUrl: avatarUrl || undefined,
          authId: authId || undefined
        });

        if (member && member.doneJson) {
          try {
            const restored = JSON.parse(member.doneJson);
            state.update((s) => ({
              ...s,
              done: { ...s.done, ...(restored.done || {}) },
              dayHours: { ...s.dayHours, ...(restored.dayHours || {}) },
              dayNotes: { ...s.dayNotes, ...(restored.dayNotes || {}) },
              cw: member.week || s.cw,
              cd: member.day || s.cd
            }));
          } catch (e) {
            console.warn('Failed to parse remote progress:', e);
          }
        } else if (member) {
          // New member: upload current state
          await actions.syncToCloud();
        }
      } catch (err) {
        console.warn('Convex sign-in error:', err);
      }
    }
  },

  signOut() {
    state.update((s) => ({
      ...s,
      userName: 'You',
      userEmail: null,
      userAvatar: null,
      isSignedIn: false,
      authModalOpen: false
    }));
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

  // Calculate Streak: count consecutive completed days ending at today or yesterday
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
  const startDate = new Date($s.start + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const liveDayIndex = Math.round((now.getTime() - startDate.getTime()) / 86400000);

  let liveN = 1, liveD = 1;
  if (liveDayIndex >= 0 && liveDayIndex < 56) {
    liveN = Math.floor(liveDayIndex / 7) + 1;
    liveD = (liveDayIndex % 7) + 1;
  }

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
