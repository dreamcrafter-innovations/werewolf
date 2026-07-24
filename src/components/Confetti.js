// Confetti.js
// Full-screen looping confetti rain — mix of paper squares and emoji.
// Pass villain theme color to tint the confetti palette.
import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

const BASE_COLORS = [
  '#FFD700','#FF6B6B','#4ECDC4','#45B7D1','#96CEB4',
  '#FFEAA7','#DDA0DD','#98FB98','#F0E68C','#FF69B4',
];

function confettiPiece(i, accentColor) {
  return {
    id: i,
    x: (W / 30) * i + Math.random() * (W / 30),
    color: i % 5 === 0 ? accentColor : BASE_COLORS[i % BASE_COLORS.length],
    size: 6 + Math.random() * 10,
    duration: 2400 + Math.random() * 3600,
    delay: Math.random() * 3000,
    wobble: Math.random() * 40 - 20, // horizontal drift
    isSquare: Math.random() > 0.5,
  };
}

function Piece({ x, color, size, duration, delay, wobble, isSquare }) {
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

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-20, H + 20] });
  const translateX = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, wobble, wobble * 0.4] });
  const opacity    = anim.interpolate({ inputRange: [0, 0.05, 0.85, 1], outputRange: [0, 1, 1, 0] });
  const rotate     = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${360 + Math.random() * 360}deg`] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: size,
        height: isSquare ? size : size * 2,
        backgroundColor: color,
        borderRadius: isSquare ? 1 : size / 2,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    />
  );
}

export default function Confetti({ active = true, accentColor = '#FFD700', density = 30 }) {
  const pieces = useRef(
    Array.from({ length: density }, (_, i) => confettiPiece(i, accentColor))
  ).current;

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map(p => <Piece key={p.id} {...p} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden',
    zIndex: 10,
  },
});
