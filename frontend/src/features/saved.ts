import { useSyncExternalStore } from 'react';
import { createSavedStore, SAVED_KEY } from './core';
export const savedStore = createSavedStore({
  getItem: async key => localStorage.getItem(key),
  setItem: async (key, value) => { localStorage.setItem(key, value); },
});
void savedStore.load();
window.addEventListener('storage', event => { if (event.key === SAVED_KEY || event.key === null) void savedStore.load(); });
export const useSaved = () => useSyncExternalStore(savedStore.subscribe, savedStore.getSnapshot);
