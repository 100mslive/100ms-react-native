import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  BackHandler,
  Platform,
  TextInput,
  Dimensions,
  ScrollView,
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
  HMSTrackSource,
} from '@100mslive/react-native-hms';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Toast from 'react-native-simple-toast';
import RNFetchBlob from 'rn-fetch-blob';
import {Picker} from '@react-native-picker/picker';
import Video from 'react-native-video';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Slider} from '@miblanchard/react-native-slider';

import {styles} from './styles';
import type {AppStackParamList} from '../../navigator';
import {
  ChatWindow,
  AlertModal,
  CustomModal,
  RolePicker,
  ZoomableView,
  CustomButton,
  DefaultModal,
  CustomInput,
  Menu,
  MenuItem,
  MenuDivider,
} from '../../components';
import {
  addMessage,
  clearHmsReference,
  clearMessageData,
  clearPeerData,
  saveUserData,
} from '../../redux/actions';
import type {RootState} from '../../redux';
import {
  pairDataForFlatlist,
  parseMetadata,
  writeFile,
  requestExternalStoragePermission,
  updatePeersTrackNodesOnPeerListener,
  updatePeersTrackNodesOnTrackListener,
  isPortrait,
  getInitials,
} from '../../utils/functions';
import {
  LayoutParams,
  ModalTypes,
  PeerTrackNode,
  SortingType,
  TrackType,
} from '../../utils/types';
import {GridView} from './Grid';
import {ActiveSpeakerView} from './ActiveSpeakerView';
import {HeroView} from './HeroView';
import {MiniView} from './MiniView';
import {COLORS} from '../../utils/theme';

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
  const [pinnedPeerTrackIds, setPinnedPeerTrackIds] = useState<Array<String>>(
    [],
  );
  const [hmsRoom, setHmsRoom] = useState<HMSRoom>();
  const peerTrackNodesRef = React.useRef(peerTrackNodes);
  const HmsViewComponent = instance?.HmsView;
  const [speakers, setSpeakers] = useState<Array<HMSSpeaker>>([]);
  const [notification, setNotification] = useState(false);
  const [muteAllTracksAudio, setMuteAllTracksAudio] = useState(false);
  const [action, setAction] = useState(0);
  const [layout, setLayout] = useState<LayoutParams>(LayoutParams.GRID);
  const [sortingType, setSortingType] = useState<SortingType>();
  const [selectedSortingType, setSelectedSortingType] = useState<SortingType>();
  const [newLayout, setNewLayout] = useState<LayoutParams>(layout);
  const [newRole, setNewRole] = useState(instance?.localPeer?.role);
  const [rtcStats, setRtcStats] = useState<HMSRTCStatsReport>();
  const hlsPlayerRef = useRef<Video>(null);
  const [page, setPage] = useState(0);
  const [zoomableTrackId, setZoomableTrackId] = useState('');
  const [statsForNerds, setStatsForNerds] = useState(false);
  const [orientation, setOrientation] = useState<boolean>(true);
  const [updatePeerTrackNode, setUpdatePeerTrackNode] = useState<PeerTrackNode>(
    peerTrackNodes[0],
  );
  const pairedPeers = useMemo(
    () =>
      pairDataForFlatlist(
        peerTrackNodes,
        orientation
          ? layout === LayoutParams.AUDIO
            ? 6
            : 4
          : layout === LayoutParams.AUDIO
          ? 3
          : 2,
        selectedSortingType,
        pinnedPeerTrackIds,
      ),
    [
      layout,
      peerTrackNodes,
      orientation,
      selectedSortingType,
      pinnedPeerTrackIds,
    ],
  );
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
  });
  const [resolutionDetails, setResolutionDetails] = useState<boolean>(false);
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
  const {bottom, left, right} = useSafeAreaInsets();
  const parsedMetadata = parseMetadata(instance?.localPeer?.metadata);
  const isScreenShared =
    instance?.localPeer?.auxiliaryTracks &&
    instance?.localPeer?.auxiliaryTracks?.length > 0;

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
      case ModalTypes.SORTING:
        modalTitle = 'Sorting Style';
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
      case ModalTypes.RESOLUTION:
        modalTitle = 'Resolution Details';
        break;
      case ModalTypes.LEAVE:
        modalTitle = 'End Room';
        break;
      case ModalTypes.HLS_STREAMING:
        modalTitle = 'HLS Streaming Details';
        break;
      case ModalTypes.CHANGE_ROLE_ACCEPT:
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
      case ModalTypes.SORTING:
        buttons = [
          {text: 'Cancel'},
          {
            text: 'Set',
            onPress: () => {
              setSelectedSortingType(sortingType);
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
              const source = HMSTrackSource.REGULAR;
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
            text: 'Set Sorting Style',
            onPress: () => {
              setModalVisible(ModalTypes.SORTING);
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
            text: parsedMetadata?.isBRBOn ? 'Remove BRB' : 'Set BRB',
            onPress: () => {
              instance?.changeMetadata(
                JSON.stringify({
                  ...parsedMetadata,
                  isBRBOn: !parsedMetadata?.isBRBOn,
                  isHandRaised: false,
                }),
              );
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
        ];
        if (Platform.OS === 'android') {
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
        if (!instance?.localPeer?.role?.name?.includes('hls-')) {
          buttons.push({
            text: muteAllTracksAudio
              ? 'Local unmute all audio tracks'
              : 'Local mute all audio tracks',
            onPress: () => {
              instance?.setPlaybackForAllAudio(!muteAllTracksAudio);
              setMuteAllTracksAudio(!muteAllTracksAudio);
            },
          });
        }
        break;
      case ModalTypes.RESOLUTION:
        buttons = [{text: 'Back'}];
        break;
      case ModalTypes.RECORDING:
        buttons = [
          {text: 'Cancel'},
          {
            text: 'Start',
            onPress: () => {
              // Resolution width
              // Range is [500, 1280].
              // Default value is 1280.
              // If resolution height > 720 then max resolution width = 720.

              // Resolution height
              // Reange is [480, 1280].
              // Default resolution width is 720.
              // If resolution width > 720 then max resolution height = 720.
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
              await onLeavePress();
            },
          },
        ];
        if (instance?.localPeer?.role?.permissions?.endRoom) {
          buttons.push({
            text: 'End Room for all',
            onPress: () => {
              onEndRoomPress();
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
      case ModalTypes.CHANGE_ROLE_ACCEPT:
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

  const onLeavePress = async () => {
    await instance?.leave();
    await instance
      ?.destroy()
      .then(d => console.log('Destroy Success: ', d))
      .catch(e => console.log('Destroy Error: ', e));
    dispatch(clearMessageData());
    dispatch(clearPeerData());
    dispatch(clearHmsReference());
    navigate('QRCodeScreen');
  };

  const onEndRoomPress = async () => {
    await instance?.endRoom('Host ended the room');
    await instance
      ?.destroy()
      .then(d => console.log('Destroy Success: ', d))
      .catch(e => console.log('Destroy Error: ', e));
    dispatch(clearMessageData());
    dispatch(clearPeerData());
    dispatch(clearHmsReference());
    navigate('QRCodeScreen');
  };

  const onRaiseHandPress = () => {
    instance?.changeMetadata(
      JSON.stringify({
        ...parsedMetadata,
        isHandRaised: !parsedMetadata?.isHandRaised,
        isBRBOn: false,
      }),
    );
  };

  const onSwitchCameraPress = () => {
    instance?.localPeer?.localVideoTrack()?.switchCamera();
  };

  const onMicStatusPress = () => {
    instance?.localPeer
      ?.localAudioTrack()
      ?.setMute(!instance?.localPeer?.audioTrack?.isMute());
  };

  const onVideoStatusPress = () => {
    instance?.localPeer
      ?.localVideoTrack()
      ?.setMute(!instance?.localPeer?.videoTrack?.isMute());
  };

  const onStartScreenSharePress = () => {
    if (Platform.OS === 'android') {
      instance
        ?.startScreenshare()
        .then(d => console.log('Start Screenshare Success: ', d))
        .catch(e => console.log('Start Screenshare Error: ', e));
    } else {
      Toast.showWithGravity('Api not available for iOS', Toast.LONG, Toast.TOP);
    }
  };

  const onEndScreenSharePress = () => {
    if (Platform.OS === 'android') {
      instance
        ?.stopScreenshare()
        .then(d => console.log('Stop Screenshare Success: ', d))
        .catch(e => console.log('Stop Screenshare Error: ', e));
    } else {
      Toast.showWithGravity('Api not available for iOS', Toast.LONG, Toast.TOP);
    }
  };

  const onGoLivePress = () => {
    setModalVisible(ModalTypes.HLS_STREAMING);
  };

  const onEndLivePress = () => {
    instance
      ?.stopHLSStreaming()
      .then(d => console.log('Stop HLS Streaming Success: ', d))
      .catch(e => console.log('Stop HLS Streaming Error: ', e));
  };

  const onSettingsPress = () => {
    setModalVisible(ModalTypes.SETTINGS);
  };

  const onParticipantsPress = () => {
    setModalVisible(ModalTypes.PARTICIPANTS);
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
      peerTrackNodesRef?.current,
      peer,
      type,
    );
    setPeerTrackNodes(newPeerTrackNodes);
    peerTrackNodesRef.current = newPeerTrackNodes;
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
      peerTrackNodesRef?.current,
      track,
      peer,
      type,
    );
    setPeerTrackNodes(newPeerTrackNodes);
    peerTrackNodesRef.current = newPeerTrackNodes;
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

  const onSpeaker = (data: HMSSpeaker[]) => {
    setSpeakers(data || []);
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
    setModalVisible(ModalTypes.CHANGE_ROLE_ACCEPT);
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
    onLeavePress();
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
    updateHmsInstance(hmsInstance);
    setHmsRoom(hmsInstance?.room);

    const callback = () => setOrientation(isPortrait());
    callback();
    Dimensions.addEventListener('change', callback);

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
      Dimensions.removeEventListener('change', callback);
      onLeavePress();
    };
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
        modalVisible={modalVisible === ModalTypes.CHANGE_ROLE_ACCEPT}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
        title={getModalTitle(ModalTypes.CHANGE_ROLE_ACCEPT)}
        buttons={getModalButtons(ModalTypes.CHANGE_ROLE_ACCEPT)}>
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
              setRecordingDetails({...recordingDetails, rtmpURLs: undefined});
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
          <Text style={styles.interRegular}>Record</Text>
          <View style={styles.checkboxContainer}>
            {recordingDetails.record && (
              <Entypo name="check" style={styles.checkbox} size={20} />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setResolutionDetails(!resolutionDetails);
            if (!resolutionDetails) {
              setModalVisible(ModalTypes.RESOLUTION);
              setRecordingDetails({
                ...recordingDetails,
                resolution: {
                  height: 720,
                  width: 1280,
                },
              });
            } else {
              setRecordingDetails({
                ...recordingDetails,
                resolution: undefined,
              });
            }
          }}
          style={styles.recordingDetails}>
          <Text style={styles.interRegular}>Resolution</Text>
          <View style={styles.checkboxContainer}>
            {resolutionDetails && (
              <Entypo name="check" style={styles.checkbox} size={20} />
            )}
          </View>
        </TouchableOpacity>
      </CustomModal>
      <CustomModal
        modalVisible={modalVisible === ModalTypes.RESOLUTION}
        setModalVisible={() => setModalVisible(ModalTypes.RECORDING)}
        title={getModalTitle(ModalTypes.RESOLUTION)}
        buttons={getModalButtons(ModalTypes.RESOLUTION)}>
        <View style={styles.resolutionContainer}>
          <View style={styles.resolutionDetails}>
            <Text style={styles.interRegular}>Height :</Text>
            <Text style={styles.resolutionValue}>
              {recordingDetails.resolution?.height}
            </Text>
          </View>
          <Slider
            value={recordingDetails.resolution?.height}
            maximumValue={1280}
            minimumValue={480}
            step={10}
            onValueChange={(value: any) => {
              setRecordingDetails({
                ...recordingDetails,
                resolution: {
                  height: parseInt(value),
                  width: recordingDetails.resolution?.width ?? 1280,
                },
              });
            }}
          />
          <View style={styles.resolutionDetails}>
            <Text style={styles.interRegular}>Width :</Text>
            <Text style={styles.resolutionValue}>
              {recordingDetails.resolution?.width}
            </Text>
          </View>
          <Slider
            value={recordingDetails.resolution?.width}
            maximumValue={1280}
            minimumValue={500}
            step={10}
            onValueChange={(value: any) => {
              setRecordingDetails({
                ...recordingDetails,
                resolution: {
                  width: parseInt(value),
                  height: recordingDetails.resolution?.height ?? 720,
                },
              });
            }}
          />
        </View>
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
          <Text style={styles.interRegular}>singleFilePerLayer</Text>
          <View style={styles.checkboxContainer}>
            {hlsRecordingDetails.singleFilePerLayer && (
              <Entypo name="check" style={styles.checkbox} size={20} />
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
          <Text style={styles.interRegular}>videoOnDemand</Text>
          <View style={styles.checkboxContainer}>
            {hlsRecordingDetails.videoOnDemand && (
              <Entypo name="check" style={styles.checkbox} size={20} />
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
          dropdownIconColor={COLORS.BLACK}
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
      <CustomModal
        modalVisible={modalVisible === ModalTypes.SORTING}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
        title={getModalTitle(ModalTypes.SORTING)}
        buttons={getModalButtons(ModalTypes.SORTING)}>
        <Picker
          selectedValue={sortingType}
          onValueChange={setSortingType}
          dropdownIconColor={COLORS.BLACK}
          dropdownIconRippleColor="grey">
          {[
            {name: 'Select'},
            {name: SortingType.ALPHABETICAL},
            {name: SortingType.VIDEO_ON},
            {name: SortingType.ROLE_PRIORITY},
          ].map((item, index) => (
            <Picker.Item key={index} label={item.name} value={item.name} />
          ))}
        </Picker>
      </CustomModal>
      <View style={styles.iconTopWrapper}>
        <View style={styles.iconTopSubWrapper}>
          <CustomButton
            onPress={() => {
              setModalVisible(ModalTypes.LEAVE);
            }}
            viewStyle={[styles.iconContainer, styles.leaveIcon]}
            LeftIcon={<Feather name="log-out" style={styles.icon} size={24} />}
          />
          <Text style={styles.headerName}>
            {speakers?.length > 0 && speakers[0]?.peer?.name
              ? `🔊  ${speakers[0]?.peer?.name}`
              : roomCode}
          </Text>
        </View>
        <View style={styles.iconTopSubWrapper}>
          {(hmsRoom?.browserRecordingState?.running ||
            hmsRoom?.hlsRecordingState?.running) && (
            <MaterialCommunityIcons
              name="record-circle-outline"
              style={styles.roomStatus}
              size={24}
            />
          )}
          {(hmsRoom?.hlsStreamingState?.running ||
            hmsRoom?.rtmpHMSRtmpStreamingState?.running) && (
            <Ionicons
              name="globe-outline"
              style={styles.roomStatus}
              size={24}
            />
          )}
          {isScreenShared && (
            <Feather name="copy" style={styles.roomStatus} size={24} />
          )}
          <CustomButton
            onPress={onParticipantsPress}
            viewStyle={styles.iconContainer}
            LeftIcon={<Ionicons name="people" style={styles.icon} size={24} />}
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
                size={24}
              />
            }
          />
          <CustomButton
            onPress={() => {
              setModalVisible(ModalTypes.CHAT);
            }}
            viewStyle={styles.iconContainer}
            LeftIcon={
              <View>
                {notification && <View style={styles.messageDot} />}
                <MaterialCommunityIcons
                  name="message-outline"
                  style={styles.icon}
                  size={24}
                />
              </View>
            }
          />
          {instance?.localPeer?.role?.publishSettings?.allowed?.includes(
            'video',
          ) && (
            <CustomButton
              onPress={onSwitchCameraPress}
              viewStyle={styles.iconContainer}
              LeftIcon={
                <Ionicons
                  name="camera-reverse-outline"
                  style={styles.icon}
                  size={28}
                />
              }
            />
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
                    <Text style={styles.interRegular}>
                      Trying to load empty source...
                    </Text>
                  </View>
                ),
              )
          ) : (
            <View style={styles.renderVideo}>
              <Text style={styles.interRegular}>
                Waiting for the Streaming to start...
              </Text>
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
                size={50}
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
            orientation={orientation}
            speakers={speakers}
            instance={instance}
            peerTrackNodes={peerTrackNodes}
            layout={layout}
            setPage={setPage}
            page={page}
            selectedSortingType={selectedSortingType}
          />
        ) : layout === LayoutParams.HERO ? (
          <HeroView
            peerTrackNodes={peerTrackNodes}
            orientation={orientation}
            speakers={speakers}
            instance={instance}
            setModalVisible={setModalVisible}
          />
        ) : layout === LayoutParams.MINI ? (
          <MiniView
            peerTrackNodes={peerTrackNodes}
            orientation={orientation}
            speakers={speakers}
            instance={instance}
          />
        ) : (
          <GridView
            orientation={orientation}
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
            pinnedPeerTrackIds={pinnedPeerTrackIds}
            setPinnedPeerTrackIds={setPinnedPeerTrackIds}
            setUpdatePeerTrackNode={setUpdatePeerTrackNode}
          />
        )}
      </View>
      <View style={[styles.iconBotttomWrapper, {bottom, left, right}]}>
        <View style={styles.iconBotttomButtonWrapper}>
          <CustomButton
            onPress={onMicStatusPress}
            viewStyle={[
              styles.iconContainer,
              instance?.localPeer?.audioTrack?.isMute() && styles.iconMuted,
            ]}
            LeftIcon={
              <Feather
                name={
                  instance?.localPeer?.audioTrack?.isMute() ? 'mic-off' : 'mic'
                }
                style={styles.icon}
                size={24}
              />
            }
          />
          <CustomButton
            onPress={onVideoStatusPress}
            viewStyle={[
              styles.iconContainer,
              instance?.localPeer?.videoTrack?.isMute() && styles.iconMuted,
            ]}
            LeftIcon={
              <Feather
                name={
                  instance?.localPeer?.videoTrack?.isMute()
                    ? 'video-off'
                    : 'video'
                }
                style={styles.icon}
                size={24}
              />
            }
          />
          {hmsRoom?.hlsStreamingState?.running ? (
            <CustomButton
              onPress={onEndLivePress}
              viewStyle={styles.endLiveIconContainer}
              LeftIcon={
                <Feather name="stop-circle" style={styles.icon} size={36} />
              }
            />
          ) : (
            <CustomButton
              onPress={onGoLivePress}
              viewStyle={styles.goLiveIconContainer}
              LeftIcon={
                <Ionicons name="radio-outline" style={styles.icon} size={48} />
              }
            />
          )}
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
                size={24}
              />
            }
          />
          <CustomButton
            onPress={onSettingsPress}
            viewStyle={styles.iconContainer}
            LeftIcon={
              <MaterialCommunityIcons
                name="dots-vertical"
                style={styles.icon}
                size={28}
              />
            }
          />
        </View>
        {hmsRoom?.hlsStreamingState?.running ? (
          <Text style={styles.liveText}>End stream</Text>
        ) : (
          <Text style={styles.liveText}>Go Live</Text>
        )}
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
      <DefaultModal
        modalVisible={modalVisible === ModalTypes.PARTICIPANTS}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <ParticipantsModal
          peerTrackNodes={peerTrackNodes}
          instance={instance}
          setUpdatePeerTrackNode={setUpdatePeerTrackNode}
          setModalVisible={setModalVisible}
          pinnedPeerTrackIds={pinnedPeerTrackIds}
          setPinnedPeerTrackIds={setPinnedPeerTrackIds}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.CHANGE_ROLE}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <ChangeRoleModal
          instance={instance}
          peerTrackNode={updatePeerTrackNode}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.VOLUME}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <ChangeVolumeModal
          instance={instance}
          peerTrackNode={updatePeerTrackNode}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.CHANGE_NAME}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <ChangeNameModal
          instance={instance}
          peerTrackNode={updatePeerTrackNode}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
    </SafeAreaView>
  );
};

const ParticipantsModal = ({
  instance,
  peerTrackNodes,
  pinnedPeerTrackIds,
  setUpdatePeerTrackNode,
  setModalVisible,
  setPinnedPeerTrackIds,
}: {
  instance?: HMSSDK;
  peerTrackNodes: PeerTrackNode[];
  pinnedPeerTrackIds: String[];
  setUpdatePeerTrackNode: React.Dispatch<React.SetStateAction<PeerTrackNode>>;
  setModalVisible: React.Dispatch<React.SetStateAction<ModalTypes>>;
  setPinnedPeerTrackIds: React.Dispatch<React.SetStateAction<String[]>>;
}) => {
  const [participantsSearchInput, setParticipantsSearchInput] = useState('');
  const [visible, setVisible] = useState<number>(-1);
  const [filteredPeerTrackNodes, setFilteredPeerTrackNodes] =
    useState<PeerTrackNode[]>();
  const [filter, setFilter] = useState('everyone');

  const peerTrackNodePermissions = instance?.localPeer?.role?.permissions;

  const hideMenu = () => setVisible(-1);
  const showMenu = (index: number) => setVisible(index);
  const onItemPress = (peerTrackNode: PeerTrackNode) => {
    hideMenu();
    setUpdatePeerTrackNode(peerTrackNode);
  };
  const changeName = (peerTrackNode: PeerTrackNode) => {
    onItemPress(peerTrackNode);
    setTimeout(() => {
      setModalVisible(ModalTypes.CHANGE_NAME);
    }, 500);
  };
  const changeRole = (peerTrackNode: PeerTrackNode) => {
    onItemPress(peerTrackNode);
    setTimeout(() => {
      setModalVisible(ModalTypes.CHANGE_ROLE);
    }, 500);
  };
  const setVolume = (peerTrackNode: PeerTrackNode) => {
    onItemPress(peerTrackNode);
    setTimeout(() => {
      setModalVisible(ModalTypes.VOLUME);
    }, 500);
  };
  const setPin = (peerTrackNode: PeerTrackNode) => {
    onItemPress(peerTrackNode);
    if (pinnedPeerTrackIds?.includes(peerTrackNode.id)) {
      const newPinnedPeerTrackIds = pinnedPeerTrackIds.filter(
        pinnedPeerTrackId => {
          if (pinnedPeerTrackId === peerTrackNode.id) {
            return false;
          }
          return true;
        },
      );
      setPinnedPeerTrackIds(newPinnedPeerTrackIds);
    } else {
      const newPinnedPeerTrackIds = [peerTrackNode.id, ...pinnedPeerTrackIds];
      setPinnedPeerTrackIds(newPinnedPeerTrackIds);
    }
  };
  // const toggleLocalAudioMute = async (peerTrackNode: PeerTrackNode) => {
  //   onItemPress(peerTrackNode);
  //   let remotePeer = peerTrackNode.peer as HMSRemotePeer;
  //   instance?.remotePeers?.map(item => {
  //     if (item.peerID === remotePeer.peerID) {
  //       remotePeer = item;
  //     }
  //   });
  //   const playbackAllowed = await remotePeer
  //     ?.remoteAudioTrack()
  //     ?.isPlaybackAllowed();
  //   remotePeer?.remoteAudioTrack()?.setPlaybackAllowed(!playbackAllowed);
  // };
  // const toggleLocalVideoMute = async (peerTrackNode: PeerTrackNode) => {
  //   onItemPress(peerTrackNode);
  //   let remotePeer = peerTrackNode.peer as HMSRemotePeer;
  //   instance?.remotePeers?.map(item => {
  //     if (item.peerID === remotePeer.peerID) {
  //       remotePeer = item;
  //     }
  //   });
  //   const playbackAllowed = await remotePeer
  //     ?.remoteVideoTrack()
  //     ?.isPlaybackAllowed();
  //   remotePeer?.remoteVideoTrack()?.setPlaybackAllowed(!playbackAllowed);
  // };
  const removePeer = (peerTrackNode: PeerTrackNode) => {
    onItemPress(peerTrackNode);
    instance
      ?.removePeer(peerTrackNode.peer, 'removed from room')
      .then(d => console.log('Remove Peer Success: ', d))
      .catch(e => console.log('Remove Peer Error: ', e));
  };
  const toggleAudio = (peerTrackNode: PeerTrackNode) => {
    onItemPress(peerTrackNode);
    instance
      ?.changeTrackState(
        peerTrackNode.peer?.audioTrack as HMSTrack,
        !peerTrackNode.peer?.audioTrack?.isMute(),
      )
      .then(d => console.log('Remove Peer Success: ', d))
      .catch(e => console.log('Remove Peer Error: ', e));
  };
  const toggleVideo = (peerTrackNode: PeerTrackNode) => {
    onItemPress(peerTrackNode);
    instance
      ?.changeTrackState(
        peerTrackNode.peer?.videoTrack as HMSTrack,
        !peerTrackNode.peer?.videoTrack?.isMute(),
      )
      .then(d => console.log('Remove Peer Success: ', d))
      .catch(e => console.log('Remove Peer Error: ', e));
  };

  useEffect(() => {
    const newFilteredPeerTrackNodes = peerTrackNodes.filter(peerTrackNode => {
      if (
        participantsSearchInput.length < 1 ||
        peerTrackNode.peer.name.includes(participantsSearchInput) ||
        peerTrackNode.peer.role?.name?.includes(participantsSearchInput)
      ) {
        return true;
      }
      return false;
    });
    if (filter === 'everyone') {
      setFilteredPeerTrackNodes(newFilteredPeerTrackNodes);
    } else if (filter === 'raised hand') {
      const updatedPeerTrackNodes = newFilteredPeerTrackNodes?.filter(
        peerTrackNode => {
          const parsedMetaData = parseMetadata(peerTrackNode?.peer?.metadata);
          return parsedMetaData.isHandRaised === true;
        },
      );
      setFilteredPeerTrackNodes(updatedPeerTrackNodes);
    } else {
      const updatedPeerTrackNodes = newFilteredPeerTrackNodes?.filter(
        peerTrackNode => {
          return peerTrackNode?.peer?.role?.name === filter;
        },
      );
      setFilteredPeerTrackNodes(updatedPeerTrackNodes);
    }
  }, [peerTrackNodes, participantsSearchInput, filter]);

  return (
    <View style={styles.participantContainer}>
      <View style={styles.participantsHeaderContainer}>
        <Text style={styles.participantsHeading}>Participants</Text>
        <ParticipantFilter
          instance={instance}
          filter={filter}
          setFilter={setFilter}
        />
      </View>
      <View>
        <CustomInput
          value={participantsSearchInput}
          onChangeText={setParticipantsSearchInput}
          inputStyle={styles.participantsSearchInput}
          placeholderTextColor={COLORS.TEXT.DISABLED}
          placeholder="Find what you’re looking for"
        />
        <Ionicons
          name="search"
          style={styles.participantsSearchInputIcon}
          size={24}
        />
      </View>
      <ScrollView keyboardShouldPersistTaps="always">
        {filteredPeerTrackNodes?.map((peerTrackNode, index) => {
          const type =
            peerTrackNode.track?.source === HMSTrackSource.REGULAR ||
            peerTrackNode.track?.source === undefined
              ? peerTrackNode.peer.isLocal
                ? TrackType.LOCAL
                : TrackType.REMOTE
              : TrackType.SCREEN;

          return (
            <View style={styles.participantItem} key={peerTrackNode.id}>
              <View style={styles.participantAvatar}>
                <Text style={styles.participantAvatarText}>
                  {getInitials(peerTrackNode.peer.name)}
                </Text>
              </View>
              <View style={styles.participantDescription}>
                <Text style={styles.participantName} numberOfLines={1}>
                  {peerTrackNode.track?.source === HMSTrackSource.REGULAR ||
                  peerTrackNode.track?.source === undefined
                    ? peerTrackNode.peer.name
                    : peerTrackNode.peer.name +
                      "'s " +
                      peerTrackNode.track?.source}
                  {peerTrackNode.peer.isLocal && ' (You)'}
                </Text>
                <Text style={styles.participantRole} numberOfLines={1}>
                  {peerTrackNode.peer.role?.name}
                </Text>
              </View>
              <Menu
                visible={visible === index}
                anchor={
                  <CustomButton
                    onPress={() => showMenu(index)}
                    viewStyle={styles.participantSettings}
                    LeftIcon={
                      <MaterialCommunityIcons
                        name="dots-vertical"
                        style={styles.icon}
                        size={28}
                      />
                    }
                  />
                }
                onRequestClose={hideMenu}
                style={styles.participantsMenuContainer}>
                {peerTrackNode.peer.isLocal === false && (
                  <MenuItem onPress={() => removePeer(peerTrackNode)}>
                    <View style={styles.participantMenuItem}>
                      <MaterialCommunityIcons
                        name="account-remove-outline"
                        style={[styles.participantMenuItemIcon, styles.error]}
                        size={24}
                      />
                      <Text
                        style={[styles.participantMenuItemName, styles.error]}>
                        Remove Peer
                      </Text>
                    </View>
                  </MenuItem>
                )}
                {peerTrackNode.peer.isLocal && type === TrackType.LOCAL && (
                  <MenuItem onPress={() => changeName(peerTrackNode)}>
                    <View style={styles.participantMenuItem}>
                      <Ionicons
                        name="person-outline"
                        style={styles.participantMenuItemIcon}
                        size={24}
                      />
                      <Text style={styles.participantMenuItemName}>
                        Change Name
                      </Text>
                    </View>
                  </MenuItem>
                )}
                {peerTrackNodePermissions?.changeRole && (
                  <MenuItem onPress={() => changeRole(peerTrackNode)}>
                    <View style={styles.participantMenuItem}>
                      <Ionicons
                        name="people-outline"
                        style={styles.participantMenuItemIcon}
                        size={24}
                      />
                      <Text style={styles.participantMenuItemName}>
                        Change Role
                      </Text>
                    </View>
                  </MenuItem>
                )}
                {peerTrackNode.peer.isLocal === false &&
                  type === TrackType.REMOTE && (
                    <MenuItem onPress={() => toggleAudio(peerTrackNode)}>
                      <View style={styles.participantMenuItem}>
                        <Feather
                          name={
                            peerTrackNode.peer?.audioTrack?.isMute() === false
                              ? 'mic'
                              : 'mic-off'
                          }
                          style={styles.participantMenuItemIcon}
                          size={24}
                        />
                        <Text style={styles.participantMenuItemName}>
                          {peerTrackNode.peer?.audioTrack?.isMute() === false
                            ? 'Mute audio'
                            : 'Unmute audio'}
                        </Text>
                      </View>
                    </MenuItem>
                  )}
                {peerTrackNode.peer.isLocal === false &&
                  type === TrackType.REMOTE && (
                    <MenuItem onPress={() => toggleVideo(peerTrackNode)}>
                      <View style={styles.participantMenuItem}>
                        <Feather
                          name={
                            peerTrackNode?.track?.isMute() === false
                              ? 'video'
                              : 'video-off'
                          }
                          style={styles.participantMenuItemIcon}
                          size={24}
                        />
                        <Text style={styles.participantMenuItemName}>
                          {peerTrackNode?.track?.isMute() === false
                            ? 'Mute video'
                            : 'Unmute video'}
                        </Text>
                      </View>
                    </MenuItem>
                  )}
                {/* {peerTrackNode.peer.isLocal === false &&
                  type === TrackType.REMOTE &&
                  peerTrackNode?.track?.source === HMSTrackSource.REGULAR && (
                    <MenuItem
                      onPress={() => toggleLocalAudioMute(peerTrackNode)}>
                      <View style={styles.participantMenuItem}>
                        <Feather
                          name="mic"
                          style={styles.participantMenuItemIcon}
                          size={24}
                        />
                        <Text style={styles.participantMenuItemName}>
                          Local mute audio
                        </Text>
                      </View>
                    </MenuItem>
                  )}
                {peerTrackNode.peer.isLocal === false &&
                  type === TrackType.REMOTE &&
                  peerTrackNode?.track?.source === HMSTrackSource.REGULAR && (
                    <MenuItem
                      onPress={() => toggleLocalVideoMute(peerTrackNode)}>
                      <View style={styles.participantMenuItem}>
                        <Feather
                          name="video"
                          style={styles.participantMenuItemIcon}
                          size={24}
                        />
                        <Text style={styles.participantMenuItemName}>
                          Local mute video
                        </Text>
                      </View>
                    </MenuItem>
                  )} */}
                {peerTrackNode.peer.isLocal === false && (
                  <MenuItem onPress={() => setVolume(peerTrackNode)}>
                    <View style={styles.participantMenuItem}>
                      <Ionicons
                        name="volume-high-outline"
                        style={styles.participantMenuItemIcon}
                        size={24}
                      />
                      <Text style={styles.participantMenuItemName}>
                        Set Volume
                      </Text>
                    </View>
                  </MenuItem>
                )}
                {(type === TrackType.REMOTE || type === TrackType.LOCAL) && (
                  <MenuItem onPress={() => setPin(peerTrackNode)}>
                    <View style={styles.participantMenuItem}>
                      <MaterialCommunityIcons
                        name={
                          pinnedPeerTrackIds?.includes(peerTrackNode.id)
                            ? 'pin-off-outline'
                            : 'pin-outline'
                        }
                        style={styles.participantMenuItemIcon}
                        size={24}
                      />
                      <Text style={styles.participantMenuItemName}>
                        {pinnedPeerTrackIds?.includes(peerTrackNode.id)
                          ? 'Unpin'
                          : 'Pin'}
                      </Text>
                    </View>
                  </MenuItem>
                )}
              </Menu>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const ParticipantFilter = ({
  instance,
  filter,
  setFilter,
}: {
  instance?: HMSSDK;
  filter?: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [visible, setVisible] = useState<boolean>(false);

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);

  return (
    <Menu
      visible={visible}
      anchor={
        <TouchableOpacity
          style={styles.participantFilterContainer}
          onPress={showMenu}>
          <Text style={styles.participantFilterText} numberOfLines={1}>
            {filter}
          </Text>
          <MaterialIcons
            name={visible ? 'arrow-drop-up' : 'arrow-drop-down'}
            style={styles.participantFilterIcon}
            size={24}
          />
        </TouchableOpacity>
      }
      onRequestClose={hideMenu}
      style={styles.participantsMenuContainer}>
      <MenuItem
        onPress={() => {
          hideMenu();
          setFilter('everyone');
        }}>
        <View style={styles.participantMenuItem}>
          <Ionicons
            name="people-outline"
            style={styles.participantMenuItemIcon}
            size={20}
          />
          <Text style={styles.participantMenuItemName}>Everyone</Text>
        </View>
      </MenuItem>
      <MenuItem
        onPress={() => {
          hideMenu();
          setFilter('raised hand');
        }}>
        <View style={styles.participantMenuItem}>
          <Ionicons
            name="hand-left-outline"
            style={styles.participantMenuItemIcon}
            size={20}
          />
          <Text style={styles.participantMenuItemName}>Raised Hand</Text>
        </View>
      </MenuItem>
      <MenuDivider color={COLORS.BORDER.LIGHT} />
      {instance?.knownRoles?.map(knownRole => {
        return (
          <MenuItem
            onPress={() => {
              hideMenu();
              setFilter(knownRole?.name!);
            }}
            key={knownRole.name}>
            <View style={styles.participantMenuItem}>
              <Text style={styles.participantMenuItemName}>
                {knownRole?.name}
              </Text>
            </View>
          </MenuItem>
        );
      })}
    </Menu>
  );
};

const ChangeRoleModal = ({
  instance,
  peerTrackNode,
  cancelModal,
}: {
  instance?: HMSSDK;
  peerTrackNode: PeerTrackNode;
  cancelModal: Function;
}) => {
  const [newRole, setNewRole] = useState<HMSRole>(peerTrackNode.peer?.role!);
  const [request, setRequest] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);
  const changeRole = async () => {
    await instance?.changeRole(peerTrackNode.peer, newRole, !request);
    cancelModal();
  };

  return (
    <View style={styles.roleChangeModal}>
      <Text style={styles.roleChangeModalHeading}>Change Role</Text>
      <Text style={styles.roleChangeModalDescription}>
        Change the role of '{peerTrackNode.peer.name}' to
      </Text>
      <Menu
        visible={visible}
        anchor={
          <TouchableOpacity
            style={styles.participantChangeRoleContainer}
            onPress={showMenu}>
            <Text style={styles.participantFilterText} numberOfLines={1}>
              {newRole?.name}
            </Text>
            <MaterialIcons
              name={visible ? 'arrow-drop-up' : 'arrow-drop-down'}
              style={styles.participantFilterIcon}
              size={24}
            />
          </TouchableOpacity>
        }
        onRequestClose={hideMenu}
        style={styles.participantsMenuContainer}>
        {instance?.knownRoles?.map(knownRole => {
          return (
            <MenuItem
              onPress={() => {
                hideMenu();
                setNewRole(knownRole);
              }}
              key={knownRole.name}>
              <View style={styles.participantMenuItem}>
                <Text style={styles.participantMenuItemName}>
                  {knownRole?.name}
                </Text>
              </View>
            </MenuItem>
          );
        })}
      </Menu>
      {!peerTrackNode.peer.isLocal && (
        <TouchableOpacity
          style={styles.roleChangeModalPermissionContainer}
          onPress={() => {
            setRequest(!request);
          }}>
          <View style={styles.roleChangeModalCheckBox}>
            {request && (
              <Entypo
                name="check"
                style={styles.roleChangeModalCheck}
                size={10}
              />
            )}
          </View>
          <Text style={styles.roleChangeModalPermission}>
            Request permission from the user
          </Text>
        </TouchableOpacity>
      )}
      <View style={styles.roleChangeModalPermissionContainer}>
        <CustomButton
          title="Cancel"
          onPress={cancelModal}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          title="Change"
          onPress={changeRole}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

const ChangeVolumeModal = ({
  instance,
  peerTrackNode,
  cancelModal,
}: {
  instance?: HMSSDK;
  peerTrackNode: PeerTrackNode;
  cancelModal: Function;
}) => {
  const [volume, setVolume] = useState<number>(0);

  const changeVolume = () => {
    if (peerTrackNode?.track?.source === HMSTrackSource.REGULAR) {
      instance?.setVolume(peerTrackNode.peer?.audioTrack as HMSTrack, volume);
    } else {
      peerTrackNode.peer?.auxiliaryTracks?.map(track => {
        if (
          track.source === HMSTrackSource.SCREEN &&
          track.type === HMSTrackType.AUDIO
        ) {
          instance?.setVolume(track, volume);
        }
      });
    }
    cancelModal();
  };

  return (
    <View style={styles.volumeModalContainer}>
      <Text style={styles.roleChangeModalHeading}>Set Volume</Text>
      <View style={styles.volumeModalSlider}>
        <Text style={styles.roleChangeModalDescription}>Volume: {volume}</Text>
        <Slider
          value={volume}
          maximumValue={10}
          minimumValue={0}
          step={1}
          onValueChange={(value: any) => setVolume(value[0])}
        />
      </View>
      <View style={styles.roleChangeModalPermissionContainer}>
        <CustomButton
          title="Cancel"
          onPress={cancelModal}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          title="Change"
          onPress={changeVolume}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

const ChangeNameModal = ({
  instance,
  peerTrackNode,
  cancelModal,
}: {
  instance?: HMSSDK;
  peerTrackNode: PeerTrackNode;
  cancelModal: Function;
}) => {
  const dispatch = useDispatch();

  const [name, setName] = useState<string>(peerTrackNode.peer.name);

  const changeName = () => {
    if (name.length > 0) {
      instance
        ?.changeName(name)
        .then(d => {
          dispatch(
            saveUserData({
              userName: name,
            }),
          );
          console.log('Change Name Success: ', d);
        })
        .catch(e => console.log('Change Name Error: ', e));
    }
    cancelModal();
  };

  return (
    <View style={styles.volumeModalContainer}>
      <Text style={styles.roleChangeModalHeading}>Change Name</Text>
      <View style={styles.volumeModalSlider}>
        <CustomInput
          value={name}
          onChangeText={setName}
          inputStyle={styles.participantChangeNameInput}
          placeholderTextColor={COLORS.TEXT.DISABLED}
          placeholder="Find what you’re looking for"
        />
      </View>
      <View style={styles.roleChangeModalPermissionContainer}>
        <CustomButton
          title="Cancel"
          onPress={cancelModal}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          title="Change"
          onPress={changeName}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

export default Meeting;
