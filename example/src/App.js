import * as React from 'react';

import ReactNative, {
  StyleSheet,
  View,
  TextInput,
  Button,
  Text,
} from 'react-native';
import * as services from './service.js';
import HmsManager, { HmsView } from 'react-native-hmssdk';
import { TouchableOpacity } from 'react-native';

const callService = async (userId, roomId, role, setToken) => {
  const response = await services.fetchToken({
    userId,
    roomId,
    role,
  });

  if (response.error) {
    // TODO: handle errors from API
  } else {
    console.log('here 4');
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
  const [initialized, setInitialized] = React.useState(false);
  const [trackId, setTrackId] = React.useState('');
  const [remoteTrackIds, setRemoteTrackIds] = React.useState([]);

  const [instance, setInstance] = React.useState(null);

  const callBackSuccess = (data) => {
    if (data.trackId) {
      setTrackId(data.trackId);
    }
    if (data.remoteTracks && data.remoteTracks.length) {
      setRemoteTrackIds(data.remoteTracks);
    }
  };

  const callBackFailed = (data) => {
    console.log(data, 'data in failed');
    // TODO: failure handling here
  };

  // let ref = React.useRef();

  React.useEffect(() => {
    console.log('here 3');
    // console.log(ref.current, typeof HmssdkViewManager, 'current');
  }, []);

  const setupBuild = async () => {
    const build = await HmsManager.build();
    setInstance(build);
  };

  React.useEffect(() => {
    if (!initialized) {
      setupBuild();
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (userId !== '' && token !== '') {
      instance.addEventListener('ON_JOIN', callBackSuccess);
      instance.join({ authToken: token, userId, roomId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
                callService(text, roomId, role, setToken);
              }
            }}
          />
        </View>
      </View>
    );
  } else
    return (
      <View style={styles.container}>
        {token !== '' && <View />}
        {trackId !== '' && (
          <View style={styles.videoView}>
            <View style={styles.singleVideo}>
              <HmsView style={styles.hmsView} trackId={trackId} />
            </View>
            {remoteTrackIds.map((item) => {
              console.log('here we are', item);
              return (
                <View key={item} style={styles.singleVideo}>
                  <HmsView trackId={item} style={styles.hmsView} />
                </View>
              );
            })}
          </View>
        )}
        <View style={styles.iconContainers}>
          <TouchableOpacity
            onPress={async () => {
              setIsMute(!isMute);
              instance.setLocalPeerMute(!isMute);
              const trackIds = await instance.getTrackIds(
                ({ remoteTracks, localTrackId }) => {
                  console.log(remoteTracks, localTrackId);
                  setRemoteTrackIds(remoteTracks);
                }
              );
            }}
          >
            <Text style={styles.buttonText}>{isMute ? 'Un-Mute' : 'Mute'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSwitchCamera(!switchCamera);
              instance.switchCamera();
            }}
          >
            <Text style={styles.buttonText}>Switch-Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setMuteVideo(!muteVideo);
              instance.setLocalPeerVideoMute(!muteVideo);
            }}
          >
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
  videoView: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  singleVideo: {
    flex: 1,
    width: '100%',
    height: '50%',
  },
  hmsView: {
    height: '100%',
    width: '100%',
  },
  localVideo: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 200,
    height: 500,
  },
});
