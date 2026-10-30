import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllInformation } from '../services/informationService';
import { getReports, updateReportStatus } from '../services/reportService';
import type { InformationEntry } from '../types/information';
import type { Report } from '../types/report';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboard() {
  const [entries, setEntries] = useState<InformationEntry[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [resolutionNotes, setResolutionNotes] = useState<Record<number, string>>({});
  const [reportError, setReportError] = useState('');
  const [savingReport, setSavingReport] = useState<number | null>(null);

  useEffect(() => {
    getAllInformation().then(r => setEntries(r.data));
    getReports().then(r => setReports(r.data));
  }, []);

  const handleStatusChange = async (id: number, status: Report['status']) => {
    const report = reports.find(item => item.id === id)!;
    const notes = resolutionNotes[id] ?? report.resolution_notes ?? '';
    setReportError('');
    if (status === 'resolved' && !notes.trim()) {
      setReportError('Enter resolution notes before marking the report resolved.');
      return;
    }
    setSavingReport(id);
    try {
      const response = await updateReportStatus(id, status, notes);
      setReports(prev => prev.map(rep => rep.id === id ? response.data : rep));
      setResolutionNotes(prev => ({...prev, [id]: response.data.resolution_notes}));
    } catch {
      setReportError('Could not update the report. Check your connection and try again.');
    } finally {
      setSavingReport(null);
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>NURU ADMIN</h1>
          <Link to="/admin/new" style={styles.addBtn}>+ Add Information</Link>
        </div>

        <div style={styles.stats}>
          <div style={styles.stat}><span style={styles.statNum}>{entries.length}</span><span>Information</span></div>
          <div style={styles.stat}><span style={styles.statNum}>{reports.length}</span><span>Reports</span></div>
        </div>

        <h2 style={styles.sectionTitle}>Recent Entries</h2>
        {entries.slice(0, 10).map(e => (
          <div key={e.id} style={styles.row}>
            <div>
              <p style={styles.entryTitle}>{e.title}</p>
              <p style={styles.entryMeta}>{e.category_name} • {e.destination_name}</p>
            </div>
            <div style={styles.rowRight}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {!e.is_published && <span style={styles.draftPill}>Draft</span>}
                {!e.is_published && e.latest_review?.outcome !== 'suitable' && <span style={styles.reviewPill}>Needs review</span>}
                <StatusBadge status={e.verification_status} />
              </div>
              <Link to={`/admin/edit/${e.id}`} style={styles.editLink}>Edit</Link>
            </div>
          </div>
        ))}

        <h2 style={{ ...styles.sectionTitle, marginTop: '2rem' }}>Recent Reports</h2>
        {reportError && <p role="alert">{reportError}</p>}
        {reports.map(r => (
          <div key={r.id} style={styles.row}>
            <div>
              <p style={styles.entryTitle}>{r.information_title}</p>
              <p style={styles.entryMeta}>{r.reason} • {new Date(r.created_at).toLocaleDateString()}</p>
              <p>{r.comment}</p>
              <label htmlFor={`resolution-${r.id}`}>Resolution notes</label>
              <textarea id={`resolution-${r.id}`} value={resolutionNotes[r.id] ?? r.resolution_notes ?? ''}
                onChange={event => setResolutionNotes(prev => ({...prev, [r.id]: event.target.value}))}
                rows={3} style={{display: 'block', maxWidth: '100%'}} />
              {r.resolved_at && <p>Resolved by {r.resolved_by_name} on {new Date(r.resolved_at).toLocaleString()}</p>}
              {r.status === 'resolved' && <button disabled={savingReport !== null} onClick={() => handleStatusChange(r.id, 'resolved')}>Save resolution notes</button>}
            </div>
            <select
              value={r.status}
              aria-label={`Status for report ${r.id}`}
              disabled={savingReport !== null}
              onChange={e => handleStatusChange(r.id, e.target.value as Report['status'])}
              style={{ ...styles.statusPill, backgroundColor: r.status === 'pending' ? '#fff8e1' : r.status === 'reviewed' ? '#e0f0ff' : '#e6f4ed', color: r.status === 'pending' ? '#b45309' : r.status === 'reviewed' ? '#1d4ed8' : '#1a7a45', border: 'none', cursor: 'pointer' }}
            >
              <option value="pending">Open</option>
              <option value="reviewed">In progress</option>
              <option value="resolved">resolved</option>
            </select>
          </div>
        ))}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { backgroundColor: '#f8faf9', minHeight: '80vh' },
  container: { maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1a3c2e', margin: 0 },
  addBtn: { backgroundColor: '#1a3c2e', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' },
  stats: { display: 'flex', gap: '1rem', marginBottom: '2rem' },
  stat: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '1rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' },
  statNum: { fontSize: '2rem', fontWeight: 700, color: '#1a3c2e' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#1a3c2e', marginBottom: '1rem' },
  row: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  rowRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  entryTitle: { margin: 0, fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' },
  entryMeta: { margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' },
  editLink: { color: '#1a3c2e', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' },
  draftPill: { padding: '0.2rem 0.6rem', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#64748b' },
  reviewPill: { padding: '0.2rem 0.6rem', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600, backgroundColor: '#fff8e1', color: '#b45309' },
  statusPill: { padding: '0.2rem 0.6rem', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600 },
};
