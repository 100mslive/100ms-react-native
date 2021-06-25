import * as React from 'react';

import {
  StyleSheet,
  View,
  TextInput,
  Button,
  Dimensions,
  Text,
} from 'react-native';
import * as services from './service.js';
import HmssdkViewManager from 'react-native-hmssdk';
import { TouchableOpacity } from 'react-native';

const { width, height } = Dimensions.get('window');

const callService = async (userId, roomId, role, setToken) => {
  const response = await services.fetchToken({
    userId,
    roomId,
    role,
  });

  if (response.error) {
    // TODO: handle errors from API
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
  const [isMute, setIsMute] = React.useState(false);
  const [switchCamera, setSwitchCamera] = React.useState(false);
  const [muteVideo, setMuteVideo] = React.useState(false);

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
            color="#32a8d2"
            userId={userId}
            roomId={roomId}
            authToken={token}
            style={styles.box}
            layout={{ width, height }}
            isMute={isMute}
            switchCamera={switchCamera}
            muteVideo={muteVideo}
          />
        )}
        <View style={styles.iconContainers}>
          <TouchableOpacity onPress={() => setIsMute(!isMute)}>
            <Text style={styles.buttonText}>{isMute ? 'Un-Mute' : 'Mute'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSwitchCamera(!switchCamera)}>
            <Text style={styles.buttonText}>Switch-Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMuteVideo(!muteVideo)}>
            <Text style={styles.buttonText}>
              {muteVideo ? 'Camera-On' : 'Camera-Off'}
            </Text>
          </TouchableOpacity>
        </View>
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
  iconContainers: {
    display: 'flex',
    flexDirection: 'row',
    position: 'absolute',
    justifyContent: 'space-around',
    bottom: 0,
    paddingBottom: 26,
    width: '100%',
    left: 0,
    right: 0,
    zIndex: 500,
  },

  buttonText: {
    backgroundColor: '#4578e0',
    padding: 10,
    borderRadius: 10,
    color: '#efefef',
  },
});
