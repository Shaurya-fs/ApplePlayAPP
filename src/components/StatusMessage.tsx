import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, type } from '../theme/theme';

type Props = { title: string; hint: string };

export function StatusMessage({ title, hint }: Props) {
  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <Text style={type.heading} testID="status-title">
        {title}
      </Text>
      <Text style={[type.body, styles.hint]}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  hint: { textAlign: 'center', maxWidth: 420 },
});
