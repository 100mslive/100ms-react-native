import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  BackHandler,
  Platform,
  TextInput,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  HMSUpdateListenerActions,
  HMSMessage,
  HMSPeerUpdate,
  HMSRoomUpdate,
  HMSTrackUpdate,
  HMSRemotePeer,
  HMSVideoViewMode,
  HMSLocalPeer,
  HMSTrack,
  HMSRoom,
  HMSRole,
  HMSRoleChangeRequest,
  HMSSDK,
  HMSChangeTrackStateRequest,
  HMSSpeakerUpdate,
  HMSPeer,
  HMSTrackType,
  HMSRTMPConfig,
  HMSHLSMeetingURLVariant,
  HMSHLSConfig,
  HMSLocalAudioTrack,
  HMSLocalAudioStats,
  HMSLocalVideoStats,
  HMSRTCStatsReport,
  HMSLocalVideoTrack,
  HMSRemoteAudioStats,
  HMSRemoteAudioTrack,
  HMSRemoteVideoStats,
  HMSRemoteVideoTrack,
  HMSSpeaker,
  HMSHLSRecordingConfig,
} from '@100mslive/react-native-hms';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Toast from 'react-native-simple-toast';
import RNFetchBlob from 'rn-fetch-blob';
import {Picker} from '@react-native-picker/picker';
import Video from 'react-native-video';

import {styles} from './styles';
import type {AppStackParamList} from '../../navigator';
import {
  ChatWindow,
  AlertModal,
  CustomModal,
  RolePicker,
  ZoomableView,
  UserIdModal,
} from '../../components';
import {
  addMessage,
  clearMessageData,
  clearPeerData,
  saveUserData,
} from '../../redux/actions';
import type {RootState} from '../../redux';
import dimension from '../../utils/dimension';
import {
  pairDataForFlatlist,
  parseMetadata,
  writeFile,
  requestExternalStoragePermission,
  updatePeersTrackNodesOnPeerListener,
  updatePeersTrackNodesOnTrackListener,
} from '../../utils/functions';
import {LayoutParams, ModalTypes, PeerTrackNode} from '../../utils/types';
import {GridView} from './Grid';
import {ActiveSpeakerView} from './ActiveSpeakerView';
import {HeroView} from './HeroView';
import {MiniView} from './MiniView';

type MessageObject = {
  name: string;
  type: string;
  obj?: HMSRole | PeerTrackNode;
};

type MeetingScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'MeetingScreen'
>;

let remoteAudioStats: any = {};
let remoteVideoStats: any = {};
let localAudioStats: HMSLocalAudioStats = {};
let localVideoStats: HMSLocalVideoStats = {};

