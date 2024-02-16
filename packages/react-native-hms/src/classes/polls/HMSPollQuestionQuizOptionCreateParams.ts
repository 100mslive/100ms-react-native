import type { HMSPollQuestionOptionCreateParams } from './HMSPollQuestionOptionCreateParams';

export interface HMSPollQuestionQuizOptionCreateParams
  extends HMSPollQuestionOptionCreateParams {
  isCorrectAnswer: boolean;
}
