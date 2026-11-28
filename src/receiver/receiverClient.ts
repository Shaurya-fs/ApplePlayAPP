import type { EventSubscription } from 'react-native';
import NativeAirPlayReceiver from '../native/specs/NativeAirPlayReceiver';
import { toReceiverState } from './types';
import type { ReceiverError, ReceiverState } from './types';
import type { StreamQuality } from './streamQuality';

/** The one place the app talks to the native receiver module. */
export const receiverClient = {
  async getState(): Promise<ReceiverState> {
    return toReceiverState(await NativeAirPlayReceiver.getSnapshot());
  },

  subscribe(listener: (state: ReceiverState) => void): EventSubscription {
    return NativeAirPlayReceiver.onSnapshot(snapshot =>
      listener(toReceiverState(snapshot)),
    );
  },

  start: () => NativeAirPlayReceiver.start(),
  stop: () => NativeAirPlayReceiver.stop(),
  rename: (name: string) => NativeAirPlayReceiver.setDeviceName(name),
  setQuality: (quality: StreamQuality) =>
    NativeAirPlayReceiver.setStreamQuality(quality),
  setKeepAwake: (on: boolean) => NativeAirPlayReceiver.setKeepAwake(on),
  setImmersive: (on: boolean) => NativeAirPlayReceiver.setImmersive(on),
  openAppSettings: () => NativeAirPlayReceiver.openAppSettings(),
};

export function toReceiverError(error: unknown): ReceiverError {
  const code = (error as { code?: string } | null)?.code;
  if (code === 'E_LOCAL_NETWORK') return localNetworkError();
  const message =
    error instanceof Error && error.message
      ? error.message
      : 'The receiver could not start. Check that Wi-Fi is on.';
  return { kind: 'start-failed', message };
}

export function localNetworkError(): ReceiverError {
  return {
    kind: 'local-network',
    message:
      'ApplePlay needs “Nearby devices / Local network” access so your Mac can find it.',
  };
}
