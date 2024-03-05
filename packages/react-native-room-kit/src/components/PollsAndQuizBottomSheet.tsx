import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';

import { BottomSheet } from './BottomSheet';
import { useHMSRoomStyleSheet, useModalType } from '../hooks-util';
import { useHeaderHeight } from './Header';
import { useIsLandscapeOrientation } from '../utils/dimension';
import { PollsAndQuizzesModalContent } from './PollsAndQuizzesModalContent';
import { ModalTypes } from '../utils/types';
import { resetNavigationStack } from '../redux/actions';

export const PollsAndQuizBottomSheet = () => {
  const dispatch = useDispatch();
  const headerHeight = useHeaderHeight();
  const isLandscapeOrientation = useIsLandscapeOrientation();
  const {
    modalVisibleType: modalVisible,
    handleModalVisibleType: setModalVisible,
  } = useModalType();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    contentContainer: {
      backgroundColor: theme.palette.surface_dim,
    },
  }));

  const dismissModal = () => {
    setModalVisible(ModalTypes.DEFAULT);
    dispatch(resetNavigationStack());
  };

  const containerStyles = [
    styles.bottomSheet,
    {
      marginTop: isLandscapeOrientation
        ? 0
        : headerHeight + (Platform.OS === 'android' ? 24 : 0),
    },
    hmsRoomStyles.contentContainer,
  ];

  return (
    <BottomSheet
      // fullWidth={true}
      dismissModal={dismissModal}
      isVisible={modalVisible === ModalTypes.POLLS_AND_QUIZZES}
      avoidKeyboard={true}
      containerStyle={containerStyles}
      bottomOffsetSpace={0}
    >
      <PollsAndQuizzesModalContent dismissModal={dismissModal} />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    flex: 1,
  },
});
