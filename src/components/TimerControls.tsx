import React, { memo } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import type { TimerStatus } from '../utils/types';

interface TimerControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  darkMode: boolean;
}

const TimerControls = memo(function TimerControls({
  status,
  onStart,
  onPause,
  onResume,
  onCancel,
  darkMode,
}: TimerControlsProps) {
  if (status === 'idle') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>Plant Tree 🌱</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'running') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.secondaryButton, darkMode && styles.secondaryButtonDark]}
          onPress={onPause}
        >
          <Text style={[styles.secondaryButtonText, darkMode && styles.secondaryButtonTextDark]}>
            Pause
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Give Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'paused') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.startButton} onPress={onResume}>
          <Text style={styles.startButtonText}>Resume</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Give Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'completed') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>Plant Again 🌱</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'failed') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>Try Again 🌱</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 24,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonDark: {
    backgroundColor: COLORS.surfaceDark,
    borderColor: COLORS.borderDark,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonTextDark: {
    color: COLORS.textDark,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export { TimerControls };
