// Base HMS HLSPlayer Event
// TODO: rename HMSPlayerEvent to HMSHLSPlayerEvent
type HMSPlayerEvent<T extends string, U> = {
  event: T;
  data: U;
};

// #region HMS HLSPlayer Playback Events

export enum HMSHLSPlayerPlaybackEventTypes {
  ON_PLAYBACK_CUE_EVENT = 'ON_PLAYBACK_CUE_EVENT',
  ON_PLAYBACK_FAILURE_EVENT = 'ON_PLAYBACK_FAILURE_EVENT',
  ON_PLAYBACK_STATE_CHANGE_EVENT = 'ON_PLAYBACK_STATE_CHANGE_EVENT',
}

export type HMSPlayerPlaybackCueEventData = {
  id?: string;
  endDate?: string;
  payloadval?: string;
  startDate: string;
};

export type HMSPlayerPlaybackFailureEventData = {
  error: {
    errorCode: number;
    errorCodeName: string;
    message?: string;
  };
};

export enum HLSPlayerPlaybackState {
  BUFFERING = 'buffering',
  FAILED = 'failed',
  PAUSED = 'paused',
  PLAYING = 'playing',
  STOPPED = 'stopped',
  UNKNOWN = 'unknown',
}

export type HMSPlayerPlaybackStateChangeEventData = {
  state: HLSPlayerPlaybackState;
};

type HMSPlayerPlaybackCueEvent = HMSPlayerEvent<
  HMSHLSPlayerPlaybackEventTypes.ON_PLAYBACK_CUE_EVENT,
  HMSPlayerPlaybackCueEventData
>;

type HMSPlayerPlaybackFailureEvent = HMSPlayerEvent<
  HMSHLSPlayerPlaybackEventTypes.ON_PLAYBACK_FAILURE_EVENT,
  HMSPlayerPlaybackFailureEventData
>;

type HMSPlayerPlaybackStateChangeEvent = HMSPlayerEvent<
  HMSHLSPlayerPlaybackEventTypes.ON_PLAYBACK_STATE_CHANGE_EVENT,
  HMSPlayerPlaybackStateChangeEventData
>;

export type HMSPlayerPlaybackEvent =
  | HMSPlayerPlaybackCueEvent
  | HMSPlayerPlaybackFailureEvent
  | HMSPlayerPlaybackStateChangeEvent;

// #endregion HMS HLSPlayer Playback Events

// #region HMS HLSPlayer Stats Events

export enum HMSHLSPlayerStatsEventTypes {
  ON_STATS_EVENT_ERROR = 'ON_STATS_EVENT_ERROR',
  ON_STATS_EVENT_UPDATE = 'ON_STATS_EVENT_UPDATE',
}

export type HMSPlayerStatsErrorEventData = {
  action: string;
  code: number;
  description: string;
  isTerminal: boolean;
  message: string;
  name: string;
};

export type HMSPlayerStatsUpdateEventData = {
  // bandwidth
  bandWidthEstimate: number;
  totalBytesLoaded: number;

  // bufferedDuration
  bufferedDuration: number;

  /**
   * iOS only
   */
  watchDuration?: number;

  // distanceFromLive
  distanceFromLive: number;

  // frameInfo
  droppedFrameCount: number;

  /**
   * Android only
   */
  totalFrameCount?: number;

  // videoInfo
  averageBitrate: number;

  /**
   * Android only
   */
  frameRate?: number;
  videoHeight: number;
  videoWidth: number;
};

type HMSPlayerStatsErrorEvent = HMSPlayerEvent<
  HMSHLSPlayerStatsEventTypes.ON_STATS_EVENT_ERROR,
  HMSPlayerStatsErrorEventData
>;

type HMSPlayerStatsUpdateEvent = HMSPlayerEvent<
  HMSHLSPlayerStatsEventTypes.ON_STATS_EVENT_UPDATE,
  HMSPlayerStatsUpdateEventData
>;

export type HMSPlayerStatsEvent =
  | HMSPlayerStatsErrorEvent
  | HMSPlayerStatsUpdateEvent;

// #endregion HMS HLSPlayer Stats Events

// #region Utility types
// #endregion Utility types
