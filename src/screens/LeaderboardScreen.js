import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Gradient        from '../components/Gradient';
import TabletContainer from '../components/TabletContainer';
import { usePalette }  from '../hooks/usePalette';
import { loadAlltimeStats, loadEarnedBadges, loadMeta } from '../storage';
import { logScreenView } from '../utils/analytics';
import { BADGES } from '../data/badges';

function StatBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <View style={styles.barBg}>
      <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

function PlayerCard({ player, rank, C, max }) {
  const winRate = player.roundsPlayed > 0
    ? Math.round((player.wins / player.roundsPlayed) * 100)
    : 0;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
  return (
    <View style={[styles.playerCard, { backgroundColor: C.card, borderColor: rank === 1 ? C.primary : C.cardBorder }]}>
      <Text style={[styles.rank, { color: rank <= 3 ? C.primary : C.textSecondary }]}>{medal}</Text>
      <View style={styles.playerInfo}>
        <Text style={[styles.playerName, { color: C.text }]}>{player.name}</Text>
        <StatBar value={player.wins} max={max} color={C.village} />
        <View style={styles.statsRow}>
          <Text style={[styles.statItem, { color: C.textSecondary }]}>
            🎮 {player.roundsPlayed} rounds
          </Text>
          <Text style={[styles.statItem, { color: C.village }]}>
            ✅ {player.wins} wins
          </Text>
          <Text style={[styles.statItem, { color: C.textDim }]}>
            ❌ {player.losses} losses
          </Text>
        </View>
      </View>
      <View style={[styles.winRateBadge, {
        backgroundColor: winRate >= 50 ? C.success + '33' : C.danger + '22',
        borderColor:     winRate >= 50 ? C.success : C.danger,
      }]}>
        <Text style={[styles.winRateNum, { color: winRate >= 50 ? C.success : C.danger }]}>
          {winRate}%
        </Text>
        <Text style={[styles.winRateLabel, { color: C.textDim }]}>win</Text>
      </View>
    </View>
  );
}

