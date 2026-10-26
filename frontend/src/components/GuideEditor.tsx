import type { Guide } from '../features/core';
export default function GuideEditor({ value, onChange, disabled = false }: { value: Guide; onChange: (value: Guide) => void; disabled?: boolean }) {
  const field = { width: '100%', boxSizing: 'border-box' as const, padding: 10, border: '1px solid #b7c9bf', borderRadius: 6 };
  const steps = value.steps ?? [], contacts = value.contacts ?? [];
  function move(index: number, delta: number) { const next = [...steps]; [next[index], next[index + delta]] = [next[index + delta], next[index]]; onChange({ ...value, steps: next }); }
  return <fieldset disabled={disabled} style={{ border: '1px solid #b7c9bf', borderRadius: 10, padding: 16, display: 'grid', gap: 14 }}>
    <legend>Step-by-step guide (optional)</legend>
    <label>Who can apply<textarea style={field} rows={3} maxLength={5000} value={value.eligibility ?? ''} onChange={e => onChange({ ...value, eligibility: e.target.value })} /></label>
    <label>Documents required — one per line<textarea style={field} rows={4} value={(value.documents ?? []).join('\n')} onChange={e => onChange({ ...value, documents: e.target.value.split('\n') })} /></label>
    <h3>Steps</h3>
    {steps.map((step, index) => <fieldset key={index} style={{ display: 'grid', gap: 10 }}><legend>Step {index + 1}</legend>
      <label>Title<input style={field} required maxLength={255} value={step.title} onChange={e => onChange({ ...value, steps: steps.map((item, i) => i === index ? { ...item, title: e.target.value } : item) })} /></label>
      <label>Instructions<textarea style={field} rows={3} required maxLength={5000} value={step.description} onChange={e => onChange({ ...value, steps: steps.map((item, i) => i === index ? { ...item, description: e.target.value } : item) })} /></label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button type="button" disabled={index === 0} onClick={() => move(index, -1)}>Move up</button><button type="button" disabled={index === steps.length - 1} onClick={() => move(index, 1)}>Move down</button><button type="button" onClick={() => onChange({ ...value, steps: steps.filter((_, i) => i !== index) })}>Remove step</button></div>
    </fieldset>)}
    <button type="button" disabled={steps.length >= 30} onClick={() => onChange({ ...value, steps: [...steps, { title: '', description: '' }] })}>Add step</button>
    <h3>Useful contacts</h3>
    {contacts.map((contact, index) => <fieldset key={index} style={{ display: 'grid', gap: 10 }}><legend>Contact {index + 1}</legend>{(['name', 'phone', 'email', 'url'] as const).map(key => <label key={key}>{key === 'url' ? 'Website URL' : key}<input style={field} required={key === 'name'} type={key === 'email' ? 'email' : key === 'url' ? 'url' : 'text'} maxLength={key === 'url' ? 2048 : 255} value={contact[key] ?? ''} onChange={e => onChange({ ...value, contacts: contacts.map((item, i) => i === index ? { ...item, [key]: e.target.value } : item) })} /></label>)}<button type="button" onClick={() => onChange({ ...value, contacts: contacts.filter((_, i) => i !== index) })}>Remove contact</button></fieldset>)}
    <button type="button" disabled={contacts.length >= 20} onClick={() => onChange({ ...value, contacts: [...contacts, { name: '' }] })}>Add contact</button>
  </fieldset>;
}
