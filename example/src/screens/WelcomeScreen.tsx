import * as React from 'react';

import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {connect} from 'react-redux';
import * as services from '../services/index';
import HmsManager, {
  HMSConfig,
  HMSUpdateListenerActions,
} from '@100mslive/react-native-hms';
import Feather from 'react-native-vector-icons/Feather';
import UserIdModal from '../components/UserIdModal';
import PreviewModal from '../components/PreviewModal';
import {useNavigation} from '@react-navigation/native';
import {setAudioVideoState, saveUserData} from '../redux/actions/index';
import {PERMISSIONS, RESULTS, requestMultiple} from 'react-native-permissions';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {AppStackParamList} from '../navigator';

type HMSConfigType = {
  username?: string;
  authToken?: string;
  roomID?: string;
  userID?: string;
};

type WelcomeProps = {
  setAudioVideoStateRequest: Function;
  saveUserDataRequest: Function;
  state: any;
};

type WelcomeScreenProp = StackNavigationProp<
  AppStackParamList,
  'WelcomeScreen'
>;

const callService = async (
  userID: string,
  roomID: string,
  role: string,
  joinRoom: Function,
) => {
  const response = await services.fetchToken({
    userID,
    roomID,
    role,
  });

  if (response.error) {
    // TODO: handle errors from API
  } else {
    joinRoom(response.token, userID);
  }
  return response;
};

const App = ({
  setAudioVideoStateRequest,
  saveUserDataRequest,
  state,
}: WelcomeProps) => {
  const [roomID, setRoomID] = React.useState('60f05a0a574fe6920b2560ba');
  const [text, setText] = React.useState('60f05a0a574fe6920b2560ba');
  const [role] = React.useState('host');
  const [initialized, setInitialized] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [previewModal, setPreviewModal] = React.useState(false);
  const [localVideoTrackId, setLocalVideoTrackId] = React.useState('');
  const [config, setConfig] = React.useState<HMSConfigType | null>(null);
  const [audio, setAudio] = React.useState(true);
  const [video, setVideo] = React.useState(true);

  const navigate = useNavigation<WelcomeScreenProp>().navigate;

  const [instance, setInstance] = React.useState<any>(null);

  const previewSuccess = (data: any) => {
    console.log('here in callback success', data);
    const videoTrackId = data?.previewTracks?.videoTrack?.trackId;

    if (videoTrackId) {
      setLocalVideoTrackId(videoTrackId);
      setPreviewModal(true);
      setAudioVideoStateRequest({audioState: true, videoState: true});
    }
  };

  const onError = (data: any) => {
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

  const checkPermissions = (token: string, userID: string) => {
    if (Platform.OS === 'android') {
      requestMultiple([
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
      ])
        .then(results => {
          if (
            results['android.permission.CAMERA'] === RESULTS.GRANTED &&
            results['android.permission.RECORD_AUDIO'] === RESULTS.GRANTED
          ) {
            previewRoom(token, userID);
          }
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      previewRoom(token, userID);
    }
  };

  const previewRoom = (token: string, userID: string) => {
    const HmsConfig = new HMSConfig({
      authToken: token,
      userID,
      roomID,
      username: userID,
    });
    instance.addEventListener(
      HMSUpdateListenerActions.ON_PREVIEW,
      previewSuccess,
    );
    saveUserDataRequest({userName: userID, roomID: roomID});
    instance.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);
    instance.preview(HmsConfig);
    setConfig(HmsConfig);
  };

  const joinRoom = () => {
    setPreviewModal(false);
    instance.join(config);
    navigate('Meeting');
    setAudioVideoStateRequest({audioState: audio, videoState: video});
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
            onChangeText={value => {
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
              setModalVisible(true);
              // callService(text, roomID, role, setToken);
            }
          }}>
          <Feather name="video" style={styles.videoIcon} size={20} />
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      </View>
      {modalVisible && (
        <UserIdModal
          join={(userID: string) => {
            callService(userID, roomID, role, checkPermissions);
            setModalVisible(false);
          }}
          cancel={() => setModalVisible(false)}
          user={state.user}
        />
      )}
      {previewModal && (
        <PreviewModal
          setAudio={(value: boolean) => {
            setAudio(!value);
            instance?.localPeer?.localAudioTrack().setMute(value);
          }}
          setVideo={(value: boolean) => {
            setVideo(!value);
            instance?.localPeer?.localVideoTrack().setMute(value);
          }}
          trackId={localVideoTrackId}
          join={joinRoom}
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
  textInputContainer: {},
});

const mapDispatchToProps = (dispatch: Function) => ({
  setAudioVideoStateRequest: (data: {
    audioState: boolean;
    videoState: boolean;
  }) => dispatch(setAudioVideoState(data)),
  saveUserDataRequest: (data: {userName: String; roomID: String}) =>
    dispatch(saveUserData(data)),
});
const mapStateToProps = (state: any) => {
  return {
    state: state,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(App);
