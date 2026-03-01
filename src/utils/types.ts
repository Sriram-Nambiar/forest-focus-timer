import type { TreeStage } from '../constants';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

export interface FocusSession {
  id: string;
  durationMinutes: number;
  startTime: number;
  endTime: number | null;
  status: 'completed' | 'failed';
  treeStage: TreeStage;
}

export interface ActiveSession {
  durationMinutes: number;
  remainingSeconds: number;
  startTime: number;
  status: TimerStatus;
  pausedAt: number | null;
}

export interface Settings {
  strictMode: boolean;
  notificationsEnabled: boolean;
  darkMode: boolean;
}
