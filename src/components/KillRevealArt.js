// KillRevealArt.js
// Animated illustration shown on DayScreen when the morning result is revealed.
//
// KILL  — victim avatar with a dark villain-themed shroud falling over them
// SAVE  — victim avatar surrounded by a healing pulse ring
// QUIET — peaceful moon fade

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

export default function KillRevealArt({ type, playerAvatar, villainEmoji, accentColor }) {
  // KILL
  const shroudY      = useRef(new Animated.Value(-70)).current;
  const shroudAlpha  = useRef(new Animated.Value(0)).current;
  const victimScale  = useRef(new Animated.Value(1)).current;
  const victimAlpha  = useRef(new Animated.Value(1)).current;
  const skullScale   = useRef(new Animated.Value(0)).current;

  // SAVE
  const ring1        = useRef(new Animated.Value(0.5)).current;
  const ring1Alpha   = useRef(new Animated.Value(0)).current;
  const ring2        = useRef(new Animated.Value(0.5)).current;
  const ring2Alpha   = useRef(new Animated.Value(0)).current;
  const glowAlpha    = useRef(new Animated.Value(0)).current;

  // QUIET
  const moonAlpha    = useRef(new Animated.Value(0)).current;
  const moonScale    = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (type === 'KILL') {
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(shroudY,     { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(shroudAlpha, { toValue: 0.85, duration: 500, useNativeDriver: true }),
          Animated.timing(victimScale, { toValue: 0.75, duration: 600, useNativeDriver: true }),
          Animated.timing(victimAlpha, { toValue: 0.35, duration: 600, useNativeDriver: true }),
        ]),
        Animated.spring(skullScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    } else if (type === 'SAVE') {
      const pulse = (scale, alpha, delay) => {
        Animated.loop(Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.8, duration: 900, useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(alpha, { toValue: 0.6, duration: 200, useNativeDriver: true }),
              Animated.timing(alpha, { toValue: 0, duration: 700, useNativeDriver: true }),
            ]),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 0.5, duration: 0, useNativeDriver: true }),
          ]),
        ])).start();
      };
      pulse(ring1, ring1Alpha, 0);
      pulse(ring2, ring2Alpha, 450);
      Animated.timing(glowAlpha, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } else {
      // QUIET
      Animated.parallel([
        Animated.timing(moonAlpha, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(moonScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start();
    }
  }, [type]);

  if (type === 'KILL') {
    return (
      <View style={styles.container}>
        {/* Villain shroud descending */}
        <Animated.View style={[
          styles.shroud,
          { backgroundColor: accentColor, transform: [{ translateY: shroudY }], opacity: shroudAlpha },
        ]} />

        {/* Victim avatar, fading */}
        <Animated.Text style={[
          styles.bigAvatar,
          { transform: [{ scale: victimScale }], opacity: victimAlpha },
        ]}>
          {playerAvatar}
        </Animated.Text>

        {/* Villain emoji in corner */}
        <Text style={[styles.villainCorner]}>{villainEmoji}</Text>

        {/* Death skull pops in */}
        <Animated.Text style={[styles.skull, { transform: [{ scale: skullScale }] }]}>
          💀
        </Animated.Text>
      </View>
    );
  }

  if (type === 'SAVE') {
    return (
      <View style={styles.container}>
        {/* Heal rings */}
        {[{ s: ring1, a: ring1Alpha }, { s: ring2, a: ring2Alpha }].map((r, i) => (
          <Animated.View key={i} style={[
            styles.healRing,
            { borderColor: '#27AE60', transform: [{ scale: r.s }], opacity: r.a },
          ]} />
        ))}

        {/* Glow backdrop */}
        <Animated.View style={[styles.glow, { backgroundColor: '#27AE60', opacity: glowAlpha }]} />

        <Text style={styles.bigAvatar}>{playerAvatar}</Text>
        <Text style={styles.healEmoji}>✨</Text>
      </View>
    );
  }

  // QUIET
  return (
    <View style={styles.container}>
      <Animated.Text style={[
        styles.quietMoon,
        { opacity: moonAlpha, transform: [{ scale: moonScale }] },
      ]}>
        😶‍🌫️
      </Animated.Text>
      <Animated.Text style={[styles.quietLabel, { opacity: moonAlpha }]}>
        Nothing stirs...
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 140,
    width: 140,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 8,
  },
  // KILL
  shroud: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 70,
    opacity: 0,
  },
  bigAvatar: { fontSize: 60, zIndex: 2 },
  villainCorner: {
    position: 'absolute',
    top: 2, right: 2,
    fontSize: 22,
    zIndex: 3,
  },
  skull: {
    position: 'absolute',
    bottom: 0, right: 0,
    fontSize: 34,
    zIndex: 4,
  },
  // SAVE
  healRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },
  glow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0,
  },
  healEmoji: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 24,
  },
  // QUIET
  quietMoon: { fontSize: 60 },
  quietLabel: { fontSize: 12, color: '#888', marginTop: 6, fontStyle: 'italic' },
});
