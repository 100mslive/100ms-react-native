/**
 Represents the result of a poll question within a poll result.
 */
export interface HMSPollQuestionResult {
  /**
   The ID of the question associated with the result.
   */
  question: number;

  /**
   The type of the question associated with the result.
   */
  type: string;

  /**
   The vote counts for each option of the question.
   */
  optionVoteCounts: number[];

  /**
   The number of correct votes for the question.
   */
  correctVotes: number;

  /**
   The number of skipped votes for the question.
   */
  skippedVotes: number;

  /**
   The total number of votes received for the question.
   */
  totalVotes: number;
}
