/**
 Represents an option for a poll question.
 */
export interface HMSPollQuestionOption {
  /**
   The index of the option within the question.
   */
  index: number;

  /**
   The text of the option.
   */
  text: string;

  /**
   The weight of the option in scoring.
   */
  weight: number; // (optional on web)

  /**
   The count of votes received for the option. `0` is the default value.
   */
  voteCount: number; // (optional on web)
}
