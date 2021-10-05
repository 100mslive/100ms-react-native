import React from 'react';
import {Modal, StyleSheet, Text, View, TouchableOpacity} from 'react-native';

const App = ({
  modalVisible,
  setModalVisible,
  title,
  message,
  buttons,
}: {
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
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>{title}</Text>
          {message.length > 0 && <Text>{message}</Text>}
          {buttons.map((button, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                onRequestClose();
                button.onPress && button.onPress();
              }}
              style={styles.buttonItem}>
              <Text
                style={[
                  styles.buttonItemText,
                  button.type === 'cancel' && {color: 'red'},
                ]}>
                {button.text}
              </Text>
            </TouchableOpacity>
          ))}
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
  buttonItemText: {
    alignSelf: 'center',
    color: 'blue',
  },
});

export default App;
