import ArticleActions from './src/ArticleActions';
import StepGuide from './src/StepGuide';
import SavedArticles from './src/SavedArticles';
import LanguageSelector from './src/LanguageSelector';
import { useLanguage, localizeArticle, t } from './src/i18n';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, ImageBackground, Linking, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as api from './src/api';
import type { Category, Destination, Information, Reason } from './src/types';

type Screen = 'home' | 'explore' | 'saved';

const reasons: [Reason, string][] = [['outdated', 'Information appears outdated'], ['incorrect', 'Information is incorrect'], ['incomplete', 'Information is incomplete'], ['other', 'Other']];

const heroImage = require('./assets/images/landing-hero.jpg');
const categoryImages: Record<string, number> = {
  Education: require('./assets/images/education.jpg'),
  Safety: require('./assets/images/safety.jpg'),
  Documents: require('./assets/images/documents.jpg'),
  Housing: require('./assets/images/housing.jpg'),
  Healthcare: require('./assets/images/healthcare.jpg'),
  Livelihoods: require('./assets/images/livelihoods.jpg'),
  Return: require('./assets/images/return.jpg'),
  Support: require('./assets/images/support.jpg'),
};

const message = (e: unknown) => e instanceof Error ? e.message : t('Unable to connect. Please try again.');

function Button({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[s.button, disabled && { opacity: 0.5 }]}>
      <Text style={s.buttonText}>{title}</Text>
    </Pressable>
  );
}

