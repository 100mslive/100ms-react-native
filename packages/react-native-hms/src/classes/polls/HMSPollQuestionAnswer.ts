/**
 Provides the correct answer for a quiz question to check users' responses against.
 */
export interface HMSPollQuestionAnswer {
  /**
   A flag indicating whether the answer should be hidden or not.
   */
  hidden: boolean;

  /**
   The index of the selected option (in case of single choice question).
   */
  option?: number;

  /**
   The list of indexes of selected options (in case of multiple choice question).
   */
  options?: number[];
}
