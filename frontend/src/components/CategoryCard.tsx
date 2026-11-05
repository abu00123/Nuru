import { t } from '../i18n';
import { useNavigate } from 'react-router-dom';

interface Props {
  name: string;
  icon: string;
}

const categoryImages: Record<string, string> = {
  Education: '/categories/education.jpg',
  Safety: '/categories/safety.jpg',
  Documents: '/categories/documents.jpg',
  Housing: '/categories/housing.jpg',
  Healthcare: '/categories/healthcare.jpg',
  Livelihoods: '/categories/livelihoods.avif',
  Return: '/categories/return.jpg',
  Support: '/categories/support.avif',
};

export default function CategoryCard({ name, icon }: Props) {
  const navigate = useNavigate();
  const img = categoryImages[name];

  return (
    <button onClick={() => navigate(`/explore?category=${t(name)}`)} style={styles.card}>
      {img ? (
        <div style={{ ...styles.imgWrap, backgroundImage: `url(${img})` }}>
          <div style={styles.overlay} />
          <span style={styles.label}>{t(name)}</span>
        </div>
      ) : (
        <>
          <span style={styles.icon}>{icon}</span>
          <span style={styles.name}>{t(name)}</span>
        </>
      )}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    padding: 0,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    overflow: 'hidden',
    width: '100%',
    aspectRatio: '4/3',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  imgWrap: {
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'flex-end',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%)',
  },
  label: {
    position: 'relative',
    zIndex: 1,
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.95rem',
    padding: '0.6rem 0.75rem',
    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
  },
  icon: { fontSize: '1.5rem' },
  name: { fontSize: '0.85rem', fontWeight: 600, color: '#1a6fa8' },
};
