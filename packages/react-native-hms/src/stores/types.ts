// Stores

import type {
  HMSHLSPlayerPlaybackState,
  HMSHLSPlayerPlaybackCueEventData,
  HMSHLSPlayerPlaybackFailureEventData,
  HMSHLSPlayerPlaybackResolutionChangeEventData,
  HMSHLSPlayerStatsErrorEventData,
  HMSHLSPlayerStatsUpdateEventData,
} from '../types';

export type HMSStore = HMSHLSPlayerPlaybackSlice;
export type HMSHLSPlayerStatsStore = HMSHLSPlayerStatsSlice;

// HLS Player Playback Slice

export interface HMSHLSPlayerPlaybackCue
  extends Omit<HMSHLSPlayerPlaybackCueEventData, 'endDate' | 'startDate'> {
  endDate?: Date;
  startDate: Date;
}

export type HMSHLSPlayerCue = HMSHLSPlayerPlaybackCue | undefined;

export type HMSHLSPlayerPlaybackError =
  | HMSHLSPlayerPlaybackFailureEventData['error']
  | undefined;

export type HMSHLSPlayerResolution = HMSHLSPlayerPlaybackResolutionChangeEventData | undefined;

export interface HMSHLSPlayerPlaybackSlice {
  cue: HMSHLSPlayerCue;
  playbackState: HMSHLSPlayerPlaybackState;
  resolution: HMSHLSPlayerResolution;
  error: HMSHLSPlayerPlaybackError;
  setCue(cue: HMSHLSPlayerPlaybackCue): void;
  setPlaybackState(playbackState: HMSHLSPlayerPlaybackState): void;
  setResolution(resolution: HMSHLSPlayerResolution): void;
  setPlaybackError(error: HMSHLSPlayerPlaybackError): void;
}

// HLS Player Stats Slice

export type HMSHLSPlayerStats = HMSHLSPlayerStatsUpdateEventData;
export type HMSHLSPlayerStatsError =
  | HMSHLSPlayerStatsErrorEventData
  | undefined;

export interface HMSHLSPlayerStatsSlice {
  stats: HMSHLSPlayerStats;
  error: HMSHLSPlayerStatsError | undefined;
  changeStats(stats: HMSHLSPlayerStats): void;
  setError(error: HMSHLSPlayerStatsError): void;
}
