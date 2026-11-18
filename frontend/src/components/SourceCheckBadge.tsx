import { t, useLanguage } from '../i18n';

interface Props {
  // Date of the "suitable" source review for the entry's current content version, or null.
  lastVerified: string | null | undefined;
  status?: 'verified' | 'unverified' | 'outdated';
}

// The public label is derived from the version-linked source review, never from a manually
// set field. It says what was checked (the cited source), not that conditions were verified.
export default function SourceCheckBadge({ lastVerified, status }: Props) {
  useLanguage();
  const config = status === 'outdated'
    ? { label: t('Marked as outdated'), bg: '#fdecea', color: '#b91c1c' }
    : lastVerified
      ? { label: t('Source checked'), bg: '#e6f4ed', color: '#1a7a45' }
      : { label: t('Not yet source-checked'), bg: '#fff8e1', color: '#92400e' };
  return (
    <span style={{ backgroundColor: config.bg, color: config.color, padding: '0.2rem 0.6rem', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600 }}>
      {config.label}
    </span>
  );
}
