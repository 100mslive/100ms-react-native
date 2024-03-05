import type { HMSPollResponsePeerInfo } from './HMSPollResponsePeerInfo';

export interface HMSPollLeaderboardEntry {
  duration?: number;
  totalResponses?: number;
  correctResponses?: number;
  position?: number;
  score?: number;
  peer?: HMSPollResponsePeerInfo;
}
