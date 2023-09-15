import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../utils/theme';
import { CustomButton } from './CustomButton';
import { CloseIcon } from '../icons';

export interface DefaultModalProps {
  modalVisible: boolean;
  setModalVisible: any;
  animationIn?: any;
  animationOut?: any;
  modalPosiion?: 'flex-end' | 'center';
  viewStyle?: StyleProp<ViewStyle>;
  modalStyle?: StyleProp<ViewStyle>;
  backdrop?: boolean;
}

export const DefaultModal: React.FC<DefaultModalProps> = ({
  modalVisible,
  setModalVisible,
  children,
  animationIn = 'fadeIn',
  animationOut = 'fadeOut',
  modalPosiion = 'flex-end',
  backdrop = false,
  viewStyle,
  modalStyle,
}) => {
  const { left, right } = useSafeAreaInsets();
  return (
    <Modal
      useNativeDriver={true}
      useNativeDriverForBackdrop={true}
      hideModalContentWhileAnimating={true}
      animationIn={animationIn}
      animationOut={animationOut}
      avoidKeyboard={true}
      isVisible={modalVisible}
      coverScreen={true}
      hasBackdrop={backdrop}
      supportedOrientations={['portrait', 'landscape']}
      onBackdropPress={setModalVisible}
      onDismiss={setModalVisible}
      onBackButtonPress={setModalVisible}
      style={[modalStyle, { margin: 0, justifyContent: modalPosiion }]}
    >
      <View
        style={[
          styles.contentContainer,
          modalPosiion === 'flex-end' ? styles.end : styles.center,
          viewStyle,
          { marginLeft: left, marginRight: right },
        ]}
      >
        {modalPosiion === 'flex-end' && (
          <CustomButton
            onPress={setModalVisible}
            viewStyle={styles.crossButton}
            LeftIcon={<CloseIcon style={styles.crossButtonIcon} />}
          />
        )}
        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    maxHeight: '80%',
    // minHeight: '20%',
    backgroundColor: COLORS.SURFACE.DEFAULT,
  },
  end: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER.LIGHT,
    borderBottomWidth: 0,
  },
  center: {
    borderRadius: 16,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: COLORS.BORDER.LIGHT,
    alignSelf: 'center',
    width: '90%',
  },
  crossButton: {
    height: 40,
    width: 40,
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: COLORS.SURFACE.LIGHT,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  crossButtonIcon: {
    tintColor: COLORS.TEXT.HIGH_EMPHASIS,
  },
});
