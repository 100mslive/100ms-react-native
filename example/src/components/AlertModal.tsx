import React from 'react';
import {Modal, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {getVersion} from 'react-native-device-info';

export const AlertModal = ({
  modalVisible,
  setModalVisible,
  title,
  message,
  buttons,
  screen,
}: {
  screen?: String;
  modalVisible: boolean;
  setModalVisible: any;
  title: String;
  message: String;
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
      onRequestClose={onRequestClose}>
      <View
        style={styles.centeredView}
        onTouchEnd={() => {
          onRequestClose();
        }}>
        <View style={styles.modalView}>
          <Text style={styles.title}>{title}</Text>
          {message !== undefined && message.length > 0 && (
            <Text>{message}</Text>
          )}
          {buttons.map((button, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                button.onPress && button.onPress();
              }}
              style={[
                styles.buttonItem,
                index === buttons.length - 1 && styles.buttonItemLast,
              ]}>
              <Text
                style={[
                  styles.buttonItemText,
                  button.type === 'cancel' && styles.red,
                ]}>
                {button.text}
              </Text>
            </TouchableOpacity>
          ))}
          {screen !== undefined && screen === 'welcome' && (
            <Text
              style={styles.title}>{`App Version :    ${getVersion()}`}</Text>
          )}
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
    backgroundColor: '#25313780',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
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
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  title: {
    alignSelf: 'center',
    padding: 16,
    fontWeight: 'bold',
  },
  buttonItem: {
    borderTopWidth: 1,
    borderTopColor: 'lightgrey',
    padding: 12,
  },
  buttonItemLast: {
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
  },
  buttonItemText: {
    alignSelf: 'center',
    color: 'blue',
  },
  red: {
    color: 'red',
  },
});
