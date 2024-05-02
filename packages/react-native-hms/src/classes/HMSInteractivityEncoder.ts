import { HMSEncoder } from './HMSEncoder';
import type { DecodedPollLeaderboardResponse } from './polls/DecodedPollLeaderboardResponse';
import type { HMSPoll } from './polls/HMSPoll';
import type { PollLeaderboardResponse } from './polls/PollLeaderboardResponse';
import type { HMSWhiteboard } from './whiteboard/HMSWhiteboard';

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
    if (poll.createdBy) {
      poll.createdBy = HMSEncoder.encodeHmsPeer(poll.createdBy);
    }
    if (poll.startedBy) {
      poll.startedBy = HMSEncoder.encodeHmsPeer(poll.startedBy);
    }
    if (poll.stoppedBy) {
      poll.stoppedBy = HMSEncoder.encodeHmsPeer(poll.stoppedBy);
    }
    if (poll.rolesThatCanVote) {
      poll.rolesThatCanVote = poll.rolesThatCanVote.map((role) =>
        HMSEncoder.encodeHmsRole(role)
      );
    }
    if (poll.rolesThatCanViewResponses) {
      poll.rolesThatCanViewResponses = poll.rolesThatCanViewResponses.map(
        (role) => HMSEncoder.encodeHmsRole(role)
      );
    }

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

  static transformHMSWhiteboard(hmsWhiteboard: HMSWhiteboard): HMSWhiteboard {
    if (hmsWhiteboard.owner) {
      hmsWhiteboard.owner = HMSEncoder.encodeHmsPeer(hmsWhiteboard.owner);
    }
    return hmsWhiteboard;
  }
}
