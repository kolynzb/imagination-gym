<script lang="ts">
  import { state, actions } from '../lib/store';
  import { WEEKS } from '../lib/curriculum';
  import { playChime } from '../lib/audio';
  import Icon from './Icon.svelte';

  export let plannedMins = 90;

  let s = $state;
  $: s = $state;
  $: currentDay = WEEKS[s.cw - 1]?.days[s.cd - 1];
  $: timerParts = currentDay?.parts || [];

  function formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  $: displayTime =
    s.timerMode === 'countdown'
      ? formatTime(s.timerRemaining)
      : formatTime(s.timerElapsed);

  $: progressPct =
    s.timerMode === 'countdown' && s.timerTargetSeconds > 0
      ? Math.min(100, Math.round(((s.timerTargetSeconds - s.timerRemaining) / s.timerTargetSeconds) * 100))
      : plannedMins > 0
        ? Math.min(100, Math.round((s.timerElapsed / (plannedMins * 60)) * 100))
        : 0;

  function setPreset(minutes: number, partIdx: number) {
    actions.selectTimerPart(partIdx, minutes);
  }

  function setPartTimer(minutes: number, partIdx: number) {
    if (minutes > 0) {
      setPreset(minutes, partIdx);
      return;
    }
    actions.startStopwatch(partIdx);
  }

  function testChime() {
    playChime(528, 2.5);
  }
</script>

<div class="timer-box">
  <div class="timer-header">
    <div class="timer-title-group">
      <span class="timer-title">Interval Timer</span>
      <span class="timer-subtitle">
        {s.timerMode === 'countdown' ? 'Countdown' : 'Stopwatch'} · {plannedMins}m planned
      </span>
    </div>
    <button type="button" class="sound-test-btn" title="Test bell chime sound" onclick={testChime}>
      <Icon name="alarm" size={16} alt="Test chime" />
    </button>
  </div>

  <!-- Interval Preset Selectors -->
  <div class="interval-presets">
    {#each timerParts as part, index}
      <button
        type="button"
        class="preset-btn"
        class:active={s.timerPartIndex === index && (part.m === 0 ? s.timerMode === 'stopwatch' : s.timerMode === 'countdown' && s.timerTargetSeconds === part.m * 60)}
        onclick={() => setPartTimer(part.m, index)}
        title={part.m === 0 ? 'Track your play session without a time limit' : `Start the ${part.m} minute ${part.t} interval`}
      >
        Part {part.k} ({part.m > 0 ? `${part.m}m` : 'Stopwatch'})
      </button>
    {/each}
  </div>

  <!-- Big Tabular Clock -->
  <div class="clock-display" class:running={s.timerRunning}>
    {displayTime}
  </div>

  <!-- Progress Bar -->
  <div class="progress-bar">
    <div class="progress-fill" style="width: {progressPct}%"></div>
  </div>

  <!-- Controls -->
  <div class="controls-row">
    <button
      type="button"
      class="action-btn primary"
      class:running={s.timerRunning}
      onclick={() => actions.toggleTimer()}
    >
      {s.timerRunning ? 'Pause' : 'Start'}
    </button>
    <button
      type="button"
      class="action-btn outline"
      onclick={() => actions.setFocus(true)}
    >
      Focus Mode
    </button>
    <button
      type="button"
      class="action-btn outline"
      onclick={() => actions.logTimerElapsed(s.cw, s.cd)}
      title="Save elapsed time into today's log"
    >
      Log Hours
    </button>
    <button
      type="button"
      class="action-btn text"
      onclick={() => actions.resetTimer()}
    >
      Reset
    </button>
  </div>

  <div class="shortcut-tip">
    Press <kbd>Space</kbd> to start/pause
  </div>
</div>

<style>
  .timer-box {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    padding: 20px 22px;
  }

  .timer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .timer-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--ink);
    display: block;
  }

  .timer-subtitle {
    font-size: 13px;
    color: var(--ink-62);
    margin-top: 2px;
    display: block;
  }

  .sound-test-btn {
    background: transparent;
    border: 1px solid var(--line);
    border-radius: 800px;
    width: 32px;
    height: 32px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .sound-test-btn:hover {
    border-color: var(--ink);
  }

  .interval-presets {
    display: flex;
    gap: 6px;
    margin-top: 14px;
    flex-wrap: wrap;
  }

  .preset-btn {
    appearance: none;
    border: 1px solid var(--line-2);
    background: transparent;
    color: var(--ink-72);
    font-size: 13px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 800px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .preset-btn:hover {
    border-color: var(--ink);
    color: var(--ink);
  }

  .preset-btn.active {
    background: var(--ink);
    color: var(--canvas);
    border-color: var(--ink);
    font-weight: 700;
  }

  .clock-display {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 72px;
    line-height: 0.95;
    letter-spacing: 0.04em;
    font-variant-numeric: tabular-nums;
    margin-top: 16px;
    color: var(--ink);
    transition: color 0.2s ease;
  }

  .clock-display.running {
    color: var(--accent);
    animation: timerPulse 2s infinite ease-in-out;
  }

  @keyframes timerPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.88; transform: scale(1.02); }
  }

  .progress-bar {
    height: 5px;
    background: var(--track);
    border-radius: 800px;
    overflow: hidden;
    margin-top: 14px;
  }

  .progress-fill {
    height: 100%;
    background: var(--accent);
    transition: width 0.3s ease;
  }

  .controls-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 18px;
  }

  .action-btn {
    appearance: none;
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    min-height: 42px;
    padding: 0 18px;
    border-radius: 800px;
    cursor: pointer;
    transition: transform 140ms var(--ease-out), background-color 140ms ease, border-color 140ms ease;
  }

  .action-btn:active {
    transform: scale(0.96);
  }

  .action-btn.primary {
    background: var(--accent);
    color: var(--on-accent);
    border: 1.5px solid var(--accent);
    font-weight: 700;
  }

  .action-btn.primary.running {
    background: transparent;
    color: var(--ink);
  }

  .action-btn.outline {
    background: transparent;
    border: 1.5px solid var(--line-2);
    color: var(--ink);
  }

  .action-btn.outline:hover {
    border-color: var(--ink);
  }

  .action-btn.text {
    background: transparent;
    border: 0;
    color: var(--ink-62);
  }

  .action-btn.text:hover {
    color: var(--ink);
  }

  .shortcut-tip {
    font-size: 12px;
    color: var(--ink-55);
    margin-top: 12px;
  }

  kbd {
    background: var(--line);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 11px;
  }
</style>
