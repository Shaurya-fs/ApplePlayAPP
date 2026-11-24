import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../src/App';
import NativeAirPlayReceiver from '../src/native/specs/NativeAirPlayReceiver';
import { INITIAL_RECEIVER_STATE } from '../src/receiver/types';

const native = NativeAirPlayReceiver as unknown as jest.Mocked<
  typeof NativeAirPlayReceiver
> & {
  __emit: (snapshot: object) => void;
};

async function render() {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />);
  });
  return tree;
}

function emit(patch: object) {
  return ReactTestRenderer.act(async () => {
    native.__emit({
      ...INITIAL_RECEIVER_STATE,
      deviceName: 'ApplePlay Test',
      ...patch,
    });
  });
}

const statusTitle = (tree: ReactTestRenderer.ReactTestRenderer) =>
  tree.root.findByProps({ testID: 'status-title' }).props.children;

beforeEach(() => jest.clearAllMocks());

test('one press turns the receiver on', async () => {
  const tree = await render();
  expect(statusTitle(tree)).toBe('Off');

  await ReactTestRenderer.act(async () => {
    tree.root.findByProps({ testID: 'power-button' }).props.onPress();
  });
  expect(native.start).toHaveBeenCalledTimes(1);

  await emit({ power: 'on' });
  expect(statusTitle(tree)).toBe('Ready');
});

test('pressing again turns it off', async () => {
  const tree = await render();
  await emit({ power: 'on' });

  await ReactTestRenderer.act(async () => {
    tree.root.findByProps({ testID: 'power-button' }).props.onPress();
  });
  expect(native.stop).toHaveBeenCalledTimes(1);
  expect(native.start).not.toHaveBeenCalled();
});

test('the picture takes over the screen while mirroring', async () => {
  const tree = await render();
  await emit({ power: 'on', connections: 1, mirroring: true });

  expect(
    tree.root.findAllByProps({ testID: 'cast-screen' }).length,
  ).toBeGreaterThan(0);
  expect(tree.root.findAllByProps({ testID: 'power-button' })).toHaveLength(0);
  expect(native.setImmersive).toHaveBeenLastCalledWith(true);
  expect(native.setKeepAwake).toHaveBeenLastCalledWith(true);
});

test('a failed start shows the reason', async () => {
  native.start.mockRejectedValueOnce(
    Object.assign(
      new Error('The receiver could not start. Check that Wi-Fi is on.'),
      {
        code: 'E_START_FAILED',
      },
    ),
  );
  const tree = await render();

  await ReactTestRenderer.act(async () => {
    tree.root.findByProps({ testID: 'power-button' }).props.onPress();
  });
  expect(
    tree.root.findAll(
      node =>
        node.props.children ===
        'The receiver could not start. Check that Wi-Fi is on.',
    ),
  ).not.toHaveLength(0);
});

test('renaming passes the new name to the receiver', async () => {
  const tree = await render();
  await emit({});

  await ReactTestRenderer.act(async () => {
    tree.root.findByProps({ testID: 'device-name' }).props.onPress();
  });
  const input = tree.root.findByProps({ testID: 'device-name-input' });
  await ReactTestRenderer.act(async () =>
    input.props.onChangeText('  Living room  '),
  );
  await ReactTestRenderer.act(async () => {
    tree.root
      .findByProps({ testID: 'device-name-input' })
      .props.onSubmitEditing();
  });
  expect(native.setDeviceName).toHaveBeenCalledWith('Living room');
});
