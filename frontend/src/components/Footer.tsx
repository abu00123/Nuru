import { Link } from 'react-router-dom';
import { t, useLanguage } from '../i18n';

export default function Footer() {
  useLanguage();
  return (
    <footer style={styles.footer}>
      <nav aria-label={t('Footer')} style={styles.nav}>
        <Link to="/privacy" style={styles.link}>{t('Privacy and Terms')}</Link>
        <span aria-hidden="true">·</span>
        <span>{t('Nuru is a student research prototype. It does not give legal or protection advice.')}</span>
      </nav>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: { backgroundColor: '#1a6fa8', color: '#ffffff', textAlign: 'center', padding: '1rem', marginTop: 'auto', fontSize: '0.9rem' },
  nav: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' },
  link: { color: '#ffffff', fontWeight: 600 },
};
