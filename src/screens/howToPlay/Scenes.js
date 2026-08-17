// Small set of animated illustrations for HowToPlayScreen. Pure View/Animated —
// no react-native-svg here (not a dependency of this app, and this app has no
// network access to add one in this environment). Emoji + shape + motion gets
// the same "show, don't just tell" effect without a new dependency.
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

function useLoop(duration, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return v;
}

/** Night phase: a glowing moon with villagers waking one by one in turn. */
export function SceneNightWake({ C }) {
  const glow = useLoop(1400);
  const scale = glow.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] });
  const opacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const dots = [0, 260, 520, 780].map((delay) => useLoop(500, delay));

  return (
    <View style={sc.wrap}>
      <Animated.View style={[sc.moon, { backgroundColor: C.primary, transform: [{ scale }], opacity }]}>
        <Text style={sc.moonTxt}>🌙</Text>
      </Animated.View>
      <View style={sc.dotRow}>
        {dots.map((d, i) => (
          <Animated.View
            key={i}
            style={[
              sc.dot,
              { borderColor: C.cardBorder, opacity: d.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }) },
            ]}
          >
            <Text style={sc.dotTxt}>👤</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

/** Day phase: votes stacking up one at a time toward a majority. */
export function SceneVoteTally({ C }) {
  const bars = [0, 1, 2, 3, 4];
  const anims = bars.map((i) => useLoop(320, i * 180));
  const heights = [18, 30, 22, 40, 26];

  return (
    <View style={[sc.wrap, { flexDirection: 'row', alignItems: 'flex-end', gap: 8 }]}>
      {bars.map((i) => {
        const scaleY = anims[i].interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
        return (
          <Animated.View
            key={i}
            style={[
              sc.bar,
              {
                height: heights[i] + 26,
                backgroundColor: i === 3 ? C.primary : C.cardBorder,
                transform: [{ scaleY }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

/** Role reveal: a private card flipping between hidden and shown. */
export function SceneRoleFlip({ C }) {
  const flip = useLoop(650, 200);
  const scaleX = flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 1] });

  return (
    <View style={sc.wrap}>
      <Animated.View style={[sc.card, { backgroundColor: C.primary, transform: [{ scaleX }] }]}>
        <Text style={sc.cardTxt}>🃏</Text>
      </Animated.View>
    </View>
  );
}

const sc = StyleSheet.create({
  wrap: { width: 150, height: 110, alignItems: 'center', justifyContent: 'center', gap: 10 },
  moon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  moonTxt: { fontSize: 26 },
  dotRow: { flexDirection: 'row', gap: 8 },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dotTxt: { fontSize: 13 },
  bar: { width: 18, borderRadius: 6 },
  card: { width: 64, height: 84, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTxt: { fontSize: 30 },
});
