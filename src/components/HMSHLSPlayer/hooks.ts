import { DependencyList, useEffect } from 'react';

import { useHLSPlayerStatsStore } from '../../stores/hls-player-stats-store';
import { useHMSStore } from '../../stores/hms-store';
import type { HMSPlayerStatsUpdateEventData } from '../../types';
import type {
  HLSPlayerCue,
  HLSPlayerPlaybackError,
  HLSPlayerStatsError,
} from '../../stores/types';

// use latest state (with component rerender)

export const useHLSPlayerPlaybackState = () => {
  return useHMSStore((state) => state.playbackState);
};

export const useHLSPlayerStats = () => {
  return useHLSPlayerStatsStore((state) => state.stats);
};

export const useHLSPlayerStat = <T extends keyof HMSPlayerStatsUpdateEventData>(
  stat: T
) => {
  return useHLSPlayerStatsStore((state) => state.stats[stat]);
};

// // The distance of current playback position from the live edge of HLS stream
// export const useIsHLSStreamLive = (liveOffsetMillis: number = 1000) => {
//   return useHLSPlayerStatsStore((state) => state.stats.distanceFromLive < liveOffsetMillis);
// }

// get latest state (without component rerender)

export const useHLSPlayerStatsError = (
  callback: (error: NonNullable<HLSPlayerStatsError>) => void,
  deps: DependencyList
) => {
  useEffect(() => {
    return useHLSPlayerStatsStore.subscribe(
      (state) => state.error,
      (data) => {
        if (data) callback(data);
      }
    );
  }, deps);
};

export const useHLSPlayerPlaybackError = (
  callback: (error: NonNullable<HLSPlayerPlaybackError>) => void,
  deps: DependencyList
) => {
  useEffect(() => {
    return useHMSStore.subscribe(
      (state) => state.error,
      (data) => {
        if (data) callback(data);
      }
    );
  }, deps);
};

export const useHLSPlayerCue = (
  callback: (error: NonNullable<HLSPlayerCue>) => void,
  deps: DependencyList
) => {
  useEffect(() => {
    return useHMSStore.subscribe(
      (state) => state.cue,
      (data) => {
        if (data) callback(data);
      }
    );
  }, deps);
};

// state setters

export const setHLSPlayerPlaybackState =
  useHMSStore.getState().setPlaybackState;

export const setHLSPlayerCue = useHMSStore.getState().setCue;

export const setHLSPlayerPlaybackError =
  useHMSStore.getState().setPlaybackError;

export const setHLSPlayerStats = useHLSPlayerStatsStore.getState().changeStats;

export const setHLSPlayerStatsError =
  useHLSPlayerStatsStore.getState().setError;
