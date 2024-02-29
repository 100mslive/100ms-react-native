import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { PollQuestions } from './PollQuestions';
import { CreatePollStages } from '../redux/actionTypes';
import { PollsConfigAndList } from './PollsConfigAndList';
import { PollAndQuizVoting } from './PollAndQuizVoting';
import { PollAndQuizSheetScreen } from './PollAndQuizSheetScreen';
import { QuizLeaderboardScreen } from './QuizLeaderboardScreen';
import { QuizLeaderboardEntriesScreen } from './QuizLeaderboardEntriesScreen';

export interface PollsAndQuizzesModalContentProps {
  dismissModal(): void;
}

export const PollsAndQuizzesModalContent: React.FC<
  PollsAndQuizzesModalContentProps
> = ({ dismissModal }) => {
  const pollsNavigationStack = useSelector(
    (state: RootState) => state.polls.navigationStack
  );

  const canCreateOrEndPoll = useSelector((state: RootState) => {
    const permissions = state.hmsStates.localPeer?.role?.permissions;
    return permissions?.pollWrite;
  });
  const canVoteOnPoll = useSelector((state: RootState) => {
    const permissions = state.hmsStates.localPeer?.role?.permissions;
    return permissions?.pollRead;
  });

  return (
    <View style={[styles.relative, styles.fullView]}>
      {pollsNavigationStack.map((stage, index) => (
        <PollAndQuizSheetScreen
          key={stage}
          zIndex={index}
          disableAnimation={index === 0}
        >
          {stage === CreatePollStages.POLL_CONFIG ? (
            <PollsConfigAndList dismissModal={dismissModal} />
          ) : stage === CreatePollStages.POLL_QUESTION_CONFIG &&
            canCreateOrEndPoll ? (
            <PollQuestions currentIdx={index} dismissModal={dismissModal} />
          ) : stage === CreatePollStages.POLL_VOTING &&
            (canVoteOnPoll || canCreateOrEndPoll) ? (
            <PollAndQuizVoting currentIdx={index} dismissModal={dismissModal} />
          ) : stage === CreatePollStages.QUIZ_LEADERBOARD ? (
            <QuizLeaderboardScreen
              currentIdx={index}
              dismissModal={dismissModal}
            />
          ) : stage === CreatePollStages.QUIZ_LEADERBOARD_ENTRIES ? (
            <QuizLeaderboardEntriesScreen
              currentIdx={index}
              dismissModal={dismissModal}
            />
          ) : null}
        </PollAndQuizSheetScreen>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  relative: {
    position: 'relative',
    overflow: 'hidden',
  },
  fullView: {
    flex: 1,
  },
});
