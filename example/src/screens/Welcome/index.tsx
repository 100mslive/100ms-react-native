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
import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {
  clearHmsReference,
  saveUserData,
  setPeerState,
} from '../../redux/actions';
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
  const {replace, navigate} = useNavigation<WelcomeScreenProp>();
  const {roomID, userName} = useSelector((state: RootState) => state.user);
  const joinConfig = useSelector((state: RootState) => state.app.joinConfig);
  const {top, bottom, left, right} = useSafeAreaInsets();
  const dispatch = useDispatch();

  // useState hook
  const [peerTrackNodes, setPeerTrackNodes] = useState<Array<PeerTrackNode>>(
    [],
  );
  const hmsInstanceRef = useRef<HMSSDK | null>(null);
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

  /**
   * onPreviewSuccess is a function named onPreviewSuccess which takes three parameters -
   * @param hmsInstance of type HMSSDK
   * @param hmsConfig of type HMSConfig
   * @param data object of type {room: HMSRoom, previewTracks: HMSTrack[]}
   */
  const onPreviewSuccess = (
    hmsInstance: HMSSDK, // Parameter hmsInstance of type HMSSDK
    hmsConfig: HMSConfig, // Parameter hmsConfig of type HMSConfig
    data: {room: HMSRoom; previewTracks: HMSTrack[]}, // Parameter data object of shape {room: HMSRoom, previewTracks: HMSTrack[]}
  ) => {
    // Set the value of the hmsRoom state variable to the value of data.room
    setHmsRoom(data.room);

    // Set the value of the previewTracks state variable to the value of data.previewTracks
    setPreviewTracks(data?.previewTracks);

    // Check if the local peer role name includes the string 'hls-'
    // This is done so that peers joining with hls-viewer role segue to the HLS Player Screen
    if (data.room.localPeer.role?.name?.includes('hls-')) {
      // If it does, set the value of isHLSViewerRef.current to true
      isHLSViewerRef.current = true;
    }

    // Check if the previewTracks array has any elements
    if (data?.previewTracks?.length > 0) {
      // If it does, set the modal type to ModalTypes.PREVIEW
      setModalType(ModalTypes.PREVIEW);
    } else {
      // If it doesn't, check if hmsConfig is defined
      if (hmsConfig) {
        // If it is, call the join method on hmsInstance with hmsConfig as the argument
        hmsInstance?.join(hmsConfig);
      } else {
        // If it isn't, set the values of the start and join button loading state variables to false, and log a message to the console with the value of hmsConfig
        setStartButtonLoading(false);
        setJoinButtonLoading(false);
        console.log('config: ', hmsConfig);
      }
    }
  };

  /**
   * The handleJoin function updates the list of peer track nodes for a given room's local peer based on the presence of the local peer's video track,
   * and navigates to the MeetingScreen with the isHLSViewerRef.current value.
   *
   * @param data is an object with a room property of type HMSRoom as a parameter
   */
  const handleJoin = (data: {room: HMSRoom}) => {
    // Checking if User is joining as HLS-Viewer
    // If the current user is not a HLSViewer and the role name of the local peer includes 'hls-', set the isHLSViewerRef to true
    if (
      !isHLSViewerRef.current &&
      data.room.localPeer.role?.name?.includes('hls-')
    ) {
      isHLSViewerRef.current = true;
    }

    // Get the list of peer track nodes from the peerTrackNodesRef (a reference to an array of peer track nodes)
    // for the local peer and its video track
    const nodesPresent = getPeerTrackNodes(
      peerTrackNodesRef?.current, // Current value of the peerTrackNodesRef
      data.room.localPeer, // Current local peer
      data.room.localPeer.videoTrack, // Current local peer's video track
    );

    // If no nodes are present, create a new peer track node for the local peer and its video track and add it to the peerTrackNodesRef
    if (nodesPresent.length === 0) {
      const hmsLocalPeer = createPeerTrackNode(
        data.room.localPeer, // Current local peer
        data.room.localPeer.videoTrack, // Current local peer's video track
      );
      const newPeerTrackNodes = [hmsLocalPeer, ...peerTrackNodesRef.current];
      peerTrackNodesRef.current = newPeerTrackNodes; // Set the peerTrackNodesRef to the new list of peer track nodes
    } else {
      // If nodes are present, update the existing nodes based on the presence of the local peer's video track
      if (data.room.localPeer.videoTrack) {
        changePeerTrackNodes(
          nodesPresent, // List of existing peer track nodes for the local peer and its video track
          data.room.localPeer, // Current local peer
          data.room.localPeer.videoTrack, // Current local peer's video track
        );
      } else {
        // If the local peer doesn't have a video track, update the existing nodes based on the presence of the local peer
        changePeerNodes(nodesPresent, data.room.localPeer); // Update the peer track nodes for the local peer
      }
    }

    // Dispatch an action to set the peer state to the updated list of peer track nodes
    dispatch(setPeerState({peerState: peerTrackNodesRef.current}));

    // Save the meeting URL in AsyncStorage with the 'preview' replaced by 'meeting'
    AsyncStorage.setItem(
      Constants.MEET_URL,
      roomID.replace('preview', 'meeting'),
    );

    // Navigate to the MeetingScreen with the isHLSViewerRef.current value
    replace('MeetingScreen', {isHLSViewer: isHLSViewerRef.current});
  };

  /**
   * The onJoinSuccess function simply calls the handleJoin function with the data parameter passed as an argument.
   * The handleJoin function handles the logic to update the list of peer track nodes for the local peer of the given room, based on the presence of the local peer's video track, and navigate to the MeetingScreen with the isHLSViewerRef.current value.
   * @param data is an object with a room property of type HMSRoom as a parameter
   */
  const onJoinSuccess = (data: {room: HMSRoom}) => {
    // Call the handleJoin function with the data parameter
    handleJoin(data);
  };

  const onError = (data: HMSException) => {
    setJoinButtonLoading(false);
    if (data.code === 424) {
      onFailure(data.description);
    } else {
      setStartButtonLoading(false);
      Toast.showWithGravity(
        `${data?.code} ${data?.description}` || 'Something went wrong',
        Toast.LONG,
        Toast.TOP,
      );
    }
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

  /**
   * This function handles the logic for starting a video call session using the HMSSDK.
   * It retrieves an auth token for the given room code and initializes the HMSSDK with the necessary settings and event listeners.
   * It also saves user data to state and either previews the video or joins the room, depending on the skipPreview setting.
   * If any errors occur during the process, it logs the error and calls the onFailure callback with an error message.
   *
   * @param roomCode Room Code of the 100ms Room
   * @param userId [Optional] - Unique Id for the user to get 100ms Auth Token
   * @param tokenEndpoint [Optional] - This is only required by 100ms Team for internal QA testing. Client developers should not use `tokenEndpoint` argument
   * @param initEndpoint [Optional] - This is only required by 100ms Team for internal QA testing. Client developers should not use `initEndpoint` argument
   */
  const onStartSuccess = async (
    roomCode: string,
    userId?: string,
    tokenEndpoint?: string,
    initEndpoint?: string,
    joinConfig?: any,
  ) => {
    // Validate the roomCode parameter
    if (!roomCode) {
      throw new Error('roomCode is required');
    }

    try {
      // Get the HMS instance
      const hmsInstance = await getHmsInstance();

      // Destructure the skipPreview property from the joinConfig object, or default to an empty object if joinConfig is undefined
      const {skipPreview} = joinConfig ?? {};

      // Set the hmsInstanceRef.current value to the hmsInstance object
      hmsInstanceRef.current = hmsInstance;

      // Get an auth token for the given roomCode and user ID (if provided)
      const token = await hmsInstance?.getAuthTokenByRoomCode(
        roomCode,
        userId,
        tokenEndpoint, // endpoint is only used by 100ms internal team
      );

      // Create an HMSConfig object with the auth token, peer name, and other settings
      const hmsConfig = new HMSConfig({
        authToken: token,
        username: peerName,
        captureNetworkQualityInPreview: true,
        endpoint: initEndpoint, // endpoint is only used by 100ms internal team
      });

      // Save the HMSConfig object to state using the setConfig function
      setConfig(hmsConfig);

      // Register event listeners for various HMS update events
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

      // Save user data to state using the saveUserData function from Redux
      dispatch(saveUserData({userName: peerName, roomCode, hmsInstance}));

      // Join the room or preview the video, depending on the skipPreview setting
      if (skipPreview) {
        await hmsInstance?.join(hmsConfig);
      } else {
        await hmsInstance?.preview(hmsConfig);
      }
    } catch (error) {
      // Log any errors and call the onFailure callback with an error message
      console.log(error);
      onFailure(
        error instanceof Error ? error.message : 'error in onStartSuccess',
      );
    }
  };

  /**
   * onJoinRoom function is called when the user clicks the "Join Room" button.
   * If a valid configuration object is available, it calls the `join` method of the HMS instance.
   * Otherwise, it logs an error message to the console and stops the loading spinner.
   */
  const onJoinRoom = () => {
    // Check if a valid configuration object is available
    if (config) {
      // Call the `join` method of the HMS instance using the `useRef` hook
      hmsInstanceRef.current?.join(config);
    } else {
      // Stop the loading spinner
      setJoinButtonLoading(false);
      // Log an error message to the console
      console.error('Error: Configuration object is missing.');
    }
  };

  /**
   * This function creates and returns a track settings object for video conferencing
   * that includes audio and video settings.
   * @link https://www.100ms.live/docs/react-native/v2/how--to-guides/interact-with-room/track/track-settings
   * @returns A `HMSTrackSettings` object that includes the audio and video settings.
   */
  const getTrackSettings = (): HMSTrackSettings => {
    // An array of known faulty devices
    const listOfFaultyDevices: string[] = [
      'Pixel',
      'Pixel XL',
      'Moto G5',
      'Moto G (5S) Plus',
      'Moto G4',
      'TA-1053',
      'Mi A1',
      'Mi A2',
      'E5823',
      'Redmi Note 5',
      'FP2',
      'MI 5',
    ];

    // Get the model of the current device
    const deviceModal = getModel();

    /**
     * Create an audio settings object
     * @link https://www.100ms.live/docs/react-native/v2/how--to-guides/interact-with-room/track/track-settings#set-audio-track-settings
     */
    let audioSettings = new HMSAudioTrackSettings({
      // Set the initial state of the audio track (muted or unmuted)
      initialState: joinConfig.mutedAudio
        ? HMSTrackSettingsInitState.MUTED
        : HMSTrackSettingsInitState.UNMUTED,
      // Use hardware echo cancellation for known faulty devices, or disable it otherwise
      useHardwareEchoCancellation: listOfFaultyDevices.includes(deviceModal)
        ? true
        : false,
      // Set the audio source if an audio mixer for playing local Audio files is being used, or leave it undefined otherwise
      audioSource: joinConfig.audioMixer
        ? [
            'mic_node',
            'screen_broadcast_audio_receiver_node',
            'audio_file_player_node',
          ]
        : undefined,
    });

    /** Create a video settings object
     * @link https://www.100ms.live/docs/react-native/v2/how--to-guides/interact-with-room/track/track-settings#set-video-track-settings
     */
    let videoSettings = new HMSVideoTrackSettings({
      // Set the initial state of the video track (muted or unmuted)
      initialState: joinConfig.mutedVideo
        ? HMSTrackSettingsInitState.MUTED
        : HMSTrackSettingsInitState.UNMUTED,
      // Set the camera facing to front-facing
      cameraFacing: HMSCameraFacing.FRONT,
      // Disable auto-resize if it is not enabled
      disableAutoResize: !joinConfig.autoResize,
      // Use software decoder if it is enabled
      forceSoftwareDecoder: joinConfig.softwareDecoder,
    });

    // Create a track settings object that includes the audio and video settings
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

    // Retrieve log settings
    const logSettings = getLogSettings();

    // Build an instance of the HMSSDK using specified log and track settings
    const hmsInstance = await HMSSDK.build({
      logSettings,
      trackSettings,
      appGroup: 'group.reactnativehms', // Required for starting Screenshare from iOS devices
      preferredExtension: 'live.100ms.reactnative.RNHMSExampleBroadcastUpload', // Required for starting Screenshare from iOS devices
    });

    // Create a new instance of HMSLogger and initialize it
    const logger = new HMSLogger();

    // Set log level of logger to VERBOSE and enable logging
    logger.updateLogLevel(HMSLogLevel.VERBOSE, true);

    // Set logger of the hmsInstance to logger instance
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
    callService(roomID, onStartSuccess, onFailure);
  };

  const onFailure = (error: string) => {
    setStartButtonLoading(false);
    Alert.alert('Error', error || 'Something went wrong', [
      {text: 'OK', style: 'cancel', onPress: handlePreviewLeave},
    ]);
  };

  const removeListeners = (hmsInstance?: HMSSDK | null) => {
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
      removeListeners(hmsInstanceRef.current);
    };
  }, []);

  const handlePreviewLeave = useCallback(async () => {
    const hmsInstance = hmsInstanceRef.current;

    if (!hmsInstance) {
      return navigate('QRCodeScreen');
    }

    await hmsInstance
      .leave()
      .then(async d => {
        console.log('Leave Success: ', d);
        await hmsInstance
          ?.destroy()
          .then(s => console.log('Destroy Success: ', s))
          .catch(e => console.log('Destroy Error: ', e));
        dispatch(clearHmsReference());
        navigate('QRCodeScreen');
      })
      .catch(e => console.log('Leave Error: ', e));
  }, []);

  // On Android, when back button is pressed,
  // user should leave current preview and go back to previous screen
  useEffect(() => {
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
    };
  }, [handlePreviewLeave]);

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
