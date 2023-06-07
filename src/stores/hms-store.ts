import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { createHLSPlayerPlaybackSlice } from './hls-player-playback-slice';
import type { HMSStore } from './types';

export const useHMSStore = create<HMSStore>()(
  subscribeWithSelector((...a) => ({
    ...createHLSPlayerPlaybackSlice(...a),
  }))
);