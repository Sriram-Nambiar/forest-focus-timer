import type { TreeStage } from '../constants';
import { TREE_STAGES } from '../constants';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function formatTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function getTreeStage(progress: number): TreeStage {
  if (progress >= 1) return TREE_STAGES.FULL;
  if (progress >= 0.66) return TREE_STAGES.MEDIUM;
  if (progress >= 0.33) return TREE_STAGES.SMALL;
  return TREE_STAGES.SEED;
}

export function getProgress(remainingSeconds: number, totalSeconds: number): number {
  if (totalSeconds <= 0) return 0;
  return Math.max(0, Math.min(1, 1 - remainingSeconds / totalSeconds));
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function validateDuration(minutes: number): boolean {
  return Number.isFinite(minutes) && minutes >= 1 && minutes <= 120;
}
