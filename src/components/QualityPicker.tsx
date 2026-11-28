import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { STREAM_QUALITIES, qualityLabel } from '../receiver/streamQuality';
import type { StreamQuality } from '../receiver/streamQuality';
import { colors, radius, spacing, type } from '../theme/theme';

type Props = {
  value: number;
  receiverOn: boolean;
  onChange: (quality: StreamQuality) => void;
};

/** Picks how sharp the stream from the Mac is. Lower is smoother on Wi-Fi. */
export function QualityPicker({ value, receiverOn, onChange }: Props) {
  return (
    <View style={styles.card}>
      <Text style={type.label}>STREAM QUALITY</Text>
      <View style={styles.row} accessibilityRole="radiogroup">
        {STREAM_QUALITIES.map(quality => {
          const selected = quality === value;
          return (
            <Pressable
              key={quality}
              testID={`quality-${quality}`}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => !selected && onChange(quality)}
              style={[styles.option, selected && styles.selected]}
            >
              <Text style={[styles.text, selected && styles.selectedText]}>
                {qualityLabel(quality)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.footnote}>
        Lower is smoother, higher is sharper but can lag.
        {receiverOn ? ' Changing it reconnects your Mac.' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  text: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  selectedText: { color: colors.accent },
  footnote: { fontSize: 13, color: colors.textMuted },
});
