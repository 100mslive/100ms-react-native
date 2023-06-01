import type { StateCreator } from 'zustand';
import { HLSPlayerPlaybackState } from '../types';
import type {
  HLSPlayerPlaybackCue,
  HLSPlayerPlaybackError,
  HLSPlayerPlaybackSlice,
  HMSStore,
} from './types';

export const createHLSPlayerPlaybackSlice: StateCreator<
  HMSStore,
  [],
  [],
  HLSPlayerPlaybackSlice
> = (set) => ({
  cue: undefined,
  setCue: (cue: HLSPlayerPlaybackCue) => set({ cue }),

  playbackState: HLSPlayerPlaybackState.UNKNOWN,
  setPlaybackState: (playbackState: HLSPlayerPlaybackState) =>
    set({ playbackState }),

  error: undefined,
  setPlaybackError: (error: HLSPlayerPlaybackError) => set({ error }),
});
