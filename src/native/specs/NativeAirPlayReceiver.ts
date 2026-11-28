import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Everything the app needs to know about the receiver, sent again on every change.
 * Built on the Android side in ReceiverSnapshot.kt.
 */
export type ReceiverSnapshot = {
  /** 'off' | 'on' | 'error' */
  power: string;
  connections: number;
  mirroring: boolean;
  videoPlayback: boolean;
  audioOnly: boolean;
  trackTitle: string;
  trackArtist: string;
  videoAspect: number;
  playbackAspect: number;
  deviceName: string;
  /** Pairing code to type on the Mac, or '' when none is needed. */
  pin: string;
  hasLocalNetworkAccess: boolean;
  /** Stream height asked of the Mac: 720, 1080, 1440 or 2160. */
  streamQuality: number;
};

export interface Spec extends TurboModule {
  getSnapshot(): Promise<ReceiverSnapshot>;
  /** Resolves once the receiver is visible on the network. */
  start(): Promise<void>;
  stop(): void;
  setDeviceName(name: string): void;
  /** Saves the stream height and restarts the receiver if it is on. */
  setStreamQuality(quality: number): void;
  setKeepAwake(enabled: boolean): void;
  setImmersive(enabled: boolean): void;
  openAppSettings(): void;
  readonly onSnapshot: CodegenTypes.EventEmitter<ReceiverSnapshot>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('AirPlayReceiver');
