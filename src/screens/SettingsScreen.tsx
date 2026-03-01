import React, { useCallback, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { useSettingsStore } from '../store/settingsStore';

interface SettingRowProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  darkMode: boolean;
}

function SettingRow({ label, description, value, onToggle, darkMode }: SettingRowProps) {
  return (
    <View style={[styles.row, darkMode && styles.rowDark]}>
      <View style={styles.rowTextContainer}>
        <Text style={[styles.rowLabel, darkMode && styles.textDark]}>{label}</Text>
        <Text style={[styles.rowDescription, darkMode && styles.subtextDark]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#D0D0D0', true: COLORS.primaryLight }}
        thumbColor={value ? COLORS.primary : '#F4F4F4'}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const {
    strictMode,
    notificationsEnabled,
    darkMode,
    loaded,
    loadSettings,
    setStrictMode,
    setNotificationsEnabled,
    setDarkMode,
  } = useSettingsStore();

  useEffect(() => {
    if (!loaded) {
      loadSettings();
    }
  }, [loaded, loadSettings]);

  const handleStrictMode = useCallback(
    (value: boolean) => setStrictMode(value),
    [setStrictMode],
  );

  const handleNotifications = useCallback(
    (value: boolean) => setNotificationsEnabled(value),
    [setNotificationsEnabled],
  );

  const handleDarkMode = useCallback(
    (value: boolean) => setDarkMode(value),
    [setDarkMode],
  );

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, darkMode && styles.titleDark]}>Settings</Text>

        <Text style={[styles.sectionTitle, darkMode && styles.subtextDark]}>FOCUS</Text>
        <SettingRow
          label="Strict Mode"
          description="No grace period when leaving app. Timer fails immediately."
          value={strictMode}
          onToggle={handleStrictMode}
          darkMode={darkMode}
        />

        <Text style={[styles.sectionTitle, darkMode && styles.subtextDark]}>NOTIFICATIONS</Text>
        <SettingRow
          label="Notifications"
          description="Get notified when your focus session completes."
          value={notificationsEnabled}
          onToggle={handleNotifications}
          darkMode={darkMode}
        />

        <Text style={[styles.sectionTitle, darkMode && styles.subtextDark]}>APPEARANCE</Text>
        <SettingRow
          label="Dark Mode"
          description="Use dark theme throughout the app."
          value={darkMode}
          onToggle={handleDarkMode}
          darkMode={darkMode}
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, darkMode && styles.subtextDark]}>
            Forest Focus Timer v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primaryDark,
    paddingVertical: 16,
  },
  titleDark: {
    color: COLORS.primaryLight,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtextDark: {
    color: COLORS.textSecondaryDark,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  rowDark: {
    backgroundColor: COLORS.surfaceDark,
  },
  rowTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  textDark: {
    color: COLORS.textDark,
  },
  rowDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
