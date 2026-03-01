import React from 'react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import WalletScreen from '../../src/screens/WalletScreen';
import { useSettingsStore } from '../../src/store/settingsStore';

export default function WalletTab() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  return (
    <ErrorBoundary darkMode={darkMode}>
      <WalletScreen />
    </ErrorBoundary>
  );
}
