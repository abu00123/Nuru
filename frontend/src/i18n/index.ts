import {useSyncExternalStore} from 'react';
import {translate, validLanguage, type Language} from './core';
export {languages, localizeArticle} from './core';
let language: Language = 'en';
const listeners = new Set<() => void>();
export const currentLanguage = () => language;
export const t = (text: string | null | undefined) => translate(text ?? '', language);
export function setLanguage(next: Language) { if (!validLanguage(next)) return; language = next; save(next); listeners.forEach(fn => fn()); }
export function useLanguage() { return useSyncExternalStore(fn=>{listeners.add(fn); return ()=>{listeners.delete(fn)}}, currentLanguage, ()=> 'en' as Language); }

function save(next: Language) { try { localStorage.setItem('nuru.language', next); } catch {} document.documentElement.lang = next; }
try { const stored = localStorage.getItem('nuru.language'); if (validLanguage(stored)) language = stored; document.documentElement.lang = language; } catch {}
window.addEventListener('storage', event => { if(event.key === 'nuru.language' && validLanguage(event.newValue)) { language = event.newValue; document.documentElement.lang = language; listeners.forEach(fn=>fn()); } });
