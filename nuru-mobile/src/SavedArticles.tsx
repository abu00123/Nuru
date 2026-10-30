import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { getDetail } from './api';
import type { Information } from './types';
import { savedStore, useSaved } from './features/saved';
import { localizeArticle, t, useLanguage } from './i18n';
import { loadSavedArticles } from './features/core';
export default function SavedArticles({ onOpen, refreshSignal }: { onOpen: (id: number) => void; refreshSignal: number }) {
  const language = useLanguage(), saved = useSaved();
  const [entries, setEntries] = useState<Information[]>([]);
  const [missing, setMissing] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    if (!saved.ready) return;
    setLoading(true); setEntries([]); setMissing([]);
    void loadSavedArticles(saved.ids, getDetail, () => active).then(results => {
      if (!active) return;
      const visible: Information[] = [], unavailable: number[] = [];
      results.forEach((result, index) => { if (result.status === 'fulfilled' && result.value.is_published) visible.push(result.value); else unavailable.push(saved.ids[index]); });
      setEntries(visible); setMissing(unavailable); setLoading(false);
    });
    return () => { active = false; };
  }, [saved.ids, saved.ready, revision, refreshSignal]);
  const button = { padding: 14, minHeight: 44, borderWidth: 1, borderColor: '#b7c9bf', borderRadius: 10 };
  return <View style={{ gap: 16 }}>
    <Text accessibilityRole="header" style={{ color: '#1a3c2e', fontSize: 24, fontWeight: '700' }}>{t('Saved articles')}</Text>
    <Text>{t('Saved on this device. An internet connection is needed to open articles.')}</Text>
    {!!saved.error && <Text accessibilityRole="alert">{t(saved.error)}</Text>}
    {!saved.ready ? <Pressable accessibilityRole="button" disabled={saved.busy} onPress={() => void savedStore.load()} style={button}><Text>{t(saved.busy ? 'Loading...' : 'Try again')}</Text></Pressable> : loading ? <ActivityIndicator color="#1a3c2e" /> : <>
      {!saved.ids.length && <Text>{t('No saved articles yet.')}</Text>}
      {entries.map(raw => { const entry = localizeArticle(raw, language); return <View key={entry.id} style={{ padding: 16, borderWidth: 1, borderColor: '#dce6df', borderRadius: 14, gap: 12, backgroundColor: 'white' }}><Pressable accessibilityRole="button" onPress={() => onOpen(entry.id)} style={{ gap: 10, minHeight: 44 }}><Text style={{ fontSize: 19, fontWeight: '600', color: '#1a3c2e' }}>{entry.title}</Text><Text style={{ fontSize: 16, lineHeight: 24 }}>{entry.summary}</Text><Text>{t('Read information →')}</Text></Pressable><Pressable accessibilityRole="button" disabled={saved.busy} onPress={() => void savedStore.toggle(entry.id)} style={button}><Text>{t('Remove from saved')}</Text></Pressable></View>; })}
      {!!missing.length && <View style={{ gap: 12 }}><Text>{t('Some saved articles could not be loaded. They may be unpublished or your connection may be unavailable.')}</Text><Pressable accessibilityRole="button" style={button} onPress={() => setRevision(x => x + 1)}><Text>{t('Try again')}</Text></Pressable>{missing.map((id, i) => <Pressable accessibilityRole="button" key={id} disabled={saved.busy} style={button} onPress={() => void savedStore.toggle(id)}><Text>{t('Unavailable article')} {i + 1} · {t('Remove from saved')}</Text></Pressable>)}</View>}
    </>}
  </View>;
}
