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

// Web Inteface -
// export interface HMSPollQuestionAnswer {
//   hidden: boolean; // if true answer will not be returned when poll is running
//   option?: number; // option index for correct answer, in case of single choice
//   options?: number[]; // list of options that shoould be in answer
//   text?: string; // answer text for answer.
//   case?: boolean; // if false case is ignored when comparing.
//   trim?: boolean; // if true, empty space is trimmer from start and end of asnwer.
// }
