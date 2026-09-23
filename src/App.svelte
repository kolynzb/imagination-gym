<script lang="ts">
  import { state, actions, cloudStatus, savePending } from './lib/store';
  import Navigation from './components/Navigation.svelte';
  import TodayView from './components/TodayView.svelte';
  import WeekView from './components/WeekView.svelte';
  import RoadmapView from './components/RoadmapView.svelte';
  import ExercisesView from './components/ExercisesView.svelte';
  import VaultView from './components/VaultView.svelte';
  import ProgressView from './components/ProgressView.svelte';
  import CrewView from './components/CrewView.svelte';
  import MethodView from './components/MethodView.svelte';
  import ExerciseDrawer from './components/ExerciseDrawer.svelte';
  import FocusMode from './components/FocusMode.svelte';
  import OnboardingModal from './components/OnboardingModal.svelte';
  import SignInModal from './components/SignInModal.svelte';

  let s = $state;
  $: s = $state;

  function handleKeydown(e: KeyboardEvent) {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const isTyping = target.matches('input, textarea, select') || target.isContentEditable;

    // Dialogs and focus mode own their keyboard interactions.
    if (!s.isSignedIn || s.focus || s.onboardingOpen || s.authModalOpen || s.activeExerciseDrawer) return;
    if (isTyping || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;

    // Spacebar toggles timer
    if (e.code === 'Space' && target.tagName !== 'BUTTON') {
      e.preventDefault();
      actions.toggleTimer();
      return;
    }

    // Number keys 1-9 toggle parts in Today view
    if (s.view === 'today' && /^[1-9]$/.test(e.key)) {
      const partIdx = Number(e.key) - 1;
      actions.togglePart(s.cw, s.cd, partIdx);
    }
  }
  function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (!$savePending) return;
    event.preventDefault();
    event.returnValue = '';
  }
</script>

<svelte:window onkeydown={handleKeydown} onbeforeunload={handleBeforeUnload} />

<div class="app-layout">
  {#if s.isSignedIn}
  <Navigation />

  <main class="main-content">
    {#if $cloudStatus.status === 'error'}
      <div class="sync-notice" role="alert">
        {$cloudStatus.message}
        <button type="button" onclick={() => actions.syncToCloud()}>Retry save</button>
      </div>
    {/if}
    {#key s.view}
      <div class="view-enter">
        {#if s.view === 'today'}
          <TodayView />
        {:else if s.view === 'week'}
          <WeekView />
        {:else if s.view === 'roadmap'}
          <RoadmapView />
        {:else if s.view === 'exercises'}
          <ExercisesView />
        {:else if s.view === 'vault'}
          <VaultView />
        {:else if s.view === 'progress'}
          <ProgressView />
        {:else if s.view === 'crew'}
          <CrewView />
        {:else if s.view === 'method'}
          <MethodView />
        {/if}
      </div>
    {/key}
  </main>

  <!-- Global Slide-Over Exercise Drawer -->
  <ExerciseDrawer />

  <!-- Fullscreen Distraction-Free Focus Mode -->
  {#if s.focus}
    <FocusMode />
  {/if}

  <!-- Global 3-Step Course Onboarding Modal -->
  <OnboardingModal />
  {/if}

  <!-- Global Artist Profile & Cloud Sync Modal -->
  <SignInModal />
</div>

<style>
  .app-layout {
    display: flex;
    min-height: 100dvh;
    background: var(--canvas);
  }

  .sync-notice {
    padding: 16px 24px;
    border-bottom: 1px solid var(--line);
    color: var(--ink);
    background: var(--card);
  }

  .main-content {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
  }

  @media (max-width: 860px) {
    .main-content {
      padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px));
    }
  }
</style>
