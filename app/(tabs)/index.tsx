import React from 'react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import TimerScreen from '../../src/screens/TimerScreen';
import { useSettingsStore } from '../../src/store/settingsStore';

export default function TimerTab() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  return (
    <ErrorBoundary darkMode={darkMode}>
      <TimerScreen />
    </ErrorBoundary>
  );
}
