import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReceiver } from '../receiver/ReceiverProvider';
import { colors, radius, spacing } from '../theme/theme';

const CONTROLS_TIMEOUT_MS = 3500;

/**
 * Sits on top of the picture. Tap anywhere to show the controls for a few seconds.
 */
export function CastScreen() {
  const { state, toggle } = useReceiver();
  const insets = useSafeAreaInsets();
  const [controls, setControls] = useState(false);

  useEffect(() => {
    if (!controls) return;
    const timer = setTimeout(() => setControls(false), CONTROLS_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [controls]);

  return (
    <Pressable
      testID="cast-screen"
      accessibilityLabel="Show casting controls"
      style={StyleSheet.absoluteFill}
      onPress={() => setControls(shown => !shown)}
    >
      {controls ? (
        <View
          style={[styles.bar, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <Text style={styles.name} numberOfLines={1}>
            {state.deviceName}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={toggle}
            style={({ pressed }) => [styles.stop, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.stopText}>Turn off</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.scrim,
  },
  name: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '600' },
  stop: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
  },
  stopText: { color: colors.black, fontWeight: '700' },
});
