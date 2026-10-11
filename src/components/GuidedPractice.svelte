<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { state, actions, cloudStatus, savePending } from '../lib/store';
  import { WEEKS } from '../lib/curriculum';
  import { practiceProgress, PART_XP } from '../lib/practiceProgress';
  import PracticeProgress from './PracticeProgress.svelte';
  import PracticeVideos from './PracticeVideos.svelte';
  import PracticePencil from './PracticePencil.svelte';
  import Timer from './Timer.svelte';
  let dialog: HTMLDivElement;
  let scene: 'practice' | 'reward' | 'finish' = 'practice';
  let rewardPart = 0;
  let gained = 0;
  let leveledUp = false;
  let busy = false;
  $: week = WEEKS[$state.cw - 1];
  $: day = week.days[$state.cd - 1];
  $: partIndex = $state.timerPartIndex;
  $: part = day.parts[partIndex];
  $: dayKey = `w${$state.cw}d${$state.cd}`;
  $: completed = day.parts.filter((_, i) => $state.done[`${dayKey}p${i}`]).length;
  $: progress = practiceProgress($state.done);
  onMount(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.querySelector<HTMLButtonElement>('button')?.focus();
    return () => previous?.focus();
  });
  async function focusMain() { await tick(); dialog.querySelector<HTMLElement>('main')?.focus(); dialog.scrollTop = 0; }
  function pause() { if ($state.timerRunning) actions.toggleTimer(); actions.logTimerElapsed($state.cw, $state.cd); }
  function close() { pause(); actions.setFocus(false); }
  async function finish() { pause(); scene = 'finish'; await focusMain(); }
  async function complete() {
    if (busy) return;
    busy = true;
    const before = practiceProgress($state.done);
    rewardPart = partIndex;
    pause();
    actions.setPartDone($state.cw, $state.cd, partIndex, true);
    const after = practiceProgress($state.done);
    gained = after.xp - before.xp;
    leveledUp = after.level > before.level;
    scene = 'reward';
    busy = false;
    await focusMain();
  }
  async function choosePart(index: number) {
    if (index === partIndex) return;
    pause();
    actions.selectTimerPart(index, day.parts[index].m);
    await focusMain();
  }
  async function advance() {
    const next = day.parts.findIndex((_, i) => !$state.done[`${dayKey}p${i}`]);
    if (next < 0) { await finish(); return; }
    if (next !== partIndex) actions.selectTimerPart(next, day.parts[next].m);
    scene = 'practice'; await focusMain();
  }
  function keyboard(event: KeyboardEvent) {
    if (event.key === 'Escape') close();
    if (scene === 'practice' && event.code === 'Space' && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && event.target instanceof HTMLElement && !event.target.closest('button,input,textarea,select,a,summary,iframe') && !event.target.isContentEditable) { event.preventDefault(); actions.toggleTimer(); }
    if (event.key !== 'Tab') return;
    const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],textarea,input,iframe,summary,[tabindex="0"]')).filter(el => el.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
