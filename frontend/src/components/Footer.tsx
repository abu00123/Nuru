import { t, useLanguage } from '../i18n';
export default function Footer() {
  useLanguage();
  return (
    <footer style={styles.footer}>

    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: { backgroundColor: '#1a6fa8', color: '#d0e8f8', textAlign: 'center', padding: '0.75rem', marginTop: 'auto' },
  text: { margin: 0, fontSize: '0.8rem' },
};
