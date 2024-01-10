import type { HMSPollQuestionBuilder } from './HMSPollQuestionBuilder';
import type { HMSPollUserTrackingMode } from './HMSPollUserTrackingMode';
import type { HMSRole } from '../HMSRole';
// import type { HMSPoll } from './HMSPoll';
import type { HMSPollCategory } from './HMSPollCategory';

type Questions =
  | { rntype: 'multipleChoice'; title: string; options: string[] }
  | { rntype: 'singleChoice'; title: string; options: string[] }
  | { rntype: 'shortAnswer'; title: string }
  | { rntype: 'longAnswer'; title: string }
  | ({ rntype: 'HMSPollQuestionBuilder' } & Pick<HMSPollQuestionBuilder, any>);

/**
 Builder class for creating a poll.
 */
export class HMSPollBuilder {
  protected pollID?: string;
  protected title?: string;
  protected duration?: number;
  protected anonymous?: boolean;
  protected category?: HMSPollCategory;
  protected mode?: HMSPollUserTrackingMode;
  protected rolesThatCanVote?: string[];
  protected rolesThatCanViewResponses?: string[];
  protected questions: Questions[] = [];

  /**
   * Sets the ID of the poll.
   * @param pollID The ID of the poll.
   * @returns The updated poll builder instance.
   */
  withPollID(pollID: string): HMSPollBuilder {
    this.pollID = pollID;
    return this;
  }

  /**
   * Sets the title of the poll.
   * @param title The title of the poll.
   * @returns The updated poll builder instance.
   */
  withTitle(title: string): HMSPollBuilder {
    this.title = title;
    return this;
  }

  /**
   * Sets the duration of the poll.
   * @param duration The duration of the poll.
   * @returns The updated poll builder instance.
   */
  withDuration(duration: number): HMSPollBuilder {
    this.duration = duration;
    return this;
  }

  /**
   * Sets whether the poll is anonymous.
   * @param anonymous A flag indicating whether the poll is anonymous.
   * @returns The updated poll builder instance.
   */
  withAnonymous(anonymous: boolean): HMSPollBuilder {
    this.anonymous = anonymous;
    return this;
  }

  /**
   * Sets the category of the poll.
   * @param category The category of the poll.
   * @returns The updated poll builder instance.
   */
  withCategory(category: HMSPollCategory): HMSPollBuilder {
    this.category = category;
    return this;
  }

  /**
   * Sets the user tracking mode of the poll.
   * @param mode The user tracking mode of the poll.
   * @returns The updated poll builder instance.
   */
  withUserTrackingMode(mode: HMSPollUserTrackingMode): HMSPollBuilder {
    this.mode = mode;
    return this;
  }

  /**
   * Sets the roles that can vote in the poll.
   * @param rolesThatCanVote The roles that can vote in the poll.
   * @returns The updated poll builder instance.
   */
  withRolesThatCanVote(rolesThatCanVote?: HMSRole[]): HMSPollBuilder {
    this.rolesThatCanVote = rolesThatCanVote?.map((role) => role.name!);
    return this;
  }

  /**
   * Sets the roles that can view responses in the poll.
   * @param rolesThatCanViewResponses The roles that can view responses in the poll.
   * @returns The updated poll builder instance.
   */
  withRolesThatCanViewResponses(
    rolesThatCanViewResponses?: HMSRole[]
  ): HMSPollBuilder {
    this.rolesThatCanViewResponses = rolesThatCanViewResponses?.map(
      (role) => role.name!
    );
    return this;
  }

  /**
   * Adds a multiple-choice question to the poll.
   * @param title The title of the question.
   * @param options The options for the question.
   * @returns The updated poll builder instance.
   */
  addMultiChoiceQuestion(title: string, options: string[]): HMSPollBuilder {
    this.questions.push({
      rntype: 'multipleChoice',
      title,
      options,
    });
    return this;
  }

  /**
   * Adds a single-choice question to the poll.
   * @param title The title of the question.
   * @param options The options for the question.
   * @returns The updated poll builder instance.
   */
  addSingleChoiceQuestion(title: string, options: string[]): HMSPollBuilder {
    this.questions.push({
      rntype: 'singleChoice',
      title,
      options,
    });
    return this;
  }

  /**
   * Adds a question to the poll using a question builder.
   * @param builder The builder instance for creating the question.
   * @returns The updated poll builder instance.
   */
  addQuestion(builder: HMSPollQuestionBuilder): HMSPollBuilder {
    this.questions.push({
      rntype: 'HMSPollQuestionBuilder',
      ...builder,
    });
    return this;
  }

  /**
   * Adds a short answer question to the poll.
   * @param title The title of the question.
   * @returns The updated poll builder instance.
   */
  addShortAnswerQuestion(title: string): HMSPollBuilder {
    this.questions.push({
      rntype: 'shortAnswer',
      title,
    });
    return this;
  }

  /**
   * Adds a long answer question to the poll.
   * @param title The title of the question.
   * @returns The updated poll builder instance.
   */
  addLongAnswerQuestion(title: string): HMSPollBuilder {
    this.questions.push({
      rntype: 'longAnswer',
      title,
    });
    return this;
  }

  // /**
  //  * Builds the poll object with the configured properties.
  //  * @returns The built poll object.
  //  */
  // // TODO: remove null type from return type
  // build(): HMSPoll | null {
  //   return null;
  // }
}
