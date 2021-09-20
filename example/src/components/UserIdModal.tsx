import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const UserIdModal = ({
  cancel,
  join,
  user,
}: {
  cancel: Function;
  join: Function;
  user: any;
}) => {
  const [text, setText] = useState(user?.userName ? user.userName : '');
  return (
    <View style={styles.container}>
      <View style={styles.modalContainer}>
        <Text style={styles.heading}>Join a Meeting</Text>
        <View style={styles.inputContainer}>
          <TextInput
            onChangeText={value => {
              setText(value);
            }}
            placeholderTextColor="#454545"
            placeholder="Enter user ID"
            style={styles.input}
            defaultValue={text}
            autoFocus={true}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonTextContainer}
              onPress={() => {
                cancel();
              }}>
              <Text style={styles.joinButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonTextContainer}
              onPress={() => {
                if (text !== '') {
                  join(text);
                }
              }}>
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default UserIdModal;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(34, 34, 34, 0.3)',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    marginBottom: 185,
    marginLeft: 42,
    marginRight: 42,
    borderRadius: 40,
    paddingVertical: 10,
  },
  heading: {
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 10,
    fontSize: 20,
    fontWeight: '500',
    color: '#4578e0',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    paddingLeft: 10,
    minHeight: 42,
    width: '80%',
    marginBottom: 16,
    color: '#4578e0',
  },
  inputContainer: {
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingBottom: 12,
    width: '80%',
    justifyContent: 'space-between',
  },
  joinButtonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    paddingHorizontal: 8,
  },
  buttonTextContainer: {
    backgroundColor: '#4578e0',
    padding: 10,
    borderRadius: 5,
    width: '48%',
  },
});
