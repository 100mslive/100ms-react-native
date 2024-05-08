// Stores

import type { HMSPoll } from '../classes/polls/HMSPoll';
import type {
  HMSHLSPlayerPlaybackState,
  HMSHLSPlayerPlaybackCueEventData,
  HMSHLSPlayerPlaybackFailureEventData,
  HMSHLSPlayerPlaybackResolutionChangeEventData,
  HMSHLSPlayerStatsErrorEventData,
  HMSHLSPlayerStatsUpdateEventData,
} from '../types';

export type HMSStore = HMSHLSPlayerPlaybackSlice & HMSViewsSlice;
export type HMSHLSPlayerStatsStore = HMSHLSPlayerStatsSlice &
  HLSPlayerClosedCaptionsSlice;
export type HMSInteractivityStore = HMSPollsSlice;

//#region HMSViews Slice

export type TrackId = string;

export type Resolution = {
  width: number;
  height: number;
};

export interface HMSViewsSlice {
  hmsviewsResolutions: Record<TrackId, Resolution | undefined>;
  setHmsviewsResolutions(trackId: TrackId, resolution: Resolution): void;
}

//#endregion HMSViews Slice

//#region HLS Player Playback Slice

export interface HMSHLSPlayerPlaybackCue
  extends Omit<HMSHLSPlayerPlaybackCueEventData, 'endDate' | 'startDate'> {
  endDate?: Date;
  startDate: Date;
}

export type HMSHLSPlayerCue = HMSHLSPlayerPlaybackCue | undefined;

export type HMSHLSPlayerPlaybackError =
  | HMSHLSPlayerPlaybackFailureEventData['error']
  | undefined;

export type HMSHLSPlayerResolution =
  | HMSHLSPlayerPlaybackResolutionChangeEventData
  | undefined;

export interface HMSHLSPlayerPlaybackSlice {
  cue: HMSHLSPlayerCue;
  playbackState: HMSHLSPlayerPlaybackState;
  resolution: HMSHLSPlayerResolution;
  error: HMSHLSPlayerPlaybackError;
  setCue(cue: HMSHLSPlayerPlaybackCue): void;
  setPlaybackState(playbackState: HMSHLSPlayerPlaybackState): void;
  setResolution(resolution: HMSHLSPlayerResolution): void;
  setPlaybackError(error: HMSHLSPlayerPlaybackError): void;
  resetPlaybackSlice(): void;
}

//#endregion HLS Player Playback Slice

//#region HLS Player Stats Slice

export type HMSHLSPlayerStats = HMSHLSPlayerStatsUpdateEventData;
export type HMSHLSPlayerStatsError =
  | HMSHLSPlayerStatsErrorEventData
  | undefined;

export interface HMSHLSPlayerStatsSlice {
  stats: HMSHLSPlayerStats;
  error: HMSHLSPlayerStatsError | undefined;
  changeStats(stats: HMSHLSPlayerStats): void;
  setError(error: HMSHLSPlayerStatsError): void;
  reset(): void;
}

export interface HLSPlayerClosedCaptionsSlice {
  subtitles: string | null;
  setSubtitles(subtitles: string | null): void;
}

//#endregion HLS Player Stats Slice

//#region Polls Slice

export type HMSPollsSlice = {
  polls: Record<string, HMSPoll>;
  setPolls(poll: HMSPoll): void;
};

//#endregion Polls Slice
