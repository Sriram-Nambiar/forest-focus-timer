import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { formatDate } from '../utils/helpers';
import type { FocusSession } from '../utils/types';

interface SessionCardProps {
  session: FocusSession;
  darkMode: boolean;
}

const SessionCard = memo(function SessionCard({ session, darkMode }: SessionCardProps) {
  const isSuccess = session.status === 'completed';

  return (
    <View style={[styles.card, darkMode && styles.cardDark]}>
      <Text style={styles.treeEmoji}>
        {isSuccess ? '🌳' : '🥀'}
      </Text>
      <Text style={[styles.duration, darkMode && styles.textDark]}>
        {session.durationMinutes}m
      </Text>
      <Text style={[styles.date, darkMode && styles.subtextDark]}>
        {formatDate(session.startTime)}
      </Text>
      <View style={[styles.badge, isSuccess ? styles.successBadge : styles.failBadge]}>
        <Text style={styles.badgeText}>
          {isSuccess ? '✓' : '✗'}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    margin: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardDark: {
    backgroundColor: COLORS.surfaceDark,
  },
  treeEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  textDark: {
    color: COLORS.textDark,
  },
  date: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  subtextDark: {
    color: COLORS.textSecondaryDark,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBadge: {
    backgroundColor: COLORS.success,
  },
  failBadge: {
    backgroundColor: COLORS.error,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export { SessionCard };
