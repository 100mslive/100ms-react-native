import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSelector } from 'react-redux';
import {
  HMSHLSPlaylistType,
  useIsHLSStreamLive,
} from '@100mslive/react-native-hms';
import type { HMSHLSPlayer } from '@100mslive/react-native-hms';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { useIsHLSStreamingOn } from '../hooks-sdk';
import type { RootState } from '../redux';

interface HLSGoLiveControlProps {
  playerRef: React.RefObject<React.ElementRef<typeof HMSHLSPlayer>>;
  onPress?: () => void;
}

export const _HLSGoLiveControl: React.FC<HLSGoLiveControlProps> = ({
  playerRef,
  onPress,
}) => {
  const isHLSStreamingOn = useIsHLSStreamingOn();
  const isDVRStream = useSelector(
    (state: RootState) =>
      state.hmsStates.room?.hlsStreamingState.variants?.[0]?.playlistType ===
      HMSHLSPlaylistType.DVR
  );
  const isStreamLive = useIsHLSStreamLive();

  const handleGoLivePress = () => {
    onPress?.();
    playerRef.current?.seekToLivePosition();
  };

  const hmsRoomStyles = useHMSRoomStyleSheet(
    (theme, typography) => ({
      semiBoldSurfaceHigh: {
        fontFamily: `${typography.font_family}-SemiBold`,
        color: theme.palette.on_surface_high,
      },
      semiBoldSurfaceMedium: {
        fontFamily: `${typography.font_family}-SemiBold`,
        color: theme.palette.on_surface_medium,
      },
      liveIndicatorDot: {
        backgroundColor: theme.palette.alert_error_default,
      },
      notLiveIndicatorDot: {
        backgroundColor: theme.palette.on_surface_low,
      },
    }),
    []
  );

  if (!isHLSStreamingOn || !isDVRStream) return null;

  return (
    <GestureDetector gesture={Gesture.Tap()}>
      <TouchableOpacity onPress={handleGoLivePress} style={styles.liveButton}>
        <View
          style={[
            styles.liveIndicatorDot,
            isStreamLive
              ? hmsRoomStyles.liveIndicatorDot
              : hmsRoomStyles.notLiveIndicatorDot,
          ]}
        />
        <Text
          style={[
            styles.liveText,
            isStreamLive
              ? hmsRoomStyles.semiBoldSurfaceHigh
              : hmsRoomStyles.semiBoldSurfaceMedium,
          ]}
        >
          {isStreamLive ? 'LIVE' : 'GO LIVE'}
        </Text>
      </TouchableOpacity>
    </GestureDetector>
  );
};

export const HLSGoLiveControl = React.memo(_HLSGoLiveControl);

const styles = StyleSheet.create({
  liveButton: {
    padding: 4,
    alignItems: 'center',
    flexDirection: 'row',
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  liveText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
});