export default function LeaderboardScreen() {
  const C = usePalette();
  const { width }  = useWindowDimensions();
  const isTablet   = width >= 768;

  const [stats,      setStats]      = useState(null);
  const [badges,     setBadges]     = useState(new Set());
  const [meta,       setMeta]       = useState(null);
  const [activeTab,  setActiveTab]  = useState('players'); // 'players' | 'badges'

  useEffect(() => {
    logScreenView('LeaderboardScreen');
    loadAlltimeStats().then(setStats);
    loadEarnedBadges().then(setBadges);
    loadMeta().then(setMeta);
  }, []);

  const players = stats
    ? Object.values(stats.playerStats)
        .filter(p => p.roundsPlayed > 0)
        .sort((a, b) => b.wins - a.wins || b.roundsPlayed - a.roundsPlayed)
    : [];

  const maxWins = players.reduce((m, p) => Math.max(m, p.wins), 1);

  return (
    <Gradient colors={[C.bg, C.surface, C.bg]} style={styles.flex}>
      <SafeAreaView style={styles.safe}>
        <TabletContainer>
          <ScrollView contentContainerStyle={[styles.scroll, isTablet && styles.scrollTablet]}
                      showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerEmoji}>🏆</Text>
              <Text style={[styles.headerTitle, { color: C.text }]}>Leaderboard</Text>
              <Text style={[styles.headerSub, { color: C.textSecondary }]}>
                {stats ? `${stats.totalRounds} rounds played` : 'No games yet'}
              </Text>
            </View>

            {/* Global stats */}
            {stats && stats.totalRounds > 0 && (
              <View style={[styles.globalRow, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
                {[
                  { label: 'Village', val: stats.villageWins, emoji: '🪔', color: C.village },
                  { label: 'Evil',    val: stats.evilWins,    emoji: '👿', color: C.evil },
                  { label: 'Total',   val: stats.totalRounds, emoji: '🎮', color: C.primary },
                ].map(({ label, val, emoji, color }) => (
                  <View key={label} style={styles.globalItem}>
                    <Text style={styles.globalEmoji}>{emoji}</Text>
                    <Text style={[styles.globalVal, { color }]}>{val}</Text>
                    <Text style={[styles.globalLabel, { color: C.textSecondary }]}>{label}</Text>
                  </View>
                ))}
              </View>
            )}

            {meta && (
              <View style={[styles.streakRow, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
                <Text style={[styles.streakItem, { color: C.textSecondary }]}>🔥 Current streak: {meta.currentStreak || 0}</Text>
                <Text style={[styles.streakItem, { color: C.textSecondary }]}>🏆 Best streak: {meta.bestStreak || 0}</Text>
              </View>
            )}

            {/* Tab switcher */}
            <View style={[styles.tabs, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
              {[['players', '👥 Players'], ['badges', '🏅 Badges']].map(([id, label]) => (
                <View
                  key={id}
                  style={[
                    styles.tab,
                    activeTab === id && { backgroundColor: C.primary + '22', borderColor: C.primary, borderWidth: 1 },
                  ]}
                >
                  <Text
                    onPress={() => setActiveTab(id)}
                    style={[styles.tabLabel, { color: activeTab === id ? C.primary : C.textSecondary }]}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Players list */}
            {activeTab === 'players' && (
              players.length > 0 ? players.map((p, i) => (
                <PlayerCard key={p.name} player={p} rank={i + 1} C={C} max={maxWins} />
              )) : (
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>👥</Text>
                  <Text style={[styles.emptyText, { color: C.textSecondary }]}>
                    No stats yet — finish a game to see scores here!
                  </Text>
                </View>
              )
            )}

            {/* Badges */}
            {activeTab === 'badges' && (
              <View style={[styles.badgeGrid, isTablet && styles.badgeGridTablet]}>
                {BADGES.map(b => {
                  const earned = badges.has(b.id);
                  return (
                    <View key={b.id} style={[
                      styles.badgeCard,
                      {
                        backgroundColor: earned ? C.primary + '15' : C.card,
                        borderColor:     earned ? C.primary : C.cardBorder,
                        borderWidth:     earned ? 2 : 1,
                        opacity:         earned ? 1 : 0.5,
                      },
                      isTablet && styles.badgeCardTablet,
                    ]}>
                      <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                      <Text style={[styles.badgeName, { color: earned ? C.primary : C.text }]}>
                        {b.name}
                      </Text>
                      <Text style={[styles.badgeDesc, { color: C.textDim }]}>
                        {b.description}
                      </Text>
                      {earned && <Text style={styles.badgeTick}>✓</Text>}
                    </View>
                  );
                })}
              </View>
            )}

          </ScrollView>
        </TabletContainer>
      </SafeAreaView>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  flex:             { flex: 1 },
  safe:             { flex: 1 },
  scroll:           { padding: 20, paddingBottom: 40 },
  scrollTablet:     { paddingHorizontal: 32 },
  header:           { alignItems: 'center', marginBottom: 20, marginTop: 4 },
  headerEmoji:      { fontSize: 36, marginBottom: 6 },
  headerTitle:      { fontSize: 26, fontWeight: '800' },
  headerSub:        { fontSize: 13, marginTop: 2 },
  globalRow:        { flexDirection: 'row', justifyContent: 'space-around', borderRadius: 14, borderWidth: 1, paddingVertical: 16, marginBottom: 16 },
  streakRow:        { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 12, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 16 },
  streakItem:       { fontSize: 12, fontWeight: '700' },
  globalItem:       { alignItems: 'center' },
  globalEmoji:      { fontSize: 22, marginBottom: 4 },
  globalVal:        { fontSize: 22, fontWeight: '800' },
  globalLabel:      { fontSize: 12, marginTop: 2 },
  tabs:             { flexDirection: 'row', borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  tab:              { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 11 },
  tabLabel:         { fontSize: 14, fontWeight: '700' },
  playerCard:       { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10, gap: 10 },
  rank:             { fontSize: 18, fontWeight: '800', minWidth: 30, textAlign: 'center' },
  playerInfo:       { flex: 1 },
  playerName:       { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  barBg:            { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 6 },
  barFill:          { height: 4, borderRadius: 2 },
  statsRow:         { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statItem:         { fontSize: 11 },
  winRateBadge:     { alignItems: 'center', borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 6, minWidth: 52 },
  winRateNum:       { fontSize: 16, fontWeight: '800' },
  winRateLabel:     { fontSize: 10 },
  empty:            { alignItems: 'center', marginTop: 40 },
  emptyEmoji:       { fontSize: 48, marginBottom: 12 },
  emptyText:        { textAlign: 'center', fontSize: 15, lineHeight: 22 },
  badgeGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeGridTablet:  { gap: 14 },
  badgeCard:        { width: '47%', borderRadius: 14, padding: 12, alignItems: 'flex-start', minHeight: 100, position: 'relative' },
  badgeCardTablet:  { width: '31%' },
  badgeEmoji:       { fontSize: 28, marginBottom: 6 },
  badgeName:        { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  badgeDesc:        { fontSize: 11, lineHeight: 15 },
  badgeTick:        { position: 'absolute', top: 8, right: 10, fontSize: 14, color: '#27AE60' },
});
