<script lang="ts">
  import { state, actions, cloudStatus, progressConflicts } from '../lib/store';
  import { WEEKS } from '../lib/curriculum';
  import Icon from './Icon.svelte';

  let s = $state;
  $: s = $state;

  $: currentWeek = WEEKS[s.cw - 1];
  $: currentDay = currentWeek?.days[s.cd - 1];
  $: allPartsDone = !!currentDay?.parts.length && currentDay.parts.every((_, i) => !!s.done[`w${s.cw}d${s.cd}p${i}`]);

  let refImage: string | null = null;
  let referenceError = '';
  let isDraggingReference = false;
  const MAX_REFERENCE_BYTES = 10 * 1024 * 1024;

  function close() {
    actions.setFocus(false);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !s.activeExerciseDrawer) {
      close();
      return;
    }
    if (e.code !== 'Space' || e.repeat || e.ctrlKey || e.metaKey || e.altKey || s.activeExerciseDrawer) return;
    if (!(e.target instanceof HTMLElement)) return;
    const target = e.target;
    if (!target.isContentEditable && !target.closest('button, input, textarea, select, a, [role="checkbox"]')) {
      e.preventDefault();
      actions.toggleTimer();
    }
  }

  function selectPartInterval(index: number) {
    const part = currentDay?.parts[index];
    if (!part) return;
    actions.selectTimerPart(index, part.m);
  }

  function selectNextInterval() {
    if (!currentDay?.parts.length) return;
    selectPartInterval(Math.min(s.timerPartIndex + 1, currentDay.parts.length - 1));
  }

  function completeSession() {
    if (!currentDay) return;
    if (allPartsDone) {
      if (s.cw === 8 && s.cd === 7) actions.setView('progress');
      else actions.stepDay(1);
    } else {
      actions.setAllDayParts(s.cw, s.cd, true);
    }
  }

  function formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  $: displayTime =
    s.timerMode === 'countdown'
      ? formatTime(s.timerRemaining)
      : formatTime(s.timerElapsed);

  function processReferenceFile(file: File | undefined) {
    referenceError = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      referenceError = 'Choose an image file.';
      return;
    }
    if (file.size > MAX_REFERENCE_BYTES) {
      referenceError = 'Reference images must be 10 MB or smaller.';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      refImage = reader.result as string;
    };
    reader.onerror = () => {
      referenceError = 'That image could not be read.';
    };
    reader.readAsDataURL(file);
  }

  function handleFileSelect(e: Event) {
    processReferenceFile((e.target as HTMLInputElement).files?.[0]);
  }

  function handleReferenceDrop(e: DragEvent) {
    e.preventDefault();
    isDraggingReference = false;
    processReferenceFile(e.dataTransfer?.files?.[0]);
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

  <div class="focus-body" class:no-reference={!refImage}>
    <!-- Reference Drop Canvas -->
    <div class="reference-slot" class:empty={!refImage}>
      {#if refImage}
        <div class="img-wrapper">
          <img src={refImage} alt="Session Reference" />
          <button type="button" class="remove-img-btn" onclick={() => (refImage = null)}><Icon name="cancel" size={14} /></button>
        </div>
      {:else}
        <label
          class="drop-zone"
          class:dragging={isDraggingReference}
          ondragover={(e) => { e.preventDefault(); isDraggingReference = true; }}
          ondragleave={() => (isDraggingReference = false)}
          ondrop={handleReferenceDrop}
        >
          <input type="file" accept="image/*" onchange={handleFileSelect} />
          <span class="drop-icon"><Icon name="image" size={32} /></span>
          <span class="drop-label">Drop reference photo here, or click to upload</span>
          <span class="drop-sub">Prop reference / Pose / Anatomy target</span>
          {#if referenceError}<span class="drop-error" role="alert">{referenceError}</span>{/if}
        </label>
      {/if}
    </div>

    <!-- Timer & Checklist Rail -->
    <div class="focus-rail">
      {#if $cloudStatus.status === 'error' && !$progressConflicts.length}
        <div class="focus-sync-error" role="alert">
          <span>{$cloudStatus.message}</span>
          <button type="button" onclick={() => actions.syncToCloud()}>Retry save</button>
        </div>
      {/if}
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
        {#if currentDay?.parts.length}
          <div class="interval-controls">
            <label for="focus-interval">Timer interval</label>
            <select id="focus-interval" value={s.timerPartIndex} onchange={(e) => selectPartInterval(Number((e.target as HTMLSelectElement).value))}>
              {#each currentDay.parts as part, i}
                <option value={i}>Part {part.k} · {part.t} {part.m > 0 ? `(${part.m}m)` : '(Stopwatch)'}</option>
              {/each}
            </select>
            <button type="button" class="next-interval-btn" onclick={selectNextInterval} disabled={s.timerPartIndex >= currentDay.parts.length - 1}>
              Next part interval →
            </button>
          </div>
        {/if}
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
                role="checkbox"
                aria-checked={isDone}
                aria-label={`Part ${part.k}: ${part.t} complete`}
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
                <div class="part-instructions">{part.d}</div>
              </div>
            </div>
          {/each}
        {/if}
        {#if currentDay}
          <button type="button" class="complete-session-btn" class:all-done={allPartsDone} onclick={completeSession}>
            {#if allPartsDone}
              {s.cw === 8 && s.cd === 7 ? 'Review Your Progress →' : 'Go to Next Day →'}
            {:else}
              <Icon name="checkmark" size={14} /> Mark Session Complete
            {/if}
          </button>
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
    font-family: var(--font-display);
    font-size: 28px;
    letter-spacing: 0.02em;
    margin: 2px 0 0;
    color: var(--ink);
  }

  .exit-btn {
    appearance: none;
    border: 1.5px solid var(--line-2);
    background: transparent;
    border-radius: var(--radius-pill);
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

  .focus-body.no-reference .reference-slot {
    flex: 0 0 240px;
    height: 260px;
    align-self: center;
    order: 2;
  }

  .focus-body.no-reference .focus-rail {
    width: auto;
    flex: 1;
    order: 1;
  }

  .reference-slot {
    flex: 1;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius-panel);
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

  .drop-zone.dragging {
    outline: 2px solid var(--accent);
    outline-offset: -10px;
    background: var(--canvas);
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

  .drop-error {
    color: var(--danger);
    font-size: 13px;
    margin-top: 12px;
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
    border-radius: var(--radius-pill);
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
    border-radius: var(--radius-panel);
    padding: 22px;
  }

  .focus-sync-error {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid var(--line-2);
    border-radius: var(--radius-action);
    background: var(--sulfur-band);
    color: var(--ink);
    font-size: 13px;
    line-height: 1.45;
  }

  .focus-sync-error button {
    flex: 0 0 auto;
    border: 1px solid var(--ink);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--ink);
    padding: 6px 12px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .timer-clock {
    font-family: var(--font-display);
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

  .interval-controls {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 7px 10px;
    align-items: center;
    margin-top: 16px;
  }

  .interval-controls label {
    grid-column: 1 / -1;
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
  }

  .interval-controls select {
    min-width: 0;
    padding: 7px 9px;
    border: 1px solid var(--line-2);
    border-radius: 10px;
    background: var(--canvas);
    color: var(--ink);
    font: inherit;
    font-size: 12px;
  }

  .next-interval-btn {
    border: 0;
    background: transparent;
    color: var(--ink-72);
    font: inherit;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
  }

  .next-interval-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .control-btn {
    appearance: none;
    font-size: 13px;
    font-weight: 500;
    padding: 8px 14px;
    border-radius: var(--radius-pill);
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
    background: transparent;
    border: 0;
    border-radius: 0;
    padding: 2px 4px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .list-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 2px;
  }

  .part-item {
    display: flex;
    gap: 14px;
    padding: 13px 2px;
    border: 0;
    border-bottom: 1px solid var(--line);
    border-radius: 0;
    background: transparent;
    align-items: flex-start;
  }

  .part-item:last-of-type {
    border-bottom: 0;
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
    font-size: 14px;
    font-weight: 700;
    color: var(--ink);
  }

  .part-purpose {
    font-size: 13px;
    color: var(--ink-72);
    margin-top: 2px;
  }

  .part-instructions {
    font-size: 14px;
    line-height: 1.55;
    color: var(--ink-72);
    margin-top: 5px;
  }

  .complete-session-btn {
    appearance: none;
    width: 100%;
    margin-top: auto;
    border: 1.5px solid var(--accent);
    border-radius: var(--radius-pill);
    background: var(--accent);
    color: var(--on-accent);
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  .complete-session-btn.all-done {
    border-color: var(--ink);
    background: transparent;
    color: var(--ink);
  }

  @media (max-width: 860px) {
    .focus-body {
      flex-direction: column;
      overflow-y: auto;
    }
    .focus-rail {
      width: 100%;
      flex: none;
      order: 1;
      overflow-y: visible;
    }
    .focus-body.no-reference .focus-rail {
      width: 100%;
      flex: none;
      order: 1;
    }
    .reference-slot {
      min-height: 260px;
      order: 2;
    }
    .reference-slot.empty {
      height: 112px;
      min-height: 112px;
      flex: 0 0 112px;
    }
    .focus-body.no-reference .reference-slot.empty {
      height: 112px;
      align-self: stretch;
      order: 2;
    }
  }
</style>
