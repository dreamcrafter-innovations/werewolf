import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Animated, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Gradient        from '../components/Gradient';
import TabletContainer from '../components/TabletContainer';
import { usePalette }  from '../hooks/usePalette';
import { useGame }     from '../context/GameContext';
import { awardBadge }  from '../storage';
import { logScreenView } from '../utils/analytics';

const STEPS = [
  {
    id: 'overview',
    emoji: '🌕',
    title: 'The Story',
    body:
      'Haunted Village is a social deduction party game. Each night, the evil team secretly eliminates a villager. ' +
      'Each day, the village debates and votes to eliminate a suspect.\n\n' +
      'The village wins when all evil players are eliminated.\n' +
      'The evil team wins when they equal or outnumber the good players.',
    tip: '💡 One phone is shared by everyone — pass it around each turn.',
  },
  {
    id: 'setup',
    emoji: '🪔',
    title: 'Setup',
    body:
      '1. Choose a villain theme (Werewolf, Vampire, Zombie…)\n' +
      '2. Add 4–16 players by name\n' +
      '3. Tap Start Game — roles are secretly assigned\n' +
      '4. Pass the phone to each player to see their private role',
    tip: '💡 More players = more chaos. 6–10 is the sweet spot!',
  },
  {
    id: 'roles',
    emoji: '🎭',
    title: 'The Roles',
    roles: [
      { emoji: '👿', name: 'Evil One',  desc: 'Eliminates a villager each night. Blends in by day.' },
      { emoji: '🔮', name: 'Seer',      desc: 'Each night secretly checks one player\'s true alignment.' },
      { emoji: '🌿', name: 'Healer',    desc: 'Protects one player each night. Can protect themselves once.' },
      { emoji: '🏹', name: 'Hunter',    desc: 'When eliminated by vote, takes one other player with them!' },
      { emoji: '👑', name: 'Chief',     desc: 'Counts as two votes. Can break voting ties.' },
      { emoji: '🧑‍🌾', name: 'Villager', desc: 'No special power — use your wit to find the evil!' },
    ],
  },
  {
    id: 'night',
    emoji: '🌑',
    title: 'Night Phase',
    body:
      'The narrator reads the night script aloud. Players wake up one by one:\n\n' +
      '• Evil One — secretly chooses a target to eliminate\n' +
      '• Healer — secretly chooses someone to protect\n' +
      '• Seer — secretly checks one player\'s alignment\n\n' +
      'All actions are private — only the narrator (app) records the result.',
    tip: '💡 Keep your role secret! A known Seer becomes target #1.',
  },
  {
    id: 'day',
    emoji: '☀️',
    title: 'Day Phase',
    body:
      'Everyone learns what happened last night. Then the debate begins!\n\n' +
      '• Discuss who you think is evil — share observations, logic, suspicions\n' +
      '• When ready, the group votes\n' +
      '• The player with the most votes is eliminated\n' +
      '• In a tie, no one is eliminated that day',
    tip: '💡 Evil players should blend in — act suspicious of others!',
  },
];

