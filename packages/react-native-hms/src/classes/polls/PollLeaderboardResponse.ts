import type { HMSPollLeaderboardEntry } from './HMSPollLeaderboardEntry';
import type { HMSPollLeaderboardSummary } from './HMSPollLeaderboardSummary';

export interface PollLeaderboardResponse {
  entries?: HMSPollLeaderboardEntry[];
  hasNext?: boolean;
  summary?: HMSPollLeaderboardSummary;
}
