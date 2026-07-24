// BurstEffect.js
// One-shot radial burst of emoji particles from center — fires on mount.
// Use `key` prop to re-trigger (e.g. key={killCount}).
import React, { useRef, useEffect } from 'react';
import { View, Animated, Text, StyleSheet } from 'react-native';

function BurstParticle({ emoji, angle, distance, duration, size }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }).start();
  }, []);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * distance] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * distance] });
  const opacity    = anim.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 0.8, 0] });
  const scale      = anim.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0.3, 1.6, 0.8] });

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        fontSize: size,
        transform: [{ translateX }, { translateY }, { scale }],
        opacity,
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

export default function BurstEffect({ emojis = ['✨'], count = 10, active = true }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      angle: (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4,
      distance: 55 + Math.random() * 70,
      duration: 700 + Math.random() * 500,
      size: 18 + Math.random() * 18,
    }))
  ).current;

  if (!active) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      {particles.map(p => <BurstParticle key={p.id} {...p} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
