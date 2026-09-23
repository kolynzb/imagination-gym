<script lang="ts">
  import { VAULT } from '../lib/curriculum';
  import { state, actions, derivedStats } from '../lib/store';
  import Icon from './Icon.svelte';

  let s = $state;
  let stats = $derivedStats;

  $: s = $state;
  $: stats = $derivedStats;

  let mobileMenuOpen = false;

  const NAV_ITEMS = [
    { id: 'today', label: 'Today', group: 'Main' },
    { id: 'week', label: 'This Week', group: 'Course' },
    { id: 'roadmap', label: 'Roadmap', group: 'Course' },
    { id: 'exercises', label: '25 Exercises', group: 'Library' },
    { id: 'vault', label: 'Video Vault', group: 'Library' },
    { id: 'method', label: 'Method & Kit', group: 'Library' },
    { id: 'progress', label: 'Stats & Streak', group: 'Progress' },
    { id: 'crew', label: 'The Crew', group: 'Progress' },
  ] as const;

  function setView(id: typeof s.view) {
    actions.setView(id);
    mobileMenuOpen = false;
  }
</script>

<!-- Desktop Sidebar (Hidden on <= 860px) -->
<aside class="desktop-sidebar">
  <div class="brand">
    <img src="/android-chrome-192x192.png" alt="Imagination Gym" class="brand-logo-img" />
    <div class="brand-text">
      <div class="title">Imagination Gym</div>
      <div class="subtitle">brokendraw · 8 weeks</div>
    </div>
  </div>

  <div class="profile-strip">
    <button
      type="button"
      class="profile-btn"
      onclick={() => actions.openAuthModal()}
      aria-label="Open your account"
    >
      <div class="profile-avatar">
        {s.userName ? s.userName.charAt(0).toUpperCase() : 'Y'}
      </div>
      <div class="profile-info">
        <div class="profile-name">{s.userName}</div>
        <div class="profile-sub">
          <span>{s.roomCode}</span>
        </div>
      </div>
      <span class="profile-gear"><Icon name="gear" size={16} /></span>
    </button>
  </div>

  <button
    type="button"
    class="jump-card"
    class:active={s.view === 'today' && s.cw === stats.liveN && s.cd === stats.liveD}
    onclick={() => actions.jumpToDay(stats.liveN, stats.liveD)}
  >
    <div class="jump-info">
      <div class="jump-label">Today · Week {stats.liveN} Day {stats.liveD}</div>
      <div class="jump-title">Jump to Session</div>
    </div>
    <span class="jump-arrow">→</span>
  </button>

  <nav class="nav-scroll">
    <div class="nav-section">
      <button
        type="button"
        class="nav-btn"
        class:active={s.view === 'today'}
        onclick={() => setView('today')}
      >
        <span>Today</span>
      </button>
    </div>

    <div class="nav-section">
      <div class="nav-header">Course</div>
      <button
        type="button"
        class="nav-btn"
        class:active={s.view === 'week'}
        onclick={() => setView('week')}
      >
        <span>This Week</span>
      </button>
      <button
        type="button"
        class="nav-btn"
        class:active={s.view === 'roadmap'}
        onclick={() => setView('roadmap')}
      >
        <span>Roadmap</span>
      </button>
    </div>

    <div class="nav-section">
      <div class="nav-header">Library</div>
      <button
        type="button"
        class="nav-btn"
        class:active={s.view === 'exercises'}
        onclick={() => setView('exercises')}
      >
        <span>25 Exercises</span>
      </button>
      <button
        type="button"
        class="nav-btn"
        class:active={s.view === 'vault'}
        onclick={() => setView('vault')}
      >
        <span>Video Vault</span>
      </button>
      <button
        type="button"
        class="nav-btn"
        class:active={s.view === 'method'}
        onclick={() => setView('method')}
      >
        <span>Method & Kit</span>
      </button>
    </div>

    <div class="nav-section">
      <div class="nav-header">Progress</div>
      <button
        type="button"
        class="nav-btn"
        class:active={s.view === 'progress'}
        onclick={() => setView('progress')}
      >
        <span>Stats & Streak</span>
      </button>
      <button
        type="button"
        class="nav-btn"
        class:active={s.view === 'crew'}
        onclick={() => setView('crew')}
      >
        <span>The Crew</span>
      </button>
    </div>
  </nav>

  <div class="sidebar-footer">
    <div class="footer-stats">
      <div class="goal-header">
        <span>{stats.doneDaysCount}/56 days</span>
        <span>{stats.coursePct}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: {stats.coursePct}%"></div>
      </div>
      <div class="meta-row">
        <span>{stats.totalHoursNum}h logged</span>
        <span><Icon name="fire" size={15} /> {stats.streak} day streak</span>
      </div>
    </div>

    <div class="sidebar-secondary-actions">
      <button
        type="button"
        class="replay-orientation-link"
        onclick={() => actions.openOnboarding()}
        title="Re-open the 3-step master orientation and roadmap guide"
      >
        <Icon name="goal" size={13} /> Replay Course Guide
      </button>
    </div>

    <div class="theme-picker">
      <button
        type="button"
        class="theme-btn"
        class:active={s.theme === 'light'}
        onclick={() => actions.setTheme('light')}
      >
        Light
      </button>
      <button
        type="button"
        class="theme-btn"
        class:active={s.theme === 'dark'}
        onclick={() => actions.setTheme('dark')}
      >
        Dark
      </button>
    </div>
  </div>
