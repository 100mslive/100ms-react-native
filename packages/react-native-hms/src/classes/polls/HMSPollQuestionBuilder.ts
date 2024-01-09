import type { HMSPollQuestion } from './HMSPollQuestion';
import type { HMSPollQuestionType } from './HMSPollQuestionType';

/**
 Builder class for creating a poll question.
 */
export class HMSPollQuestionBuilder {
  /**
   Sets the index of the question.
   
   - Parameter index: The index of the question.
   - Returns: The updated question builder instance.
   */
  withIndex(index: number): HMSPollQuestionBuilder {
    return this;
  }

  /**
   Sets whether the question can be skipped.
   
   - Parameter canBeSkipped: A flag indicating whether the question can be skipped.
   - Returns: The updated question builder instance.
   */
  withCanBeSkipped(canBeSkipped: boolean): HMSPollQuestionBuilder {
    return this;
  }

  /**
   Sets the title of the question.
   
   - Parameter title: The title of the question.
   - Returns: The updated question builder instance.
   */
  withTitle(title: string): HMSPollQuestionBuilder {
    return this;
  }

  /**
   Sets the duration of the question.
   
   - Parameter duration: The duration of the question.
   - Returns: The updated question builder instance.
   */
  withDuration(duration: number): HMSPollQuestionBuilder {
    return this;
  }

  /**
   Sets the type of the question.
   
   - Parameter type: The type of the question.
   - Returns: The updated question builder instance.
   */
  withType(type: HMSPollQuestionType): HMSPollQuestionBuilder {
    return this;
  }

  /**
   Adds an option to the question.
   
   - Parameter title: The title of the option.
   - Returns: The updated question builder instance.
   */
  addOption(title: string): HMSPollQuestionBuilder {
    return this;
  }

  /**
   Adds an option to the question if poll type is set to quiz.
   
   - Parameters:
      - title: The title of the option.
      - isCorrect: A flag indicating whether the option is correct.
   - Returns: The updated question builder instance.
   */
  addQuizOption(title: string, isCorrect: boolean): HMSPollQuestionBuilder {
    return this;
  }

  /**
   Builds the question object with the configured properties.
   
   - Returns: The built question object.
   */
  // TODO: remove null return type
  build(): HMSPollQuestion | null {
    return null;
  }
}
