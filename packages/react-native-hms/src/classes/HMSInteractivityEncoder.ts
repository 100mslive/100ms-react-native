import type { HMSPoll } from './polls/HMSPoll';

export class HMSInteractivityEncoder {
  static transformPoll(poll: HMSPoll): HMSPoll {
    poll.startedAt = poll.startedAt && new Date(poll.startedAt);
    poll.stoppedAt = poll.stoppedAt && new Date(poll.stoppedAt);
    // poll.rolesThatCanVote: HMSRole[];
    // poll.rolesThatCanViewResponses: HMSRole[];
    // --- poll.questions: HMSPollQuestion[]
    // --- poll.result: HMSPollResult
    return poll;
  }
}
