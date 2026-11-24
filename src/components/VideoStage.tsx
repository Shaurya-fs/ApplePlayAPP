import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import AirPlayVideoView from '../native/specs/AirPlayVideoViewNativeComponent';
import { colors } from '../theme/theme';

type Props = {
  mode: 'mirror' | 'video';
  /** Full screen when true. When false the surface stays ready but out of sight. */
  visible: boolean;
  /** Width divided by height of the incoming picture. */
  aspect: number;
};

/** Largest box with the picture's shape that fits the screen. */
export function fitToScreen(screenW: number, screenH: number, aspect: number) {
  const ratio = aspect > 0 ? aspect : 16 / 9;
  return screenW / screenH > ratio
    ? { width: screenH * ratio, height: screenH }
    : { width: screenW, height: screenW / ratio };
}

/**
 * Where the picture appears. It stays mounted while the receiver is on, so the
 * first frame from the Mac has somewhere to go.
 */
export function VideoStage({ mode, visible, aspect }: Props) {
  const screen = useWindowDimensions();
  const size = fitToScreen(screen.width, screen.height, aspect);

  return (
    <View
      pointerEvents="none"
      style={visible ? styles.stage : styles.standby}
      importantForAccessibility="no-hide-descendants"
    >
      <AirPlayVideoView mode={mode} style={visible ? size : styles.standby} />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  standby: { position: 'absolute', top: 0, left: 0, width: 1, height: 1 },
});
