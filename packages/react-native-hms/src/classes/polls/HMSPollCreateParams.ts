import type { HMSRole } from '../HMSRole';
import type { HMSPoll } from './HMSPoll';
import type { HMSPollQuestionCreateParams } from './HMSPollQuestionCreateParams';

export interface HMSPollCreateParams
  extends Pick<
    HMSPoll,
    | 'title'
    | 'type'
    | 'duration'
    | 'anonymous'
    // | 'visibility'
    // | 'locked'
    | 'mode'
  > {
  pollId?: HMSPoll['pollId'];
  questions?: HMSPollQuestionCreateParams[];
  rolesThatCanVote?: HMSRole[];
  rolesThatCanViewResponses?: HMSRole[];
}
