import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { tap, useHapticsEnabled } from './haptics';

// One settings row for the in-app haptics switch. Colours come from the host app's theme.
export function HapticsSetting({
  label = 'Haptic feedback',
  hint = 'Small vibrations on taps and confirmations',
  textColor = '#111111',
  mutedColor = '#6b7280',
  accent,
  style,
}) {
  const [on, setOn] = useHapticsEnabled();
  return (
    <View style={[styles.row, style]}>
      <View style={styles.text}>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        <Text style={[styles.hint, { color: mutedColor }]}>{hint}</Text>
      </View>
      <Switch
        value={on}
        onValueChange={(v) => {
          setOn(v);
          if (v) tap();
        }}
        trackColor={accent ? { true: accent } : undefined}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, gap: 12 },
  text: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 13, marginTop: 2 },
});
