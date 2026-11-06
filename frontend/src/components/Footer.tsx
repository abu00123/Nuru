import { useLanguage } from '../i18n';
export default function Footer() {
  useLanguage();
  return (
    <footer style={styles.footer}>

    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: { backgroundColor: '#1a6fa8', color: '#d0e8f8', textAlign: 'center', padding: '0.75rem', marginTop: 'auto' },

};
