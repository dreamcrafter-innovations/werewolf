import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Gradient        from '../components/Gradient';
import TabletContainer from '../components/TabletContainer';
import { usePalette }  from '../hooks/usePalette';
import { useGame }     from '../context/GameContext';
import { VILLAIN_THEME_LIST, getTheme } from '../data/villainThemes';
import {
  loadDailyChallenge, saveDailyChallenge, awardBadge, loadMeta, saveMeta,
} from '../storage';
import { logScreenView, logDailyChallengeStarted } from '../utils/analytics';

// ── Daily challenge determinism ───────────────────────────────────
// Same seed per calendar day ensures every player sees the same challenge.
function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function generateChallenge(dateStr) {
  // Simple hash to pick a deterministic villain + player count
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  const absHash     = Math.abs(hash);
  const villainIdx  = absHash % VILLAIN_THEME_LIST.length;
  const villain     = VILLAIN_THEME_LIST[villainIdx];
  // player count ranges 5–10
  const playerCount = 5 + (absHash % 6);
  return { date: dateStr, villainThemeId: villain.id, playerCount, completed: false };
}

export default function DailyScreen({ navigation }) {
  const C = usePalette();
  const { setVillainTheme, resetGame } = useGame();
  const { width }    = useWindowDimensions();
  const isTablet     = width >= 768;

  const [challenge,  setChallenge]  = useState(null);
  const [completed,  setCompleted]  = useState(false);
  const [streakCount, setStreakCount] = useState(0);

  const loadToday = useCallback(async () => {
    const today  = todayString();
    let stored   = await loadDailyChallenge();

    // If no stored challenge or it's stale, generate a fresh one
    if (!stored || stored.date !== today) {
      stored = generateChallenge(today);
      await saveDailyChallenge(stored);
    }
    setChallenge(stored);
    setCompleted(stored.completed ?? false);
  }, []);

  useEffect(() => {
    logScreenView('DailyScreen');
    loadToday();
  }, []);

  async function handleStartChallenge() {
    if (!challenge) return;
    logDailyChallengeStarted(challenge.villainThemeId);
    setVillainTheme(challenge.villainThemeId);
    resetGame(challenge.villainThemeId);
    navigation.navigate('Setup');
  }

  async function handleMarkComplete() {
    if (!challenge || completed) return;
    const updated = { ...challenge, completed: true };
    await saveDailyChallenge(updated);
    setCompleted(true);
    // daily_1 on the first completion ever; daily_7 once 7 have been completed (not
    // necessarily consecutive — the count lives in meta alongside the game-play streak).
    await awardBadge('daily_1');
    const meta = await loadMeta();
    const dailyCompletedCount = (meta.dailyCompletedCount || 0) + 1;
    await saveMeta({ ...meta, dailyCompletedCount });
    if (dailyCompletedCount >= 7) await awardBadge('daily_7');
  }

  // getTheme() attaches roles + palette to the raw theme object
  const villain = challenge ? getTheme(challenge.villainThemeId) : null;

  return (
    <Gradient colors={[C.bg, C.surface, C.bg]} style={styles.flex}>
      <SafeAreaView style={styles.safe}>
        <TabletContainer>
          <ScrollView contentContainerStyle={[styles.scroll, isTablet && styles.scrollTablet]}
                      showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerEmoji}>🎯</Text>
              <Text style={[styles.headerTitle, { color: C.text }]}>Daily Challenge</Text>
              <Text style={[styles.headerSub, { color: C.textSecondary }]}>
                Refreshes every midnight
              </Text>
            </View>

            {challenge && villain ? (
              <>
                {/* Challenge card */}
                <View style={[
                  styles.challengeCard,
                  {
                    backgroundColor: villain.color + '18',
                    borderColor:     completed ? C.success : villain.color,
                    borderWidth:     2,
                  },
                ]}>
                  {completed && (
                    <View style={[styles.completedBanner, { backgroundColor: C.success }]}>
                      <Text style={styles.completedText}>✓ Completed Today!</Text>
                    </View>
                  )}
                  <Text style={styles.challengeEmoji}>{villain.emoji}</Text>
                  <Text style={[styles.challengeTitle, { color: villain.color }]}>
                    {villain.label} Night
                  </Text>
                  <Text style={[styles.challengeAtmo, { color: C.textSecondary }]}>
                    "{villain.atmosphere}"
                  </Text>

                  <View style={[styles.metaRow, { borderTopColor: C.cardBorder }]}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaEmoji}>👥</Text>
                      <Text style={[styles.metaVal, { color: C.text }]}>{challenge.playerCount}+</Text>
                      <Text style={[styles.metaLabel, { color: C.textDim }]}>players</Text>
                    </View>
                    <View style={[styles.metaDivider, { backgroundColor: C.cardBorder }]} />
                    <View style={styles.metaItem}>
                      <Text style={styles.metaEmoji}>{villain.homeMoon}</Text>
                      <Text style={[styles.metaVal, { color: C.text }]}>{villain.sublabel}</Text>
                      <Text style={[styles.metaLabel, { color: C.textDim }]}>mode</Text>
                    </View>
                    <View style={[styles.metaDivider, { backgroundColor: C.cardBorder }]} />
                    <View style={styles.metaItem}>
                      <Text style={styles.metaEmoji}>⏱️</Text>
                      <Text style={[styles.metaVal, { color: C.text }]}>~20</Text>
                      <Text style={[styles.metaLabel, { color: C.textDim }]}>min</Text>
                    </View>
                  </View>
                </View>

                {/* Role preview */}
                <Text style={[styles.rolesLabel, { color: C.textDim }]}>TODAY'S ROLES</Text>
                <View style={styles.rolesRow}>
                  {Object.values(villain.roles ?? {}).map(r => (
                    <View key={r.name} style={[styles.roleChip, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
                      <Text style={styles.roleEmoji}>{r.emoji}</Text>
                      <Text style={[styles.roleName, { color: C.textSecondary }]}>{r.name}</Text>
                    </View>
                  ))}
                </View>

                {/* CTA buttons */}
                {!completed ? (
                  <>
                    <Pressable
                      style={[styles.startBtn, { backgroundColor: villain.color, shadowColor: villain.color }]}
                      onPress={handleStartChallenge}
                    >
                      <Text style={styles.startBtnText}>▶  Start Today's Challenge</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.doneBtn, { borderColor: C.success }]}
                      onPress={handleMarkComplete}
                    >
                      <Text style={[styles.doneBtnText, { color: C.success }]}>✓  Mark as Completed</Text>
                    </Pressable>
                  </>
                ) : (
                  <View style={[styles.completedRow, { backgroundColor: C.success + '22', borderColor: C.success }]}>
                    <Text style={[styles.completedRowText, { color: C.success }]}>
                      🎉 Challenge completed! Come back tomorrow.
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.loading}>
                <Text style={[styles.loadingText, { color: C.textSecondary }]}>Loading today's challenge…</Text>
              </View>
            )}

            {/* Info box */}
            <View style={[styles.infoBox, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
              <Text style={[styles.infoTitle, { color: C.primary }]}>How it works</Text>
              <Text style={[styles.infoBody, { color: C.textSecondary }]}>
                Every day a new villain and player count are randomly selected. Play with your group
                using the challenge settings, then mark it complete to earn your Daily badge. 🏅
              </Text>
            </View>

          </ScrollView>
        </TabletContainer>
      </SafeAreaView>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  flex:             { flex: 1 },
  safe:             { flex: 1 },
  scroll:           { padding: 20, paddingBottom: 48 },
  scrollTablet:     { paddingHorizontal: 32 },
  header:           { alignItems: 'center', marginBottom: 24, marginTop: 4 },
  headerEmoji:      { fontSize: 36, marginBottom: 6 },
  headerTitle:      { fontSize: 26, fontWeight: '800' },
  headerSub:        { fontSize: 13, marginTop: 2 },
  challengeCard:    { borderRadius: 20, overflow: 'hidden', marginBottom: 20, padding: 24, alignItems: 'center' },
  completedBanner:  { position: 'absolute', top: 0, left: 0, right: 0, paddingVertical: 8, alignItems: 'center' },
  completedText:    { color: '#fff', fontWeight: '800', fontSize: 13 },
  challengeEmoji:   { fontSize: 64, marginTop: 24, marginBottom: 8 },
  challengeTitle:   { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  challengeAtmo:    { fontSize: 14, fontStyle: 'italic', textAlign: 'center', marginBottom: 20 },
  metaRow:          { flexDirection: 'row', borderTopWidth: 1, paddingTop: 16, width: '100%', justifyContent: 'space-around' },
  metaItem:         { alignItems: 'center', flex: 1 },
  metaEmoji:        { fontSize: 20, marginBottom: 4 },
  metaVal:          { fontSize: 16, fontWeight: '700' },
  metaLabel:        { fontSize: 11, marginTop: 2 },
  metaDivider:      { width: 1, height: '100%' },
  rolesLabel:       { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 },
  rolesRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  roleChip:         { alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  roleEmoji:        { fontSize: 22 },
  roleName:         { fontSize: 11, marginTop: 2 },
  startBtn:         { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 12, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  startBtnText:     { color: '#fff', fontWeight: '800', fontSize: 17 },
  doneBtn:          { borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, marginBottom: 16 },
  doneBtnText:      { fontWeight: '700', fontSize: 15 },
  completedRow:     { borderRadius: 14, borderWidth: 1.5, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  completedRowText: { fontWeight: '700', fontSize: 15 },
  infoBox:          { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 4 },
  infoTitle:        { fontSize: 13, fontWeight: '800', marginBottom: 6 },
  infoBody:         { fontSize: 13, lineHeight: 20 },
  loading:          { alignItems: 'center', marginTop: 60 },
  loadingText:      { fontSize: 15 },
});
