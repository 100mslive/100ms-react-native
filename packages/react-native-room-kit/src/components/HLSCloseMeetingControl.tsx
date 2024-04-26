import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { CloseIcon } from '../Icons';
import { ModalTypes } from '../utils/types';
import { useModalType } from '../hooks-util';

interface HLSPlayerControlsProps {
  onPress?: () => void;
}

export const _HLSCloseMeetingControl: React.FC<HLSPlayerControlsProps> = ({
  onPress,
}) => {
  const { handleModalVisibleType } = useModalType();

  const handleCloseBtnPress = () => {
    onPress?.();
    handleModalVisibleType(ModalTypes.LEAVE_ROOM);
  };

  return (
    <GestureDetector gesture={Gesture.Tap()}>
      <TouchableOpacity onPress={handleCloseBtnPress} style={styles.icon}>
        <CloseIcon size="medium" />
      </TouchableOpacity>
    </GestureDetector>
  );
};

export const HLSCloseMeetingControl = React.memo(_HLSCloseMeetingControl);

const styles = StyleSheet.create({
  icon: {
    padding: 4,
    alignSelf: 'flex-start',
  },
});
