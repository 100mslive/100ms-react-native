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
  HMSCameraControl,
  HMSSessionStoreValue,
} from '@100mslive/react-native-hms';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  Platform,
  Dimensions,
  AppState,
  LayoutAnimation,
  InteractionManager,
  BackHandler,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-simple-toast';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
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
  requestExternalStoragePermission,
  updatedDegradedFlag,
  updatePeerNodes,
  updatePeerTrackNodes,
} from '../../utils/functions';
import {
  ChangeAspectRatio,
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
  RtcStatsModal,
  SaveScreenshot,
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
import {useOrientation, useRTCStatsListeners} from '../../utils/hooks';
import {RoomSettingsModalContent} from '../../components/RoomSettingsModalContent';
import {PeerSettingsModalContent} from '../../components/PeerSettingsModalContent';
import {StreamingQualityModalContent} from '../../components/StreamingQualityModalContent';

type MeetingScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'MeetingScreen'
>;

type MeetingScreenRouteProp = RouteProp<AppStackParamList>;

const Meeting = () => {
  // hooks
  const dispatch = useDispatch();
  const modalTaskRef = useRef<any>(null);
  const orientation = useOrientation();
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
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
  const [isScreenShared, setIsScreenShared] = useState<boolean | undefined>(
    localPeer?.auxiliaryTracks && localPeer?.auxiliaryTracks?.length > 0,
  );
  const [modalVisible, setModalVisible] = useState<ModalTypes>(
    ModalTypes.DEFAULT,
  );

  const handleModalVisible = React.useCallback(
    (modalType: ModalTypes, delay = false) => {
      if (delay) {
        setModalVisible(ModalTypes.DEFAULT);

        const task = () => {
          setModalVisible(modalType);
          modalTaskRef.current = null;
        };

        if (Platform.OS === 'android') {
          modalTaskRef.current = InteractionManager.runAfterInteractions(task);
        } else {
          modalTaskRef.current = setTimeout(task, 500);
        }
      } else {
        setModalVisible(modalType);
      }
    },
    [],
  );

  const updateLocalPeer = () => {
    hmsInstance?.getLocalPeer().then(peer => {
      setLocalPeer(peer);
    });
  };

  const updateRoom = () => {
    hmsInstance?.getRoom().then(hmsRoom => {
      setRoom(hmsRoom);
    });
  };

  useEffect(() => {
    setIsVideoMute(localPeer?.videoTrack?.isMute());
    setIsAudioMute(localPeer?.audioTrack?.isMute());
  }, [localPeer]);

  useEffect(() => {
    updateLocalPeer();
    updateRoom();

    return () => {
      if (Platform.OS === 'android') {
        modalTaskRef.current?.cancel();
      } else {
        clearTimeout(modalTaskRef.current);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPipModeActive) {
      const appStateListener = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        dispatch(changePipModeStatus(PipModes.INACTIVE));
      };

      AppState.addEventListener('focus', appStateListener);

      return () => {
        AppState.removeEventListener('focus', appStateListener);
        dispatch(changePipModeStatus(PipModes.INACTIVE));
      };
    }
  }, [isPipModeActive]);

  useRTCStatsListeners(modalVisible === ModalTypes.RTC_STATS);

  const showLandscapeLayout =
    orientation === 'LANDSCAPE' &&
    !!localPeer?.role?.name &&
    localPeer.role.name.includes('hls-');

  return (
    <SafeAreaView
      edges={showLandscapeLayout ? ['left', 'right'] : undefined}
      style={[
        styles.container,
        showLandscapeLayout ? {flexDirection: 'row'} : null,
      ]}
    >
      {showLandscapeLayout ? <StatusBar hidden={true} /> : null}
      {isPipModeActive ? null : (
        <Header
          modalVisible={modalVisible}
          setModalVisible={handleModalVisible}
          room={room}
          localPeer={localPeer}
          isScreenShared={isScreenShared}
          landscapeLayout={showLandscapeLayout}
        />
      )}
      <DisplayView
        room={room}
        localPeer={localPeer}
        modalVisible={modalVisible}
        setModalVisible={handleModalVisible}
        setRoom={setRoom}
        setLocalPeer={setLocalPeer}
        setIsAudioMute={setIsAudioMute}
        setIsVideoMute={setIsVideoMute}
        setIsScreenShared={setIsScreenShared}
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
          isScreenShared={isScreenShared}
          landscapeLayout={showLandscapeLayout}
          setModalVisible={handleModalVisible}
          setIsAudioMute={setIsAudioMute}
          setIsVideoMute={setIsVideoMute}
          setIsScreenShared={setIsScreenShared}
        />
      )}
    </SafeAreaView>
  );
};

