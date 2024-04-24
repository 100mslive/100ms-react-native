import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { CloseIcon } from '../Icons';
import { ModalTypes } from '../utils/types';
import { useModalType } from '../hooks-util';

interface HLSPlayerControlsProps {}

export const _HLSCloseMeetingControl: React.FC<HLSPlayerControlsProps> = () => {
  const { handleModalVisibleType } = useModalType();

  const handleCloseBtnPress = () => {
    handleModalVisibleType(ModalTypes.LEAVE_ROOM);
  };

  return (
    <TouchableOpacity onPress={handleCloseBtnPress} style={styles.icon}>
      <CloseIcon size="medium" />
    </TouchableOpacity>
  );
};

export const HLSCloseMeetingControl = React.memo(_HLSCloseMeetingControl);

const styles = StyleSheet.create({
  icon: {
    padding: 4,
    alignSelf: 'flex-start',
  },
});
