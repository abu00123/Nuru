import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';
import { getCategories } from '../services/informationService';
import type { Category } from '../types/category';

const CATEGORY_ICONS: Record<string, string> = {
  Safety: '🛡️',
  Documents: '📄',
  Housing: '🏠',
  Healthcare: '🏥',
  Education: '📚',
  Livelihoods: '💼',
  Return: '🔄',
  Support: '🤝',
};

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data));
  }, []);

  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <h1 style={styles.heading}>Reliable information for people<br />considering voluntary return.</h1>
        <p style={styles.sub}>Search verified information about safety, documents, housing, and more.</p>
        <SearchBar onSearch={q => { if (q) navigate(`/explore?search=${q}`); }} />
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Explore Information</h2>
        <div style={styles.grid}>
          {categories.map(c => (
            <CategoryCard key={c.id} name={c.name} icon={CATEGORY_ICONS[c.name] ?? '📋'} />
          ))}
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: '80vh', backgroundColor: '#f8faf9' },
  hero: { backgroundColor: '#1a3c2e', color: '#fff', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' },
  heading: { fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, margin: 0, lineHeight: 1.3 },
  sub: { color: '#cde8d8', fontSize: '1rem', margin: 0 },
  section: { maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' },
  sectionTitle: { fontSize: '1.3rem', fontWeight: 700, color: '#1a3c2e', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' },
};
