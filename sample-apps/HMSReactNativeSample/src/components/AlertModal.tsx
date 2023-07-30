import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {getVersion} from 'react-native-device-info';
import {COLORS} from '../utils/theme';

export const AlertModal = ({
  modalVisible,
  setModalVisible,
  title,
  buttons,
  screen,
}: {
  screen?: String;
  modalVisible: boolean;
  setModalVisible: any;
  title: String;
  buttons: Array<{text: String; type?: String; onPress?: Function}>;
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
      onRequestClose={onRequestClose}
    >
      <View
        style={styles.centeredView}
        onTouchEnd={() => {
          onRequestClose();
        }}
      >
        <View
          style={styles.modalView}
          onTouchEnd={e => {
            e.stopPropagation();
          }}
        >
          <ScrollView showsVerticalScrollIndicator indicatorStyle="white">
            <Text style={styles.title}>{title}</Text>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  onRequestClose();
                  button.onPress && button.onPress();
                }}
                style={[
                  styles.buttonItem,
                  index === buttons.length - 1 && styles.buttonItemLast,
                ]}
              >
                <Text
                  style={[
                    styles.buttonItemText,
                    button.type === 'cancel' && styles.cancel,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
            {screen !== undefined && screen === 'welcome' && (
              <Text
                style={styles.title}
              >{`App Version :    ${getVersion()}`}</Text>
            )}
          </ScrollView>
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
    maxHeight: '80%',
    backgroundColor: COLORS.SURFACE.DEFAULT,
    borderWidth: 1,
    borderColor: COLORS.BORDER.LIGHT,
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
  title: {
    alignSelf: 'center',
    padding: 14,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    textTransform: 'capitalize',
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
  buttonItem: {
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER.DEFAULT,
    padding: 10,
  },
  buttonItemLast: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER.DEFAULT,
  },
  buttonItemText: {
    alignSelf: 'center',
    color: COLORS.PRIMARY.DEFAULT,
    fontFamily: 'Inter-Bold',
    textTransform: 'capitalize',
  },
  cancel: {
    color: COLORS.INDICATORS.ERROR,
  },
});