function AppContent() {
  const language = useLanguage();
  const [screen, setScreen] = useState<Screen>('home');
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
  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState(0);

  const detail = rawDetail ? localizeArticle(rawDetail, language) : null;

  const back = () => {
    if (report) { setReport(false); return; }
    if (selected !== null) { setSelected(null); setDetail(null); return; }
  };

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    api.getDestinations().then(setDestinations).catch(() => {});
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selected !== null) { back(); return true; }
      if (screen === 'saved' || screen === 'explore') { setScreen('home'); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [selected, report, screen]);

  useEffect(() => {
    if (screen !== 'explore' || selected !== null) return;
    let active = true;
    setLoading(true); setError('');
    api.getInformation(query, category, destination)
      .then(data => { if (active) setItems(data); })
      .catch(e => { if (active) setError(message(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [screen, query, category, destination, revision]);

  useEffect(() => {
    if (selected === null) return;
    let active = true;
    setLoading(true); setError('');
    api.getDetail(selected)
      .then(entry => { if (active) { if (!entry.is_published) throw new Error(t('This information is no longer available.')); setDetail(entry); } })
      .catch(e => { if (active) setError(message(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selected, revision]);

  async function send() {
    if (!detail || sending) return;
    setSending(true); setReportError('');
    try { await api.submitReport(detail.id, reason, comment); setSent(true); }
    catch (e) { setReportError(message(e)); }
    finally { setSending(false); }
  }

  function goToCategory(name: string) {
    setCategory(name); setQuery(''); setSearch(''); setScreen('explore');
  }

  function goToExploreWithSearch(q: string) {
    setQuery(q); setSearch(q); setScreen('explore');
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a6fa8" />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.brand}>NURU</Text>
          <Text style={s.tagline}>{t('Information you can trust')}</Text>
        </View>
        <LanguageSelector />
      </View>

      {/* Nav */}
      <View style={s.nav}>
        {(['home', 'explore', 'saved'] as Screen[]).map(sc => (
          <Pressable key={sc} accessibilityRole="button" onPress={() => { setScreen(sc); setSelected(null); setDetail(null); setReport(false); }} style={[s.navItem, screen === sc && s.navActive]}>
            <Text style={screen === sc ? s.navActiveText : s.navText}>{sc === 'home' ? t('Home') : sc === 'explore' ? t('Explore') : t('Saved')}</Text>
          </Pressable>
        ))}
      </View>

      {selected !== null && (
        <Pressable accessibilityRole="button" onPress={back} style={s.backBtn}>
          <Text style={s.link}>← {report ? t('Back to information') : t('Back to explore')}</Text>
        </Pressable>
      )}

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.body} refreshControl={<RefreshControl refreshing={loading && screen === 'explore' && selected === null} onRefresh={() => setRevision(x => x + 1)} />}>

        {/* HOME SCREEN */}
        {screen === 'home' && selected === null && (
          <>
            {/* Hero */}
            <ImageBackground source={heroImage} style={s.heroBg} imageStyle={s.heroImg}>
              <View style={s.heroOverlay}>
                <Text style={s.heroTitle}>{t('Know before you go.')}</Text>
                <Text style={s.heroSub}>{t('Verified information on safety, housing, healthcare and more — so you can return with confidence.')}</Text>
                <View style={s.searchRow}>
                  <TextInput
                    style={s.searchInput}
                    placeholder={t('Search...')}
                    placeholderTextColor="#a0c4e0"
                    value={search}
                    onChangeText={setSearch}
                    returnKeyType="search"
                    onSubmitEditing={() => goToExploreWithSearch(search)}
                  />
                  <Pressable style={s.searchBtn} onPress={() => goToExploreWithSearch(search)}>
                    <Text style={s.searchBtnText}>{t('Search')}</Text>
                  </Pressable>
                </View>
              </View>
            </ImageBackground>

            {/* Category grid */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>{t('Explore Information')}</Text>
              <View style={s.grid}>
                {categories.map(c => {
                  const img = categoryImages[c.name];
                  return (
                    <Pressable key={c.id} accessibilityRole="button" style={s.catCard} onPress={() => goToCategory(c.name)}>
                      {img ? (
                        <ImageBackground source={img} style={s.catImg} imageStyle={{ borderRadius: 10 }}>
                          <View style={s.catOverlay} />
                          <Text style={s.catLabel}>{t(c.name)}</Text>
                        </ImageBackground>
                      ) : (
                        <Text style={s.catLabel}>{t(c.name)}</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* EXPLORE SCREEN */}
        {screen === 'explore' && selected === null && (
          <>
            <Text style={s.sectionTitle}>{t('Explore Information')}</Text>
            <TextInput accessibilityLabel={t('Search information')} placeholder={t('Search safety, housing, documents…')} style={s.input} value={search} onChangeText={setSearch} returnKeyType="search" onSubmitEditing={() => setQuery(search)} />
            <Button title={t('Search')} onPress={() => setQuery(search)} />
            <Text style={s.label}>{t('Category')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.chips}>
                {[{ id: 0, name: '' }, ...categories].map(c => (
                  <Pressable key={c.id} accessibilityRole="button" onPress={() => setCategory(c.name)} style={[s.chip, category === c.name && s.active]}>
                    <Text style={category === c.name ? s.buttonText : s.link}>{c.id === 0 ? t('All categories') : t(c.name)}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <Text style={s.label}>{t('Destination')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.chips}>
                <Pressable accessibilityRole="button" onPress={() => setDestination('')} style={[s.chip, !destination && s.active]}>
                  <Text style={!destination ? s.buttonText : s.link}>{t('All destinations')}</Text>
                </Pressable>
                {[...new Set(destinations.map(d => d.commune).filter(Boolean))].map(place => (
                  <Pressable key={place} accessibilityRole="button" onPress={() => setDestination(place)} style={[s.chip, destination === place && s.active]}>
                    <Text style={destination === place ? s.buttonText : s.link}>{place}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            {loading ? (
              <View style={s.notice}><ActivityIndicator color="#1a6fa8" /><Text style={s.small}>{t('Loading…')}</Text></View>
            ) : error ? (
              <View style={s.card}><Text accessibilityRole="alert" style={s.error}>{error}</Text><Button title={t('Try again')} onPress={() => setRevision(x => x + 1)} /></View>
            ) : (
              <>
                <Text style={s.small}>{items.length} {items.length === 1 ? t('result') : t('results')}</Text>
                {!items.length && (
                  <View style={s.card}>
                    <Text style={s.title}>{t('No information found')}</Text>
                    <Text style={s.copy}>{t('Try another search or clear your filters.')}</Text>
                    <Button title={t('Clear filters')} onPress={() => { setQuery(''); setSearch(''); setCategory(''); setDestination(''); }} />
                  </View>
                )}
                {items.map(rawItem => {
                  const item = localizeArticle(rawItem, language);
                  return (
                    <Pressable accessibilityRole="button" key={item.id} style={s.card} onPress={() => { setSelected(item.id); setReport(false); setDetail(null); }}>
                      <Text style={s.label}>{t(item.category_name ?? 'Information')} · {item.destination_name ?? t('All locations')}</Text>
                      <Text style={s.title}>{item.title}</Text>
                      <Text style={s.copy}>{item.summary}</Text>
                      <Text style={item.verification_status === 'verified' ? s.verified : s.caution}>{item.verification_status === 'verified' ? t('✓ Verified') : item.verification_status === 'outdated' ? t('Outdated') : t('Unverified')}</Text>
                      <Text style={s.link}>{t('Read more →')}</Text>
                    </Pressable>
                  );
                })}
              </>
            )}
          </>
        )}

        {/* SAVED SCREEN */}
        {screen === 'saved' && selected === null && (
          <SavedArticles refreshSignal={revision} onOpen={id => { setSelected(id); setDetail(null); setReport(false); }} />
        )}

        {/* DETAIL / REPORT */}
        {selected !== null && (
          loading ? (
            <View style={s.notice}><ActivityIndicator color="#1a6fa8" /><Text style={s.small}>{t('Loading…')}</Text></View>
          ) : error ? (
            <View style={s.card}><Text accessibilityRole="alert" style={s.error}>{error}</Text><Button title={t('Try again')} onPress={() => setRevision(x => x + 1)} /></View>
          ) : detail && (
            report ? (
              <View style={s.card}>
                {sent ? (
                  <>
                    <Text style={s.title}>{t('Report submitted')}</Text>
                    <Text style={s.copy}>{t('Thank you. Our team will review this information.')}</Text>
                    <Button title={t('Back to information')} onPress={() => setReport(false)} />
                  </>
                ) : (
                  <>
                    <Text style={s.heading}>{t('Report information')}</Text>
                    <Text style={s.copy}>{detail.title}</Text>
                    <Text style={s.label}>{t('Why are you reporting this?')}</Text>
                    {reasons.map(([value, label]) => (
                      <Pressable accessibilityRole="radio" accessibilityState={{ checked: reason === value }} key={value} style={s.choice} onPress={() => setReason(value)}>
                        <Text style={s.copy}>{reason === value ? '◉' : '○'} {t(label)}</Text>
                      </Pressable>
                    ))}
                    <Text style={s.label}>{t('Comments (optional)')}</Text>
                    <TextInput accessibilityLabel={t('Report comments')} editable={!sending} multiline textAlignVertical="top" value={comment} onChangeText={setComment} style={[s.input, { minHeight: 120 }]} placeholder={t('Tell us what needs to be reviewed')} />
                    {!!reportError && <Text accessibilityRole="alert" style={s.error}>{reportError}</Text>}
                    <Button title={sending ? t('Submitting…') : t('Submit report')} disabled={sending} onPress={send} />
                  </>
                )}
              </View>
            ) : (
              <View style={s.card}>
                <Text style={s.label}>{t(detail.category_name ?? '')} · {detail.destination_name}</Text>
                <Text style={s.heading}>{detail.title}</Text>
                <ArticleActions entry={detail} />
                <Text style={detail.verification_status === 'verified' ? s.verified : s.caution}>{t(detail.verification_status === 'verified' ? 'Verified' : detail.verification_status === 'outdated' ? 'Outdated' : 'Unverified')}</Text>
                <Text style={s.copy}>{t('Last verified:')} {detail.last_verified ?? t('Not yet verified')}</Text>
                <Text style={s.title}>{detail.summary}</Text>
                <Text selectable style={s.content}>{detail.content}</Text>
                <StepGuide entry={rawDetail!} />
                <Text style={s.label}>{t('Source:')} {detail.source_name || t('Not provided')}</Text>
                {!!detail.source_url && (
                  <Button title={t('Open source')} onPress={() => { if (/^https?:\/\//i.test(detail.source_url)) Linking.openURL(detail.source_url).catch(() => setReportError(t('Unable to open the source link.'))); else setReportError(t('This source link is unavailable.')); }} />
                )}
                {!!reportError && <Text accessibilityRole="alert" style={s.error}>{reportError}</Text>}
                <Button title={t('Report an issue')} onPress={() => { setSent(false); setComment(''); setReason('outdated'); setReportError(''); setReport(true); }} />
              </View>
            )
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() { return <SafeAreaProvider><AppContent /></SafeAreaProvider>; }

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f7ff' },
  header: { backgroundColor: '#1a6fa8', paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 3 },
  tagline: { color: '#d0e8f8', fontSize: 11 },
  nav: { flexDirection: 'row', backgroundColor: '#1a6fa8', paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  navItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  navActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  navText: { color: '#d0e8f8', fontSize: 14, fontWeight: '600' },
  navActiveText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  backBtn: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff' },
  body: { gap: 12, paddingBottom: 32 },
  // Hero
  heroBg: { height: 320, justifyContent: 'flex-end' },
  heroImg: { resizeMode: 'cover' },
  heroOverlay: { backgroundColor: 'rgba(26,111,168,0.82)', padding: 24, gap: 10 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', lineHeight: 34 },
  heroSub: { color: '#d0e8f8', fontSize: 14, lineHeight: 21 },
  searchRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  searchInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  searchBtn: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  searchBtnText: { color: '#1a6fa8', fontWeight: '700', fontSize: 14 },
  // Category grid
  section: { padding: 18, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a6fa8', paddingHorizontal: 18, paddingTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 18 },
  catCard: { width: '47%', aspectRatio: 4 / 3, borderRadius: 10, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6 },
  catImg: { flex: 1, justifyContent: 'flex-end' },
  catOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 10 },
  catLabel: { color: '#fff', fontWeight: '700', fontSize: 13, padding: 10, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  // Explore
  input: { borderWidth: 1, borderColor: '#d2dee6', backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 16, color: '#263f4e', marginHorizontal: 18 },
  label: { color: '#526572', fontSize: 13, fontWeight: '600', paddingHorizontal: 18 },
  button: { backgroundColor: '#1a6fa8', padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 18 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 18 },
  chip: { borderRadius: 8, borderWidth: 1, borderColor: '#d6e2e9', paddingHorizontal: 13, paddingVertical: 10, backgroundColor: '#fff' },
  active: { backgroundColor: '#1a6fa8', borderColor: '#1a6fa8' },
  card: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e2eaf0', padding: 16, gap: 12, marginHorizontal: 18 },
  small: { color: '#647580', fontSize: 13, paddingHorizontal: 18 },
  heading: { fontSize: 20, lineHeight: 27, color: '#1a6fa8', fontWeight: '700' },
  title: { fontSize: 16, lineHeight: 23, color: '#2b4657', fontWeight: '600' },
  copy: { color: '#526572', fontSize: 15, lineHeight: 22 },
  content: { color: '#344b59', fontSize: 16, lineHeight: 26 },
  link: { color: '#1a6fa8', fontWeight: '600', fontSize: 14 },
  verified: { color: '#26734d', fontWeight: '700' },
  caution: { color: '#8a4d0f', fontWeight: '700' },
  notice: { padding: 28, alignItems: 'center', gap: 10 },
  error: { color: '#a12525', lineHeight: 22 },
  choice: { paddingVertical: 10, minHeight: 44 },
});
