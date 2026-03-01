import React from 'react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import SettingsScreen from '../../src/screens/SettingsScreen';
import { useSettingsStore } from '../../src/store/settingsStore';

export default function SettingsTab() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  return (
    <ErrorBoundary darkMode={darkMode}>
      <SettingsScreen />
    </ErrorBoundary>
  );
}
