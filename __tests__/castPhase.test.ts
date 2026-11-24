import {
  deriveCastPhase,
  describePhase,
  isCasting,
} from '../src/receiver/castPhase';
import { INITIAL_RECEIVER_STATE, toReceiverState } from '../src/receiver/types';
import type { ReceiverState } from '../src/receiver/types';

const on: ReceiverState = { ...INITIAL_RECEIVER_STATE, power: 'on' };

describe('deriveCastPhase', () => {
  it.each<[string, ReceiverState, boolean, string]>([
    ['off', INITIAL_RECEIVER_STATE, false, 'off'],
    ['starting', INITIAL_RECEIVER_STATE, true, 'starting'],
    [
      'error wins',
      { ...INITIAL_RECEIVER_STATE, power: 'error' },
      true,
      'error',
    ],
    ['waiting for a Mac', on, false, 'waiting'],
    [
      'connected, no picture yet',
      { ...on, connections: 1 },
      false,
      'connected',
    ],
    [
      'mirroring',
      { ...on, connections: 1, mirroring: true },
      false,
      'mirroring',
    ],
    ['audio only', { ...on, connections: 1, audioOnly: true }, false, 'audio'],
    [
      'video beats mirroring',
      { ...on, mirroring: true, videoPlayback: true },
      false,
      'video',
    ],
  ])('%s', (_, state, starting, expected) => {
    expect(deriveCastPhase(state, starting)).toBe(expected);
  });
});

test('only picture phases count as casting', () => {
  expect(isCasting('mirroring')).toBe(true);
  expect(isCasting('video')).toBe(true);
  expect(isCasting('audio')).toBe(false);
  expect(isCasting('waiting')).toBe(false);
});

test('the ready hint names the device', () => {
  expect(describePhase('waiting', 'ApplePlay Pixel 9').hint).toContain(
    'ApplePlay Pixel 9',
  );
});

test('unknown power values from native read as off', () => {
  expect(
    toReceiverState({ ...INITIAL_RECEIVER_STATE, power: 'weird' }).power,
  ).toBe('off');
});
