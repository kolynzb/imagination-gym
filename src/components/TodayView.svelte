<script lang="ts">
  import { state, actions, derivedStats } from '../lib/store';
  import { WEEKS } from '../lib/curriculum';
  import { formatObsidianDay } from '../lib/obsidian';
  import Timer from './Timer.svelte';
  import Icon from './Icon.svelte';

  let s = $state;
  let stats = $derivedStats;
  $: s = $state;
  $: stats = $derivedStats;

  $: currentWeek = WEEKS[s.cw - 1];
  $: currentDay = currentWeek?.days[s.cd - 1];

  $: totalPlannedMins = currentDay?.parts.reduce((acc, p) => acc + (p.m || 0), 0) || 0;

  $: completedPartsList = currentDay?.parts.map((_, i) => !!s.done[`w${s.cw}d${s.cd}p${i}`]) || [];
  $: allPartsDone = completedPartsList.length > 0 && completedPartsList.every(Boolean);

  let obsidianCopied = false;

  function copyToObsidian() {
    if (!currentWeek || !currentDay) return;
    const dateStr = s.start; // Or formatted date
    const md = formatObsidianDay({
      week: currentWeek,
      day: currentDay,
      weekNum: s.cw,
      dayNum: s.cd,
      dateStr,
      completedParts: completedPartsList,
      hoursLogged: s.dayHours[`w${s.cw}d${s.cd}`] || '',
      note: s.dayNotes[`w${s.cw}d${s.cd}`] || '',
      totalCoursePct: stats.coursePct,
      streak: stats.streak
    });

    navigator.clipboard.writeText(md).then(() => {
      obsidianCopied = true;
      setTimeout(() => (obsidianCopied = false), 2500);
    });
  }

  function extractExerciseRefs(text: string): string[] {
    const refs: string[] = [];
    const re = /Ex (\d{2})/g;
    let m;
    while ((m = re.exec(text))) {
      if (!refs.includes(m[1])) refs.push(m[1]);
    }
    return refs;
  }
</script>

