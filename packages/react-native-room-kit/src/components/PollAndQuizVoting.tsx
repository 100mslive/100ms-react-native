import * as React from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  findNodeHandle,
  UIManager,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HMSPollState } from '@100mslive/react-native-hms';

import { useHMSInstance, useHMSRoomStyleSheet } from '../hooks-util';
import type { RootState } from '../redux';
import { PollAndQuizQuestionResponseCard } from './PollAndQuizQuestionResponseCard';
import { HMSDangerButton } from './HMSDangerButton';

export interface PollAndQuizVotingProps {
  dismissModal(): void;
}

export const PollAndQuizVoting: React.FC<PollAndQuizVotingProps> = () => {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const hmsInstance = useHMSInstance();
  const selectedPoll = useSelector((state: RootState) => {
    const pollsData = state.polls;
    if (pollsData.selectedPollId !== null) {
      return pollsData.polls[pollsData.selectedPollId] || null;
    }
    return null;
  });
  const canCreateOrEndPoll = useSelector((state: RootState) => {
    const permissions = state.hmsStates.localPeer?.role?.permissions;
    return permissions?.pollWrite;
  });

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    regularMediumText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
    semiBoldMediumText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  const endPoll = async () => {
    if (!selectedPoll || !canCreateOrEndPoll) {
      return;
    }
    const result = await hmsInstance.interactivityCenter.stop(
      selectedPoll.pollId
    );
    console.log('Poll ended', result);
  };

  const handleVote = (e: any) => {
    const handle = findNodeHandle(e.nativeEvent.target);
    const scrollHandle = findNodeHandle(scrollViewRef.current);
    if (!handle) {
      return;
    }
    if (scrollHandle === null) {
      return;
    }
    UIManager.measureLayout(
      handle,
      scrollHandle,
      () => {
        console.log('Failed', e);
      },
      (_left, top, _width, _height) => {
        scrollViewRef.current?.scrollTo({
          y: top + 400,
          animated: true,
        });
      }
    );
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.contentContainer}
      contentContainerStyle={{ paddingVertical: 24 }}
    >
      <Text style={[styles.normalText, hmsRoomStyles.semiBoldMediumText]}>
        {selectedPoll?.createdBy?.name} started this poll
      </Text>

      {selectedPoll?.questions
        ?.sort((a, b) => a.index - b.index)
        .map((question, _, arr) => (
          <PollAndQuizQuestionResponseCard
            key={question.index}
            pollState={selectedPoll.state}
            pollId={selectedPoll.pollId}
            totalQuestions={arr.length}
            pollQuestion={question}
            containerStyle={{ marginBottom: 16 }}
            onSubmit={handleVote}
          />
        ))}

      {selectedPoll &&
      selectedPoll.state === HMSPollState.started &&
      canCreateOrEndPoll ? (
        <HMSDangerButton
          disabled={!selectedPoll}
          title="End Poll"
          loading={false}
          onPress={endPoll}
          style={{ marginTop: 16, marginBottom: 16, alignSelf: 'flex-end' }}
        />
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  smallText: {
    fontSize: 14,
    lineHeight: 20,
  },
  normalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  typeSelectionLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  pollNameLabel: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  textInput: {
    flex: undefined,
  },

  addOptionWrapper: {
    alignSelf: 'flex-start',
  },
  addOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addOptionIconWrapper: {
    marginRight: 8,
    padding: 8,
  },
});
