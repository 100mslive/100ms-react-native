import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from './BottomSheet';
import { useModalType } from '../hooks-util';
import { ModalTypes } from '../utils/types';
import { ParticipantsModal } from './ParticipantsModal';
import { HEADER_HEIGHT } from './Header';

export const _ParticipantsBottomSheet = () => {
  const { top: topSafeArea } = useSafeAreaInsets();

  const {
    modalVisibleType: modalVisible,
    handleModalVisibleType: setModalVisible,
  } = useModalType();

  const dismissModal = React.useCallback(
    () => setModalVisible(ModalTypes.DEFAULT),
    [setModalVisible]
  );

  return (
    <BottomSheet
      avoidKeyboard={true}
      isVisible={modalVisible === ModalTypes.PARTICIPANTS}
      dismissModal={dismissModal}
      containerStyle={[
        styles.sheet,
        { marginTop: topSafeArea + HEADER_HEIGHT },
      ]}
    >
      <ParticipantsModal dismissModal={dismissModal} />
    </BottomSheet>
  );
};

export const ParticipantsBottomSheet = React.memo(_ParticipantsBottomSheet);

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: undefined,
    paddingBottom: 0,
  },
});
