import React, { useRef, useEffect } from 'react';
import { Pressable, Animated } from 'react-native';

/**
 * Simple animated toggle switch.
 * No react-native-reanimated required — uses core Animated API.
 */
export default function Toggle({ value, onToggle, activeColor = '#FF8C00' }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue:         value ? 1 : 0,
      duration:        200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const trackColor = anim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['rgba(255,255,255,0.15)', activeColor],
  });

  const thumbX = anim.interpolate({
    inputRange:  [0, 1],
    outputRange: [3, 25],
  });

  return (
    <Pressable onPress={onToggle} style={{ cursor: 'pointer' }} hitSlop={8}>
      <Animated.View
        style={{
          width: 50, height: 28, borderRadius: 14,
          justifyContent: 'center',
          backgroundColor: trackColor,
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            left: thumbX,
            width: 22, height: 22, borderRadius: 11,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3,
            elevation: 3,
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
