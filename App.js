import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { enableScreens } from 'react-native-screens';
import AppNavigator from './src/navigation/AppNavigator';
import { GameProvider }     from './src/context/GameContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider }    from './src/context/ThemeContext';
import { recordError }      from './src/utils/analytics';
import ErrorBoundary        from './src/components/ErrorBoundary';

// Required for react-native-screens to work correctly with navigation
enableScreens();

// Global crash handler — native production only.
if (!__DEV__ && Platform.OS !== 'web') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    recordError(error, isFatal ? 'FATAL' : 'NON_FATAL');
    originalHandler(error, isFatal);
  });
}

const linking = {
  prefixes: ['nightfall://', 'https://dreamcrafterinnovations.com/nightfall'],
  config: {
    screens: {
      Tabs: {
        screens: {
          Home:        '',
          Daily:       'daily',
          Leaderboard: 'scores',
          Settings:    'settings',
        },
      },
      Setup:      'setup',
      RoleReveal: 'role-reveal',
      Night:      'night',
      Day:        'day',
      Vote:       'vote',
      GameOver:   'game-over',
      HowToPlay:  'how-to-play',
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <LanguageProvider>
          <ThemeProvider>
            <GameProvider>
              <NavigationContainer linking={linking}>
                <StatusBar style="light" backgroundColor="transparent" translucent />
                <AppNavigator />
              </NavigationContainer>
            </GameProvider>
          </ThemeProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
