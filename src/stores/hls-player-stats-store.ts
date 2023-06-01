import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  HLSPlayerStats,
  HLSPlayerStatsError,
  HLSPlayerStatsStore,
} from './types';

export const useHLSPlayerStatsStore = create<HLSPlayerStatsStore>()(
  subscribeWithSelector((set) => ({
    // Handle Stats
    stats: {
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
    },
    changeStats: (stats: HLSPlayerStats) => set({ stats }),

    // Handle Stats Error
    error: undefined,
    setError: (error: HLSPlayerStatsError) => set({ error }),
  }))
);