</aside>

<!-- Mobile Sticky Bottom Nav (Visible on <= 860px) -->
<div class="mobile-bottom-nav">
  <button
    type="button"
    class="mobile-nav-btn"
    class:active={s.view === 'today'}
    onclick={() => setView('today')}
  >
    <span class="m-icon"><Icon name="goal" size={20} /></span>
    <span class="m-label">Today</span>
  </button>
  <button
    type="button"
    class="mobile-nav-btn"
    class:active={s.view === 'week'}
    onclick={() => setView('week')}
  >
    <span class="m-icon"><Icon name="calendar" size={20} /></span>
    <span class="m-label">Week</span>
  </button>
  <button
    type="button"
    class="mobile-nav-btn"
    class:active={s.view === 'exercises'}
    onclick={() => setView('exercises')}
  >
    <span class="m-icon"><Icon name="ruler" size={20} /></span>
    <span class="m-label">Drills</span>
  </button>
  <button
    type="button"
    class="mobile-nav-btn"
    class:active={s.view === 'crew'}
    onclick={() => setView('crew')}
  >
    <span class="m-icon"><Icon name="people" size={20} /></span>
    <span class="m-label">Crew</span>
  </button>
  <button
    type="button"
    class="mobile-nav-btn"
    class:active={mobileMenuOpen}
    onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
  >
    <span class="m-icon">⋯</span>
    <span class="m-label">Menu</span>
  </button>
</div>

