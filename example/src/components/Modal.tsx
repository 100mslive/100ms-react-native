import React, {ReactNode} from 'react';
import {Modal, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {COLORS} from '../utils/theme';

export const CustomModal = ({
  modalVisible,
  setModalVisible,
  title,
  buttons,
  children,
}: {
  modalVisible: boolean;
  setModalVisible: any;
  title: String;
  children: ReactNode;
  buttons: Array<{text: string; type?: string; onPress?: Function}>;
}) => {
  const onRequestClose: any = () => {
    setModalVisible(!modalVisible);
  };
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={onRequestClose}>
      <View
        style={styles.centeredView}
        onTouchEnd={() => {
          onRequestClose();
        }}>
        <View
          style={styles.modalView}
          onTouchEnd={e => {
            e.stopPropagation();
          }}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View>{children}</View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onRequestClose}>
              <Text numberOfLines={1} style={styles.closeButtonItemText}>
                {buttons[0].text}
              </Text>
            </TouchableOpacity>
            {buttons[1] && (
              <TouchableOpacity
                style={[styles.okButton]}
                onPress={() => {
                  onRequestClose();
                  buttons[1]?.onPress && buttons[1].onPress();
                }}>
                <Text numberOfLines={1} style={styles.okButtonItemText}>
                  {buttons[1].text}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.OVERLAY,
  },
  modalView: {
    width: '80%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  titleContainer: {
    borderBottomColor: COLORS.BORDER.DEFAULT,
    borderBottomWidth: 1,
  },
  title: {
    alignSelf: 'center',
    padding: 14,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  buttonItem: {
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER.DEFAULT,
    padding: 12,
  },
  closeButtonItemText: {
    alignSelf: 'center',
    color: COLORS.INDICATORS.ERROR,
    fontFamily: 'Inter-Bold',
  },
  okButtonItemText: {
    alignSelf: 'center',
    color: COLORS.PRIMARY.DEFAULT,
    fontFamily: 'Inter-Bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopColor: COLORS.BORDER.DEFAULT,
    borderTopWidth: 1,
  },
  okButton: {
    flex: 1,
    padding: 12,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.BORDER.DEFAULT,
  },
  closeButton: {
    flex: 1,
    padding: 12,
  },
});
