import React from 'react';
import { Pressable, Text, StyleSheet, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { usePalette } from '../hooks/usePalette';
import { haptics } from '../utils/haptics';

/**
 * Quit affordance for the mid-round screens (Day/Night/Vote).
 *
 * Those screens deliberately swallow the hardware back button — see the
 * comment above each screen's BackHandler listener — because Night/Day/Vote
 * replace each other in the stack and the entry underneath is always Setup,
 * so an accidental back press would silently abandon the round. That guard
 * had no counterpart for someone who genuinely wants to stop, so this is
 * that path: a small, deliberate, confirm-gated exit, not a substitute for
 * the guard.
 */
export default function AbandonGameButton({ navigation }) {
  const { resetGame } = useGame();
  const { t } = useLanguage();
  const C = usePalette();

  const confirmAbandon = () => {
    haptics.warning();
    Alert.alert(
      t('abandon_title'),
      t('abandon_body'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('abandon_confirm'),
          style: 'destructive',
          onPress: () => {
            resetGame();
            navigation.navigate('Setup');
          },
        },
      ],
    );
  };

  return (
    <Pressable
      onPress={confirmAbandon}
      hitSlop={12}
      style={[styles.btn, { backgroundColor: C.card, borderColor: C.textDim }]}
      accessibilityRole="button"
      accessibilityLabel={t('abandon_label')}
    >
      <Text style={[styles.txt, { color: C.textSecondary }]}>✕</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txt: { fontSize: 15, fontWeight: '700' },
});
