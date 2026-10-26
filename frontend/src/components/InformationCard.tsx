import ArticleActions from './ArticleActions';
import {localizeArticle,currentLanguage} from '../i18n';
import { t, useLanguage } from '../i18n';
import { Link } from 'react-router-dom';
import type { InformationEntry } from '../types/information';
import StatusBadge from './StatusBadge';

interface Props {
  entry: InformationEntry;
}

export default function InformationCard({ entry: originalEntry }: Props) {
  useLanguage();
  const entry = localizeArticle(originalEntry,currentLanguage());
  return (
    <div style={styles.card}>
      <div style={styles.meta}>
        <span style={styles.category}>{t(entry.category_name)}</span>
        <span style={styles.dot}>•</span>
        <span style={styles.destination}>{entry.destination_name}</span>
      </div>
      <h3 style={styles.title}>{entry.title}</h3>
      <p style={styles.summary}>{entry.summary}</p>{entry.translationFallback && <p role="note">{t('This article is shown in English because a reviewed translation is not available.')}</p>}
      <ArticleActions entry={entry} />
      <div style={styles.footer}>
        <StatusBadge status={entry.verification_status} />
        {entry.last_verified && (
          <span style={styles.date}>{t("Last checked:")}{' '}{new Date(entry.last_verified).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        )}
        <Link to={`/information/${entry.id}`} style={styles.link}>{t("View information →")}</Link>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '1.25rem', marginBottom: '1rem' },
  meta: { display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' },
  category: { fontSize: '0.8rem', color: '#1a3c2e', fontWeight: 600, textTransform: 'uppercase' },
  dot: { color: '#94a3b8' },
  destination: { fontSize: '0.8rem', color: '#64748b' },
  title: { margin: '0 0 0.5rem', fontSize: '1rem', color: '#1e293b' },
  summary: { margin: '0 0 1rem', fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 },
  footer: { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  date: { fontSize: '0.8rem', color: '#94a3b8' },
  link: { marginLeft: 'auto', color: '#1a3c2e', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' },
};
