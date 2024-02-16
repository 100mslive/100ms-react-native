import type { HMSPoll } from '../classes/polls/HMSPoll';
import { useHMSInteractivityStore } from '../stores/hms-interactivity-store';

// use latest state (with component rerender)

export const usePollsState = (pollId?: HMSPoll['pollId']) => {
  return useHMSInteractivityStore((state) =>
    pollId ? state.polls[pollId] : state.polls
  );
};

// state setters

export const setPollsState = useHMSInteractivityStore.getState().setPolls;
