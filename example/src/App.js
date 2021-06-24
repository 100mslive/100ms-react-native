import * as React from 'react';

import { StyleSheet, View, TextInput, Button, Dimensions } from 'react-native';
import * as services from './service.js';
import HmssdkViewManager from 'react-native-hmssdk';

const { width, height } = Dimensions.get('window');

const callService = async (userId, roomId, role, setToken) => {
  const response = await services.fetchToken({
    userId,
    roomId,
    role,
  });

  if (response.error) {
    console.log(response.error);
  } else {
    setToken(response.token);
  }
  return response;
};

export default function App() {
  const [userId, setUserId] = React.useState('');
  const [text, setText] = React.useState('');
  const [roomId, setRoomId] = React.useState('60c894b331e717b8a9fcfccb');
  const [role, setRole] = React.useState('host');
  const [token, setToken] = React.useState('');

  console.log(token, role, roomId, userId, 'token role roomId userId');

  if (userId === '') {
    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            onChangeText={(value) => {
              setText(value);
            }}
            placeholderTextColor="#454545"
            placeholder="Enter user ID"
            style={styles.input}
          />
          <Button
            title="Submit"
            onPress={() => {
              if (text !== '') {
                setUserId(text);
                callService(userId, roomId, role, setToken);
              }
            }}
          />
        </View>
      </View>
    );
  } else
    return (
      <View style={styles.container}>
        {token !== '' && (
          <HmssdkViewManager
            color="#32a852"
            userId={userId}
            roomId={roomId}
            authToken={token}
            style={styles.box}
            layout={{ width, height }}
          />
        )}
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: '100%',
    height: '100%',
    marginVertical: 20,
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  input: {
    width: '70%',
    borderWidth: 1,
    borderColor: 'black',
    paddingLeft: 10,
  },
});
