export default function Footer() {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>© {new Date().getFullYear()} Nuru — Reliable information for people considering voluntary return.</p>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: { backgroundColor: '#1a3c2e', color: '#cde8d8', textAlign: 'center', padding: '1.5rem', marginTop: 'auto' },
  text: { margin: 0, fontSize: '0.85rem' },
};
