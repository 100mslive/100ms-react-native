/**
 * Represents the result of a poll question response.
 */
export interface HMSPollQuestionResponse {
  /**
   * The ID of the question associated with the response result.
   */
  question: number;

  /**
   * A flag indicating whether the response was correct or not in case of quiz.
   */
  correct?: boolean;

  /**
   * An error associated with the response result (if any).
   */
  error?: string;
}
