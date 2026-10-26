import GuideEditor from '../components/GuideEditor';
import type {Guide,GuideTranslations} from '../features/core';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategories, getDestinations, getInformationById, submitSourceReview } from '../services/informationService';
import type { Category } from '../types/category';
import type { Destination } from '../types/destination';
import type { SourceReview } from '../types/information';
import api from '../services/api';

export default function InformationForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [contentVersion, setContentVersion] = useState<number>(1);
  const [latestReview, setLatestReview] = useState<SourceReview | null>(null);
  const [reviewOutcome, setReviewOutcome] = useState<'suitable' | 'revision_required'>('suitable');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const [guide, setGuide] = useState<Guide>({});
  const [guideTranslations, setGuideTranslations] = useState<GuideTranslations>({});
  const [guideLanguage, setGuideLanguage] = useState<'en'|'rn'|'rw'|'sw'>('en');
  const [loadingEntry, setLoadingEntry] = useState(isEdit);
  const [entryLoaded, setEntryLoaded] = useState(!isEdit);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', summary: '', content: '', category: '', destination: '',
    source_name: '', source_url: '', verification_status: 'verified',
    last_verified: '', is_published: false,
  });

  const loadEntry = (entryId: number) => {
    return getInformationById(entryId).then(r => {
      const e = r.data;
      setEntryLoaded(true);
      setContentVersion(e.content_version ?? 1);
      setLatestReview(e.latest_review ?? null);
      setGuide(e.guide ?? {}); setGuideTranslations(e.guide_translations ?? {});
      setForm({
        title: e.title, summary: e.summary, content: e.content,
        category: String(e.category), destination: String(e.destination),
        source_name: e.source_name, source_url: e.source_url,
        verification_status: e.verification_status,
        last_verified: e.last_verified || '', is_published: e.is_published,
      });
    });
  };

  useEffect(() => {
    getCategories().then(r => setCategories(r.data));
    getDestinations().then(r => setDestinations(r.data));
    if (isEdit && id) {
      loadEntry(Number(id))
        .catch(() => setError('Unable to load this entry. Reload before editing.'))
        .finally(() => setLoadingEntry(false));
    }
  }, [id]);

  const hasSuitableReview = latestReview?.outcome === 'suitable' && latestReview?.entry_version === contentVersion;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingEntry || !entryLoaded || submitting) return;
    setError(''); setSubmitting(true);
    const normalize = (value: Guide): Guide => ({...value,documents: value.documents?.map(document=>document.trim()).filter(Boolean)});
    const translated = Object.fromEntries(Object.entries(guideTranslations).map(([code,value])=>[code,{...value,guide:normalize(value.guide)}]));
    const payload = {...form,last_verified:form.last_verified || null,guide:normalize(guide),guide_translations:translated};
    try {
      if (isEdit) {
        await api.put(`/information/${id}/`, payload);
        await loadEntry(Number(id));
      } else {
        const res = await api.post<{ id: number }>('/information/', payload);
        navigate(`/admin/edit/${res.data.id}`);
      }
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      if (detail && typeof detail === 'object') {
        const messages = Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join('\n');
        setError(messages);
      } else {
        setError('Unable to save. Check required fields, contact details and reviewed guide translations, then try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!id || reviewSubmitting || !reviewNotes.trim()) return;
    setReviewError(''); setReviewSuccess(''); setReviewSubmitting(true);
    try {
      await submitSourceReview(Number(id), reviewOutcome, reviewNotes);
      setReviewNotes('');
      setReviewSuccess('Review recorded.');
      await loadEntry(Number(id));
    } catch {
      setReviewError('Unable to save review. Try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>{isEdit ? 'Edit Information' : 'Add Information'}</h1>
        {error && <p role="alert" style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={styles.form}>
        <fieldset disabled={submitting || loadingEntry || !entryLoaded} style={{border:0,padding:0,margin:0,display:'contents'}}>
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

          <label>Guide language<select value={guideLanguage} onChange={e=>setGuideLanguage(e.target.value as typeof guideLanguage)}><option value="en">English</option><option value="rn">Kirundi</option><option value="rw">Kinyarwanda</option><option value="sw">Kiswahili</option></select></label>
          <GuideEditor value={guideLanguage === 'en' ? guide : guideTranslations[guideLanguage]?.guide ?? {}} onChange={value=>{ if(guideLanguage === 'en') { setGuide(value); setGuideTranslations(previous=>Object.fromEntries(Object.entries(previous).map(([code,translation])=>[code,{...translation,reviewed:false}]))); } else setGuideTranslations(previous=>({...previous,[guideLanguage]:{guide:value,reviewed:false}})); }} />
          {guideLanguage !== 'en' && <label><input type="checkbox" checked={guideTranslations[guideLanguage]?.reviewed ?? false} onChange={e=>{ const checked=e.target.checked; setGuideTranslations(previous=>({...previous,[guideLanguage]:{guide:previous[guideLanguage]?.guide ?? {},reviewed:checked}})); }} />Translation reviewed for publication</label>}

          {isEdit && (
            <div style={styles.reviewSection}>
              <h2 style={styles.reviewTitle}>Source Review</h2>
              {hasSuitableReview ? (
                <p style={styles.reviewOk}>✓ Suitable review recorded for version {contentVersion} by {latestReview!.reviewed_by} on {new Date(latestReview!.reviewed_at).toLocaleDateString()}</p>
              ) : (
                <p style={styles.reviewWarning}>No suitable review for version {contentVersion}. Complete the review below before publishing.</p>
              )}
              <div style={styles.reviewForm}>
                <div style={styles.field}>
                  <label style={styles.label}>Outcome</label>
                  <select value={reviewOutcome} onChange={e => setReviewOutcome(e.target.value as typeof reviewOutcome)} style={styles.select}>
                    <option value="suitable">Suitable for publication</option>
                    <option value="revision_required">Revision required</option>
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Notes</label>
                  <textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} rows={3} style={styles.textarea} placeholder="Describe what was checked against the source" />
                </div>
                {reviewError && <p role="alert" style={styles.error}>{reviewError}</p>}
                {reviewSuccess && <p style={styles.reviewOk}>{reviewSuccess}</p>}
                <button type="button" disabled={reviewSubmitting || !reviewNotes.trim()} onClick={handleReviewSubmit} style={styles.reviewBtn}>
                  {reviewSubmitting ? 'Saving...' : 'Record review'}
                </button>
              </div>
            </div>
          )}

          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              name="is_published"
              checked={form.is_published}
              onChange={handleChange}
              disabled={isEdit && !hasSuitableReview}
            />
            Publish
            {isEdit && !hasSuitableReview && <span style={styles.reviewWarning}> — record a suitable review above first</span>}
          </label>

          <button type="submit" disabled={submitting} style={styles.btn}>
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Draft'}
          </button>
        </fieldset></form>
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
  error: { color: '#a12525', fontSize: '0.9rem', whiteSpace: 'pre-wrap' },
  reviewSection: { border: '1px solid #e2e8f0', borderRadius: 8, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#f8faf9' },
  reviewTitle: { fontSize: '1rem', fontWeight: 700, color: '#1a3c2e', margin: 0 },
  reviewForm: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  reviewBtn: { padding: '0.6rem 1.2rem', backgroundColor: '#1a3c2e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', alignSelf: 'flex-start' },
  reviewOk: { color: '#1a7a45', fontWeight: 600, fontSize: '0.9rem', margin: 0 },
  reviewWarning: { color: '#b45309', fontWeight: 600, fontSize: '0.9rem', margin: 0 },
};
