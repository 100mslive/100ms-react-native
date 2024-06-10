import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { BottomSheet } from './BottomSheet';
import { useHMSRoomStyleSheet, useModalType } from '../hooks-util';
import { useHeaderHeight } from './Header';
import { useIsLandscapeOrientation } from '../utils/dimension';
import { ModalTypes } from '../utils/types';
import type { RootState } from '../redux';
import { VirtualBackgroundModalContent } from './VirtualBackgroundModalContent';

export const VirtualBackgroundBottomSheet = () => {
  const headerHeight = useHeaderHeight();
  const isLandscapeOrientation = useIsLandscapeOrientation();
  const isLocalVideoMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalVideoMuted
  );
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
      dismissModal={dismissModal}
      isVisible={
        !isLocalVideoMuted && modalVisible === ModalTypes.VIRTUAL_BACKGROUND
      }
      containerStyle={containerStyles}
      bottomOffsetSpace={0}
    >
      <VirtualBackgroundModalContent dismissModal={dismissModal} />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    flex: 1,
  },
});
