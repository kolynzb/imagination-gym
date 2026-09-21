<script lang="ts">
  import { state, actions } from '../lib/store';
  import { WEEKS } from '../lib/curriculum';
  import Icon from './Icon.svelte';

  let s = $state;
  $: s = $state;

  $: currentWeek = WEEKS[s.cw - 1];
  $: currentDay = currentWeek?.days[s.cd - 1];

  let refImage: string | null = null;

  function close() {
    actions.setFocus(false);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
    if (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'INPUT' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
      e.preventDefault();
      actions.toggleTimer();
    }
  }

  function formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  $: displayTime =
    s.timerMode === 'countdown'
      ? formatTime(s.timerRemaining)
      : formatTime(s.timerElapsed);

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        refImage = reader.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="focus-modal">
  <header class="focus-header">
    <div class="header-info">
      <span class="meta-tag">Week {s.cw} · Day {s.cd}</span>
      <h1 class="day-title">{currentDay?.t}</h1>
    </div>
    <button type="button" class="exit-btn" onclick={close}>
      Exit Focus · <kbd>Esc</kbd>
    </button>
  </header>

  <div class="focus-body">
    <!-- Reference Drop Canvas -->
    <div class="reference-slot">
      {#if refImage}
        <div class="img-wrapper">
          <img src={refImage} alt="Session Reference" />
          <button type="button" class="remove-img-btn" onclick={() => (refImage = null)}><Icon name="cancel" size={14} /></button>
        </div>
      {:else}
        <label class="drop-zone">
          <input type="file" accept="image/*" onchange={handleFileSelect} />
          <span class="drop-icon"><Icon name="image" size={32} /></span>
          <span class="drop-label">Drop reference photo here, or click to upload</span>
          <span class="drop-sub">Prop reference / Pose / Anatomy target</span>
        </label>
      {/if}
    </div>

    <!-- Timer & Checklist Rail -->
    <div class="focus-rail">
      <div class="timer-card">
        <div class="timer-clock" class:running={s.timerRunning}>
          {displayTime}
        </div>
        <div class="timer-sub">
          {s.timerMode === 'countdown' ? 'Remaining in interval' : 'Total session elapsed'}
        </div>

        <div class="focus-controls">
          <button
            type="button"
            class="control-btn primary"
            class:running={s.timerRunning}
            onclick={() => actions.toggleTimer()}
          >
            {s.timerRunning ? 'Pause (Space)' : 'Start (Space)'}
          </button>
          <button
            type="button"
            class="control-btn outline"
            onclick={() => actions.logTimerElapsed(s.cw, s.cd)}
          >
            Log
          </button>
          <button
            type="button"
            class="control-btn text"
            onclick={() => actions.resetTimer()}
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Quick Part Ticker -->
      <div class="parts-list">
        <div class="list-title">Today's Session Plan</div>
        {#if currentDay}
          {#each currentDay.parts as part, i}
            {@const doneKey = `w${s.cw}d${s.cd}p${i}`}
            {@const isDone = !!s.done[doneKey]}
            <div class="part-item" class:done={isDone}>
              <button
                type="button"
                class="tick-box"
                class:checked={isDone}
                onclick={() => actions.togglePart(s.cw, s.cd, i)}
              >
                {#if isDone}
                  <Icon name="checkmark" size={13} />
                {/if}
              </button>
              <div class="part-details">
                <div class="part-name">
                  Part {part.k} · {part.t} {part.m > 0 ? `(${part.m}m)` : ''}
                </div>
                <div class="part-purpose">{part.p}</div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .focus-modal {
    position: fixed;
    inset: 0;
    z-index: 120;
    background: var(--canvas);
    display: flex;
    flex-direction: column;
  }

  .focus-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 28px;
    border-bottom: 1px solid var(--line);
  }

  .meta-tag {
    font-size: 13px;
    color: var(--ink-62);
  }

  .day-title {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 28px;
    letter-spacing: 0.02em;
    margin: 2px 0 0;
    color: var(--ink);
  }

  .exit-btn {
    appearance: none;
    border: 1.5px solid var(--line-2);
    background: transparent;
    border-radius: 800px;
    padding: 8px 18px;
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
    cursor: pointer;
  }

  .exit-btn:hover {
    border-color: var(--ink);
  }

  kbd {
    font-size: 11px;
    background: var(--line);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .focus-body {
    flex: 1;
    display: flex;
    gap: 20px;
    padding: 20px 28px 28px;
    min-height: 0;
  }

  .reference-slot {
    flex: 1;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .drop-zone {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 20px;
    text-align: center;
  }

  .drop-zone input {
    display: none;
  }

  .drop-icon {
    font-size: 36px;
    opacity: 0.7;
    margin-bottom: 12px;
  }

  .drop-label {
    font-size: 16px;
    font-weight: 700;
    color: var(--ink);
  }

  .drop-sub {
    font-size: 13px;
    color: var(--ink-62);
    margin-top: 4px;
  }

  .img-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .img-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .remove-img-btn {
    position: absolute;
    top: 14px;
    right: 14px;
    background: var(--ink);
    color: var(--canvas);
    border: 0;
    width: 32px;
    height: 32px;
    border-radius: 800px;
    cursor: pointer;
    font-size: 14px;
  }

  .focus-rail {
    width: 340px;
    flex: 0 0 340px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
  }

  .timer-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    padding: 22px;
  }

  .timer-clock {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 76px;
    line-height: 0.95;
    letter-spacing: 0.04em;
    font-variant-numeric: tabular-nums;
    color: var(--ink);
    transition: color 0.2s ease;
  }

  .timer-clock.running {
    color: var(--accent);
  }

  .timer-sub {
    font-size: 13px;
    color: var(--ink-62);
    margin-top: 6px;
  }

  .focus-controls {
    display: flex;
    gap: 8px;
    margin-top: 18px;
  }

  .control-btn {
    appearance: none;
    font-size: 13px;
    font-weight: 500;
    padding: 8px 14px;
    border-radius: 800px;
    cursor: pointer;
  }

  .control-btn.primary {
    background: var(--accent);
    color: var(--on-accent);
    border: 1.5px solid var(--accent);
    font-weight: 700;
  }

  .control-btn.primary.running {
    background: transparent;
    color: var(--ink);
  }

  .control-btn.outline {
    background: transparent;
    border: 1.5px solid var(--line-2);
    color: var(--ink);
  }

  .control-btn.text {
    background: transparent;
    border: 0;
    color: var(--ink-62);
  }

  .parts-list {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .list-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-55);
    margin-bottom: 4px;
  }

  .part-item {
    display: flex;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: var(--canvas);
    align-items: flex-start;
  }

  .part-item.done {
    opacity: 0.7;
  }

  .tick-box {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border: 1.5px solid var(--line-2);
    background: transparent;
    color: var(--canvas);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    cursor: pointer;
    margin-top: 2px;
    flex: 0 0 20px;
  }

  .tick-box.checked {
    background: var(--ink);
    border-color: var(--ink);
  }

  .part-name {
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
  }

  .part-purpose {
    font-size: 12px;
    color: var(--ink-72);
    margin-top: 2px;
  }

  @media (max-width: 860px) {
    .focus-body {
      flex-direction: column;
    }
    .focus-rail {
      width: 100%;
      flex: none;
    }
    .reference-slot {
      min-height: 260px;
    }
  }
</style>
