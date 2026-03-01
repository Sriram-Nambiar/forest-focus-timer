import React from 'react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import ForestScreen from '../../src/screens/ForestScreen';
import { useSettingsStore } from '../../src/store/settingsStore';

export default function ForestTab() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  return (
    <ErrorBoundary darkMode={darkMode}>
      <ForestScreen />
    </ErrorBoundary>
  );
}