<div class="today-view">
  <!-- Crew Invitation Banner -->
  {#if s.invitedRoomCode && !s.isSignedIn && !s.inviteBannerDismissed}
    <div class="invite-top-banner">
      <div class="invite-banner-inner">
        <span class="invite-banner-icon">🎨</span>
        <div class="invite-banner-msg">
          You've been invited to join crew <strong>{s.invitedRoomCode}</strong>! Practice together and sync streaks on the shared leaderboard.
        </div>
      </div>
      <div class="invite-banner-btns">
        <button type="button" class="join-crew-btn" onclick={() => actions.acceptInvite(s.invitedRoomCode!)}>
          Join Crew
        </button>
        <button type="button" class="dismiss-crew-btn" onclick={() => actions.dismissInviteBanner()} aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  {/if}

  <!-- Schedule Shift Alert if behind -->
  {#if stats.missed.length > 0}
    <div class="schedule-alert">
      <div class="alert-content">
        <div class="alert-title">
          {stats.missed.length === 1 ? '1 day is still unticked behind you' : `${stats.missed.length} days are still unticked behind you`}
        </div>
        <p class="alert-desc">
          The reps only work daily, so don't double up to catch up. Either resume from where you stopped, or shift your schedule so the calendar matches reality.
        </p>
      </div>
      <div class="alert-actions">
        <button
          type="button"
          class="alert-btn primary"
          onclick={() => actions.jumpToDay(stats.missed[0].n, stats.missed[0].d)}
        >
          Go to W{stats.missed[0].n} D{stats.missed[0].d} →
        </button>
        <button
          type="button"
          class="alert-btn outline"
          onclick={() => actions.shiftSchedule(stats.missed.length)}
        >
          Shift schedule by {stats.missed.length}d
        </button>
      </div>
    </div>
  {/if}

  <!-- Header -->
  <header class="day-header">
    <div class="header-left">
      <div class="header-breadcrumb">
        <span>Week {s.cw} · Day {s.cd}</span>
        <span class="dot-sep">•</span>
        <span>{currentWeek?.title}</span>
        {#if stats.liveN === s.cw && stats.liveD === s.cd}
          <span class="live-pill">Today</span>
        {/if}
      </div>
      <h1 class="page-title">{currentDay?.t}</h1>
      <div class="meta-row">
        <span>{totalPlannedMins > 0 ? `${totalPlannedMins} min total` : 'Rest & Joy'}</span>
        <span class="dot-sep">•</span>
        <span>{currentDay?.parts.length} parts</span>
        <span class="dot-sep">•</span>
        <span class="remaining-count">
          {#if allPartsDone}
            All Done <Icon name="checkmark" size={13} />
          {:else}
            {currentDay?.parts.length - completedPartsList.filter(Boolean).length} parts left
          {/if}
        </span>
      </div>
    </div>

    <div class="nav-arrows">
      <button
        type="button"
        class="nav-arrow-btn"
        onclick={() => actions.stepDay(-1)}
        disabled={s.cw === 1 && s.cd === 1}
      >
        ← Prev
      </button>
      <button
        type="button"
        class="nav-arrow-btn"
        onclick={() => actions.stepDay(1)}
        disabled={s.cw === 8 && s.cd === 7}
      >
        Next →
      </button>
    </div>
  </header>

  <div class="day-layout">
    <!-- Main Left Column: Day Parts -->
    <div class="day-main">
      <div class="parts-container">
        {#if currentDay}
          {#each currentDay.parts as part, i}
            {@const isDone = completedPartsList[i]}
            {@const exRefs = extractExerciseRefs(`${part.p} ${part.d}`)}

            <div
              class="part-card"
              class:part-a={part.k === 'A'}
              class:part-b={part.k === 'B'}
              class:part-c={part.k === 'C'}
              class:part-d={part.k === 'D'}
              class:completed={isDone}
            >
              <button
                type="button"
                class="part-checkbox"
                class:checked={isDone}
                onclick={() => actions.togglePart(s.cw, s.cd, i)}
                aria-label="Toggle part completion"
              >
                {#if isDone}
                  <Icon name="checkmark" size={13} />
                {/if}
              </button>

              <div class="part-body">
                <div class="part-topline">
                  <span class="part-tag">Part {part.k} · {part.t}</span>
                  <span class="part-duration">{part.m > 0 ? `${part.m} min` : 'All day'}</span>
                  {#if isDone}
                    <span class="done-badge">Done</span>
                  {/if}
                </div>

                <h3 class="part-purpose">{part.p}</h3>
                <p class="part-desc">{part.d}</p>

                {#if exRefs.length > 0}
                  <div class="refs-row">
                    {#each exRefs as refNum}
                      <button
                        type="button"
                        class="ref-chip"
                        onclick={() => actions.openExerciseDrawer(refNum)}
                      >
                        Ex {refNum} Drawer ↗
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <!-- Log Hours & Notes Card -->
      <div class="session-log-card">
        <div class="log-title">Session Log & Notes</div>
        <div class="log-inputs">
          <div class="input-group hours-group">
            <label for="hours-input">Hours Logged</label>
            <input
              id="hours-input"
              type="text"
              placeholder="1.5"
              value={s.dayHours[`w${s.cw}d${s.cd}`] || ''}
              oninput={(e) => actions.setDayHours(s.cw, s.cd, (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="input-group note-group">
            <label for="note-input">Daily Blind Spot / Key Learning</label>
            <textarea
              id="note-input"
              placeholder="What improved, and the one blind spot you identified today..."
              value={s.dayNotes[`w${s.cw}d${s.cd}`] || ''}
              oninput={(e) => actions.setDayNote(s.cw, s.cd, (e.target as HTMLTextAreaElement).value)}
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="day-actions-bar">
        <button
          type="button"
          class="primary-action-btn"
          class:all-done={allPartsDone}
          onclick={() => {
            if (allPartsDone) {
              actions.stepDay(1);
            } else {
              actions.setAllDayParts(s.cw, s.cd, true);
            }
          }}
        >
          {#if allPartsDone}
            Go to Next Day →
          {:else}
            <Icon name="checkmark" size={15} /> Mark Day Complete
          {/if}
        </button>

        <button
          type="button"
          class="obsidian-btn"
          class:copied={obsidianCopied}
          onclick={copyToObsidian}
          title="Copy formatted markdown to Obsidian Journal"
        >
          {#if obsidianCopied}
            <Icon name="checkmark" size={16} /> Copied to Clipboard!
          {:else}
            <Icon name="clipboard" size={16} /> Copy to Obsidian Journal
          {/if}
        </button>
      </div>
    </div>

    <!-- Right Column: Timer & Week Context -->
    <div class="day-sidebar">
      <Timer plannedMins={totalPlannedMins} />

      <div class="week-context-card">
        <div class="context-label">Week {s.cw} Project</div>
        <div class="project-title">{currentWeek?.project}</div>

        <div class="divider"></div>

        <div class="context-label">Required Reading</div>
        <div class="reading-item">
          <strong>brokendraw book:</strong> {currentWeek?.book}
        </div>
        <div class="reading-item">
          <strong>The Dynamic Bible:</strong> {currentWeek?.han}
        </div>

        {#if currentWeek?.links && currentWeek.links.length > 0}
          <div class="divider"></div>
          <div class="context-label">Week References</div>
          <div class="links-list">
            {#each currentWeek.links as link}
              <a href={link.u} target="_blank" rel="noreferrer" class="ext-link">
                {link.l} ↗
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .today-view {
    padding: 36px 44px 80px;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }

  .schedule-alert {
    background: var(--sulfur-band);
    border: 1px solid var(--line-2);
    border-radius: 24px;
    padding: 20px 24px;
    margin-bottom: 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  .alert-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--ink);
  }

  .alert-desc {
    font-size: 14px;
    line-height: 1.5;
    color: var(--ink-78);
    margin: 4px 0 0;
  }

  .alert-actions {
    display: flex;
    gap: 10px;
  }

  .alert-btn {
    appearance: none;
    font-size: 14px;
    font-weight: 500;
    padding: 8px 18px;
    border-radius: 800px;
    cursor: pointer;
  }

  .alert-btn.primary {
    background: var(--ink);
    color: var(--canvas);
    border: 1.5px solid var(--ink);
    font-weight: 700;
  }

  .alert-btn.outline {
    background: transparent;
    border: 1.5px solid var(--ink);
    color: var(--ink);
  }

  .day-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 24px;
    padding-bottom: 22px;
    border-bottom: 1px solid var(--line);
    flex-wrap: wrap;
  }

  .header-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--ink-62);
  }

  .dot-sep {
    opacity: 0.5;
  }

  .live-pill {
    background: var(--accent);
    color: var(--on-accent);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 800px;
  }

  .page-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 56px;
    line-height: 1.05;
    letter-spacing: 0.02em;
    margin: 8px 0 0;
    color: var(--ink);
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--ink-72);
    margin-top: 8px;
  }

  .remaining-count {
    font-weight: 700;
    color: var(--ink);
  }

  .nav-arrows {
    display: flex;
    gap: 8px;
  }

  .nav-arrow-btn {
    appearance: none;
    background: transparent;
    border: 1.5px solid var(--line-2);
    border-radius: 800px;
    padding: 8px 18px;
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
    cursor: pointer;
  }

  .nav-arrow-btn:hover:not(:disabled) {
    border-color: var(--ink);
  }

  .nav-arrow-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .day-layout {
    display: flex;
    gap: 28px;
    margin-top: 28px;
    align-items: flex-start;
  }

  .day-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .parts-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .part-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 0 24px 24px 0;
    padding: 24px 26px;
    display: flex;
    gap: 18px;
    align-items: flex-start;
    transition: opacity 200ms var(--ease-out), border-color 160ms var(--ease-out);
  }

  @media (hover: hover) and (pointer: fine) {
    .part-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(7, 6, 7, 0.06);
      border-color: var(--line-3);
    }
  }

  .part-card.part-a { border-left: 8px solid var(--sulfur); }
  .part-card.part-b { border-left: 8px solid var(--accent); }
  .part-card.part-c { border-left: 8px solid var(--ink); }
  .part-card.part-d { border-left: 8px solid var(--line-3); }

  .part-card.completed {
    opacity: 0.72;
  }

  .part-checkbox {
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 8px;
    border: 1.5px solid var(--line-3);
    background: var(--canvas);
    color: var(--canvas);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;
    margin-top: 2px;
    flex: 0 0 24px;
    transition: transform 120ms var(--ease-out), background-color 140ms var(--ease-out), border-color 140ms var(--ease-out);
  }

  .part-checkbox:active {
    transform: scale(0.90);
  }

  .part-checkbox.checked {
    background: var(--ink);
    border-color: var(--ink);
    animation: checkPop 220ms var(--ease-out) both;
  }

  .part-body {
    flex: 1;
    min-width: 0;
  }

  .part-topline {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .part-tag {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-78);
  }

  .part-duration {
    font-size: 12px;
    color: var(--ink-55);
  }

  .done-badge {
    font-size: 11px;
    font-weight: 700;
    background: var(--ink);
    color: var(--canvas);
    padding: 2px 8px;
    border-radius: 800px;
  }

  .part-purpose {
    font-size: 17px;
    font-weight: 700;
    color: var(--ink);
    margin: 8px 0 6px;
  }

  .part-desc {
    font-size: 15px;
    line-height: 1.6;
    color: var(--ink-78);
    margin: 0;
  }

  .refs-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 14px;
  }

  .ref-chip {
    appearance: none;
    background: transparent;
    border: 1px solid var(--line-2);
    border-radius: 800px;
    padding: 5px 12px;
    font-size: 13px;
    font-weight: 500;
    color: var(--ink);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .ref-chip:hover {
    border-color: var(--accent);
    color: var(--accent-ink);
  }

  .session-log-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    padding: 22px 24px;
  }

  .log-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 14px;
  }

  .log-inputs {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .input-group label {
    font-size: 12px;
    font-weight: 700;
    color: var(--ink-62);
    display: block;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .hours-group input {
    width: 100px;
    padding: 8px 12px;
    border: 1px solid var(--line-2);
    border-radius: 12px;
    background: var(--canvas);
    font-size: 15px;
    color: var(--ink);
  }

  .note-group textarea {
    width: 100%;
    min-height: 72px;
    padding: 10px 12px;
    border: 1px solid var(--line-2);
    border-radius: 12px;
    background: var(--canvas);
    font-size: 14px;
    line-height: 1.5;
    color: var(--ink);
    resize: vertical;
  }

  .day-actions-bar {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
    margin-top: 8px;
  }

  .primary-action-btn {
    appearance: none;
    border: 1.5px solid var(--accent);
    background: var(--accent);
    color: var(--on-accent);
    padding: 12px 26px;
    border-radius: 800px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .primary-action-btn.all-done {
    background: transparent;
    border-color: var(--ink);
    color: var(--ink);
  }

  .obsidian-btn {
    appearance: none;
    border: 1.5px solid var(--line-2);
    background: transparent;
    color: var(--ink);
    padding: 12px 20px;
    border-radius: 800px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .obsidian-btn:hover {
    border-color: var(--ink);
  }

  .obsidian-btn.copied {
    border-color: var(--accent);
    color: var(--accent-ink);
    font-weight: 700;
  }

  .day-sidebar {
    width: 320px;
    flex: 0 0 320px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .week-context-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    padding: 20px 22px;
  }

  .context-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--ink-55);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }

  .project-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 26px;
    line-height: 1.15;
    letter-spacing: 0.02em;
    color: var(--ink);
  }

  .divider {
    height: 1px;
    background: var(--line);
    margin: 14px 0;
  }

  .reading-item {
    font-size: 14px;
    line-height: 1.5;
    color: var(--ink-78);
    margin-bottom: 6px;
  }

  .links-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ext-link {
    font-size: 13px;
    color: var(--accent-ink);
    text-decoration: none;
    border-bottom: 1px solid var(--accent-14);
  }

  .ext-link:hover {
    color: var(--ink);
    border-bottom-color: var(--ink);
  }

  .invite-top-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-radius: 20px;
    background: rgba(235, 94, 40, 0.08);
    border: 1px solid rgba(235, 94, 40, 0.35);
    margin-bottom: 24px;
    animation: fadeIn 200ms var(--ease-out);
  }

  .invite-banner-inner {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .invite-banner-icon {
    font-size: 20px;
  }

  .invite-banner-msg {
    font-size: 14px;
    color: var(--ink);
    line-height: 1.4;
  }

  .invite-banner-btns {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .join-crew-btn {
    appearance: none;
    background: var(--accent);
    color: #fff;
    border: 0;
    border-radius: 800px;
    font-size: 13px;
    font-weight: 700;
    padding: 8px 16px;
    cursor: pointer;
    transition: transform 120ms ease;
  }

  .join-crew-btn:active {
    transform: scale(0.96);
  }

  .dismiss-crew-btn {
    appearance: none;
    background: transparent;
    border: 0;
    font-size: 16px;
    color: var(--ink-55);
    cursor: pointer;
    padding: 6px;
    border-radius: 800px;
    line-height: 1;
  }

  .dismiss-crew-btn:hover {
    color: var(--ink);
  }

  @media (max-width: 600px) {
    .invite-top-banner {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }

  @media (max-width: 980px) {
    .day-layout {
      flex-direction: column;
    }
    .day-sidebar {
      width: 100%;
      flex: none;
    }
  }

  @media (max-width: 600px) {
    .today-view {
      padding: 24px 18px 80px;
    }
    .page-title {
      font-size: 42px;
    }
  }
</style>
