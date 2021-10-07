import React from 'react';
import {Modal, StyleSheet, Text, View, TouchableOpacity} from 'react-native';

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
  children: Element;
  buttons: [
    {text: String; onPress?: Function},
    {text: String; onPress?: Function}?,
  ];
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
  titleContainer: {
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1,
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
  closeButtonItemText: {
    alignSelf: 'center',
    color: 'red',
  },
  okButtonItemText: {
    alignSelf: 'center',
    color: 'blue',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopColor: 'lightgrey',
    borderTopWidth: 1,
  },
  okButton: {
    flex: 1,
    padding: 12,
    borderLeftWidth: 1,
    borderLeftColor: 'lightgrey',
  },
  closeButton: {
    flex: 1,
    padding: 12,
  },
});
