export const DURATION_OPTIONS = [15, 25, 45] as const;

export const MIN_DURATION_MINUTES = 1;
export const MAX_DURATION_MINUTES = 120;

export const GRACE_PERIOD_MS = 5000;

export const TIMER_INTERVAL_MS = 1000;

export const TREE_STAGES = {
  SEED: 'seed',
  SMALL: 'small',
  MEDIUM: 'medium',
  FULL: 'full',
} as const;

export type TreeStage = (typeof TREE_STAGES)[keyof typeof TREE_STAGES];

export const STORAGE_KEYS = {
  SESSIONS: '@forest_sessions',
  SETTINGS: '@forest_settings',
  ACTIVE_SESSION: '@forest_active_session',
} as const;

export const COLORS = {
  primary: '#2E7D32',
  primaryLight: '#4CAF50',
  primaryDark: '#1B5E20',
  background: '#F1F8E9',
  backgroundDark: '#121212',
  surface: '#FFFFFF',
  surfaceDark: '#1E1E1E',
  text: '#212121',
  textDark: '#E0E0E0',
  textSecondary: '#757575',
  textSecondaryDark: '#BDBDBD',
  error: '#D32F2F',
  errorLight: '#EF5350',
  success: '#388E3C',
  warning: '#F57C00',
  deadTree: '#795548',
  border: '#E0E0E0',
  borderDark: '#333333',
} as const;
