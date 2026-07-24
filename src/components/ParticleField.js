// ParticleField.js
// Looping animated emoji particles — used as ambient background in result/game-over screens.
import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

function Particle({ emoji, x, size, duration, delay, reverse }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? [H * 0.9, -60] : [-60, H * 0.9],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.08, 0.75, 1],
    outputRange: [0, 0.85, 0.6, 0],
  });

  const scale = anim.interpolate({
    inputRange: [0, 0.4, 0.7, 1],
    outputRange: [0.5, 1.3, 1.0, 0.7],
  });

  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? ['0deg', '-180deg'] : ['0deg', '180deg'],
  });

  return (
    <Animated.Text
      style={[
        styles.particle,
        { left: x, fontSize: size, transform: [{ translateY }, { scale }, { rotate }], opacity },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

export default function ParticleField({ emojis = ['✨'], count = 14, reverse = false, style }) {
  // Fixed on first render — no re-randomization
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      x: (W / count) * i + Math.random() * (W / count) - 20,
      size: 14 + Math.random() * 22,
      duration: 3500 + Math.random() * 4500,
      delay: Math.random() * 4000,
    }))
  ).current;

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {particles.map(p => (
        <Particle key={p.id} {...p} reverse={reverse} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    top: 0,
  },
});
