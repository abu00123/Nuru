import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { createSavedStore } from './core';
export const savedStore = createSavedStore(AsyncStorage);
void savedStore.load();
export const useSaved = () => useSyncExternalStore(savedStore.subscribe, savedStore.getSnapshot);
