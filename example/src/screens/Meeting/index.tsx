import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  BackHandler,
  Platform,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  HMSUpdateListenerActions,
  HMSMessage,
  HMSPeerUpdate,
  HMSRoomUpdate,
  HMSTrackUpdate,
  HMSVideoViewMode,
  HMSLocalPeer,
  HMSTrack,
  HMSRoom,
  HMSRoleChangeRequest,
  HMSSDK,
  HMSChangeTrackStateRequest,
  HMSPeer,
  HMSSpeaker,
  HMSException,
  HMSAudioMode,
  HMSAudioMixingMode,
  HMSRTMPConfig,
  HMSTrackSource,
  HMSTrackType,
  HMSAudioFilePlayerNode,
} from '@100mslive/react-native-hms';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Toast from 'react-native-simple-toast';
import RNFetchBlob from 'rn-fetch-blob';
import Video from 'react-native-video';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import DocumentPicker from 'react-native-document-picker';

import {styles} from './styles';
import type {AppStackParamList} from '../../navigator';
import {
  ChatWindow,
  AlertModal,
  ZoomableView,
  CustomButton,
  DefaultModal,
  Menu,
  MenuItem,
} from '../../components';
import {
  addMessage,
  clearHmsReference,
  clearMessageData,
  clearPeerData,
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
} from '../../utils/functions';
import {
  LayoutParams,
  ModalTypes,
  PeerTrackNode,
  SortingType,
} from '../../utils/types';
import {GridView} from './Grid';
import {ActiveSpeakerView} from './ActiveSpeakerView';
import {HeroView} from './HeroView';
import {MiniView} from './MiniView';
import {
  ParticipantsModal,
  ChangeNameModal,
  ChangeRoleModal,
  ChangeVolumeModal,
  RtcStatsModal,
  EndRoomModal,
  LeaveRoomModal,
  ChangeAudioOutputModal,
  ChangeAudioModeModal,
  ChangeAudioMixingModeModal,
  ChangeSortingModal,
  ChangeLayoutModal,
  ChangeTrackStateForRoleModal,
  ChangeTrackStateModal,
  HlsStreamingModal,
  RecordingModal,
  ResolutionModal,
  ChangeRoleAccepteModal,
  EndHlsModal,
  RealTime,
  AudioShareSetVolumeModal,
} from './Modals';

type MeetingScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'MeetingScreen'
>;

