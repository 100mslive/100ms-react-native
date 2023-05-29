import React, { useMemo, useReducer } from 'react';
import {
  requireNativeComponent,
  StyleProp,
  View,
  NativeSyntheticEvent,
  ViewStyle,
} from 'react-native';
import { EventEmitter } from '../utils';
import { setHLSPlayerStats } from '..';

type HMSPlayerEvent<T extends string, U> = {
  event: T;
  data: U;
};

// #region Playback events
type HMSPlayerPlaybackCueEventData = {
  id?: string;
  endDate?: string;
  payloadval?: string;
  startDate: string;
};

type HMSPlayerPlaybackFailureEventData = {
  error: {
    errorCode: number;
    errorCodeName: string;
    message?: string;
  };
};

type HMSPlayerPlaybackStateChangeEventData = {
  state: number;
};

type HMSPlayerPlaybackCueEvent = HMSPlayerEvent<
  'ON_PLAYBACK_CUE_EVENT',
  HMSPlayerPlaybackCueEventData
>;

type HMSPlayerPlaybackFailureEvent = HMSPlayerEvent<
  'ON_PLAYBACK_FAILURE_EVENT',
  HMSPlayerPlaybackFailureEventData
>;

type HMSPlayerPlaybackStateChangeEvent = HMSPlayerEvent<
  'ON_PLAYBACK_STATE_CHANGE_EVENT',
  HMSPlayerPlaybackStateChangeEventData
>;

type HMSPlayerPlaybackEvent =
  | HMSPlayerPlaybackCueEvent
  | HMSPlayerPlaybackFailureEvent
  | HMSPlayerPlaybackStateChangeEvent;
// #endregion Playback events

//#region Stats events
type HMSPlayerStatsErrorEventData = {
  action: string;
  code: number;
  description: string;
  isTerminal: boolean;
  message: string;
  name: string;
};

type HMSPlayerStatsUpdateEventData = {
  // bandwidth
  bandWidthEstimate: number;
  totalBytesLoaded: number;

  // bufferedDuration
  bufferedDuration: number;

  // distanceFromLive
  distanceFromLive: number;

  // frameInfo
  droppedFrameCount: number;
  totalFrameCount: number;

  // videoInfo
  averageBitrate: number;
  frameRate: number;
  videoHeight: number;
  videoWidth: number;
};

type HMSPlayerStatsErrorEvent = HMSPlayerEvent<
  'ON_STATS_EVENT_ERROR',
  HMSPlayerStatsErrorEventData
>;

type HMSPlayerStatsUpdateEvent = HMSPlayerEvent<
  'ON_STATS_EVENT_UPDATE',
  HMSPlayerStatsUpdateEventData
>;

type HMSPlayerStatsEvent = HMSPlayerStatsErrorEvent | HMSPlayerStatsUpdateEvent;
//#endregion Stats events

type HmsHlsPlaybackEventHandler = (
  event: NativeSyntheticEvent<HMSPlayerPlaybackEvent>
) => void;
type HmsHlsStatsEventHandler = (
  event: NativeSyntheticEvent<HMSPlayerStatsEvent>
) => void;

export type HmsHlsPlaybackStateChangeHandler = (
  data: HMSPlayerPlaybackStateChangeEventData
) => void;
export type HmsHlsPlaybackCueHandler = (
  data: HMSPlayerPlaybackCueEventData
) => void;
export type HmsHlsPlaybackFailureHandler = (
  data: HMSPlayerPlaybackFailureEventData
) => void;
export type HmsHlsStatsUpdateHandler = (
  data: HMSPlayerStatsUpdateEventData
) => void;
export type HmsHlsStatsErrorHandler = (
  data: HMSPlayerStatsErrorEventData
) => void;

type RCTHMSPlayerProps = {
  url?: string;
  style?: StyleProp<ViewStyle>;
  onHmsHlsPlaybackEvent?: HmsHlsPlaybackEventHandler;
  onHmsHlsStatsEvent?: HmsHlsStatsEventHandler;
};

const RCTHMSPlayer = requireNativeComponent<RCTHMSPlayerProps>('HMSPlayer');

export interface HMSPlayerProps {
  url?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  onPlaybackStateChange?: HmsHlsPlaybackStateChangeHandler;
  onPlaybackCue?: HmsHlsPlaybackCueHandler;
  onPlaybackFailure?: HmsHlsPlaybackFailureHandler; // OR onError?
  onPlaybackStats?: HmsHlsStatsUpdateHandler; // OR onStats?
  onPlaybackStatsError?: HmsHlsStatsErrorHandler; // OR onStatsError?
}

