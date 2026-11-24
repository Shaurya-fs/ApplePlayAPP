import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme/theme';

type Props = {
  on: boolean;
  busy?: boolean;
  onPress: () => void;
  size?: number;
};

/** The one big switch. A soft pulse runs while the receiver is on. */
export function PowerButton({ on, busy = false, onPress, size = 184 }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!on) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 2200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [on, pulse]);

  const tint = on ? colors.accent : colors.textMuted;
  const ring = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View style={[styles.wrap, { width: size * 1.5, height: size * 1.5 }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pulse,
          ring,
          {
            opacity: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 0],
            }),
            transform: [
              {
                scale: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.45],
                }),
              },
            ],
          },
        ]}
      />
      <Pressable
        testID="power-button"
        accessibilityRole="switch"
        accessibilityLabel="Casting receiver"
        accessibilityHint={
          on ? 'Turns the receiver off' : 'Turns the receiver on'
        }
        accessibilityState={{ checked: on, busy, disabled: busy }}
        disabled={busy}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          ring,
          on && styles.buttonOn,
          (pressed || busy) && styles.buttonPressed,
        ]}
      >
        <PowerGlyph color={tint} size={size * 0.34} />
      </Pressable>
    </View>
  );
}

function PowerGlyph({ color, size }: { color: string; size: number }) {
  const stroke = Math.max(4, size * 0.12);
  return (
    <View style={[styles.glyph, { width: size, height: size }]}>
      <View
        style={[
          styles.glyphRing,
          {
            top: size * 0.12,
            width: size,
            height: size * 0.88,
            borderRadius: size,
            borderWidth: stroke,
            borderColor: color,
          },
        ]}
      />
      <View
        style={{
          width: stroke,
          height: size * 0.52,
          borderRadius: stroke,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  pulse: { position: 'absolute', backgroundColor: colors.accent },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  buttonOn: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  buttonPressed: { opacity: 0.75 },
  glyph: { alignItems: 'center' },
  glyphRing: { position: 'absolute', borderTopColor: 'transparent' },
});
