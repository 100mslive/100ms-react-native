import {
  HMSAudioTrackSettings,
  HMSCameraFacing,
  HMSConfig,
  HMSException,
  HMSLogAlarmManager,
  HMSLogger,
  HMSLogLevel,
  HMSLogSettings,
  HMSPeer,
  HMSPeerUpdate,
  HMSRoom,
  HMSRoomUpdate,
  HMSSDK,
  HMSTrack,
  HMSTrackSettings,
  HMSTrackSettingsInitState,
  HMSTrackSource,
  HMSTrackType,
  HMSTrackUpdate,
  HMSUpdateListenerActions,
  HMSVideoTrackSettings,
} from '@100mslive/react-native-hms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  BackHandler,
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {CustomButton, CustomInput, PreviewModal} from '../../components';
import {clearHmsReference, saveUserData, setPeerState} from '../../redux/actions';
import {
  callService,
  createPeerTrackNode,
  getPeerNodes,
  getPeerTrackNodes,
  replacePeerTrackNodes,
  updatePeerNodes,
  updatePeerTrackNodes,
} from '../../utils/functions';
import {COLORS} from '../../utils/theme';
import {Constants, ModalTypes, PeerTrackNode} from '../../utils/types';
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
  const { replace, navigate } = useNavigation<WelcomeScreenProp>();
  const {roomID, userName} = useSelector((state: RootState) => state.user);
  const joinConfig = useSelector((state: RootState) => state.app.joinConfig);
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
  const [startButtonLoading, setStartButtonLoading] = useState<boolean>(false);
  const [joinButtonLoading, setJoinButtonLoading] = useState<boolean>(false);
  const [previewTracks, setPreviewTracks] = useState<HMSTrack[]>();
  const [hmsRoom, setHmsRoom] = useState<HMSRoom>();
  const [modalType, setModalType] = useState<ModalTypes>(ModalTypes.DEFAULT);
  const isHLSViewerRef = React.useRef(false);

  // useRef hook
  const peerTrackNodesRef = React.useRef<Array<PeerTrackNode>>(peerTrackNodes);

  // listeners
  const onPreviewSuccess = (
    hmsInstance: HMSSDK,
    hmsConfig: HMSConfig,
    data: {
      room: HMSRoom;
      previewTracks: HMSTrack[];
    },
  ) => {
    setHmsRoom(data.room);
    setPreviewTracks(data?.previewTracks);

    // Checking if User is joining as HLS-Viewer
    if (data.room.localPeer.role?.name?.includes('hls-')) {
      isHLSViewerRef.current = true;
    }

    if (data?.previewTracks?.length > 0) {
      setModalType(ModalTypes.PREVIEW);
    } else {
      if (hmsConfig) {
        hmsInstance?.join(hmsConfig);
      } else {
        setStartButtonLoading(false);
        setJoinButtonLoading(false);
        console.log('config: ', hmsConfig);
      }
    }
  };

  const handleJoin = (data: {room: HMSRoom}) => {
    // Checking if User is joining as HLS-Viewer
    if (
      !isHLSViewerRef.current && data.room.localPeer.role?.name?.includes('hls-')
    ) {
      isHLSViewerRef.current = true;
    }

    const nodesPresent = getPeerTrackNodes(
      peerTrackNodesRef?.current,
      data.room.localPeer,
      data.room.localPeer.videoTrack,
    );

    if (nodesPresent.length === 0) {
      const hmsLocalPeer = createPeerTrackNode(
        data.room.localPeer,
        data.room.localPeer.videoTrack,
      );
      const newPeerTrackNodes = [hmsLocalPeer, ...peerTrackNodesRef.current];
      peerTrackNodesRef.current = newPeerTrackNodes;
    } else {
      if (data.room.localPeer.videoTrack) {
        changePeerTrackNodes(
          nodesPresent,
          data.room.localPeer,
          data.room.localPeer.videoTrack,
        );
      } else {
        changePeerNodes(nodesPresent, data.room.localPeer);
      }
    }

    dispatch(setPeerState({peerState: peerTrackNodesRef.current}));
    AsyncStorage.setItem(
      Constants.MEET_URL,
      roomID.replace('preview', 'meeting'),
    );
    replace('MeetingScreen', { isHLSViewer: isHLSViewerRef.current });
  };

  const onJoinSuccess = (data: {room: HMSRoom}) => {
    handleJoin(data);
  };

  const onError = (data: HMSException) => {
    setStartButtonLoading(false);
    setJoinButtonLoading(false);
    Toast.showWithGravity(
      `${data?.code} ${data?.description}` || 'Something went wrong',
      Toast.LONG,
      Toast.TOP,
    );
  };

  const onRoomListener = (
    hmsInstance: HMSSDK,
    data: {room: HMSRoom; type: HMSRoomUpdate},
  ) => {
    if (isHLSViewerRef.current) {
      // remove hms event listeners, so that we can take user to meeting screen, rather than handling events here
      removeListeners(hmsInstance);

      handleJoin(data);
    } else {
      setHmsRoom(data.room);
    }
  };

  const onPeerListener = ({
    peer,
    type,
  }: {
    peer: HMSPeer;
    type: HMSPeerUpdate;
  }) => {
    if (type === HMSPeerUpdate.PEER_JOINED) {
      return;
    }
    if (type === HMSPeerUpdate.PEER_LEFT) {
      removePeerTrackNodes(peer);
      dispatch(setPeerState({peerState: [...peerTrackNodesRef.current]}));
      return;
    }
    if (peer.isLocal) {
      const nodesPresent = getPeerNodes(
        peerTrackNodesRef?.current,
        peer.peerID,
      );
      if (nodesPresent.length) {
        changePeerNodes(nodesPresent, peer);
      }
      dispatch(setPeerState({peerState: [...peerTrackNodesRef.current]}));
      return;
    }
    if (type === HMSPeerUpdate.ROLE_CHANGED) {
      if (
        peer.role?.publishSettings?.allowed === undefined ||
        (peer.role?.publishSettings?.allowed &&
          peer.role?.publishSettings?.allowed.length < 1)
      ) {
        removePeerTrackNodes(peer);
        dispatch(setPeerState({peerState: [...peerTrackNodesRef.current]}));
      }
      return;
    }
    if (
      type === HMSPeerUpdate.METADATA_CHANGED ||
      type === HMSPeerUpdate.NAME_CHANGED ||
      type === HMSPeerUpdate.NETWORK_QUALITY_UPDATED
    ) {
      const nodesPresent = getPeerNodes(
        peerTrackNodesRef?.current,
        peer.peerID,
      );
      if (nodesPresent.length) {
        changePeerNodes(nodesPresent, peer);
        dispatch(setPeerState({peerState: [...peerTrackNodesRef.current]}));
      }
      return;
    }
  };

  const onTrackListener = ({
    peer,
    track,
    type,
  }: {
    peer: HMSPeer;
    track: HMSTrack;
    type: HMSTrackUpdate;
  }) => {
    if (type === HMSTrackUpdate.TRACK_ADDED) {
      const nodesPresent = getPeerTrackNodes(
        peerTrackNodesRef?.current,
        peer,
        track,
      );
      if (nodesPresent.length === 0) {
        const newPeerTrackNode = createPeerTrackNode(peer, track);
        const newPeerTrackNodes = [
          ...peerTrackNodesRef.current,
          newPeerTrackNode,
        ];
        peerTrackNodesRef.current = newPeerTrackNodes;
        setPeerTrackNodes(newPeerTrackNodes);
      } else {
        if (track.type === HMSTrackType.VIDEO) {
          changePeerTrackNodes(nodesPresent, peer, track);
        } else {
          changePeerNodes(nodesPresent, peer);
        }
      }
      dispatch(setPeerState({peerState: [...peerTrackNodesRef.current]}));
      return;
    }
    if (type === HMSTrackUpdate.TRACK_REMOVED) {
      if (
        track.source !== HMSTrackSource.REGULAR ||
        (peer.audioTrack?.trackId === undefined &&
          peer.videoTrack?.trackId === undefined)
      ) {
        const uniqueId =
          peer.peerID +
          (track.source === undefined ? HMSTrackSource.REGULAR : track.source);
        const newPeerTrackNodes = peerTrackNodesRef.current?.filter(
          peerTrackNode => {
            if (peerTrackNode.id === uniqueId) {
              return false;
            }
            return true;
          },
        );
        peerTrackNodesRef.current = newPeerTrackNodes;
        setPeerTrackNodes(newPeerTrackNodes);
        dispatch(setPeerState({peerState: [...peerTrackNodesRef.current]}));
      }
      return;
    }
    if (
      type === HMSTrackUpdate.TRACK_MUTED ||
      type === HMSTrackUpdate.TRACK_UNMUTED
    ) {
      const nodesPresent = getPeerTrackNodes(
        peerTrackNodesRef?.current,
        peer,
        track,
      );
      if (track.type === HMSTrackType.VIDEO) {
        changePeerTrackNodes(nodesPresent, peer, track);
      } else {
        changePeerNodes(nodesPresent, peer);
      }
      dispatch(setPeerState({peerState: [...peerTrackNodesRef.current]}));
      return;
    }
    if (
      type === HMSTrackUpdate.TRACK_RESTORED ||
      type === HMSTrackUpdate.TRACK_DEGRADED
    ) {
      const nodesPresent = getPeerTrackNodes(
        peerTrackNodesRef?.current,
        peer,
        track,
      );
      if (track.type === HMSTrackType.VIDEO) {
        changePeerTrackNodes(nodesPresent, peer, track);
      } else {
        changePeerNodes(nodesPresent, peer);
      }
      dispatch(setPeerState({peerState: [...peerTrackNodesRef.current]}));
      return;
    }
  };

  // functions
  const removePeerTrackNodes = (peer: HMSPeer) => {
    const newPeerTrackNodes = peerTrackNodesRef?.current?.filter(
      peerTrackNode => {
        if (peerTrackNode.peer.peerID === peer.peerID) {
          return false;
        }
        return true;
      },
    );
    setPeerTrackNodes(newPeerTrackNodes);
    peerTrackNodesRef.current = newPeerTrackNodes;
  };

  const changePeerNodes = (nodesPresent: PeerTrackNode[], peer: HMSPeer) => {
    const updatedPeerTrackNodes = updatePeerNodes(nodesPresent, peer);
    const newPeerTrackNodes = replacePeerTrackNodes(
      peerTrackNodesRef?.current,
      updatedPeerTrackNodes,
    );
    peerTrackNodesRef.current = newPeerTrackNodes;
    setPeerTrackNodes(newPeerTrackNodes);
  };

  const changePeerTrackNodes = (
    nodesPresent: PeerTrackNode[],
    peer: HMSPeer,
    track: HMSTrack,
  ) => {
    const updatedPeerTrackNodes = updatePeerTrackNodes(
      nodesPresent,
      peer,
      track,
    );
    const newPeerTrackNodes = replacePeerTrackNodes(
      peerTrackNodesRef?.current,
      updatedPeerTrackNodes,
    );
    peerTrackNodesRef.current = newPeerTrackNodes;
    setPeerTrackNodes(newPeerTrackNodes);
  };

  const onStartSuccess = async (
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
      onPreviewSuccess.bind(this, hmsInstance, hmsConfig),
    );

    hmsInstance?.addEventListener(
      HMSUpdateListenerActions.ON_JOIN,
      onJoinSuccess,
    );

    hmsInstance?.addEventListener(
      HMSUpdateListenerActions.ON_ROOM_UPDATE,
      onRoomListener.bind(this, hmsInstance),
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

    if (joinConfig.skipPreview) {
      hmsInstance?.join(hmsConfig);
    } else {
      hmsInstance?.preview(hmsConfig);
    }
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

    let audioSettings = new HMSAudioTrackSettings({
      initialState: joinConfig.mutedAudio
        ? HMSTrackSettingsInitState.MUTED
        : HMSTrackSettingsInitState.UNMUTED,
      useHardwareEchoCancellation: listOfFaultyDevices.includes(deviceModal)
        ? true
        : false,
      audioSource: joinConfig.audioMixer
        ? [
            'mic_node',
            'screen_broadcast_audio_receiver_node',
            'audio_file_player_node',
          ]
        : undefined,
    });

    let videoSettings = new HMSVideoTrackSettings({
      initialState: joinConfig.mutedVideo
        ? HMSTrackSettingsInitState.MUTED
        : HMSTrackSettingsInitState.UNMUTED,
      cameraFacing: HMSCameraFacing.FRONT,
      disableAutoResize: !joinConfig.autoResize,
      forceSoftwareDecoder: joinConfig.softwareDecoder,
    });

    return new HMSTrackSettings({
      video: videoSettings,
      audio: audioSettings,
    });
  };

  const getLogSettings = (): HMSLogSettings => {
    return new HMSLogSettings({
      level: HMSLogLevel.VERBOSE,
      isLogStorageEnabled: true,
      maxDirSizeInBytes: HMSLogAlarmManager.DEFAULT_DIR_SIZE,
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

    const logSettings = getLogSettings();
    const hmsInstance = await HMSSDK.build({
      logSettings,
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

  const onStartPress = async () => {
    setStartButtonLoading(true);
    callService(peerName, roomID, onStartSuccess, onFailure);
  };

  const onFailure = (error: string) => {
    setStartButtonLoading(false);
    Alert.alert('Error', error || 'Something went wrong');
  };

  const removeListeners = (hmsInstance?: HMSSDK) => {
    hmsInstance?.removeEventListener(HMSUpdateListenerActions.ON_PREVIEW);
    hmsInstance?.removeEventListener(HMSUpdateListenerActions.ON_JOIN);
    hmsInstance?.removeEventListener(HMSUpdateListenerActions.ON_ROOM_UPDATE);
    hmsInstance?.removeEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE);
    hmsInstance?.removeEventListener(HMSUpdateListenerActions.ON_TRACK_UPDATE);
    hmsInstance?.removeEventListener(HMSUpdateListenerActions.ON_ERROR);
  };

  // useEffect hook
  useEffect(() => {
    setNameDisabled(!validateName(peerName));
    return () => {
      setNameDisabled(!validateName(peerName));
    };
  }, [peerName]);

  useEffect(() => {
    return () => {
      removeListeners(instance);
    };
  }, [instance]);

  // On Android, when back button is pressed,
  // user should leave current preview and go back to previous screen
  useEffect(() => {
    if (instance) {
      const handlePreviewLeave = async () => {
        await instance
          ?.leave()
          .then(async d => {
            console.log('Leave Success: ', d);
            await instance
              ?.destroy()
              .then(s => console.log('Destroy Success: ', s))
              .catch(e => console.log('Destroy Error: ', e));
            dispatch(clearHmsReference());
            navigate('QRCodeScreen');
          })
          .catch(e => console.log('Leave Error: ', e));
      };

      const backButtonHandler = () => {
        // Leave current preview
        handlePreviewLeave();

        // When true is returned the event will not be bubbled up
        // & no other back action will execute
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', backButtonHandler);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', backButtonHandler);
      }
    }
  }, [instance]);

  return modalType === ModalTypes.PREVIEW && previewTracks ? (
    <PreviewModal
      previewTracks={previewTracks}
      join={onJoinRoom}
      setLoadingButtonState={setJoinButtonLoading}
      loadingButtonState={joinButtonLoading}
    />
  ) : (
    <KeyboardAvoidingView
      enabled={Platform.OS === 'ios'}
      behavior="padding"
      style={styles.container}
    >
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
        keyboardShouldPersistTaps="always"
      >
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
          onPress={onStartPress}
          disabled={nameDisabled}
          viewStyle={[styles.startButton, nameDisabled && styles.disabled]}
          textStyle={[
            styles.startButtonText,
            nameDisabled && styles.disabledText,
          ]}
          loading={startButtonLoading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export {Welcome};
