import type { HMSPollQuestion } from './HMSPollQuestion';
import type { HMSPollQuestionOptionCreateParams } from './HMSPollQuestionOptionCreateParams';
import type { HMSPollQuestionQuizOptionCreateParams } from './HMSPollQuestionQuizOptionCreateParams';

export interface HMSPollQuestionCreateParams
  extends Pick<
    HMSPollQuestion,
    'text' | 'skippable' | 'type' | 'answerMinLen' | 'answerMaxLen'
  > {
  /**
   * A flag indicating whether the question can be answered only once.
   */
  once?: HMSPollQuestion['once'];

  /**
   * The duration hint of the question in seconds. Can be used for setting a timeframe withing which a question can be responded to. Not enforced by the server.
   */
  duration?: HMSPollQuestion['duration'];

  /**
   * The index of the question within the poll.
   */
  index?: HMSPollQuestion['index'];

  /**
   * The options of the question.
   */
  options?:
    | HMSPollQuestionOptionCreateParams[]
    | HMSPollQuestionQuizOptionCreateParams[];

  /**
   * The weight of the question in scoring.
   */
  weight?: number;
}
