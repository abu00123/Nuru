import { currentLanguage, t, useLanguage } from '../i18n';
import { hasGuide, safeHttpUrl, selectGuide, type Guide, type GuideTranslations } from '../features/core';
export default function StepGuide({ entry }: { entry: { guide?: Guide; guide_translations?: GuideTranslations } }) {
  useLanguage();
  const { guide, fallback } = selectGuide(entry, currentLanguage());
  if (!hasGuide(guide)) return null;
  return <section aria-label={t('Step-by-step guide')} style={{ background: '#fff', border: '1px solid #dce6df', borderRadius: 12, padding: '1.5rem', margin: '1rem 0', lineHeight: 1.7, overflowWrap: 'anywhere' }}>
    <h2>{t('Step-by-step guide')}</h2>
    {fallback && <p role="note">{t('This guide is shown in English because a reviewed translation is not available.')}</p>}
    {!!guide.eligibility && <><h3>{t('Who can apply')}</h3><p style={{ whiteSpace: 'pre-wrap' }}>{guide.eligibility}</p></>}
    {!!guide.documents?.length && <><h3>{t('Documents you need')}</h3><ul>{guide.documents.map((document, i) => <li key={i}>{document}</li>)}</ul></>}
    {!!guide.steps?.length && <><h3>{t('Steps to follow')}</h3><ol>{guide.steps.map((step, i) => <li key={i} style={{ marginBottom: 18 }}><strong>{step.title}</strong><p style={{ whiteSpace: 'pre-wrap' }}>{step.description}</p></li>)}</ol></>}
    {!!guide.contacts?.length && <><h3>{t('Useful contacts')}</h3>{guide.contacts.map((contact, i) => <address key={i} style={{ fontStyle: 'normal', marginBottom: 16 }}><strong>{contact.name}</strong>{contact.phone && <div>{t('Phone')}: {contact.phone}</div>}{contact.email && <div>{t('Email')}: <a href={`mailto:${contact.email}`}>{contact.email}</a></div>}{safeHttpUrl(contact.url) && <div><a href={safeHttpUrl(contact.url)!} target="_blank" rel="noreferrer">{t('Visit website')}</a></div>}</address>)}</>}
  </section>;
}
