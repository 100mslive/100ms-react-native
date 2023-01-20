import {
  HMSAudioFilePlayerNode,
  HMSAudioMixingMode,
  HMSAudioMode,
  HMSChangeTrackStateRequest,
  HMSException,
  HMSLocalPeer,
  HMSMessage,
  HMSMessageType,
  HMSPeer,
  HMSPeerUpdate,
  HMSRoleChangeRequest,
  HMSRoom,
  HMSRoomUpdate,
  HMSSDK,
  HMSTrack,
  HMSTrackSource,
  HMSTrackType,
  HMSTrackUpdate,
  HMSUpdateListenerActions,
  HMSPIPListenerActions,
} from '@100mslive/react-native-hms';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Platform,
  Dimensions,
  AppState,
  AppStateStatus,
  LayoutAnimation,
  InteractionManager,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-simple-toast';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import DocumentPicker from 'react-native-document-picker';

import {styles} from './styles';
import {
  AlertModal,
  ChatWindow,
  CustomButton,
  DefaultModal,
  Menu,
  MenuItem,
} from '../../components';
import {
  LayoutParams,
  ModalTypes,
  PeerTrackNode,
  PipModes,
} from '../../utils/types';
import {
  createPeerTrackNode,
  getPeerNodes,
  getPeerTrackNodes,
  isPortrait,
  pairData,
  parseMetadata,
  replacePeerTrackNodes,
  updatedDegradedFlag,
  updatePeerNodes,
  updatePeerTrackNodes,
} from '../../utils/functions';
import {
  ChangeAudioMixingModeModal,
  ChangeAudioModeModal,
  ChangeAudioOutputModal,
  ChangeBulkRoleModal,
  ChangeNameModal,
  ChangeRoleAccepteModal,
  ChangeRoleModal,
  ChangeTrackStateForRoleModal,
  ChangeTrackStateModal,
  ChangeVolumeModal,
  EndRoomModal,
  HlsStreamingModal,
  LeaveRoomModal,
  ParticipantsModal,
  RealTime,
  RecordingModal,
} from './Modals';
import type {RootState} from '../../redux';
import type {AppStackParamList} from '../../navigator';
import {
  addMessage,
  addPinnedMessage,
  changePipModeStatus,
  clearHmsReference,
  clearMessageData,
  clearPeerData,
  saveUserData,
} from '../../redux/actions';
import {GridView} from './GridView';
import {HLSView} from './HLSView';
import PIPView from './PIPView';
import {RoomSettingsModalContent} from '../../components/RoomSettingsModalContent';

type MeetingScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'MeetingScreen'
>;

const Meeting = () => {
  // hooks
  const dispatch = useDispatch();
  const appState = useRef(AppState.currentState);
  const {hmsInstance} = useSelector((state: RootState) => state.user);
  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE,
  );

  // useState hook
  const [room, setRoom] = useState<HMSRoom>();
  const [localPeer, setLocalPeer] = useState<HMSLocalPeer>();
  const [isAudioMute, setIsAudioMute] = useState<boolean | undefined>(
    localPeer?.audioTrack?.isMute(),
  );
  const [isVideoMute, setIsVideoMute] = useState<boolean | undefined>(
    localPeer?.videoTrack?.isMute(),
  );
  const [modalVisible, setModalVisible] = useState<ModalTypes>(
    ModalTypes.DEFAULT,
  );

  const updateLocalPeer = () => {
    InteractionManager.runAfterInteractions( () =>
    {
      hmsInstance?.getLocalPeer().then( peer =>
      {
        setLocalPeer( peer )
      } );
    } );
  };

  const updateRoom = () => {
    InteractionManager.runAfterInteractions( () =>
    {
      hmsInstance?.getRoom().then( hmsRoom =>
      {
        setRoom( hmsRoom )
      } );
    } );
  };

  useEffect(() => {
    setIsVideoMute(localPeer?.videoTrack?.isMute());
    setIsAudioMute(localPeer?.audioTrack?.isMute());
  }, [localPeer]);

  useEffect(() => {
    updateLocalPeer();
    updateRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPipModeActive) {
      appState.current = AppState.currentState;

      const appStateListener = (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          dispatch(changePipModeStatus(PipModes.INACTIVE));
        }

        appState.current = nextAppState;
      };

      AppState.addEventListener('change', appStateListener);

      return () => {
        AppState.removeEventListener('change', appStateListener);
        dispatch(changePipModeStatus(PipModes.INACTIVE));
      };
    }
  }, [isPipModeActive]);

  return (
    <SafeAreaView style={styles.container}>
      {isPipModeActive ? null : (
        <Header
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          room={room}
          localPeer={localPeer}
        />
      )}
      <DisplayView
        room={room}
        localPeer={localPeer}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        setRoom={setRoom}
        setLocalPeer={setLocalPeer}
        setIsAudioMute={setIsAudioMute}
        setIsVideoMute={setIsVideoMute}
      />
      {isPipModeActive ? null : (
        <Footer
          isHlsStreaming={room?.hlsStreamingState?.running}
          isBrowserRecording={room?.browserRecordingState?.running}
          isHlsRecording={room?.hlsRecordingState?.running}
          isRtmpStreaming={room?.rtmpHMSRtmpStreamingState?.running}
          localPeer={localPeer}
          modalVisible={modalVisible}
          isAudioMute={isAudioMute}
          isVideoMute={isVideoMute}
          setModalVisible={setModalVisible}
          setIsAudioMute={setIsAudioMute}
          setIsVideoMute={setIsVideoMute}
        />
      )}
    </SafeAreaView>
  );
};

