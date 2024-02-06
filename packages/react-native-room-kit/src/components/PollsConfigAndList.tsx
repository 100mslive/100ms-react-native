import * as React from 'react';
import { ScrollView } from 'react-native';

import { CreatePoll } from './CreatePoll';
import { PreviousPollsAndQuizzesList } from './PreviousPollsAndQuizzesList';
import { useSelector } from 'react-redux';
import type { RootState } from 'src/redux';

export interface PollsConfigAndListProps {}

export const PollsConfigAndList: React.FC<PollsConfigAndListProps> = ({}) => {
  const havePolls = useSelector(
    (state: RootState) => Object.keys(state.polls.polls).length > 0
  );

  if (!havePolls) {
    return <CreatePoll />;
  }

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 24 }}>
      <CreatePoll />
      <PreviousPollsAndQuizzesList />
    </ScrollView>
  );
};
