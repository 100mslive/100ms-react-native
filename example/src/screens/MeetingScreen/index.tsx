import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Dimensions,
  BackHandler,
  Platform,
  TextInput,
  PermissionsAndroid,
} from 'react-native';
import {connect} from 'react-redux';
import {
  HMSUpdateListenerActions,
  HMSMessage,
  HMSPeerUpdate,
  HMSRoomUpdate,
  HMSTrackUpdate,
  HMSRemotePeer,
  HMSVideoViewMode,
  HMSLocalPeer,
  HMSPermissions,
  HMSTrack,
  HMSRoom,
  HMSRole,
  HMSRoleChangeRequest,
  HMSSDK,
  HMSChangeTrackStateRequest,
  HMSSpeakerUpdate,
  HMSPeer,
  HMSTrackType,
  HMSException,
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
  updateHmsReference,
  saveUserData,
} from '../../redux/actions/index';
import dimension from '../../utils/dimension';
import {
  decodeLocalPeer,
  decodeRemotePeer,
  getThemeColour,
  pairDataForScrollView,
  writeFile,
  isPortrait,
} from '../../utils/functions';
import {styles} from './styles';
import {SwipeableView} from './SwipeableView';
import {ActiveSpeakerView} from './ActiveSpeakerView';
import type {RootState} from '../../redux';
import type {AppStackParamList} from '../../navigator';
import type {Peer, LayoutParams} from '../../utils/types';

type MeetingProps = {
  messages: any;
  addMessageRequest: Function;
  clearMessageRequest: Function;
  audioState: boolean;
  videoState: boolean;
  state: RootState;
  hmsInstance: HMSSDK | undefined;
  saveUserDataRequest?: Function;
};

const DEFAULT_PEER: Peer = {
  trackId: Math.random().toString(),
  name: '',
  isAudioMute: true,
  isVideoMute: true,
  id: Math.random().toString(),
  colour: getThemeColour(),
  sink: true,
  type: 'local',
};

type MeetingScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'Meeting'
>;

let remoteAudioStats: any = {};
let remoteVideoStats: any = {};
let localAudioStats: HMSLocalAudioStats = {};
let localVideoStats: HMSLocalVideoStats = {};