const Meeting = () => {
  // hooks
  const {hmsInstance, roomID, roomCode} = useSelector(
    (state: RootState) => state.user,
  );
  const {peerState} = useSelector((state: RootState) => state.app);
  const dispatch = useDispatch();
  const navigate = useNavigation<MeetingScreenProp>().navigate;
  const {bottom, left, right} = useSafeAreaInsets();

  // useState hook
  const [instance, setInstance] = useState<HMSSDK | undefined>();
  const [peerTrackNodes, setPeerTrackNodes] =
    useState<Array<PeerTrackNode>>(peerState);
  const [localPeer, setLocalPeer] = useState<HMSLocalPeer>();
  const [modalVisible, setModalVisible] = useState<ModalTypes>(
    ModalTypes.DEFAULT,
  );
  const [pinnedPeerTrackIds, setPinnedPeerTrackIds] = useState<Array<String>>(
    [],
  );
  const [hmsRoom, setHmsRoom] = useState<HMSRoom>();
  const [speakers, setSpeakers] = useState<Array<HMSSpeaker>>([]);
  const [notification, setNotification] = useState(false);
  const [muteAllTracksAudio, setMuteAllTracksAudio] = useState(false);
  const [layout, setLayout] = useState<LayoutParams>(LayoutParams.GRID);
  const [sortingType, setSortingType] = useState<SortingType>();
  const [page, setPage] = useState(0);
  const [zoomableTrackId, setZoomableTrackId] = useState('');
  const [orientation, setOrientation] = useState<boolean>(true);
  const [isScreenShared, setIsScreenShared] = useState(
    localPeer?.auxiliaryTracks && localPeer?.auxiliaryTracks?.length > 0,
  );
  const [updatePeerTrackNode, setUpdatePeerTrackNode] = useState<PeerTrackNode>(
    peerTrackNodes[0],
  );
  const [roleChangeRequest, setRoleChangeRequest] = useState<{
    requestedBy?: string;
    suggestedRole?: string;
  }>({});
  const [recordingDetails, setRecordingDetails] = useState<HMSRTMPConfig>({
    record: false,
    meetingURL: roomID ? roomID + '?token=beam_recording' : '',
  });
  const [audioMode, setAudioMode] = useState<HMSAudioMode>(
    HMSAudioMode.MODE_NORMAL,
  );
  const [audioDeviceChangeListener, setAudioDeviceChangeListener] =
    useState<boolean>(false);
  const [isAudioShared, setIsAudioShared] = useState<boolean>(false);
  const [newAudioMixingMode, setNewAudioMixingMode] =
    useState<HMSAudioMixingMode>(HMSAudioMixingMode.TALK_AND_MUSIC);

  // useRef hook
  const peerTrackNodesRef = useRef(peerTrackNodes);
  const hlsPlayerRef = useRef<Video>(null);

  // constants
  const audioFilePlayerNode = new HMSAudioFilePlayerNode(
    'audio_file_player_node',
  );
  const HmsViewComponent = instance?.HmsView;
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
        sortingType,
        pinnedPeerTrackIds,
      ),
    [layout, peerTrackNodes, orientation, sortingType, pinnedPeerTrackIds],
  );
  const parsedMetadata = parseMetadata(localPeer?.metadata);

  // listeners
  const onRoomListener = ({
    room,
    type,
  }: {
    room: HMSRoom;
    type: HMSRoomUpdate;
  }) => {
    console.log('data in onRoomListener: ', type, room);
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
  };

  const onPeerListener = ({
    peer,
    type,
  }: {
    peer: HMSPeer;
    type: HMSPeerUpdate;
  }) => {
    console.log('data in onPeerListener: ', type, peer);
    const newPeerTrackNodes = updatePeersTrackNodesOnPeerListener(
      peerTrackNodesRef?.current,
      peer,
      type,
    );
    setPeerTrackNodes(newPeerTrackNodes);
    peerTrackNodesRef.current = newPeerTrackNodes;
    if (peer.isLocal) {
      updateLocalPeer();
    }

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
    console.log('data in onTrackListener: ', type, peer, track);
    const newPeerTrackNodes = updatePeersTrackNodesOnTrackListener(
      peerTrackNodesRef?.current,
      track,
      peer,
      type,
    );
    setPeerTrackNodes(newPeerTrackNodes);
    peerTrackNodesRef.current = newPeerTrackNodes;
    if (peer.isLocal) {
      updateLocalPeer();
    }

    if (
      peer?.isLocal &&
      track.source === HMSTrackSource.SCREEN &&
      track.type === HMSTrackType.VIDEO
    ) {
      hmsInstance?.isScreenShared().then(d => {
        setIsScreenShared(d);
      });
    }
  };

  const onMessageListener = (data: HMSMessage) => {
    console.log('data in onMessageListener: ', data);
    dispatch(addMessage(data));
    setNotification(true);
  };

  const onSpeakerListener = (data: HMSSpeaker[]) => {
    console.log('data in onSpeakerListener: ', data);
    setSpeakers(data || []);
  };

  const onReconnectingListener = (data: any) => {
    console.log('data in onReconnectingListener: ', data);
    Toast.showWithGravity('Reconnecting...', Toast.SHORT, Toast.TOP);
  };

  const onReconnectedListener = (data: any) => {
    console.log('data in onReconnectedListener: ', data);
    Toast.showWithGravity('Reconnected', Toast.SHORT, Toast.TOP);
  };

  const onRoleChangeRequestListener = (data: HMSRoleChangeRequest) => {
    console.log('data in onRoleChangeRequestListener: ', data);
    setModalVisible(ModalTypes.CHANGE_ROLE_ACCEPT);
    setRoleChangeRequest({
      requestedBy: data?.requestedBy?.name,
      suggestedRole: data?.suggestedRole?.name,
    });
  };

  const onChangeTrackStateRequestListener = (
    data: HMSChangeTrackStateRequest,
  ) => {
    console.log('data in onChangeTrackStateRequestListener: ', data);
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

  const onRemovedFromRoomListener = async (data: any) => {
    console.log('data in onRemovedFromRoomListener: ', data);
    destroy();
  };

  const onErrorListener = (data: HMSException) => {
    console.log('data in onErrorListener: ', data);
    Toast.showWithGravity(
      `${data?.code} ${data?.description}` || 'Something went wrong',
      Toast.LONG,
      Toast.TOP,
    );
    if (Platform.OS === 'android') {
      if (data?.code === 4005 || data?.code === 1003) {
        destroy();
      }
    } else {
      if (data?.code === 2000) {
        destroy();
      }
    }
  };

  const onAudioDeviceChangedListener = (data: any) => {
    console.log('data in onAudioDeviceChangedListener: ', data);
    Toast.showWithGravity(
      `Audio Device Output changed to ${data?.device}`,
      Toast.LONG,
      Toast.TOP,
    );
  };

  // functions
  const updateLocalPeer = async () => {
    setLocalPeer(await hmsInstance?.getLocalPeer());
  };

  const updateRoom = async () => {
    setHmsRoom(await hmsInstance?.getRoom());
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

  const getSettingsButtons = (): Array<{
    text: string;
    type?: string;
    onPress?: Function;
  }> => {
    let buttons: Array<{text: string; type?: string; onPress?: Function}> = [
      {
        text: 'Cancel',
        type: 'cancel',
      },
      {
        text: parsedMetadata?.isBRBOn ? 'Remove BRB' : 'Set BRB',
        onPress: async () => {
          await instance
            ?.changeMetadata(
              JSON.stringify({
                ...parsedMetadata,
                isBRBOn: !parsedMetadata?.isBRBOn,
                isHandRaised: false,
              }),
            )
            .then(d => console.log('Change Metadata Success: ', d))
            .catch(e => console.log('Change Metadata Error: ', e));
        },
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
    ];
    if (!localPeer?.role?.name?.includes('hls-')) {
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
    if (localPeer?.role?.permissions?.mute) {
      buttons.push({
        text: 'Remote mute all audio tracks',
        onPress: async () => {
          await instance
            ?.remoteMuteAllAudio()
            .then(d => console.log('Remote Mute All Audio Success: ', d))
            .catch(e => console.log('Remote Mute All Audio Error: ', e));
        },
      });
    }
    if (localPeer?.role?.permissions?.rtmpStreaming) {
      buttons.push(
        ...[
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
        ],
      );
    }
    if (
      localPeer?.role?.permissions?.mute ||
      localPeer?.role?.permissions?.unmute
    ) {
      buttons.push({
        text: 'Change Track State For Role',
        onPress: () => {
          setModalVisible(ModalTypes.CHANGE_TRACK_ROLE);
        },
      });
    }
    if (Platform.OS === 'android') {
      if (audioDeviceChangeListener) {
        buttons.push({
          text: 'Remove Audio Device Change Listener',
          onPress: () => {
            instance?.removeEventListener(
              HMSUpdateListenerActions.ON_AUDIO_DEVICE_CHANGED,
            );
            setAudioDeviceChangeListener(false);
          },
        });
      } else {
        buttons.push({
          text: 'Set Audio Device Change Listener',
          onPress: () => {
            instance?.setAudioDeviceChangeListener(
              onAudioDeviceChangedListener,
            );
            setAudioDeviceChangeListener(true);
          },
        });
      }
      buttons.push(
        ...[
          {
            text: 'Switch Audio Output',
            onPress: () => {
              setModalVisible(ModalTypes.SWITCH_AUDIO_OUTPUT);
            },
          },
          {
            text: 'Set Audio Mode',
            onPress: () => {
              setModalVisible(ModalTypes.CHANGE_AUDIO_MODE);
            },
          },
          {
            text: 'Set Audio Mixing Mode',
            onPress: () => {
              setModalVisible(ModalTypes.AUDIO_MIXING_MODE);
            },
          },
        ],
      );
      if (isAudioShared) {
        buttons.push({
          text: 'Stop Audioshare',
          onPress: () => {
            instance
              ?.stopAudioshare()
              .then(d => {
                setIsAudioShared(false);
                console.log('Stop Audioshare Success: ', d);
              })
              .catch(e => console.log('Stop Audioshare Error: ', e));
          },
        });
      } else {
        buttons.push({
          text: 'Start Audioshare',
          onPress: () => {
            instance
              ?.startAudioshare(newAudioMixingMode)
              .then(d => {
                setIsAudioShared(true);
                console.log('Start Audioshare Success: ', d);
              })
              .catch(e => console.log('Start Audioshare Error: ', e));
          },
        });
      }
    } else {
      buttons.push(
        ...[
          {
            text: 'Play Audio Share',
            onPress: () => {
              setTimeout(() => {
                DocumentPicker.pickSingle()
                  .then(result => {
                    console.log('Document Picker Success: ', result);
                    audioFilePlayerNode
                      .play(result?.uri, false, false)
                      .then(d => {
                        console.log('Start Audioshare Success: ', d);
                      })
                      .catch(e => console.log('Start Audioshare Error: ', e));
                  })
                  .catch(e => console.log('Document Picker Error: ', e));
              }, 500);
            },
          },
          {
            text: 'Stop Audio Share',
            onPress: () => {
              audioFilePlayerNode.stop();
            },
          },
          {
            text: 'Set Audio Share Volume',
            onPress: () => {
              setModalVisible(ModalTypes.SET_AUDIO_SHARE_VOLUME);
            },
          },
          {
            text: 'Pause Audio Share',
            onPress: () => {
              audioFilePlayerNode.pause();
            },
          },
          {
            text: 'Resume Audio Share',
            onPress: () => {
              audioFilePlayerNode.resume();
            },
          },
          {
            text: 'Is Audio Share Playing',
            onPress: () => {
              audioFilePlayerNode
                .isPlaying()
                .then(d => console.log('Audioshare isPlaying: ', d))
                .catch(e => console.log('Audioshare isPlaying: ', e));
            },
          },
          {
            text: 'Audio Share Duration',
            onPress: () => {
              audioFilePlayerNode
                .duration()
                .then(d => console.log('Audioshare duration: ', d))
                .catch(e => console.log('Audioshare duration: ', e));
            },
          },
          {
            text: 'Audio Share Current Duration',
            onPress: () => {
              audioFilePlayerNode
                .currentDuration()
                .then(d => console.log('Audioshare currentDuration: ', d))
                .catch(e => console.log('Audioshare currentDuration: ', e));
            },
          },
        ],
      );
    }
    buttons.push(
      ...[
        {
          text: 'Stats For Nerds',
          onPress: () => {
            setModalVisible(ModalTypes.RTC_STATS);
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
      ],
    );
    return buttons;
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

  const audioShareSetVolume = (volume: number) => {
    audioFilePlayerNode.setVolume(volume);
  };

  const onLeavePress = async () => {
    await instance
      ?.leave()
      .then(async d => {
        console.log('Leave Success: ', d);
        destroy();
      })
      .catch(e => console.log('Leave Error: ', e));
  };

  const onEndRoomPress = async () => {
    await instance
      ?.endRoom('Host ended the room')
      .then(async d => {
        console.log('EndRoom Success: ', d);
        destroy();
      })
      .catch(e => console.log('EndRoom Error: ', e));
  };

  const onRaiseHandPress = async () => {
    await instance
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

  const onMicStatusPress = () => {
    localPeer?.localAudioTrack()?.setMute(!localPeer?.audioTrack?.isMute());
  };

  const onVideoStatusPress = () => {
    localPeer?.localVideoTrack()?.setMute(!localPeer?.videoTrack?.isMute());
  };

  const onStartScreenSharePress = () => {
    instance
      ?.startScreenshare()
      .then(d => console.log('Start Screenshare Success: ', d))
      .catch(e => console.log('Start Screenshare Error: ', e));
  };

  const onEndScreenSharePress = () => {
    instance
      ?.stopScreenshare()
      .then(d => console.log('Stop Screenshare Success: ', d))
      .catch(e => console.log('Stop Screenshare Error: ', e));
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
    hms?.addEventListener(HMSUpdateListenerActions.ON_ERROR, onErrorListener);
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_MESSAGE,
      onMessageListener,
    );
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_SPEAKER,
      onSpeakerListener,
    );
    hms?.addEventListener(
      HMSUpdateListenerActions.RECONNECTING,
      onReconnectingListener,
    );
    hms?.addEventListener(
      HMSUpdateListenerActions.RECONNECTED,
      onReconnectedListener,
    );
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST,
      onRoleChangeRequestListener,
    );
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM,
      onRemovedFromRoomListener,
    );
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST,
      onChangeTrackStateRequestListener,
    );
  };

  // useEffect hooks
  useEffect(() => {
    updateHmsInstance(hmsInstance);
    updateLocalPeer();
    updateRoom();

    const callback = () => setOrientation(isPortrait());
    callback();
    Dimensions.addEventListener('change', callback);

    const backAction = () => {
      setModalVisible(ModalTypes.LEAVE_MENU);
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
    return () => {
      if (instance) {
        instance.removeAllListeners();
      }
    };
  }, [instance]);

  return (
    <SafeAreaView style={styles.container}>
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
                  <Feather name="log-out" style={styles.icon} size={24} />
                }
              />
            }
            onRequestClose={() => setModalVisible(ModalTypes.DEFAULT)}
            style={styles.participantsMenuContainer}>
            <MenuItem
              onPress={() => {
                setModalVisible(ModalTypes.DEFAULT);
                setTimeout(() => {
                  setModalVisible(ModalTypes.LEAVE_ROOM);
                }, 500);
              }}>
              <View style={styles.participantMenuItem}>
                <Feather
                  name="log-out"
                  style={styles.participantMenuItemIcon}
                  size={24}
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
                }}>
                <View style={styles.participantMenuItem}>
                  <Feather
                    name="alert-triangle"
                    style={[styles.participantMenuItemIcon, styles.error]}
                    size={24}
                  />
                  <Text style={[styles.participantMenuItemName, styles.error]}>
                    End Session
                  </Text>
                </View>
              </MenuItem>
            )}
          </Menu>
          {hmsRoom?.hlsStreamingState?.running ? (
            <View>
              <View style={styles.liveTextContainer}>
                <View style={styles.liveStatus} />
                <Text style={styles.liveTimeText}>Live</Text>
              </View>
              <RealTime />
            </View>
          ) : (
            <Text style={styles.headerName}>
              {speakers?.length > 0 && speakers[0]?.peer?.name
                ? `🔊  ${speakers[0]?.peer?.name}`
                : roomCode}
            </Text>
          )}
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
              setNotification(false);
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
          {localPeer?.role?.publishSettings?.allowed?.includes('video') && (
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
        {localPeer?.role?.name?.includes('hls-') ? (
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
            onEndScreenSharePress={onEndScreenSharePress}
            orientation={orientation}
            speakers={speakers}
            instance={instance}
            peerTrackNodes={peerTrackNodes}
            layout={layout}
            setPage={setPage}
            page={page}
            selectedSortingType={sortingType}
          />
        ) : layout === LayoutParams.HERO ? (
          <HeroView
            peerTrackNodes={peerTrackNodes}
            orientation={orientation}
            speakers={speakers}
            instance={instance}
            setModalVisible={setModalVisible}
            localPeer={localPeer}
          />
        ) : layout === LayoutParams.MINI ? (
          <MiniView
            peerTrackNodes={peerTrackNodes}
            orientation={orientation}
            speakers={speakers}
            instance={instance}
            permissions={localPeer?.role?.permissions}
          />
        ) : (
          <GridView
            onEndScreenSharePress={onEndScreenSharePress}
            orientation={orientation}
            speakers={speakers}
            pairedPeers={pairedPeers}
            setPage={setPage}
            setModalVisible={setModalVisible}
            setZoomableTrackId={setZoomableTrackId}
            instance={instance}
            layout={layout}
            page={page}
            pinnedPeerTrackIds={pinnedPeerTrackIds}
            setPinnedPeerTrackIds={setPinnedPeerTrackIds}
            setUpdatePeerTrackNode={setUpdatePeerTrackNode}
            permissions={localPeer?.role?.permissions}
          />
        )}
      </View>
      <View style={[styles.iconBotttomWrapper, {bottom, left, right}]}>
        <View style={styles.iconBotttomButtonWrapper}>
          <CustomButton
            onPress={onMicStatusPress}
            viewStyle={[
              styles.iconContainer,
              localPeer?.audioTrack?.isMute() && styles.iconMuted,
            ]}
            LeftIcon={
              <Feather
                name={localPeer?.audioTrack?.isMute() ? 'mic-off' : 'mic'}
                style={styles.icon}
                size={24}
              />
            }
          />
          <CustomButton
            onPress={onVideoStatusPress}
            viewStyle={[
              styles.iconContainer,
              localPeer?.videoTrack?.isMute() && styles.iconMuted,
            ]}
            LeftIcon={
              <Feather
                name={localPeer?.videoTrack?.isMute() ? 'video-off' : 'video'}
                style={styles.icon}
                size={24}
              />
            }
          />
          {localPeer?.role?.permissions?.hlsStreaming &&
            (hmsRoom?.hlsStreamingState?.running ? (
              <CustomButton
                onPress={() => setModalVisible(ModalTypes.END_HLS_STREAMING)}
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
                  <Ionicons
                    name="radio-outline"
                    style={styles.icon}
                    size={48}
                  />
                }
              />
            ))}
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
        {localPeer?.role?.permissions?.hlsStreaming &&
          (hmsRoom?.hlsStreamingState?.running ? (
            <Text style={styles.liveText}>End stream</Text>
          ) : (
            <Text style={styles.liveText}>Go Live</Text>
          ))}
      </View>
      <AlertModal
        modalVisible={modalVisible === ModalTypes.SETTINGS}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
        title="Settings"
        buttons={getSettingsButtons()}
      />
      <DefaultModal
        modalVisible={modalVisible === ModalTypes.CHAT}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <ChatWindow localPeer={localPeer} />
      </DefaultModal>
      <DefaultModal
        modalVisible={modalVisible === ModalTypes.PARTICIPANTS}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <ParticipantsModal
          peerTrackNodes={peerTrackNodes}
          instance={instance}
          localPeer={localPeer}
          setUpdatePeerTrackNode={setUpdatePeerTrackNode}
          setModalVisible={setModalVisible}
          pinnedPeerTrackIds={pinnedPeerTrackIds}
          setPinnedPeerTrackIds={setPinnedPeerTrackIds}
        />
      </DefaultModal>
      <DefaultModal
        modalVisible={modalVisible === ModalTypes.RTC_STATS}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <RtcStatsModal instance={instance} localPeer={localPeer} />
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
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.LEAVE_ROOM}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <LeaveRoomModal
          onSuccess={onLeavePress}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.END_ROOM}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <EndRoomModal
          onSuccess={onEndRoomPress}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.SWITCH_AUDIO_OUTPUT}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <ChangeAudioOutputModal
          instance={instance}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.CHANGE_AUDIO_MODE}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <ChangeAudioModeModal
          instance={instance}
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
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <ChangeAudioMixingModeModal
          instance={instance}
          newAudioMixingMode={newAudioMixingMode}
          setNewAudioMixingMode={setNewAudioMixingMode}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.SORTING}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <ChangeSortingModal
          data={[
            SortingType.ALPHABETICAL,
            SortingType.VIDEO_ON,
            SortingType.ROLE_PRIORITY,
          ]}
          selectedItem={sortingType}
          onItemSelected={setSortingType}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.LAYOUT}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <ChangeLayoutModal
          data={[
            LayoutParams.GRID,
            LayoutParams.AUDIO,
            LayoutParams.ACTIVE_SPEAKER,
            LayoutParams.HERO,
            LayoutParams.MINI,
          ]}
          selectedItem={layout}
          onItemSelected={setLayout}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.CHANGE_TRACK_ROLE}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <ChangeTrackStateForRoleModal
          instance={instance}
          localPeer={localPeer}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.CHANGE_TRACK}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <ChangeTrackStateModal
          localPeer={localPeer}
          roleChangeRequest={roleChangeRequest}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.HLS_STREAMING}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <HlsStreamingModal
          instance={instance}
          roomID={roomID}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.RECORDING}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <RecordingModal
          instance={instance}
          recordingDetails={recordingDetails}
          setRecordingDetails={setRecordingDetails}
          setModalVisible={setModalVisible}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.RESOLUTION}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <ResolutionModal
          recordingDetails={recordingDetails}
          setRecordingDetails={setRecordingDetails}
          cancelModal={() => setModalVisible(ModalTypes.RECORDING)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.CHANGE_ROLE_ACCEPT}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <ChangeRoleAccepteModal
          instance={instance}
          roleChangeRequest={roleChangeRequest}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.END_HLS_STREAMING}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <EndHlsModal
          onSuccess={onEndLivePress}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.SET_AUDIO_SHARE_VOLUME}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <AudioShareSetVolumeModal
          success={audioShareSetVolume}
          cancel={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
    </SafeAreaView>
  );
};

export {Meeting};
