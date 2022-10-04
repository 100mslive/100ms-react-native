import {
  HMSAudioCodec,
  HMSAudioTrack,
  HMSAudioTrackSettings,
  HMSCameraFacing,
  HMSConfig,
  HMSException,
  HMSLogger,
  HMSLogLevel,
  HMSPeer,
  HMSPeerUpdate,
  HMSRoom,
  HMSRoomUpdate,
  HMSSDK,
  HMSTrack,
  HMSTrackSettings,
  HMSTrackUpdate,
  HMSUpdateListenerActions,
  HMSVideoCodec,
  HMSVideoResolution,
  HMSVideoTrack,
  HMSVideoTrackSettings,
} from '@100mslive/react-native-hms';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {getModel} from 'react-native-device-info';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-simple-toast';
import {useDispatch, useSelector} from 'react-redux';

import {CustomButton, CustomInput, PreviewModal} from '../../components';
import {saveUserData, setPeerState} from '../../redux/actions';
import {
  callService,
  createPeerTrackNodes,
  updatePeersTrackNodesOnPeerListener,
  updatePeersTrackNodesOnTrackListener,
} from '../../utils/functions';
import {COLORS} from '../../utils/theme';
import {ModalTypes, PeerTrackNode} from '../../utils/types';
import {styles} from './styles';

import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {AppStackParamList} from '../../navigator';
import type {RootState} from '../../redux';
type WelcomeScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'WelcomeScreen'
>;

