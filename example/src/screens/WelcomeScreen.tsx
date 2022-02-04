import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Dimensions,
  Alert,
  Linking,
  AppState,
  PermissionsAndroid,
} from 'react-native';
import {connect} from 'react-redux';
import HmsManager, {
  HMSAudioTrack,
  HMSConfig,
  HMSLocalPeer,
  HMSRoom,
  HMSUpdateListenerActions,
  HMSVideoTrack,
  HMSLogger,
  HMSLogLevel,
  HMSSDK,
  HMSAudioTrackSettings,
  HMSAudioCodec,
  HMSVideoTrackSettings,
  HMSVideoCodec,
  HMSTrackSettings,
  HMSException,
  HMSCameraFacing,
  HMSVideoResolution,
} from '@100mslive/react-native-hms';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {PERMISSIONS, RESULTS, requestMultiple} from 'react-native-permissions';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Toast from 'react-native-simple-toast';
import {getModel} from 'react-native-device-info';
import crashlytics from '@react-native-firebase/crashlytics';
import RNFetchBlob from 'rn-fetch-blob';
import {getVersion} from 'react-native-device-info';

import * as services from '../services/index';
import {UserIdModal, PreviewModal, AlertModal} from '../components';
import {
  setAudioVideoState,
  saveUserData,
  updateHmsReference,
} from '../redux/actions/index';
import {getThemeColour, writeFile} from '../utils/functions';
import type {AppStackParamList} from '../navigator';
import type {RootState} from '../redux';

type WelcomeProps = {
  setAudioVideoStateRequest: Function;
  saveUserDataRequest: Function;
  updateHms: Function;
  state: RootState;
  hmsInstance: HMSSDK | undefined;
};

type WelcomeScreenProp = StackNavigationProp<
  AppStackParamList,
  'WelcomeScreen'
>;

type ButtonState = 'Active' | 'Loading';

const callService = async (
  userID: string,
  roomID: string,
  joinRoom: Function,
  apiFailed: Function,
) => {
  const response = await services.fetchToken({
    userID,
    roomID,
  });

  if (response.error || !response?.token) {
    apiFailed(response);
  } else {
    joinRoom(response.token, userID);
  }
  return response;
};

const tokenFromLinkService = async (
  code: string,
  subdomain: string,
  userID: string,
  fetchTokenFromLinkSuccess: Function,
  apiFailed: Function,
) => {
  const response = await services.fetchTokenFromLink({
    code,
    subdomain,
    userID,
  });

  if (response.error || !response?.token) {
    apiFailed(response);
  } else {
    if (subdomain.search('.qa-') >= 0) {
      fetchTokenFromLinkSuccess(
        response.token,
        userID,
        'https://qa-init.100ms.live/init',
      );
    } else {
      fetchTokenFromLinkSuccess(response.token, userID);
    }
  }
};

let config: HMSConfig | null = null;

