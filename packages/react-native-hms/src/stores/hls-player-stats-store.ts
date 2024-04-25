import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  HMSHLSPlayerStats,
  HMSHLSPlayerStatsError,
  HMSHLSPlayerStatsStore,
} from './types';

const INITIAL_STATS = {
  // bandwidth
  bandWidthEstimate: 0,
  totalBytesLoaded: 0,

  // bufferedDuration
  bufferedDuration: 0,

  // distanceFromLive
  distanceFromLive: 0,

  // frameInfo
  droppedFrameCount: 0,

  // videoInfo
  averageBitrate: 0,
  videoHeight: 0,
  videoWidth: 0,
};

export const useHMSHLSPlayerStatsStore = create<HMSHLSPlayerStatsStore>()(
  subscribeWithSelector((set) => ({
    // Handle Stats
    stats: INITIAL_STATS,
    changeStats: (stats: HMSHLSPlayerStats) => set({ stats }),

    // Handle Stats Error
    error: undefined,
    setError: (error: HMSHLSPlayerStatsError) => set({ error }),

    // Handle Closed Caption
    subtitles: null,
    setSubtitles: (subtitles: string | null) => set({ subtitles }),

    // Reset State
    reset: () =>
      set({ stats: INITIAL_STATS, error: undefined, subtitles: null }),
  }))
);
