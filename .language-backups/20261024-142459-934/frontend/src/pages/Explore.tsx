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
  const [searchParams, setSearchParams] = useSearchParams();
  const [entries, setEntries] = useState<InformationEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const destination = searchParams.get('destination') || '';

  useEffect(() => {
    getCategories().then(r => setCategories(r.data));
    getDestinations().then(r => setDestinations(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    getInformation({ search, category, destination })
      .then(r => setEntries(r.data))
      .finally(() => setLoading(false));
  }, [search, category, destination]);

  const updateParam = (key: string, value: string) => {
    const params = Object.fromEntries(searchParams.entries());
    if (value) params[key] = value; else delete params[key];
    setSearchParams(params, { replace: true });
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>Explore Information</h1>
        <div style={styles.controls}>
          <SearchBar onSearch={q => updateParam('search', q)} placeholder="Search..." initialValue={search} />
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
          <p style={styles.state}>Loading...</p>
        ) : entries.length === 0 ? (
          <p style={styles.state}>No information found.</p>
        ) : (
          entries.map(e => <InformationCard key={e.id} entry={e} />)
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { backgroundColor: '#f8faf9', minHeight: '80vh' },
  container: { maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1a3c2e', marginBottom: '1.5rem' },
  controls: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' },
  state: { color: '#64748b', textAlign: 'center', padding: '2rem' },
};
