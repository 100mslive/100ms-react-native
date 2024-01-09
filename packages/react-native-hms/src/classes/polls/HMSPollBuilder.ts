import type { HMSPollQuestionBuilder } from './HMSPollQuestionBuilder';
import type { HMSPollUserTrackingMode } from './HMSPollUserTrackingMode';
import type { HMSRole } from '../HMSRole';
import type { HMSPoll } from './HMSPoll';
import type { HMSPollCategory } from './HMSPollCategory';

/**
 Builder class for creating a poll.
 */
export class HMSPollBuilder {
  /**
   Sets the ID of the poll.
   
   - Parameter pollID: The ID of the poll.
   - Returns: The updated poll builder instance.
   */
  withPollID(pollID: string): HMSPollBuilder {
    return this;
  }

  /**
   Sets the title of the poll.
   
   - Parameter title: The title of the poll.
   - Returns: The updated poll builder instance.
   */
  withTitle(title: string): HMSPollBuilder {
    return this;
  }

  /**
   Sets the duration of the poll.
   
   - Parameter duration: The duration of the poll.
   - Returns: The updated poll builder instance.
   */
  withDuration(duration: number): HMSPollBuilder {
    return this;
  }

  /**
   Sets whether the poll is anonymous.
   
   - Parameter anonymous: A flag indicating whether the poll is anonymous.
   - Returns: The updated poll builder instance.
   */
  withAnonymous(anonymous: boolean): HMSPollBuilder {
    return this;
  }

  /**
   Sets the category of the poll.
   
   - Parameter category: The category of the poll.
   - Returns: The updated poll builder instance.
   */
  withCategory(category: HMSPollCategory): HMSPollBuilder {
    return this;
  }

  /**
   Sets the user tracking mode of the poll.
   
   - Parameter mode: The user tracking mode of the poll.
   - Returns: The updated poll builder instance.
   */
  withUserTrackingMode(mode: HMSPollUserTrackingMode): HMSPollBuilder {
    return this;
  }

  /**
   Sets the roles that can vote in the poll.
   
   - Parameter rolesThatCanVote: The roles that can vote in the poll.
   - Returns: The updated poll builder instance.
   */
  withRolesThatCanVote(rolesThatCanVote?: HMSRole[]): HMSPollBuilder {
    return this;
  }

  /**
   Sets the roles that can view responses in the poll.
   
   - Parameter rolesThatCanViewResponses: The roles that can view responses in the poll.
   - Returns: The updated poll builder instance.
   */
  withRolesThatCanViewResponses(
    rolesThatCanViewResponses?: HMSRole[]
  ): HMSPollBuilder {
    return this;
  }

  /**
   Adds a multiple-choice question to the poll.
   
   - Parameters:
      - title: The title of the question.
      - options: The options for the question.
   - Returns: The updated poll builder instance.
   */
  addMultiChoiceQuestion(title: string, options: string[]): HMSPollBuilder {
    return this;
  }

  /**
   Adds a single-choice question to the poll.
   
   - Parameters:
      - title: The title of the question.
      - options: The options for the question.
   - Returns: The updated poll builder instance.
   */
  addSingleChoiceQuestion(title: string, options: string[]): HMSPollBuilder {
    return this;
  }

  /**
   Adds a question to the poll using a question builder.
   
   - Parameters:
      - builder: The builder instance for creating the question.
   - Returns: The updated poll builder instance.
   */
  addQuestion(builder: HMSPollQuestionBuilder): HMSPollBuilder {
    return this;
  }

  /**
   Adds a short answer question to the poll.
   
   - Parameters:
      - title: The title of the question.
   - Returns: The updated poll builder instance.
   */
  addShortAnswerQuestion(title: string): HMSPollBuilder {
    return this;
  }

  /**
   Adds a long answer question to the poll.
   
   - Parameters:
      - title: The title of the question.
   - Returns: The updated poll builder instance.
   */
  addLongAnswerQuestion(title: string): HMSPollBuilder {
    return this;
  }

  /**
   Builds the poll object with the configured properties.
   
   - Returns: The built poll object.
   */
  // TODO: remove null type from return type
  build(): HMSPoll | null {
    return null;
  }
}
