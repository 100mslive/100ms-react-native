import * as React from 'react';
import type { HMSPoll } from '@100mslive/react-native-hms';
import { useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { QuizLeaderboardSummary } from './QuizLeaderboardSummary';
import { useFetchLeaderboardResponse } from '../utils/hooks';

export interface VoterParticipationSummaryProps {
  pollId: HMSPoll['pollId'];
}

export const VoterParticipationSummary: React.FC<
  VoterParticipationSummaryProps
> = ({ pollId }) => {
  const localPeerUserId = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.customerUserID
  );
  const leaderboardData = useFetchLeaderboardResponse(pollId);
  const totalQuestions = useSelector(
    (state: RootState) => state.polls.polls[pollId]?.questions?.length
  );

  const localLeaderboardEntry =
    localPeerUserId && leaderboardData && Array.isArray(leaderboardData.entries)
      ? leaderboardData.entries.find(
          (entry) => entry.peer?.customerUserId === localPeerUserId
        )
      : null;

  const data = React.useMemo(() => {
    return [
      [
        {
          label: 'ANSWERED',
          value:
            localLeaderboardEntry &&
            typeof localLeaderboardEntry.totalResponses === 'number' &&
            typeof totalQuestions === 'number'
              ? `${Math.round((localLeaderboardEntry.totalResponses / totalQuestions) * 100)}% (${localLeaderboardEntry.totalResponses}/${totalQuestions})`
              : '-',
        },
        {
          label: 'CORRECT ANSWERS',
          value:
            localLeaderboardEntry &&
            typeof localLeaderboardEntry.correctResponses === 'number' &&
            typeof totalQuestions === 'number'
              ? `${Math.round((localLeaderboardEntry.correctResponses / totalQuestions) * 100)}% (${localLeaderboardEntry.correctResponses}/${totalQuestions})`
              : '-',
        },
      ],
      [
        {
          label: 'TIME TAKEN',
          value:
            localLeaderboardEntry &&
            typeof localLeaderboardEntry.duration === 'number'
              ? `${(localLeaderboardEntry.duration / 1000).toFixed(2)}s`
              : '-',
        },
      ],
    ];
  }, [localLeaderboardEntry]);

  return <QuizLeaderboardSummary data={data} />;
};
