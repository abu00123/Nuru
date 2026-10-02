import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { submitReport } from '../services/reportService';

const REASONS = [
  { value: 'outdated', label: 'Information appears outdated' },
  { value: 'incorrect', label: 'Information is incorrect' },
  { value: 'incomplete', label: 'Information is incomplete' },
  { value: 'other', label: 'Other' },
];

export default function ReportInformation() {
  const { id } = useParams<{ id: string }>();
  const [reason, setReason] = useState('outdated');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await submitReport({ information_entry: Number(id), reason, comment });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.success}>
            <p style={styles.successIcon}>✓</p>
            <h2>Report submitted</h2>
            <p style={{ color: '#475569' }}>Thank you. Our team will review this information.</p>
            <Link to="/explore" style={styles.btn}>Back to Explore</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <Link to={`/information/${id}`} style={styles.back}>← Back</Link>
        <h1 style={styles.title}>Report Information</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Why are you reporting this?</label>
          <select value={reason} onChange={e => setReason(e.target.value)} style={styles.select}>
            {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>

          <label style={styles.label}>Comments (optional)</label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} style={styles.textarea} placeholder="Provide additional details..." />

          <button type="submit" disabled={submitting} style={styles.btn}>
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { backgroundColor: '#f8faf9', minHeight: '80vh' },
  container: { maxWidth: 560, margin: '0 auto', padding: '2rem 1.5rem' },
  back: { color: '#1a3c2e', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem' },
  title: { fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' },
  form: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  label: { fontWeight: 600, fontSize: '0.9rem', color: '#374151' },
  select: { padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.95rem' },
  textarea: { padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.95rem', resize: 'vertical' },
  btn: { padding: '0.75rem', backgroundColor: '#1a3c2e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, textAlign: 'center', textDecoration: 'none' },
  success: { textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' },
  successIcon: { fontSize: '2.5rem', color: '#1a7a45' },
};
