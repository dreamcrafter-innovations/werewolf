// PlayingCard.js — gold-framed playing-card shell used by the role reveal.
//
// Anatomy (outer → inner):
//   dark metal edge → gold band (with top sheen / bottom shade) →
//   face (theme-tinted) with a thin bright-gold rule + an inset accent
//   hairline (the classic double rule on a real card) → corner indices
//   (top-left upright, bottom-right rotated 180°) → children.
//
// No gradients / SVG: layered Views only, so it renders the same on
// iOS, Android and web (see Gradient.js for why expo-linear-gradient is avoided).
import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

const RADIUS = 22;
const BAND = 7;

export function useCardWidth(max = 360, gutter = 32) {
  const { width } = useWindowDimensions();
  return Math.max(240, Math.min(max, width - gutter * 2));
}

function Corner({ glyph, rank, color, flipped }) {
  return (
    <View
      pointerEvents="none"
      style={[styles.corner, flipped ? styles.cornerBR : styles.cornerTL, flipped && { transform: [{ rotate: '180deg' }] }]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {!!rank && <Text maxFontSizeMultiplier={1} style={[styles.rank, { color }]}>{rank}</Text>}
      {!!glyph && <Text maxFontSizeMultiplier={1} style={styles.pip}>{glyph}</Text>}
    </View>
  );
}

export default function PlayingCard({ theme, width, minHeight, cornerGlyph, cornerRank, children, style, faceStyle }) {
  const h = minHeight ?? Math.round(width * 1.4);
  return (
    <View style={[styles.edge, { width, backgroundColor: theme.metalDeep, shadowColor: theme.isDark ? '#000' : theme.metalDeep }, style]}>
      <View style={[styles.band, { backgroundColor: theme.metal }]}>
        {/* metallic sheen + shade bands */}
        <View pointerEvents="none" style={[styles.sheen, { backgroundColor: theme.metalBright }]} />
        <View pointerEvents="none" style={styles.shade} />
        <View style={[styles.face, { backgroundColor: theme.face, borderColor: theme.metalBright, minHeight: h - (BAND + 2) * 2 }, faceStyle]}>
          <View pointerEvents="none" style={[styles.hairline, { borderColor: theme.pattern }]} />
          <Corner glyph={cornerGlyph} rank={cornerRank} color={theme.goldInk} />
          <Corner glyph={cornerGlyph} rank={cornerRank} color={theme.goldInk} flipped />
          {children}
        </View>
      </View>
    </View>
  );
}

/** Card back — gold lattice with a centre medallion. */
export function CardBack({ theme, width, minHeight, monogram, title, subtitle, caption }) {
  const h = minHeight ?? Math.round(width * 1.4);
  const cells = Math.ceil((width / 22) * (h / 22)) + 20;
  return (
    <PlayingCard theme={theme} width={width} minHeight={h} faceStyle={styles.backFace}>
      <View pointerEvents="none" style={styles.lattice}>
        {Array.from({ length: cells }).map((_, i) => (
          <View key={i} style={[styles.diamond, { borderColor: theme.pattern }]} />
        ))}
      </View>
      <View style={[styles.medallion, { borderColor: theme.metalBright, backgroundColor: theme.face }]}>
        <View style={[styles.medallionInner, { borderColor: theme.metal }]}>
          <Text style={{ fontSize: 44 }}>{monogram}</Text>
        </View>
      </View>
      {!!title && <Text style={[styles.backTitle, { color: theme.goldInk, backgroundColor: theme.face }]}>{title}</Text>}
      {!!subtitle && <Text style={[styles.backSub, { color: theme.ink, backgroundColor: theme.face }]}>{subtitle}</Text>}
      {!!caption && <Text style={[styles.backCaption, { color: theme.inkMuted, backgroundColor: theme.face }]}>{caption}</Text>}
    </PlayingCard>
  );
}

/** Engraved label/value plaque for words, hints, categories, allies. */
export function Plaque({ theme, label, value, tone, big, children }) {
  const border = tone?.border ?? theme.plaqueBorder;
  const bg = tone?.bg ?? theme.plaqueBg;
  const labelColor = tone?.label ?? theme.goldInk;
  const valueColor = tone?.value ?? theme.ink;
  return (
    <View style={[styles.plaque, { borderColor: border, backgroundColor: bg }]}>
      {!!label && <Text style={[styles.plaqueLabel, { color: labelColor }]}>{label}</Text>}
      {value != null && value !== '' && (
        <Text style={[big ? styles.plaqueValueBig : styles.plaqueValue, { color: valueColor }]} numberOfLines={3}>
          {value}
        </Text>
      )}
      {children}
    </View>
  );
}

/** "── ✦ ──" ornament between sections. */
export function Ornament({ theme }) {
  return (
    <View style={styles.ornament} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.ornLine, { backgroundColor: theme.plaqueBorder }]} />
      <Text style={[styles.ornStar, { color: theme.goldInk }]}>✦</Text>
      <View style={[styles.ornLine, { backgroundColor: theme.plaqueBorder }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  edge: {
    alignSelf: 'center', borderRadius: RADIUS, padding: 1.5,
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.45, shadowRadius: 18, elevation: 12,
  },
  band: { borderRadius: RADIUS - 1.5, padding: BAND, overflow: 'hidden' },
  sheen: { ...StyleSheet.absoluteFillObject, bottom: '55%', opacity: 0.35 },
  shade: { ...StyleSheet.absoluteFillObject, top: '60%', backgroundColor: 'rgba(0,0,0,0.18)' },
  face: {
    borderRadius: RADIUS - BAND, borderWidth: 1.5, overflow: 'hidden',
    paddingHorizontal: 22, paddingTop: 54, paddingBottom: 54,
    alignItems: 'center', gap: 10,
  },
  hairline: { ...StyleSheet.absoluteFillObject, margin: 5, borderWidth: 1, borderRadius: RADIUS - BAND - 4 },
  corner: { position: 'absolute', alignItems: 'center', minWidth: 26 },
  cornerTL: { top: 10, left: 11 },
  cornerBR: { bottom: 10, right: 11 },
  rank: { fontSize: 17, fontWeight: '900', lineHeight: 19 },
  pip: { fontSize: 14, lineHeight: 17 },
  backFace: { justifyContent: 'center' },
  lattice: {
    ...StyleSheet.absoluteFillObject, margin: 12, flexDirection: 'row', flexWrap: 'wrap',
    overflow: 'hidden', justifyContent: 'center', alignContent: 'center',
  },
  diamond: { width: 14, height: 14, margin: 4, borderWidth: 1, transform: [{ rotate: '45deg' }] },
  medallion: { width: 112, height: 112, borderRadius: 56, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  medallionInner: { width: 96, height: 96, borderRadius: 48, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  backTitle: { fontSize: 15, fontWeight: '900', letterSpacing: 1.5, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, overflow: 'hidden', textAlign: 'center' },
  backSub: { fontSize: 16, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, overflow: 'hidden', textAlign: 'center' },
  backCaption: { fontSize: 12, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, overflow: 'hidden', textAlign: 'center' },
  plaque: { width: '100%', borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', gap: 4 },
  plaqueLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1.6, textTransform: 'uppercase' },
  plaqueValue: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  plaqueValueBig: { fontSize: 24, fontWeight: '900', textAlign: 'center', letterSpacing: 0.3 },
  ornament: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '70%' },
  ornLine: { flex: 1, height: 1 },
  ornStar: { fontSize: 12 },
});
