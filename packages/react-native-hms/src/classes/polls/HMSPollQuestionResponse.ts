import type { HMSPollQuestionType } from './HMSPollQuestionType';
import type { HMSPollResponsePeerInfo } from './HMSPollResponsePeerInfo';

/**
 Represents a response for a poll question.
 */
export interface HMSPollQuestionResponse {
  /**
   The ID of the question associated with the response.
   */
  questionID: number;

  /**
   The type of the question associated with the response.
   */
  type: HMSPollQuestionType;

  /**
   A flag indicating whether the question was skipped or not.
   */
  skipped: boolean;

  /**
   The index of the selected option (in case of single choice question).
   */
  option: number;

  /**
   The list of indexes of selected options (in case of multiple choice question).
   */
  options?: number[];

  /**
   The text answer provided (in case of short/long answer question).
   */
  text: string;

  /**
   A flag indicating whether the response was updated from previous response.
   */
  update: boolean;

  /**
   Time taken to respond.
   */
  duration: number;

  /**
   The peer information associated with the response. Depends on the tracking type selected for poll.
   */
  peer?: HMSPollResponsePeerInfo;

  /**
   A flag indicating whether the response is final in case multiple responses were sent for this question.
   */
  responseFinal?: boolean;
}
