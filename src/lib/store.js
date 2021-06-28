import { writable } from 'svelte/store';

// ======================================================
// Shared state across components & pages
// ======================================================

// reference to refresh JWT in background for active sessions
export const touchTime = writable(null);
// reference to persist 'email update pending' UI during current session
export const emailUpdatePending = writable(false);