const DisplayView = (data: {
  room?: HMSRoom;
  localPeer?: HMSLocalPeer;
  modalVisible: ModalTypes;
  setModalVisible(modalType: ModalTypes, delay?: any): void;
  setRoom: React.Dispatch<React.SetStateAction<HMSRoom | undefined>>;
  setLocalPeer: React.Dispatch<React.SetStateAction<HMSLocalPeer | undefined>>;
  setIsAudioMute: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsVideoMute: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsScreenShared: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}) => {
  // hooks
  const {params} = useRoute<MeetingScreenRouteProp>();
  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE,
  );
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const hmsSessionStore = useSelector(
    (state: RootState) => state.user.hmsSessionStore,
  );

  // State to track active spotlight trackId
  const spotlightTrackId = useSelector(
    (state: RootState) => state.user.spotlightTrackId,
  );
  const peerState = useSelector((state: RootState) => state.app.peerState);
  const navigate = useNavigation<MeetingScreenProp>().navigate;
  const dispatch = useDispatch();

  // useState hook
  const [peerTrackNodes, setPeerTrackNodes] =
    useState<Array<PeerTrackNode>>(peerState);
  const [orientation, setOrientation] = useState(true);
  const [layout, setLayout] = useState<LayoutParams>(
    params?.isHLSViewer ? LayoutParams.HLS : LayoutParams.GRID,
  );
  const [updatePeer, setUpdatePeer] = useState<HMSPeer>();
  const [selectedPeerTrackNode, setSelectedPeerTrackNode] =
    useState<PeerTrackNode | null>(null);
  const [roleChangeRequest, setRoleChangeRequest] = useState<{
    requestedBy?: string;
    suggestedRole?: string;
  }>({});
  const [capturedImagePath, setCapturedImagePath] = useState<null | {
    uri: string;
  }>(null);

  // useRef hook
  const sessionStoreListeners = useRef<Array<{remove: () => void}>>([]);
  const gridViewRef = useRef<React.ElementRef<typeof GridView> | null>(null);
  const peerTrackNodesRef = useRef(peerTrackNodes);
  const trackToChangeRef = useRef<null | HMSTrack>(null);

  // constants
  const pairedPeers = useMemo(
    () =>
      pairData(
        peerTrackNodes,
        orientation ? 4 : 2,
        data?.localPeer,
        spotlightTrackId,
      ),
    [data?.localPeer, orientation, spotlightTrackId, peerTrackNodes],
  );

  // Sync local peerTrackNodes list with peerTrackNodes list stored in redux
  useEffect(() => {
    const reduxPeerNodes = peerState;

    setPeerTrackNodes(prevPeerTrackNodes => {
      let newPeerTrackNodes = prevPeerTrackNodes;

      for (const reduxPeerNode of reduxPeerNodes) {
        // checking if current reduxPeerNode is available in local state
        const node = prevPeerTrackNodes.find(
          prevPeerTrackNode => prevPeerTrackNode.id === reduxPeerNode.id,
        );

        // save it to list if not available
        if (!node) {
          newPeerTrackNodes = [...newPeerTrackNodes, reduxPeerNode];
        }
        // if local state node does not has track but reduxPeerNode do have it
        // add track from reduxPeerNode to local state node
        else if (!node.track && reduxPeerNode.track) {
          newPeerTrackNodes = newPeerTrackNodes.map(peerTrackNode => {
            if (peerTrackNode.id === reduxPeerNode.id) {
              return {...peerTrackNode, track: reduxPeerNode.track};
            }

            return peerTrackNode;
          });
        }
      }

      peerTrackNodesRef.current = newPeerTrackNodes;
      return newPeerTrackNodes;
    });
  }, [peerState]);

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
      const startAtDate = room?.browserRecordingState?.startedAt;

      let startTime: null | string = null;

      if (startAtDate) {
        let hours = startAtDate.getHours().toString();
        let minutes = startAtDate.getMinutes()?.toString();
        startTime = hours + ':' + minutes;
      }

      Toast.showWithGravity(
        `Browser Recording ${
          streaming
            ? `Started ${startTime ? 'At ' + startTime : ''}`
            : 'Stopped'
        }`,
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
      const startAtDate = room?.rtmpHMSRtmpStreamingState?.startedAt;

      let startTime: null | string = null;

      if (startAtDate) {
        let hours = startAtDate.getHours().toString();
        let minutes = startAtDate.getMinutes()?.toString();
        startTime = hours + ':' + minutes;
      }

      Toast.showWithGravity(
        `RTMP Streaming ${
          streaming
            ? `Started ${startTime ? 'At ' + startTime : ''}`
            : 'Stopped'
        }`,
        Toast.LONG,
        Toast.TOP,
      );
    } else if (type === HMSRoomUpdate.SERVER_RECORDING_STATE_UPDATED) {
      let streaming = room?.serverRecordingState?.running;
      const startAtDate = room?.serverRecordingState?.startedAt;

      let startTime: null | string = null;

      if (startAtDate) {
        let hours = startAtDate.getHours().toString();
        let minutes = startAtDate.getMinutes()?.toString();
        startTime = hours + ':' + minutes;
      }

      Toast.showWithGravity(
        `Server Recording ${
          streaming
            ? `Started ${startTime ? 'At ' + startTime : ''}`
            : 'Stopped'
        }`,
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
      if (nodesPresent.length) {
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
      if (peer.isLocal) {
        hmsInstance?.getLocalPeer().then(localPeer => {
          data?.setLocalPeer(localPeer);
        });
      }
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
      }
      if (peer.isLocal) {
        hmsInstance?.getLocalPeer().then(localPeer => {
          data?.setLocalPeer(localPeer);
        });
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
      if (peer.isLocal) {
        hmsInstance?.getLocalPeer().then(localPeer => {
          data?.setLocalPeer(localPeer);
        });
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
      data?.setModalVisible(ModalTypes.CHANGE_TRACK, true);
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
    data?.setModalVisible(ModalTypes.CHANGE_ROLE_ACCEPT, true);
    setRoleChangeRequest({
      requestedBy: request?.requestedBy?.name,
      suggestedRole: request?.suggestedRole?.name,
    });
  };

  const onRemovedFromRoomListener = async () => {
    await destroy();
  };

  const onMessageListener = (message: HMSMessage) => {
    dispatch(addMessage(message));
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

  const removeHmsInstanceListeners = (hms?: HMSSDK) => {
    hms?.removeEventListener(HMSUpdateListenerActions.ON_ROOM_UPDATE);
    hms?.removeEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE);
    hms?.removeEventListener(HMSUpdateListenerActions.ON_TRACK_UPDATE);
    hms?.removeEventListener(HMSUpdateListenerActions.ON_ERROR);
    hms?.removeEventListener(HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM);
    hms?.removeEventListener(HMSUpdateListenerActions.ON_MESSAGE);
    // hms?.removeEventListener(HMSUpdateListenerActions.ON_SPEAKER);
    // hms?.removeEventListener(HMSUpdateListenerActions.RECONNECTING);
    // hms?.removeEventListener(HMSUpdateListenerActions.RECONNECTED);
    hms?.removeEventListener(HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST);
    hms?.removeEventListener(
      HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST,
    );
    hms?.removeEventListener(HMSPIPListenerActions.ON_PIP_ROOM_LEAVE);
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
      .then(s => {
        dispatch(clearMessageData());
        dispatch(clearPeerData());
        dispatch(clearHmsReference());
        navigate('QRCodeScreen');
        console.log('Destroy Success: ', s);
      })
      .catch(e => console.log('Destroy Error: ', e));
  };

  const onLeavePress = async () => {
    await hmsInstance
      ?.leave()
      .then(async d => {
        console.log('Leave Success: ', d);
        removeHmsInstanceListeners(hmsInstance);

        // remove Session Store key update listener on cleanup
        sessionStoreListeners.current.forEach(listener => listener.remove());
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
    data?.setModalVisible(ModalTypes.CHANGE_NAME, true);
  };

  const handlePeerTileMorePress = React.useCallback(
    (peerTrackNode: PeerTrackNode) => {
      setSelectedPeerTrackNode(peerTrackNode);
      data?.setModalVisible(ModalTypes.PEER_SETTINGS);
    },
    [data?.setModalVisible],
  );

  const onChangeRolePress = (peer: HMSPeer) => {
    setUpdatePeer(peer);
    data?.setModalVisible(ModalTypes.CHANGE_ROLE, true);
  };

  const onSetVolumePress = (peer: HMSPeer) => {
    setUpdatePeer(peer);
    data?.setModalVisible(ModalTypes.VOLUME, true);
  };

  const handleCaptureScreenShotPress = (node: PeerTrackNode) => {
    data?.setModalVisible(ModalTypes.DEFAULT);
    InteractionManager.runAfterInteractions(() => {
      gridViewRef.current?.captureViewScreenshot(node);
    });
  };

  const handleCaptureImageAtMaxSupportedResolutionPress = (
    _node: PeerTrackNode,
  ) => {
    data?.setModalVisible(ModalTypes.DEFAULT);
    InteractionManager.runAfterInteractions(async () => {
      const permission = await requestExternalStoragePermission();

      if (hmsInstance && permission) {
        HMSCameraControl.captureImageAtMaxSupportedResolution(true)
          .then((imagePath: string) => {
            console.log(
              'captureImageAtMaxSupportedResolution result -> ',
              imagePath,
            );
            data?.setModalVisible(ModalTypes.DEFAULT);
            setCapturedImagePath({uri: `file://${imagePath}`});
          })
          .catch((error: any) => {
            console.warn(
              'captureImageAtMaxSupportedResolution error -> ',
              error,
            );
          });
      }
    });
  };

  const handleStreamingQualityPress = (track: HMSTrack) => {
    trackToChangeRef.current = track;
    data?.setModalVisible(ModalTypes.STREAMING_QUALITY_SETTING, true);
  };

  const getHmsRoles = () => {
    hmsInstance?.getRoles().then(roles => {
      dispatch(
        saveUserData({
          roles,
        }),
      );
    });
  };

  useEffect(() => {
    // Check if instance of HMSSessionStore is available
    if (hmsSessionStore) {
      let toastTimeoutId: NodeJS.Timeout | null = null;

      const addSessionStoreListeners = () => {
        // Handle 'spotlight' key values
        const handleSpotlightIdChange = (id: HMSSessionStoreValue) => {
          // Scroll to start of the list
          if (id) {
            gridViewRef.current
              ?.getFlatlistRef()
              .current?.scrollToOffset({animated: true, offset: 0});
          }
          // set value to the state to rerender the component to reflect changes
          dispatch(saveUserData({spotlightTrackId: id}));
        };

        // Handle 'pinnedMessage' key values
        const handlePinnedMessageChange = (data: HMSSessionStoreValue) => {
          dispatch(addPinnedMessage(data));
        };

        // Getting value for 'spotlight' key by using `get` method on HMSSessionStore instance
        hmsSessionStore
          .get('spotlight')
          .then(data => {
            console.log(
              'Session Store get `spotlight` key value success: ',
              data,
            );
            handleSpotlightIdChange(data);
          })
          .catch(error =>
            console.log(
              'Session Store get `spotlight` key value error: ',
              error,
            ),
          );

        // Getting value for 'pinnedMessage' key by using `get` method on HMSSessionStore instance
        hmsSessionStore
          .get('pinnedMessage')
          .then(data => {
            console.log(
              'Session Store get `pinnedMessage` key value success: ',
              data,
            );
            handlePinnedMessageChange(data);
          })
          .catch(error =>
            console.log(
              'Session Store get `pinnedMessage` key value error: ',
              error,
            ),
          );

        let lastSpotlightValue: HMSSessionStoreValue = null;
        let lastPinnedMessageValue: HMSSessionStoreValue = null;

        // Add subscription for `spotlight` & `pinnedMessage` keys updates on Session Store
        const subscription = hmsSessionStore.addKeyChangeListener<
          ['spotlight', 'pinnedMessage']
        >(['spotlight', 'pinnedMessage'], (error, data) => {
          // If error occurs, handle error and return early
          if (error !== null) {
            console.log(
              '`spotlight` & `pinnedMessage` key listener Error -> ',
              error,
            );
            return;
          }

          // If no error, handle data
          if (data !== null) {
            switch (data.key) {
              case 'spotlight': {
                handleSpotlightIdChange(data.value);

                // Showing Toast message if value has actually changed
                if (
                  data.value !== lastSpotlightValue &&
                  (data.value || lastSpotlightValue)
                ) {
                  Toast.showWithGravity(
                    `SessionStore: \`spotlight\` key's value changed to ${data.value}`,
                    Toast.LONG,
                    Toast.TOP,
                  );
                }

                lastSpotlightValue = data.value;
                break;
              }
              case 'pinnedMessage': {
                handlePinnedMessageChange(data.value);

                // Showing Toast message if value has actually changed
                if (
                  data.value !== lastPinnedMessageValue &&
                  (data.value || lastPinnedMessageValue)
                ) {
                  if (toastTimeoutId !== null) {
                    clearTimeout(toastTimeoutId);
                  }
                  toastTimeoutId = setTimeout(() => {
                    Toast.showWithGravity(
                      `SessionStore: \`pinnedMessage\` key's value changed to ${data.value}`,
                      Toast.LONG,
                      Toast.TOP,
                    );
                  }, 1500);
                }

                lastPinnedMessageValue = data.value;
                break;
              }
            }
          }
        });

        // Save reference of `subscription` in a ref
        sessionStoreListeners.current.push(subscription);
      };

      addSessionStoreListeners();

      return () => {
        // remove Session Store key update listener on cleanup
        sessionStoreListeners.current.forEach(listener => listener.remove());

        if (toastTimeoutId !== null) clearTimeout(toastTimeoutId);
      };
    }
  }, [hmsSessionStore]);

  // useEffect hook
  useEffect(() => {
    const callback = () => {
      setOrientation(isPortrait());
    };
    updateHmsInstance(hmsInstance);
    getHmsRoles();
    callback();
    Dimensions.addEventListener('change', callback);
    return () => {
      Dimensions.removeEventListener('change', callback);
      // onLeavePress();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On Android, when back button is pressed,
  // user should leave current meeting and go back to previous screen
  useEffect(() => {
    const backButtonHandler = () => {
      // Leave current meeting
      onLeavePress();

      // When true is returned the event will not be bubbled up
      // & no other back action will execute
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backButtonHandler);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backButtonHandler);
    };
  }, []);

  useEffect(() => {
    const localPeer = data?.localPeer;

    if (localPeer) {
      if (localPeer.role?.name?.includes('hls-')) {
        setLayout(LayoutParams.HLS);
      } else {
        setLayout(LayoutParams.GRID);
      }
    }
  }, [data?.localPeer?.role?.name]);

  return (
    <View style={styles.container}>
      {pairedPeers.length && layout === LayoutParams.GRID ? (
        <>
          {isPipModeActive ? (
            <PIPView pairedPeers={pairedPeers} />
          ) : (
            <GridView
              ref={gridViewRef}
              onPeerTileMorePress={handlePeerTileMorePress}
              pairedPeers={pairedPeers}
              orientation={orientation}
              setIsScreenShared={data.setIsScreenShared}
            />
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
            backdrop={true}
            modalPosiion="center"
            viewStyle={{minWidth: '70%', width: undefined}}
            modalVisible={data?.modalVisible === ModalTypes.PEER_SETTINGS}
            setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}
          >
            {selectedPeerTrackNode && data?.localPeer ? (
              <PeerSettingsModalContent
                localPeer={data.localPeer}
                peerTrackNode={selectedPeerTrackNode}
                cancelModal={() => data?.setModalVisible(ModalTypes.DEFAULT)}
                onChangeNamePress={onChangeNamePress}
                onChangeRolePress={onChangeRolePress}
                onSetVolumePress={onSetVolumePress}
                onCaptureScreenShotPress={handleCaptureScreenShotPress}
                onCaptureImageAtMaxSupportedResolutionPress={
                  handleCaptureImageAtMaxSupportedResolutionPress
                }
                onStreamingQualityPress={handleStreamingQualityPress}
              />
            ) : null}
          </DefaultModal>

          <DefaultModal
            modalPosiion="center"
            modalVisible={
              data.modalVisible === ModalTypes.HLS_PLAYER_ASPECT_RATIO
            }
            setModalVisible={() => data.setModalVisible(ModalTypes.DEFAULT)}
          >
            <ChangeAspectRatio
              instance={hmsInstance}
              cancelModal={() => data.setModalVisible(ModalTypes.DEFAULT)}
            />
          </DefaultModal>
          {/* Save Image Captured from Local Camera */}
          <DefaultModal
            modalPosiion="center"
            modalVisible={!!capturedImagePath}
            setModalVisible={() => setCapturedImagePath(null)}
          >
            {capturedImagePath && data.localPeer ? (
              <SaveScreenshot
                peer={data.localPeer}
                imageSource={capturedImagePath}
                cancelModal={() => setCapturedImagePath(null)}
              />
            ) : null}
          </DefaultModal>
          <DefaultModal
            modalPosiion="center"
            modalVisible={
              data?.modalVisible === ModalTypes.STREAMING_QUALITY_SETTING
            }
            setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}
          >
            {trackToChangeRef.current ? (
              <StreamingQualityModalContent
                track={trackToChangeRef.current}
                cancelModal={() => {
                  data?.setModalVisible(ModalTypes.DEFAULT);
                }}
              />
            ) : null}
          </DefaultModal>
          <DefaultModal
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
            animationIn={'slideInUp'}
            animationOut={'slideOutDown'}
            modalVisible={data?.modalVisible === ModalTypes.CHAT}
            setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}
          >
            <ChatWindow localPeer={data?.localPeer} />
          </DefaultModal>
          <DefaultModal
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
            animationIn={'slideInUp'}
            animationOut={'slideOutDown'}
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
  isScreenShared,
  modalVisible,
  landscapeLayout,
  setModalVisible,
}: {
  room?: HMSRoom;
  localPeer?: HMSLocalPeer;
  isScreenShared?: boolean;
  modalVisible: ModalTypes;
  landscapeLayout: boolean;
  setModalVisible(modalType: ModalTypes, delay?: any): void;
}) => {
  // hooks
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const roomCode = useSelector((state: RootState) => state.user.roomCode);

  // constants
  const iconSize = 20;
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
    InteractionManager.runAfterInteractions(() => {
      setModalVisible(ModalTypes.PARTICIPANTS);
    });
  };

  return (
    <View
      style={[
        styles.iconTopWrapper,
        landscapeLayout ? styles.iconTopWrapperLandscape : null,
      ]}
    >
      <View
        style={[
          styles.iconTopSubWrapper,
          landscapeLayout ? styles.iconTopSubWrapperLandscape : null,
        ]}
      >
        <Menu
          visible={modalVisible === ModalTypes.LEAVE_MENU}
          anchor={
            <CustomButton
              onPress={() => {
                setModalVisible(ModalTypes.LEAVE_MENU);
              }}
              viewStyle={[
                styles.iconContainer,
                styles.leaveIcon,
                landscapeLayout ? styles.iconContainerLandscape : null,
              ]}
              LeftIcon={
                <Feather name="log-out" style={styles.icon} size={iconSize} />
              }
            />
          }
          onRequestClose={() => setModalVisible(ModalTypes.DEFAULT)}
          style={styles.participantsMenuContainer}
        >
          <MenuItem
            onPress={() => setModalVisible(ModalTypes.LEAVE_ROOM, true)}
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
              onPress={() => setModalVisible(ModalTypes.END_ROOM, true)}
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
            {Array.isArray(room?.hlsStreamingState?.variants) ? (
              <RealTime
                startedAt={room?.hlsStreamingState?.variants[0]?.startedAt}
              />
            ) : null}
          </View>
        ) : (
          <Text style={styles.headerName}>{roomCode}</Text>
        )}
      </View>
      <View
        style={[
          styles.iconTopSubWrapper,
          landscapeLayout ? styles.iconTopSubWrapperLandscape : null,
        ]}
      >
        {(room?.browserRecordingState?.running ||
          room?.hlsRecordingState?.running) && (
          <MaterialCommunityIcons
            name="record-circle-outline"
            style={
              landscapeLayout ? styles.roomStatusLandscape : styles.roomStatus
            }
            size={iconSize}
          />
        )}
        {(room?.hlsStreamingState?.running ||
          room?.rtmpHMSRtmpStreamingState?.running) && (
          <Ionicons
            name="globe-outline"
            style={
              landscapeLayout ? styles.roomStatusLandscape : styles.roomStatus
            }
            size={iconSize}
          />
        )}
        {isScreenShared && (
          <Feather
            name="copy"
            style={
              landscapeLayout ? styles.roomStatusLandscape : styles.roomStatus
            }
            size={iconSize}
          />
        )}
        <CustomButton
          onPress={onParticipantsPress}
          viewStyle={[
            styles.iconContainer,
            landscapeLayout ? styles.iconContainerLandscape : null,
          ]}
          LeftIcon={
            <Ionicons name="people" style={styles.icon} size={iconSize} />
          }
        />
        <CustomButton
          onPress={onRaiseHandPress}
          viewStyle={[
            styles.iconContainer,
            landscapeLayout ? styles.iconContainerLandscape : null,
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
            InteractionManager.runAfterInteractions(() => {
              setModalVisible(ModalTypes.CHAT);
            });
            // setNotification(false);
          }}
          viewStyle={[
            styles.iconContainer,
            landscapeLayout ? styles.iconContainerLandscape : null,
          ]}
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
  isScreenShared,
  landscapeLayout,
  setModalVisible,
  setIsAudioMute,
  setIsVideoMute,
  setIsScreenShared,
}: {
  isHlsStreaming?: boolean;
  isBrowserRecording?: boolean;
  isHlsRecording?: boolean;
  isRtmpStreaming?: boolean;
  localPeer?: HMSLocalPeer;
  modalVisible: ModalTypes;
  isAudioMute?: boolean;
  isVideoMute?: boolean;
  isScreenShared?: boolean;
  landscapeLayout: boolean;
  setModalVisible(modalType: ModalTypes, delay?: any): void;
  setIsAudioMute: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsVideoMute: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsScreenShared: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}) => {
  // hooks
  const dispatch = useDispatch();
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const roomID = useSelector((state: RootState) => state.user.roomID);
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

  // functions
  const onStartScreenSharePress = () => {
    hmsInstance
      ?.startScreenshare()
      .then(d => {
        console.log('Start Screenshare Success: ', d);
        setIsScreenShared(true);
      })
      .catch(e => console.log('Start Screenshare Error: ', e));
  };

  const onEndScreenSharePress = () => {
    hmsInstance
      ?.stopScreenshare()
      .then(d => {
        console.log('Stop Screenshare Success: ', d);
        setIsScreenShared(false);
      })
      .catch(e => console.log('Stop Screenshare Error: ', e));
  };

  const onSettingsPress = () => {
    InteractionManager.runAfterInteractions(() => {
      setModalVisible(ModalTypes.SETTINGS);
    });
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
        styles.iconBotttomWrapper,
        landscapeLayout ? styles.iconBotttomWrapperLandscape : null,
      ]}
    >
      <View
        style={[
          styles.iconBotttomButtonWrapper,
          landscapeLayout ? styles.iconBotttomButtonWrapperLandscape : null,
        ]}
      >
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
              setIsVideoMute(!isVideoMute);
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
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        modalVisible={modalVisible === ModalTypes.SETTINGS}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
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
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        modalVisible={modalVisible === ModalTypes.RTC_STATS}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <RtcStatsModal />
      </DefaultModal>
      <DefaultModal
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
