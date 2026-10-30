import { Linking, Pressable, Text, View } from 'react-native';
import { useState } from 'react';
import { hasGuide, safeHttpUrl, selectGuide, type Guide, type GuideTranslations } from './features/core';
import { currentLanguage, t, useLanguage } from './i18n';
export default function StepGuide({ entry }: { entry: {guide?: Guide; guide_translations?: GuideTranslations} }) {
  useLanguage();
  const [error, setError] = useState('');
  const { guide, fallback } = selectGuide(entry, currentLanguage());
  if (!hasGuide(guide)) return null;
  const heading = { fontSize: 20, fontWeight: '700' as const, color: '#1a3c2e', marginTop: 12 };
  const body = { fontSize: 16, lineHeight: 25, color: '#273e31' };
  return <View style={{ gap: 12 }}>
    <Text accessibilityRole="header" style={heading}>{t('Step-by-step guide')}</Text>
    {fallback && <Text style={body}>{t('This guide is shown in English because a reviewed translation is not available.')}</Text>}
    {!!guide.eligibility && <><Text style={heading}>{t('Who can apply')}</Text><Text selectable style={body}>{guide.eligibility}</Text></>}
    {!!guide.documents?.length && <><Text style={heading}>{t('Documents you need')}</Text>{guide.documents.map((document, i) => <Text selectable key={i} style={body}>• {document}</Text>)}</>}
    {!!guide.steps?.length && <><Text style={heading}>{t('Steps to follow')}</Text>{guide.steps.map((step, i) => <View key={i} style={{ gap: 6 }}><Text style={{ ...body, fontWeight: '700' }}>{i + 1}. {step.title}</Text><Text selectable style={body}>{step.description}</Text></View>)}</>}
    {!!guide.contacts?.length && <><Text style={heading}>{t('Useful contacts')}</Text>{guide.contacts.map((contact, i) => <View key={i} style={{ gap: 6 }}><Text style={{ ...body, fontWeight: '700' }}>{contact.name}</Text>{!!contact.phone && <Text selectable style={body}>{t('Phone')}: {contact.phone}</Text>}{!!contact.email && <Text selectable style={body}>{t('Email')}: {contact.email}</Text>}{safeHttpUrl(contact.url) && <Pressable accessibilityRole="link" onPress={() => { setError(''); void Linking.openURL(safeHttpUrl(contact.url)!).catch(() => setError('Unable to open the source link.')); }} style={{ minHeight: 44, paddingVertical: 10 }}><Text style={body}>{t('Visit website')} ↗</Text></Pressable>}</View>)}</>}
    {!!error && <Text accessibilityRole="alert">{t(error)}</Text>}
  </View>;
}
