<script lang="ts">
  import { onMount } from 'svelte';
  import { actions, progressConflicts } from '../lib/store';
  let heading: HTMLHeadingElement;

  onMount(() => { heading?.focus(); });

  function trapFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    const controls = Array.from((event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('button'));
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === heading)) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first?.focus();
    }
  }

  function label(path: string) {
    if (path === 'session') return 'Practice timer, selected day and logged hours';
    const [field, key] = path.split('.');
    const names: Record<string, string> = { dayNotes: 'Daily note', weekNotes: 'Weekly reflection', done: 'Exercise completion',
      ms: 'Milestone', counters: 'Practice count', kitChecked: 'Materials', start: 'Course start date',
      paceFlex: 'Flexible schedule', theme: 'Theme', onboarded: 'Course guide' };
    return `${names[field] || field}${key ? ` · ${key.replace(/w(\d+)d(\d+)/, 'Week $1, Day $2')}` : ''}`;
  }

  function display(value: unknown): string {
    if (value === undefined) return 'Not set';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'string') return value || '(empty)';
    if (value && typeof value === 'object' && 'cw' in value && 'cd' in value) {
      const session = value as { cw: number; cd: number; dayHours: Record<string, string>; timer?: { timerElapsed: number } };
      const hours = Object.entries(session.dayHours).sort(([a], [b]) => a.localeCompare(b))
        .map(([day, value]) => `${day.replace(/w(\d+)d(\d+)/, 'Week $1, Day $2')}: ${Number(value || 0).toFixed(2)} hours`).join('\n');
      return `Selected: Week ${session.cw}, Day ${session.cd}\n${hours || 'No hours logged'}\n${Math.round(session.timer?.timerElapsed || 0)} seconds in the saved timer`;
    }
    return String(value);
  }

  function downloadDrafts() {
    const blob = new Blob([JSON.stringify(actions.conflictDrafts(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'imagination-gym-unsaved-drafts.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
</script>

<div class="conflict-overlay">
  <div role="dialog" tabindex="-1" onkeydown={trapFocus} aria-modal="true" aria-labelledby="conflict-heading" class="conflict-dialog">
    <h1 id="conflict-heading" tabindex="-1" bind:this={heading}>Choose which changes to keep</h1>
    <p>Another device changed the same work. Your timer is paused. Other independent changes will be kept automatically.</p>
    <button type="button" onclick={downloadDrafts}>Download both versions before choosing</button>
    {#each $progressConflicts as conflict (conflict.path)}
      <article>
        <h2>{label(conflict.path)}</h2>
        <div class="versions">
          <div><h3>This tab</h3><pre>{display(conflict.local)}</pre>
            <button type="button" onclick={() => actions.resolveConflict(conflict.path, 'local')}>Keep this tab’s version</button></div>
          <div><h3>Saved on another device</h3><pre>{display(conflict.remote)}</pre>
            <button type="button" onclick={() => actions.resolveConflict(conflict.path, 'remote')}>Keep other device’s version</button></div>
        </div>
      </article>
    {/each}
    <p>Keep this tab open until all choices are saved.</p>
  </div>
</div>

<style>
  .conflict-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(7,6,7,.65); display: flex; align-items: center; justify-content: center; padding: 16px; }
  .conflict-dialog { width: min(800px, 100%); max-height: 90dvh; overflow: auto; padding: 28px; border: 1px solid var(--line); border-radius: var(--radius-panel); background: var(--canvas); color: var(--ink); }
  h1 { font-family: var(--font-display); font-size: 36px; line-height: 1.05; letter-spacing: .02em; margin: 0 0 10px; }
  h2 { font-family: var(--font-body); font-size: 18px; line-height: 1.35; margin: 0 0 14px; }
  h3 { font-family: var(--font-body); font-size: 15px; font-weight: 700; margin: 0 0 6px; }
  p { font-size: 15px; line-height: 1.55; margin: 12px 0 18px; color: var(--ink-78); }
  article { border-top: 1px solid var(--line); margin-top: 24px; padding-top: 20px; }
  .versions { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .versions > div { min-width: 0; border: 1px solid var(--line); border-radius: 16px; padding: 16px; background: var(--card); }
  pre { font: inherit; font-size: 14px; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; max-height: 220px; overflow: auto; margin: 0 0 14px; padding: 8px 0 8px 12px; border-left: 2px solid var(--line-2); background: transparent; }
  button { font: inherit; min-height: 44px; border: 1px solid var(--line-2); border-radius: var(--radius-pill); padding: 9px 16px; background: var(--canvas); color: var(--ink); cursor: pointer; }
  .conflict-dialog > button { border-color: var(--accent); background: var(--accent); color: var(--on-accent); font-weight: 700; }
  .versions button { width: 100%; }
  button:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  @media(max-width: 600px) { .conflict-dialog { padding: 22px 18px; } .versions { grid-template-columns: 1fr; } }
</style>
