import type { StateCreator } from 'zustand';

import type { HMSViewsSlice, HMSStore } from './types';

export const createHMSViewsSlice: StateCreator<
  HMSStore,
  [],
  [],
  HMSViewsSlice
> = (set) => ({
  hmsviewsResolutions: {},
  setHmsviewsResolutions: (trackId, resolution) => {
    set((state) => ({
      hmsviewsResolutions: {
        ...state.hmsviewsResolutions,
        [trackId]: resolution,
      },
    }));
  },
});
