import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
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
} from '@100mslive/react-native-hms';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {getDeviceType} from 'react-native-device-info';
import {Slider} from '@miblanchard/react-native-slider';
import type {StackNavigationProp} from '@react-navigation/stack';
import Toast from 'react-native-simple-toast';
import RNFetchBlob from 'rn-fetch-blob';
import {Picker} from '@react-native-picker/picker';
import Video from 'react-native-video';

import {ChatWindow, AlertModal, CustomModal, RolePicker} from '../components';
import {
  addMessage,
  clearMessageData,
  updateHmsReference,
} from '../redux/actions/index';
import dimension from '../utils/dimension';
import {
  getThemeColour,
  getInitials,
  pairDataForScrollView,
  writeFile,
} from '../utils/functions';
import type {RootState} from '../redux';
import type {AppStackParamList} from '../navigator';

const isPortrait = () => {
  const dim = Dimensions.get('window');
  return dim.height >= dim.width;
};

type Peer = {
  peerRefrence?: HMSPeer;
  trackId?: string;
  name: string;
  isAudioMute: boolean;
  isVideoMute: boolean;
  id?: string;
  colour: string;
  sink: boolean;
  type: 'local' | 'remote' | 'screen';
  metadata?: {
    isHandRaised: boolean;
  };
  track?: HMSTrack;
};

type DisplayTrackProps = {
  peer?: Peer;
  videoStyles: Function;
  speakers: Array<string>;
  type: 'local' | 'remote' | 'screen';
  instance: HMSSDK | undefined;
  permissions: HMSPermissions | undefined;
  layout?: LayoutParams;
};

