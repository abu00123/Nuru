import { t, useLanguage } from '../i18n';
export default function Footer() {
  useLanguage();
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>© {new Date().getFullYear()} {t("Nuru — Reliable information for people considering voluntary return.")}</p>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: { backgroundColor: '#1a6fa8', color: '#d0e8f8', textAlign: 'center', padding: '0.75rem', marginTop: 'auto' },
  text: { margin: 0, fontSize: '0.8rem' },
};
