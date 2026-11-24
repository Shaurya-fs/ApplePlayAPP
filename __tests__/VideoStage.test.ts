import { fitToScreen } from '../src/components/VideoStage';

test('wide picture on a tall phone fills the width', () => {
  expect(fitToScreen(400, 800, 2)).toEqual({ width: 400, height: 200 });
});

test('wide picture on a wider screen fills the height', () => {
  expect(fitToScreen(1000, 400, 2)).toEqual({ width: 800, height: 400 });
});

test('a bad aspect falls back to 16:9', () => {
  expect(fitToScreen(1600, 2000, 0)).toEqual({ width: 1600, height: 900 });
});