const App = ({
  setAudioVideoStateRequest,
  saveUserDataRequest,
  state,
  updateHms,
  hmsInstance,
}: WelcomeProps) => {
  const [orientation, setOrientation] = useState<boolean>(true);
  const [roomID, setRoomID] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [initialized, setInitialized] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [previewModal, setPreviewModal] = useState<boolean>(false);
  const [localVideoTrackId, setLocalVideoTrackId] = useState<string>('');
  const [audio, setAudio] = useState<boolean>(true);
  const [video, setVideo] = useState<boolean>(true);
  const [buttonState, setButtonState] = useState<ButtonState>('Active');
  const [previewButtonState, setPreviewButtonState] =
    useState<ButtonState>('Active');
  const [instance, setInstance] = useState<HmsManager | null>(null);
  const [videoAllowed, setVideoAllowed] = useState<boolean>(false);
  const [audioAllowed, setAudioAllowed] = useState<boolean>(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [skipPreview, setSkipPreview] = useState(false);
  const [mirrorLocalVideo, setMirrorLocalVideo] = useState(false);

  const navigate = useNavigation<WelcomeScreenProp>().navigate;

  const previewSuccess = (data: {
    localPeer: HMSLocalPeer;
    room: HMSRoom;
    previewTracks: {audioTrack: HMSAudioTrack; videoTrack: HMSVideoTrack};
  }) => {
    const localVideoAllowed =
      instance?.localPeer?.role?.publishSettings?.allowed?.includes('video');

    const localAudioAllowed =
      instance?.localPeer?.role?.publishSettings?.allowed?.includes('audio');

    setVideoAllowed(localVideoAllowed ? localVideoAllowed : false);
    setAudioAllowed(localAudioAllowed ? localAudioAllowed : false);

    const videoTrackId = data?.previewTracks?.videoTrack?.trackId;

    if (localVideoAllowed && localAudioAllowed) {
      setLocalVideoTrackId(videoTrackId);
      setPreviewModal(true);
    } else if (localVideoAllowed) {
      setLocalVideoTrackId(videoTrackId);
      setPreviewModal(true);
      setAudio(false);
    } else if (localAudioAllowed) {
      setPreviewModal(true);
      setVideo(false);
    } else {
      joinRoom();
    }
    setButtonState('Active');
  };

  const onError = (data: HMSException) => {
    console.log('here on error', data);
    Toast.showWithGravity(
      data?.error?.message || 'Something went wrong',
      Toast.LONG,
      Toast.TOP,
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTrackSettings = () => {
    let audioSettings = new HMSAudioTrackSettings({
      codec: HMSAudioCodec.opus,
      maxBitrate: 32,
      trackDescription: 'Simple Audio Track',
    });
    let videoSettings = new HMSVideoTrackSettings({
      codec: HMSVideoCodec.VP8,
      maxBitrate: 512,
      maxFrameRate: 25,
      cameraFacing: HMSCameraFacing.FRONT,
      trackDescription: 'Simple Video Track',
      resolution: new HMSVideoResolution({height: 180, width: 320}),
    });

    const listOfFaultyDevices = [
      'Pixel',
      'Pixel XL',
      'Moto G5',
      'Moto G (5S) Plus',
      'Moto G4',
      'TA-1053',
      'Mi A1',
      'Mi A2',
      'E5823', // Sony z5 compact
      'Redmi Note 5',
      'FP2', // Fairphone FP2
      'MI 5',
    ];
    const deviceModal = getModel();

    return new HMSTrackSettings({
      video: videoSettings,
      audio: audioSettings,
      useHardwareEchoCancellation: listOfFaultyDevices.includes(deviceModal)
        ? true
        : false,
    });
  };

  const getCrashlyticsLog = ({message, data}: {message: string; data: any}) => {
    crashlytics().log(message.toString() + ' ' + JSON.stringify(data));
  };

  const setupBuild = async () => {
    /**
     * Regular Usage:
     * const build = await HmsManager.build();
     *
     * Advanced Usage: Pass custom track settings while building HmsManager instance
     * const trackSettings = getTrackSettings();
     * const build = await HmsManager.build({ trackSettings });
     */

    const build = await HmsManager.build();
    const logger = new HMSLogger();
    logger.updateLogLevel(HMSLogLevel.VERBOSE, true);
    logger.setLogListener(getCrashlyticsLog);
    build.setLogger(logger);
    setInstance(build);
    updateHms({hmsInstance: build});
  };

  useEffect(() => {
    Linking.getInitialURL().then(url => {
      if (url) {
        setRoomID(url);
        setText(url);
      } else {
        setRoomID('https://yogi.app.100ms.live/preview/nih-bkn-vek');
        setText('https://yogi.app.100ms.live/preview/nih-bkn-vek');
      }
    });
    if (!initialized) {
      setupBuild();
      setInitialized(true);
    }

    AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        Linking.getInitialURL().then(url => {
          if (url) {
            setRoomID(url);
            setText(url);
          } else {
            setRoomID('https://yogi.app.100ms.live/preview/nih-bkn-vek');
            setText('https://yogi.app.100ms.live/preview/nih-bkn-vek');
          }
        });
      }
    });

    Dimensions.addEventListener('change', () => {
      setOrientation(!orientation);
    });

    return () => {
      hmsInstance?.destroy();
      Dimensions.removeEventListener('change', () => {
        setOrientation(!orientation);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkPermissionsForLink = (
    token: string,
    userID: string,
    endpoint: string | undefined = undefined,
  ) => {
    if (Platform.OS === 'android') {
      requestMultiple([
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
      ])
        .then(() => {
          previewWithLink(token, userID, endpoint);
        })
        .catch(error => {
          console.log(error);
          setButtonState('Active');
        });
    } else {
      previewWithLink(token, userID, endpoint);
    }
  };

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
          setButtonState('Active');
        });
    } else {
      previewRoom(token, userID);
    }
  };

  const apiFailed = (error: any) => {
    setButtonState('Active');
    Alert.alert('Fetching token failed', error?.msg || 'Something went wrong');
  };

  const previewRoom = (token: string, userID: string) => {
    const HmsConfig = new HMSConfig({
      authToken: token,
      username: userID,
    });
    config = HmsConfig;

    instance?.addEventListener(
      HMSUpdateListenerActions.ON_PREVIEW,
      previewSuccess,
    );
    saveUserDataRequest({
      userName: userID,
      roomID: roomID,
      mirrorLocalVideo: !mirrorLocalVideo,
    });
    instance?.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);
    if (skipPreview) {
      setSkipPreview(false);
      joinRoom();
    } else {
      instance?.preview(HmsConfig);
    }
  };

  const previewWithLink = (
    token: string,
    userID: string,
    endpoint: string | undefined,
  ) => {
    let HmsConfig: HMSConfig | null = null;
    if (endpoint) {
      HmsConfig = new HMSConfig({
        authToken: token,
        username: userID,
        endpoint,
      });
    } else {
      HmsConfig = new HMSConfig({
        authToken: token,
        username: userID,
        // metadata: JSON.stringify({isHandRaised: true}), // To join with hand raised
      });
    }
    config = HmsConfig;

    instance?.addEventListener(
      HMSUpdateListenerActions.ON_PREVIEW,
      previewSuccess,
    );

    instance?.addEventListener(
      HMSUpdateListenerActions.ON_JOIN,
      onJoinListener,
    );

    saveUserDataRequest({
      userName: userID,
      roomID: roomID,
      mirrorLocalVideo: !mirrorLocalVideo,
    });
    instance?.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);
    if (skipPreview) {
      setSkipPreview(false);
      joinRoom();
    } else {
      instance?.preview(HmsConfig);
    }
  };

  const onJoinListener = () => {
    setPreviewButtonState('Active');
    setButtonState('Active');
    setPreviewModal(false);
    setAudioVideoStateRequest({audioState: audio, videoState: video});
    navigate('Meeting');
  };

  const joinRoom = () => {
    if (config !== null) {
      instance?.join(config);
      setMirrorLocalVideo(false);
    } else {
      console.log('config: ', config);
    }
  };

  const reportIssue = async () => {
    try {
      const fileUrl = RNFetchBlob.fs.dirs.DocumentDir + '/report-logs.json';
      const logger = HMSSDK.getLogger();
      const logs = logger?.getLogs();
      await writeFile({data: logs}, fileUrl);
    } catch (err) {
      console.log('reportIssue: ', err);
    }
  };

  const checkPermissionToWriteExternalStroage = async () => {
    // Function to check the platform
    // If Platform is Android then check for permissions.
    if (Platform.OS === 'ios') {
      await reportIssue();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message:
              'Application needs access to your storage to download File',
            buttonPositive: 'true',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // Start downloading
          await reportIssue();
          console.log('Storage Permission Granted.');
        } else {
          // If permission denied then show alert
          Toast.showWithGravity(
            'Storage Permission Not Granted',
            Toast.LONG,
            Toast.TOP,
          );
        }
      } catch (err) {
        // To handle permission related exception
        console.log('checkPermissionToWriteExternalStroage: ' + err);
      }
    }
  };

  const getSettingButtons = () => {
    const buttons: Array<{text: string; type?: string; onPress?: Function}> = [
      {
        text: 'Cancel',
        type: 'cancel',
      },
      {
        text: 'Report issue and share logs',
        onPress: async () => {
          await checkPermissionToWriteExternalStroage();
        },
      },
      {
        text: skipPreview ? "Don't Skip Preview" : 'Skip Preview',
        onPress: () => {
          setSkipPreview(!skipPreview);
        },
      },
      {
        text: mirrorLocalVideo ? "Don't Mirror My Video" : 'Mirror My Video',
        onPress: () => {
          setMirrorLocalVideo(!mirrorLocalVideo);
        },
      },
    ];
    return buttons;
  };

  return (
    <View style={styles.container}>
      <AlertModal
        modalVisible={settingsModal}
        setModalVisible={setSettingsModal}
        title="Settings"
        message=""
        buttons={getSettingButtons()}
      />
      <View style={styles.headerContainer}>
        <Image style={styles.image} source={require('../assets/icon.png')} />
        <Text style={styles.logo}>100ms</Text>
        <TouchableOpacity
          onPress={() => {
            setSettingsModal(true);
          }}
          style={styles.settingsIconContainer}>
          <Ionicons name="settings" style={styles.settingsIcon} size={40} />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={styles.inputContainer} behavior="padding">
        <Text style={styles.heading}>Join a Meeting</Text>
        <View>
          <TextInput
            onChangeText={value => {
              setText(value);
            }}
            placeholderTextColor="#454545"
            placeholder="Enter room ID"
            style={styles.input}
            defaultValue={roomID}
            returnKeyType="done"
            multiline
            blurOnSubmit
            value={text}
          />
          <View style={styles.clear}>
            <TouchableOpacity
              onPress={() => {
                setText('');
              }}>
              <Entypo
                name="circle-with-cross"
                style={styles.settingsIcon}
                size={24}
              />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          disabled={buttonState !== 'Active'}
          style={[
            styles.joinButtonContainer,
            // eslint-disable-next-line react-native/no-inline-styles
            {opacity: buttonState !== 'Active' ? 0.5 : 1},
          ]}
          onPress={() => {
            if (text !== '') {
              setRoomID(text);
              setModalVisible(true);
            }
          }}>
          {buttonState === 'Loading' ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Feather name="video" style={styles.videoIcon} size={20} />
              <Text style={styles.joinButtonText}>Join</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.appVersion}>
          {`App Version :    ${getVersion()}`}
        </Text>
      </KeyboardAvoidingView>
      {modalVisible && (
        <UserIdModal
          join={(userID: string) => {
            var pattern = new RegExp(
              '^(https?:\\/\\/)?' +
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
                '((\\d{1,3}\\.){3}\\d{1,3}))' +
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
                '(\\?[;&a-z\\d%_.~+=-]*)?' +
                '(\\#[-a-z\\d_]*)?$',
              'i',
            );

            const isUrl = pattern.test(roomID);
            if (isUrl) {
              setButtonState('Loading');
              const codeObject = RegExp(/(?!\/)[a-zA-Z\-0-9]*$/g).exec(text);

              const domainObject = RegExp(
                /(https:\/\/)?(?:[a-zA-Z0-9.-])+(?!\\)/,
              ).exec(text);

              if (codeObject && domainObject) {
                const code = codeObject[0];
                const domain = domainObject[0];

                const strippedDomain = domain.replace('https://', '');

                tokenFromLinkService(
                  code,
                  strippedDomain,
                  userID,
                  checkPermissionsForLink,
                  apiFailed,
                );
              }
              setModalVisible(false);
            } else {
              setButtonState('Loading');
              callService(userID, roomID, checkPermissions, apiFailed);
              setModalVisible(false);
            }
          }}
          cancel={() => setModalVisible(false)}
          user={state.user}
        />
      )}
      {previewModal && (
        <PreviewModal
          setAudio={(value: boolean) => {
            setAudio(!value);
            instance?.localPeer?.localAudioTrack()?.setMute(value);
          }}
          setVideo={(value: boolean) => {
            setVideo(!value);
            instance?.localPeer?.localVideoTrack()?.setMute(value);
          }}
          videoAllowed={videoAllowed}
          audioAllowed={audioAllowed}
          trackId={localVideoTrackId}
          join={joinRoom}
          instance={instance}
          setPreviewButtonState={setPreviewButtonState}
          previewButtonState={previewButtonState}
          mirrorLocalVideo={mirrorLocalVideo}
        />
      )}
      <View />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
  headerContainer: {
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontWeight: '700',
    color: getThemeColour(),
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
    color: getThemeColour(),
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
    color: getThemeColour(),
    paddingRight: 40,
  },
  joinButtonContainer: {
    padding: 12,
    marginTop: 20,
    backgroundColor: getThemeColour(),
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
    backgroundColor: getThemeColour(),
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
  settingsIcon: {
    color: getThemeColour(),
  },
  settingsIconContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 10,
  },
  appVersion: {
    alignSelf: 'center',
    paddingTop: 10,
    fontSize: 20,
    color: getThemeColour(),
  },
  clear: {
    position: 'absolute',
    right: 5,
    height: '100%',
    justifyContent: 'center',
  },
});

const mapDispatchToProps = (dispatch: Function) => ({
  setAudioVideoStateRequest: (data: {
    audioState: boolean;
    videoState: boolean;
  }) => dispatch(setAudioVideoState(data)),
  saveUserDataRequest: (data: {userName: string; roomID: string}) =>
    dispatch(saveUserData(data)),
  updateHms: (data: {hmsInstance: HMSSDK}) =>
    dispatch(updateHmsReference(data)),
});
const mapStateToProps = (state: RootState) => {
  return {
    state: state,
    hmsInstance: state?.user?.hmsInstance,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(App);
