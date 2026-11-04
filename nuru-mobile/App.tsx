import ArticleActions from './src/ArticleActions';
import StepGuide from './src/StepGuide';
import SavedArticles from './src/SavedArticles';
import LanguageSelector from './src/LanguageSelector';
import {useLanguage,localizeArticle} from './src/i18n';
import { t } from './src/i18n';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, ImageBackground, Linking, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as api from './src/api';
import type { Category, Destination, Information, Reason } from './src/types';

const reasons: [Reason, string][] = [['outdated', 'Information appears outdated'], ['incorrect', 'Information is incorrect'], ['incomplete', 'Information is incomplete'], ['other', 'Other']];
// Unsplash photos: rural landscape by Lei Hwang; supportive conversation by Vitaly Gariev.
const homePhoto = { uri: 'https://images.unsplash.com/photo-1771772084783-9aa5353f76eb?auto=format&fit=crop&w=1200&q=80' };
const supportPhoto = { uri: 'https://images.unsplash.com/photo-1758273240360-76b908e7582a?auto=format&fit=crop&w=1000&q=80' };
const message = (e: unknown) => e instanceof Error ? e.message : t("Unable to connect. Please try again.");
function Button({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[s.button, disabled && { opacity: 0.5 }]}><Text style={s.buttonText}>{title}</Text></Pressable>;
}
function AppContent() {
 const language = useLanguage();
  const [savedOnly,setSavedOnly] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [items, setItems] = useState<Information[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [destination, setDestination] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [rawDetail, setDetail] = useState<Information | null>(null);
  const [report, setReport] = useState(false);
  const [reason, setReason] = useState<Reason>('outdated');
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [reportError, setReportError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const detail = rawDetail ? localizeArticle(rawDetail,language) : null;
 const back = () => { if (report) setReport(false); else { setSelected(null); setDetail(null); } };
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selected !== null) { back(); return true; } if(savedOnly){setSavedOnly(false);return true;} return false;
    });
    return () => subscription.remove();
  }, [selected, report, savedOnly]);
  useEffect(() => {
    let active = true;
    if(selected === null && savedOnly){setLoading(false); return;}
    setLoading(true); setError('');
    (async () => {
      try {
        if (selected !== null) {
          const entry = await api.getDetail(selected);
          if (active) { if (!entry.is_published) throw new Error(t("This information is no longer available.")); setDetail(entry); }
        } else {
          const [entries, cats, places] = await Promise.all([api.getInformation(query, category, destination), api.getCategories(), api.getDestinations()]);
          if (active) { setItems(entries); setCategories(cats); setDestinations(places); }
        }
      } catch (e) { if (active) setError(message(e)); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [selected, query, category, destination, revision, savedOnly]);
  async function send() {
    if (!detail || sending) return;
    setSending(true); setReportError('');
    try { await api.submitReport(detail.id, reason, comment); setSent(true); }
    catch (e) { setReportError(message(e)); }
    finally { setSending(false); }
  }
  return <SafeAreaView style={s.safe}>
    <StatusBar barStyle="dark-content" />
<LanguageSelector />
    <View style={s.header}><Text style={s.brand}>NURU</Text><Text style={s.small}>{t("Information you can trust")}</Text></View>
    <View style={s.nav}><Pressable accessibilityRole="button" onPress={()=>{setSavedOnly(false);setSelected(null);setReport(false);setDetail(null);}} style={[s.navItem,!savedOnly&&s.navActive]}><Text style={!savedOnly?s.navActiveText:s.navText}>{t('Explore')}</Text></Pressable><Pressable accessibilityRole="button" onPress={()=>{setSavedOnly(true);setSelected(null);setReport(false);setDetail(null);}} style={[s.navItem,savedOnly&&s.navActive]}><Text style={savedOnly?s.navActiveText:s.navText}>{t('Saved articles')}</Text></Pressable></View>
    {selected !== null && <Pressable accessibilityRole="button" onPress={back} style={s.back}><Text style={s.link}>â† {report ? t("Back to information") : t("Back to explore")}</Text></Pressable>}
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.body} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => setRevision(x => x + 1)} />}>
      {selected === null && !savedOnly && <>
        <ImageBackground source={homePhoto} imageStyle={s.homeImage} style={s.homeBanner}>
          <View style={s.homeShade}><Text style={s.bannerTitle}>{t("Explore information")}</Text><Text style={s.bannerCopy}>{t("Find clear, reliable information for your next steps.")}</Text></View>
        </ImageBackground>
        <TextInput accessibilityLabel={t("Search information")} placeholder={t("Search safety, housing, documentsâ€¦")} style={s.input} value={search} onChangeText={setSearch} returnKeyType="search" onSubmitEditing={() => setQuery(search)} />
        <Button title={t("Search")} onPress={() => setQuery(search)} />
        <Text style={s.label}>{t("Category")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={s.chips}>{[{ id: 0, name: '' }, ...categories].map(c => <Pressable key={c.id} accessibilityRole="button" accessibilityState={{ selected: category === c.name }} onPress={() => setCategory(c.name)} style={[s.chip, category === c.name && s.active]}><Text style={category === c.name ? s.buttonText : s.link}>{c.id === 0 ? t('All categories') : t(c.name)}</Text></Pressable>)}</View></ScrollView>
        <Text style={s.label}>{t("Destination")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={s.chips}><Pressable accessibilityRole="button" onPress={() => setDestination('')} style={[s.chip, !destination && s.active]}><Text style={!destination ? s.buttonText : s.link}>{t("All destinations")}</Text></Pressable>{[...new Set(destinations.map(d => d.commune).filter(Boolean))].map(place => <Pressable key={place} accessibilityRole="button" onPress={() => setDestination(place)} style={[s.chip, destination === place && s.active]}><Text style={destination === place ? s.buttonText : s.link}>{place}</Text></Pressable>)}</View></ScrollView>
      </>}
      {selected === null && savedOnly ? <SavedArticles refreshSignal={revision} onOpen={id=>{setSelected(id);setDetail(null);setReport(false);}} /> : loading ? <View style={s.notice}><ActivityIndicator color="#1a3c2e" /><Text style={s.small}>{t("Loading informationâ€¦")}</Text></View> : error ? <View style={s.card}><Text accessibilityRole="alert" style={s.error}>{error}</Text><Button title={t("Try again")} onPress={() => setRevision(x => x + 1)} /></View> : selected === null ? <>
        <Text style={s.small}>{items.length} {items.length === 1 ? t("result") : t("results")}</Text>
        {!items.length && <View style={s.card}><Text style={s.title}>{t("No information found")}</Text><Text style={s.copy}>{t("Try another search or clear your filters.")}</Text><Button title={t("Clear filters")} onPress={() => { setQuery(''); setSearch(''); setCategory(''); setDestination(''); }} /></View>}
        {items.map(rawItem => { const item = localizeArticle(rawItem,language); return <Pressable accessibilityRole="button" key={item.id} style={s.card} onPress={() => { setSelected(item.id); setReport(false); setDetail(null); }}><Text style={s.label}>{t(item.category_name ?? "Information")} Â· {item.destination_name ?? t("All locations")}</Text><Text style={s.title}>{item.title}</Text><Text style={s.copy}>{item.summary}</Text>{item.translationFallback && <Text style={s.caution}>{t('This article is shown in English because a reviewed translation is not available.')}</Text>}<Text style={item.verification_status === 'verified' ? s.verified : s.caution}>{item.verification_status === 'verified' ? t("âœ“ Verified") : item.verification_status === 'outdated' ? t("Outdated") : t("Unverified")}</Text><Text style={s.link}>{t("Read information â†’")}</Text></Pressable>; })}
      </> : detail && (report ? <View style={s.card}>{sent ? <><Text style={s.title}>{t("Report submitted")}</Text><Text style={s.copy}>{t("Thank you. Our team will review this information.")}</Text><Button title={t("Back to information")} onPress={() => setReport(false)} /></> : <>
        <Text style={s.heading}>{t("Report information")}</Text><Text style={s.copy}>{detail.title}</Text><Text style={s.label}>{t("Why are you reporting this?")}</Text>
        {reasons.map(([value, label]) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: reason === value, disabled: sending }} disabled={sending} key={value} style={s.choice} onPress={() => setReason(value)}><Text style={s.copy}>{reason === value ? 'â—' : 'â—‹'} {t(label)}</Text></Pressable>)}
        <Text style={s.label}>{t("Comments (optional)")}</Text><TextInput accessibilityLabel={t("Report comments")} editable={!sending} multiline textAlignVertical="top" value={comment} onChangeText={setComment} style={[s.input, { minHeight: 120 }]} placeholder={t("Tell us what needs to be reviewed")} />
        {!!reportError && <Text accessibilityRole="alert" style={s.error}>{reportError}</Text>}<Button title={sending ? t("Submittingâ€¦") : t("Submit report")} disabled={sending} onPress={send} />
      </>}</View> : <View style={s.card}><Image source={supportPhoto} accessibilityLabel={t("A supportive conversation")} style={s.detailImage} resizeMode="cover" />
        <Text style={s.label}>{t(detail.category_name)} Â· {detail.destination_name}</Text><Text style={s.heading}>{detail.title}</Text><ArticleActions entry={detail} /><Text style={detail.verification_status === 'verified' ? s.verified : s.caution}>{t(detail.verification_status === 'verified' ? 'Verified' : detail.verification_status === 'outdated' ? 'Outdated' : 'Unverified')}</Text><Text style={s.copy}>{t("Last verified:")}{' '}{detail.last_verified ?? t("Not yet verified")}</Text><Text style={s.title}>{detail.summary}</Text><Text selectable style={s.content}>{detail.content}</Text>{detail.translationFallback && <Text style={s.caution}>{t('This article is shown in English because a reviewed translation is not available.')}</Text>}<StepGuide entry={rawDetail!} /><Text style={s.label}>{t("Source:")}{' '}{detail.source_name || t("Not provided")}</Text>
        {!!detail.source_url && <Button title={t("Open source")} onPress={() => { if (/^https?:\/\//i.test(detail.source_url)) Linking.openURL(detail.source_url).catch(() => setReportError(t("Unable to open the source link."))); else setReportError(t("This source link is unavailable.")); }} />}
        {!!reportError && <Text accessibilityRole="alert" style={s.error}>{reportError}</Text>}<Button title={t("Report an issue")} onPress={() => { setSent(false); setComment(''); setReason('outdated'); setReportError(''); setReport(true); }} />
      </View>)}
      <Text style={s.footer}>{t("NURU Â· Supporting informed decisions")}</Text>
    </ScrollView>
  </SafeAreaView>;
}
export default function App() { return <SafeAreaProvider><AppContent /></SafeAreaProvider>; }
const s = StyleSheet.create({
  homeBanner: { height: 142, justifyContent: 'flex-end', borderRadius: 12, overflow: 'hidden', marginBottom: 2 }, homeImage: { borderRadius: 12 }, homeShade: { backgroundColor: 'rgba(22, 51, 69, 0.48)', padding: 16, gap: 4 }, bannerTitle: { color: '#fff', fontSize: 21, lineHeight: 27, fontWeight: '700' }, bannerCopy: { color: '#f3f8fb', fontSize: 14, lineHeight: 20 }, detailImage: { width: '100%', height: 176, borderRadius: 10, backgroundColor: '#eaf4fa' },
  safe: { flex: 1, backgroundColor: '#fff' }, header: { paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#e5edf2' }, brand: { color: '#24465b', fontSize: 23, fontWeight: '800', letterSpacing: 3 }, small: { color: '#647580', fontSize: 13, lineHeight: 19 }, nav: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eef2f5' }, navItem: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }, navActive: { backgroundColor: '#eaf4fa' }, navText: { color: '#526572', fontSize: 14, fontWeight: '600' }, navActiveText: { color: '#245b7a', fontSize: 14, fontWeight: '700' }, body: { padding: 18, gap: 12, paddingBottom: 32 }, intro: { gap: 2, marginBottom: 2 }, heading: { fontSize: 21, lineHeight: 28, color: '#24465b', fontWeight: '700' }, title: { fontSize: 18, lineHeight: 25, color: '#2b4657', fontWeight: '600' }, copy: { color: '#526572', fontSize: 15, lineHeight: 22 }, content: { color: '#344b59', fontSize: 16, lineHeight: 26 }, card: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e2eaf0', padding: 16, gap: 12 }, input: { borderWidth: 1, borderColor: '#d2dee6', backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 16, color: '#263f4e' }, label: { color: '#526572', fontSize: 13, fontWeight: '600', lineHeight: 19 }, button: { backgroundColor: '#e8f3f9', padding: 12, borderRadius: 8, alignItems: 'center', minHeight: 44, borderWidth: 1, borderColor: '#cfe2ed' }, buttonText: { color: '#245b7a', fontWeight: '700', fontSize: 15 }, chips: { flexDirection: 'row', gap: 8 }, chip: { borderRadius: 8, borderWidth: 1, borderColor: '#d6e2e9', paddingHorizontal: 13, paddingVertical: 10, backgroundColor: '#fff' }, active: { backgroundColor: '#e8f3f9', borderColor: '#bcd9e8' }, link: { color: '#245b7a', fontWeight: '600', fontSize: 14 }, verified: { color: '#26734d', fontWeight: '700' }, caution: { color: '#8a4d0f', fontWeight: '700' }, back: { paddingHorizontal: 20, paddingVertical: 12 }, notice: { padding: 28, alignItems: 'center', gap: 10 }, error: { color: '#a12525', lineHeight: 22 }, choice: { paddingVertical: 10, minHeight: 44 }, footer: { textAlign: 'center', color: '#71808a', fontSize: 12, paddingTop: 16 },
});
