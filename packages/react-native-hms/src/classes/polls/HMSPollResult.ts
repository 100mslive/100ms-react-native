import type { HMSPollQuestionResult } from './HMSPollQuestionResult';

/**
 Represents the result of a poll.
 */
export interface HMSPollResult {
  /**
   The total number of responses received for the poll.
   */
  totalResponse: number;

  /**
   The number of unique users who responded to the poll.
   */
  userCount: number;

  /**
   The maximum number of users in the room during the poll.
   */
  maxUserCount: number;

  /**
   The list of question results for the poll.
   */
  questions: HMSPollQuestionResult[];
}

// Web Interface for this -
// export interface HMSPollResult {
//   /**
//    * The number of unique users who responded to the poll
//    */
//   totalUsers?: number;
//   /**
//    * The maximum number of users in the room during the poll.
//    */
//   maxUsers?: number;
//   totalResponses?: number;
// }