</script>
<svelte:window onkeydown={keyboard} />
<div bind:this={dialog} class="guided-practice" role="dialog" aria-modal="true" aria-label="Guided practice">
  <header><button type="button" onclick={close}>← Today</button><PracticeProgress /></header>
  <main tabindex="-1">
    {#if $cloudStatus.status === 'error'}<p role="alert">{$cloudStatus.message} <button type="button" onclick={() => actions.syncToCloud()}>Retry save</button></p>{/if}
    <p class="save-status" role="status">{$cloudStatus.status === 'error' ? 'Progress is waiting to save.' : $savePending ? 'Saving your progress…' : $cloudStatus.status === 'synced' ? 'Progress saved' : ''}</p>
    {#if scene === 'practice'}
      <p class="context">Week {$state.cw} / Day {$state.cd} · Part {part.k} · {completed} of {day.parts.length} complete</p>
      <h1>{part.p}</h1>
      <div class="practice-layout">
        <section aria-label="Instruction">
          {#key `${dayKey}p${partIndex}`}<PracticeVideos week={$state.cw} day={$state.cd} part={partIndex} />{/key}
          <div class="drawing-brief"><span class="brief-label">On your page</span><p class="cue">{part.d}</p></div>
        </section>
        <aside>
          <nav class="session-path" aria-label="Session parts">
            <div class="path-heading"><h2>Your session</h2><span>{completed}/{day.parts.length}</span></div>
            <ol>{#each day.parts as item, i}
              {@const done = !!$state.done[`${dayKey}p${i}`]}
              <li><button type="button" class:current={i === partIndex} class:done aria-current={i === partIndex ? 'step' : undefined} onclick={() => choosePart(i)}>
                <span class="step-number" aria-hidden="true">{done ? '✓' : String(i + 1).padStart(2, '0')}</span>
                <span class="step-copy"><strong>{item.p}</strong><small>{item.m ? `${item.m} min` : 'At your pace'} · {done ? 'Completed' : i === partIndex ? 'In practice' : `+${PART_XP} XP`}</small></span>
              </button></li>
            {/each}</ol>
          </nav>
          <details class="practice-references"><summary>Keep these nearby <span>{week.links.length} resources</span></summary>
            <p>{week.book}</p><p>{week.han}</p>
            <ul>{#each week.links as link}<li><a href={link.u} target="_blank" rel="noreferrer">{link.l} ↗</a></li>{/each}</ul>
          </details>
          <details class="optional-timer"><summary>Practice timer (optional)</summary><Timer plannedMins={part.m} showFocus={false} embedded /></details><p class="context">Complete the part after practising on paper. Watching the video alone doesn’t earn XP.</p></aside>
      </div>
      <div class="actions"><button class="primary" type="button" disabled={busy} onclick={complete}>{$state.done[`${dayKey}p${partIndex}`] ? 'Review completed part' : `Complete part · +${PART_XP} XP`}</button><button type="button" onclick={finish}>Finish for now</button></div>
    {:else if scene === 'reward'}
      <section class="reward" aria-label="Practice complete">
        <PracticePencil />
        <p class="context">Part {day.parts[rewardPart].k} · {day.parts[rewardPart].t}</p>
        <h1>{gained ? 'Another part practised.' : 'Practice already counted.'}</h1>
        <p>Keep the attempt. Notice one thing to try differently next time.</p>
        <div class="xp" aria-live="polite">+{gained} XP</div>
        {#if leveledUp}<p class="stamp">Level {progress.level}. A new mark.</p>{/if}
        <div class="progress-wrap"><PracticeProgress /></div>
        <p class="context">Practice levels recognise participation. Every lesson stays available.</p>
        <div class="actions"><button class="primary" type="button" onclick={advance}>{completed === day.parts.length ? 'Review session' : 'Next part'}</button><button type="button" onclick={finish}>Finish for now</button></div>
      </section>
    {:else}
      <section class="reflection">
        <p class="context">Week {$state.cw} / Day {$state.cd} · {completed} of {day.parts.length} parts complete</p>
        <h1>{completed === day.parts.length ? 'A page well spent.' : 'Pick up here next time.'}</h1>
        <p>Your completed parts count, even when you finish early.</p>
        <label for="practice-note">One thing you noticed (optional)</label>
        <textarea id="practice-note" rows="4" placeholder="Next time, I want to try…" value={$state.dayNotes[dayKey] || ''} oninput={e => actions.setDayNote($state.cw, $state.cd, e.currentTarget.value)}></textarea>
        <p class="context">{progress.sessions} complete sessions · {progress.parts} parts practised</p>
        <div class="actions"><button class="primary" type="button" onclick={close}>Back to Today</button>{#if completed < day.parts.length}<button type="button" onclick={advance}>Continue practice</button>{/if}</div>
      </section>
    {/if}
  </main>
</div>
<style>
.session-path{border-top:3px solid var(--ink);padding-top:16px}.path-heading{display:flex;align-items:center;justify-content:space-between}.path-heading h2{font-size:18px;margin:0}.path-heading>span{font-size:13px;color:var(--ink-62)}.session-path ol{list-style:none;padding:0;margin:16px 0 24px}.session-path li+li{margin-top:6px}.session-path button{width:100%;display:flex;text-align:left;align-items:center;gap:12px;padding:14px 10px;background:transparent;border-color:transparent}.session-path button.current{background:var(--sulfur);color:#070607;border-color:var(--ink)}.step-number{display:grid;place-items:center;flex-shrink:0;width:32px;height:32px;border:1px solid currentColor;border-radius:50%;font-size:12px}.done .step-number{background:var(--ink);color:var(--canvas)}.step-copy strong{display:block;font-size:14px;line-height:1.4}.step-copy small{display:block;font-size:12px;margin-top:4px}.practice-references{border-block:1px solid var(--line);padding:8px 0}.practice-references summary span{display:block;font-size:12px;color:var(--ink-62);font-weight:400}.practice-references p{font-size:13px;line-height:1.6}.practice-references ul{list-style:none;padding:0}.practice-references a{display:block;padding:10px 0;font-size:13px;line-height:1.5;color:var(--accent-ink)}.drawing-brief{margin-top:24px;padding-top:20px;border-top:1px solid var(--line)}.brief-label{font-size:12px;text-transform:uppercase;letter-spacing:.1em;font-weight:700}.drawing-brief .cue{margin-top:8px}

.guided-practice{position:fixed;inset:0;z-index:121;overflow-y:auto;background:var(--canvas);color:var(--ink);padding:28px max(24px,calc((100vw - 1120px)/2))}header{display:flex;justify-content:space-between;align-items:center;gap:24px;padding-bottom:24px;border-bottom:1px solid var(--line)}main{padding:24px 0 50px;outline:none}h1{font-family:var(--font-display);font-size:clamp(36px,5vw,64px);line-height:1.05;margin:12px 0 28px}.context,.save-status{font-size:14px;color:var(--ink-62)}.save-status:empty{display:none}.practice-layout{display:grid;grid-template-columns:minmax(0,2fr) minmax(260px,1fr);gap:32px}summary{cursor:pointer;min-height:44px;padding:12px 0;font-weight:600}summary:focus-visible{outline:3px solid var(--accent);outline-offset:3px}.cue{font-size:17px;line-height:1.7;max-width:65ch}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}button{font:inherit;cursor:pointer;min-height:44px;padding:12px 18px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--ink)}button:disabled{opacity:.5;cursor:default}.primary{background:var(--accent);color:var(--on-accent);border:2px solid var(--ink);box-shadow:0 4px 0 var(--ink);font-weight:700;transition:transform 140ms ease,box-shadow 140ms ease}.primary:active{transform:translateY(3px);box-shadow:0 1px 0 var(--ink)}button:focus-visible,textarea:focus-visible{outline:3px solid var(--accent);outline-offset:4px}.reward,.reflection{max-width:700px;margin:auto}.reward{text-align:center;border:1px solid var(--line);border-radius:24px;padding:32px;background:var(--card)}.reward .actions{justify-content:center}.reward h1{font-size:48px}.xp{font:64px var(--font-display);margin:24px 0}.progress-wrap{display:flex;justify-content:center;margin:24px 0}.stamp{display:inline-block;padding:10px 18px;background:var(--sulfur);color:#070607;border:2px solid currentColor;border-radius:12px;transform:rotate(-4deg);animation:stamp-in 280ms ease-out}.reflection label{display:block;margin-top:28px;font-weight:600}textarea{width:100%;font:inherit;background:var(--card);color:var(--ink);padding:16px;border:1px solid var(--line);border-radius:12px;margin-top:10px;resize:vertical}@keyframes stamp-in{from{opacity:0;transform:scale(1.15) rotate(4deg)}to{opacity:1;transform:rotate(-4deg)}}@media(max-width:760px){.guided-practice{padding:20px}.practice-layout{grid-template-columns:1fr}header{flex-wrap:wrap;gap:16px}.reward{padding:24px 16px}.reward h1{font-size:38px}.actions button{flex:1}}@media(prefers-reduced-motion:reduce){.stamp{animation:none}.primary{transition:none}.primary:active{transform:none}}
</style>
