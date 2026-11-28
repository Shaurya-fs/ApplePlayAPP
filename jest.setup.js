/* global jest */
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

// The native receiver doesn't exist under Jest; tests drive this fake instead.
jest.mock('./src/native/specs/NativeAirPlayReceiver', () => {
  const listeners = new Set();
  const module = {
    getSnapshot: jest.fn(() => new Promise(() => {})),
    start: jest.fn(() => Promise.resolve()),
    stop: jest.fn(),
    setDeviceName: jest.fn(),
    setStreamQuality: jest.fn(),
    setKeepAwake: jest.fn(),
    setImmersive: jest.fn(),
    openAppSettings: jest.fn(),
    onSnapshot: jest.fn(listener => {
      listeners.add(listener);
      return { remove: () => listeners.delete(listener) };
    }),
    __emit: snapshot => listeners.forEach(listener => listener(snapshot)),
  };
  return { __esModule: true, default: module };
});

jest.mock('./src/native/specs/AirPlayVideoViewNativeComponent', () => ({
  __esModule: true,
  default: 'AirPlayVideoView',
}));
