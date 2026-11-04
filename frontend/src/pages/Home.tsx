import { t, useLanguage } from '../i18n';
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
  useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data));
  }, []);

  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <div style={styles.heroText}>
          <h1 style={styles.heading}>{t("Reliable information for people")}<br />{t("considering voluntary return.")}</h1>
          <p style={styles.sub}>{t("Search verified information about safety, documents, housing, and more.")}</p>
          <SearchBar onSearch={q => { if (q) navigate(`/explore?search=${q}`); }} />
        </div>
        <img src="/landing-hero.png" alt="People" style={styles.heroImage} />
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>{t("Explore Information")}</h2>
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
  main: { minHeight: '80vh', backgroundColor: '#f0f7ff' },
  hero: { backgroundColor: '#1a6fa8', color: '#fff', padding: '3rem 2rem', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' },
  heroText: { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 480, flex: 1 },
  heading: { fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, margin: 0, lineHeight: 1.3 },
  sub: { color: '#d0e8f8', fontSize: '1rem', margin: 0 },
  heroImage: { width: 320, maxWidth: '100%', borderRadius: 12, objectFit: 'cover', flexShrink: 0 },
  section: { maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' },
  sectionTitle: { fontSize: '1.3rem', fontWeight: 700, color: '#1a6fa8', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' },
};
