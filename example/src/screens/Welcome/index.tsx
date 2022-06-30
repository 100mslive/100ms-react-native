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
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {
  HMSConfig,
  HMSUpdateListenerActions,
  HMSLogger,
  HMSLogLevel,
  HMSSDK,
  HMSLocalPeer,
  HMSRoom,
  HMSAudioTrack,
  HMSVideoTrack,
  HMSRemotePeer,
  HMSPeerUpdate,
  HMSException,
  HMSRoomUpdate,
  HMSPeer,
  HMSTrack,
  HMSTrackUpdate,
  // HMSAudioTrackSettings,
  // HMSAudioCodec,
  // HMSVideoTrackSettings,
  // HMSVideoCodec,
  // HMSTrackSettings,
  // HMSCameraFacing,
  // HMSVideoResolution,
} from '@100mslive/react-native-hms';
import Toast from 'react-native-simple-toast';

import type {AppStackParamList} from '../../navigator';
import {styles} from './styles';
import {COLORS} from '../../utils/theme';
import {CustomButton, CustomInput, PreviewModal} from '../../components';
import type {RootState} from '../../redux';
import {
  callService,
  updatePeersTrackNodesOnPeerListener,
  updatePeersTrackNodesOnTrackListener,
} from '../../utils/functions';
import {saveUserData, setPeerState} from '../../redux/actions';
import {ModalTypes, PeerTrackNode} from '../../utils/types';

type WelcomeScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'WelcomeScreen'
>;

