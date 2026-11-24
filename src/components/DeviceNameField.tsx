import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, type } from '../theme/theme';

const MAX_LENGTH = 40;

type Props = {
  name: string;
  onRename: (name: string) => void;
};

/** The name your Mac shows in Screen Mirroring. Tap to change it. */
export function DeviceNameField({ name, onRename }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const editing = draft !== null;

  const save = () => {
    const next = (draft ?? '').trim();
    if (next && next !== name) onRename(next);
    setDraft(null);
  };

  return (
    <View style={styles.card}>
      <Text style={type.label}>SHOWS ON YOUR MAC AS</Text>
      {editing ? (
        <TextInput
          testID="device-name-input"
          autoFocus
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={save}
          onBlur={save}
          maxLength={MAX_LENGTH}
          returnKeyType="done"
          selectionColor={colors.accent}
          style={[styles.name, styles.input]}
        />
      ) : (
        <Pressable
          testID="device-name"
          accessibilityRole="button"
          accessibilityHint="Rename this device"
          onPress={() => setDraft(name)}
          style={styles.row}
        >
          <Text style={styles.name} numberOfLines={1}>
            {name || '…'}
          </Text>
          <Text style={styles.edit}>Rename</Text>
        </Pressable>
      )}
      <Text style={styles.footnote}>
        A new name shows up the next time you turn it on.
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
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { flex: 1, fontSize: 18, fontWeight: '600', color: colors.text },
  input: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  edit: { color: colors.accent, fontWeight: '600' },
  footnote: { fontSize: 13, color: colors.textMuted },
});
