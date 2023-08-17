import * as React from 'react';
import Modal from 'react-native-modal';
import type { ReactNativeModal } from 'react-native-modal';
import { StyleSheet } from 'react-native';

import { useHMSRoomColorPalette } from '../hooks-util';

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type BottomSheetProps = WithRequired<Partial<ReactNativeModal['props']>, 'isVisible'> & {
  // closes modal and no action will be taken after modal has been closed
  dismissModal(): void;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ dismissModal, style, children, ...resetProps }) => {
  const { background_dim: backgroundDimColor } = useHMSRoomColorPalette();

  return (
    <Modal
      {...resetProps}
      animationIn={resetProps.animationIn ?? 'slideInUp'}
      animationOut={resetProps.animationOut ?? 'slideOutDown'}
      backdropColor={resetProps.backdropColor ?? backgroundDimColor}
      backdropOpacity={resetProps.backdropOpacity ?? 0.3}
      onBackButtonPress={resetProps.onBackButtonPress ?? dismissModal}
      onBackdropPress={resetProps.onBackdropPress ?? dismissModal}
      useNativeDriver={resetProps.useNativeDriver ?? true}
      useNativeDriverForBackdrop={resetProps.useNativeDriverForBackdrop ?? true}
      hideModalContentWhileAnimating={resetProps.hideModalContentWhileAnimating ?? true}
      style={[styles.modal, style]}
    >
      {children}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  closeIconHitSlop: {
    bottom: 16,
    left: 16,
    right: 16,
    top: 16,
  },
});
