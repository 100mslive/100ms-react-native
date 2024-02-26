import * as React from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  findNodeHandle,
  UIManager,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HMSPollState, HMSPollType } from '@100mslive/react-native-hms';

import { useHMSInstance, useHMSRoomStyleSheet } from '../hooks-util';
import type { RootState } from '../redux';
import { HMSDangerButton } from './HMSDangerButton';
import { PollAndQuizQuestionResponseCards } from './PollAndQuizQuestionResponseCards';

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
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.contentContainer}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 24 }}
      >
        <Text style={[styles.normalText, hmsRoomStyles.semiBoldMediumText]}>
          {selectedPoll?.createdBy?.name} started a{' '}
          {selectedPoll?.type === HMSPollType.quiz ? 'quiz' : 'poll'}
        </Text>

        {selectedPoll ? (
          <PollAndQuizQuestionResponseCards
            poll={selectedPoll}
            onVote={handleVote}
          />
        ) : null}
      </ScrollView>

      {selectedPoll &&
      selectedPoll.state === HMSPollState.started &&
      canCreateOrEndPoll ? (
        <HMSDangerButton
          disabled={!selectedPoll}
          title={
            selectedPoll?.type === HMSPollType.quiz ? 'End Quiz' : 'End Poll'
          }
          loading={false}
          onPress={endPoll}
          style={{
            marginTop: 16,
            marginBottom: 16,
            marginRight: 24,
            alignSelf: 'flex-end',
          }}
        />
      ) : null}
    </View>
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
