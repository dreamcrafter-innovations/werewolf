import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Platform, Linking,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import Gradient         from '../components/Gradient';
import TabletContainer  from '../components/TabletContainer';
import SectionLabel     from '../components/SectionLabel';
import Toggle           from '../components/Toggle';

import { usePalette } from '../hooks/usePalette';
import { loadSettings, saveSettings } from '../storage';
import { logScreenView, logSettingsChanged } from '../utils/analytics';
import { openSupportLink } from '../utils/supportLink';
import { setHapticsEnabledCache } from '../utils/haptics';

const PRIVACY_URL = 'https://www.dreamcrafterinnovations.com/privacy-policy';

export default function SettingsScreen({ navigation }) {
  const C = usePalette();
  const { width }  = useWindowDimensions();
  const isTablet   = width >= 768;

  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [narratorEnabled, setNarratorEnabled] = useState(false);

  useEffect(() => {
    logScreenView('SettingsScreen');
  }, []);

  // Re-read settings every time this tab regains focus — narratorEnabled in particular
  // has its own toggle on the Home tab too, and since tab screens never unmount, a
  // change made there would otherwise never show up here until the app restarts.
  useFocusEffect(
    useCallback(() => {
      loadSettings().then(s => {
        if (s?.hapticsEnabled !== undefined) setHapticsEnabled(s.hapticsEnabled);
        if (s?.narratorEnabled !== undefined) setNarratorEnabled(s.narratorEnabled);
      });
    }, [])
  );

  async function toggleHaptics() {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    setHapticsEnabledCache(next); // instant effect app-wide, no storage round-trip needed
    const s = (await loadSettings()) ?? {};
    await saveSettings({ ...s, hapticsEnabled: next });
    logSettingsChanged('haptics', !next, next);
  }

  async function toggleNarrator() {
    const next = !narratorEnabled;
    setNarratorEnabled(next);
    const s = (await loadSettings()) ?? {};
    await saveSettings({ ...s, narratorEnabled: next });
    logSettingsChanged('narrator', !next, next);
  }

  async function handleSupportPress() {
    try {
      await openSupportLink(Linking.openURL, Platform.OS);
    } catch (_) {}
  }

  async function openPrivacy() {
    try {
      if (Platform.OS === 'web') {
        globalThis?.open?.(PRIVACY_URL, '_blank', 'noopener,noreferrer');
      } else {
        await Linking.openURL(PRIVACY_URL);
      }
    } catch (_) {}
  }

  const sectionTitleStyle  = { color: C.primary, ...styles.sectionTitle };
  const rowStyle           = [styles.row, { backgroundColor: C.card, borderColor: C.cardBorder }];
  const rowLabelStyle      = { color: C.text };
  const rowSubStyle        = { color: C.textSecondary };
  const divStyle           = [styles.divider, { backgroundColor: C.cardBorder }];

  return (
    <Gradient colors={[C.bg, C.surface, C.bg]} style={styles.flex}>
      <SafeAreaView style={styles.safe}>
        <TabletContainer>
          <ScrollView contentContainerStyle={[styles.scroll, isTablet && styles.scrollTablet]}
                      showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerEmoji]}>⚙️</Text>
              <Text style={[styles.headerTitle, { color: C.text }]}>Settings</Text>
              <Text style={[styles.headerSub, { color: C.textSecondary }]}>
                Haunted Village
              </Text>
            </View>

            {/* ── AUDIO ─────────────────────────────────────────── */}
            {/* No "Sound Effects" toggle here — there are no sound assets or audio
                library in this project yet, so a switch for it would do nothing.
                Add it back once real sound effects are wired up. */}
            <SectionLabel style={{ color: C.primary }}>Audio &amp; Feel</SectionLabel>
            <View style={[styles.card, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
              <View style={rowStyle}>
                <View style={styles.rowTextWrap}>
                  <Text style={rowLabelStyle}>Haptic Feedback</Text>
                  <Text style={[styles.rowSub, rowSubStyle]}>Vibration on key actions</Text>
                </View>
                <Toggle value={hapticsEnabled} onToggle={toggleHaptics} activeColor={C.primary} />
              </View>
              <View style={divStyle} />
              <View style={rowStyle}>
                <View style={styles.rowTextWrap}>
                  <Text style={rowLabelStyle}>Voice Narration</Text>
                  <Text style={[styles.rowSub, rowSubStyle]}>Reads night-phase prompts aloud</Text>
                </View>
                <Toggle value={narratorEnabled} onToggle={toggleNarrator} activeColor={C.primary} />
              </View>
            </View>

            {/* ── HOW TO PLAY ───────────────────────────────────── */}
            <SectionLabel style={[styles.sectionGap, { color: C.primary }]}>About</SectionLabel>
            <View style={[styles.card, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
              <Pressable
                style={rowStyle}
                onPress={() => navigation.navigate('HowToPlay')}
              >
                <View style={styles.rowTextWrap}>
                  <Text style={rowLabelStyle}>How to Play</Text>
                  <Text style={[styles.rowSub, rowSubStyle]}>Rules, roles &amp; strategy</Text>
                </View>
                <Text style={{ color: C.textDim, fontSize: 18 }}>›</Text>
              </Pressable>
              <View style={divStyle} />
              <Pressable style={rowStyle} onPress={openPrivacy}>
                <View style={styles.rowTextWrap}>
                  <Text style={rowLabelStyle}>Privacy Policy</Text>
                  <Text style={[styles.rowSub, rowSubStyle]}>dreamcrafterinnovations.com</Text>
                </View>
                <Text style={{ color: C.textDim, fontSize: 18 }}>›</Text>
              </Pressable>
            </View>

            {/* ── SUPPORT US ───────────────────────────────────── */}
            <SectionLabel style={[styles.sectionGap, { color: C.primary }]}>Support Us</SectionLabel>
            <View style={[styles.card, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
              <View style={rowStyle}>
                <View style={styles.rowTextWrap}>
                  <Text style={rowLabelStyle}>Enjoying Haunted Village?</Text>
                  <Text style={[styles.rowSub, rowSubStyle]}>Help us keep building free games ☕</Text>
                </View>
              </View>
              <View style={divStyle} />
              <Pressable
                style={[rowStyle, styles.kofiRow, { backgroundColor: '#FF5E5B' + '18', borderColor: '#FF5E5B' }]}
                onPress={handleSupportPress}
              >
                <Text style={styles.kofiEmoji}>☕</Text>
                <View style={styles.rowTextWrap}>
                  <Text style={[rowLabelStyle, { color: '#FF5E5B', fontWeight: '700' }]}>Buy us a Ko-fi</Text>
                  <Text style={[styles.rowSub, rowSubStyle]}>ko-fi.com/dreamcrafterinnovations</Text>
                </View>
                <Text style={{ color: '#FF5E5B', fontSize: 18 }}>›</Text>
              </Pressable>
            </View>

            {/* ── APP INFO ──────────────────────────────────────── */}
            <Text style={[styles.versionText, { color: C.textDim }]}>
              Haunted Village  ·  Dreamcrafter Innovations
            </Text>
          </ScrollView>
        </TabletContainer>
      </SafeAreaView>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  flex:            { flex: 1 },
  safe:            { flex: 1 },
  scroll:          { padding: 20, paddingBottom: 40 },
  scrollTablet:    { paddingHorizontal: 32 },
  header:          { alignItems: 'center', marginBottom: 28, marginTop: 4 },
  headerEmoji:     { fontSize: 36, marginBottom: 6 },
  headerTitle:     { fontSize: 26, fontWeight: '800', letterSpacing: 0.5 },
  headerSub:       { fontSize: 13, marginTop: 2 },
  sectionGap:      { marginTop: 22 },
  card:            { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 4 },
  row:             { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowTextWrap:     { flex: 1 },
  rowSub:          { fontSize: 12, marginTop: 2 },
  divider:         { height: 1, marginHorizontal: 16 },
  // Ko-fi
  kofiRow:         { borderWidth: 1, borderRadius: 0, marginHorizontal: 0 },
  kofiEmoji:       { fontSize: 22, marginRight: 12 },
  // footer
  sectionTitle:    { fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  versionText:     { textAlign: 'center', fontSize: 12, marginTop: 28, marginBottom: 8 },
});
