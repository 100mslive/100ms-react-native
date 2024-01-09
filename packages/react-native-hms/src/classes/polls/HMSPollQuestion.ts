import type { HMSPollQuestionAnswer } from './HMSPollQuestionAnswer';
import type { HMSPollQuestionOption } from './HMSPollQuestionOption';
import type { HMSPollQuestionResponse } from './HMSPollQuestionResponse';
import type { HMSPollQuestionType } from './HMSPollQuestionType';

/**
 Represents a question in a poll.
 */
export interface HMSPollQuestion {
  /**
   The index of the question within the poll.
   */
  index: number;

  /**
   The text of the question.
   */
  text: string;

  /**
   A flag indicating whether the question is skippable or not.
   */
  skippable: boolean;

  /**
   The duration hint of the question in seconds. Can be used for setting a timeframe withing which a question can be responded to. Not enforced by the server.
   */
  duration: number;

  /**
   A flag indicating whether the question can be answered only once.
   */
  once: boolean;

  /**
   The weight of the question in scoring.
   */
  weight: number;

  /**
   The minimum length of the answer (if applicable).
   */
  answerMinLen?: number;

  /**
   The maximum length of the answer (if applicable).
   */
  answerMaxLen?: number;

  /**
   The type of the question.
   */
  type: HMSPollQuestionType;

  /**
   The list of options for the question (if applicable).
   */
  options?: HMSPollQuestionOption[];

  /**
   The answer for the question (if it is a quiz).
   */
  answer?: HMSPollQuestionAnswer;

  /**
   The list of responses for the question.
   */
  responses?: HMSPollQuestionResponse[];

  /**
   The responses provided by the current user for the question.
   */
  myResponses: HMSPollQuestionResponse[];
}
