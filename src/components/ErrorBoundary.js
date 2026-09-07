// src/components/ErrorBoundary.js
// Top-level crash net. If any screen throws during render, this shows a
// friendly fallback instead of a white/blank screen, and reports the error
// to Crashlytics (native prod builds only — recordError() no-ops on web).
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { recordError } from '../utils/analytics';
import { COLORS, FONTS } from './theme';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    recordError(error, `ErrorBoundary: ${info?.componentStack ?? ''}`);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.emoji}>🌑</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>
            The village spirits stumbled. Your progress in this round may be lost, but you can
            jump back in.
          </Text>
          <Pressable style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { ...FONTS.title, fontSize: 24, color: COLORS.text, textAlign: 'center', marginBottom: 12 },
  body: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: { ...FONTS.subtitle, color: COLORS.white },
});
