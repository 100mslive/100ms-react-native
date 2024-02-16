import * as React from 'react';
import { ScrollView } from 'react-native';

import { CreatePoll } from './CreatePoll';
import { PreviousPollsAndQuizzesList } from './PreviousPollsAndQuizzesList';
import { useSelector } from 'react-redux';
import type { RootState } from 'src/redux';

export interface PollsConfigAndListProps {}

export const PollsConfigAndList: React.FC<PollsConfigAndListProps> = ({}) => {
  const canCreateOrEndPoll = useSelector((state: RootState) => {
    const permissions = state.hmsStates.localPeer?.role?.permissions;
    return permissions?.pollWrite;
  });
  const canVoteOnPoll = useSelector((state: RootState) => {
    const permissions = state.hmsStates.localPeer?.role?.permissions;
    return permissions?.pollRead;
  });

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      {canCreateOrEndPoll ? <CreatePoll /> : null}
      {canVoteOnPoll || canCreateOrEndPoll ? (
        <PreviousPollsAndQuizzesList />
      ) : null}
    </ScrollView>
  );
};
