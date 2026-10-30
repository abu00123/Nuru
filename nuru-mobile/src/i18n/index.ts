import {useSyncExternalStore} from 'react';
import {translate, validLanguage, type Language} from './core';
export {languages, localizeArticle} from './core';
let language: Language = 'en';
const listeners = new Set<() => void>();
export const currentLanguage = () => language;
export const t = (text: string | null | undefined) => translate(text ?? '', language);
export function setLanguage(next: Language) { if (!validLanguage(next)) return; language = next; save(next); listeners.forEach(fn => fn()); }
export function useLanguage() { return useSyncExternalStore(fn=>{listeners.add(fn); return ()=>{listeners.delete(fn)}}, currentLanguage, ()=> 'en' as Language); }

import AsyncStorage from '@react-native-async-storage/async-storage';
let changed = false;
function save(next: Language) { changed = true; void AsyncStorage.setItem('nuru.language',next).catch(()=>{}); }
void AsyncStorage.getItem('nuru.language').then(value=>{if(!changed && validLanguage(value)) {language=value; listeners.forEach(fn=>fn());}}).catch(()=>{});
