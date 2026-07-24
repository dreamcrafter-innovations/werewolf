// src/navigation/AppNavigator.js
import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator }   from '@react-navigation/bottom-tabs';
import { Text }                        from 'react-native';

import HomeScreen       from '../screens/HomeScreen';
import SetupScreen      from '../screens/SetupScreen';
import RoleRevealScreen from '../screens/RoleRevealScreen';
import NightScreen      from '../screens/NightScreen';
import DayScreen        from '../screens/DayScreen';
import VoteScreen       from '../screens/VoteScreen';
import GameOverScreen   from '../screens/GameOverScreen';
import SettingsScreen   from '../screens/SettingsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import DailyScreen      from '../screens/DailyScreen';
import HowToPlayScreen  from '../screens/HowToPlayScreen';

import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Tab icon helper ──────────────────────────────────────────────
function TabIcon({ emoji, focused, color }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 19, opacity: focused ? 1 : 0.55, color }}>
      {emoji}
    </Text>
  );
}

// ── Persistent bottom-tab shell ──────────────────────────────────
function TabNavigator() {
  const { palette } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor:  palette.tabBg,
          borderTopColor:   palette.tabBorder,
          borderTopWidth:   1,
          paddingBottom:    Platform.OS === 'ios' ? 0 : 6,
          height:           Platform.OS === 'ios' ? 80 : Platform.OS === 'web' ? 58 : 62,
        },
        tabBarActiveTintColor:   palette.tabActive,
        tabBarInactiveTintColor: palette.tabInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: Platform.OS === 'ios' ? 0 : 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Play',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🌕" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Daily"
        component={DailyScreen}
        options={{
          tabBarLabel: 'Daily',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🎯" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Scores',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏆" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="⚙️" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ── Root stack: tabs + full-screen game flow ─────────────────────
export default function AppNavigator() {
  const { palette } = useTheme();
  const bg = palette.bg;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: bg },
      }}
    >
      {/* Persistent shell */}
      <Stack.Screen name="Tabs" component={TabNavigator} />

      {/* Game flow — full-screen over tabs */}
      <Stack.Screen name="Setup"       component={SetupScreen} />
      <Stack.Screen name="RoleReveal"  component={RoleRevealScreen} />
      <Stack.Screen name="Night"       component={NightScreen} />
      <Stack.Screen name="Day"         component={DayScreen} />
      <Stack.Screen name="Vote"        component={VoteScreen} />
      <Stack.Screen name="GameOver"    component={GameOverScreen} />

      {/* Modals */}
      <Stack.Screen
        name="HowToPlay"
        component={HowToPlayScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