<!-- Mobile Drawer Sheet -->
{#if mobileMenuOpen}
  <div class="mobile-sheet-overlay" role="dialog" aria-modal="true" aria-label="More views menu">
    <button type="button" class="backdrop-btn" onclick={() => (mobileMenuOpen = false)} aria-label="Close menu"></button>
    <div class="mobile-sheet">
      <div class="sheet-head">
        <div class="sheet-title-row">
          <img src="/android-chrome-192x192.png" alt="Imagination Gym" class="brand-logo-img-sm" />
          <span class="sheet-title">Imagination Gym</span>
        </div>
        <button type="button" class="close-btn" aria-label="Dismiss menu" onclick={() => (mobileMenuOpen = false)}><Icon name="cancel" size={14} /></button>
      </div>
      <div class="sheet-links">
        <button class="sheet-btn start-mobile-btn" onclick={() => { mobileMenuOpen = false; actions.openOnboarding(); }}>
          <Icon name="goal" size={16} /> Start Here (Course Orientation)
        </button>
        <button class="sheet-btn profile-mobile-btn" onclick={() => { mobileMenuOpen = false; actions.openAuthModal(); }}>
          <Icon name="user" size={16} /> Your account ({s.userName})
        </button>
        <button class="sheet-btn" class:active={s.view === 'roadmap'} onclick={() => setView('roadmap')}>
          Roadmap & 4-Phase Pipeline
        </button>
        <button class="sheet-btn" class:active={s.view === 'vault'} onclick={() => setView('vault')}>
          Video Vault ({VAULT.reduce((count, group) => count + group.v.length, 0)} Videos)
        </button>
        <button class="sheet-btn" class:active={s.view === 'progress'} onclick={() => setView('progress')}>
          Stats & 56-Day Calendar
        </button>
        <button class="sheet-btn" class:active={s.view === 'method'} onclick={() => setView('method')}>
          Method, Kit & Rubric
        </button>
      </div>
      <div class="theme-picker" style="margin-top: 18px;">
        <button class="theme-btn" class:active={s.theme === 'light'} onclick={() => actions.setTheme('light')}>Light</button>
        <button class="theme-btn" class:active={s.theme === 'dark'} onclick={() => actions.setTheme('dark')}>Dark</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .desktop-sidebar {
    width: 252px;
    flex: 0 0 252px;
    border-right: 1px solid var(--line);
    background: var(--canvas);
    position: sticky;
    top: 0;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    z-index: 20;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 20px 18px 18px;
    border-bottom: 1px solid var(--line);
  }

  .brand-logo-img {
    flex: 0 0 34px;
    width: 34px;
    height: 34px;
    border-radius: 9px;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
    border: 1px solid var(--line-2);
  }

  .brand-logo-img-sm {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    object-fit: cover;
  }

  .title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 21px;
    line-height: 1;
    letter-spacing: 0.03em;
  }

  .subtitle {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 13px;
    color: var(--ink-62);
    margin-top: 3px;
  }

  .profile-strip {
    padding: 12px 14px 0;
  }

  .profile-btn {
    appearance: none;
    width: 100%;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 16px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .profile-btn:hover {
    border-color: var(--ink);
  }

  .profile-avatar {
    width: 28px;
    height: 28px;
    border-radius: 14px;
    background: var(--ink);
    color: var(--canvas);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 16px;
    flex: 0 0 28px;
  }

  .profile-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .profile-name {
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .profile-sub {
    font-size: 11px;
    color: var(--ink-62);
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .profile-gear {
    font-size: 13px;
    color: var(--ink-55);
  }

  .start-mobile-btn {
    border-color: var(--accent) !important;
    font-weight: 700 !important;
  }

  .profile-mobile-btn {
    background: var(--card) !important;
  }

  .jump-card {
    appearance: none;
    background: var(--card);
    border: 1px solid var(--line);
    margin: 10px 14px 4px;
    padding: 12px 14px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.15s ease;
  }

  .jump-card:hover {
    border-color: var(--ink);
  }

  .jump-card.active {
    border-color: var(--accent);
  }

  .jump-label {
    font-size: 13px;
    color: var(--ink-62);
  }

  .jump-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--ink);
    margin-top: 2px;
  }

  .jump-arrow {
    font-size: 16px;
    color: var(--ink-62);
  }

  .nav-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 6px 10px 18px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .nav-section {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 10px;
  }

  .nav-header {
    font-size: 12px;
    font-weight: 700;
    color: var(--ink-55);
    padding: 10px 14px 4px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .nav-btn {
    appearance: none;
    background: transparent;
    border: 0;
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 40px;
    padding: 8px 14px;
    border-radius: 14px;
    font-size: 15px;
    color: var(--ink-72);
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .nav-btn:hover {
    background: var(--card);
    color: var(--ink);
  }

  .nav-btn.active {
    background: var(--card);
    color: var(--ink);
    font-weight: 700;
    box-shadow: inset 3px 0 0 var(--accent);
  }

  .sidebar-footer {
    border-top: 1px solid var(--line);
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .goal-header {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
  }

  .progress-track {
    height: 5px;
    background: var(--track);
    border-radius: 800px;
    overflow: hidden;
    margin: 6px 0;
  }

  .progress-fill {
    height: 100%;
    background: var(--ink);
    transition: width 0.3s ease;
  }

  .meta-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--ink-62);
  }

  .sidebar-secondary-actions {
    display: flex;
    justify-content: center;
  }

  .replay-orientation-link {
    appearance: none;
    background: transparent;
    border: 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-55);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: color 150ms ease;
  }

  .replay-orientation-link:hover {
    color: var(--ink);
  }

  .theme-picker {
    display: flex;
    gap: 4px;
    padding: 3px;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 800px;
  }

  .theme-btn {
    flex: 1;
    appearance: none;
    border: 0;
    background: transparent;
    padding: 6px 10px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 800px;
    color: var(--ink-62);
    cursor: pointer;
    text-align: center;
    transition: all 0.15s ease;
  }

  .theme-btn.active {
    background: var(--ink);
    color: var(--canvas);
    font-weight: 700;
  }

  /* Mobile Bottom Nav */
  .mobile-bottom-nav {
    display: none;
  }

  @media (max-width: 860px) {
    .desktop-sidebar {
      display: none;
    }

    .mobile-bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: var(--card);
      border-top: 1px solid var(--line);
      display: flex;
      justify-content: space-around;
      align-items: center;
      z-index: 50;
      padding-bottom: env(safe-area-inset-bottom, 0);
    }

    .mobile-nav-btn {
      flex: 1;
      height: 100%;
      appearance: none;
      background: transparent;
      border: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      color: var(--ink-62);
      cursor: pointer;
    }

    .mobile-nav-btn.active {
      color: var(--accent);
      font-weight: 700;
    }

    .m-icon {
      font-size: 18px;
    }

    .m-label {
      font-size: 11px;
    }

    .mobile-sheet-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      z-index: 90;
      display: flex;
      align-items: flex-end;
      animation: fadeIn 200ms var(--ease-out);
    }

    .backdrop-btn {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      border: 0;
      cursor: pointer;
    }

    .mobile-sheet {
      position: relative;
      width: 100%;
      background: var(--canvas);
      border-radius: 24px 24px 0 0;
      padding: 24px 20px 48px;
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
      animation: sheetSlideUp 260ms var(--ease-drawer);
    }

    @keyframes sheetSlideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .sheet-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .sheet-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .sheet-title {
      font-family: 'Bebas Neue', Impact, sans-serif;
      font-size: 24px;
      letter-spacing: 0.02em;
    }

    .close-btn {
      min-width: 44px;
      min-height: 44px;
      background: transparent;
      border: 0;
      font-size: 20px;
      color: var(--ink-62);
      cursor: pointer;
    }

    .sheet-links {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sheet-btn {
      appearance: none;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 14px 16px;
      text-align: left;
      font-size: 15px;
      font-weight: 500;
      color: var(--ink);
      cursor: pointer;
    }

    .sheet-btn.active {
      border-color: var(--accent);
      font-weight: 700;
    }
  }
</style>
