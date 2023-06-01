// Stores

import type {
  HLSPlayerPlaybackState,
  HMSPlayerPlaybackCueEventData,
  HMSPlayerPlaybackFailureEventData,
  HMSPlayerStatsErrorEventData,
  HMSPlayerStatsUpdateEventData,
} from '../types';

export type HMSStore = HLSPlayerPlaybackSlice;
export type HLSPlayerStatsStore = HLSPlayerStatsSlice;

// HLS Player Playback Slice

export interface HLSPlayerPlaybackCue
  extends Omit<HMSPlayerPlaybackCueEventData, 'endDate' | 'startDate'> {
  endDate?: Date;
  startDate: Date;
}

export type HLSPlayerCue = HLSPlayerPlaybackCue | undefined;

export type HLSPlayerPlaybackError =
  | HMSPlayerPlaybackFailureEventData['error']
  | undefined;

export interface HLSPlayerPlaybackSlice {
  cue: HLSPlayerCue;
  playbackState: HLSPlayerPlaybackState;
  error: HLSPlayerPlaybackError;
  setCue(cue: HLSPlayerPlaybackCue): void;
  setPlaybackState(playbackState: HLSPlayerPlaybackState): void;
  setPlaybackError(error: HLSPlayerPlaybackError): void;
}

// HLS Player Stats Slice

export type HLSPlayerStats = HMSPlayerStatsUpdateEventData;
export type HLSPlayerStatsError = HMSPlayerStatsErrorEventData | undefined;

export interface HLSPlayerStatsSlice {
  stats: HLSPlayerStats;
  error: HLSPlayerStatsError | undefined;
  changeStats(stats: HLSPlayerStats): void;
  setError(error: HLSPlayerStatsError): void;
}
