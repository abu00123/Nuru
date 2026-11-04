import { t, useLanguage } from '../i18n';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { InformationEntry } from '../types/information';
import type { Category } from '../types/category';
import type { Destination } from '../types/destination';
import { getInformation, getCategories, getDestinations } from '../services/informationService';
import InformationCard from '../components/InformationCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';

export default function Explore() {
  useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [entries, setEntries] = useState<InformationEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const destination = searchParams.get('destination') || '';

  useEffect(() => {
    getCategories().then(r => setCategories(r.data));
    getDestinations().then(r => setDestinations(r.data));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getInformation({ search, category, destination })
      .then(r => { if (active) setEntries(r.data.filter(entry => entry.is_published)); })
      .catch(() => {
        if (active) {
          setEntries([]);
          setError('Unable to load information. Please try again shortly.');
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, category, destination]);

  const updateParam = (key: string, value: string) => {
    const params = Object.fromEntries(searchParams.entries());
    if (value) params[key] = value; else delete params[key];
    setSearchParams(params, { replace: true });
  };

  const images = ['/hero-1.jpg', '/hero-2.jpg', '/hero-3.jpg', '/hero-4.jpg'];
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setHeroIndex(i => (i + 1) % images.length), 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={styles.main}>
      <div style={{ ...styles.hero, backgroundImage: `url(${images[heroIndex]})` }}>
        <div style={styles.heroOverlay}>
          <h1 style={styles.heroTitle}>{t("Reliable information for informed decisions")}</h1>
          <p style={styles.heroCopy}>{t("Source-verified guidance for people considering voluntary return.")}</p>
        </div>
        <div style={styles.heroDots}>
          {images.map((_, i) => (
            <button key={i} onClick={() => setHeroIndex(i)} style={{ ...styles.dot, opacity: i === heroIndex ? 1 : 0.4 }} aria-label={`Image ${i + 1}`} />
          ))}
        </div>
      </div>
      <div style={styles.container}>
        <h2 style={styles.title}>{t("Explore Information")}</h2>
        <div style={styles.controls}>
          <SearchBar onSearch={q => updateParam('search', q)} placeholder={t("Search...")} initialValue={search} />
          <FilterBar
            categories={categories}
            destinations={destinations}
            selectedCategory={category}
            selectedDestination={destination}
            onCategoryChange={v => updateParam('category', v)}
            onDestinationChange={v => updateParam('destination', v)}
          />
        </div>
        {loading ? (
          <p style={styles.state}>{t("Loading...")}</p>
        ) : error ? (
          <p role="alert" style={styles.state}>{error}</p>
        ) : entries.length === 0 ? (
          <p style={styles.state}>{t("No information found.")}</p>
        ) : (
          entries.map(e => <InformationCard key={e.id} entry={e} />)
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { backgroundColor: '#f8faf9', minHeight: '80vh' },
  hero: { position: 'relative', height: 340, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'background-image 0.8s ease' },
  heroOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(20,80,140,0.55)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 3rem', gap: '0.75rem' },
  heroTitle: { color: '#fff', fontSize: '2rem', fontWeight: 700, margin: 0, maxWidth: 600 },
  heroCopy: { color: '#d4ede0', fontSize: '1.05rem', margin: 0, maxWidth: 500 },
  heroDots: { position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: '50%', backgroundColor: '#fff', border: 'none', cursor: 'pointer', padding: 0 },
  container: { maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1a6fa8', marginBottom: '1.5rem' },
  controls: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' },
  state: { color: '#64748b', textAlign: 'center', padding: '2rem' },
};
