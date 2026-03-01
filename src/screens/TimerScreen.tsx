import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { formatTime } from '../utils/helpers';
import { useTimerStore } from '../store/timerStore';
import { useSettingsStore } from '../store/settingsStore';
import { useFocusTimer } from '../hooks/useFocusTimer';
import { TreeAnimation } from '../components/TreeAnimation';
import { DurationSelector } from '../components/DurationSelector';
import { TimerControls } from '../components/TimerControls';

export default function TimerScreen() {
  const {
    durationMinutes,
    remainingSeconds,
    status,
    progress,
    treeStage,
    handleFail,
    resetTimer,
  } = useFocusTimer();

  const { setDuration, startTimer, pauseTimer, resumeTimer, restoreSession } = useTimerStore();
  const darkMode = useSettingsStore((s) => s.darkMode);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const handleSelectDuration = useCallback(
    (minutes: number) => {
      setDuration(minutes);
    },
    [setDuration],
  );

  const handleStart = useCallback(() => {
    if (status === 'completed' || status === 'failed') {
      resetTimer();
      // Small delay to ensure state reset before starting
      setTimeout(() => {
        useTimerStore.getState().startTimer();
      }, 50);
    } else {
      startTimer();
    }
  }, [status, resetTimer, startTimer]);

  const handleCancel = useCallback(() => {
    Alert.alert(
      'Give Up?',
      'Your tree will die if you give up now. Are you sure?',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Give Up',
          style: 'destructive',
          onPress: () => handleFail(),
        },
      ],
    );
  }, [handleFail]);

  const isActive = status === 'running' || status === 'paused';

  const statusMessage = (() => {
    switch (status) {
      case 'idle':
        return 'Ready to focus?';
      case 'running':
        return 'Stay focused... 🌱';
      case 'paused':
        return 'Paused';
      case 'completed':
        return 'Great job! 🌳';
      case 'failed':
        return 'Tree died 🥀';
      default:
        return '';
    }
  })();

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, darkMode && styles.titleDark]}>Forest Focus</Text>

        <DurationSelector
          selectedDuration={durationMinutes}
          onSelect={handleSelectDuration}
          disabled={isActive}
          darkMode={darkMode}
        />

        <View style={styles.treeContainer}>
          <TreeAnimation
            progress={progress}
            stage={treeStage}
            failed={status === 'failed'}
          />
        </View>

        <Text style={[styles.timer, darkMode && styles.timerDark]}>
          {formatTime(remainingSeconds)}
        </Text>

        <Text style={[styles.statusText, darkMode && styles.statusTextDark]}>
          {statusMessage}
        </Text>

        <TimerControls
          status={status}
          onStart={handleStart}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onCancel={handleCancel}
          darkMode={darkMode}
        />
      </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 24,
  },
  titleDark: {
    color: COLORS.primaryLight,
  },
  treeContainer: {
    marginVertical: 16,
  },
  timer: {
    fontSize: 56,
    fontWeight: '200',
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
    marginBottom: 8,
  },
  timerDark: {
    color: COLORS.textDark,
  },
  statusText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statusTextDark: {
    color: COLORS.textSecondaryDark,
  },
});
