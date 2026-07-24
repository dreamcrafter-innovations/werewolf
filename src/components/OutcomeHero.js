// OutcomeHero.js
// Full-bleed animated illustration for the GameOverScreen.
//
// CAUGHT (village wins):
//   – Villain emoji flies in from above → lands in a cage frame
//   – Cage bars slide down into place  
//   – "CAUGHT!" text slams in
//
// EVIL_WIN (villain wins):
//   – Villain emoji pulses and grows with dark glow rings
//   – Skull overlay fades in
//   – "THEY WIN" banner rises

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

export default function OutcomeHero({ outcome, villainEmoji, accentColor }) {
  const isCaught = outcome === 'CAUGHT';

  // ── Caught animations ──────────────────────────────────────
  const emojiDrop   = useRef(new Animated.Value(-80)).current;
  const emojiScale  = useRef(new Animated.Value(1.4)).current;
  const bar1        = useRef(new Animated.Value(-60)).current;
  const bar2        = useRef(new Animated.Value(-60)).current;
  const bar3        = useRef(new Animated.Value(-60)).current;
  const bar4        = useRef(new Animated.Value(-60)).current;
  const caughtScale = useRef(new Animated.Value(0)).current;
  const caughtAlpha = useRef(new Animated.Value(0)).current;

  // ── Evil-win animations ────────────────────────────────────
  const pulse       = useRef(new Animated.Value(1)).current;
  const ring1       = useRef(new Animated.Value(0)).current;
  const ring2       = useRef(new Animated.Value(0)).current;
  const skullAlpha  = useRef(new Animated.Value(0)).current;
  const bannerY     = useRef(new Animated.Value(30)).current;
  const bannerAlpha = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCaught) {
      // 1. Emoji drops in
      Animated.spring(emojiDrop,  { toValue: 0, friction: 5, useNativeDriver: true }).start();
      Animated.spring(emojiScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
      // 2. Cage bars slide down after 400ms
      const barDelay = (b, ms) => Animated.sequence([
        Animated.delay(ms),
        Animated.spring(b, { toValue: 0, friction: 6, useNativeDriver: true }),
      ]).start();
      barDelay(bar1, 400);
      barDelay(bar2, 480);
      barDelay(bar3, 560);
      barDelay(bar4, 640);
      // 3. CAUGHT! text after bars
      Animated.sequence([
        Animated.delay(900),
        Animated.spring(caughtScale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
        Animated.timing(caughtAlpha, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      // Evil wins
      // Pulse loop
      Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.92, duration: 700, useNativeDriver: true }),
      ])).start();
      // Expanding rings
      const startRing = (anim, delay) => {
        Animated.loop(Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 1400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])).start();
      };
      startRing(ring1, 0);
      startRing(ring2, 700);
      // Skull + banner fade in
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(skullAlpha,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(bannerAlpha, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(bannerY,     { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, []);

  if (isCaught) {
    return (
      <View style={styles.container}>
        {/* Cage frame */}
        <View style={[styles.cage, { borderColor: accentColor + '88' }]}>
          {/* Cage bars — evenly spaced across the cage width */}
          {[bar1, bar2, bar3, bar4].map((b, i) => (
            <Animated.View
              key={i}
              style={[styles.bar, {
                backgroundColor: accentColor,
                left: `${14 + i * 24}%`,
                transform: [{ translateY: b }],
              }]}
            />
          ))}
          {/* Villain emoji */}
          <Animated.Text style={[
            styles.villainEmoji,
            { transform: [{ translateY: emojiDrop }, { scale: emojiScale }] },
          ]}>
            {villainEmoji}
          </Animated.Text>
          {/* Lock */}
          <Text style={[styles.lock, { color: accentColor }]}>🔒</Text>
        </View>

        {/* CAUGHT! label */}
        <Animated.Text style={[
          styles.caughtText,
          { color: accentColor, transform: [{ scale: caughtScale }], opacity: caughtAlpha },
        ]}>
          CAUGHT!
        </Animated.Text>
      </View>
    );
  }

  // Evil wins
  const ring1Scale = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.2] });
  const ring2Scale = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.2] });
  const ringAlpha1 = ring1.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.5, 0.3, 0] });
  const ringAlpha2 = ring2.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.5, 0.3, 0] });

  return (
    <View style={styles.container}>
      {/* Glow rings */}
      {[{ s: ring1Scale, a: ringAlpha1 }, { s: ring2Scale, a: ringAlpha2 }].map((r, i) => (
        <Animated.View key={i} style={[styles.ring, {
          borderColor: accentColor,
          transform: [{ scale: r.s }],
          opacity: r.a,
        }]} />
      ))}

      {/* Villain emoji */}
      <Animated.Text style={[styles.villainEmoji, { transform: [{ scale: pulse }] }]}>
        {villainEmoji}
      </Animated.Text>

      {/* Skull overlay */}
      <Animated.Text style={[styles.skullOverlay, { opacity: skullAlpha }]}>💀</Animated.Text>

      {/* "THEY WIN" banner */}
      <Animated.Text style={[
        styles.evilText,
        { color: accentColor, opacity: bannerAlpha, transform: [{ translateY: bannerY }] },
      ]}>
        DARKNESS WINS
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    marginBottom: 12,
  },
  // ── Caught ──
  cage: {
    width: 140,
    height: 140,
    borderRadius: 12,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  bar: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: '100%',
    borderRadius: 2,
    opacity: 0.7,
  },
  // 4 bars positioned across the cage
  villainEmoji: { fontSize: 64, zIndex: 2 },
  lock: { fontSize: 24, position: 'absolute', bottom: -12, zIndex: 3 },
  caughtText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 24,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  // ── Evil win ──
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  skullOverlay: {
    position: 'absolute',
    fontSize: 28,
    top: 0,
    right: '28%',
  },
  evilText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 16,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
});
