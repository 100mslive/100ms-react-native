import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  HMSHLSPlayerStats,
  HMSHLSPlayerStatsError,
  HMSHLSPlayerStatsStore,
} from './types';

export const useHMSHLSPlayerStatsStore = create<HMSHLSPlayerStatsStore>()(
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
    changeStats: (stats: HMSHLSPlayerStats) => set({ stats }),

    // Handle Stats Error
    error: undefined,
    setError: (error: HMSHLSPlayerStatsError) => set({ error }),

    // Handle Closed Caption
    subtitles: null,
    setSubtitles: (subtitles: string | null) => set({ subtitles }),
  }))
);
