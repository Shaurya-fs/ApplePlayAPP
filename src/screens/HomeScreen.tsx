import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DeviceNameField } from '../components/DeviceNameField';
import { Notice } from '../components/Notice';
import { PowerButton } from '../components/PowerButton';
import { StatusMessage } from '../components/StatusMessage';
import { describePhase } from '../receiver/castPhase';
import { useReceiver } from '../receiver/ReceiverProvider';
import { colors, spacing, type } from '../theme/theme';

export function HomeScreen() {
  const { state, phase, error, toggle, rename, openAppSettings } =
    useReceiver();
  const insets = useSafeAreaInsets();
  const copy = describePhase(phase, state.deviceName);
  const on = state.power === 'on';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <Text style={type.title}>ApplePlay</Text>

      <View style={styles.center}>
        <PowerButton on={on} busy={phase === 'starting'} onPress={toggle} />
        <Text style={[type.label, on && styles.onLabel]}>
          {on ? 'ON' : 'OFF'}
        </Text>
        <StatusMessage title={copy.title} hint={copy.hint} />
      </View>

      <View style={styles.cards}>
        {state.pin ? (
          <Notice
            title={`Code: ${state.pin}`}
            body="Type this code on your Mac to connect."
          />
        ) : null}

        {phase === 'audio' && state.trackTitle ? (
          <Notice
            title={state.trackTitle}
            body={state.trackArtist || undefined}
          />
        ) : null}

        {error ? (
          <Notice
            tone="danger"
            title="Couldn’t turn on"
            body={error.message}
            action={
              error.kind === 'local-network'
                ? { label: 'Open settings', onPress: openAppSettings }
                : { label: 'Try again', onPress: toggle }
            }
          />
        ) : null}

        <DeviceNameField name={state.deviceName} onRename={rename} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  onLabel: { color: colors.accent },
  cards: {
    alignSelf: 'stretch',
    maxWidth: 520,
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
});
