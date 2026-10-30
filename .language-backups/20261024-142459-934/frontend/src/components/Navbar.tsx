import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem('access_token'));

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>NURU</Link>
      <div style={styles.links}>
        <Link to="/" style={{ ...styles.link, ...(pathname === '/' ? styles.active : {}) }}>Home</Link>
        <Link to="/explore" style={{ ...styles.link, ...(pathname.startsWith('/explore') ? styles.active : {}) }}>Explore</Link>
        {isLoggedIn ? (
          <>
            <Link to="/admin" style={styles.adminLink}>Admin</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <Link to="/login" style={styles.adminLink}>Admin</Link>
        )}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#1a3c2e', color: '#fff' },
  brand: { color: '#fff', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 700, letterSpacing: 2 },
  links: { display: 'flex', gap: '1.5rem', alignItems: 'center' },
  link: { color: '#cde8d8', textDecoration: 'none', fontSize: '0.95rem' },
  active: { color: '#fff', fontWeight: 600, borderBottom: '2px solid #4caf82' },
  adminLink: { color: '#4caf82', textDecoration: 'none', fontSize: '0.9rem', border: '1px solid #4caf82', padding: '0.3rem 0.8rem', borderRadius: 4 },
  logoutBtn: { background: 'transparent', border: '1px solid #94a3b8', color: '#94a3b8', padding: '0.3rem 0.8rem', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem' },
};
