import type { Category } from '../types/category';
import type { Destination } from '../types/destination';

interface Props {
  categories: Category[];
  destinations: Destination[];
  selectedCategory: string;
  selectedDestination: string;
  onCategoryChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
}

export default function FilterBar({ categories, destinations, selectedCategory, selectedDestination, onCategoryChange, onDestinationChange }: Props) {
  return (
    <div style={styles.bar}>
      <select value={selectedCategory} onChange={e => onCategoryChange(e.target.value)} style={styles.select}>
        <option value="">All Categories</option>
        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
      </select>
      <select value={selectedDestination} onChange={e => onDestinationChange(e.target.value)} style={styles.select}>
        <option value="">All Destinations</option>
        {destinations.map(d => <option key={d.id} value={d.commune}>{d.commune || d.province || d.country}</option>)}
      </select>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  select: { padding: '0.6rem 1rem', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem', backgroundColor: '#fff', cursor: 'pointer' },
};
