import { create } from 'zustand';
import { STORAGE_KEYS } from '../constants';
import { safeGetItem, safeSetItem } from '../utils/storage';
import type { FocusSession } from '../utils/types';

interface SessionState {
  sessions: FocusSession[];
  loaded: boolean;
  loadSessions: () => Promise<void>;
  addSession: (session: FocusSession) => Promise<void>;
  clearSessions: () => Promise<void>;
}

function validateSessions(data: unknown): FocusSession[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is FocusSession =>
      item != null &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.durationMinutes === 'number' &&
      typeof item.startTime === 'number' &&
      (item.status === 'completed' || item.status === 'failed'),
  );
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  loaded: false,

  loadSessions: async () => {
    const data = await safeGetItem<unknown>(STORAGE_KEYS.SESSIONS);
    const sessions = validateSessions(data);
    set({ sessions, loaded: true });
  },

  addSession: async (session: FocusSession) => {
    const updated = [session, ...get().sessions];
    set({ sessions: updated });
    await safeSetItem(STORAGE_KEYS.SESSIONS, updated);
  },

  clearSessions: async () => {
    set({ sessions: [] });
    await safeSetItem(STORAGE_KEYS.SESSIONS, []);
  },
}));
