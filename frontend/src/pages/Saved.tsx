import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInformationById } from '../services/informationService';
import InformationCard from '../components/InformationCard';
import type { InformationEntry } from '../types/information';
import { savedStore, useSaved } from '../features/saved';
import { t, useLanguage } from '../i18n';
import { loadSavedArticles } from '../features/core';
export default function Saved() {
  useLanguage();
  const saved = useSaved();
  const [entries, setEntries] = useState<InformationEntry[]>([]);
  const [unavailable, setUnavailable] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    if (!saved.ready) return;
    setLoading(true); setEntries([]); setUnavailable([]);
    void loadSavedArticles(saved.ids, id => getInformationById(id), () => active).then(results => {
      if (!active) return;
      const visible: InformationEntry[] = [], missing: number[] = [];
      results.forEach((result, index) => { if (result.status === 'fulfilled' && result.value.data.is_published) visible.push(result.value.data); else missing.push(saved.ids[index]); });
      setEntries(visible); setUnavailable(missing); setLoading(false);
    });
    return () => { active = false; };
  }, [saved.ids, saved.ready, revision]);
  return <main style={{ width: '100%', maxWidth: 850, boxSizing: 'border-box', margin: '0 auto', padding: '2rem 1.5rem' }}>
    <h1>{t('Saved articles')}</h1><p>{t('Saved on this device. An internet connection is needed to open articles.')}</p>
    {!!saved.error && <p role="alert">{t(saved.error)}</p>}
    {!saved.ready ? <button disabled={saved.busy} onClick={() => void savedStore.load()}>{t(saved.busy ? 'Loading...' : 'Try again')}</button> : loading ? <p role="status">{t('Loading...')}</p> : <>
      {!saved.ids.length && <><p>{t('No saved articles yet.')}</p><Link to="/explore">{t('Explore information')}</Link></>}
      {entries.map(entry => <InformationCard key={entry.id} entry={entry} />)}
      {!!unavailable.length && <section><p role="status">{t('Some saved articles could not be loaded. They may be unpublished or your connection may be unavailable.')}</p><button onClick={() => setRevision(x => x + 1)}>{t('Try again')}</button>{unavailable.map((id, index) => <p key={id}>{t('Unavailable article')} {index + 1} <button disabled={saved.busy} onClick={() => void savedStore.toggle(id)}>{t('Remove from saved')}</button></p>)}</section>}
    </>}
  </main>;
}