const Meeting = ({
  messages,
  addMessageRequest,
  clearMessageRequest,
  hmsInstance,
  state,
  saveUserDataRequest,
}: MeetingProps) => {
  const [orientation, setOrientation] = useState<boolean>(true);
  const [instance, setInstance] = useState<HMSSDK | undefined>();
  const [trackId, setTrackId] = useState<Peer>(DEFAULT_PEER);
  const [remoteTrackIds, setRemoteTrackIds] = useState<Peer[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [speakerIds, setSpeakerIds] = useState<Array<string>>([]);
  const [speakers, setSpeakers] = useState<Array<HMSSpeaker>>([]);
  const [notification, setNotification] = useState(false);
  const [muteAllAudio, setMuteAllAudio] = useState(false);
  const [auxTracks, setAuxTracks] = useState<Peer[]>([]);
  const [roleChangeRequest, setRoleChangeRequest] = useState<{
    requestedBy?: string;
    suggestedRole?: string;
  }>({});
  const [action, setAction] = useState(0);
  const [layout, setLayout] = useState<LayoutParams>('normal');
  const [newLayout, setNewLayout] = useState<LayoutParams>('normal');
  const [newRole, setNewRole] = useState(trackId?.peerRefrence?.role);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [recordingModal, setRecordingModal] = useState(false);
  const [hlsStreamingModal, setHLSStreamingModal] = useState(false);
  const [recordingDetails, setRecordingDetails] = useState<HMSRTMPConfig>({
    record: false,
    meetingURL: state.user.roomID
      ? state.user.roomID + '?token=beam_recording'
      : '',
    rtmpURLs: [],
  });
  const [rtcStats, setRtcStats] = useState<HMSRTCStatsReport>();
  const [hlsStreamingDetails, setHLSStreamingDetails] =
    useState<HMSHLSMeetingURLVariant>({
      meetingUrl: state.user.roomID
        ? state.user.roomID + '?token=beam_recording'
        : '',
      metadata: '',
    });
  const [hlsRecordingDetails, setHLSRecordingDetails] =
    useState<HMSHLSRecordingConfig>({
      singleFilePerLayer: false,
      videoOnDemand: false,
    });
  const [roleChangeModalVisible, setRoleChangeModalVisible] = useState(false);
  const [layoutModal, setLayoutModal] = useState(false);
  const [changeTrackStateModalVisible, setChangeTrackStateModalVisible] =
    useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [localPeerPermissions, setLocalPeerPermissions] =
    useState<HMSPermissions>();
  const hlsPlayerRef = useRef<Video>(null);
  const [page, setPage] = useState(0);
  const [zoomableTrackId, setZoomableTrackId] = useState('');
  const [zoomableModal, setZoomableModal] = useState(false);
  const [changeNameModal, setChangeNameModal] = useState(false);
  const [statsForNerds, setStatsForNerds] = useState(false);

  const roleChangeRequestTitle = layoutModal
    ? 'Layout Modal'
    : recordingModal
    ? 'Recording Details'
    : hlsStreamingModal
    ? 'HLS Streaming Details'
    : roleChangeModalVisible
    ? 'Role Change Request'
    : changeTrackStateModalVisible
    ? 'Change Track State Request'
    : '';
  const roleChangeRequestButtons: [
    {text: string; onPress?: Function},
    {text: string; onPress?: Function},
  ] = layoutModal
    ? [
        {text: 'Cancel'},
        {
          text: 'Set',
          onPress: async () => {
            setLayout(newLayout);
          },
        },
      ]
    : hlsStreamingModal
    ? [
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
      ]
    : recordingModal
    ? [
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
      ]
    : roleChangeModalVisible
    ? [
        {text: 'Reject'},
        {
          text: 'Accept',
          onPress: () => {
            instance?.acceptRoleChange();
          },
        },
      ]
    : changeTrackStateModalVisible
    ? [
        {text: 'Reject'},
        {
          text: 'Accept',
          onPress: () => {
            if (
              roleChangeRequest?.suggestedRole?.toLocaleLowerCase() === 'video'
            ) {
              setTrackId({
                ...trackId,
                isVideoMute: false,
              });
              instance?.localPeer?.localVideoTrack()?.setMute(false);
            } else {
              setTrackId({
                ...trackId,
                isAudioMute: false,
              });
              instance?.localPeer?.localAudioTrack()?.setMute(false);
            }
          },
        },
      ]
    : [{text: 'Reject'}, {text: 'Accept'}];

  const navigate = useNavigation<MeetingScreenProp>().navigate;

  const pairedPeers: Array<Array<Peer>> = pairDataForScrollView(
    [...auxTracks, trackId, ...remoteTrackIds].filter(peer => {
      if (peer?.peerRefrence?.role?.name?.includes('hls-')) {
        return false;
      }
      return true;
    }),
    isPortrait() ? (layout === 'audio' ? 6 : 4) : 2,
  );

  const updateVideoIds = (
    remotePeers: HMSRemotePeer[],
    localPeer?: HMSLocalPeer,
  ) => {
    if (localPeer) {
      const localTrackTemp = decodeLocalPeer(localPeer, 'local');
      setTrackId(localTrackTemp);
    }
    const updatedLocalPeerPermissions = localPeer?.role?.permissions;
    setLocalPeerPermissions(updatedLocalPeerPermissions);

    const remoteVideoIds: Peer[] = [];
    let newAuxTracks: Peer[] = [];

    if (remotePeers) {
      remotePeers.map((remotePeer: HMSRemotePeer) => {
        const remoteTemp = decodeRemotePeer(remotePeer, 'remote');
        remoteVideoIds.push(remoteTemp);

        let auxiliaryTracks = remotePeer?.auxiliaryTracks;
        // let auxAudioTrack: HMSTrack | undefined;
        let auxVideoTrack: Peer | undefined;

        let auxTrackObj: any = {};

        auxiliaryTracks?.map((track: HMSTrack) => {
          let auxTrackId = track?.trackId;
          if (auxTrackId && track?.type === HMSTrackType.AUDIO) {
            let key = track?.source;
            if (key) {
              auxTrackObj[key] = track;
            }
          }
        });

        auxiliaryTracks?.map((track: HMSTrack) => {
          let auxTrackId = track?.trackId;
          if (auxTrackId && track?.type === HMSTrackType.VIDEO) {
            auxVideoTrack = {
              trackId: auxTrackId,
              name: `${remotePeer?.name}'s Screen`,
              isAudioMute: true,
              isVideoMute: false,
              id: `${remotePeer?.peerID}_${auxTrackId}`,
              colour: getThemeColour(),
              sink: true,
              type: 'screen',
              track: auxTrackObj[track.source ? track.source : ' '],
            };
          }
        });
        if (auxVideoTrack !== undefined) {
          newAuxTracks.push({...(auxVideoTrack as Peer)});
        }
      });
      setAuxTracks(newAuxTracks);

      const updatedRemoteTracks = remoteVideoIds.map(
        (item: Peer, index: number) => {
          if (item.trackId) {
            return {...item};
          } else {
            return {...item, trackId: index.toString(), isVideoMute: true};
          }
        },
      );
      setRemoteTrackIds(updatedRemoteTracks as []);
    }
  };

  const onJoinListener = ({
    room,
    localPeer,
    remotePeers,
  }: {
    room?: HMSRoom;
    localPeer: HMSLocalPeer;
    remotePeers: HMSRemotePeer[];
  }) => {
    console.log('data in onJoinListener: ', room, localPeer, remotePeers);
  };

  const onRoomListener = ({
    room,
    type,
    localPeer,
    remotePeers,
  }: {
    room?: HMSRoom;
    type?: HMSRoomUpdate;
    localPeer: HMSLocalPeer;
    remotePeers: HMSRemotePeer[];
  }) => {
    updateVideoIds(remotePeers, localPeer);
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
    console.log('data in onRoomListener: ', room, type, localPeer, remotePeers);
  };

  const onPeerListener = ({
    peer,
    room,
    type,
    remotePeers,
    localPeer,
  }: {
    peer: HMSPeer;
    room?: HMSRoom;
    type?: HMSPeerUpdate;
    localPeer: HMSLocalPeer;
    remotePeers: HMSRemotePeer[];
  }) => {
    updateVideoIds(remotePeers, localPeer);
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
      peer,
      room,
      type,
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
    peer: HMSPeer;
    track: HMSTrack;
    room?: HMSRoom;
    type?: HMSTrackUpdate;
    localPeer: HMSLocalPeer;
    remotePeers: HMSRemotePeer[];
  }) => {
    updateVideoIds(remotePeers, localPeer);
    console.log(
      'data in onTrackListener: ',
      peer,
      track,
      room,
      type,
      localPeer,
      remotePeers,
    );
  };

  const onMessage = (data: HMSMessage) => {
    addMessageRequest({data, isLocal: false});
    setNotification(true);
    console.log('data in onMessage: ', data);
  };

  const onError = (data: HMSException) => {
    console.log('data in onError: ', data);
    Toast.showWithGravity(
      data?.error.message || 'Something went wrong',
      Toast.LONG,
      Toast.TOP,
    );
  };

  const onSpeaker = (data: HMSSpeakerUpdate) => {
    const peerIds = data?.peers?.map(speaker => speaker?.peer?.peerID);
    setSpeakerIds(peerIds || []);
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
    setRoleChangeModalVisible(true);
    setRoleChangeRequest({
      requestedBy: data?.requestedBy?.name,
      suggestedRole: data?.suggestedRole?.name,
    });
  };

  const onChangeTrackStateRequest = (data: HMSChangeTrackStateRequest) => {
    console.log('data in onChangeTrackStateRequest: ', data);
    if (!data?.mute) {
      setChangeTrackStateModalVisible(true);
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
    clearMessageRequest();
    navigate('WelcomeScreen');
  };

  const updateHmsInstance = (hms: HMSSDK | undefined) => {
    console.log('data in updateHmsInstance: ', hms);
    setInstance(hms);
    hms?.addEventListener(HMSUpdateListenerActions.ON_JOIN, onJoinListener);

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

    hms?.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);

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
    Dimensions.addEventListener('change', () => {
      setOrientation(isPortrait());
    });

    const backAction = () => {
      setLeaveModalVisible(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      backHandler.remove();
      Dimensions.removeEventListener('change', () => {
        setOrientation(!orientation);
      });
      instance?.leave();
      navigate('WelcomeScreen');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateHmsInstance(hmsInstance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hmsInstance]);

  useEffect(() => {
    if (instance) {
      const remotePeers = instance?.remotePeers ? instance.remotePeers : [];
      updateVideoIds(remotePeers, instance?.localPeer);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance]);

  const getRemoteVideoStyles = () => {
    return styles.generalTile;
  };

  const getAuxVideoStyles = () => {
    return isPortrait() ? styles.fullScreenTile : styles.fullScreenLandscape;
  };

  const getMessageToList = (): Array<{
    name: string;
    type: string;
    obj: any;
  }> => {
    const messageList: any = [
      {
        name: 'everyone',
        type: 'everyone',
        obj: {},
      },
    ];
    const knownRoles = instance?.knownRoles?.map((role: HMSRole) => ({
      name: role?.name,
      type: 'group',
      obj: role,
    }));
    const peers = remoteTrackIds.map(track => ({
      name: track?.name,
      type: 'direct',
      obj: track,
    }));
    if (knownRoles) {
      messageList.push(...knownRoles);
    }
    if (peers) {
      messageList.push(...peers);
    }
    return messageList;
  };

  const getSettingButtons = () => {
    const buttons: Array<{text: string; type?: string; onPress?: Function}> = [
      {
        text: 'Cancel',
        type: 'cancel',
      },
      {
        text: 'Set Layout',
        onPress: () => {
          setLayoutModal(true);
        },
      },
      {
        text: 'Report issue and share logs',
        onPress: async () => {
          await checkPermissionToWriteExternalStroage();
        },
      },
      {
        text: 'Start RTMP or Recording',
        onPress: () => {
          setRecordingModal(true);
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
          setHLSStreamingModal(true);
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
              instance?.startScreenshare();
            },
          },
          {
            text: 'Stop Screenshare',
            onPress: () => {
              instance?.stopScreenshare();
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
    if (localPeerPermissions?.mute) {
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
              setRoleModalVisible(true);
              setAction(1);
            },
          },
          {
            text: 'Mute audio of custom roles',
            onPress: () => {
              setRoleModalVisible(true);
              setAction(3);
            },
          },
        ],
      );
    }
    if (localPeerPermissions?.unmute) {
      buttons.push(
        ...[
          {
            text: 'Unmute video of custom roles',
            onPress: () => {
              setRoleModalVisible(true);
              setAction(2);
            },
          },

          {
            text: 'Unmute audio of custom roles',
            onPress: () => {
              setRoleModalVisible(true);
              setAction(4);
            },
          },
        ],
      );
    }
    return buttons;
  };

  const getRoleRequestButtons = () => {
    const roleRequestButtons: [
      {text: string; onPress?: Function},
      {text: string; onPress?: Function}?,
    ] = [
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
    return roleRequestButtons;
  };

  const getButtons = (permissions?: HMSPermissions) => {
    const buttons = [
      {
        text: 'Cancel',
        type: 'cancel',
      },
      {
        text: 'Leave without ending room',
        onPress: async () => {
          await instance?.leave();
          clearMessageRequest();
          navigate('WelcomeScreen');
        },
      },
    ];
    if (permissions?.endRoom) {
      buttons.push({
        text: 'End Room for all',
        onPress: async () => {
          await instance?.endRoom('Host ended the room');
          clearMessageRequest();
          navigate('WelcomeScreen');
        },
      });
    }
    return buttons;
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
    auxTracks.map(track => {
      if (track.trackId === id) {
        idPresent = true;
      }
    });
    return idPresent;
  };

  const HmsViewComponent = instance?.HmsView;

  return (
    <SafeAreaView style={styles.container}>
      <CustomModal
        modalVisible={roleChangeModalVisible}
        setModalVisible={setRoleChangeModalVisible}
        title={roleChangeRequestTitle}
        buttons={roleChangeRequestButtons}>
        <Text style={styles.roleChangeText}>
          Role change requested by{' '}
          {roleChangeRequest?.requestedBy?.toLocaleUpperCase()}. Changing role
          to {roleChangeRequest?.suggestedRole?.toLocaleUpperCase()}
        </Text>
      </CustomModal>
      <CustomModal
        modalVisible={recordingModal}
        setModalVisible={setRecordingModal}
        title={roleChangeRequestTitle}
        buttons={roleChangeRequestButtons}>
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
        modalVisible={hlsStreamingModal}
        setModalVisible={setHLSStreamingModal}
        title={roleChangeRequestTitle}
        buttons={roleChangeRequestButtons}>
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
        modalVisible={changeTrackStateModalVisible}
        setModalVisible={setChangeTrackStateModalVisible}
        title={roleChangeRequestTitle}
        buttons={roleChangeRequestButtons}>
        <Text style={styles.roleChangeText}>
          {roleChangeRequest?.requestedBy?.toLocaleUpperCase()} requested to
          unmute your regular{' '}
          {roleChangeRequest?.suggestedRole?.toLocaleUpperCase()}.
        </Text>
      </CustomModal>
      <AlertModal
        modalVisible={leaveModalVisible}
        setModalVisible={setLeaveModalVisible}
        title="End Room"
        message=""
        buttons={getButtons(localPeerPermissions)}
      />
      <AlertModal
        modalVisible={settingsModal}
        setModalVisible={setSettingsModal}
        title="Settings"
        message=""
        buttons={getSettingButtons()}
      />
      <CustomModal
        modalVisible={roleModalVisible}
        setModalVisible={setRoleModalVisible}
        title="Select action"
        buttons={getRoleRequestButtons()}>
        <RolePicker
          data={instance?.knownRoles || []}
          selectedItem={newRole}
          onItemSelected={setNewRole}
        />
      </CustomModal>
      <CustomModal
        modalVisible={layoutModal}
        setModalVisible={setLayoutModal}
        title={roleChangeRequestTitle}
        buttons={roleChangeRequestButtons}>
        <Picker
          selectedValue={newLayout}
          onValueChange={setNewLayout}
          dropdownIconColor="black"
          dropdownIconRippleColor="grey">
          {[{name: 'normal'}, {name: 'audio'}, {name: 'active speaker'}].map(
            (item, index) => (
              <Picker.Item key={index} label={item.name} value={item.name} />
            ),
          )}
        </Picker>
      </CustomModal>
      <View style={styles.headerContainer}>
        <Text style={styles.headerName}>{trackId?.name}</Text>
        <View style={styles.headerRight}>
          {instance?.room?.browserRecordingState?.running && (
            <Entypo
              name="controller-record"
              style={styles.recording}
              size={dimension.viewHeight(30)}
            />
          )}
          {(instance?.room?.hlsStreamingState?.running ||
            instance?.room?.rtmpHMSRtmpStreamingState?.running) && (
            <Entypo
              name="light-up"
              style={styles.streaming}
              size={dimension.viewHeight(30)}
            />
          )}
          {trackId?.peerRefrence?.auxiliaryTracks &&
            trackId?.peerRefrence?.auxiliaryTracks?.length > 0 && (
              <MaterialIcons
                name="fit-screen"
                style={styles.streaming}
                size={dimension.viewHeight(30)}
              />
            )}
          {trackId?.peerRefrence?.role?.publishSettings?.allowed?.includes(
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
                instance?.setPlaybackForAllAudio(!muteAllAudio);
                setMuteAllAudio(!muteAllAudio);
              }}
              style={styles.headerIcon}>
              <Ionicons
                name={muteAllAudio ? 'volume-mute' : 'volume-high'}
                style={styles.headerName}
                size={dimension.viewHeight(30)}
              />
            </TouchableOpacity>
          )}
          {!instance?.localPeer?.role?.name?.includes('hls-') && (
            <TouchableOpacity
              onPress={() => {
                setSettingsModal(true);
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
          instance?.room?.hlsStreamingState?.running ? (
            instance?.room?.hlsStreamingState?.variants
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
        ) : layout === 'active speaker' ? (
          <ActiveSpeakerView
            Dimensions={Dimensions}
            speakerIds={speakerIds}
            speakers={speakers}
            instance={instance}
            localPeerPermissions={localPeerPermissions}
            layout={layout}
            getRemoteVideoStyles={getRemoteVideoStyles}
            state={state}
            setChangeNameModal={setChangeNameModal}
            statsForNerds={statsForNerds}
            rtcStats={rtcStats}
            remoteAudioStats={remoteAudioStats}
            remoteVideoStats={remoteVideoStats}
            localAudioStats={localAudioStats}
            localVideoStats={localVideoStats}
            setPage={setPage}
            setZoomableModal={setZoomableModal}
            setZoomableTrackId={setZoomableTrackId}
            getAuxVideoStyles={getAuxVideoStyles}
            page={page}
            setRemoteTrackIds={setRemoteTrackIds}
            decodeRemotePeer={decodeRemotePeer}
            hmsInstance={hmsInstance}
          />
        ) : !(fetchZoomableId(zoomableTrackId) && zoomableModal) ? (
          <SwipeableView
            pairedPeers={pairedPeers}
            setPage={setPage}
            Dimensions={Dimensions}
            setZoomableModal={setZoomableModal}
            setZoomableTrackId={setZoomableTrackId}
            getAuxVideoStyles={getAuxVideoStyles}
            speakerIds={speakerIds}
            instance={instance}
            localPeerPermissions={localPeerPermissions}
            layout={layout}
            getRemoteVideoStyles={getRemoteVideoStyles}
            state={state}
            setChangeNameModal={setChangeNameModal}
            statsForNerds={statsForNerds}
            rtcStats={rtcStats}
            remoteAudioStats={remoteAudioStats}
            remoteVideoStats={remoteVideoStats}
            localAudioStats={localAudioStats}
            localVideoStats={localVideoStats}
            page={page}
            setRemoteTrackIds={setRemoteTrackIds}
            decodeRemotePeer={decodeRemotePeer}
            hmsInstance={hmsInstance}
          />
        ) : (
          <View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setZoomableModal(false);
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
                  sink={true}
                  trackId={zoomableTrackId}
                  mirror={false}
                  scaleType={HMSVideoViewMode.ASPECT_FIT}
                  style={styles.hmsViewScreen}
                />
              )}
            </ZoomableView>
          </View>
        )}
      </View>
      <View style={styles.iconContainers}>
        {trackId?.peerRefrence?.role?.publishSettings?.allowed?.includes(
          'audio',
        ) && (
          <TouchableOpacity
            style={styles.singleIconContainer}
            onPress={() => {
              instance?.localPeer
                ?.localAudioTrack()
                ?.setMute(!trackId.isAudioMute);
              setTrackId({
                ...trackId,
                isAudioMute: !trackId.isAudioMute,
              });
            }}>
            <Feather
              name={trackId.isAudioMute ? 'mic-off' : 'mic'}
              style={styles.videoIcon}
              size={dimension.viewHeight(30)}
            />
          </TouchableOpacity>
        )}
        {trackId?.peerRefrence?.role?.publishSettings?.allowed?.includes(
          'video',
        ) && (
          <TouchableOpacity
            style={styles.singleIconContainer}
            onPress={() => {
              instance?.localPeer
                ?.localVideoTrack()
                ?.setMute(!trackId.isVideoMute);
              setTrackId({
                ...trackId,
                isVideoMute: !trackId.isVideoMute,
              });
            }}>
            <Feather
              name={trackId.isVideoMute ? 'video-off' : 'video'}
              style={styles.videoIcon}
              size={dimension.viewHeight(30)}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={() => {
            setModalVisible(true);
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
            instance?.changeMetadata(
              JSON.stringify({
                ...trackId?.metadata,
                isHandRaised: !trackId?.metadata?.isHandRaised,
              }),
            );
          }}>
          <Ionicons
            name={
              trackId?.metadata?.isHandRaised
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
            instance?.changeMetadata(
              JSON.stringify({
                ...trackId?.metadata,
                isBRBOn: !trackId?.metadata?.isBRBOn,
              }),
            );
          }}>
          {trackId?.metadata?.isBRBOn ? (
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
            setLeaveModalVisible(true);
          }}>
          <Feather
            name="phone-off"
            style={styles.leaveIcon}
            size={dimension.viewHeight(30)}
          />
        </TouchableOpacity>
      </View>
      {modalVisible && (
        <ChatWindow
          messages={messages}
          cancel={() => {
            setModalVisible(false);
            setNotification(false);
          }}
          messageToList={getMessageToList()}
          send={async (
            value: string,
            messageTo: {name: string; type: string; obj: any},
          ) => {
            if (value.length > 0) {
              const hmsMessage = new HMSMessage({
                type: 'chat',
                time: new Date().toISOString(),
                message: value,
              });
              if (messageTo?.type === 'everyone') {
                await instance?.sendBroadcastMessage(value);
              } else if (messageTo?.type === 'group') {
                await instance?.sendGroupMessage(value, [messageTo?.obj]);
              } else if (messageTo.type === 'direct') {
                await instance?.sendDirectMessage(
                  value,
                  messageTo?.obj?.peerRefrence,
                );
              }
              addMessageRequest({
                data: hmsMessage,
                isLocal: true,
                name: messageTo?.name,
              });
            }
          }}
        />
      )}
      {changeNameModal && (
        <UserIdModal
          screen="Meeting"
          join={async (newName: string) => {
            if (newName && newName != '') {
              instance?.changeName(newName);
              saveUserDataRequest &&
                saveUserDataRequest({
                  userName: newName,
                });
            }
            setChangeNameModal(false);
          }}
          cancel={() => setChangeNameModal(false)}
          userName={instance?.localPeer?.name}
        />
      )}
    </SafeAreaView>
  );
};

const mapDispatchToProps = (dispatch: Function) => ({
  addMessageRequest: (data: any) => dispatch(addMessage(data)),
  clearMessageRequest: () => dispatch(clearMessageData()),
  updateHms: (data: {hmsInstance: HMSSDK}) =>
    dispatch(updateHmsReference(data)),
  saveUserDataRequest: (data: {userName: string; roomID: string}) =>
    dispatch(saveUserData(data)),
});

const mapStateToProps = (state: RootState) => ({
  messages: state?.messages?.messages,
  audioState: state?.app?.audioState,
  videoState: state?.app?.videoState,
  hmsInstance: state?.user?.hmsInstance,
  roomID: state.user.roomID,
  state: state,
});

export default connect(mapStateToProps, mapDispatchToProps)(Meeting);
