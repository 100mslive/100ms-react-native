import type { HMSPoll } from './polls/HMSPoll';

export class HMSInteractivityEncoder {
  static transformPoll(poll: HMSPoll): HMSPoll {
    if (poll.startedAt) {
      const dateNum = parseInt(poll.startedAt as unknown as string);

      if (isNaN(dateNum)) {
        poll.startedAt = undefined;
      } else {
        poll.startedAt = new Date(dateNum);
      }
    }
    if (poll.stoppedAt) {
      const dateNum = parseInt(poll.stoppedAt as unknown as string);

      if (isNaN(dateNum)) {
        poll.stoppedAt = undefined;
      } else {
        poll.stoppedAt = new Date(dateNum);
      }
    }
    // poll.rolesThatCanVote: HMSRole[];
    // poll.rolesThatCanViewResponses: HMSRole[];
    // --- poll.questions: HMSPollQuestion[]
    // --- poll.result: HMSPollResult
    return poll;
  }
}
