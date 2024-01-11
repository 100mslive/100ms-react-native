// import type { HMSPollQuestion } from './HMSPollQuestion';
import type { HMSPollQuestionType } from './HMSPollQuestionType';

type OptionType = { title: string } | { title: string; isCorrect: boolean };

/**
 Builder class for creating a poll question.
 */
export class HMSPollQuestionBuilder {
  protected index?: number;
  protected canBeSkipped?: boolean;
  protected title?: string;
  protected duration?: number;
  protected type?: HMSPollQuestionType;
  protected options?: OptionType[];

  /**
   * Sets the index of the question.
   * @param index The index of the question.
   * @returns The updated question builder instance.
   */
  withIndex(index: number): HMSPollQuestionBuilder {
    this.index = index;
    return this;
  }

  /**
   * Sets whether the question can be skipped.
   * @param canBeSkipped A flag indicating whether the question can be skipped.
   * @returns The updated question builder instance.
   */
  withCanBeSkipped(canBeSkipped: boolean): HMSPollQuestionBuilder {
    this.canBeSkipped = canBeSkipped;
    return this;
  }

  /**
   * Sets the title of the question.
   * @param title The title of the question.
   * @returns The updated question builder instance.
   */
  withTitle(title: string): HMSPollQuestionBuilder {
    this.title = title;
    return this;
  }

  /**
   * Sets the duration of the question.
   * @param duration The duration of the question.
   * @returns The updated question builder instance.
   */
  withDuration(duration: number): HMSPollQuestionBuilder {
    this.duration = duration;
    return this;
  }

  /**
   * Sets the type of the question.
   * @param type The type of the question.
   * @returns The updated question builder instance.
   */
  withType(type: HMSPollQuestionType): HMSPollQuestionBuilder {
    this.type = type;
    return this;
  }

  /**
   * Adds an option to the question.
   * @param title The title of the option.
   * @returns The updated question builder instance.
   */
  addOption(title: string): HMSPollQuestionBuilder {
    if (!Array.isArray(this.options)) {
      this.options = [];
    }
    this.options.push({ title });
    return this;
  }

  /**
   * Adds an option to the question if poll type is set to quiz.
   * @param title The title of the option.
   * @param isCorrect A flag indicating whether the option is correct.
   * @returns The updated question builder instance.
   */
  addQuizOption(title: string, isCorrect: boolean): HMSPollQuestionBuilder {
    if (!Array.isArray(this.options)) {
      this.options = [];
    }
    this.options.push({ title, isCorrect });
    return this;
  }

  // /**
  //  Builds the question object with the configured properties.
  //  - Returns: The built question object.
  //  */
  // // TODO: remove null return type
  // build(): HMSPollQuestion | null {
  //   return null;
  // }
}
