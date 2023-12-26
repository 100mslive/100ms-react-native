import type { TrackId } from '../stores/types';
import { useHMSStore } from '../stores/hms-store';

// use latest state (with component rerender)

export const useHmsViewsResolutionsState = (trackId?: TrackId) => {
  return useHMSStore((state) =>
    trackId ? state.hmsviewsResolutions[trackId] : undefined
  );
};

// state setters

export const setHmsViewsResolutionsState =
  useHMSStore.getState().setHmsviewsResolutions;
