import { create } from 'zustand';

interface HLSPlayerStats {
  // bandwidth
  bandWidthEstimate: number;
  totalBytesLoaded: number;

  // bufferedDuration
  bufferedDuration: number;

  // distanceFromLive
  distanceFromLive: number;

  // frameInfo
  droppedFrameCount: number;
  totalFrameCount: number;

  // videoInfo
  averageBitrate: number;
  frameRate: number;
  videoHeight: number;
  videoWidth: number;
}

interface HLSPlayerStatsStore {
  stats: HLSPlayerStats;
  changeStats(stats: HLSPlayerStats): void;
}

const useHLSPlayerStatsStore = create<HLSPlayerStatsStore>((set) => ({
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
    totalFrameCount: 0,

    // videoInfo
    averageBitrate: 0,
    frameRate: 0,
    videoHeight: 0,
    videoWidth: 0,
  },
  changeStats: (stats: HLSPlayerStats) => set({ stats }),
}));

export const useHLSPlayerStats = () =>
  useHLSPlayerStatsStore((state) => state.stats);

export const setHLSPlayerStats: HLSPlayerStatsStore['changeStats'] = () =>
  useHLSPlayerStatsStore((state) => state.changeStats);
