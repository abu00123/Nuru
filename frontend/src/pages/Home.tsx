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
        <div style={styles.heroBg} />
        <div style={styles.heroText}>
          <h1 style={styles.heading}>{t("Know before you go.")}</h1>
          <p style={styles.sub}>{t("Verified information on safety, housing, healthcare and more — so you can return with confidence.")}</p>
          <SearchBar onSearch={q => { if (q) navigate(`/explore?search=${q}`); }} />
        </div>
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
  hero: { position: 'relative', color: '#fff', padding: '5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minHeight: 420, overflow: 'hidden' },
  heroBg: { position: 'absolute', inset: 0, backgroundImage: 'url(/landing-hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center right', filter: 'blur(2px) brightness(0.75)', transform: 'scale(1.04)' } as React.CSSProperties,
  heroText: { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 520, background: 'linear-gradient(to right, rgba(26,111,168,0.92) 60%, rgba(26,111,168,0) 100%)', padding: '2rem 3rem 2rem 2rem', borderRadius: 8 },
  heading: { fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, margin: 0, lineHeight: 1.3 },
  sub: { color: '#d0e8f8', fontSize: '1rem', margin: 0 },
  section: { maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' },
  sectionTitle: { fontSize: '1.3rem', fontWeight: 700, color: '#1a6fa8', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' },
};
