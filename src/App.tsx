import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VideoStage } from './components/VideoStage';
import { isCasting } from './receiver/castPhase';
import { ReceiverProvider, useReceiver } from './receiver/ReceiverProvider';
import { useCastWindow } from './receiver/useCastWindow';
import { CastScreen } from './screens/CastScreen';
import { HomeScreen } from './screens/HomeScreen';
import { colors } from './theme/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <ReceiverProvider>
        <Root />
      </ReceiverProvider>
    </SafeAreaProvider>
  );
}

function Root() {
  const { state, phase } = useReceiver();
  const casting = isCasting(phase);
  useCastWindow(casting, state.connections > 0);

  return (
    <View style={styles.root}>
      <StatusBar hidden={casting} barStyle="light-content" />
      {state.power === 'on' ? (
        <VideoStage
          key="mirror"
          mode="mirror"
          visible={phase === 'mirroring'}
          aspect={state.videoAspect}
        />
      ) : null}
      {state.videoPlayback ? (
        <VideoStage
          key="video"
          mode="video"
          visible={phase === 'video'}
          aspect={state.playbackAspect}
        />
      ) : null}
      {casting ? <CastScreen /> : <HomeScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
