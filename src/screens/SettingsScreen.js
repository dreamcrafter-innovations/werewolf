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
import { NARRATOR_DEFAULTS } from '../hooks/useSpeech';

let Speech = null;
try { Speech = require('expo-speech'); } catch (_) {}

const PRIVACY_URL = 'https://www.dreamcrafterinnovations.com/privacy-policy';

// Discussion timer choices, in seconds. 0 = no timer (the original behaviour).
const TIMER_OPTIONS = [
  { secs: 0,   label: 'Off' },
  { secs: 60,  label: '1 min' },
  { secs: 120, label: '2 min' },
  { secs: 180, label: '3 min' },
  { secs: 300, label: '5 min' },
];

const RATE_OPTIONS  = [{ v: 0.7, label: 'Slow' }, { v: 0.85, label: 'Normal' }, { v: 1.0, label: 'Fast' }];
const PITCH_OPTIONS = [{ v: 0.7, label: 'Deep' }, { v: 0.9, label: 'Mid' },    { v: 1.1, label: 'High' }];

export default function SettingsScreen({ navigation }) {
  const C = usePalette();
  const { width }  = useWindowDimensions();
  const isTablet   = width >= 768;

  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [narratorEnabled, setNarratorEnabled] = useState(true); // default on — see useSpeech
  const [narratorRate, setNarratorRate]   = useState(NARRATOR_DEFAULTS.rate);
  const [narratorPitch, setNarratorPitch] = useState(NARRATOR_DEFAULTS.pitch);
  const [dayTimerSeconds, setDayTimerSeconds] = useState(0);

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
        if (s?.narratorRate !== undefined) setNarratorRate(s.narratorRate);
        if (s?.narratorPitch !== undefined) setNarratorPitch(s.narratorPitch);
        if (s?.dayTimerSeconds !== undefined) setDayTimerSeconds(s.dayTimerSeconds);
      });
    }, [])
  );

  // One writer for every simple settings key — each toggle below was otherwise
  // repeating the same load/merge/save/log dance.
  async function persist(key, value, setter) {
    setter(value);
    const s = (await loadSettings()) ?? {};
    await saveSettings({ ...s, [key]: value });
    logSettingsChanged(key, s[key], value);
  }

  function previewVoice(rate = narratorRate, pitch = narratorPitch) {
    try {
      Speech?.stop?.();
      Speech?.speak?.('The village sleeps. The evil ones awaken.', { rate, pitch });
    } catch (_) {}
  }

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
                  <Text style={[styles.rowSub, rowSubStyle]}>Reads night and morning prompts aloud</Text>
                </View>
                <Toggle value={narratorEnabled} onToggle={toggleNarrator} activeColor={C.primary} />
              </View>

              {narratorEnabled && (
                <>
                  <View style={divStyle} />
                  <View style={styles.stackRow}>
                    <Text style={[rowLabelStyle, styles.stackLabel]}>Narrator Speed</Text>
                    <View style={styles.segRow}>
                      {RATE_OPTIONS.map(o => {
                        const on = Math.abs(narratorRate - o.v) < 0.01;
                        return (
                          <Pressable key={o.label}
                            style={[styles.seg, { borderColor: on ? C.primary : C.cardBorder, backgroundColor: on ? C.primary + '22' : 'transparent' }]}
                            onPress={() => { persist('narratorRate', o.v, setNarratorRate); previewVoice(o.v, narratorPitch); }}>
                            <Text style={[styles.segTxt, { color: on ? C.primary : C.textSecondary }]}>{o.label}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                  <View style={divStyle} />
                  <View style={styles.stackRow}>
                    <Text style={[rowLabelStyle, styles.stackLabel]}>Narrator Voice</Text>
                    <View style={styles.segRow}>
                      {PITCH_OPTIONS.map(o => {
                        const on = Math.abs(narratorPitch - o.v) < 0.01;
                        return (
                          <Pressable key={o.label}
                            style={[styles.seg, { borderColor: on ? C.primary : C.cardBorder, backgroundColor: on ? C.primary + '22' : 'transparent' }]}
                            onPress={() => { persist('narratorPitch', o.v, setNarratorPitch); previewVoice(narratorRate, o.v); }}>
                            <Text style={[styles.segTxt, { color: on ? C.primary : C.textSecondary }]}>{o.label}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                  <View style={divStyle} />
                  <Pressable style={rowStyle} onPress={() => previewVoice()}>
                    <View style={styles.rowTextWrap}>
                      <Text style={[rowLabelStyle, { color: C.primary, fontWeight: '700' }]}>▶ Test the narrator</Text>
                      <Text style={[styles.rowSub, rowSubStyle]}>Hear the current speed and voice</Text>
                    </View>
                  </Pressable>
                </>
              )}
            </View>

            {/* ── GAMEPLAY ──────────────────────────────────────── */}
            <SectionLabel style={[styles.sectionGap, { color: C.primary }]}>Gameplay</SectionLabel>
            <View style={[styles.card, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
              <View style={styles.stackRow}>
                <Text style={[rowLabelStyle, styles.stackLabel]}>Discussion Timer</Text>
                <Text style={[styles.rowSub, rowSubStyle, { marginBottom: 10 }]}>
                  Countdown on the day screen before voting
                </Text>
                <View style={styles.segRow}>
                  {TIMER_OPTIONS.map(o => {
                    const on = dayTimerSeconds === o.secs;
                    return (
                      <Pressable key={o.label}
                        style={[styles.seg, { borderColor: on ? C.primary : C.cardBorder, backgroundColor: on ? C.primary + '22' : 'transparent' }]}
                        onPress={() => persist('dayTimerSeconds', o.secs, setDayTimerSeconds)}>
                        <Text style={[styles.segTxt, { color: on ? C.primary : C.textSecondary }]}>{o.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
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
  stackRow:        { paddingHorizontal: 16, paddingVertical: 14 },
  stackLabel:      { marginBottom: 2 },
  segRow:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  seg:             { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  segTxt:          { fontSize: 13, fontWeight: '700' },
  divider:         { height: 1, marginHorizontal: 16 },
  // Ko-fi
  kofiRow:         { borderWidth: 1, borderRadius: 0, marginHorizontal: 0 },
  kofiEmoji:       { fontSize: 22, marginRight: 12 },
  // footer
  sectionTitle:    { fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  versionText:     { textAlign: 'center', fontSize: 12, marginTop: 28, marginBottom: 8 },
});
