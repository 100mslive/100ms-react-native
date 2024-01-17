import type { HMSPollQuestionOption } from './HMSPollQuestionOption';

export interface HMSPollQuestionOptionCreateParams
  extends Pick<
    HMSPollQuestionOption,
    'text'
    // | 'weight' // `weight` field is not required as of now
  > {}
