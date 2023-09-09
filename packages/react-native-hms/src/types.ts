// Base HMSHLSPlayer Event
type HMSHLSPlayerEvent<T extends string, U> = {
  event: T;
  data: U;
};

// #region HMSHLSPlayer Playback Events

export enum HMSHLSPlayerPlaybackEventTypes {
  ON_PLAYBACK_CUE_EVENT = 'ON_PLAYBACK_CUE_EVENT',
  ON_PLAYBACK_FAILURE_EVENT = 'ON_PLAYBACK_FAILURE_EVENT',
  ON_PLAYBACK_STATE_CHANGE_EVENT = 'ON_PLAYBACK_STATE_CHANGE_EVENT',
}

export type HMSHLSPlayerPlaybackCueEventData = {
  id?: string;
  endDate?: string;
  payloadval?: string;
  startDate: string;
};

export type HMSHLSPlayerPlaybackFailureEventData = {
  error: {
    errorCode: number;
    errorCodeName: string;
    message?: string;
  };
};

export enum HMSHLSPlayerPlaybackState {
  BUFFERING = 'buffering',
  FAILED = 'failed',
  PAUSED = 'paused',
  PLAYING = 'playing',
  STOPPED = 'stopped',
  UNKNOWN = 'unknown',
  onVideoSizeChanged = 'onVideoSizeChanged',
}

export type HMSHLSPlayerPlaybackStateChangeEventData = {
  state: HMSHLSPlayerPlaybackState,
  aspectRatio: number | undefined,
};

type HMSHLSPlayerPlaybackCueEvent = HMSHLSPlayerEvent<
  HMSHLSPlayerPlaybackEventTypes.ON_PLAYBACK_CUE_EVENT,
  HMSHLSPlayerPlaybackCueEventData
>;

type HMSHLSPlayerPlaybackFailureEvent = HMSHLSPlayerEvent<
  HMSHLSPlayerPlaybackEventTypes.ON_PLAYBACK_FAILURE_EVENT,
  HMSHLSPlayerPlaybackFailureEventData
>;

type HMSHLSPlayerPlaybackStateChangeEvent = HMSHLSPlayerEvent<
  HMSHLSPlayerPlaybackEventTypes.ON_PLAYBACK_STATE_CHANGE_EVENT,
  HMSHLSPlayerPlaybackStateChangeEventData
>;

export type HMSHLSPlayerPlaybackEvent =
  | HMSHLSPlayerPlaybackCueEvent
  | HMSHLSPlayerPlaybackFailureEvent
  | HMSHLSPlayerPlaybackStateChangeEvent;

// #endregion HMS HLSPlayer Playback Events

// #region HMS HLSPlayer Stats Events

export enum HMSHLSPlayerStatsEventTypes {
  ON_STATS_EVENT_ERROR = 'ON_STATS_EVENT_ERROR',
  ON_STATS_EVENT_UPDATE = 'ON_STATS_EVENT_UPDATE',
}

export type HMSHLSPlayerStatsErrorEventData = {
  action: string;
  code: number;
  description: string;
  isTerminal: boolean;
  message: string;
  name: string;
};

export type HMSHLSPlayerStatsUpdateEventData = {
  // bandwidth
  bandWidthEstimate: number;
  totalBytesLoaded: number;

  // bufferedDuration
  bufferedDuration: number;

  // distanceFromLive
  distanceFromLive: number;

  // frameInfo
  droppedFrameCount: number;

  // videoInfo
  averageBitrate: number;

  videoHeight: number;
  videoWidth: number;
};

type HMSHLSPlayerStatsErrorEvent = HMSHLSPlayerEvent<
  HMSHLSPlayerStatsEventTypes.ON_STATS_EVENT_ERROR,
  HMSHLSPlayerStatsErrorEventData
>;

type HMSHLSPlayerStatsUpdateEvent = HMSHLSPlayerEvent<
  HMSHLSPlayerStatsEventTypes.ON_STATS_EVENT_UPDATE,
  HMSHLSPlayerStatsUpdateEventData
>;

export type HMSHLSPlayerStatsEvent =
  | HMSHLSPlayerStatsErrorEvent
  | HMSHLSPlayerStatsUpdateEvent;

// #endregion HMS HLSPlayer Stats Events

// #region Utility types
// #endregion Utility types
