import type { CastPhase, ReceiverState } from './types';

export function deriveCastPhase(
  state: ReceiverState,
  starting: boolean,
): CastPhase {
  if (state.power === 'error') return 'error';
  if (state.power !== 'on') return starting ? 'starting' : 'off';
  if (state.videoPlayback) return 'video';
  if (state.mirroring) return 'mirroring';
  if (state.audioOnly) return 'audio';
  if (state.connections > 0) return 'connected';
  return 'waiting';
}

/** True while a picture fills the screen. */
export function isCasting(phase: CastPhase): boolean {
  return phase === 'mirroring' || phase === 'video';
}

export type PhaseCopy = { title: string; hint: string };

export function describePhase(phase: CastPhase, deviceName: string): PhaseCopy {
  switch (phase) {
    case 'off':
      return { title: 'Off', hint: 'Tap the button to cast your Mac here.' };
    case 'starting':
      return { title: 'Turning on…', hint: 'Getting ready for your Mac.' };
    case 'waiting':
      return {
        title: 'Ready',
        hint: `On your Mac, open Control Center › Screen Mirroring and choose “${deviceName}”.`,
      };
    case 'connected':
      return { title: 'Connected', hint: 'The picture is on its way.' };
    case 'audio':
      return {
        title: 'Playing audio',
        hint: 'Sound from your Mac plays here.',
      };
    case 'mirroring':
    case 'video':
      return { title: 'Casting', hint: 'Tap the screen for options.' };
    case 'error':
      return {
        title: 'Couldn’t turn on',
        hint: 'Check that Wi-Fi is on, then try again.',
      };
  }
}
