import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/token/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      navigate('/admin');
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>Admin Login</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} style={styles.input} required autoFocus />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} required />
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { backgroundColor: '#f8faf9', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  container: { width: '100%', maxWidth: 400, padding: '0 1.5rem' },
  title: { fontSize: '1.4rem', fontWeight: 700, color: '#1a3c2e', marginBottom: '1.5rem', textAlign: 'center' },
  form: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontWeight: 600, fontSize: '0.9rem', color: '#374151' },
  input: { padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.95rem' },
  btn: { padding: '0.75rem', backgroundColor: '#1a3c2e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '1rem' },
  error: { margin: 0, padding: '0.6rem', backgroundColor: '#fdecea', color: '#b91c1c', borderRadius: 6, fontSize: '0.9rem' },
};
