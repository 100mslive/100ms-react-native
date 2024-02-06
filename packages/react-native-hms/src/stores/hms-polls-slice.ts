import type { StateCreator } from 'zustand';
import type { HMSInteractivityStore, HMSPollsSlice } from './types';
import type { HMSPoll } from '../classes/polls/HMSPoll';

export const createHMSPollsSlice: StateCreator<
  HMSInteractivityStore,
  [],
  [],
  HMSPollsSlice
> = (set) => ({
  polls: {},
  setPolls: (poll: HMSPoll) => {
    set((state) => {
      state.polls[poll.pollId] = poll;
    });
  },
  // cue: undefined,
  // setCue: (cue: HMSHLSPlayerPlaybackCue) => set({ cue }),
});
