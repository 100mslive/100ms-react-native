import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { useHMSRoomStyleSheet } from '../hooks-util';
import { BottomSheet } from './BottomSheet';
import { ChevronIcon, CloseIcon } from '../Icons';
import { TestIds } from '../utils/constants';
import { PollQuestions } from './PollQuestions';
import { CreatePollStages } from '../redux/actionTypes';
import { setPollStage } from '../redux/actions';
import { PollQDeleteConfirmationSheetView } from './PollQDeleteConfirmationSheetView';
import { PollsConfigAndList } from './PollsConfigAndList';
import { PollAndQuizVoting } from './PollAndQuizVoting';
import type { HMSPoll } from '@100mslive/react-native-hms';
import { PollAndQuizzStateLabel } from './PollAndQuizzStateLabel';

export interface PollsAndQuizzesModalContentProps {
  fullHeight: boolean;
  dismissModal(): void;
}

export const PollsAndQuizzesModalContent: React.FC<
  PollsAndQuizzesModalContentProps
> = ({ fullHeight, dismissModal }) => {
  const dispatch = useDispatch();
  const headerTitle = useSelector((state: RootState) => {
    const pollsData = state.polls;
    if (pollsData.stage === CreatePollStages.POLL_QUESTION_CONFIG) {
      return pollsData.pollName;
    }
    if (
      pollsData.stage === CreatePollStages.POLL_VOTING &&
      pollsData.selectedPollId !== null
    ) {
      return pollsData.polls[pollsData.selectedPollId]?.title || null;
    }
    return null;
  });
  const selectedPoll = useSelector((state: RootState) => {
    const pollsData = state.polls;
    if (
      pollsData.stage === CreatePollStages.POLL_VOTING &&
      pollsData.selectedPollId !== null
    ) {
      return pollsData.polls[pollsData.selectedPollId] || null;
    }
    return null;
  });
  const pollsStage = useSelector((state: RootState) => state.polls.stage);
  const launchingPoll = useSelector(
    (state: RootState) => state.polls.launchingPoll
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    headerText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  const handleBackPress = () => {
    Keyboard.dismiss();
    dispatch(setPollStage(CreatePollStages.POLL_CONFIG));
  };

  const handleClosePress = () => {
    Keyboard.dismiss();
    dismissModal();
  };

  return (
    <View style={fullHeight ? styles.fullView : null}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerControls}>
          {headerTitle ? (
            <TouchableOpacity
              onPress={handleBackPress}
              disabled={launchingPoll}
              hitSlop={styles.closeIconHitSlop}
              style={[styles.backIcon, launchingPoll ? { opacity: 0.4 } : null]}
            >
              <ChevronIcon direction="left" />
            </TouchableOpacity>
          ) : null}

          <Text
            testID={TestIds.change_name_modal_heading}
            style={[styles.headerText, hmsRoomStyles.headerText]}
          >
            {headerTitle ?? ('Polls' || 'Polls and Quizzes')}
          </Text>

          {selectedPoll?.state ? (
            <PollAndQuizzStateLabel state={selectedPoll?.state} />
          ) : null}
        </View>

        <TouchableOpacity
          testID={TestIds.change_name_modal_close_btn}
          onPress={handleClosePress}
          hitSlop={styles.closeIconHitSlop}
        >
          <CloseIcon />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <BottomSheet.Divider
        style={fullHeight ? styles.halfDivider : styles.divider}
      />

      {/* Content */}
      <View style={fullHeight ? styles.fullView : null}>
        {pollsStage === CreatePollStages.POLL_CONFIG ? (
          <PollsConfigAndList />
        ) : pollsStage === CreatePollStages.POLL_QUESTION_CONFIG ? (
          <PollQuestions dismissModal={dismissModal} />
        ) : pollsStage === CreatePollStages.POLL_VOTING ? (
          <PollAndQuizVoting dismissModal={dismissModal} />
        ) : null}
      </View>

      {/* Modal */}
      <PollQDeleteConfirmationSheetView />
    </View>
  );
};

const styles = StyleSheet.create({
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
