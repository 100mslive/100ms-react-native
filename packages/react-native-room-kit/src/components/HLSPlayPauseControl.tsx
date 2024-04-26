import { HMSHLSPlaylistType } from '@100mslive/react-native-hms';
import type { HMSHLSPlayer } from '@100mslive/react-native-hms';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { useIsHLSStreamingOn } from '../hooks-sdk';
import type { RootState } from '../redux';
import { PauseIcon, PlayIcon } from '../Icons';
import { useHLSStreamResumePause } from '../hooks-util';

export interface HLSPlayPauseControlProps {
  playerRef: React.RefObject<React.ElementRef<typeof HMSHLSPlayer>>;
  onPress?: () => void;
}

const _HLSPlayPauseControl: React.FC<HLSPlayPauseControlProps> = ({
  playerRef,
  onPress,
}) => {
  const isHLSStreamingOn = useIsHLSStreamingOn();
  const isDVRStream = useSelector((state: RootState) => {
    return (
      state.hmsStates.room?.hlsStreamingState.variants?.[0]?.playlistType ===
      HMSHLSPlaylistType.DVR
    );
  });

  const { isPaused, pauseStream, resumeStream } =
    useHLSStreamResumePause(playerRef);

  const togglePlayPause = () => {
    onPress?.();
    if (isPaused) {
      resumeStream();
    } else {
      pauseStream();
    }
  };

  if (!isHLSStreamingOn || !isDVRStream) return null;

  return (
    <GestureDetector gesture={Gesture.Tap()}>
      <TouchableOpacity
        onPress={togglePlayPause}
        style={{ alignSelf: 'center' }}
      >
        <View style={styles.container}>
          {isPaused ? <PlayIcon /> : <PauseIcon />}
        </View>
      </TouchableOpacity>
    </GestureDetector>
  );
};

export const HLSPlayPauseControl = React.memo(_HLSPlayPauseControl);

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});