const Welcome = () => {
  // hooks
  const navigate = useNavigation<WelcomeScreenProp>().navigate;
  const {roomID, userName} = useSelector((state: RootState) => state.user);
  const {top, bottom, left, right} = useSafeAreaInsets();
  const dispatch = useDispatch();

  // useState hook
  const [peerTrackNodes, setPeerTrackNodes] = useState<Array<PeerTrackNode>>(
    [],
  );
  const [instance, setInstance] = useState<HMSSDK>();
  const [config, setConfig] = useState<HMSConfig>();
  const [nameDisabled, setNameDisabled] = useState<boolean>(true);
  const [peerName, setPeerName] = useState<string>(userName);
  const [previewButtonLoading, setPreviewButtonLoading] =
    useState<boolean>(false);
  const [joinButtonLoading, setJoinButtonLoading] = useState<boolean>(false);
  const [previewTracks, setPreviewTracks] = useState<{
    audioTrack: HMSAudioTrack;
    videoTrack: HMSVideoTrack;
  }>();
  const [hmsRoom, setHmsRoom] = useState<HMSRoom>();
  const [modalType, setModalType] = useState<ModalTypes>(ModalTypes.DEFAULT);

  // useRef hook
  const peerTrackNodesRef = React.useRef<Array<PeerTrackNode>>(peerTrackNodes);

  // listeners
  const onPreviewSuccess = (data: {
    room: HMSRoom;
    previewTracks: {audioTrack: HMSAudioTrack; videoTrack: HMSVideoTrack};
  }) => {
    console.log('data in onPreviewSuccess: ', data);
    setHmsRoom(data.room);
    setPreviewTracks(data?.previewTracks);
    setPreviewButtonLoading(false);
    setModalType(ModalTypes.PREVIEW);
  };

  const onJoinSuccess = (data: {room: HMSRoom}) => {
    console.log('data in onJoinSuccess: ', data);
    const latestPeerTrackNodes = createPeerTrackNodes(data.room.peers);
    dispatch(setPeerState({peerState: latestPeerTrackNodes}));
    setPeerTrackNodes(latestPeerTrackNodes);
    setHmsRoom(data.room);
    setJoinButtonLoading(false);
    setModalType(ModalTypes.DEFAULT);
    navigate('MeetingScreen');
  };

  const onError = (data: HMSException) => {
    console.log('data in onError: ', data);
    setPreviewButtonLoading(false);
    setJoinButtonLoading(false);
    Toast.showWithGravity(
      `${data?.code} ${data?.description}` || 'Something went wrong',
      Toast.LONG,
      Toast.TOP,
    );
  };

  const onRoomListener = (data: {room: HMSRoom; type: HMSRoomUpdate}) => {
    console.log('data in onRoomListener: ', data);
    setHmsRoom(data.room);
  };

  const onPeerListener = (data: {peer: HMSPeer; type: HMSPeerUpdate}) => {
    console.log('data in onPeerListener: ', data);
    const newPeerTrackNodes = updatePeersTrackNodesOnPeerListener(
      peerTrackNodesRef?.current,
      data.peer,
      data.type,
    );
    peerTrackNodesRef.current = newPeerTrackNodes;
    setPeerTrackNodes(newPeerTrackNodes);
  };

  const onTrackListener = (data: {
    peer: HMSPeer;
    track: HMSTrack;
    type: HMSTrackUpdate;
  }) => {
    console.log('data in onTrackListener: ', data);
    const newPeerTrackNodes = updatePeersTrackNodesOnTrackListener(
      peerTrackNodesRef?.current,
      data.track,
      data.peer,
      data.type,
    );
    peerTrackNodesRef.current = newPeerTrackNodes;
    setPeerTrackNodes(newPeerTrackNodes);
  };

  // functions
  const onPreview = async (
    token: string,
    userID: string,
    roomCode: string,
    endpoint?: string,
  ) => {
    const hmsInstance = await getHmsInstance();
    let hmsConfig: HMSConfig;
    if (endpoint) {
      hmsConfig = new HMSConfig({
        authToken: token,
        username: userID,
        captureNetworkQualityInPreview: true,
        endpoint,
      });
    } else {
      hmsConfig = new HMSConfig({
        authToken: token,
        username: userID,
        captureNetworkQualityInPreview: true,
        // metadata: JSON.stringify({isHandRaised: true}), // To join with hand raised
      });
    }
    setInstance(hmsInstance);
    setConfig(hmsConfig);

    hmsInstance?.addEventListener(
      HMSUpdateListenerActions.ON_PREVIEW,
      onPreviewSuccess,
    );

    hmsInstance?.addEventListener(
      HMSUpdateListenerActions.ON_JOIN,
      onJoinSuccess,
    );

    hmsInstance?.addEventListener(
      HMSUpdateListenerActions.ON_ROOM_UPDATE,
      onRoomListener,
    );

    hmsInstance?.addEventListener(
      HMSUpdateListenerActions.ON_PEER_UPDATE,
      onPeerListener,
    );

    hmsInstance?.addEventListener(
      HMSUpdateListenerActions.ON_TRACK_UPDATE,
      onTrackListener,
    );

    hmsInstance?.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);

    dispatch(
      saveUserData({
        userName: userID,
        roomCode,
        hmsInstance,
      }),
    );

    hmsInstance?.preview(hmsConfig);
  };

  const onJoinRoom = () => {
    if (config) {
      instance?.join(config);
    } else {
      setJoinButtonLoading(false);
      console.log('config: ', config);
    }
  };

  const getTrackSettings = () => {
    let audioSettings = new HMSAudioTrackSettings({
      codec: HMSAudioCodec.opus,
      maxBitrate: 32,
      trackDescription: 'Simple Audio Track',
      audioSource: [
        'mic_node',
        'screen_broadcast_audio_receiver_node',
        'audio_file_player_node',
      ],
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

  /**
   * Regular Usage:
   * const hmsInstance = await HMSSDK.build();
   * @returns
   */
  const getHmsInstance = async (): Promise<HMSSDK> => {
    /**
     * Only required for advanced use-case features like iOS Screen/Audio Share, Android Software Echo Cancellation, etc
     * NOT required for any other features.
     * @link https://www.100ms.live/docs/react-native/v2/advanced-features/track-settings
     */
    const trackSettings = getTrackSettings();

    /**
     * Regular Usage:
     * const hmsInstance = await HMSSDK.build();
     *
     *
     * Advanced Usage Example:
     * @param {trackSettings} trackSettings is an optional value only required to enable features like iOS Screen/Audio Share, Android Software Echo Cancellation, etc
     *
     * @param {appGroup} appGroup is an optional value only required for implementing Screen & Audio Share on iOS. They are not required for Android. DO NOT USE if your app does not implements Screen or Audio Share on iOS.
     *
     * @param {preferredExtension} preferredExtension is an optional value only required for implementing Screen & Audio Share on iOS. They are not required for Android. DO NOT USE if your app does not implements Screen or Audio Share on iOS.
     *
     *
     * const trackSettings = getTrackSettings();
     * const hmsInstance = await HMSSDK.build({
     *  trackSettings,
     *  appGroup: 'group.reactnativehms', // required for iOS Screenshare, not required for Android
     *  preferredExtension: 'RHHMSExampleBroadcastUpload', // required for iOS Screenshare, not required for Android
     * });
     */
    const hmsInstance = await HMSSDK.build({
      trackSettings,
      appGroup: 'group.reactnativehms',
      preferredExtension: 'live.100ms.reactnative.RNHMSExampleBroadcastUpload',
    });
    const logger = new HMSLogger();
    logger.updateLogLevel(HMSLogLevel.VERBOSE, true);
    hmsInstance.setLogger(logger);
    return hmsInstance;
  };

  const validateName = (value: string) => {
    if (value?.length > 0) {
      return true;
    }
    return false;
  };

  const onPreviewPress = async () => {
    setPreviewButtonLoading(true);
    callService(peerName, roomID, onPreview, onFailure);
  };

  const onFailure = (error: string) => {
    setPreviewButtonLoading(false);
    Alert.alert('Error', error || 'Something went wrong');
  };

  // useEffect hook
  useEffect(() => {
    setNameDisabled(!validateName(peerName));
    return () => {
      setNameDisabled(!validateName(peerName));
    };
  }, [peerName]);

  return modalType === ModalTypes.PREVIEW && previewTracks ? (
    <PreviewModal
      room={hmsRoom}
      previewTracks={previewTracks}
      join={onJoinRoom}
      setLoadingButtonState={setJoinButtonLoading}
      loadingButtonState={joinButtonLoading}
    />
  ) : (
    <KeyboardAvoidingView
      enabled={Platform.OS === 'ios'}
      behavior="padding"
      style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.contentContainerStyle,
          {
            paddingTop: 24 + top,
            paddingLeft: 24 + left,
            paddingRight: 24 + right,
            paddingBottom: 24 + bottom,
          },
        ]}
        style={styles.container}
        keyboardShouldPersistTaps="always">
        <Image
          style={styles.image}
          resizeMode="stretch"
          source={require('../../../assets/user_music.png')}
        />
        <View>
          <Text style={styles.heading}>Go live in five!</Text>
          <Text style={styles.description}>
            Let’s get your studio setup ready in less than 5 minutes!
          </Text>
        </View>
        <CustomInput
          value={peerName}
          onChangeText={setPeerName}
          textStyle={styles.userNameInputText}
          viewStyle={styles.userNameInputView}
          inputStyle={styles.userNameInput}
          placeholderTextColor={COLORS.TEXT.DISABLED}
          placeholder="Enter your name"
          title="Name"
        />
        <CustomButton
          title="Get Started ->"
          onPress={onPreviewPress}
          disabled={nameDisabled}
          viewStyle={[styles.startButton, nameDisabled && styles.disabled]}
          textStyle={[
            styles.startButtonText,
            nameDisabled && styles.disabledText,
          ]}
          loading={previewButtonLoading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export {Welcome};