const DisplayView = (data: {
  room?: HMSRoom;
  localPeer?: HMSLocalPeer;
  modalVisible: ModalTypes;
  setModalVisible: React.Dispatch<React.SetStateAction<ModalTypes>>;
  setRoom: React.Dispatch<React.SetStateAction<HMSRoom | undefined>>;
  setLocalPeer: React.Dispatch<React.SetStateAction<HMSLocalPeer | undefined>>;
  setIsAudioMute: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsVideoMute: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}) => {
  // hooks
  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE,
  );
  const {hmsInstance} = useSelector((state: RootState) => state.user);
  const {peerState} = useSelector((state: RootState) => state.app);
  const navigate = useNavigation<MeetingScreenProp>().navigate;
  const dispatch = useDispatch();

  // useState hook
  const [peerTrackNodes, setPeerTrackNodes] =
    useState<Array<PeerTrackNode>>(peerState);
  const [orientation, setOrientation] = useState(true);
  const [layout, setLayout] = useState<LayoutParams>(LayoutParams.GRID);
  const [updatePeer, setUpdatePeer] = useState<HMSPeer>();
  const [roleChangeRequest, setRoleChangeRequest] = useState<{
    requestedBy?: string;
    suggestedRole?: string;
  }>({});

  // useRef hook
  const peerTrackNodesRef = useRef(peerTrackNodes);

  // constants
  const pairedPeers = useMemo(
    () => pairData(peerTrackNodes, orientation ? 4 : 2, data?.localPeer),
    [data?.localPeer, orientation, peerTrackNodes],
  );

  // listeners
  const onErrorListener = (error: HMSException) => {
    if (Platform.OS === 'android') {
      if (error?.code === 4005 || error?.code === 1003) {
        destroy();
      }
    } else {
      if (error?.code === 2000) {
        destroy();
      }
    }

    Toast.showWithGravity(
      `${error?.code} ${error?.description}` || 'Something went wrong',
      Toast.LONG,
      Toast.TOP,
    );
  };

  const onRoomListener = ({
    room,
    type,
  }: {
    room: HMSRoom;
    type: HMSRoomUpdate;
  }) => {
    data?.setRoom(room);

    if (type === HMSRoomUpdate.BROWSER_RECORDING_STATE_UPDATED) {
      let streaming = room?.browserRecordingState?.running;
      let hours = room?.browserRecordingState?.startedAt.getHours().toString();
      let minutes = room?.browserRecordingState?.startedAt
        .getMinutes()
        ?.toString();
      let time = hours + ':' + minutes;

      Toast.showWithGravity(
        `Browser Recording ${streaming ? 'Started At ' + time : 'Stopped'}`,
        Toast.LONG,
        Toast.TOP,
      );
    } else if (type === HMSRoomUpdate.HLS_STREAMING_STATE_UPDATED) {
      let streaming = room?.hlsStreamingState?.running;

      Toast.showWithGravity(
        `HLS Streaming ${streaming ? 'Started' : 'Stopped'}`,
        Toast.LONG,
        Toast.TOP,
      );
    } else if (type === HMSRoomUpdate.RTMP_STREAMING_STATE_UPDATED) {
      let streaming = room?.rtmpHMSRtmpStreamingState?.running;
      let hours = room?.rtmpHMSRtmpStreamingState?.startedAt
        .getHours()
        .toString();
      let minutes = room?.rtmpHMSRtmpStreamingState?.startedAt
        .getMinutes()
        ?.toString();
      let time = hours + ':' + minutes;

      Toast.showWithGravity(
        `RTMP Streaming ${streaming ? 'Started At ' + time : 'Stopped'}`,
        Toast.LONG,
        Toast.TOP,
      );
    } else if (type === HMSRoomUpdate.SERVER_RECORDING_STATE_UPDATED) {
      let streaming = room?.serverRecordingState?.running;
      let hours = room?.serverRecordingState?.startedAt.getHours().toString();
      let minutes = room?.serverRecordingState?.startedAt
        .getMinutes()
        ?.toString();
      let time = hours + ':' + minutes;

      Toast.showWithGravity(
        `Server Recording ${streaming ? 'Started At ' + time : 'Stopped'}`,
        Toast.LONG,
        Toast.TOP,
      );
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
      return;
    }
    if (peer.isLocal) {
      const nodesPresent = getPeerNodes(
        peerTrackNodesRef?.current,
        peer.peerID,
      );
      if (nodesPresent.length === 0) {
        const newPeerTrackNode = createPeerTrackNode(peer);
        const newPeerTrackNodes = [
          newPeerTrackNode,
          ...peerTrackNodesRef.current,
        ];
        peerTrackNodesRef.current = newPeerTrackNodes;
        setPeerTrackNodes(newPeerTrackNodes);
      } else {
        changePeerNodes(nodesPresent, peer);
      }
      hmsInstance?.getLocalPeer().then(localPeer => {
        data?.setLocalPeer(localPeer);
      });
      return;
    }
    if (type === HMSPeerUpdate.ROLE_CHANGED) {
      if (
        peer.role?.publishSettings?.allowed === undefined ||
        (peer.role?.publishSettings?.allowed &&
          peer.role?.publishSettings?.allowed.length < 1)
      ) {
        removePeerTrackNodes(peer);
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
      }
      return;
    }
    // switch (type) {
    //   case HMSPeerUpdate.PEER_LEFT:
    //     Toast.showWithGravity(
    //       `${peer.name} left the room.`,
    //       Toast.SHORT,
    //       Toast.TOP,
    //     );
    //     break;
    //   case HMSPeerUpdate.PEER_JOINED:
    //     Toast.showWithGravity(
    //       `${peer.name} joined the room.`,
    //       Toast.SHORT,
    //       Toast.TOP,
    //     );
    //     break;
    //   case HMSPeerUpdate.ROLE_CHANGED:
    //     Toast.showWithGravity(
    //       `${peer?.name}'s role is changed to ${peer?.role?.name}`,
    //       Toast.SHORT,
    //       Toast.TOP,
    //     );
    //     break;
    //   // case HMSPeerUpdate.NAME_CHANGED:
    //   //   break;
    //   // case HMSPeerUpdate.METADATA_CHANGED:
    //   //   break;
    //   // case HMSPeerUpdate.NETWORK_QUALITY_UPDATED:
    //   //   break;
    // }
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
      return;
    }
    if (type === HMSTrackUpdate.TRACK_REMOVED) {
      if (
        track.source !== HMSTrackSource.REGULAR ||
        (peer.audioTrack?.trackId === undefined &&
          peer.videoTrack?.trackId === undefined)
      ) {
        if (peer.isLocal) {
          const localPeerTrackNodes = getPeerTrackNodes(
            peerTrackNodesRef.current,
            peer,
            track,
          );

          // removing `track` from original `localPeerTrackNodes` object
          localPeerTrackNodes.forEach(localPeerTrackNode => {
            localPeerTrackNode.track = undefined;
          });

          // hack: creating new array from existing to rerender views
          const newPeerTrackNodes = [...peerTrackNodesRef.current];

          peerTrackNodesRef.current = newPeerTrackNodes;
          setPeerTrackNodes(newPeerTrackNodes);
        } else {
          const uniqueId =
            peer.peerID +
            (track.source === undefined
              ? HMSTrackSource.REGULAR
              : track.source);
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
        }
      }
      return;
    }
    if (
      type === HMSTrackUpdate.TRACK_MUTED ||
      type === HMSTrackUpdate.TRACK_UNMUTED
    ) {
      if (peer.isLocal && track.type === HMSTrackType.AUDIO) {
        data?.setIsAudioMute(track.isMute());
      }
      if (peer.isLocal && track.type === HMSTrackType.VIDEO) {
        data?.setIsVideoMute(track.isMute());
      }
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
      const updatedNodesPresent = updatedDegradedFlag(
        nodesPresent,
        type === HMSTrackUpdate.TRACK_DEGRADED,
      );
      changePeerTrackNodes(updatedNodesPresent, peer, track);
      return;
    }
  };

  const onChangeTrackStateRequestListener = (
    request: HMSChangeTrackStateRequest,
  ) => {
    if (!request?.mute) {
      data?.setModalVisible(ModalTypes.CHANGE_TRACK);
      setRoleChangeRequest({
        requestedBy: request?.requestedBy?.name,
        suggestedRole: request?.trackType,
      });
    } else {
      Toast.showWithGravity(
        `Track Muted: ${request?.requestedBy?.name} Muted Your ${request?.trackType}`,
        Toast.LONG,
        Toast.TOP,
      );
    }
  };

  const onRoleChangeRequestListener = (request: HMSRoleChangeRequest) => {
    data?.setModalVisible(ModalTypes.CHANGE_ROLE_ACCEPT);
    setRoleChangeRequest({
      requestedBy: request?.requestedBy?.name,
      suggestedRole: request?.suggestedRole?.name,
    });
  };

  const onRemovedFromRoomListener = async () => {
    await destroy();
  };

  const onMessageListener = (message: HMSMessage) => {
    switch (message.type) {
      case HMSMessageType.METADATA:
        hmsInstance?.getSessionMetaData().then((value: string | null) => {
          dispatch(addPinnedMessage(value));
        });
        break;
      default:
        dispatch(addMessage(message));
        break;
    }
  };

  // functions
  const updateHmsInstance = (hms?: HMSSDK) => {
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_ROOM_UPDATE,
      onRoomListener,
    );
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_PEER_UPDATE,
      onPeerListener,
    );
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_TRACK_UPDATE,
      onTrackListener,
    );
    hms?.addEventListener(HMSUpdateListenerActions.ON_ERROR, onErrorListener);
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM,
      onRemovedFromRoomListener,
    );
    hmsInstance?.addEventListener(
      HMSUpdateListenerActions.ON_MESSAGE,
      onMessageListener,
    );
    // hms?.addEventListener(
    //   HMSUpdateListenerActions.ON_SPEAKER,
    //   onSpeakerListener,
    // );
    // hms?.addEventListener(
    //   HMSUpdateListenerActions.RECONNECTING,
    //   onReconnectingListener,
    // );
    // hms?.addEventListener(
    //   HMSUpdateListenerActions.RECONNECTED,
    //   onReconnectedListener,
    // );
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST,
      onRoleChangeRequestListener,
    );
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST,
      onChangeTrackStateRequestListener,
    );
    hms?.addEventListener(HMSPIPListenerActions.ON_PIP_ROOM_LEAVE, destroy);
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

  const changePeerNodes = (nodesPresent: PeerTrackNode[], peer: HMSPeer) => {
    const updatedPeerTrackNodes = updatePeerNodes(nodesPresent, peer);
    const newPeerTrackNodes = replacePeerTrackNodes(
      peerTrackNodesRef?.current,
      updatedPeerTrackNodes,
    );
    peerTrackNodesRef.current = newPeerTrackNodes;
    setPeerTrackNodes(newPeerTrackNodes);
  };

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

  const destroy = async () => {
    await hmsInstance
      ?.destroy()
      .then(s => console.log('Destroy Success: ', s))
      .catch(e => console.log('Destroy Error: ', e));
    dispatch(clearMessageData());
    dispatch(clearPeerData());
    dispatch(clearHmsReference());
    navigate('QRCodeScreen');
  };

  const onLeavePress = async () => {
    await hmsInstance
      ?.leave()
      .then(async d => {
        console.log('Leave Success: ', d);
        destroy();
      })
      .catch(e => console.log('Leave Error: ', e));
  };

  const onEndRoomPress = async () => {
    await hmsInstance
      ?.endRoom('Host ended the room')
      .then(async d => {
        console.log('EndRoom Success: ', d);
        destroy();
      })
      .catch(e => console.log('EndRoom Error: ', e));
  };

  const onChangeNamePress = (peer: HMSPeer) => {
    setUpdatePeer(peer);
    data?.setModalVisible(ModalTypes.CHANGE_NAME);
  };

  const onChangeRolePress = (peer: HMSPeer) => {
    setUpdatePeer(peer);
    data?.setModalVisible(ModalTypes.CHANGE_ROLE);
  };

  const onSetVolumePress = (peer: HMSPeer) => {
    setUpdatePeer(peer);
    data?.setModalVisible(ModalTypes.VOLUME);
  };

  const getHmsRoles = () => {

    InteractionManager.runAfterInteractions( () =>
    {
      hmsInstance?.getRoles().then( roles =>
      {
        dispatch(
          saveUserData( {
            roles,
          } ),
        )
      } );
    } );
  };

  const getSessionMetaData = () => {
    InteractionManager.runAfterInteractions( () =>
    {
      hmsInstance?.getSessionMetaData().then((value: string | null) => {
        dispatch(addPinnedMessage(value));
      });
    });
  };

  // useEffect hook
  useEffect(() => {
    const callback = () => {
      setOrientation(isPortrait());
    };
    updateHmsInstance(hmsInstance);
    getHmsRoles();
    callback();
    getSessionMetaData();
    Dimensions.addEventListener('change', callback);
    return () => {
      Dimensions.removeEventListener('change', callback);
      onLeavePress();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data?.localPeer?.role?.name?.includes('hls-')) {
      setLayout(LayoutParams.HLS);
    } else {
      setLayout(LayoutParams.GRID);
    }
  }, [data?.localPeer?.role?.name]);

  return (
    <View style={styles.container}>
      {pairedPeers.length && layout === LayoutParams.GRID ? (
        <>
          {isPipModeActive ? (
            <PIPView pairedPeers={pairedPeers} />
          ) : (
            <GridView pairedPeers={pairedPeers} orientation={orientation} />
          )}
        </>
      ) : layout === LayoutParams.HLS ? (
        <HLSView room={data?.room} />
      ) : (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeHeading}>Welcome!</Text>
          <Text style={styles.welcomeDescription}>
            You’re the first one here.
          </Text>
          <Text style={styles.welcomeDescription}>
            Sit back and relax till the others join.
          </Text>
        </View>
      )}

      {isPipModeActive ? null : (
        <>
          <DefaultModal
            animationType="fade"
            overlay={false}
            modalPosiion="center"
            modalVisible={data?.modalVisible === ModalTypes.LEAVE_ROOM}
            setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}
          >
            <LeaveRoomModal
              onSuccess={onLeavePress}
              cancelModal={() => data?.setModalVisible(ModalTypes.DEFAULT)}
            />
          </DefaultModal>
          <DefaultModal
            animationType="fade"
            overlay={false}
            modalPosiion="center"
            modalVisible={data?.modalVisible === ModalTypes.END_ROOM}
            setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}
          >
            <EndRoomModal
              onSuccess={onEndRoomPress}
              cancelModal={() => data?.setModalVisible(ModalTypes.DEFAULT)}
            />
          </DefaultModal>
          {/* TODO: message notification */}
          <DefaultModal
            modalVisible={data?.modalVisible === ModalTypes.CHAT}
            setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}
          >
            <ChatWindow localPeer={data?.localPeer} />
          </DefaultModal>
          <DefaultModal
            animationType="fade"
            overlay={false}
            modalPosiion="center"
            modalVisible={data?.modalVisible === ModalTypes.CHANGE_TRACK}
            setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}
          >
            <ChangeTrackStateModal
              localPeer={data?.localPeer}
              roleChangeRequest={roleChangeRequest}
              cancelModal={() => data?.setModalVisible(ModalTypes.DEFAULT)}
            />
          </DefaultModal>
          <DefaultModal
            animationType="fade"
            overlay={false}
            modalPosiion="center"
            modalVisible={data?.modalVisible === ModalTypes.CHANGE_ROLE_ACCEPT}
            setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}
          >
            <ChangeRoleAccepteModal
              instance={hmsInstance}
              roleChangeRequest={roleChangeRequest}
              cancelModal={() => data?.setModalVisible(ModalTypes.DEFAULT)}
            />
          </DefaultModal>
          <DefaultModal
            modalVisible={data?.modalVisible === ModalTypes.PARTICIPANTS}
            setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}
          >
            <ParticipantsModal
              instance={hmsInstance}
              localPeer={data?.localPeer}
              changeName={onChangeNamePress}
              changeRole={onChangeRolePress}
              setVolume={onSetVolumePress}
            />
          </DefaultModal>
          <DefaultModal
            animationType="fade"
            overlay={false}
            modalPosiion="center"
            modalVisible={data?.modalVisible === ModalTypes.CHANGE_ROLE}
            setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}
          >
            <ChangeRoleModal
              instance={hmsInstance}
              peer={updatePeer}
              cancelModal={() => data?.setModalVisible(ModalTypes.DEFAULT)}
            />
          </DefaultModal>
          <DefaultModal
            animationType="fade"
            overlay={false}
            modalPosiion="center"
            modalVisible={data?.modalVisible === ModalTypes.VOLUME}
            setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}
          >
            <ChangeVolumeModal
              instance={hmsInstance}
              peer={updatePeer}
              cancelModal={() => data?.setModalVisible(ModalTypes.DEFAULT)}
            />
          </DefaultModal>
          <DefaultModal
            animationType="fade"
            overlay={false}
            modalPosiion="center"
            modalVisible={data?.modalVisible === ModalTypes.CHANGE_NAME}
            setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}
          >
            <ChangeNameModal
              instance={hmsInstance}
              peer={updatePeer}
              cancelModal={() => data?.setModalVisible(ModalTypes.DEFAULT)}
            />
          </DefaultModal>
        </>
      )}
    </View>
  );
};

