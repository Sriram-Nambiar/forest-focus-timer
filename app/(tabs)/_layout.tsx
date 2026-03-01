import React from 'react';
import { Tabs } from 'expo-router';
import { Timer, Trees, Settings } from 'lucide-react-native';
import { useSettingsStore } from '../../src/store/settingsStore';
import { COLORS } from '../../src/constants';

export default function TabLayout() {
  const darkMode = useSettingsStore((s) => s.darkMode);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: darkMode ? COLORS.textSecondaryDark : COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: darkMode ? COLORS.surfaceDark : COLORS.surface,
          borderTopColor: darkMode ? COLORS.borderDark : COLORS.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color, size }) => <Timer color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="forest"
        options={{
          title: 'Forest',
          tabBarIcon: ({ color, size }) => <Trees color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
