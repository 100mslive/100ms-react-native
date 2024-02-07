import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HMSPollState, HMSPollType } from '@100mslive/react-native-hms';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { PollsAndQuizzesCard } from './PollsAndQuizzesCard';
import { useSelector } from 'react-redux';
import type { RootState } from 'src/redux';

export interface PreviousPollsAndQuizzesListProps {}

export const PreviousPollsAndQuizzesList: React.FC<
  PreviousPollsAndQuizzesListProps
> = ({}) => {
  const polls = useSelector((state: RootState) => state.polls.polls);

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    surfaceHighSemiBoldText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  return (
    <View style={styles.contentContainer}>
      <Text style={[styles.title, hmsRoomStyles.surfaceHighSemiBoldText]}>
        Previous Polls
      </Text>

      {Object.values(polls)
        .sort((a, b) =>
          a.startedAt && b.startedAt
            ? a.startedAt.getTime() - b.startedAt.getTime()
            : 0
        )
        .map((poll) => (
          <PollsAndQuizzesCard key={poll.pollId} poll={poll} />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    marginHorizontal: 24,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.15,
    marginVertical: 24,
  },
});
