import React, { useImperativeHandle, useRef } from 'react';
import { View, StyleSheet, UIManager, findNodeHandle } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import {
  setHMSHLSPlayerCue,
  setHMSHLSPlayerPlaybackError,
  setHMSHLSPlayerPlaybackState,
  setHMSHLSPlayerStats,
  setHMSHLSPlayerStatsError,
} from './hooks';
import {
  RCTHMSHLSPlayer,
  RCTHMSHLSPlayerViewManagerConfig,
} from './RCTHMSHLSPlayer';
import type {
  HmsHlsPlaybackEventHandler,
  HmsHlsStatsEventHandler,
  RCTHMSHLSPlayerRef,
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

export interface HMSHLSPlayerRefProperties {
  play: (url?: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  seekForward: (seconds: number) => void;
  seekBackward: (seconds: number) => void;
  seekToLivePosition: () => void;
  setVolume: (level: number) => void;
}

const _HMSHLSPlayer: React.ForwardRefRenderFunction<
  HMSHLSPlayerRefProperties,
  HMSHLSPlayerProps
> = (
  {
    url = '',
    style,
    containerStyle,
    aspectRatio = 9 / 16,
    enableStats,
    enableControls = false,
  },
  ref
) => {
  const hmsHlsPlayerRef = useRef<RCTHMSHLSPlayerRef | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      play: (url?: string) => {
        if (
          hmsHlsPlayerRef.current &&
          RCTHMSHLSPlayerViewManagerConfig.Commands.play
        ) {
          UIManager.dispatchViewManagerCommand(
            findNodeHandle(hmsHlsPlayerRef.current),
            RCTHMSHLSPlayerViewManagerConfig.Commands.play,
            url ? [url] : ['']
          );
        }
      },
      stop: () => {
        if (
          hmsHlsPlayerRef.current &&
          RCTHMSHLSPlayerViewManagerConfig.Commands.stop
        ) {
          UIManager.dispatchViewManagerCommand(
            findNodeHandle(hmsHlsPlayerRef.current),
            RCTHMSHLSPlayerViewManagerConfig.Commands.stop,
            undefined
          );
        }
      },
      pause: () => {
        if (
          hmsHlsPlayerRef.current &&
          RCTHMSHLSPlayerViewManagerConfig.Commands.pause
        ) {
          UIManager.dispatchViewManagerCommand(
            findNodeHandle(hmsHlsPlayerRef.current),
            RCTHMSHLSPlayerViewManagerConfig.Commands.pause,
            undefined
          );
        }
      },
      resume: () => {
        if (
          hmsHlsPlayerRef.current &&
          RCTHMSHLSPlayerViewManagerConfig.Commands.resume
        ) {
          UIManager.dispatchViewManagerCommand(
            findNodeHandle(hmsHlsPlayerRef.current),
            RCTHMSHLSPlayerViewManagerConfig.Commands.resume,
            undefined
          );
        }
      },
      seekForward: (seconds: number) => {
        if (typeof seconds !== 'number') {
          throw new Error(
            seconds
              ? 'seconds must be a `number` type'
              : 'seconds was not provided'
          );
        }

        if (
          hmsHlsPlayerRef.current &&
          RCTHMSHLSPlayerViewManagerConfig.Commands.seekForward
        ) {
          UIManager.dispatchViewManagerCommand(
            findNodeHandle(hmsHlsPlayerRef.current),
            RCTHMSHLSPlayerViewManagerConfig.Commands.seekForward,
            [seconds]
          );
        }
      },
      seekBackward: (seconds: number) => {
        if (typeof seconds !== 'number') {
          throw new Error(
            seconds
              ? 'seconds must be a `number` type'
              : 'seconds was not provided'
          );
        }

        if (
          hmsHlsPlayerRef.current &&
          RCTHMSHLSPlayerViewManagerConfig.Commands.seekBackward
        ) {
          UIManager.dispatchViewManagerCommand(
            findNodeHandle(hmsHlsPlayerRef.current),
            RCTHMSHLSPlayerViewManagerConfig.Commands.seekBackward,
            [seconds]
          );
        }
      },
      seekToLivePosition: () => {
        if (
          hmsHlsPlayerRef.current &&
          RCTHMSHLSPlayerViewManagerConfig.Commands.seekToLivePosition
        ) {
          UIManager.dispatchViewManagerCommand(
            findNodeHandle(hmsHlsPlayerRef.current),
            RCTHMSHLSPlayerViewManagerConfig.Commands.seekToLivePosition,
            undefined
          );
        }
      },
      setVolume: (level: number) => {
        if (typeof level !== 'number') {
          throw new Error(
            level ? 'level must be a `number` type' : 'level was not provided'
          );
        }

        if (
          hmsHlsPlayerRef.current &&
          RCTHMSHLSPlayerViewManagerConfig.Commands.setVolume
        ) {
          UIManager.dispatchViewManagerCommand(
            findNodeHandle(hmsHlsPlayerRef.current),
            RCTHMSHLSPlayerViewManagerConfig.Commands.setVolume,
            [level]
          );
        }
      },
    }),
    []
  );

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
          ref={hmsHlsPlayerRef}
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

export const HMSHLSPlayer = React.forwardRef<
  HMSHLSPlayerRefProperties,
  HMSHLSPlayerProps
>(_HMSHLSPlayer);

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
