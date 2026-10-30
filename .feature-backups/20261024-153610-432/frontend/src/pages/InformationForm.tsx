import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategories, getDestinations, getInformationById } from '../services/informationService';
import type { Category } from '../types/category';
import type { Destination } from '../types/destination';
import api from '../services/api';

export default function InformationForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '', summary: '', content: '', category: '', destination: '',
    source_name: '', source_url: '', verification_status: 'verified',
    last_verified: '', is_published: false,
  });

  useEffect(() => {
    getCategories().then(r => setCategories(r.data));
    getDestinations().then(r => setDestinations(r.data));
    if (isEdit && id) {
      getInformationById(Number(id)).then(r => {
        const e = r.data;
        setForm({
          title: e.title, summary: e.summary, content: e.content,
          category: String(e.category), destination: String(e.destination),
          source_name: e.source_name, source_url: e.source_url,
          verification_status: e.verification_status,
          last_verified: e.last_verified || '', is_published: e.is_published,
        });
      });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/information/${id}/`, form);
      } else {
        await api.post('/information/', form);
      }
      navigate('/admin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>{isEdit ? 'Edit Information' : 'Add Information'}</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          {(['title', 'summary', 'source_name', 'source_url'] as const).map(field => (
            <div key={field} style={styles.field}>
              <label style={styles.label}>{field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
              <input name={field} value={form[field] as string} onChange={handleChange} style={styles.input} required={field === 'title'} />
            </div>
          ))}

          <div style={styles.field}>
            <label style={styles.label}>Content</label>
            <textarea name="content" value={form.content} onChange={handleChange} rows={6} style={styles.textarea} required />
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} style={styles.select} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Destination</label>
              <select name="destination" value={form.destination} onChange={handleChange} style={styles.select} required>
                <option value="">Select destination</option>
                {destinations.map(d => <option key={d.id} value={d.id}>{d.commune || d.province || d.country}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Verification Status</label>
              <select name="verification_status" value={form.verification_status} onChange={handleChange} style={styles.select}>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="outdated">Outdated</option>
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Last Verified</label>
              <input type="date" name="last_verified" value={form.last_verified} onChange={handleChange} style={styles.input} />
            </div>
          </div>

          <label style={styles.checkLabel}>
            <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} />
            Publish
          </label>

          <button type="submit" disabled={submitting} style={styles.btn}>
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish'}
          </button>
        </form>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { backgroundColor: '#f8faf9', minHeight: '80vh' },
  container: { maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' },
  title: { fontSize: '1.4rem', fontWeight: 700, color: '#1a3c2e', marginBottom: '1.5rem' },
  form: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 },
  label: { fontWeight: 600, fontSize: '0.9rem', color: '#374151' },
  input: { padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.95rem' },
  textarea: { padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.95rem', resize: 'vertical' },
  select: { padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.95rem' },
  row: { display: 'flex', gap: '1rem' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: '#374151', cursor: 'pointer' },
  btn: { padding: '0.75rem', backgroundColor: '#1a3c2e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '1rem' },
};