type DEFAULT_VALUE = {
  playbackState: HMSPlayerPlaybackStateChangeEventData['state'] | null;
  stats: HMSPlayerStatsUpdateEventData | null;
};

const defaultValue: DEFAULT_VALUE = {
  playbackState: null,
  stats: null,
};

const HMSPlayerContext = React.createContext(defaultValue);

const useHMSPlayerContext = () => {
  const context = React.useContext(HMSPlayerContext);
  if (!context) {
    throw new Error(
      `useHMSPlayerContext hook cannot be used outside the HMSPlayer component`
    );
  }
  return context;
};

// export const useHLSPlayerStats = () => useHMSPlayerContext().stats;

export const useHLSPlayerPlaybackState = () =>
  useHMSPlayerContext().playbackState;

const reducer = (state: DEFAULT_VALUE, action: any) => {
  switch (action.type) {
    case 'UPDATE_STATS': {
      return {
        ...state,
        stats: action.stats,
      };
    }
    case 'UPDATE_PLAYBACK_STATE': {
      return {
        ...state,
        playbackState: action.state,
      };
    }
  }

  return state;
};

export const HMSPlayer: React.FC<HMSPlayerProps> = ({
  style,
  url = '',
  children,
  onPlaybackStateChange,
  onPlaybackCue,
  onPlaybackFailure,
  onPlaybackStats,
  onPlaybackStatsError,
}) => {
  const [value, dispatch] = useReducer(reducer, defaultValue); // This will be readonly for children components

  const eventEmitter = useMemo(() => new EventEmitter(), []);

  const handleHLSPlaybackEvent: HmsHlsPlaybackEventHandler = ({
    nativeEvent,
  }) => {
    const { event, data } = nativeEvent;

    console.log('HMSPlayer onHmsHlsPlaybackEvent -> ', nativeEvent);
    if (event === 'ON_PLAYBACK_CUE_EVENT') {
      onPlaybackCue?.(data);
      eventEmitter.emit('ON_PLAYBACK_CUE_EVENT', data);
    } else if (event === 'ON_PLAYBACK_FAILURE_EVENT') {
      onPlaybackFailure?.(data);
    } else {
      onPlaybackStateChange?.(data);
      dispatch({ type: 'UPDATE_PLAYBACK_STATE', state: data.state });
    }
    // childRef.current?.handlePlaybackCue?.(data);
  };

  const handleHLSStatsEvent: HmsHlsStatsEventHandler = ({ nativeEvent }) => {
    const { event, data } = nativeEvent;

    console.log('HMSPlayer onHmsHlsStatsEvent -> ', nativeEvent);
    if (event === 'ON_STATS_EVENT_ERROR') {
      onPlaybackStatsError?.(data);
    } else {
      onPlaybackStats?.(data);
      setHLSPlayerStats(data);
    }
  };

  return (
    <View style={[{ overflow: 'hidden', position: 'relative' }, style]}>
      <RCTHMSPlayer
        url={url}
        style={{ flex: 1 }}
        onHmsHlsPlaybackEvent={handleHLSPlaybackEvent}
        onHmsHlsStatsEvent={handleHLSStatsEvent}
      />

      {children ? (
        <HMSPlayerContext.Provider value={value}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement<{ addListener: any }>(child)) {
              return React.cloneElement(child, {
                addListener: eventEmitter.addListener.bind(eventEmitter),
              });
            }
            return child;
          })}
        </HMSPlayerContext.Provider>
      ) : null}
    </View>
  );
};

/**
 *
 *

{
  "data": {
    "endDate": "1684778448614",
    "payloadval": "{\"type\":\"EMOJI_REACTION\",\"emojiId\":\"tada\",\"senderId\":\"37b6ded2-08bd-4632-8209-39b423b732e9\"}",
    "startDate": "1684778446614"
  },
  "event": "hmsHlsPlaybackEvent"
}

{
  "type": "EMOJI_REACTION",
  "emojiId": "tada",
  "senderId": "37b6ded2-08bd-4632-8209-39b423b732e9"
}

 */

/**
 * 1. Wrap native ui component in View
 * 2. pass styles passed via props to this wrapper view
 * 3. apply `Stylesheet.absoluteFill` to native ui component
 */
