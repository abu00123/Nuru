import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as api from './src/api';
import type { Category, Destination, Information, Reason } from './src/types';

const reasons: [Reason, string][] = [['outdated', 'Information appears outdated'], ['incorrect', 'Information is incorrect'], ['incomplete', 'Information is incomplete'], ['other', 'Other']];
const message = (e: unknown) => e instanceof Error ? e.message : 'Unable to connect. Please try again.';
function Button({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[s.button, disabled && { opacity: 0.5 }]}><Text style={s.buttonText}>{title}</Text></Pressable>;
}
function AppContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [items, setItems] = useState<Information[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [destination, setDestination] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<Information | null>(null);
  const [report, setReport] = useState(false);
  const [reason, setReason] = useState<Reason>('outdated');
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [reportError, setReportError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const back = () => { if (report) setReport(false); else { setSelected(null); setDetail(null); } };
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selected !== null) { back(); return true; } return false;
    });
    return () => subscription.remove();
  }, [selected, report]);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    (async () => {
      try {
        if (selected !== null) {
          const entry = await api.getDetail(selected);
          if (active) { if (!entry.is_published) throw new Error('This information is no longer available.'); setDetail(entry); }
        } else {
          const [entries, cats, places] = await Promise.all([api.getInformation(query, category, destination), api.getCategories(), api.getDestinations()]);
          if (active) { setItems(entries); setCategories(cats); setDestinations(places); }
        }
      } catch (e) { if (active) setError(message(e)); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [selected, query, category, destination, revision]);
  async function send() {
    if (!detail || sending) return;
    setSending(true); setReportError('');
    try { await api.submitReport(detail.id, reason, comment); setSent(true); }
    catch (e) { setReportError(message(e)); }
    finally { setSending(false); }
  }
  return <SafeAreaView style={s.safe}>
    <StatusBar barStyle="dark-content" />
    <View style={s.header}><Text style={s.brand}>NURU</Text><Text style={s.small}>Information you can trust</Text></View>
    {selected !== null && <Pressable accessibilityRole="button" onPress={back} style={s.back}><Text style={s.link}>← {report ? 'Back to information' : 'Back to explore'}</Text></Pressable>}
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.body} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => setRevision(x => x + 1)} />}>
      {selected === null && <>
        <View style={s.hero}><Text style={s.eyebrow}>YOUR NEXT CHAPTER</Text><Text style={s.heroTitle}>Reliable information. Informed decisions.</Text><Text style={s.heroCopy}>Explore information for people considering voluntary return.</Text></View>
        <Text style={s.heading}>Explore information</Text>
        <TextInput accessibilityLabel="Search information" placeholder="Search safety, housing, documents…" style={s.input} value={search} onChangeText={setSearch} returnKeyType="search" onSubmitEditing={() => setQuery(search)} />
        <Button title="Search" onPress={() => setQuery(search)} />
        <Text style={s.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={s.chips}>{[{ id: 0, name: 'All categories' }, ...categories].map(c => <Pressable key={c.id} accessibilityRole="button" accessibilityState={{ selected: category === (c.id ? c.name : '') }} onPress={() => setCategory(c.id ? c.name : '')} style={[s.chip, category === (c.id ? c.name : '') && s.active]}><Text style={category === (c.id ? c.name : '') ? s.buttonText : s.link}>{c.name}</Text></Pressable>)}</View></ScrollView>
        <Text style={s.label}>Destination</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={s.chips}><Pressable accessibilityRole="button" onPress={() => setDestination('')} style={[s.chip, !destination && s.active]}><Text style={!destination ? s.buttonText : s.link}>All destinations</Text></Pressable>{[...new Set(destinations.map(d => d.commune).filter(Boolean))].map(place => <Pressable key={place} accessibilityRole="button" onPress={() => setDestination(place)} style={[s.chip, destination === place && s.active]}><Text style={destination === place ? s.buttonText : s.link}>{place}</Text></Pressable>)}</View></ScrollView>
      </>}
      {loading ? <View style={s.notice}><ActivityIndicator color="#1a3c2e" /><Text style={s.small}>Loading information…</Text></View> : error ? <View style={s.card}><Text accessibilityRole="alert" style={s.error}>{error}</Text><Button title="Try again" onPress={() => setRevision(x => x + 1)} /></View> : selected === null ? <>
        <Text style={s.small}>{items.length} {items.length === 1 ? 'result' : 'results'}</Text>
        {!items.length && <View style={s.card}><Text style={s.title}>No information found</Text><Text style={s.copy}>Try another search or clear your filters.</Text><Button title="Clear filters" onPress={() => { setQuery(''); setSearch(''); setCategory(''); setDestination(''); }} /></View>}
        {items.map(item => <Pressable accessibilityRole="button" key={item.id} style={s.card} onPress={() => { setSelected(item.id); setReport(false); setDetail(null); }}><Text style={s.label}>{item.category_name ?? 'Information'} · {item.destination_name ?? 'All locations'}</Text><Text style={s.title}>{item.title}</Text><Text style={s.copy}>{item.summary}</Text><Text style={item.verification_status === 'verified' ? s.verified : s.caution}>{item.verification_status === 'verified' ? '✓ Verified' : item.verification_status === 'outdated' ? 'Outdated' : 'Unverified'}</Text><Text style={s.link}>Read information →</Text></Pressable>)}
      </> : detail && (report ? <View style={s.card}>{sent ? <><Text style={s.title}>Report submitted</Text><Text style={s.copy}>Thank you. Our team will review this information.</Text><Button title="Back to information" onPress={() => setReport(false)} /></> : <>
        <Text style={s.heading}>Report information</Text><Text style={s.copy}>{detail.title}</Text><Text style={s.label}>Why are you reporting this?</Text>
        {reasons.map(([value, label]) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: reason === value, disabled: sending }} disabled={sending} key={value} style={s.choice} onPress={() => setReason(value)}><Text style={s.copy}>{reason === value ? '●' : '○'} {label}</Text></Pressable>)}
        <Text style={s.label}>Comments (optional)</Text><TextInput accessibilityLabel="Report comments" editable={!sending} multiline textAlignVertical="top" value={comment} onChangeText={setComment} style={[s.input, { minHeight: 120 }]} placeholder="Tell us what needs to be reviewed" />
        {!!reportError && <Text accessibilityRole="alert" style={s.error}>{reportError}</Text>}<Button title={sending ? 'Submitting…' : 'Submit report'} disabled={sending} onPress={send} />
      </>}</View> : <View style={s.card}>
        <Text style={s.label}>{detail.category_name} · {detail.destination_name}</Text><Text style={s.heading}>{detail.title}</Text><Text style={detail.verification_status === 'verified' ? s.verified : s.caution}>{detail.verification_status.toUpperCase()}</Text><Text style={s.copy}>Last verified: {detail.last_verified ?? 'Not yet verified'}</Text><Text style={s.title}>{detail.summary}</Text><Text selectable style={s.content}>{detail.content}</Text><Text style={s.label}>Source: {detail.source_name || 'Not provided'}</Text>
        {!!detail.source_url && <Button title="Open source" onPress={() => { if (/^https?:\/\//i.test(detail.source_url)) Linking.openURL(detail.source_url).catch(() => setReportError('Unable to open the source link.')); else setReportError('This source link is unavailable.'); }} />}
        {!!reportError && <Text accessibilityRole="alert" style={s.error}>{reportError}</Text>}<Button title="Report an issue" onPress={() => { setSent(false); setComment(''); setReason('outdated'); setReportError(''); setReport(true); }} />
      </View>)}
      <Text style={s.footer}>NURU · Supporting informed decisions</Text>
    </ScrollView>
  </SafeAreaView>;
}
export default function App() { return <SafeAreaProvider><AppContent /></SafeAreaProvider>; }
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8faf9' }, header: { paddingHorizontal: 22, paddingVertical: 16, borderBottomWidth: 1, borderColor: '#dce6df' }, brand: { color: '#1a3c2e', fontSize: 27, fontWeight: '800', letterSpacing: 4 }, small: { color: '#52665b', fontSize: 13, lineHeight: 20 }, body: { padding: 20, gap: 14, paddingBottom: 40 }, hero: { padding: 25, backgroundColor: '#1a3c2e', borderRadius: 22, gap: 14 }, eyebrow: { color: '#a4d7b9', fontSize: 11, letterSpacing: 2, fontWeight: '700' }, heroTitle: { fontSize: 30, lineHeight: 37, fontWeight: '700', color: '#fff' }, heroCopy: { color: '#cde8d8', fontSize: 16, lineHeight: 24 }, heading: { fontSize: 24, lineHeight: 31, color: '#1a3c2e', fontWeight: '700' }, title: { fontSize: 19, lineHeight: 27, color: '#203e30', fontWeight: '600' }, copy: { color: '#475b50', fontSize: 16, lineHeight: 25 }, content: { color: '#273e31', fontSize: 17, lineHeight: 28 }, card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#dce6df', padding: 20, gap: 14 }, input: { borderWidth: 1, borderColor: '#b7c9bf', backgroundColor: '#fff', borderRadius: 12, padding: 15, fontSize: 16, color: '#203e30' }, label: { color: '#52665b', fontSize: 13, fontWeight: '600', lineHeight: 20 }, button: { backgroundColor: '#1a3c2e', padding: 15, borderRadius: 12, alignItems: 'center', minHeight: 48 }, buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 }, chips: { flexDirection: 'row', gap: 8 }, chip: { borderRadius: 24, borderWidth: 1, borderColor: '#b7c9bf', paddingHorizontal: 16, paddingVertical: 13 }, active: { backgroundColor: '#1a3c2e', borderColor: '#1a3c2e' }, link: { color: '#1a3c2e', fontWeight: '600', fontSize: 15 }, verified: { color: '#17603c', fontWeight: '700' }, caution: { color: '#8a4d0f', fontWeight: '700' }, back: { paddingHorizontal: 22, paddingVertical: 16 }, notice: { padding: 32, alignItems: 'center', gap: 12 }, error: { color: '#a12525', lineHeight: 22 }, choice: { paddingVertical: 12, minHeight: 48 }, footer: { textAlign: 'center', color: '#52665b', fontSize: 12, paddingTop: 20 },
});
