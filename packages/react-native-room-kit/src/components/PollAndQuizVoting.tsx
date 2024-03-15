import * as React from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  findNodeHandle,
  UIManager,
  View,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { HMSPollState, HMSPollType } from '@100mslive/react-native-hms';

import { useHMSInstance, useHMSRoomStyleSheet } from '../hooks-util';
import type { RootState } from '../redux';
import { HMSDangerButton } from './HMSDangerButton';
import { PollAndQuizQuestionResponseCards } from './PollAndQuizQuestionResponseCards';
import {
  popFromNavigationStack,
  pushToNavigationStack,
} from '../redux/actions';
import { BottomSheet } from './BottomSheet';
import { ChevronIcon, CloseIcon } from '../Icons';
import { PollAndQuizzStateLabel } from './PollAndQuizzStateLabel';
import { HMSPrimaryButton } from './HMSPrimaryButton';
import { CreatePollStages } from '../redux/actionTypes';
import { VoterParticipationSummary } from './VoterParticipationSummary';

export interface PollAndQuizVotingProps {
  currentIdx: number;
  dismissModal(): void;
  unmountScreenWithAnimation?(cb: Function): void;
}

export const PollAndQuizVoting: React.FC<PollAndQuizVotingProps> = ({
  currentIdx,
  dismissModal,
  unmountScreenWithAnimation,
}) => {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();

  const selectedPoll = useSelector((state: RootState) => {
    const pollsData = state.polls;
    if (pollsData.selectedPollId !== null) {
      return pollsData.polls[pollsData.selectedPollId] || null;
    }
    return null;
  });
  const pollId = selectedPoll?.pollId;
  const localPeerPollInitiator = useSelector((state: RootState) => {
    if (!pollId) return null;
    const localPeerUserId = state.hmsStates.localPeer?.customerUserID;
    const pollInitiatorUserID =
      state.polls.polls[pollId]?.createdBy?.customerUserID;
    return (
      localPeerUserId &&
      pollInitiatorUserID &&
      localPeerUserId === pollInitiatorUserID
    );
  });
  const canCreateOrEndPoll = useSelector((state: RootState) => {
    const permissions = state.hmsStates.localPeer?.role?.permissions;
    return permissions?.pollWrite;
  });
  const headerTitle = useSelector((state: RootState) => {
    const pollsData = state.polls;
    if (pollsData.selectedPollId !== null) {
      return pollsData.polls[pollsData.selectedPollId]?.title || null;
    }
    return null;
  });

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    regularMediumText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
    semiBoldHighText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    semiBoldMediumText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    headerText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    container: {
      backgroundColor: theme.palette.surface_dim,
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

  const viewLeaderboard = () => {
    dispatch(pushToNavigationStack(CreatePollStages.QUIZ_LEADERBOARD));
  };

  const handleBackPress = () => {
    Keyboard.dismiss();
    if (typeof unmountScreenWithAnimation === 'function') {
      unmountScreenWithAnimation(() => dispatch(popFromNavigationStack()));
    } else {
      dispatch(popFromNavigationStack());
    }
  };

  const handleClosePress = () => {
    Keyboard.dismiss();
    dismissModal();
  };

  return (
    <View style={[styles.fullView, hmsRoomStyles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerControls}>
          {currentIdx > 0 ? (
            <TouchableOpacity
              onPress={handleBackPress}
              hitSlop={styles.closeIconHitSlop}
              style={styles.backIcon}
            >
              <ChevronIcon direction="left" />
            </TouchableOpacity>
          ) : null}

          <Text
            numberOfLines={2}
            style={[
              styles.headerText,
              { flexShrink: 1 },
              hmsRoomStyles.headerText,
            ]}
          >
            {headerTitle}
          </Text>

          {selectedPoll?.state ? (
            <PollAndQuizzStateLabel state={selectedPoll?.state} />
          ) : null}
        </View>

        <TouchableOpacity
          onPress={handleClosePress}
          hitSlop={styles.closeIconHitSlop}
          style={{ marginLeft: 16 }}
        >
          <CloseIcon />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <BottomSheet.Divider style={styles.halfDivider} />

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.contentContainer}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 24 }}
      >
        {selectedPoll &&
        selectedPoll.type === HMSPollType.quiz &&
        selectedPoll.state === HMSPollState.stopped &&
        !localPeerPollInitiator ? (
          <React.Fragment>
            <VoterParticipationSummary pollId={selectedPoll.pollId} />

            <Text style={[styles.normalText, hmsRoomStyles.semiBoldHighText]}>
              Questions
            </Text>
          </React.Fragment>
        ) : (
          <Text style={[styles.normalText, hmsRoomStyles.semiBoldMediumText]}>
            {selectedPoll?.createdBy?.name} started a{' '}
            {selectedPoll?.type === HMSPollType.quiz ? 'quiz' : 'poll'}
          </Text>
        )}

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

      {selectedPoll &&
      selectedPoll.state === HMSPollState.stopped &&
      selectedPoll.type === HMSPollType.quiz ? (
        <HMSPrimaryButton
          title={'View Leaderboard'}
          loading={false}
          onPress={viewLeaderboard}
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

  // -----------------

  // Utilities
  fullView: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginHorizontal: 24,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  headerText: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.15,
    marginRight: 12,
  },
  closeIconHitSlop: {
    bottom: 16,
    left: 16,
    right: 16,
    top: 16,
  },
  backIcon: {
    marginRight: 8,
  },
  // Divider
  halfDivider: {
    marginHorizontal: 24,
    marginVertical: 0,
    marginTop: 24,
    width: undefined,
  },
  divider: {
    marginHorizontal: 24,
    marginVertical: 24,
    width: undefined,
  },
});
