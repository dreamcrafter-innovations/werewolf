// src/components/Gradient.js
// Cross-platform gradient: CSS on web, solid color on native (avoids expo-linear-gradient crashes)
import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';

export default function Gradient({
  colors = ['#0B0B1E', '#1A0D2E'],
  style,
  children,
  direction = 'vertical', // 'vertical' | 'horizontal' | 'diagonal'
}) {
  if (Platform.OS === 'web') {
    const dirMap = {
      vertical: 'to bottom',
      horizontal: 'to right',
      diagonal: '135deg',
    };
    return (
      <View
        style={[
          style,
          {
            background: `linear-gradient(${dirMap[direction]}, ${colors.join(', ')})`,
          },
        ]}
      >
        {children}
      </View>
    );
  }

  // Native: use the middle color as a solid background
  const midIndex = Math.floor(colors.length / 2);
  return (
    <View style={[style, { backgroundColor: colors[midIndex] }]}>
      {children}
    </View>
  );
}
