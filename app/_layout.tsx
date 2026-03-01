import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useSettingsStore } from '../src/store/settingsStore';
import { useSessionStore } from '../src/store/sessionStore';

export default function RootLayout() {
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadSessions = useSessionStore((s) => s.loadSessions);
  const darkMode = useSettingsStore((s) => s.darkMode);

  useEffect(() => {
    loadSettings();
    loadSessions();
  }, [loadSettings, loadSessions]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style={darkMode ? 'light' : 'dark'} />
    </>
  );
}