import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppAction, AppState, freshState, parseStoredState, reducer, serializeState } from './model';

export const STORAGE_KEY = '@after-hours/state/v1';

export function useStore() {
  const [state, setState] = useState<AppState>(freshState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [readAttempt, setReadAttempt] = useState(0);
  const mounted = useRef(false);
  const readyRef = useRef(false);
  const blockedRef = useRef(false);
  const stateRef = useRef(state);
  const errorKind = useRef<'read' | 'invalid' | 'write' | null>(null);
  const readGeneration = useRef(0);
  const writeSequence = useRef(0);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());
  const lastQueued = useRef<string | null>(null);
  stateRef.current = state;

  const enqueueWrite = useCallback((snapshot: AppState, force = false) => {
    const serialized = serializeState(snapshot);
    if (!force && serialized === lastQueued.current) return;
    lastQueued.current = serialized;
    const sequence = ++writeSequence.current;
    // Every write waits for the previous write, including failed ones. An older
    // asynchronous save can therefore never finish after a newer save.
    writeQueue.current = writeQueue.current.then(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, serialized);
        if (mounted.current && sequence === writeSequence.current) {
          errorKind.current = null;
          setStorageError(null);
        }
      } catch {
        if (mounted.current && sequence === writeSequence.current) {
          errorKind.current = 'write';
          setStorageError('Your latest changes could not be saved. They are still here; retry saving before closing the app.');
        }
      }
    });
  }, []);

  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    const generation = ++readGeneration.current;
    readyRef.current = false;
    setReady(false);
    const active = () => !cancelled && generation === readGeneration.current;

    async function hydrate() {
      try {
        await writeQueue.current;
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!active()) return;
        const result = parseStoredState(raw);
        if (!result.ok) {
          blockedRef.current = true;
          errorKind.current = 'invalid';
          setStorageBlocked(true);
          setStorageError(`${result.error} Retry loading, or reset local data to start again.`);
          return;
        }
        const restored = result.state ?? freshState();
        // Compare against the original bytes so migrated dates/version are saved.
        lastQueued.current = raw;
        stateRef.current = restored;
        setState(restored);
        blockedRef.current = false;
        errorKind.current = null;
        setStorageBlocked(false);
        setStorageError(null);
      } catch {
        if (!active()) return;
        blockedRef.current = true;
        errorKind.current = 'read';
        setStorageBlocked(true);
        setStorageError('Your saved data is temporarily unavailable. Editing is paused to protect it. Retry loading, or reset local data to start again.');
      } finally {
        if (active()) {
          readyRef.current = true;
          setReady(true);
        }
      }
    }
    void hydrate();
    return () => {
      cancelled = true;
      mounted.current = false;
    };
  }, [readAttempt]);

  useEffect(() => {
    if (ready && !storageBlocked) enqueueWrite(state);
  }, [state, ready, storageBlocked, enqueueWrite]);

  const dispatch = useCallback((action: AppAction) => {
    if (!readyRef.current || blockedRef.current) return;
    setState(current => reducer(current, action));
  }, []);

  const retryStorage = useCallback(() => {
    if (errorKind.current === 'write' && !blockedRef.current) {
      enqueueWrite(stateRef.current, true);
    } else {
      setReadAttempt(attempt => attempt + 1);
    }
  }, [enqueueWrite]);

  // Expose reset separately so corrupt data is only replaced through an explicit
  // recovery action. Normal edits never overwrite a failed hydration.
  const resetStorage = useCallback(() => {
    ++readGeneration.current;
    const initial = freshState();
    stateRef.current = initial;
    lastQueued.current = null;
    blockedRef.current = false;
    readyRef.current = true;
    errorKind.current = null;
    setState(initial);
    setStorageBlocked(false);
    setStorageError(null);
    setReady(true);
    enqueueWrite(initial, true);
  }, [enqueueWrite]);

  return { state, dispatch, ready, storageError, storageBlocked, resetStorage, retryStorage };
}
