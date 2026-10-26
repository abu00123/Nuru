import { useState } from 'react';
import { savedStore, useSaved } from '../features/saved';
import { articleLink } from '../features/core';
import { shareArticle } from '../features/share';
import { t, useLanguage } from '../i18n';
export default function ArticleActions({ entry }: { entry: { id: number; title: string; summary: string } }) {
  useLanguage();
  const saved = useSaved();
  const [copyLink, setCopyLink] = useState('');
  const [notice, setNotice] = useState('');
  const [sharing, setSharing] = useState(false);
  const url = articleLink(window.location.origin, entry.id) ?? '';
  async function share() {
    setNotice(''); setCopyLink(''); setSharing(true);
    try {
      const result = await shareArticle({ title: entry.title, text: entry.summary, url }, {
        share: navigator.share?.bind(navigator),
        copy: navigator.clipboard?.writeText.bind(navigator.clipboard),
      });
      if (result === 'copied') setNotice('Link copied.');
      if (result === 'manual') setCopyLink(url);
    } finally { setSharing(false); }
  }
  const button = { padding: '0.75rem 1rem', minHeight: 44, border: '1px solid #1a3c2e', borderRadius: 8, color: '#1a3c2e', background: '#fff', cursor: 'pointer' };
  return <div style={{ margin: '1rem 0', display: 'grid', gap: 10 }}>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <button type="button" aria-pressed={saved.ids.includes(entry.id)} disabled={!saved.ready || saved.busy} onClick={() => void savedStore.toggle(entry.id)} style={button}>{t(saved.ids.includes(entry.id) ? 'Remove from saved' : 'Save article')}</button>
      <button type="button" disabled={sharing} onClick={() => void share()} style={button}>{t('Share article')}</button>
    </div>
    {!!saved.error && <p role="alert">{t(saved.error)}</p>}
    {!saved.ready && !saved.busy && <button type="button" onClick={() => void savedStore.load()}>{t('Try again')}</button>}
    {!!notice && <p role="status">{t(notice)}</p>}
    {!!copyLink && <label>{t('Copy this link')}<input aria-label={t('Article link')} value={copyLink} readOnly onFocus={e => e.currentTarget.select()} style={{ width: '100%', boxSizing: 'border-box', padding: 12 }} /></label>}
  </div>;
}
