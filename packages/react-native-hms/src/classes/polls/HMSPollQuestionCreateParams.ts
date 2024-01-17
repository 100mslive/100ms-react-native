import type { HMSPollQuestion } from './HMSPollQuestion';
import type { HMSPollQuestionOptionCreateParams } from './HMSPollQuestionOptionCreateParams';
import type { HMSPollQuestionQuizOptionCreateParams } from './HMSPollQuestionQuizOptionCreateParams';

export interface HMSPollQuestionCreateParams
  extends Pick<HMSPollQuestion, 'text' | 'skippable' | 'type' | 'answer'> {
  index?: number;
  options?:
    | HMSPollQuestionOptionCreateParams[]
    | HMSPollQuestionQuizOptionCreateParams[];
  weight?: number;
}
