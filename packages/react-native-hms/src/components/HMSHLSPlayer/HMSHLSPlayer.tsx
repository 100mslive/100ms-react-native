import React, { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  UIManager,
  findNodeHandle,
  Platform,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import {
  setHMSHLSPlayerCue,
  setHMSHLSPlayerPlaybackError,
  setHMSHLSPlayerPlaybackState,
  setHMSHLSPlayerResolution,
  setHMSHLSPlayerStats,
  setHMSHLSPlayerStatsError,
  setHMSHLSPlayerSubtitles,
} from './hooks';
import {
  RCTHMSHLSPlayer,
  RCTHMSHLSPlayerViewManagerConfig,
} from './RCTHMSHLSPlayer';
import type {
  HlsSPlayerCuesEventHandler,
  HmsHlsPlaybackEventHandler,
  HmsHlsStatsEventHandler,
  RCTHMSHLSPlayerRef,
  RequestedDataEventHandler,
} from './RCTHMSHLSPlayer';
import {
  HMSHLSPlayerPlaybackEventTypes,
  HMSHLSPlayerStatsEventTypes,
} from '../../types';
import type {
  HLSPlayerDurationDetails,
  HMSHLSPlayerPlaybackCueEventData,
} from '../../types';
import { HMSEncoder } from '../../classes/HMSEncoder';
import type { HMSHLSPlayerPlaybackCue } from '../../stores/types';
import { useHMSStore } from '../../stores/hms-store';
import { useHMSHLSPlayerStatsStore } from '../../stores/hls-player-stats-store';

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
  isClosedCaptionSupported: () => Promise<boolean>;
  isClosedCaptionEnabled: () => Promise<boolean>;
  enableClosedCaption: () => void;
  disableClosedCaption: () => void;
  getPlayerDurationDetails: () => Promise<HLSPlayerDurationDetails>;
}

const _HMSHLSPlayer: React.ForwardRefRenderFunction<
  HMSHLSPlayerRefProperties,
  HMSHLSPlayerProps
> = (
  { url = '', style, containerStyle, enableStats, enableControls = false },
  ref
) => {
  const hmsHlsPlayerRef = useRef<RCTHMSHLSPlayerRef | null>(null);
  const promiseAndIdsMap = useMemo(
    () =>
      new Map<
        number,
        { resolve(value: unknown): void; reject(reason?: any): void }
      >(),
    []
  );
  const currentRequestId = useRef(1);

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
      isClosedCaptionSupported: () => {
        if (
          hmsHlsPlayerRef.current &&
          RCTHMSHLSPlayerViewManagerConfig.Commands.areClosedCaptionSupported
        ) {
          const requestId = currentRequestId.current++;
          const promise = new Promise<boolean>((resolve, reject) => {
            promiseAndIdsMap.set(requestId, { resolve, reject });
          });

          UIManager.dispatchViewManagerCommand(
            findNodeHandle(hmsHlsPlayerRef.current),
            RCTHMSHLSPlayerViewManagerConfig.Commands.areClosedCaptionSupported,
            [requestId]
          );
          return promise;
        }
        return Promise.resolve(false);
      },
      isClosedCaptionEnabled: () => {
        if (
          hmsHlsPlayerRef.current &&
          RCTHMSHLSPlayerViewManagerConfig.Commands.isClosedCaptionEnabled
        ) {
          const requestId = currentRequestId.current++;
          const promise = new Promise<boolean>((resolve, reject) => {
            promiseAndIdsMap.set(requestId, { resolve, reject });
          });

          UIManager.dispatchViewManagerCommand(
            findNodeHandle(hmsHlsPlayerRef.current),
            RCTHMSHLSPlayerViewManagerConfig.Commands.isClosedCaptionEnabled,
            [requestId]
          );
          return promise;
        }
        return Promise.resolve(false);
      },
      enableClosedCaption: () => {
        if (
          hmsHlsPlayerRef.current &&
          RCTHMSHLSPlayerViewManagerConfig.Commands.enableClosedCaption
        ) {
          UIManager.dispatchViewManagerCommand(
            findNodeHandle(hmsHlsPlayerRef.current),
            RCTHMSHLSPlayerViewManagerConfig.Commands.enableClosedCaption,
            undefined
          );
        }
      },
      disableClosedCaption: () => {
        if (
          hmsHlsPlayerRef.current &&
          RCTHMSHLSPlayerViewManagerConfig.Commands.disableClosedCaption
        ) {
          UIManager.dispatchViewManagerCommand(
            findNodeHandle(hmsHlsPlayerRef.current),
            RCTHMSHLSPlayerViewManagerConfig.Commands.disableClosedCaption,
            undefined
          );
        }
      },
      getPlayerDurationDetails: () => {
        if (
          hmsHlsPlayerRef.current &&
          RCTHMSHLSPlayerViewManagerConfig.Commands.getPlayerDurationDetails
        ) {
          const requestId = currentRequestId.current++;
          const promise = new Promise<HLSPlayerDurationDetails>(
            (resolve, reject) => {
              promiseAndIdsMap.set(requestId, { resolve, reject });
            }
          );

          UIManager.dispatchViewManagerCommand(
            findNodeHandle(hmsHlsPlayerRef.current),
            RCTHMSHLSPlayerViewManagerConfig.Commands.getPlayerDurationDetails,
            [requestId]
          );
          return promise;
        }
        return Promise.resolve({
          streamDuration: undefined,
          rollingWindowTime: undefined,
        });
      },
    }),
    [currentRequestId, promiseAndIdsMap]
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
    } else if (
      event ===
      HMSHLSPlayerPlaybackEventTypes.ON_PLAYBACK_RESOLUTION_CHANGE_EVENT
    ) {
      setHMSHLSPlayerResolution({ ...data });
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

  // Handle HLS Player Cues events (e.g. usage - Closed Captions)
  const handleHLSPlayerCuesEvent: HlsSPlayerCuesEventHandler = ({
    nativeEvent,
  }) => {
    const { event, data } = nativeEvent;

    if (event === 'ON_CLOSED_CAPTION_UPDATE') {
      setHMSHLSPlayerSubtitles(data);
    }
  };

  // Handle Requested data
  const handleRequestedDataReturned: RequestedDataEventHandler = ({
    nativeEvent,
  }) => {
    const { requestId, data } = nativeEvent;
    const promiseMethods = promiseAndIdsMap.get(requestId);

    if (!promiseMethods) {
      console.warn(
        '#function handleRequestedDataReturned',
        "Didn't found promise methods by requestId: ",
        requestId
      );
      return;
    }
    promiseMethods.resolve(data);
  };

  useEffect(() => {
    return () => {
      useHMSStore.getState().resetPlaybackSlice();
      useHMSHLSPlayerStatsStore.getState().reset();
    };
  }, []);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.playerWrapper, style]}>
        <RCTHMSHLSPlayer
          ref={hmsHlsPlayerRef}
          url={url}
          style={styles.player}
          enableStats={enableStats}
          enableControls={enableControls}
          onHmsHlsPlaybackEvent={handleHLSPlaybackEvent}
          onHmsHlsStatsEvent={handleHLSStatsEvent}
          onHlsPlayerCuesEvent={
            Platform.OS === 'android' ? handleHLSPlayerCuesEvent : undefined
          }
          onDataReturned={handleRequestedDataReturned}
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
    height: '100%',
    flex: 1,
  },
});