const Header = ({
  room,
  localPeer,
  modalVisible,
  setModalVisible,
}: {
  room?: HMSRoom;
  localPeer?: HMSLocalPeer;
  modalVisible: ModalTypes;
  setModalVisible: React.Dispatch<React.SetStateAction<ModalTypes>>;
}) => {
  // hooks
  const {roomCode, hmsInstance} = useSelector((state: RootState) => state.user);

  // constants
  const iconSize = 20;
  const isScreenShared =
    localPeer?.auxiliaryTracks && localPeer?.auxiliaryTracks?.length > 0;
  const parsedMetadata = parseMetadata(localPeer?.metadata);

  // functions
  const onRaiseHandPress = async () => {
    await hmsInstance
      ?.changeMetadata(
        JSON.stringify({
          ...parsedMetadata,
          isHandRaised: !parsedMetadata?.isHandRaised,
          isBRBOn: false,
        }),
      )
      .then(d => console.log('Change Metadata Success: ', d))
      .catch(e => console.log('Change Metadata Error: ', e));
  };

  const onSwitchCameraPress = () => {
    localPeer?.localVideoTrack()?.switchCamera();
  };

  const onParticipantsPress = () => {
    setModalVisible(ModalTypes.PARTICIPANTS);
  };

  return (
    <View style={styles.iconTopWrapper}>
      <View style={styles.iconTopSubWrapper}>
        <Menu
          visible={modalVisible === ModalTypes.LEAVE_MENU}
          anchor={
            <CustomButton
              onPress={() => {
                setModalVisible(ModalTypes.LEAVE_MENU);
              }}
              viewStyle={[styles.iconContainer, styles.leaveIcon]}
              LeftIcon={
                <Feather name="log-out" style={styles.icon} size={iconSize} />
              }
            />
          }
          onRequestClose={() => setModalVisible(ModalTypes.DEFAULT)}
          style={styles.participantsMenuContainer}
        >
          <MenuItem
            onPress={() => {
              setModalVisible(ModalTypes.DEFAULT);
              setTimeout(() => {
                setModalVisible(ModalTypes.LEAVE_ROOM);
              }, 500);
            }}
          >
            <View style={styles.participantMenuItem}>
              <Feather
                name="log-out"
                style={styles.participantMenuItemIcon}
                size={iconSize}
              />
              <Text style={styles.participantMenuItemName}>Leave Studio</Text>
            </View>
          </MenuItem>
          {localPeer?.role?.permissions?.endRoom && (
            <MenuItem
              onPress={() => {
                setModalVisible(ModalTypes.DEFAULT);
                setTimeout(() => {
                  setModalVisible(ModalTypes.END_ROOM);
                }, 500);
              }}
            >
              <View style={styles.participantMenuItem}>
                <Feather
                  name="alert-triangle"
                  style={[styles.participantMenuItemIcon, styles.error]}
                  size={iconSize}
                />
                <Text style={[styles.participantMenuItemName, styles.error]}>
                  End Session
                </Text>
              </View>
            </MenuItem>
          )}
        </Menu>
        {room?.hlsStreamingState?.running ? (
          <View>
            <View style={styles.liveTextContainer}>
              <View style={styles.liveStatus} />
              <Text style={styles.liveTimeText}>Live</Text>
            </View>
            <RealTime
              startedAt={room?.hlsStreamingState?.variants[0]?.startedAt}
            />
          </View>
        ) : (
          <Text style={styles.headerName}>{roomCode}</Text>
        )}
      </View>
      <View style={styles.iconTopSubWrapper}>
        {(room?.browserRecordingState?.running ||
          room?.hlsRecordingState?.running) && (
          <MaterialCommunityIcons
            name="record-circle-outline"
            style={styles.roomStatus}
            size={iconSize}
          />
        )}
        {(room?.hlsStreamingState?.running ||
          room?.rtmpHMSRtmpStreamingState?.running) && (
          <Ionicons
            name="globe-outline"
            style={styles.roomStatus}
            size={iconSize}
          />
        )}
        {isScreenShared && (
          <Feather name="copy" style={styles.roomStatus} size={iconSize} />
        )}
        <CustomButton
          onPress={onParticipantsPress}
          viewStyle={styles.iconContainer}
          LeftIcon={
            <Ionicons name="people" style={styles.icon} size={iconSize} />
          }
        />
        <CustomButton
          onPress={onRaiseHandPress}
          viewStyle={[
            styles.iconContainer,
            parsedMetadata?.isHandRaised && styles.iconMuted,
          ]}
          LeftIcon={
            <Ionicons
              name="hand-left-outline"
              style={[
                styles.icon,
                parsedMetadata?.isHandRaised && styles.handRaised,
              ]}
              size={iconSize}
            />
          }
        />
        <CustomButton
          onPress={() => {
            setModalVisible(ModalTypes.CHAT);
            // setNotification(false);
          }}
          viewStyle={styles.iconContainer}
          LeftIcon={
            <View>
              {/* {notification && <View style={styles.messageDot} />} */}
              <MaterialCommunityIcons
                name="message-outline"
                style={styles.icon}
                size={iconSize}
              />
            </View>
          }
        />
        {localPeer?.role?.publishSettings?.allowed?.includes('video') && (
          <CustomButton
            onPress={onSwitchCameraPress}
            viewStyle={styles.iconContainer}
            LeftIcon={
              <Ionicons
                name="camera-reverse-outline"
                style={styles.icon}
                size={iconSize}
              />
            }
          />
        )}
      </View>
    </View>
  );
};

