import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import {
  setHLSPlayerCue,
  setHLSPlayerPlaybackError,
  setHLSPlayerPlaybackState,
  setHLSPlayerStats,
  setHLSPlayerStatsError,
} from './hooks';
import {
  HmsHlsPlaybackEventHandler,
  HmsHlsStatsEventHandler,
  RCTHMSPlayer,
} from './RCTHMSPlayer';
import {
  HMSHLSPlayerPlaybackEventTypes,
  HMSHLSPlayerStatsEventTypes,
} from '../../types';
import type { HMSPlayerPlaybackCueEventData } from '../../types';
import { HMSEncoder } from '../../classes/HMSEncoder';
import type { HLSPlayerPlaybackCue } from '../../stores/types';

export interface HMSPlayerProps {
  url?: string;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  aspectRatio?: number;
  enableStats?: boolean;
  enableControls?: boolean;
}

export const HMSPlayer: React.FC<HMSPlayerProps> = ({
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
        HMSPlayerPlaybackCueEventData,
        HLSPlayerPlaybackCue
      >(data);
      setHLSPlayerCue(transformedData);
    } else if (
      event === HMSHLSPlayerPlaybackEventTypes.ON_PLAYBACK_FAILURE_EVENT
    ) {
      setHLSPlayerPlaybackError(data.error);
    } else {
      setHLSPlayerPlaybackState(data.state);
    }
  };

  // Handle HLS Stats events
  const handleHLSStatsEvent: HmsHlsStatsEventHandler = ({ nativeEvent }) => {
    const { event, data } = nativeEvent;

    if (event === HMSHLSPlayerStatsEventTypes.ON_STATS_EVENT_ERROR) {
      setHLSPlayerStatsError(data);
    } else {
      setHLSPlayerStats(data);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.playerWrapper, style]}>
        <RCTHMSPlayer
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
