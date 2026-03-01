import { create } from 'zustand';
import { STORAGE_KEYS } from '../constants';
import { safeGetItem, safeSetItem } from '../utils/storage';
import type { Settings } from '../utils/types';

const DEFAULT_SETTINGS: Settings = {
  strictMode: false,
  notificationsEnabled: true,
  darkMode: false,
};

interface SettingsState extends Settings {
  loaded: boolean;
  loadSettings: () => Promise<void>;
  setStrictMode: (value: boolean) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setDarkMode: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  loaded: false,

  loadSettings: async () => {
    const saved = await safeGetItem<Settings>(STORAGE_KEYS.SETTINGS);
    if (saved && typeof saved === 'object') {
      set({
        strictMode: typeof saved.strictMode === 'boolean' ? saved.strictMode : DEFAULT_SETTINGS.strictMode,
        notificationsEnabled: typeof saved.notificationsEnabled === 'boolean' ? saved.notificationsEnabled : DEFAULT_SETTINGS.notificationsEnabled,
        darkMode: typeof saved.darkMode === 'boolean' ? saved.darkMode : DEFAULT_SETTINGS.darkMode,
        loaded: true,
      });
    } else {
      set({ loaded: true });
    }
  },

  setStrictMode: (value: boolean) => {
    set({ strictMode: value });
    const { strictMode, notificationsEnabled, darkMode } = { ...get(), strictMode: value };
    safeSetItem(STORAGE_KEYS.SETTINGS, { strictMode, notificationsEnabled, darkMode });
  },

  setNotificationsEnabled: (value: boolean) => {
    set({ notificationsEnabled: value });
    const { strictMode, notificationsEnabled, darkMode } = { ...get(), notificationsEnabled: value };
    safeSetItem(STORAGE_KEYS.SETTINGS, { strictMode, notificationsEnabled, darkMode });
  },

  setDarkMode: (value: boolean) => {
    set({ darkMode: value });
    const { strictMode, notificationsEnabled, darkMode } = { ...get(), darkMode: value };
    safeSetItem(STORAGE_KEYS.SETTINGS, { strictMode, notificationsEnabled, darkMode });
  },
}));