const Footer = ({
  isHlsStreaming,
  isBrowserRecording,
  localPeer,
  modalVisible,
  isAudioMute,
  isVideoMute,
  setModalVisible,
  setIsAudioMute,
  setIsVideoMute,
}: {
  isHlsStreaming?: boolean;
  isBrowserRecording?: boolean;
  isHlsRecording?: boolean;
  isRtmpStreaming?: boolean;
  localPeer?: HMSLocalPeer;
  modalVisible: ModalTypes;
  isAudioMute?: boolean;
  isVideoMute?: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<ModalTypes>>;
  setIsAudioMute: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsVideoMute: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}) => {
  // hooks
  const dispatch = useDispatch();
  const {hmsInstance, roomID} = useSelector((state: RootState) => state.user);
  const isPipActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE,
  );

  // useState hook
  const [muteAllTracksAudio, setMuteAllTracksAudio] = useState(false);
  const [isAudioShared, setIsAudioShared] = useState(false);
  const [audioDeviceChangeListener, setAudioDeviceChangeListener] =
    useState<boolean>(false);
  const [newAudioMixingMode, setNewAudioMixingMode] =
    useState<HMSAudioMixingMode>(HMSAudioMixingMode.TALK_AND_MUSIC);
  const [audioMode, setAudioMode] = useState<HMSAudioMode>(
    HMSAudioMode.MODE_NORMAL,
  );

  // constants
  const iconSize = 20;
  const isScreenShared =
    localPeer?.auxiliaryTracks && localPeer?.auxiliaryTracks?.length > 0;

  // functions
  const onStartScreenSharePress = () => {
    hmsInstance
      ?.startScreenshare()
      .then(d => console.log('Start Screenshare Success: ', d))
      .catch(e => console.log('Start Screenshare Error: ', e));
  };

  const onEndScreenSharePress = () => {
    hmsInstance
      ?.stopScreenshare()
      .then(d => console.log('Stop Screenshare Success: ', d))
      .catch(e => console.log('Stop Screenshare Error: ', e));
  };

  const onSettingsPress = () => {
    setModalVisible(ModalTypes.SETTINGS);
  };

  // Check if PIP is supported or not
  useEffect(() => {
    // Only check for PIP support if PIP is not active
    if (hmsInstance && !isPipActive) {
      const check = async () => {
        try {
          const isSupported = await hmsInstance.isPipModeSupported();

          if (!isSupported) {
            dispatch(changePipModeStatus(PipModes.NOT_AVAILABLE));
          }
        } catch (error) {
          dispatch(changePipModeStatus(PipModes.NOT_AVAILABLE));
        }
      };

      check();
    }
  }, [isPipActive, hmsInstance]);

  return (
    <View
      style={[
        // localPeer?.role?.permissions?.hlsStreaming
        //   ? styles.iconBotttomWrapperHls :
        styles.iconBotttomWrapper,
      ]}
    >
      <View style={styles.iconBotttomButtonWrapper}>
        {localPeer?.role?.publishSettings?.allowed?.includes('audio') && (
          <CustomButton
            onPress={() => {
              localPeer?.localAudioTrack()?.setMute(!isAudioMute);
              setIsAudioMute(!isAudioMute);
            }}
            viewStyle={[styles.iconContainer, isAudioMute && styles.iconMuted]}
            LeftIcon={
              <Feather
                name={isAudioMute ? 'mic-off' : 'mic'}
                style={styles.icon}
                size={iconSize}
              />
            }
          />
        )}
        {localPeer?.role?.publishSettings?.allowed?.includes('video') && (
          <CustomButton
            onPress={() => {
              localPeer?.localVideoTrack()?.setMute(!isVideoMute);
              setIsVideoMute(!isAudioMute);
            }}
            viewStyle={[styles.iconContainer, isVideoMute && styles.iconMuted]}
            LeftIcon={
              <Feather
                name={isVideoMute ? 'video-off' : 'video'}
                style={styles.icon}
                size={iconSize}
              />
            }
          />
        )}
        {/* {localPeer?.role?.permissions?.hlsStreaming &&
          (room?.hlsStreamingState?.running ? (
            <CustomButton
              onPress={() => setModalVisible(ModalTypes.END_HLS_STREAMING)}
              viewStyle={styles.endLiveIconContainer}
              LeftIcon={
                <Feather
                  name="stop-circle"
                  style={styles.icon}
                  size={iconSize}
                />
              }
            />
          ) : (
            <CustomButton
              onPress={() => console.log('onGoLivePress')}
              viewStyle={styles.goLiveIconContainer}
              LeftIcon={
                <Ionicons
                  name="radio-outline"
                  style={styles.icon}
                  size={iconSize * 2}
                />
              }
            />
          ))} */}
        {localPeer?.role?.publishSettings?.allowed?.includes('screen') && (
          <CustomButton
            onPress={
              isScreenShared ? onEndScreenSharePress : onStartScreenSharePress
            }
            viewStyle={[
              styles.iconContainer,
              isScreenShared && styles.iconMuted,
            ]}
            LeftIcon={
              <MaterialCommunityIcons
                name="monitor-share"
                style={styles.icon}
                size={iconSize}
              />
            }
          />
        )}
        <CustomButton
          onPress={onSettingsPress}
          viewStyle={styles.iconContainer}
          LeftIcon={
            <MaterialCommunityIcons
              name="dots-vertical"
              style={styles.icon}
              size={iconSize}
            />
          }
        />
      </View>
      {/* {localPeer?.role?.permissions?.hlsStreaming &&
        (room?.hlsStreamingState?.running ? (
          <Text style={styles.liveText}>End stream</Text>
        ) : (
          <Text style={styles.liveText}>Go Live</Text>
        ))} */}
      <DefaultModal
        modalVisible={modalVisible === ModalTypes.SETTINGS}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
        viewStyle={{maxHeight: Platform.OS === 'ios' ? '70%' : '85%'}}
      >
        <RoomSettingsModalContent
          localPeer={localPeer}
          isHLSStreaming={isHlsStreaming}
          rtmpAndRecording={isBrowserRecording}
          newAudioMixingMode={newAudioMixingMode}
          audioDeviceListenerAdded={audioDeviceChangeListener}
          isAudioShared={isAudioShared}
          muteAllTracksAudio={muteAllTracksAudio}
          closeRoomSettingsModal={() => setModalVisible(ModalTypes.DEFAULT)}
          setModalVisible={setModalVisible}
          setAudioDeviceListenerAdded={setAudioDeviceChangeListener}
          setIsAudioShared={setIsAudioShared}
          setMuteAllTracksAudio={setMuteAllTracksAudio}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={
          modalVisible === ModalTypes.RECORDING ||
          modalVisible === ModalTypes.RESOLUTION
        }
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <RecordingModal
          instance={hmsInstance}
          roomID={roomID}
          setModalVisible={setModalVisible}
          recordingModal={modalVisible === ModalTypes.RECORDING}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.HLS_STREAMING}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <HlsStreamingModal
          instance={hmsInstance}
          roomID={roomID}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.CHANGE_TRACK_ROLE}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <ChangeTrackStateForRoleModal
          instance={hmsInstance}
          localPeer={localPeer}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.SWITCH_AUDIO_OUTPUT}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <ChangeAudioOutputModal
          instance={hmsInstance}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.CHANGE_AUDIO_MODE}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <ChangeAudioModeModal
          instance={hmsInstance}
          audioMode={audioMode}
          setAudioMode={setAudioMode}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.AUDIO_MIXING_MODE}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <ChangeAudioMixingModeModal
          instance={hmsInstance}
          newAudioMixingMode={newAudioMixingMode}
          setNewAudioMixingMode={setNewAudioMixingMode}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.BULK_ROLE_CHANGE}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <ChangeBulkRoleModal
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
    </View>
  );
};

export {Meeting};
