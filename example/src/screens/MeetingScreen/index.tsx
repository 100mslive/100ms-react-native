import {
  HMSAudioFilePlayerNode,
  HMSAudioMixingMode,
  HMSAudioMode,
  HMSChangeTrackStateRequest,
  HMSException,
  HMSLocalPeer,
  HMSMessage,
  HMSPeer,
  HMSPeerUpdate,
  HMSRoleChangeRequest,
  HMSRoom,
  HMSRoomUpdate,
  HMSSDK,
  HMSTrack,
  HMSTrackUpdate,
  HMSUpdateListenerActions,
} from '@100mslive/react-native-hms';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View, Text, SafeAreaView, Platform, Dimensions} from 'react-native';
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
import {ModalTypes, PeerTrackNode} from '../../utils/types';
import {
  isPortrait,
  pairData,
  parseMetadata,
  updatePeersTrackNodesOnPeerListener,
  updatePeersTrackNodesOnTrackListener,
} from '../../utils/functions';
import {
  ChangeAudioMixingModeModal,
  ChangeAudioModeModal,
  ChangeAudioOutputModal,
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
  clearHmsReference,
  clearMessageData,
  clearPeerData,
} from '../../redux/actions';
import {GridView} from './GridView';

type MeetingScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'MeetingScreen'
>;

