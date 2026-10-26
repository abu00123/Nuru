import ArticleActions from '../components/ArticleActions';
import StepGuide from '../components/StepGuide';
import {localizeArticle,currentLanguage} from '../i18n';
import { t, useLanguage } from '../i18n';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { InformationEntry } from '../types/information';
import { getInformationById } from '../services/informationService';
import StatusBadge from '../components/StatusBadge';

export default function InformationDetail() {
  useLanguage();
  const { id } = useParams<{ id: string }>();
  const [originalEntry, setEntry] = useState<InformationEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setEntry(null);
    if (id) {
      getInformationById(Number(id))
        .then(r => { if (active) setEntry(r.data.is_published ? r.data : null); })
        .catch(() => { if (active) setEntry(null); })
        .finally(() => { if (active) setLoading(false); });
    } else setLoading(false);
    return () => { active = false; };
  }, [id]);

  if (loading) return <p style={styles.state}>{t("Loading...")}</p>;
  const entry = originalEntry ? localizeArticle(originalEntry,currentLanguage()) : null;
  if (!entry) return <p style={styles.state}>{t("Information not found.")}</p>;

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <Link to="/explore" style={styles.back}>{t("← Back to Explore")}</Link>

        <div style={styles.header}>
          <div style={styles.meta}>
            <span style={styles.category}>{t(entry.category_name)}</span>
            <span style={styles.destination}>{entry.destination_name}</span>
          </div>
          <h1 style={styles.title}>{entry.title}</h1>
          <ArticleActions entry={entry} />
          <div style={styles.badges}>
            <StatusBadge status={entry.verification_status} />
            {entry.last_verified && (
              <span style={styles.date}>{t("Last checked:")}{' '}{new Date(entry.last_verified).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            )}
          </div>
        </div>

        {entry.translationFallback && <p role="note">{t('This article is shown in English because a reviewed translation is not available.')}</p>}
<section style={styles.section}>
          <h2 style={styles.sectionTitle}>{t("Information")}</h2>
          <p style={styles.content}>{entry.content}</p>
        </section>

        <StepGuide entry={originalEntry!} />
        {entry.source_name && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>{t("Source")}</h2>
            <p style={styles.content}>
              {entry.source_url ? (
                <a href={entry.source_url} target="_blank" rel="noreferrer" style={styles.sourceLink}>{entry.source_name}</a>
              ) : entry.source_name}
            </p>
          </section>
        )}

        <Link to={`/report/${entry.id}`} style={styles.reportBtn}>{t("Report outdated information")}</Link>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { backgroundColor: '#f8faf9', minHeight: '80vh' },
  container: { maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' },
  state: { textAlign: 'center', padding: '3rem', color: '#64748b' },
  back: { color: '#1a3c2e', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem' },
  header: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '1.5rem', marginBottom: '1.5rem' },
  meta: { display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' },
  category: { fontSize: '0.8rem', fontWeight: 700, color: '#1a3c2e', textTransform: 'uppercase' },
  destination: { fontSize: '0.8rem', color: '#64748b' },
  title: { fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', margin: '0 0 1rem' },
  badges: { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  date: { fontSize: '0.85rem', color: '#94a3b8' },
  section: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '1.5rem', marginBottom: '1rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#1a3c2e', marginBottom: '0.75rem' },
  content: { color: '#475569', lineHeight: 1.7, margin: 0 },
  sourceLink: { color: '#1a3c2e', fontWeight: 600 },
  reportBtn: { display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1.5rem', border: '1px solid #e2e8f0', borderRadius: 6, color: '#b45309', textDecoration: 'none', fontSize: '0.9rem', backgroundColor: '#fff' },
};