const Welcome = () => {
  const navigate = useNavigation<WelcomeScreenProp>().navigate;
  const {roomID, userName} = useSelector((state: RootState) => state.user);
  const {top, bottom, left, right} = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [peerTrackNodes, setPeerTrackNodes] = useState<Array<PeerTrackNode>>(
    [],
  );
  const peerTrackNodesRef = React.useRef<Array<PeerTrackNode>>(peerTrackNodes);
  const [instance, setInstance] = useState<HMSSDK>();
  const [config, setConfig] = useState<HMSConfig>();
  const [nameDisabled, setNameDisabled] = useState<boolean>(true);
  const [peerName, setPeerName] = useState<string>(userName);
  const [previewButtonLoading, setPreviewButtonLoading] =
    useState<boolean>(false);
  const [joinButtonLoading, setJoinButtonLoading] = useState<boolean>(false);
  const [previewTrackId, setPreviewTrackId] = useState<string>('');
  const [modalType, setModalType] = useState<ModalTypes>(ModalTypes.DEFAULT);
  const [videoAllowed, setVideoAllowed] = useState<boolean>(false);
  const [audioAllowed, setAudioAllowed] = useState<boolean>(false);

  const onPreviewSuccess = (data: {
    localPeer: HMSLocalPeer;
    room: HMSRoom;
    previewTracks: {audioTrack: HMSAudioTrack; videoTrack: HMSVideoTrack};
  }) => {
    setVideoAllowed(
      data?.localPeer?.role?.publishSettings?.allowed?.includes('video') ??
        false,
    );
    setAudioAllowed(
      data?.localPeer?.role?.publishSettings?.allowed?.includes('audio') ??
        false,
    );
    setPreviewTrackId(data?.previewTracks?.videoTrack?.trackId);
    setPreviewButtonLoading(false);
    setModalType(ModalTypes.PREVIEW);
  };

  const onJoinListener = ({
    localPeer,
  }: {
    room: HMSRoom;
    localPeer: HMSLocalPeer;
    remotePeers: Array<HMSRemotePeer>;
  }) => {
    const newPeerTrackNodes = updatePeersTrackNodesOnPeerListener(
      peerTrackNodesRef?.current,
      localPeer,
      HMSPeerUpdate.PEER_JOINED,
    );
    dispatch(setPeerState({peerState: newPeerTrackNodes}));
    peerTrackNodesRef.current = [];
    setJoinButtonLoading(false);
    navigate('MeetingScreen');
  };

  const onError = (data: HMSException) => {
    console.log('data in onError: ', data);
    setPreviewButtonLoading(false);
    setJoinButtonLoading(false);
    Toast.showWithGravity(
      data?.error?.message || 'Something went wrong',
      Toast.LONG,
      Toast.TOP,
    );
  };

  const onRoomListener = ({
    room,
    type,
    localPeer,
    remotePeers,
  }: {
    room?: HMSRoom;
    type: HMSRoomUpdate;
    localPeer: HMSLocalPeer;
    remotePeers: HMSRemotePeer[];
  }) => {
    console.log('data in onRoomListener: ', type, room, localPeer, remotePeers);
  };

  const onPeerListener = ({
    peer,
    room,
    type,
    remotePeers,
    localPeer,
  }: {
    room?: HMSRoom;
    peer: HMSPeer;
    type: HMSPeerUpdate;
    localPeer: HMSLocalPeer;
    remotePeers: HMSRemotePeer[];
  }) => {
    console.log(
      'data in onPeerListener: ',
      type,
      peer,
      room,
      localPeer,
      remotePeers,
    );
    const newPeerTrackNodes = updatePeersTrackNodesOnPeerListener(
      peerTrackNodesRef?.current,
      peer,
      type,
    );
    peerTrackNodesRef.current = newPeerTrackNodes;
    setPeerTrackNodes(newPeerTrackNodes);
  };

  const onTrackListener = ({
    peer,
    track,
    room,
    type,
    remotePeers,
    localPeer,
  }: {
    room?: HMSRoom;
    peer: HMSPeer;
    track: HMSTrack;
    type: HMSTrackUpdate;
    localPeer: HMSLocalPeer;
    remotePeers: HMSRemotePeer[];
  }) => {
    console.log(
      'data in onTrackListener: ',
      type,
      peer,
      track,
      room,
      localPeer,
      remotePeers,
    );
    const newPeerTrackNodes = updatePeersTrackNodesOnTrackListener(
      peerTrackNodesRef?.current,
      track,
      peer,
      type,
    );
    peerTrackNodesRef.current = newPeerTrackNodes;
    setPeerTrackNodes(newPeerTrackNodes);
  };

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
      onJoinListener,
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
      setJoinButtonLoading(true);
      instance?.join(config);
    } else {
      console.log('config: ', config);
    }
  };

  // const getTrackSettings = () => {
  //   let audioSettings = new HMSAudioTrackSettings({
  //     codec: HMSAudioCodec.opus,
  //     maxBitrate: 32,
  //     trackDescription: 'Simple Audio Track',
  //   });
  //   let videoSettings = new HMSVideoTrackSettings({
  //     codec: HMSVideoCodec.VP8,
  //     maxBitrate: 512,
  //     maxFrameRate: 25,
  //     cameraFacing: HMSCameraFacing.FRONT,
  //     trackDescription: 'Simple Video Track',
  //     resolution: new HMSVideoResolution({height: 180, width: 320}),
  //   });

  //   const listOfFaultyDevices = [
  //     'Pixel',
  //     'Pixel XL',
  //     'Moto G5',
  //     'Moto G (5S) Plus',
  //     'Moto G4',
  //     'TA-1053',
  //     'Mi A1',
  //     'Mi A2',
  //     'E5823', // Sony z5 compact
  //     'Redmi Note 5',
  //     'FP2', // Fairphone FP2
  //     'MI 5',
  //   ];
  //   const deviceModal = getModel();

  //   return new HMSTrackSettings({
  //     video: videoSettings,
  //     audio: audioSettings,
  //     useHardwareEchoCancellation: listOfFaultyDevices.includes(deviceModal)
  //       ? true
  //       : false,
  //   });
  // };

  const getHmsInstance = async (): Promise<HMSSDK> => {
    /**
     * Regular Usage:
     * const build = await HmsManager.build();
     *
     * Advanced Usage: Pass custom track settings while building HmsManager instance
     * const trackSettings = getTrackSettings();
     * const build = await HmsManager.build({ trackSettings });
     */

    const hmsInstance = await HMSSDK.build();
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

  useEffect(() => {
    setNameDisabled(!validateName(peerName));
  }, [peerName]);

  return modalType === ModalTypes.PREVIEW ? (
    <PreviewModal
      videoAllowed={videoAllowed}
      audioAllowed={audioAllowed}
      trackId={previewTrackId}
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