const Meeting = () => {
  // hooks
  const {hmsInstance} = useSelector((state: RootState) => state.user);

  // useState hook
  const [room, setRoom] = useState<HMSRoom>();
  const [localPeer, setLocalPeer] = useState<HMSLocalPeer>();
  const [modalVisible, setModalVisible] = useState<ModalTypes>(
    ModalTypes.DEFAULT,
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
    updateLocalPeer();
    updateRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        room={room}
        localPeer={localPeer}
      />
      <DisplayView
        room={room}
        localPeer={localPeer}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        setRoom={setRoom}
        setLocalPeer={setLocalPeer}
      />
      <Footer
        isHlsStreaming={room?.hlsStreamingState?.running}
        isBrowserRecording={room?.browserRecordingState?.running}
        isHlsRecording={room?.hlsRecordingState?.running}
        isRtmpStreaming={room?.rtmpHMSRtmpStreamingState?.running}
        localPeer={localPeer}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
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
}) => {
  // hooks
  const {hmsInstance} = useSelector((state: RootState) => state.user);
  const {peerState} = useSelector((state: RootState) => state.app);
  const navigate = useNavigation<MeetingScreenProp>().navigate;
  const dispatch = useDispatch();

  // useState hook
  const [peerTrackNodes, setPeerTrackNodes] =
    useState<Array<PeerTrackNode>>(peerState);
  const [orientation, setOrientation] = useState(true);
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
    const newPeerTrackNodes = updatePeersTrackNodesOnPeerListener(
      peerTrackNodesRef?.current,
      peer,
      type,
    );
    setPeerTrackNodes(newPeerTrackNodes);
    peerTrackNodesRef.current = newPeerTrackNodes;
    if (peer?.isLocal) {
      hmsInstance?.getLocalPeer().then(localPeer => {
        data?.setLocalPeer(localPeer);
      });
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
    const newPeerTrackNodes = updatePeersTrackNodesOnTrackListener(
      peerTrackNodesRef?.current,
      track,
      peer,
      type,
    );
    setPeerTrackNodes(newPeerTrackNodes);
    peerTrackNodesRef.current = newPeerTrackNodes;
    if (peer?.isLocal) {
      hmsInstance?.getLocalPeer().then(localPeer => {
        data?.setLocalPeer(localPeer);
      });
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
    console.log('data in onRoleChangeRequestListener: ', data);
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
    dispatch(addMessage(message));
    Toast.showWithGravity(
      `${message.sender?.name}: ${message.message}`,
      Toast.SHORT,
      Toast.TOP,
    );
    // setNotification(true);
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

  // useEffect hook
  useEffect(() => {
    const callback = () => {
      setOrientation(isPortrait());
    };
    updateHmsInstance(hmsInstance);
    callback();
    Dimensions.addEventListener('change', callback);
    return () => {
      Dimensions.removeEventListener('change', callback);
      onLeavePress();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPeerTrackNodes(peerState);
    peerTrackNodesRef.current = peerState;
  }, [peerState]);

  return (
    <View style={styles.container}>
      {pairedPeers.length ? (
        <GridView pairedPeers={pairedPeers} orientation={orientation} />
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
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={data?.modalVisible === ModalTypes.LEAVE_ROOM}
        setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}>
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
        setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}>
        <EndRoomModal
          onSuccess={onEndRoomPress}
          cancelModal={() => data?.setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      {/* TODO: message notification */}
      <DefaultModal
        modalVisible={data?.modalVisible === ModalTypes.CHAT}
        setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}>
        <ChatWindow localPeer={data?.localPeer} />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={data?.modalVisible === ModalTypes.CHANGE_TRACK}
        setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}>
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
        setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}>
        <ChangeRoleAccepteModal
          instance={hmsInstance}
          roleChangeRequest={roleChangeRequest}
          cancelModal={() => data?.setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        modalVisible={data?.modalVisible === ModalTypes.PARTICIPANTS}
        setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}>
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
        setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}>
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
        setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}>
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
        setModalVisible={() => data?.setModalVisible(ModalTypes.DEFAULT)}>
        <ChangeNameModal
          instance={hmsInstance}
          peer={updatePeer}
          cancelModal={() => data?.setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
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
              }}>
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
  setModalVisible,
}: {
  isHlsStreaming?: boolean;
  isBrowserRecording?: boolean;
  isHlsRecording?: boolean;
  isRtmpStreaming?: boolean;
  localPeer?: HMSLocalPeer;
  modalVisible: ModalTypes;
  setModalVisible: React.Dispatch<React.SetStateAction<ModalTypes>>;
}) => {
  // hooks
  const {hmsInstance, roomID} = useSelector((state: RootState) => state.user);

  // useState hook
  const [muteAllTracksAudio, setMuteAllTracksAudio] = useState(false);
  const [rtmpAndRecording, setRtmpAndRecording] = useState(isBrowserRecording);
  const [hlsStreaming, setHlsStreaming] = useState(isHlsStreaming);
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
  const parsedMetadata = parseMetadata(localPeer?.metadata);
  const audioFilePlayerNode = new HMSAudioFilePlayerNode(
    'audio_file_player_node',
  );

  // listeners
  const onAudioDeviceChangedListener = (data: any) => {
    Toast.showWithGravity(
      `Audio Device Output changed to ${data?.device}`,
      Toast.LONG,
      Toast.TOP,
    );
  };

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
          await hmsInstance
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
    ];
    if (!localPeer?.role?.name?.includes('hls-')) {
      buttons.push({
        text: muteAllTracksAudio
          ? 'Local unmute all audio tracks'
          : 'Local mute all audio tracks',
        onPress: () => {
          hmsInstance?.setPlaybackForAllAudio(!muteAllTracksAudio);
          setMuteAllTracksAudio(!muteAllTracksAudio);
        },
      });
    }
    if (localPeer?.role?.permissions?.mute) {
      buttons.push({
        text: 'Remote mute all audio tracks',
        onPress: async () => {
          await hmsInstance
            ?.remoteMuteAllAudio()
            .then(d => console.log('Remote Mute All Audio Success: ', d))
            .catch(e => console.log('Remote Mute All Audio Error: ', e));
        },
      });
    }
    if (localPeer?.role?.permissions?.rtmpStreaming && hlsStreaming) {
      buttons.push({
        text: 'Stop Hls Streaming',
        onPress: () => {
          hmsInstance
            ?.stopHLSStreaming()
            .then(d => {
              setHlsStreaming(false);
              console.log('Stop HLS Streaming Success: ', d);
            })
            .catch(e => console.log('Stop HLS Streaming Error: ', e));
        },
      });
    }
    if (localPeer?.role?.permissions?.rtmpStreaming && !hlsStreaming) {
      buttons.push({
        text: 'Start Hls Streaming',
        onPress: () => {
          setModalVisible(ModalTypes.HLS_STREAMING);
        },
      });
    }
    if (localPeer?.role?.permissions?.rtmpStreaming && rtmpAndRecording) {
      buttons.push({
        text: 'Stop RTMP And Recording',
        onPress: () => {
          hmsInstance
            ?.stopRtmpAndRecording()
            .then(d => {
              setRtmpAndRecording(false);
              console.log('Stop RTMP And Recording Success: ', d);
            })
            .catch(e => console.log('Stop RTMP And Recording Error: ', e));
        },
      });
    }
    if (localPeer?.role?.permissions?.rtmpStreaming && !rtmpAndRecording) {
      buttons.push({
        text: 'Start RTMP or Recording',
        onPress: () => {
          setModalVisible(ModalTypes.RECORDING);
        },
      });
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
            hmsInstance?.removeEventListener(
              HMSUpdateListenerActions.ON_AUDIO_DEVICE_CHANGED,
            );
            setAudioDeviceChangeListener(false);
          },
        });
      } else {
        buttons.push({
          text: 'Set Audio Device Change Listener',
          onPress: () => {
            hmsInstance?.setAudioDeviceChangeListener(
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
            hmsInstance
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
            hmsInstance
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
    // buttons.push(
    //   ...[
    //     {
    //       text: 'Stats For Nerds',
    //       onPress: () => {
    //         setModalVisible(ModalTypes.RTC_STATS);
    //       },
    //     },
    //     {
    //       text: 'Report issue and share logs',
    //       onPress: async () => {
    //         const permission = await requestExternalStoragePermission();
    //         if (permission) {
    //           await reportIssue();
    //         }
    //       },
    //     },
    //   ],
    // );
    return buttons;
  };

  // useEffect hook
  useEffect(() => {
    setHlsStreaming(isHlsStreaming);
  }, [isHlsStreaming]);

  useEffect(() => {
    setRtmpAndRecording(isBrowserRecording);
  }, [isBrowserRecording]);

  return (
    <View
      style={[
        // localPeer?.role?.permissions?.hlsStreaming
        //   ? styles.iconBotttomWrapperHls :
        styles.iconBotttomWrapper,
      ]}>
      <View style={styles.iconBotttomButtonWrapper}>
        {localPeer?.role?.publishSettings?.allowed?.includes('audio') && (
          <CustomButton
            onPress={() =>
              localPeer
                ?.localAudioTrack()
                ?.setMute(!localPeer?.audioTrack?.isMute())
            }
            viewStyle={[
              styles.iconContainer,
              localPeer?.audioTrack?.isMute() && styles.iconMuted,
            ]}
            LeftIcon={
              <Feather
                name={localPeer?.audioTrack?.isMute() ? 'mic-off' : 'mic'}
                style={styles.icon}
                size={iconSize}
              />
            }
          />
        )}
        {localPeer?.role?.publishSettings?.allowed?.includes('video') && (
          <CustomButton
            onPress={() =>
              localPeer
                ?.localVideoTrack()
                ?.setMute(!localPeer?.videoTrack?.isMute())
            }
            viewStyle={[
              styles.iconContainer,
              localPeer?.videoTrack?.isMute() && styles.iconMuted,
            ]}
            LeftIcon={
              <Feather
                name={localPeer?.videoTrack?.isMute() ? 'video-off' : 'video'}
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
      <AlertModal
        modalVisible={modalVisible === ModalTypes.SETTINGS}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
        title="Settings"
        buttons={getSettingsButtons()}
      />
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={
          modalVisible === ModalTypes.RECORDING ||
          modalVisible === ModalTypes.RESOLUTION
        }
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <RecordingModal
          instance={hmsInstance}
          roomID={roomID}
          setModalVisible={setModalVisible}
          setRtmpAndRecording={setRtmpAndRecording}
          recordingModal={modalVisible === ModalTypes.RECORDING}
        />
      </DefaultModal>
      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.HLS_STREAMING}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <HlsStreamingModal
          instance={hmsInstance}
          setHlsStreaming={setHlsStreaming}
          roomID={roomID}
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
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
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
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
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
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}>
        <ChangeAudioMixingModeModal
          instance={hmsInstance}
          newAudioMixingMode={newAudioMixingMode}
          setNewAudioMixingMode={setNewAudioMixingMode}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
    </View>
  );
};

export {Meeting};
