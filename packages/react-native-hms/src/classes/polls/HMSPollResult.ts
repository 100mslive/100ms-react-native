import type { HMSPollQuestionResult } from './HMSPollQuestionResult';

/**
 Represents the result of a poll.
 */
export interface HMSPollResult {
  /**
   The total number of responses received for the poll.
   */
  totalResponse: number; // totalResponses?: number; (on web)

  /**
   The number of unique users who responded to the poll.
   */
  userCount: number; // totalUsers?: number; (on web)

  /**
   The maximum number of users in the room during the poll.
   */
  maxUserCount: number; // maxUsers?: number; (on web)

  /**
   The list of question results for the poll.
   */
  questions: HMSPollQuestionResult[];
}