type MeetingProps = {
  messages: any;
  addMessageRequest: Function;
  clearMessageRequest: Function;
  audioState: boolean;
  videoState: boolean;
  state: RootState;
  hmsInstance: HMSSDK | undefined;
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

type LayoutParams = 'audio' | 'normal';

type MeetingScreenProp = StackNavigationProp<AppStackParamList, 'Meeting'>;

const DisplayTrack = ({
  peer,
  videoStyles,
  speakers,
  type,
  instance,
  permissions,
  layout,
}: DisplayTrackProps) => {
  const {
    name,
    trackId,
    colour,
    id,
    sink,
    peerRefrence,
    isAudioMute,
    isVideoMute,
    metadata,
  } = peer!;
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [newRole, setNewRole] = useState(peerRefrence?.role);
  const [force, setForce] = useState(false);
  const [volumeModal, setVolumeModal] = useState(false);
  const [volume, setVolume] = useState(1);
  const modalTitle = 'Set Volume';

  const modalButtons: [
    {text: string; onPress?: Function},
    {text: string; onPress?: Function},
  ] = [
    {text: 'Cancel'},
    {
      text: 'Set',
      onPress: () => {
        if (type === 'remote' || type === 'local') {
          instance?.setVolume(peerRefrence?.audioTrack as HMSTrack, volume);
        } else if (peer?.track) {
          instance?.setVolume(peer?.track, volume);
        }
      },
    },
  ];

  useEffect(() => {
    knownRoles?.map(role => {
      if (role?.name === peerRefrence?.role?.name) {
        setNewRole(role);
        return;
      }
    });
    const getVolume = async () => {
      if (type === 'local' && !isAudioMute) {
        try {
          setVolume(await instance?.localPeer?.localAudioTrack()?.getVolume());
        } catch (e) {
          console.log('error in get volume', e);
        }
      }
    };
    getVolume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const HmsViewComponent = instance?.HmsView;
  const knownRoles = instance?.knownRoles || [];
  const isDegraded = peerRefrence?.videoTrack?.isDegraded || false;
  const speaking = speakers.includes(id!);
  const roleRequestTitle = 'Select action';
  const roleRequestButtons: [
    {text: string; onPress?: Function},
    {text: string; onPress?: Function}?,
  ] = [
    {text: 'Cancel'},
    {
      text: force ? 'Set' : 'Send',
      onPress: async () => {
        await instance?.changeRole(peerRefrence!, newRole!, force);
      },
    },
  ];

  const selectAuxActionButtons: Array<{
    text: string;
    type?: string;
    onPress?: Function;
  }> = [
    {text: 'Cancel', type: 'cancel'},
    {
      text: 'Set Volume',
      onPress: () => {
        setVolumeModal(true);
      },
    },
  ];

  const selectLocalActionButtons: Array<{
    text: string;
    type?: string;
    onPress?: Function;
  }> = [{text: 'Cancel', type: 'cancel'}];

  const selectActionTitle = 'Select action';
  const selectActionMessage = '';
  const selectRemoteActionButtons: Array<{
    text: string;
    type?: string;
    onPress?: Function;
  }> = [
    {text: 'Cancel', type: 'cancel'},
    {
      text: 'Set Volume',
      onPress: () => {
        setVolumeModal(true);
      },
    },
    {
      text: 'Mute/Unmute audio locally',
      onPress: async () => {
        const remotePeer = peerRefrence as HMSRemotePeer;
        const playbackAllowed = await remotePeer
          ?.remoteAudioTrack()
          ?.isPlaybackAllowed();
        remotePeer?.remoteAudioTrack()?.setPlaybackAllowed(!playbackAllowed);
      },
    },
    {
      text: 'Mute/Unmute video locally',
      onPress: async () => {
        const remotePeer = peerRefrence as HMSRemotePeer;
        const playbackAllowed = await remotePeer
          ?.remoteVideoTrack()
          ?.isPlaybackAllowed();
        remotePeer?.remoteVideoTrack()?.setPlaybackAllowed(!playbackAllowed);
      },
    },
  ];
  if (permissions?.changeRole) {
    selectLocalActionButtons.push({
      text: 'Change Role',
      onPress: () => {
        setForce(true);
        setRoleModalVisible(true);
      },
    });
    selectRemoteActionButtons.push(
      ...[
        {
          text: 'Prompt to change role',
          onPress: () => {
            setForce(false);
            setRoleModalVisible(true);
          },
        },
        {
          text: 'Force change role',
          onPress: () => {
            setForce(true);
            setRoleModalVisible(true);
          },
        },
      ],
    );
  }
  if (permissions?.removeOthers) {
    selectRemoteActionButtons.push({
      text: 'Remove Participant',
      onPress: async () => {
        await instance?.removePeer(id!, 'removed from room');
      },
    });
  }
  if (permissions?.unmute) {
    const unmute = false;
    if (isAudioMute) {
      selectRemoteActionButtons.push({
        text: 'Unmute audio',
        onPress: async () => {
          await instance?.changeTrackState(
            peerRefrence?.audioTrack as HMSTrack,
            unmute,
          );
        },
      });
    }
    if (isVideoMute) {
      selectRemoteActionButtons.push({
        text: 'Unmute video',
        onPress: async () => {
          await instance?.changeTrackState(
            peerRefrence?.videoTrack as HMSTrack,
            unmute,
          );
        },
      });
    }
  }
  if (permissions?.mute) {
    const mute = true;
    if (!isAudioMute) {
      selectRemoteActionButtons.push({
        text: 'Mute audio',
        onPress: async () => {
          await instance?.changeTrackState(
            peerRefrence?.audioTrack as HMSTrack,
            mute,
          );
        },
      });
    }
    if (!isVideoMute) {
      selectRemoteActionButtons.push({
        text: 'Mute video',
        onPress: async () => {
          await instance?.changeTrackState(
            peerRefrence?.videoTrack as HMSTrack,
            mute,
          );
        },
      });
    }
  }

  const promptUser = () => {
    setAlertModalVisible(true);
  };

  const isTab = getDeviceType() === 'Tablet';

  const {top, bottom} = useSafeAreaInsets();
  // window height - (header + bottom container + top + bottom + padding) / views in one screen
  const viewHeight =
    type === 'screen'
      ? Dimensions.get('window').height -
        (dimension.viewHeight(50) +
          dimension.viewHeight(90) +
          (isTab ? dimension.viewHeight(20) : top + bottom) +
          2)
      : isPortrait()
      ? (Dimensions.get('window').height -
          (dimension.viewHeight(50) +
            dimension.viewHeight(90) +
            (isTab ? dimension.viewHeight(20) : top + bottom) +
            2)) /
        (layout === 'audio' ? 3 : 2)
      : Dimensions.get('window').height -
        (Platform.OS === 'ios' ? 0 : 25) -
        (dimension.viewHeight(50) +
          dimension.viewHeight(90) +
          (isTab ? dimension.viewHeight(20) : top + bottom) +
          2);

  return HmsViewComponent ? (
    <View
      key={id}
      style={[
        videoStyles(),
        {
          height: viewHeight,
        },
        speaking && styles.highlight,
      ]}>
      <AlertModal
        modalVisible={alertModalVisible}
        setModalVisible={setAlertModalVisible}
        title={selectActionTitle}
        message={selectActionMessage}
        buttons={
          type === 'screen'
            ? selectAuxActionButtons
            : type === 'local'
            ? selectLocalActionButtons
            : selectRemoteActionButtons
        }
      />
      <CustomModal
        modalVisible={volumeModal}
        setModalVisible={setVolumeModal}
        title={modalTitle}
        buttons={modalButtons}>
        <Slider
          value={volume}
          maximumValue={10}
          minimumValue={0}
          step={0.1}
          onValueChange={(value: any) => setVolume(value[0])}
        />
      </CustomModal>
      <CustomModal
        modalVisible={roleModalVisible}
        setModalVisible={setRoleModalVisible}
        title={roleRequestTitle}
        buttons={roleRequestButtons}>
        <RolePicker
          data={knownRoles}
          selectedItem={newRole}
          onItemSelected={setNewRole}
        />
      </CustomModal>
      {isVideoMute || layout === 'audio' ? (
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, {backgroundColor: colour}]}>
            <Text style={styles.avatarText}>{getInitials(name!)}</Text>
          </View>
        </View>
      ) : isDegraded ? (
        <View style={styles.avatarContainer}>
          <Text style={styles.degradedText}>Degraded</Text>
        </View>
      ) : (
        <HmsViewComponent
          sink={sink}
          trackId={trackId!}
          mirror={type === 'local' ? true : false}
          scaleType={HMSVideoViewMode.ASPECT_FIT}
          style={type === 'screen' ? styles.hmsViewScreen : styles.hmsView}
        />
      )}
      {metadata?.isHandRaised === true && (
        <View style={styles.raiseHandContainer}>
          <Ionicons
            name="ios-hand-left"
            style={styles.raiseHand}
            size={dimension.viewHeight(30)}
          />
        </View>
      )}
      {type === 'screen' ||
      (type === 'local' && selectLocalActionButtons.length > 1) ||
      (type === 'remote' && selectRemoteActionButtons.length > 1) ? (
        <TouchableOpacity onPress={promptUser} style={styles.optionsContainer}>
          <Entypo
            name="dots-three-horizontal"
            style={styles.options}
            size={dimension.viewHeight(30)}
          />
        </TouchableOpacity>
      ) : (
        <></>
      )}
      <View style={styles.displayContainer}>
        <View style={styles.peerNameContainer}>
          <Text numberOfLines={2} style={styles.peerName}>
            {name}
          </Text>
        </View>
        <View style={styles.micContainer}>
          <Feather
            name={isAudioMute ? 'mic-off' : 'mic'}
            style={styles.mic}
            size={20}
          />
        </View>
        <View style={styles.micContainer}>
          <Feather
            name={isVideoMute ? 'video-off' : 'video'}
            style={styles.mic}
            size={20}
          />
        </View>
      </View>
    </View>
  ) : (
    <></>
  );
};

const Meeting = ({
  messages,
  addMessageRequest,
  clearMessageRequest,
  hmsInstance,
  state,
}: MeetingProps) => {
  const [orientation, setOrientation] = useState<boolean>(true);
  const [instance, setInstance] = useState<HMSSDK | undefined>();
  const [trackId, setTrackId] = useState<Peer>(DEFAULT_PEER);
  const [remoteTrackIds, setRemoteTrackIds] = useState<Peer[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [speakers, setSpeakers] = useState<Array<string>>([]);
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
  const [hlsStreamingDetails, setHLSStreamingDetails] =
    useState<HMSHLSMeetingURLVariant>({
      meetingUrl: state.user.roomID
        ? state.user.roomID + '?token=beam_recording'
        : '',
      metadata: '',
    });
  const [roleChangeModalVisible, setRoleChangeModalVisible] = useState(false);
  const [layoutModal, setLayoutModal] = useState(false);
  const [changeTrackStateModalVisible, setChangeTrackStateModalVisible] =
    useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [localPeerPermissions, setLocalPeerPermissions] =
    useState<HMSPermissions>();
  const flatlistRef = useRef<FlatList>(null);
  const hlsPlayerRef = useRef<Video>(null);
  const [hlsPlayerSeek, setHlsPlayerSeek] = useState(0);
  const [page, setPage] = useState(0);

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
  const {left, right} = useSafeAreaInsets();

  const pairedPeers: Array<Array<Peer>> = pairDataForScrollView(
    [...auxTracks, trackId, ...remoteTrackIds],
    isPortrait() ? (layout === 'audio' ? 6 : 4) : 2,
  );

  const decodeRemotePeer = (
    peer: HMSRemotePeer,
    type: 'remote' | 'screen',
  ): Peer => {
    const metadata = peer.metadata;
    return {
      trackId: peer?.videoTrack?.trackId,
      name: peer?.name,
      isAudioMute: peer?.audioTrack?.isMute() || false,
      isVideoMute: peer?.videoTrack?.isMute() || false,
      id: peer?.peerID,
      colour: getThemeColour(),
      sink: true,
      type,
      peerRefrence: peer,
      metadata: metadata && metadata !== '' ? JSON.parse(metadata) : {},
    };
  };

  const decodeLocalPeer = (
    peer: HMSLocalPeer,
    type: 'local' | 'screen',
  ): Peer => {
    const metadata = peer.metadata;
    const videoPublishPermission = peer?.role?.publishSettings?.allowed
      ? peer?.role?.publishSettings?.allowed?.includes('video')
      : true;
    const audioPublishPermission = peer?.role?.publishSettings?.allowed
      ? peer?.role?.publishSettings?.allowed?.includes('audio')
      : true;
    return {
      trackId: peer?.videoTrack?.trackId,
      name: peer?.name,
      isAudioMute: audioPublishPermission
        ? peer?.audioTrack?.isMute() || false
        : true,
      isVideoMute: videoPublishPermission
        ? peer?.videoTrack?.isMute() || false
        : true,
      id: peer?.peerID,
      colour: getThemeColour(),
      sink: true,
      type,
      peerRefrence: peer,
      metadata: metadata && metadata !== '' ? JSON.parse(metadata) : {},
    };
  };

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
    setSpeakers(peerIds || []);
    console.log('data in onSpeaker: ', data);
  };

  const reconnecting = (data: any) => {
    console.log('data in reconnecting: ', data);
    Toast.showWithGravity('Reconnecting...', Toast.LONG, Toast.TOP);
  };

  const reconnected = (data: any) => {
    console.log('data in reconnected: ', data);
    Toast.showWithGravity('Reconnected', Toast.LONG, Toast.TOP);
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
    }
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
  };

  useEffect(() => {
    updateHmsInstance(hmsInstance);

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
    };
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

  useEffect(() => {
    if (Platform.OS === 'android') {
      hlsPlayerRef?.current?.seek(hlsPlayerSeek);
    }
  }, [hlsPlayerRef, hlsPlayerSeek, instance?.room?.hlsStreamingState]);

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
    if (localPeerPermissions?.mute) {
      buttons.push(
        ...[
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
              await instance?.changeTrackStateRoles(
                HMSTrackType.VIDEO,
                true,
                source,
                [newRole!],
              );
              break;
            case 2:
              await instance?.changeTrackStateRoles(
                HMSTrackType.VIDEO,
                false,
                source,
                [newRole!],
              );
              break;
            case 3:
              await instance?.changeTrackStateRoles(
                HMSTrackType.AUDIO,
                true,
                source,
                [newRole!],
              );
              break;
            case 4:
              await instance?.changeTrackStateRoles(
                HMSTrackType.AUDIO,
                false,
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
          await instance?.endRoom(false, 'Host ended the room');
          clearMessageRequest();
          navigate('WelcomeScreen');
        },
      });
    }
    return buttons;
  };

  const onViewRef = React.useRef(({viewableItems}: any) => {
    if (viewableItems) {
      const viewableItemsIds: (string | undefined)[] = [];
      viewableItems.map(
        (viewableItem: {
          index: number;
          item: Array<Peer>;
          key: string;
          isViewable: boolean;
        }) => {
          viewableItem?.item?.map((item: Peer) => {
            viewableItemsIds.push(item?.trackId);
          });
        },
      );

      const inst = hmsInstance;
      const remotePeers = inst?.remotePeers;
      if (remotePeers) {
        const sinkRemoteTrackIds = remotePeers.map(
          (peer: HMSRemotePeer, index: number) => {
            const remotePeer = decodeRemotePeer(peer, 'remote');
            const videoTrackId = remotePeer.trackId;
            if (videoTrackId) {
              if (!viewableItemsIds?.includes(videoTrackId)) {
                return {
                  ...remotePeer,
                  sink: false,
                };
              }
              return remotePeer;
            } else {
              return {
                ...remotePeer,
                trackId: index.toString(),
                sink: false,
                isVideoMute: true,
              };
            }
          },
        );
        setRemoteTrackIds(sinkRemoteTrackIds ? sinkRemoteTrackIds : []);
      }
    }
  });

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

  if (page + 1 > pairedPeers.length) {
    flatlistRef?.current?.scrollToEnd();
  }

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
          {[{name: 'normal'}, {name: 'audio'}].map((item, index) => (
            <Picker.Item key={index} label={item.name} value={item.name} />
          ))}
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
          <TouchableOpacity
            onPress={() => {
              instance?.muteAllPeersAudio(!muteAllAudio);
              setMuteAllAudio(!muteAllAudio);
            }}
            style={styles.headerIcon}>
            <Ionicons
              name={muteAllAudio ? 'volume-mute' : 'volume-high'}
              style={styles.headerName}
              size={dimension.viewHeight(30)}
            />
          </TouchableOpacity>
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
                    controls
                    onLoad={({duration}) => {
                      if (Platform.OS === 'android') {
                        setHlsPlayerSeek(duration);
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
        ) : (
          <FlatList
            ref={flatlistRef}
            horizontal
            data={pairedPeers}
            initialNumToRender={2}
            maxToRenderPerBatch={3}
            onScroll={({nativeEvent}) => {
              const {contentOffset, layoutMeasurement} = nativeEvent;
              setPage(contentOffset.x / layoutMeasurement.width);
            }}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => {
              return (
                <View
                  key={item[0]?.trackId}
                  style={[
                    styles.page,
                    {width: Dimensions.get('window').width - left - right},
                  ]}>
                  {item?.map(
                    (view: Peer) =>
                      view?.id &&
                      (view.type === 'screen' ? (
                        <DisplayTrack
                          key={view?.id}
                          peer={view}
                          videoStyles={getAuxVideoStyles}
                          speakers={speakers}
                          instance={instance}
                          type={view.type}
                          permissions={localPeerPermissions}
                        />
                      ) : (
                        <DisplayTrack
                          key={view?.id}
                          peer={view}
                          videoStyles={getRemoteVideoStyles}
                          speakers={speakers}
                          instance={instance}
                          type={view.type}
                          permissions={localPeerPermissions}
                          layout={layout}
                        />
                      )),
                  )}
                </View>
              );
            }}
            numColumns={1}
            onViewableItemsChanged={onViewRef.current}
            keyExtractor={item => item[0]?.id}
          />
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
              `{"isHandRaised":${!trackId?.metadata?.isHandRaised}}`,
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
                await instance?.sendDirectMessage(value, messageTo?.obj?.id);
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  videoView: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    flex: 1,
  },
  videoIcon: {
    color: getThemeColour(),
  },
  raiseHandContainer: {
    padding: 10,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  raiseHand: {
    color: 'rgb(242,202,73)',
  },
  fullScreenTile: {
    width: '100%',
    marginVertical: 1,
    padding: 0.5,
    overflow: 'hidden',
    borderRadius: 10,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  fullScreenLandscape: {
    width: '100%',
    marginVertical: 1,
    padding: 0.5,
    overflow: 'hidden',
    borderRadius: 10,
    justifyContent: 'center',
    alignSelf: 'center',
    aspectRatio: 16 / 9,
  },
  generalTile: {
    width: '50%',
    marginVertical: 1,
    padding: '0.25%',
    overflow: 'hidden',
    borderRadius: 10,
  },
  hmsView: {
    height: '100%',
    width: '100%',
  },
  hmsViewScreen: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  iconContainers: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: dimension.viewHeight(22),
    paddingTop: dimension.viewHeight(15),
    width: '100%',
    backgroundColor: 'white',
    height: dimension.viewHeight(90),
  },
  buttonText: {
    backgroundColor: getThemeColour(),
    padding: 10,
    borderRadius: 10,
    color: '#efefef',
  },
  leaveIconContainer: {
    backgroundColor: '#ee4578',
    padding: dimension.viewHeight(10),
    borderRadius: 50,
  },
  singleIconContainer: {
    padding: dimension.viewHeight(10),
  },
  leaveIcon: {
    color: 'white',
  },
  cameraImage: {
    width: dimension.viewHeight(30),
    height: dimension.viewHeight(30),
  },
  scroll: {
    width: '100%',
  },
  wrapper: {
    flex: 1,
  },
  displayContainer: {
    position: 'absolute',
    bottom: 2,
    alignSelf: 'center',
    backgroundColor: 'rgba(137,139,155,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  peerName: {
    color: getThemeColour(),
  },
  peerNameContainer: {
    maxWidth: 80,
  },
  micContainer: {
    paddingHorizontal: 3,
  },
  mic: {
    color: getThemeColour(),
  },
  avatarContainer: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    aspectRatio: 1,
    width: '50%',
    maxWidth: dimension.viewWidth(100),
    maxHeight: dimension.viewHeight(100),
    borderRadius: 500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 30,
    color: 'white',
  },
  degradedText: {
    fontSize: 20,
    color: 'white',
  },
  highlight: {
    borderRadius: 10,
    borderWidth: 5,
    borderColor: getThemeColour(),
  },
  messageDot: {
    width: 10,
    height: 10,
    borderRadius: 20,
    position: 'absolute',
    zIndex: 100,
    backgroundColor: 'red',
    right: dimension.viewWidth(10),
    top: dimension.viewHeight(10),
  },
  options: {
    color: getThemeColour(),
  },
  optionsContainer: {
    padding: 10,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  roleChangeText: {
    padding: 12,
  },
  headerName: {
    color: getThemeColour(),
  },
  headerIcon: {
    padding: dimension.viewHeight(10),
  },
  headerContainer: {
    height: dimension.viewHeight(50),
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  rowWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  page: {
    flexDirection: 'row',
    width: dimension.viewWidth(414),
    flexWrap: 'wrap',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recording: {
    color: 'red',
    padding: dimension.viewHeight(10),
  },
  streaming: {
    color: 'red',
    padding: dimension.viewHeight(10),
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'black',
    paddingLeft: 10,
    minHeight: 32,
    color: getThemeColour(),
    margin: 10,
  },
  recordingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  checkboxContainer: {
    height: 25,
    width: 25,
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    color: 'black',
  },
  renderVideo: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const mapDispatchToProps = (dispatch: Function) => ({
  addMessageRequest: (data: any) => dispatch(addMessage(data)),
  clearMessageRequest: () => dispatch(clearMessageData()),
  updateHms: (data: {hmsInstance: HMSSDK}) =>
    dispatch(updateHmsReference(data)),
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
