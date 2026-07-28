// ResultShareCard.js
// A styled card meant to be captured by ViewShot and shared to social media.
// Wrap it in a ViewShot ref to get a PNG.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS } from './theme';

export default function ResultShareCard({
  villainEmoji,
  villainLabel,
  villainColor,
  outcome,        // 'VILLAGE_WIN' | 'EVIL_WIN'
  outcomeTitle,
  outcomeEmoji,
  players,
  rounds,
  gradientColors, // [top, bottom] — used as bg on card
}) {
  const isVillageWin = outcome === 'VILLAGE_WIN';
  const accentColor  = isVillageWin ? '#27AE60' : villainColor;
  const bg           = gradientColors?.[1] ?? '#0B0B1E';
  const evilPlayers  = players.filter(p => p.role === 'VILLAIN' || p.role === 'DON');
  const deadCount    = players.filter(p => !p.isAlive).length;

  return (
    <View style={[styles.card, { backgroundColor: bg, borderColor: accentColor }]}>
      {/* Header band */}
      <View style={[styles.band, { backgroundColor: accentColor + '33' }]}>
        <Text style={styles.appName}>🐺 Werewolf</Text>
      </View>

      {/* Outcome */}
      <View style={styles.center}>
        <Text style={styles.bigEmoji}>{outcomeEmoji}</Text>
        <Text style={[styles.title, { color: accentColor }]}>{outcomeTitle}</Text>
        <View style={[styles.themeRow, { borderColor: accentColor + '55' }]}>
          <Text style={styles.themeEmoji}>{villainEmoji}</Text>
          <Text style={[styles.themeLabel, { color: accentColor }]}>{villainLabel} Night</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          [players.length, 'Players'],
          [rounds, 'Rounds'],
          [deadCount, 'Fallen'],
        ].map(([v, l]) => (
          <View key={l} style={[styles.statBox, { borderColor: accentColor + '44' }]}>
            <Text style={[styles.statVal, { color: accentColor }]}>{v}</Text>
            <Text style={styles.statLbl}>{l}</Text>
          </View>
        ))}
      </View>

      {/* Evil reveal */}
      <View style={styles.evilRow}>
        {evilPlayers.slice(0, 5).map(p => (
          <View key={p.id} style={[styles.evilChip, { borderColor: accentColor + '66' }]}>
            <Text style={styles.evilAv}>{p.avatar}</Text>
            <Text style={[styles.evilName, { color: '#EEE' }]}>{p.name}</Text>
            {isVillageWin && <Text style={styles.caughtTag}>🚨</Text>}
          </View>
        ))}
        {evilPlayers.length > 5 && (
          <Text style={[styles.moreTag, { color: accentColor }]}>+{evilPlayers.length - 5} more</Text>
        )}
      </View>

      {/* Footer */}
      <Text style={styles.footer}>Play at dreamcrafters.app</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    width: 320,
  },
  band: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  appName: {
    color: '#AAA',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  center: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  bigEmoji: { fontSize: 64, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  themeEmoji: { fontSize: 18 },
  themeLabel: { fontSize: 13, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statBox: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statVal: { fontSize: 22, fontWeight: '800' },
  statLbl: { fontSize: 10, color: '#888', fontWeight: '600', marginTop: 2 },
  evilRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 14,
    justifyContent: 'center',
  },
  evilChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  evilAv: { fontSize: 16 },
  evilName: { fontSize: 12, fontWeight: '600' },
  caughtTag: { fontSize: 11 },
  moreTag: { fontSize: 12, fontWeight: '700', alignSelf: 'center' },
  footer: {
    color: '#555',
    fontSize: 10,
    textAlign: 'center',
    paddingBottom: 10,
    letterSpacing: 1,
  },
});