function RoleCard({ role, C }) {
  return (
    <View style={[styles.roleCard, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
      <Text style={styles.roleCardEmoji}>{role.emoji}</Text>
      <View style={styles.roleCardText}>
        <Text style={[styles.roleCardName, { color: C.text }]}>{role.name}</Text>
        <Text style={[styles.roleCardDesc, { color: C.textSecondary }]}>{role.desc}</Text>
      </View>
    </View>
  );
}

export default function HowToPlayScreen({ navigation }) {
  const C = usePalette();
  const { villainTheme } = useGame();
  const { width }    = useWindowDimensions();
  const isTablet     = width >= 768;

  const [step,     setStep]     = useState(0);
  const fadeAnim   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    logScreenView('HowToPlayScreen');
    // Award tutorial badge
    awardBadge('howtoplay');
  }, []);

  function goTo(idx) {
    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setStep(idx);
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  }

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  return (
    <Gradient colors={villainTheme.gradientBg} style={styles.flex}>
      <SafeAreaView style={styles.safe}>
        <TabletContainer>
          <ScrollView contentContainerStyle={[styles.scroll, isTablet && styles.scrollTablet]}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled">

            {/* Close button */}
            <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()}>
              <Text style={[styles.closeTxt, { color: C.textSecondary }]}>✕ Close</Text>
            </Pressable>

            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: C.primary }]}>How to Play</Text>
              <Text style={[styles.headerSub, { color: C.textSecondary }]}>Haunted Village</Text>
            </View>

            {/* Step dots */}
            <View style={styles.dotsRow}>
              {STEPS.map((_, i) => (
                <Pressable key={i} onPress={() => goTo(i)}>
                  <View style={[
                    styles.dot,
                    {
                      backgroundColor: i === step ? C.primary : C.cardBorder,
                      width:           i === step ? 20 : 8,
                    },
                  ]} />
                </Pressable>
              ))}
            </View>

            {/* Step content */}
            <Animated.View style={[styles.contentWrap, { opacity: fadeAnim }]}>
              <Text style={styles.stepEmoji}>{current.emoji}</Text>
              <Text style={[styles.stepTitle, { color: C.text }]}>{current.title}</Text>

              {current.body ? (
                <Text style={[styles.stepBody, { color: C.textSecondary }]}>{current.body}</Text>
              ) : null}

              {current.roles ? (
                <View style={styles.roleList}>
                  {current.roles.map(r => <RoleCard key={r.name} role={r} C={C} />)}
                </View>
              ) : null}

              {current.tip ? (
                <View style={[styles.tipBox, { backgroundColor: C.primary + '18', borderColor: C.primary + '55' }]}>
                  <Text style={[styles.tipText, { color: C.primary }]}>{current.tip}</Text>
                </View>
              ) : null}
            </Animated.View>

            {/* Navigation */}
            <View style={styles.navRow}>
              <Pressable
                style={[styles.navBtn, { opacity: step === 0 ? 0.3 : 1 }]}
                onPress={() => step > 0 && goTo(step - 1)}
                disabled={step === 0}
              >
                <Text style={[styles.navBtnText, { color: C.textSecondary }]}>← Back</Text>
              </Pressable>

              {!isLast ? (
                <Pressable
                  style={[styles.nextBtn, { backgroundColor: C.primary }]}
                  onPress={() => goTo(step + 1)}
                >
                  <Text style={styles.nextBtnText}>Next →</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.nextBtn, { backgroundColor: C.primary }]}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.nextBtnText}>Done ✓</Text>
                </Pressable>
              )}
            </View>

            {/* Step counter */}
            <Text style={[styles.counter, { color: C.textDim }]}>
              {step + 1} / {STEPS.length}
            </Text>

          </ScrollView>
        </TabletContainer>
      </SafeAreaView>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  flex:             { flex: 1 },
  safe:             { flex: 1 },
  scroll:           { padding: 20, paddingBottom: 48, alignItems: 'center' },
  scrollTablet:     { paddingHorizontal: 40 },
  closeBtn:         { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 4 },
  closeTxt:         { fontSize: 14, fontWeight: '600' },
  header:           { alignItems: 'center', marginBottom: 16 },
  headerTitle:      { fontSize: 26, fontWeight: '800' },
  headerSub:        { fontSize: 13, marginTop: 2 },
  dotsRow:          { flexDirection: 'row', gap: 8, marginBottom: 28, alignItems: 'center' },
  dot:              { height: 8, borderRadius: 4 },
  contentWrap:      { width: '100%', maxWidth: 440, alignItems: 'center' },
  stepEmoji:        { fontSize: 72, marginBottom: 12 },
  stepTitle:        { fontSize: 22, fontWeight: '800', marginBottom: 14, textAlign: 'center' },
  stepBody:         { fontSize: 15, lineHeight: 24, textAlign: 'left', width: '100%', marginBottom: 16 },
  roleList:         { width: '100%', gap: 10, marginBottom: 16 },
  roleCard:         { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 12, borderWidth: 1, padding: 12, gap: 12 },
  roleCardEmoji:    { fontSize: 26 },
  roleCardText:     { flex: 1 },
  roleCardName:     { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  roleCardDesc:     { fontSize: 13, lineHeight: 18 },
  tipBox:           { borderRadius: 12, borderWidth: 1, padding: 14, width: '100%', marginTop: 4 },
  tipText:          { fontSize: 13, lineHeight: 20, fontWeight: '600' },
  navRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 440, marginTop: 28 },
  navBtn:           { paddingVertical: 12, paddingHorizontal: 20 },
  navBtnText:       { fontSize: 15, fontWeight: '600' },
  nextBtn:          { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  nextBtnText:      { color: '#fff', fontWeight: '800', fontSize: 15 },
  counter:          { fontSize: 12, marginTop: 12 },
});
