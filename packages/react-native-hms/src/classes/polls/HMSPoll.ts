import type { HMSPollState } from './HMSPollState';
import type { HMSPollQuestion } from './HMSPollQuestion';
import type { HMSPollResult } from './HMSPollResult';
import type { HMSRole } from '../HMSRole';
import type { HMSPollUserTrackingMode } from './HMSPollUserTrackingMode';
import type { HMSPollType } from './HMSPollType';
import type { HMSPeer } from '../HMSPeer';

type HMSPeerSubset = {
  peerID: HMSPeer['peerID'];
  name: HMSPeer['name'];
};

type HMSRoleSubset = {
  name: HMSRole['name'];
};

export interface HMSPoll {
  /**
   The unique identifier of the poll.
   */
  pollId: string;

  /**
   The title of the poll.
   */
  title: string;

  /**
   The duration of the poll in seconds.
   */
  duration?: number;

  /**
   A flag indicating whether the poll is anonymous or not.
   */
  anonymous?: boolean;

  /**
   The tracking mode for user participation in the poll.
   */
  mode?: HMSPollUserTrackingMode;

  /**
   The roles that can vote in the poll.
   */
  rolesThatCanVote?: HMSRoleSubset[];

  /**
   The roles that can view the poll responses.
   */
  rolesThatCanViewResponses?: HMSRoleSubset[];

  /**
   The peer who started the poll.
   */
  startedBy?: HMSPeerSubset;

  /**
   The peer who stopped the poll.
   */
  stoppedBy?: HMSPeerSubset;

  /**
   The peer who created the poll.
   */
  createdBy?: HMSPeerSubset;

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
  type: HMSPollType;

  /**
   The current state of the poll.
   */
  state?: HMSPollState;

  /**
   The list of questions in the poll.
   */
  questions?: HMSPollQuestion[];

  /**
   The result of the poll.
   */
  result?: HMSPollResult;

  // /**
  //  The visiblity of the poll. (Not available on iOS)
  //  */
  // visibility?: boolean;

  // /**
  //  * Is poll locked currently? (Not available on iOS)
  //  */
  // locked?: boolean;
}