const Meeting = () => {
  const {hmsInstance, roomID, roomCode} = useSelector(
    (state: RootState) => state.user,
  );
  const [instance, setInstance] = useState<HMSSDK | undefined>();
  const {messages} = useSelector((state: RootState) => state.messages);
  const {peerState} = useSelector((state: RootState) => state.app);
  const dispatch = useDispatch();
  const navigate = useNavigation<MeetingScreenProp>().navigate;

  const [peerTrackNodes, setPeerTrackNodes] =
    useState<Array<PeerTrackNode>>(peerState);
  const [hmsRoom, setHmsRoom] = useState<HMSRoom>();
  const peerTrackNodesRef = React.useRef(peerTrackNodes);
  const HmsViewComponent = instance?.HmsView;
  const [speakers, setSpeakers] = useState<Array<HMSSpeaker>>([]);
  const [notification, setNotification] = useState(false);
  const [muteAllTracksAudio, setMuteAllTracksAudio] = useState(false);
  const [action, setAction] = useState(0);
  const [layout, setLayout] = useState<LayoutParams>(LayoutParams.GRID);
  const [newLayout, setNewLayout] = useState<LayoutParams>(layout);
  const [newRole, setNewRole] = useState(instance?.localPeer?.role);
  const [rtcStats, setRtcStats] = useState<HMSRTCStatsReport>();
  const hlsPlayerRef = useRef<Video>(null);
  const [page, setPage] = useState(0);
  const [zoomableTrackId, setZoomableTrackId] = useState('');
  const [statsForNerds, setStatsForNerds] = useState(false);
  const [modalVisible, setModalVisible] = useState<ModalTypes>(
    ModalTypes.DEFAULT,
  );
  const [roleChangeRequest, setRoleChangeRequest] = useState<{
    requestedBy?: string;
    suggestedRole?: string;
  }>({});
  const [recordingDetails, setRecordingDetails] = useState<HMSRTMPConfig>({
    record: false,
    meetingURL: roomID ? roomID + '?token=beam_recording' : '',
    rtmpURLs: [],
  });
  const [hlsStreamingDetails, setHLSStreamingDetails] =
    useState<HMSHLSMeetingURLVariant>({
      meetingUrl: roomID ? roomID + '?token=beam_recording' : '',
      metadata: '',
    });
  const [hlsRecordingDetails, setHLSRecordingDetails] =
    useState<HMSHLSRecordingConfig>({
      singleFilePerLayer: false,
      videoOnDemand: false,
    });
  const pairedPeers: Array<Array<PeerTrackNode>> = pairDataForFlatlist(
    peerTrackNodes,
    layout === LayoutParams.AUDIO ? 6 : 4,
  );

  const getMessageToList = (): MessageObject[] => {
    const messageList: MessageObject[] = [
      {
        name: 'everyone',
        type: 'everyone',
      },
    ];

    const knownRoles = instance?.knownRoles?.map((role: HMSRole) => ({
      name: role.name || '',
      type: 'group',
      obj: role,
    }));
    if (knownRoles) {
      messageList.push(...knownRoles);
    }

    const remotePeers = peerTrackNodes.filter(peerTrackNode => {
      if (peerTrackNode.peer.isLocal) {
        return false;
      }
      return true;
    });
    const peers = remotePeers.map(remotePeer => ({
      name: remotePeer.peer.name,
      type: 'direct',
      obj: remotePeer.peer,
    }));
    if (peers) {
      messageList.push(...peers);
    }

    return messageList;
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

  const fetchZoomableId = (id: string): boolean => {
    let idPresent = false;
    peerTrackNodes.map(({track}) => {
      if (track?.trackId === id) {
        idPresent = true;
      }
    });
    return idPresent;
  };

  const getModalTitle = (type: ModalTypes): string => {
    let modalTitle = 'Default';
    switch (type) {
      case ModalTypes.LAYOUT:
        modalTitle = 'Layout Details';
        break;
      case ModalTypes.ROLE:
        modalTitle = 'Select action';
        break;
      case ModalTypes.SETTINGS:
        modalTitle = 'Settings';
        break;
      case ModalTypes.RECORDING:
        modalTitle = 'Recording Details';
        break;
      case ModalTypes.LEAVE:
        modalTitle = 'End Room';
        break;
      case ModalTypes.HLS_STREAMING:
        modalTitle = 'HLS Streaming Details';
        break;
      case ModalTypes.ROLE_CHANGE:
        modalTitle = 'Role Change Details';
        break;
      case ModalTypes.CHANGE_TRACK:
        modalTitle = 'Change Track State Request';
        break;
    }
    return modalTitle;
  };

  const getModalButtons = (
    type: ModalTypes,
  ): Array<{text: string; type?: string; onPress?: Function}> => {
    let buttons: Array<{text: string; type?: string; onPress?: Function}> = [
      {text: 'Reject'},
      {text: 'Accept'},
    ];
    switch (type) {
      case ModalTypes.LAYOUT:
        buttons = [
          {text: 'Cancel'},
          {
            text: 'Set',
            onPress: () => {
              setLayout(newLayout);
            },
          },
        ];
        break;
      case ModalTypes.ROLE:
        buttons = [
          {text: 'Cancel'},
          {
            text: 'Send',
            onPress: async () => {
              const source = 'regular';
              switch (action) {
                case 1:
                  await instance?.changeTrackStateForRoles(
                    true,
                    HMSTrackType.VIDEO,
                    source,
                    [newRole!],
                  );
                  break;
                case 2:
                  await instance?.changeTrackStateForRoles(
                    false,
                    HMSTrackType.VIDEO,
                    source,
                    [newRole!],
                  );
                  break;
                case 3:
                  await instance?.changeTrackStateForRoles(
                    true,
                    HMSTrackType.AUDIO,
                    source,
                    [newRole!],
                  );
                  break;
                case 4:
                  await instance?.changeTrackStateForRoles(
                    false,
                    HMSTrackType.AUDIO,
                    source,
                    [newRole!],
                  );
                  break;
              }
            },
          },
        ];
        break;
      case ModalTypes.SETTINGS:
        buttons = [
          {
            text: 'Cancel',
            type: 'cancel',
          },
          {
            text: 'Set Layout',
            onPress: () => {
              setModalVisible(ModalTypes.LAYOUT);
            },
          },
          {
            text: 'Report issue and share logs',
            onPress: async () => {
              const permission = await requestExternalStoragePermission();
              if (permission) {
                await reportIssue();
              }
            },
          },
          {
            text: 'Start RTMP or Recording',
            onPress: () => {
              setModalVisible(ModalTypes.RECORDING);
            },
          },
          {
            text: 'Stop RTMP And Recording',
            onPress: () => {
              instance
                ?.stopRtmpAndRecording()
                .then(d => console.log('Stop RTMP And Recording Success: ', d))
                .catch(e => console.log('Stop RTMP And Recording Error: ', e));
            },
          },
          {
            text: 'Start HLS Streaming',
            onPress: () => {
              setModalVisible(ModalTypes.HLS_STREAMING);
            },
          },
          {
            text: 'Stop HLS Streaming',
            onPress: () => {
              instance
                ?.stopHLSStreaming()
                .then(d => console.log('Stop HLS Streaming Success: ', d))
                .catch(e => console.log('Stop HLS Streaming Error: ', e));
            },
          },
        ];
        if (Platform.OS === 'android') {
          buttons.push(
            ...[
              {
                text: 'Start Screenshare',
                onPress: () => {
                  instance
                    ?.startScreenshare()
                    .then(d => console.log('Start Screenshare Success: ', d))
                    .catch(e => console.log('Start Screenshare Error: ', e));
                },
              },
              {
                text: 'Stop Screenshare',
                onPress: () => {
                  instance
                    ?.stopScreenshare()
                    .then(d => console.log('Stop Screenshare Success: ', d))
                    .catch(e => console.log('Stop Screenshare Error: ', e));
                },
              },
            ],
          );
        } else {
          buttons.push({
            text: statsForNerds
              ? 'Disable Stats For Nerds'
              : 'Enable Stats For Nerds',
            onPress: () => {
              if (statsForNerds) {
                instance?.disableRTCStats();
                setStatsForNerds(false);
              } else {
                instance?.enableRTCStats();
                setStatsForNerds(true);
              }
            },
          });
        }
        if (instance?.localPeer?.role?.permissions?.mute) {
          buttons.push(
            ...[
              {
                text: 'Remote mute all peers audio',
                onPress: () => {
                  instance?.remoteMuteAllAudio();
                },
              },
              {
                text: 'Mute video of custom roles',
                onPress: () => {
                  setModalVisible(ModalTypes.ROLE);
                  setAction(1);
                },
              },
              {
                text: 'Mute audio of custom roles',
                onPress: () => {
                  setModalVisible(ModalTypes.ROLE);
                  setAction(3);
                },
              },
            ],
          );
        }
        if (instance?.localPeer?.role?.permissions?.unmute) {
          buttons.push(
            ...[
              {
                text: 'Unmute video of custom roles',
                onPress: () => {
                  setModalVisible(ModalTypes.ROLE);
                  setAction(2);
                },
              },

              {
                text: 'Unmute audio of custom roles',
                onPress: () => {
                  setModalVisible(ModalTypes.ROLE);
                  setAction(4);
                },
              },
            ],
          );
        }
        break;
      case ModalTypes.RECORDING:
        buttons = [
          {text: 'Cancel'},
          {
            text: 'Start',
            onPress: () => {
              instance
                ?.startRTMPOrRecording(recordingDetails)
                .then(d => console.log('Start RTMP Or Recording Success: ', d))
                .catch(e => console.log('Start RTMP Or Recording Error: ', e));
            },
          },
        ];
        break;
      case ModalTypes.LEAVE:
        buttons = [
          {
            text: 'Cancel',
            type: 'cancel',
          },
          {
            text: 'Leave without ending room',
            onPress: async () => {
              await instance?.leave();
              dispatch(clearMessageData());
              dispatch(clearPeerData());
              navigate('WelcomeScreen');
            },
          },
        ];
        if (instance?.localPeer?.role?.permissions?.endRoom) {
          buttons.push({
            text: 'End Room for all',
            onPress: async () => {
              await instance?.endRoom('Host ended the room');
              dispatch(clearMessageData());
              navigate('WelcomeScreen');
            },
          });
        }
        break;
      case ModalTypes.HLS_STREAMING:
        buttons = [
          {text: 'Cancel'},
          {
            text: 'Start',
            onPress: () => {
              const hmsHLSConfig = new HMSHLSConfig({
                hlsRecordingConfig: hlsRecordingDetails,
                meetingURLVariants: [hlsStreamingDetails],
              });
              instance
                ?.startHLSStreaming(hmsHLSConfig)
                .then(d => console.log('Start HLS Streaming Success: ', d))
                .catch(e => console.log('Start HLS Streaming Error: ', e));
            },
          },
        ];
        break;
      case ModalTypes.ROLE_CHANGE:
        buttons = [
          {text: 'Reject'},
          {
            text: 'Accept',
            onPress: () => {
              instance?.acceptRoleChange();
            },
          },
        ];
        break;
      case ModalTypes.CHANGE_TRACK:
        buttons = [
          {text: 'Reject'},
          {
            text: 'Accept',
            onPress: () => {
              if (
                roleChangeRequest?.suggestedRole?.toLocaleLowerCase() ===
                'video'
              ) {
                instance?.localPeer?.localVideoTrack()?.setMute(false);
              } else {
                instance?.localPeer?.localAudioTrack()?.setMute(false);
              }
            },
          },
        ];
        break;
    }
    return buttons;
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
    setHmsRoom(room);
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
    const newPeerTrackNodes = updatePeersTrackNodesOnPeerListener(
      peerTrackNodesRef,
      peer,
      type,
    );
    peerTrackNodesRef.current = newPeerTrackNodes;
    setPeerTrackNodes(newPeerTrackNodes);
    if (type === HMSPeerUpdate.PEER_LEFT) {
      Toast.showWithGravity(
        `Peer Left: ${peer.name} left the Room`,
        Toast.LONG,
        Toast.TOP,
      );
    } else if (type === HMSPeerUpdate.PEER_JOINED) {
      Toast.showWithGravity(
        `Peer Joined: ${peer.name} joined the Room`,
        Toast.LONG,
        Toast.TOP,
      );
    } else if (type === HMSPeerUpdate.ROLE_CHANGED) {
      Toast.showWithGravity(
        `Role Changed: Role of ${peer?.name} changed to ${peer?.role?.name}`,
        Toast.LONG,
        Toast.TOP,
      );
    }
    console.log(
      'data in onPeerListener: ',
      type,
      peer,
      room,
      localPeer,
      remotePeers,
    );
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
    const newPeerTrackNodes = updatePeersTrackNodesOnTrackListener(
      peerTrackNodesRef,
      track,
      peer,
      type,
    );
    peerTrackNodesRef.current = newPeerTrackNodes;
    setPeerTrackNodes(newPeerTrackNodes);
    console.log(
      'data in onTrackListener: ',
      type,
      peer,
      track,
      room,
      localPeer,
      remotePeers,
    );
  };

  const onMessage = (data: HMSMessage) => {
    dispatch(addMessage({data, isLocal: false}));
    setNotification(true);
    console.log('data in onMessage: ', data);
  };

  const onSpeaker = (data: HMSSpeakerUpdate) => {
    setSpeakers(data?.peers || []);
    console.log('data in onSpeaker: ', data);
  };

  const reconnecting = (data: any) => {
    console.log('data in reconnecting: ', data);
    Toast.showWithGravity('Reconnecting...', Toast.SHORT, Toast.TOP);
  };

  const reconnected = (data: any) => {
    console.log('data in reconnected: ', data);
    Toast.showWithGravity('Reconnected', Toast.SHORT, Toast.TOP);
  };

  const onRoleChangeRequest = (data: HMSRoleChangeRequest) => {
    console.log('data in onRoleChangeRequest: ', data);
    setModalVisible(ModalTypes.ROLE_CHANGE);
    setRoleChangeRequest({
      requestedBy: data?.requestedBy?.name,
      suggestedRole: data?.suggestedRole?.name,
    });
  };

  const onChangeTrackStateRequest = (data: HMSChangeTrackStateRequest) => {
    console.log('data in onChangeTrackStateRequest: ', data);
    if (!data?.mute) {
      setModalVisible(ModalTypes.CHANGE_TRACK);
      setRoleChangeRequest({
        requestedBy: data?.requestedBy?.name,
        suggestedRole: data?.trackType,
      });
    } else {
      Toast.showWithGravity(
        `Track Muted: ${data?.requestedBy?.name} Muted Your ${data?.trackType}`,
        Toast.LONG,
        Toast.TOP,
      );
    }
  };

  const onChangeLocalAudioStats = (data: {
    localAudioStats: HMSLocalAudioStats;
    track: HMSLocalAudioTrack;
    peer: HMSPeer;
  }) => {
    localAudioStats = data.localAudioStats;
  };

  const onChangeLocalVideoStats = (data: {
    localVideoStats: HMSLocalVideoStats;
    track: HMSLocalVideoTrack;
    peer: HMSPeer;
  }) => {
    localVideoStats = data.localVideoStats;
  };

  const onChangeRtcStats = (data: {rtcStats: HMSRTCStatsReport}) => {
    setRtcStats(data.rtcStats);
  };

  const onChangeRemoteAudioStats = (data: {
    remoteAudioStats: HMSRemoteAudioStats;
    track: HMSRemoteAudioTrack;
    peer: HMSPeer;
  }) => {
    remoteAudioStats[data.peer.peerID] = data.remoteAudioStats;
  };

  const onChangeRemoteVideoStats = (data: {
    remoteVideoStats: HMSRemoteVideoStats;
    track: HMSRemoteVideoTrack;
    peer: HMSPeer;
  }) => {
    remoteVideoStats[data.peer.peerID] = data.remoteVideoStats;
  };

  const onRemovedFromRoom = (data: any) => {
    console.log('data in onRemovedFromRoom: ', data);
    dispatch(clearMessageData());
    navigate('WelcomeScreen');
  };

  const updateHmsInstance = (hms: HMSSDK | undefined) => {
    console.log('data in updateHmsInstance: ', hms);
    setInstance(hms);

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
    hms?.addEventListener(HMSUpdateListenerActions.ON_MESSAGE, onMessage);
    hms?.addEventListener(HMSUpdateListenerActions.ON_SPEAKER, onSpeaker);
    hms?.addEventListener(HMSUpdateListenerActions.RECONNECTING, reconnecting);
    hms?.addEventListener(HMSUpdateListenerActions.RECONNECTED, reconnected);
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST,
      onRoleChangeRequest,
    );
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM,
      onRemovedFromRoom,
    );
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST,
      onChangeTrackStateRequest,
    );
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS,
      onChangeLocalAudioStats,
    );
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS,
      onChangeLocalVideoStats,
    );
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_RTC_STATS,
      onChangeRtcStats,
    );
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS,
      onChangeRemoteAudioStats,
    );
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS,
      onChangeRemoteVideoStats,
    );
  };

  useEffect(() => {
    const backAction = () => {
      setModalVisible(ModalTypes.LEAVE);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      backHandler.remove();
      instance?.leave();
      navigate('WelcomeScreen');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateHmsInstance(hmsInstance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (instance) {
      instance?.knownRoles?.map(role => {
        if (role?.name === instance?.localPeer?.role?.name) {
          setNewRole(role);
          return;
        }
      });
    }

    return () => {
      if (instance) {
        instance.removeAllListeners();
      }
    };
  }, [instance]);

  return (
    <SafeAreaView style={styles.container}>
      <CustomModal
        modalVisible={modalVisible === ModalTypes.ROLE_CHANGE}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
        title={getModalTitle(ModalTypes.ROLE_CHANGE)}
        buttons={getModalButtons(ModalTypes.ROLE_CHANGE)}>
        <Text style={styles.roleChangeText}>
          Role change requested by{' '}
          {roleChangeRequest?.requestedBy?.toLocaleUpperCase()}. Changing role
          to {roleChangeRequest?.suggestedRole?.toLocaleUpperCase()}
        </Text>
      </CustomModal>
      <CustomModal
        modalVisible={modalVisible === ModalTypes.RECORDING}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
        title={getModalTitle(ModalTypes.RECORDING)}
        buttons={getModalButtons(ModalTypes.RECORDING)}>
        <TextInput
          onChangeText={value => {
            setRecordingDetails({...recordingDetails, meetingURL: value});
          }}
          placeholderTextColor="#454545"
          placeholder="Enter meeting url"
          style={styles.input}
          defaultValue={recordingDetails.meetingURL}
          returnKeyType="done"
          multiline
          blurOnSubmit
        />
        <TextInput
          onChangeText={value => {
            if (value === '') {
              setRecordingDetails({...recordingDetails, rtmpURLs: []});
            } else {
              setRecordingDetails({...recordingDetails, rtmpURLs: [value]});
            }
          }}
          placeholderTextColor="#454545"
          placeholder="Enter rtmp url"
          style={styles.input}
          defaultValue={
            recordingDetails.rtmpURLs ? recordingDetails.rtmpURLs[0] : ''
          }
          returnKeyType="done"
          multiline
          blurOnSubmit
        />
        <TouchableOpacity
          onPress={() => {
            setRecordingDetails({
              ...recordingDetails,
              record: !recordingDetails.record,
            });
          }}
          style={styles.recordingDetails}>
          <Text>Record</Text>
          <View style={styles.checkboxContainer}>
            {recordingDetails.record && (
              <Entypo
                name="check"
                style={styles.checkbox}
                size={dimension.viewHeight(20)}
              />
            )}
          </View>
        </TouchableOpacity>
      </CustomModal>
      <CustomModal
        modalVisible={modalVisible === ModalTypes.HLS_STREAMING}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
        title={getModalTitle(ModalTypes.HLS_STREAMING)}
        buttons={getModalButtons(ModalTypes.HLS_STREAMING)}>
        <TextInput
          onChangeText={value => {
            setHLSStreamingDetails({...hlsStreamingDetails, meetingUrl: value});
          }}
          placeholderTextColor="#454545"
          placeholder="Enter meeting url"
          style={styles.input}
          defaultValue={hlsStreamingDetails.meetingUrl}
          returnKeyType="done"
          multiline
          blurOnSubmit
        />
        <TouchableOpacity
          onPress={() => {
            setHLSRecordingDetails({
              ...hlsRecordingDetails,
              singleFilePerLayer: !hlsRecordingDetails.singleFilePerLayer,
            });
          }}
          style={styles.recordingDetails}>
          <Text>singleFilePerLayer</Text>
          <View style={styles.checkboxContainer}>
            {hlsRecordingDetails.singleFilePerLayer && (
              <Entypo
                name="check"
                style={styles.checkbox}
                size={dimension.viewHeight(20)}
              />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setHLSRecordingDetails({
              ...hlsRecordingDetails,
              videoOnDemand: !hlsRecordingDetails.videoOnDemand,
            });
          }}
          style={styles.recordingDetails}>
          <Text>videoOnDemand</Text>
          <View style={styles.checkboxContainer}>
            {hlsRecordingDetails.videoOnDemand && (
              <Entypo
                name="check"
                style={styles.checkbox}
                size={dimension.viewHeight(20)}
              />
            )}
          </View>
        </TouchableOpacity>
      </CustomModal>
      <CustomModal
        modalVisible={modalVisible === ModalTypes.CHANGE_TRACK}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
        title={getModalTitle(ModalTypes.CHANGE_TRACK)}
        buttons={getModalButtons(ModalTypes.CHANGE_TRACK)}>
        <Text style={styles.roleChangeText}>
          {roleChangeRequest?.requestedBy?.toLocaleUpperCase()} requested to
          unmute your regular{' '}
          {roleChangeRequest?.suggestedRole?.toLocaleUpperCase()}.
        </Text>
      </CustomModal>
      <AlertModal
        modalVisible={modalVisible === ModalTypes.LEAVE}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
        title={getModalTitle(ModalTypes.LEAVE)}
        buttons={getModalButtons(ModalTypes.LEAVE)}
      />
      <AlertModal
        modalVisible={modalVisible === ModalTypes.SETTINGS}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
        title={getModalTitle(ModalTypes.SETTINGS)}
        buttons={getModalButtons(ModalTypes.SETTINGS)}
      />
      <CustomModal
        modalVisible={modalVisible === ModalTypes.ROLE}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
        title={getModalTitle(ModalTypes.ROLE)}
        buttons={getModalButtons(ModalTypes.ROLE)}>
        <RolePicker
          data={instance?.knownRoles || []}
          selectedItem={newRole}
          onItemSelected={setNewRole}
        />
      </CustomModal>
      <CustomModal
        modalVisible={modalVisible === ModalTypes.LAYOUT}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
        title={getModalTitle(ModalTypes.LAYOUT)}
        buttons={getModalButtons(ModalTypes.LAYOUT)}>
        <Picker
          selectedValue={newLayout}
          onValueChange={setNewLayout}
          dropdownIconColor="black"
          dropdownIconRippleColor="grey">
          {[
            {name: LayoutParams.GRID},
            {name: LayoutParams.AUDIO},
            {name: LayoutParams.ACTIVE_SPEAKER},
            {name: LayoutParams.HERO},
            {name: LayoutParams.MINI},
          ].map((item, index) => (
            <Picker.Item key={index} label={item.name} value={item.name} />
          ))}
        </Picker>
      </CustomModal>
      <View style={styles.headerContainer}>
        <Text style={styles.headerName}>
          {speakers?.length > 0 && speakers[0]?.peer?.name
            ? `🔊  ${speakers[0]?.peer?.name}`
            : roomCode}
        </Text>
        <View style={styles.headerRight}>
          {hmsRoom?.browserRecordingState?.running && (
            <Entypo
              name="controller-record"
              style={styles.recording}
              size={dimension.viewHeight(30)}
            />
          )}
          {(hmsRoom?.hlsStreamingState?.running ||
            hmsRoom?.rtmpHMSRtmpStreamingState?.running) && (
            <Entypo
              name="light-up"
              style={styles.streaming}
              size={dimension.viewHeight(30)}
            />
          )}
          {instance?.localPeer?.auxiliaryTracks &&
            instance?.localPeer?.auxiliaryTracks?.length > 0 && (
              <MaterialIcons
                name="fit-screen"
                style={styles.streaming}
                size={dimension.viewHeight(30)}
              />
            )}
          {instance?.localPeer?.role?.publishSettings?.allowed?.includes(
            'video',
          ) && (
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => {
                instance?.localPeer?.localVideoTrack()?.switchCamera();
              }}>
              <Ionicons
                name="camera-reverse-outline"
                style={styles.videoIcon}
                size={dimension.viewHeight(30)}
              />
            </TouchableOpacity>
          )}
          {!instance?.localPeer?.role?.name?.includes('hls-') && (
            <TouchableOpacity
              onPress={() => {
                instance?.setPlaybackForAllAudio(!muteAllTracksAudio);
                setMuteAllTracksAudio(!muteAllTracksAudio);
              }}
              style={styles.headerIcon}>
              <Ionicons
                name={muteAllTracksAudio ? 'volume-mute' : 'volume-high'}
                style={styles.headerName}
                size={dimension.viewHeight(30)}
              />
            </TouchableOpacity>
          )}
          {!instance?.localPeer?.role?.name?.includes('hls-') && (
            <TouchableOpacity
              onPress={() => {
                setModalVisible(ModalTypes.SETTINGS);
              }}
              style={styles.headerIcon}>
              <Ionicons
                name="settings"
                style={styles.headerName}
                size={dimension.viewHeight(30)}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.wrapper}>
        {instance?.localPeer?.role?.name?.includes('hls-') ? (
          hmsRoom?.hlsStreamingState?.running ? (
            hmsRoom?.hlsStreamingState?.variants
              ?.slice(0, 1)
              ?.map((variant, index) =>
                variant?.hlsStreamUrl ? (
                  <Video
                    key={index}
                    source={{
                      uri: variant?.hlsStreamUrl,
                    }} // Can be a URL or a local file.
                    controls={Platform.OS === 'ios' ? true : false}
                    onLoad={({duration}) => {
                      if (Platform.OS === 'android') {
                        hlsPlayerRef?.current?.seek(duration);
                      }
                    }}
                    ref={hlsPlayerRef}
                    resizeMode="contain"
                    onError={() => console.log('hls video streaming error')}
                    // Callback when video cannot be loaded
                    allowsExternalPlayback={false}
                    style={styles.renderVideo}
                  />
                ) : (
                  <View key={index} style={styles.renderVideo}>
                    <Text>Trying to load empty source...</Text>
                  </View>
                ),
              )
          ) : (
            <View style={styles.renderVideo}>
              <Text>Waiting for the Streaming to start...</Text>
            </View>
          )
        ) : fetchZoomableId(zoomableTrackId) &&
          modalVisible === ModalTypes.ZOOM ? (
          <View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(ModalTypes.DEFAULT);
              }}>
              <Entypo
                name={'circle-with-cross'}
                style={styles.videoIcon}
                size={dimension.viewHeight(50)}
              />
            </TouchableOpacity>
            <ZoomableView>
              {HmsViewComponent && (
                <HmsViewComponent
                  trackId={zoomableTrackId}
                  mirror={false}
                  scaleType={HMSVideoViewMode.ASPECT_FIT}
                  style={styles.hmsViewScreen}
                />
              )}
            </ZoomableView>
          </View>
        ) : layout === LayoutParams.ACTIVE_SPEAKER ? (
          <ActiveSpeakerView
            speakers={speakers}
            instance={instance}
            peerTrackNodes={peerTrackNodes}
            layout={layout}
            setPage={setPage}
            page={page}
          />
        ) : layout === LayoutParams.HERO ? (
          <HeroView
            speakers={speakers}
            instance={instance}
            setModalVisible={setModalVisible}
          />
        ) : layout === LayoutParams.MINI ? (
          <MiniView speakers={speakers} instance={instance} />
        ) : (
          <GridView
            speakers={speakers}
            pairedPeers={pairedPeers}
            setPage={setPage}
            setModalVisible={setModalVisible}
            setZoomableTrackId={setZoomableTrackId}
            instance={instance}
            layout={layout}
            statsForNerds={statsForNerds}
            rtcStats={rtcStats}
            remoteAudioStats={remoteAudioStats}
            remoteVideoStats={remoteVideoStats}
            localAudioStats={localAudioStats}
            localVideoStats={localVideoStats}
            page={page}
          />
        )}
      </View>
      <View style={styles.iconContainers}>
        {instance?.localPeer?.role?.publishSettings?.allowed?.includes(
          'audio',
        ) && (
          <TouchableOpacity
            style={styles.singleIconContainer}
            onPress={() => {
              instance?.localPeer
                ?.localAudioTrack()
                ?.setMute(!instance?.localPeer?.audioTrack?.isMute());
            }}>
            <Feather
              name={
                instance?.localPeer?.audioTrack?.isMute() ? 'mic-off' : 'mic'
              }
              style={styles.videoIcon}
              size={dimension.viewHeight(30)}
            />
          </TouchableOpacity>
        )}
        {instance?.localPeer?.role?.publishSettings?.allowed?.includes(
          'video',
        ) && (
          <TouchableOpacity
            style={styles.singleIconContainer}
            onPress={() => {
              instance?.localPeer
                ?.localVideoTrack()
                ?.setMute(!instance?.localPeer?.videoTrack?.isMute());
            }}>
            <Feather
              name={
                instance?.localPeer?.videoTrack?.isMute()
                  ? 'video-off'
                  : 'video'
              }
              style={styles.videoIcon}
              size={dimension.viewHeight(30)}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={() => {
            setModalVisible(ModalTypes.CHAT);
          }}>
          <Feather
            name="message-circle"
            style={styles.videoIcon}
            size={dimension.viewHeight(30)}
          />
          {notification && <View style={styles.messageDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={() => {
            const parsedMetadata = parseMetadata(instance?.localPeer?.metadata);
            instance?.changeMetadata(
              JSON.stringify({
                ...parsedMetadata,
                isHandRaised: !parsedMetadata?.isHandRaised,
                isBRBOn: false,
              }),
            );
          }}>
          <Ionicons
            name={
              parseMetadata(instance?.localPeer?.metadata)?.isHandRaised
                ? 'ios-hand-left'
                : 'ios-hand-left-outline'
            }
            style={styles.videoIcon}
            size={dimension.viewHeight(30)}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={() => {
            const parsedMetadata = parseMetadata(instance?.localPeer?.metadata);
            instance?.changeMetadata(
              JSON.stringify({
                ...parsedMetadata,
                isBRBOn: !parsedMetadata?.isBRBOn,
                isHandRaised: false,
              }),
            );
          }}>
          {parseMetadata(instance?.localPeer?.metadata)?.isBRBOn ? (
            <View style={styles.brbOnContainer}>
              <Text style={styles.brbOn}>BRB</Text>
            </View>
          ) : (
            <View style={styles.brbContainer}>
              <Text style={styles.brb}>BRB</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.leaveIconContainer}
          onPress={() => {
            setModalVisible(ModalTypes.LEAVE);
          }}>
          <Feather
            name="phone-off"
            style={styles.leaveIcon}
            size={dimension.viewHeight(30)}
          />
        </TouchableOpacity>
      </View>
      {modalVisible === ModalTypes.CHAT && (
        <ChatWindow
          messages={messages}
          cancel={() => {
            setModalVisible(ModalTypes.DEFAULT);
            setNotification(false);
          }}
          messageToList={getMessageToList()}
          send={(value: string, messageTo: MessageObject) => {
            if (value.length > 0) {
              if (messageTo?.type === 'everyone') {
                instance?.sendBroadcastMessage(value);
              } else if (messageTo?.type === 'group') {
                instance?.sendGroupMessage(value, [messageTo.obj as HMSRole]);
              } else if (messageTo.type === 'direct') {
                instance?.sendDirectMessage(value, messageTo.obj as HMSPeer);
              }
              dispatch(
                addMessage({
                  data: {
                    type: 'chat',
                    time: new Date(),
                    message: value,
                  },
                  isLocal: true,
                  name: messageTo?.name,
                }),
              );
            }
          }}
        />
      )}
      {modalVisible === ModalTypes.CHANGE_NAME && (
        <UserIdModal
          screen="Meeting"
          join={async (newName: string) => {
            if (newName && newName !== '') {
              instance?.changeName(newName);
              saveUserData &&
                dispatch(
                  saveUserData({
                    userName: newName,
                  }),
                );
            }
            setModalVisible(ModalTypes.DEFAULT);
          }}
          cancel={() => setModalVisible(ModalTypes.DEFAULT)}
          userName={instance?.localPeer?.name}
        />
      )}
    </SafeAreaView>
  );
};

export default Meeting;
