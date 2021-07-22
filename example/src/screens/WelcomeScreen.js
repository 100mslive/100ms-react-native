import * as React from 'react';

import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import * as services from '../services/index';
import HmsManager, {
  HMSConfig,
  HMSUpdateListenerActions,
} from 'react-native-hmssdk';
import Feather from 'react-native-vector-icons/Feather';
import UserIdModal from '../components/UserIdModal';
import { navigate } from '../services/navigation';
import { Platform } from 'react-native';

const callService = async (userID, roomID, role, joinRoom) => {
  const response = await services.fetchToken({
    userID,
    roomID,
    role,
  });

  if (response.error) {
    // TODO: handle errors from API
  } else {
    console.log('here 4');
    joinRoom(response.token, userID);
  }
  return response;
};

const App = () => {
  const [roomID, setRoomID] = React.useState('60c894b331e717b8a9fcfccb');
  const [text, setText] = React.useState('60c894b331e717b8a9fcfccb');
  const [role, setRole] = React.useState('host');
  // const [isMute, setIsMute] = React.useState(false);
  // const [switchCamera, setSwitchCamera] = React.useState(false);
  // const [muteVideo, setMuteVideo] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);
  // const [trackId, setTrackId] = React.useState('');
  // const [remoteTrackIds, setRemoteTrackIds] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);

  const [instance, setInstance] = React.useState(null);

  const callBackSuccess = (data) => {
    console.log('here in callback success', data);
    navigate('Meeting');
  };

  const onError = (data) => {
    console.log('here on error', data);
  };

  // const callBackFailed = (data) => {
  //   console.log(data, 'data in failed');
  //   // TODO: failure handling here
  // };

  // let ref = React.useRef();

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

  const joinRoom = (token, userID) => {
    const config = new HMSConfig({ authToken: token, userID, roomID });
    instance.addEventListener(
      HMSUpdateListenerActions.ON_JOIN,
      callBackSuccess
    );

    instance.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);
    instance.join(config);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image style={styles.image} source={require('../assets/icon.png')} />
        <Text style={styles.logo}>100ms</Text>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.heading}>Join a Meeting</Text>
        <View style={styles.textInputContainer}>
          <TextInput
            onChangeText={(value) => {
              setText(value);
            }}
            placeholderTextColor="#454545"
            placeholder="Enter room ID"
            style={styles.input}
            defaultValue={roomID}
          />
        </View>
        <TouchableOpacity
          style={styles.joinButtonContainer}
          onPress={() => {
            if (text !== '') {
              setRoomID(text);
              console.log('here');
              setModalVisible(true);
              // callService(text, roomID, role, setToken);
            }
          }}
        >
          <Feather name="video" style={styles.videoIcon} size={20} />
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      </View>
      {modalVisible && (
        <UserIdModal
          join={(userID) => {
            callService(userID, roomID, role, joinRoom);
            setModalVisible(false);
          }}
          cancel={() => setModalVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  headerContainer: {
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    marginBottom: '65%',
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontWeight: '700',
    color: '#4578e0',
    fontSize: 44,
  },
  image: {
    width: 60,
    height: 60,
  },
  heading: {
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 20,
    fontWeight: '500',
    color: '#4578e0',
  },
  box: {
    width: '100%',
    height: '100%',
    marginVertical: 20,
  },
  inputContainer: {
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    paddingLeft: 10,
    minHeight: 32,
  },
  joinButtonContainer: {
    padding: 12,
    marginTop: 20,
    backgroundColor: '#4578e0',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    color: 'white',
    marginRight: 8,
  },
  joinButtonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    paddingRight: 8,
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

  leaveButtonText: {
    padding: 10,
    borderRadius: 10,
    color: '#efefef',
    backgroundColor: '#de4578',
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

export default App;
