export interface Guide {
  eligibility?: string;
  documents?: string[];
  steps?: { title: string; description: string }[];
  contacts?: { name: string; phone?: string; email?: string; url?: string }[];
}
export type GuideTranslations = Partial<Record<'rn' | 'rw' | 'sw', { guide: Guide; reviewed: boolean }>>;
export function hasGuide(guide?: Guide): boolean {
  return !!(guide?.eligibility?.trim() || guide?.documents?.length || guide?.steps?.length || guide?.contacts?.length);
}
export function completeGuide(base: Guide, translation: Guide): boolean {
  return (!base.eligibility?.trim() || !!translation.eligibility?.trim()) &&
    ['documents', 'steps', 'contacts'].every(key => (translation[key as 'steps']?.length ?? 0) >= (base[key as 'steps']?.length ?? 0));
}
export function selectGuide(entry: {guide?: Guide; guide_translations?: GuideTranslations}, language: string) {
  const base = entry.guide ?? {};
  const translated = entry.guide_translations?.[language as keyof GuideTranslations];
  const ready = translated?.reviewed === true && completeGuide(base, translated.guide);
  return { guide: language !== 'en' && ready ? translated!.guide : base, fallback: language !== 'en' && hasGuide(base) && !ready };
}
export function safeHttpUrl(value?: string): string | null {
  try { const url = new URL(value ?? ''); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.toString() : null; } catch { return null; }
}
export function articleLink(base: string, id: number): string | null {
  const safe = safeHttpUrl(base);
  if (!safe || !Number.isSafeInteger(id) || id <= 0) return null;
  const url = new URL(safe);
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/information/${id}`;
  url.search = ''; url.hash = '';
  return url.toString();
}
export async function loadSavedArticles<T>(ids: readonly number[], fetchArticle: (id: number) => Promise<T>, active: () => boolean = () => true): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(ids.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(4, ids.length) }, async () => {
    while (next < ids.length && active()) {
      const index = next++;
      try { results[index] = { status: 'fulfilled', value: await fetchArticle(ids[index]) }; }
      catch (reason) { results[index] = { status: 'rejected', reason }; }
    }
  }));
  return results;
}
export const SAVED_KEY = 'nuru.saved-articles.v1';
export function parseSaved(raw: string | null): number[] {
  if (raw === null) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error('Invalid saved list');
  return [...new Set(data.filter((id): id is number => typeof id === 'number' && Number.isSafeInteger(id) && id > 0))].slice(0, 500);
}
interface Storage { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> }
export function createSavedStore(storage: Storage) {
  let snapshot: { ids: readonly number[]; ready: boolean; busy: boolean; error: string } = { ids: [], ready: false, busy: false, error: '' };
  const listeners = new Set<() => void>();
  function update(value: Partial<typeof snapshot>) { snapshot = { ...snapshot, ...value }; listeners.forEach(fn => fn()); }
  async function load() {
    if (snapshot.busy) return;
    update({ busy: true, error: '' });
    try { update({ ids: parseSaved(await storage.getItem(SAVED_KEY)), ready: true }); }
    catch { update({ ready: false, error: 'Unable to load saved articles.' }); }
    finally { update({ busy: false }); }
  }
  async function toggle(id: number) {
    if (!snapshot.ready || snapshot.busy || !Number.isSafeInteger(id) || id <= 0) return false;
    const removing = snapshot.ids.includes(id);
    if (!removing && snapshot.ids.length >= 500) { update({ error: 'Your saved list is full. Remove an article first.' }); return false; }
    const ids = removing ? snapshot.ids.filter(value => value !== id) : [id, ...snapshot.ids];
    update({ busy: true, error: '' });
    try { await storage.setItem(SAVED_KEY, JSON.stringify(ids)); update({ ids }); return true; }
    catch { update({ error: 'Unable to save this change. Please try again.' }); return false; }
    finally { update({ busy: false }); }
  }
  return { load, toggle, getSnapshot: () => snapshot, subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; } };
}
