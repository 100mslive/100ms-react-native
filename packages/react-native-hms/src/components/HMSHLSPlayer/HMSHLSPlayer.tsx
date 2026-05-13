import React, { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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
import { RCTHMSHLSPlayer, RCTHMSHLSPlayerCommands } from './RCTHMSHLSPlayer';
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
        if (hmsHlsPlayerRef.current) {
          RCTHMSHLSPlayerCommands.play(hmsHlsPlayerRef.current, url ?? '');
        }
      },
      stop: () => {
        if (hmsHlsPlayerRef.current) {
          RCTHMSHLSPlayerCommands.stop(hmsHlsPlayerRef.current);
        }
      },
      pause: () => {
        if (hmsHlsPlayerRef.current) {
          RCTHMSHLSPlayerCommands.pause(hmsHlsPlayerRef.current);
        }
      },
      resume: () => {
        if (hmsHlsPlayerRef.current) {
          RCTHMSHLSPlayerCommands.resume(hmsHlsPlayerRef.current);
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

        if (hmsHlsPlayerRef.current) {
          RCTHMSHLSPlayerCommands.seekForward(hmsHlsPlayerRef.current, seconds);
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

        if (hmsHlsPlayerRef.current) {
          RCTHMSHLSPlayerCommands.seekBackward(
            hmsHlsPlayerRef.current,
            seconds
          );
        }
      },
      seekToLivePosition: () => {
        if (hmsHlsPlayerRef.current) {
          RCTHMSHLSPlayerCommands.seekToLivePosition(hmsHlsPlayerRef.current);
        }
      },
      setVolume: (level: number) => {
        if (typeof level !== 'number') {
          throw new Error(
            level ? 'level must be a `number` type' : 'level was not provided'
          );
        }

        if (hmsHlsPlayerRef.current) {
          RCTHMSHLSPlayerCommands.setVolume(hmsHlsPlayerRef.current, level);
        }
      },
      isClosedCaptionSupported: () => {
        if (hmsHlsPlayerRef.current) {
          const requestId = currentRequestId.current++;
          const promise = new Promise<boolean>((resolve, reject) => {
            promiseAndIdsMap.set(requestId, { resolve, reject });
          });

          RCTHMSHLSPlayerCommands.areClosedCaptionSupported(
            hmsHlsPlayerRef.current,
            requestId
          );
          return promise;
        }
        return Promise.resolve(false);
      },
      isClosedCaptionEnabled: () => {
        if (hmsHlsPlayerRef.current) {
          const requestId = currentRequestId.current++;
          const promise = new Promise<boolean>((resolve, reject) => {
            promiseAndIdsMap.set(requestId, { resolve, reject });
          });

          RCTHMSHLSPlayerCommands.isClosedCaptionEnabled(
            hmsHlsPlayerRef.current,
            requestId
          );
          return promise;
        }
        return Promise.resolve(false);
      },
      enableClosedCaption: () => {
        if (hmsHlsPlayerRef.current) {
          RCTHMSHLSPlayerCommands.enableClosedCaption(hmsHlsPlayerRef.current);
        }
      },
      disableClosedCaption: () => {
        if (hmsHlsPlayerRef.current) {
          RCTHMSHLSPlayerCommands.disableClosedCaption(hmsHlsPlayerRef.current);
        }
      },
      getPlayerDurationDetails: () => {
        if (hmsHlsPlayerRef.current) {
          const requestId = currentRequestId.current++;
          const promise = new Promise<HLSPlayerDurationDetails>(
            (resolve, reject) => {
              promiseAndIdsMap.set(requestId, { resolve, reject });
            }
          );

          RCTHMSHLSPlayerCommands.getPlayerDurationDetails(
            hmsHlsPlayerRef.current,
            requestId
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
    // Remove the entry so the map doesn't grow unboundedly across the
    // lifetime of the player view.
    promiseAndIdsMap.delete(requestId);
  };

  useEffect(() => {
    return () => {
      useHMSStore.getState().resetPlaybackSlice();
      useHMSHLSPlayerStatsStore.getState().reset();
      // Reject any in-flight command promises that didn't get a response
      // before unmount. Under bridgeless mode the native side may not be
      // able to deliver `onDataReturned` events back if the React tag is
      // gone — left unrejected, those promises would hang forever.
      promiseAndIdsMap.forEach(({ reject }) => {
        reject(
          new Error('HMSHLSPlayer unmounted before command response arrived')
        );
      });
      promiseAndIdsMap.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          onHmsHlsPlaybackEvent={handleHLSPlaybackEvent as any}
          onHmsHlsStatsEvent={handleHLSStatsEvent as any}
          onHlsPlayerCuesEvent={
            Platform.OS === 'android'
              ? (handleHLSPlayerCuesEvent as any)
              : undefined
          }
          onDataReturned={handleRequestedDataReturned as any}
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
