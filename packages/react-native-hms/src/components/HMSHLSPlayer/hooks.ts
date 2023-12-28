import { useEffect } from 'react';
import type { DependencyList } from 'react';
import { shallow } from 'zustand/shallow';

import { useHMSHLSPlayerStatsStore } from '../../stores/hls-player-stats-store';
import { useHMSStore } from '../../stores/hms-store';
import type { HMSHLSPlayerStatsUpdateEventData } from '../../types';
import type {
  HMSHLSPlayerCue,
  HMSHLSPlayerPlaybackError,
  HMSHLSPlayerStatsError,
} from '../../stores/types';

// use latest state (with component rerender)

export const useHMSHLSPlayerPlaybackState = () => {
  return useHMSStore((state) => state.playbackState);
};

export const useHMSHLSPlayerResolution = () => {
  return useHMSStore((state) => state.resolution);
};

export const useHMSHLSPlayerStats = () => {
  return useHMSHLSPlayerStatsStore(
    (state) => ({
      stats: state.stats,
      error: state.error,
    }),
    shallow
  );
};

export const useHMSHLSPlayerStat = <
  T extends keyof HMSHLSPlayerStatsUpdateEventData,
>(
  stat: T
) => {
  return useHMSHLSPlayerStatsStore((state) => state.stats[stat]);
};

// // The distance of current playback position from the live edge of HLS stream
// export const useIsHLSStreamLive = (liveOffsetMillis: number = 1000) => {
//   return useHMSHLSPlayerStatsStore((state) => state.stats.distanceFromLive < liveOffsetMillis);
// }

// get latest state (without component rerender)

export const useHMSHLSPlayerStatsError = (
  callback: (error: NonNullable<HMSHLSPlayerStatsError>) => void,
  deps: DependencyList
) => {
  useEffect(() => {
    return useHMSHLSPlayerStatsStore.subscribe(
      (state) => state.error,
      (data) => {
        if (data) callback(data);
      }
    );
  }, deps);
};

export const useHMSHLSPlayerPlaybackError = (
  callback: (error: NonNullable<HMSHLSPlayerPlaybackError>) => void,
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

export const useHMSHLSPlayerCue = (
  callback: (error: NonNullable<HMSHLSPlayerCue>) => void,
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

export const setHMSHLSPlayerPlaybackState =
  useHMSStore.getState().setPlaybackState;

export const setHMSHLSPlayerResolution = useHMSStore.getState().setResolution;

export const setHMSHLSPlayerCue = useHMSStore.getState().setCue;

export const setHMSHLSPlayerPlaybackError =
  useHMSStore.getState().setPlaybackError;

export const setHMSHLSPlayerStats =
  useHMSHLSPlayerStatsStore.getState().changeStats;

export const setHMSHLSPlayerStatsError =
  useHMSHLSPlayerStatsStore.getState().setError;
