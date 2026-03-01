import React, { useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { useSessionStore } from '../store/sessionStore';
import { useSettingsStore } from '../store/settingsStore';
import { SessionCard } from '../components/SessionCard';
import type { FocusSession } from '../utils/types';

export default function ForestScreen() {
  const { sessions, loadSessions, clearSessions } = useSessionStore();
  const darkMode = useSettingsStore((s) => s.darkMode);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleClear = useCallback(() => {
    Alert.alert(
      'Clear Forest',
      'This will remove all your session history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearSessions(),
        },
      ],
    );
  }, [clearSessions]);

  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const failedCount = sessions.filter((s) => s.status === 'failed').length;

  const renderItem = useCallback(
    ({ item }: { item: FocusSession }) => (
      <SessionCard session={item} darkMode={darkMode} />
    ),
    [darkMode],
  );

  const keyExtractor = useCallback((item: FocusSession) => item.id, []);

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🌱</Text>
        <Text style={[styles.emptyTitle, darkMode && styles.textDark]}>
          No trees yet
        </Text>
        <Text style={[styles.emptySubtitle, darkMode && styles.subtextDark]}>
          Complete a focus session to grow your forest
        </Text>
      </View>
    ),
    [darkMode],
  );

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, darkMode && styles.titleDark]}>My Forest</Text>
        {sessions.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {sessions.length > 0 && (
        <View style={styles.stats}>
          <View style={[styles.statCard, darkMode && styles.statCardDark]}>
            <Text style={styles.statEmoji}>🌳</Text>
            <Text style={[styles.statValue, darkMode && styles.textDark]}>{completedCount}</Text>
            <Text style={[styles.statLabel, darkMode && styles.subtextDark]}>Grown</Text>
          </View>
          <View style={[styles.statCard, darkMode && styles.statCardDark]}>
            <Text style={styles.statEmoji}>🥀</Text>
            <Text style={[styles.statValue, darkMode && styles.textDark]}>{failedCount}</Text>
            <Text style={[styles.statLabel, darkMode && styles.subtextDark]}>Died</Text>
          </View>
          <View style={[styles.statCard, darkMode && styles.statCardDark]}>
            <Text style={styles.statEmoji}>🌲</Text>
            <Text style={[styles.statValue, darkMode && styles.textDark]}>{sessions.length}</Text>
            <Text style={[styles.statLabel, darkMode && styles.subtextDark]}>Total</Text>
          </View>
        </View>
      )}

      <FlatList
        data={sessions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  titleDark: {
    color: COLORS.primaryLight,
  },
  clearText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statCardDark: {
    backgroundColor: COLORS.surfaceDark,
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  textDark: {
    color: COLORS.textDark,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  subtextDark: {
    color: COLORS.textSecondaryDark,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
