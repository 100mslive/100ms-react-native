import type { HMSPollLeaderboardEntry } from './HMSPollLeaderboardEntry';
import type { HMSPollLeaderboardSummary } from './HMSPollLeaderboardSummary';
import type { PollLeaderboardResponse } from './PollLeaderboardResponse';

type NumberString = string;

export interface DecodedPollLeaderboardResponse
  extends Pick<PollLeaderboardResponse, 'hasNext'> {
  entries?: DecodedHMSPollLeaderboardEntry[];
  summary?: DecodedHMSPollLeaderboardSummary;
}

export interface DecodedHMSPollLeaderboardEntry
  extends Pick<HMSPollLeaderboardEntry, 'peer'> {
  /**
   * convert this value to number
   */
  duration?: NumberString | number;
  /**
   * convert this value to number
   */
  totalResponses?: NumberString | number;
  /**
   * convert this value to number
   */
  correctResponses?: NumberString | number;
  /**
   * convert this value to number
   */
  position?: NumberString | number;
  /**
   * convert this value to number
   */
  score?: NumberString | number;
}

export interface DecodedHMSPollLeaderboardSummary
  extends Omit<HMSPollLeaderboardSummary, 'averageTime'> {
  /**
   * convert this value to number
   */
  averageTime?: NumberString | number;
}
