import React from 'react';
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
  enableStats?: boolean;
}

export const HMSPlayer: React.FC<HMSPlayerProps> = ({
  url = '',
  style,
  enableStats,
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
    <RCTHMSPlayer
      url={url}
      style={style}
      enableStats={enableStats}
      onHmsHlsPlaybackEvent={handleHLSPlaybackEvent}
      onHmsHlsStatsEvent={handleHLSStatsEvent}
    />
  );
};

/**
 * 1. Wrap native ui component in View
 * 2. pass styles passed via props to this wrapper view
 * 3. apply `Stylesheet.absoluteFill` to native ui component
 */
