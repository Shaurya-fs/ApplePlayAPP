import type { ReceiverSnapshot } from '../native/specs/NativeAirPlayReceiver';

export type PowerState = 'off' | 'on' | 'error';

/** What the receiver is doing right now, from the user's point of view. */
export type CastPhase =
  | 'off'
  | 'starting'
  | 'waiting'
  | 'connected'
  | 'mirroring'
  | 'video'
  | 'audio'
  | 'error';

export type ReceiverState = Omit<ReceiverSnapshot, 'power'> & {
  power: PowerState;
};

export type ReceiverErrorKind = 'local-network' | 'start-failed';

export type ReceiverError = {
  kind: ReceiverErrorKind;
  message: string;
};

export const INITIAL_RECEIVER_STATE: ReceiverState = {
  power: 'off',
  connections: 0,
  mirroring: false,
  videoPlayback: false,
  audioOnly: false,
  trackTitle: '',
  trackArtist: '',
  videoAspect: 16 / 9,
  playbackAspect: 16 / 9,
  deviceName: '',
  pin: '',
  hasLocalNetworkAccess: true,
};

const POWER_STATES: readonly PowerState[] = ['off', 'on', 'error'];

export function toReceiverState(snapshot: ReceiverSnapshot): ReceiverState {
  const power = POWER_STATES.includes(snapshot.power as PowerState)
    ? (snapshot.power as PowerState)
    : 'off';
  return { ...snapshot, power };
}
