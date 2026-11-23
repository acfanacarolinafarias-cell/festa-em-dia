import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { exampleState } from '@/domain/example';
import { normalizeState } from '@/domain/logic';
import type { AppEvent, AppState } from '@/domain/types';

const STORAGE_KEY = 'festa-em-dia/estado-v1';

type Store = {
  state: AppState;
  /** Aplica uma alteração sobre uma cópia do estado e salva no aparelho. */
  update: (fn: (draft: AppState) => void) => void;
};

const StoreContext = createContext<Store | null>(null);

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

export function AppStoreProvider({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => (raw ? normalizeState(JSON.parse(raw)) : exampleState()))
      .catch(() => exampleState())
      .then((s) => alive && setState(s));
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((s: AppState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s)).catch(() => {});
    }, 300);
  }, []);

  const update = useCallback(
    (fn: (draft: AppState) => void) => {
      setState((prev) => {
        if (!prev) return prev;
        const next = clone(prev);
        fn(next);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  if (!state) return <>{fallback ?? null}</>;
  return <StoreContext.Provider value={{ state, update }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore precisa estar dentro de AppStoreProvider');
  return s;
}

/** Evento pelo id, mais um atalho para alterá-lo. */
export function useEvent(id: string | undefined) {
  const { state, update } = useStore();
  const ev = state.events.find((e) => e.id === id);
  const updateEvent = useCallback(
    (fn: (draft: AppEvent, all: AppState) => void) =>
      update((s) => {
        const e = s.events.find((x) => x.id === id);
        if (e) fn(e, s);
      }),
    [id, update],
  );
  return { ev, updateEvent, state, update };
}
