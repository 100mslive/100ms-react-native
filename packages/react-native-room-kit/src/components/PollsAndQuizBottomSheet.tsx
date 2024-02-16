import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { BottomSheet } from './BottomSheet';
import {
  useHMSRoomStyleSheet,
  useIsHLSViewer,
  useModalType,
} from '../hooks-util';
import { useHeaderHeight } from './Header';
import { useIsLandscapeOrientation } from '../utils/dimension';
import { PollsAndQuizzesModalContent } from './PollsAndQuizzesModalContent';
import { ModalTypes } from '../utils/types';
import type { RootState } from '../redux';
import { CreatePollStages } from '../redux/actionTypes';
import { visiblePollsSelector } from '../utils/functions';

export const PollsAndQuizBottomSheet = () => {
  const headerHeight = useHeaderHeight();
  const isLandscapeOrientation = useIsLandscapeOrientation();
  const {
    modalVisibleType: modalVisible,
    handleModalVisibleType: setModalVisible,
  } = useModalType();

  const isPollQuestionStage = useSelector(
    (state: RootState) =>
      state.polls.stage === CreatePollStages.POLL_QUESTION_CONFIG
  );
  const isHLSViewer = useIsHLSViewer();
  const havePolls = useSelector(
    (state: RootState) =>
      visiblePollsSelector(
        Object.values(state.polls.polls),
        isHLSViewer,
        state.polls.cuedPollIds
      ).length > 0
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    contentContainer: {
      backgroundColor: theme.palette.surface_dim,
    },
  }));

  const dismissModal = () => setModalVisible(ModalTypes.DEFAULT);

  const fullHeight = isPollQuestionStage || havePolls;
  const containerStyles = fullHeight
    ? [
        styles.bottomSheet,
        {
          marginTop: isLandscapeOrientation
            ? 0
            : headerHeight + (Platform.OS === 'android' ? 24 : 0),
        },
        hmsRoomStyles.contentContainer,
      ]
    : [hmsRoomStyles.contentContainer];

  return (
    <BottomSheet
      // fullWidth={true}
      dismissModal={dismissModal}
      isVisible={modalVisible === ModalTypes.POLLS_AND_QUIZZES}
      avoidKeyboard={true}
      containerStyle={containerStyles}
      bottomOffsetSpace={fullHeight ? 0 : undefined}
    >
      <PollsAndQuizzesModalContent
        fullHeight={fullHeight}
        dismissModal={dismissModal}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    flex: 1,
  },
});
