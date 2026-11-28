import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';
import { deriveCastPhase } from './castPhase';
import { ensureCastPermissions } from './permissions';
import {
  localNetworkError,
  receiverClient,
  toReceiverError,
} from './receiverClient';
import { INITIAL_RECEIVER_STATE } from './types';
import type { CastPhase, ReceiverError, ReceiverState } from './types';
import type { StreamQuality } from './streamQuality';

type ReceiverContextValue = {
  state: ReceiverState;
  phase: CastPhase;
  error: ReceiverError | null;
  /** Turns the receiver on if it is off, and off if it is on. */
  toggle: () => Promise<void>;
  rename: (name: string) => void;
  setQuality: (quality: StreamQuality) => void;
  openAppSettings: () => void;
};

const ReceiverContext = createContext<ReceiverContextValue | null>(null);

/**
 * Keeps one copy of the receiver's state for the whole app. Native events are the
 * source of truth; the provider only adds the "starting" moment and errors.
 */
export function ReceiverProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(INITIAL_RECEIVER_STATE);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<ReceiverError | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    let mounted = true;
    const subscription = receiverClient.subscribe(next => {
      if (mounted) setState(next);
    });
    receiverClient
      .getState()
      .then(next => mounted && setState(next))
      .catch(() => {});
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (state.power === 'on') setError(null);
  }, [state.power]);

  const turnOn = useCallback(async () => {
    setError(null);
    setStarting(true);
    try {
      if ((await ensureCastPermissions()) === 'blocked') {
        setError(localNetworkError());
        return;
      }
      await receiverClient.start();
    } catch (e) {
      setError(toReceiverError(e));
    } finally {
      setStarting(false);
    }
  }, []);

  const toggle = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      if (state.power === 'on') receiverClient.stop();
      else await turnOn();
    } finally {
      busy.current = false;
    }
  }, [state.power, turnOn]);

  const value = useMemo<ReceiverContextValue>(
    () => ({
      state,
      phase: deriveCastPhase(state, starting),
      error,
      toggle,
      rename: receiverClient.rename,
      setQuality: receiverClient.setQuality,
      openAppSettings: receiverClient.openAppSettings,
    }),
    [state, starting, error, toggle],
  );

  return (
    <ReceiverContext.Provider value={value}>
      {children}
    </ReceiverContext.Provider>
  );
}

export function useReceiver(): ReceiverContextValue {
  const value = useContext(ReceiverContext);
  if (!value)
    throw new Error('useReceiver must be used inside <ReceiverProvider>');
  return value;
}
