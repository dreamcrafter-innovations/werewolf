import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default function SectionLabel({ children, style }) {
  return (
    <Text style={[styles.label, style]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
    opacity: 0.75,
  },
});
