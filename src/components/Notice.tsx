import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, type } from '../theme/theme';

type Props = {
  tone?: 'info' | 'danger';
  title: string;
  body?: string;
  action?: { label: string; onPress: () => void };
};

/** A small card for things that need attention: a pairing code, an error, what's playing. */
export function Notice({ tone = 'info', title, body, action }: Props) {
  const danger = tone === 'danger';
  return (
    <View style={[styles.card, danger && styles.danger]}>
      <Text style={[styles.title, danger && { color: colors.danger }]}>
        {title}
      </Text>
      {body ? <Text style={type.body}>{body}</Text> : null}
      {action ? (
        <Pressable
          accessibilityRole="button"
          onPress={action.onPress}
          style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.actionText}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  action: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
  },
  actionText: { color: colors.accent, fontWeight: '600' },
});
