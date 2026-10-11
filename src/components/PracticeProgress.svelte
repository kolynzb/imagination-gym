<script lang="ts">
  import { state } from '../lib/store';
  import { practiceProgress, LEVEL_XP } from '../lib/practiceProgress';
  $: progress = practiceProgress($state.done);
</script>
<div class="practice-progress" aria-label="Practice progression">
  <div><strong>Practice level {progress.level}</strong><span>{progress.withinLevel} / {LEVEL_XP} XP</span></div>
  <progress max={LEVEL_XP} value={progress.withinLevel} aria-label="XP toward next practice level"></progress>
  <small>{progress.xp} XP total · 20 per completed part</small>
</div>
<style>
.practice-progress{width:260px;max-width:100%;font-size:14px}.practice-progress>div{display:flex;justify-content:space-between;gap:16px}progress{appearance:none;width:100%;height:10px;border:1px solid var(--ink);border-radius:12px;overflow:hidden;margin:8px 0 2px}progress::-webkit-progress-bar{background:var(--card)}progress::-webkit-progress-value{background:var(--accent)}progress::-moz-progress-bar{background:var(--accent)}small{color:var(--ink-62);font-size:12px}
</style>
