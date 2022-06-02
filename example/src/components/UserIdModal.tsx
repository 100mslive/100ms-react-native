import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {COLORS, FONTS} from '../utils/theme';

export const UserIdModal = ({
  cancel,
  join,
  userName,
  screen,
}: {
  cancel: Function;
  join: Function;
  userName: any;
  screen: 'Welcome' | 'Meeting';
}) => {
  const [text, setText] = useState(userName || '');
  return (
    <View style={styles.container}>
      <View style={styles.modalContainer}>
        <Text style={styles.heading}>
          {screen === 'Welcome' ? 'Join a Meeting' : 'Change Name'}
        </Text>
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
              <Text style={styles.joinButtonText}>
                {screen === 'Welcome' ? 'Join' : 'Set'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.WHITE,
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
    ...FONTS.H6,
    color: COLORS.PRIMARY.DEFAULT,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BLACK,
    paddingLeft: 10,
    minHeight: 42,
    width: '80%',
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.PRIMARY.DEFAULT,
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
    color: COLORS.WHITE,
    ...FONTS.H6,
    paddingHorizontal: 8,
  },
  buttonTextContainer: {
    backgroundColor: COLORS.PRIMARY.DEFAULT,
    padding: 10,
    borderRadius: 5,
    width: '48%',
  },
});
