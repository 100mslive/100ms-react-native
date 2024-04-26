import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { HMSHLSPlayer } from '@100mslive/react-native-hms';

import { useHLSViewsConstraints } from '../hooks-util';
import { HLSPlayer } from './HLSPlayer';
import { HLSPlayerControls } from './HLSPlayerControls';

export const _HLSPlayerContainer: React.FC = () => {
  const hlsPlayerRef =
    React.useRef<React.ElementRef<typeof HMSHLSPlayer>>(null);
  const { playerWrapperConstraints } = useHLSViewsConstraints();

  return (
    <View
      style={[
        styles.hlsPlayerContainer,
        {
          backgroundColor: 'black',
          width: playerWrapperConstraints.width,
          height: playerWrapperConstraints.height,
        },
      ]}
    >
      <HLSPlayer ref={hlsPlayerRef} />

      <HLSPlayerControls playerRef={hlsPlayerRef} />
    </View>
  );
};

export const HLSPlayerContainer = React.memo(_HLSPlayerContainer);

const styles = StyleSheet.create({
  hlsView: {
    flex: 1,
  },
  hlsPlayerContainer: {
    // flex: 1,
    position: 'relative',
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningSubtitle: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.25,
    textAlign: 'center',
  },
  playbackFailedContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  playbackFailed: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 8,
  },
});
