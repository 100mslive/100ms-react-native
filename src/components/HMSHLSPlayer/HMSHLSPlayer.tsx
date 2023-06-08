import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import {
  setHMSHLSPlayerCue,
  setHMSHLSPlayerPlaybackError,
  setHMSHLSPlayerPlaybackState,
  setHMSHLSPlayerStats,
  setHMSHLSPlayerStatsError,
} from './hooks';
import {
  HmsHlsPlaybackEventHandler,
  HmsHlsStatsEventHandler,
  RCTHMSHLSPlayer,
} from './RCTHMSHLSPlayer';
import {
  HMSHLSPlayerPlaybackEventTypes,
  HMSHLSPlayerStatsEventTypes,
} from '../../types';
import type { HMSHLSPlayerPlaybackCueEventData } from '../../types';
import { HMSEncoder } from '../../classes/HMSEncoder';
import type { HMSHLSPlayerPlaybackCue } from '../../stores/types';

export interface HMSHLSPlayerProps {
  url?: string;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  aspectRatio?: number;
  enableStats?: boolean;
  enableControls?: boolean;
}

export const HMSHLSPlayer: React.FC<HMSHLSPlayerProps> = ({
  url = '',
  style,
  containerStyle,
  aspectRatio = 9 / 16,
  enableStats,
  enableControls = true,
}) => {
  // Handle HLS Playback events
  const handleHLSPlaybackEvent: HmsHlsPlaybackEventHandler = ({
    nativeEvent,
  }) => {
    const { event, data } = nativeEvent;

    if (event === HMSHLSPlayerPlaybackEventTypes.ON_PLAYBACK_CUE_EVENT) {
      const transformedData = HMSEncoder.transformHMSHLSCueEventData<
        HMSHLSPlayerPlaybackCueEventData,
        HMSHLSPlayerPlaybackCue
      >(data);
      setHMSHLSPlayerCue(transformedData);
    } else if (
      event === HMSHLSPlayerPlaybackEventTypes.ON_PLAYBACK_FAILURE_EVENT
    ) {
      setHMSHLSPlayerPlaybackError(data.error);
    } else {
      setHMSHLSPlayerPlaybackState(data.state);
    }
  };

  // Handle HLS Stats events
  const handleHLSStatsEvent: HmsHlsStatsEventHandler = ({ nativeEvent }) => {
    const { event, data } = nativeEvent;

    if (event === HMSHLSPlayerStatsEventTypes.ON_STATS_EVENT_ERROR) {
      setHMSHLSPlayerStatsError(data);
    } else {
      setHMSHLSPlayerStats(data);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.playerWrapper, style]}>
        <RCTHMSHLSPlayer
          url={url}
          style={[styles.player, { aspectRatio }]}
          enableStats={enableStats}
          enableControls={enableControls}
          onHmsHlsPlaybackEvent={handleHLSPlaybackEvent}
          onHmsHlsStatsEvent={handleHLSStatsEvent}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerWrapper: {
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  player: {
    width: '100%',
    maxHeight: '100%',
    maxWidth: '100%',
    aspectRatio: 9 / 16,
  },
});
