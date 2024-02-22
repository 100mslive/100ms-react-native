import type { DecodedPollLeaderboardResponse } from './polls/DecodedPollLeaderboardResponse';
import type { HMSPoll } from './polls/HMSPoll';
import type { PollLeaderboardResponse } from './polls/PollLeaderboardResponse';

export class HMSInteractivityEncoder {
  static transformPoll(poll: HMSPoll): HMSPoll {
    if (poll.startedAt) {
      const dateNum = parseInt(poll.startedAt as unknown as string);

      if (isNaN(dateNum)) {
        poll.startedAt = undefined;
      } else {
        poll.startedAt = new Date(dateNum);
      }
    }
    if (poll.stoppedAt) {
      const dateNum = parseInt(poll.stoppedAt as unknown as string);

      if (isNaN(dateNum)) {
        poll.stoppedAt = undefined;
      } else {
        poll.stoppedAt = new Date(dateNum);
      }
    }
    // poll.rolesThatCanVote: HMSRole[];
    // poll.rolesThatCanViewResponses: HMSRole[];
    // --- poll.questions: HMSPollQuestion[]
    // --- poll.result: HMSPollResult
    return poll;
  }

  static transformPollLeaderboardResponse(
    decodedPollLeaderboardResponse: DecodedPollLeaderboardResponse
  ): PollLeaderboardResponse {
    const summary = decodedPollLeaderboardResponse.summary;
    if (summary) {
      if (typeof summary.averageTime === 'string') {
        summary.averageTime = parseInt(summary.averageTime);
      }
    }

    const entries = decodedPollLeaderboardResponse.entries;
    if (entries) {
      entries.forEach((entry) => {
        if (typeof entry.duration === 'string') {
          entry.duration = parseInt(entry.duration);
        }
        if (typeof entry.totalResponses === 'string') {
          entry.totalResponses = parseInt(entry.totalResponses);
        }
        if (typeof entry.correctResponses === 'string') {
          entry.correctResponses = parseInt(entry.correctResponses);
        }
        if (typeof entry.position === 'string') {
          entry.position = parseInt(entry.position);
        }
        if (typeof entry.score === 'string') {
          entry.score = parseInt(entry.score);
        }
      });
    }

    return decodedPollLeaderboardResponse as PollLeaderboardResponse;
  }
}
