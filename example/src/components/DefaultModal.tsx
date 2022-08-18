import React, {ReactNode} from 'react';
import {
  Modal,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {COLORS} from '../utils/theme';
import {CustomButton} from './CustomButton';

export const DefaultModal = ({
  modalVisible,
  setModalVisible,
  children,
  animationType = 'slide',
  transparent = true,
  overlay = true,
  modalPosiion = 'flex-end',
  viewStyle,
  modalStyle,
}: {
  modalVisible: boolean;
  setModalVisible: any;
  children: ReactNode;
  animationType?: 'none' | 'slide' | 'fade';
  transparent?: boolean;
  overlay?: boolean;
  modalPosiion?: 'flex-end' | 'center';
  viewStyle?: StyleProp<ViewStyle>;
  modalStyle?: StyleProp<ViewStyle>;
}) => {
  const {left, right} = useSafeAreaInsets();
  return (
    <Modal
      animationType={animationType}
      transparent={transparent}
      visible={modalVisible}
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={setModalVisible}
      style={modalStyle}>
      <View
        style={[
          styles.container,
          {
            justifyContent: modalPosiion,
          },
          !overlay && styles.overlay,
        ]}
        onTouchEnd={setModalVisible}>
        <KeyboardAvoidingView
          enabled={Platform.OS === 'ios'}
          behavior="padding"
          style={[
            styles.contentContainer,
            modalPosiion === 'flex-end' ? styles.end : styles.center,
            viewStyle,
            {marginLeft: left, marginRight: right},
          ]}
          onTouchEnd={e => e.stopPropagation()}>
          {modalPosiion === 'flex-end' && (
            <CustomButton
              onPress={setModalVisible}
              viewStyle={styles.crossButton}
              LeftIcon={
                <MaterialCommunityIcons
                  name="close"
                  style={styles.crossButtonIcon}
                  size={24}
                />
              }
            />
          )}
          {children}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
  },
  overlay: {
    backgroundColor: 'transparent',
  },
  contentContainer: {
    maxHeight: '80%',
    // minHeight: '20%',
    backgroundColor: COLORS.SURFACE.DEFAULT,
  },
  end: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
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
    right: 28,
    top: 28,
    backgroundColor: COLORS.SURFACE.LIGHT,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  crossButtonIcon: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
});
