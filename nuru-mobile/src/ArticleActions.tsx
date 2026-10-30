import { useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { savedStore, useSaved } from './features/saved';
import { articleLink } from './features/core';
import { t, useLanguage } from './i18n';
export default function ArticleActions({ entry }: { entry: { id: number; title: string; summary: string } }) {
  useLanguage();
  const saved = useSaved();
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');
  async function share() {
    setError(''); setSharing(true);
    const link = articleLink((process.env.EXPO_PUBLIC_WEB_URL ?? '').trim(), entry.id);
    try { await Share.share({ title: entry.title, message: [entry.title, entry.summary, link].filter(Boolean).join('\n\n') }); }
    catch { setError('Unable to share. Please try again.'); }
    finally { setSharing(false); }
  }
  const savedHere = saved.ids.includes(entry.id);
  return <View style={{ gap: 12 }}>
    <Pressable accessibilityRole="button" accessibilityState={{ selected: savedHere, disabled: !saved.ready || saved.busy }} disabled={!saved.ready || saved.busy} onPress={() => void savedStore.toggle(entry.id)} style={{ minHeight: 48, padding: 14, borderWidth: 1, borderRadius: 10, borderColor: '#1a3c2e', opacity: !saved.ready || saved.busy ? 0.5 : 1 }}><Text style={{ color: '#1a3c2e', fontWeight: '600' }}>{t(savedHere ? 'Remove from saved' : 'Save article')}</Text></Pressable>
    <Pressable accessibilityRole="button" disabled={sharing} onPress={() => void share()} style={{ minHeight: 48, padding: 14, borderWidth: 1, borderRadius: 10, borderColor: '#1a3c2e' }}><Text style={{ color: '#1a3c2e', fontWeight: '600' }}>{t('Share article')}</Text></Pressable>
    {!!saved.error && <Text accessibilityRole="alert">{t(saved.error)}</Text>}
    {!saved.ready && !saved.busy && <Pressable accessibilityRole="button" onPress={() => void savedStore.load()} style={{ minHeight: 44, padding: 12 }}><Text>{t('Try again')}</Text></Pressable>}
    {!!error && <Text accessibilityRole="alert">{t(error)}</Text>}
  </View>;
}
