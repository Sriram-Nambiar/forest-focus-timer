import { useEffect, useRef, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { TIMER_INTERVAL_MS, GRACE_PERIOD_MS } from '../constants';
import { useTimerStore } from '../store/timerStore';
import { useSessionStore } from '../store/sessionStore';
import { useSettingsStore } from '../store/settingsStore';
import { generateId, getTreeStage, getProgress } from '../utils/helpers';
import type { FocusSession } from '../utils/types';

export function useFocusTimer() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const graceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const {
    durationMinutes,
    remainingSeconds,
    status,
    tick,
    completeTimer,
    failTimer,
    resetTimer,
    persistSession,
    clearPersistedSession,
  } = useTimerStore();

  const addSession = useSessionStore((s) => s.addSession);
  const strictMode = useSettingsStore((s) => s.strictMode);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);

  const totalSeconds = durationMinutes * 60;
  const progress = getProgress(remainingSeconds, totalSeconds);
  const treeStage = getTreeStage(progress);

  const clearInterval_ = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearGrace = useCallback(() => {
    if (graceRef.current !== null) {
      clearTimeout(graceRef.current);
      graceRef.current = null;
    }
  }, []);

  const saveSession = useCallback(
    async (sessionStatus: 'completed' | 'failed') => {
      const timerState = useTimerStore.getState();
      const session: FocusSession = {
        id: generateId(),
        durationMinutes,
        startTime: timerState.startTime ?? Date.now(),
        endTime: Date.now(),
        status: sessionStatus,
        treeStage: sessionStatus === 'completed' ? 'full' : getTreeStage(progress),
      };
      await addSession(session);
      await clearPersistedSession();
    },
    [durationMinutes, progress, addSession, clearPersistedSession],
  );

  const handleComplete = useCallback(async () => {
    clearInterval_();
    completeTimer();

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Haptics not available
    }

    if (notificationsEnabled) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Focus Complete! 🌳',
            body: `Great job! Your ${durationMinutes}-minute focus session is complete.`,
          },
          trigger: null,
        });
      } catch {
        // Notifications not available
      }
    }

    await saveSession('completed');
  }, [clearInterval_, completeTimer, notificationsEnabled, durationMinutes, saveSession]);

  const handleFail = useCallback(async () => {
    clearInterval_();
    clearGrace();
    failTimer();

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Haptics not available
    }

    await saveSession('failed');
  }, [clearInterval_, clearGrace, failTimer, saveSession]);

  // Timer interval
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        const state = useTimerStore.getState();
        if (state.remainingSeconds <= 1) {
          handleComplete();
        } else {
          tick();
        }
      }, TIMER_INTERVAL_MS);
    } else {
      clearInterval_();
    }

    return clearInterval_;
  }, [status, tick, handleComplete, clearInterval_]);

  // Persist session periodically
  useEffect(() => {
    if (status === 'running' || status === 'paused') {
      persistSession();
    }
  }, [status, remainingSeconds, persistSession]);

  // AppState listener for distraction detection
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      const timerState = useTimerStore.getState();
      if (timerState.status !== 'running' && timerState.status !== 'paused') return;

      if (prevState === 'active' && (nextState === 'background' || nextState === 'inactive')) {
        if (timerState.status === 'running') {
          if (strictMode) {
            handleFail();
          } else {
            graceRef.current = setTimeout(() => {
              const currentState = useTimerStore.getState();
              if (currentState.status === 'running' || currentState.status === 'paused') {
                handleFail();
              }
            }, GRACE_PERIOD_MS);
          }
        }
      } else if (nextState === 'active' && (prevState === 'background' || prevState === 'inactive')) {
        clearGrace();
      }
    });

    return () => {
      subscription.remove();
      clearGrace();
    };
  }, [strictMode, handleFail, clearGrace]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval_();
      clearGrace();
    };
  }, [clearInterval_, clearGrace]);

  return {
    durationMinutes,
    remainingSeconds,
    status,
    progress,
    treeStage,
    totalSeconds,
    handleFail,
    resetTimer,
  };
}
