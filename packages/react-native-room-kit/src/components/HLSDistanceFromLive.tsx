import React from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import {
  HMSHLSPlaylistType,
  useHMSHLSPlayerStat,
  useIsHLSStreamLive,
} from '@100mslive/react-native-hms';
import { useSelector } from 'react-redux';

import { useHMSRoomStyle } from '../hooks-util';
import { useIsHLSStreamingOn } from '../hooks-sdk';
import type { RootState } from '../redux';

interface HLSDistanceFromLiveProps {}

export const _HLSDistanceFromLive: React.FC<HLSDistanceFromLiveProps> = () => {
  const isHLSStreamingOn = useIsHLSStreamingOn();
  const isDVRStream = useSelector(
    (state: RootState) =>
      state.hmsStates.room?.hlsStreamingState.variants?.[0]?.playlistType ===
      HMSHLSPlaylistType.DVR
  );
  const isStreamLive = useIsHLSStreamLive();

  if (!isHLSStreamingOn || !isDVRStream || isStreamLive) return null;

  return <HLSDistanceFromLiveText />;
};

export const HLSDistanceFromLiveText = React.memo(() => {
  const distanceFromLiveEdge = useHMSHLSPlayerStat('distanceFromLive');

  const textStyle = useHMSRoomStyle((_, typography) => ({
    fontFamily: `${typography.font_family}-Regular`,
    color: '#ffffff',
  }));

  const hhmmss = msToHMS(
    distanceFromLiveEdge - Platform.select({ default: 10000, ios: 1000 })
  );

  return <Text style={[styles.text, textStyle]}>-{hhmmss}</Text>;
});

export const HLSDistanceFromLive = React.memo(_HLSDistanceFromLive);

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
});

function msToHMS(ms: number) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const hours = Math.floor((ms / 1000 / 3600) % 24);

  const humanized = [
    minutes > 0 ? minutes.toString().padStart(2, '0') : '0',
    seconds.toString().padStart(2, '0'),
  ];

  if (hours > 0) humanized.unshift(hours.toString().padStart(2, '0'));

  return humanized.join(':');
}
