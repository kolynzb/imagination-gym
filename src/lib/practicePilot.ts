import { writable } from 'svelte/store';

// Presentation state survives closing the pilot during this app visit.
export const guidedPractice = writable(false);
export const practiceStage = writable(0);
