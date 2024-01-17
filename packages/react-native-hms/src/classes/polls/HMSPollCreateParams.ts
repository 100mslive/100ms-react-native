import type { HMSPoll } from './HMSPoll';
import type { HMSPollQuestionCreateParams } from './HMSPollQuestionCreateParams';

export interface HMSPollCreateParams
  extends Pick<
    HMSPoll,
    | 'title'
    | 'type'
    | 'duration'
    | 'anonymous'
    | 'visibility'
    | 'locked'
    | 'mode'
    | 'rolesThatCanVote'
    | 'rolesThatCanViewResponses'
  > {
  pollId?: HMSPoll['pollId'];
  questions?: HMSPollQuestionCreateParams[];
}
