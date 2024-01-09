import type { HMSPeer } from '../HMSPeer';
import type { HMSPollState } from './HMSPollState';
import type { HMSPollQuestion } from './HMSPollQuestion';
import type { HMSPollResult } from './HMSPollResult';

import type { HMSRole } from '../HMSRole';

export interface HMSPoll {
  /**
   The unique identifier of the poll.
   */
  pollID: string;

  /**
   The title of the poll.
   */
  title: string;

  /**
   The duration of the poll in seconds.
   */
  duration: number;

  /**
   A flag indicating whether the poll is anonymous or not.
   */
  anonymous: boolean;

  /**
   The tracking mode for user participation in the poll.
   */
  // mode: HMSPollUserTrackingMode?

  /**
   The roles that can vote in the poll.
   */
  rolesThatCanVote: HMSRole[];

  /**
   The roles that can view the poll responses.
   */
  rolesThatCanViewResponses: HMSRole[];

  /**
   The number of questions in the poll.
   */
  questionCount?: number;

  /**
   The peer who started the poll.
   */
  startedBy?: HMSPeer;

  /**
   The peer who stopped the poll.
   */
  stoppedBy?: HMSPeer;

  /**
   The peer who created the poll.
   */
  createdBy?: HMSPeer;

  /**
   The date and time when the poll was started.
   */
  startedAt?: Date;

  /**
   The date and time when the poll was stopped.
   */
  stoppedAt?: Date;

  /**
   The type of the poll.
   */
  // type: HMSPollType;

  /**
   The current state of the poll.
   */
  state: HMSPollState;

  /**
   The list of questions in the poll.
   */
  questions?: HMSPollQuestion[];

  /**
   The result of the poll.
   */
  result?: HMSPollResult;
}
