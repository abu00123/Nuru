import { useNavigate } from 'react-router-dom';

interface Props {
  name: string;
  icon: string;
}

export default function CategoryCard({ name, icon }: Props) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(`/explore?category=${name}`)} style={styles.card}>
      <span style={styles.icon}>{icon}</span>
      <span style={styles.name}>{name}</span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', minWidth: 120, transition: 'border-color 0.2s' },
  icon: { fontSize: '1.5rem' },
  name: { fontSize: '0.85rem', fontWeight: 600, color: '#1a3c2e' },
};
