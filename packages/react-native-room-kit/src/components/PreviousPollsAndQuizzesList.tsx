import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { useHMSRoomStyleSheet, useIsHLSViewer } from '../hooks-util';
import { PollsAndQuizzesCard } from './PollsAndQuizzesCard';
import type { RootState } from '../redux';
import { visiblePollsSelector } from '../utils/functions';

export interface PreviousPollsAndQuizzesListProps {}

export const PreviousPollsAndQuizzesList: React.FC<
  PreviousPollsAndQuizzesListProps
> = ({}) => {
  const isHLSViewer = useIsHLSViewer();
  const polls = useSelector((state: RootState) => state.polls.polls);
  const hlsCuedPollIds = useSelector(
    (state: RootState) => state.polls.cuedPollIds
  );

  const canCreateOrEndPoll = useSelector((state: RootState) => {
    const permissions = state.hmsStates.localPeer?.role?.permissions;
    return permissions?.pollWrite;
  });

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    surfaceHighSemiBoldText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    surfaceHighRegularText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  const pollsList = visiblePollsSelector(
    Object.values(polls),
    isHLSViewer,
    hlsCuedPollIds
  );

  if (pollsList.length === 0 && !canCreateOrEndPoll) {
    return (
      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.subtitle,
            hmsRoomStyles.surfaceHighRegularText,
            styles.emptyList,
          ]}
        >
          No Polls to show
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.contentContainer}>
      {pollsList.length > 0 && (
        <Text style={[styles.title, hmsRoomStyles.surfaceHighSemiBoldText]}>
          Previous Polls
        </Text>
      )}

      {/* Bug here: startedAt is coming as number instead of number */}
      {pollsList
        .sort((a, b) =>
          a.startedAt && b.startedAt
            ? b.startedAt.getTime() - a.startedAt.getTime()
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
  subtitle: {
    fontSize: 16,
    lineHeight: 20,
    marginVertical: 24,
  },
  emptyList: {
    textAlign: 'center',
  },
});
