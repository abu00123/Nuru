import { t, useLanguage } from '../i18n';
interface Props {
  status: 'verified' | 'unverified' | 'outdated';
}

export default function StatusBadge({ status }: Props) {
  useLanguage();
  const config = {
    verified: { label: t("Verified ✓"), bg: '#e6f4ed', color: '#1a7a45' },
    unverified: { label: t("Unverified"), bg: '#fff8e1', color: '#b45309' },
    outdated: { label: t("Outdated"), bg: '#fdecea', color: '#b91c1c' },
  };
  const { label, bg, color } = config[status];
  return (
    <span style={{ backgroundColor: bg, color, padding: '0.2rem 0.6rem', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600 }}>
      {t(label)}
    </span>
  );
}
