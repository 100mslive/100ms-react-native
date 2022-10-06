import {
  HMSException,
  HMSLocalPeer,
  HMSPeer,
  HMSPeerUpdate,
  HMSRoom,
  HMSRoomUpdate,
  HMSSDK,
  HMSTrack,
  HMSTrackUpdate,
  HMSUpdateListenerActions,
} from '@100mslive/react-native-hms';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View, Text, SafeAreaView, Platform} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-simple-toast';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {styles} from './styles';
import {CustomButton, DefaultModal, Menu, MenuItem} from '../../components';
import {ModalTypes, PeerTrackNode} from '../../utils/types';
import {
  pairData,
  parseMetadata,
  updatePeersTrackNodesOnPeerListener,
  updatePeersTrackNodesOnTrackListener,
} from '../../utils/functions';
import {EndRoomModal, LeaveRoomModal, RealTime} from '../Meeting/Modals';
import {RootState} from '../../redux';
import type {AppStackParamList} from '../../navigator';
import {
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
  const [modalVisible, setModalVisible] = useState<ModalTypes>(
    ModalTypes.DEFAULT,
  );

  // useState hook
  const [room, setRoom] = useState<HMSRoom>();
  const [localPeer, setLocalPeer] = useState<HMSLocalPeer>();

  return (
    <SafeAreaView style={styles.container}>
      <Header
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        // room={room}
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
        // room={room}
        localPeer={localPeer}
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
  const {hmsInstance} = useSelector((state: RootState) => state.user);
  const {peerState} = useSelector((state: RootState) => state.app);
  const navigate = useNavigation<MeetingScreenProp>().navigate;
  const dispatch = useDispatch();

  // useState hook
  const [peerTrackNodes, setPeerTrackNodes] =
    useState<Array<PeerTrackNode>>(peerState);

  // useRef hook
  const peerTrackNodesRef = useRef(peerTrackNodes);

  // constants
  const pairedPeers = useMemo(
    () => pairData(peerTrackNodes, 4),
    [peerTrackNodes],
  );

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

  // const onRoomListener = ({
  //   room,
  //   type,
  // }: {
  //   room: HMSRoom;
  //   type: HMSRoomUpdate;
  // }) => {
  //   data?.setRoom(room);

  //   if (type === HMSRoomUpdate.BROWSER_RECORDING_STATE_UPDATED) {
  //     let streaming = room?.browserRecordingState?.running;
  //     let hours = room?.browserRecordingState?.startedAt.getHours().toString();
  //     let minutes = room?.browserRecordingState?.startedAt
  //       .getMinutes()
  //       ?.toString();
  //     let time = hours + ':' + minutes;

  //     Toast.showWithGravity(
  //       `Browser Recording ${streaming ? 'Started At ' + time : 'Stopped'}`,
  //       Toast.LONG,
  //       Toast.TOP,
  //     );
  //   } else if (type === HMSRoomUpdate.HLS_STREAMING_STATE_UPDATED) {
  //     let streaming = room?.hlsStreamingState?.running;

  //     Toast.showWithGravity(
  //       `HLS Streaming ${streaming ? 'Started' : 'Stopped'}`,
  //       Toast.LONG,
  //       Toast.TOP,
  //     );
  //   } else if (type === HMSRoomUpdate.RTMP_STREAMING_STATE_UPDATED) {
  //     let streaming = room?.rtmpHMSRtmpStreamingState?.running;
  //     let hours = room?.rtmpHMSRtmpStreamingState?.startedAt
  //       .getHours()
  //       .toString();
  //     let minutes = room?.rtmpHMSRtmpStreamingState?.startedAt
  //       .getMinutes()
  //       ?.toString();
  //     let time = hours + ':' + minutes;

  //     Toast.showWithGravity(
  //       `RTMP Streaming ${streaming ? 'Started At ' + time : 'Stopped'}`,
  //       Toast.LONG,
  //       Toast.TOP,
  //     );
  //   } else if (type === HMSRoomUpdate.SERVER_RECORDING_STATE_UPDATED) {
  //     let streaming = room?.serverRecordingState?.running;
  //     let hours = room?.serverRecordingState?.startedAt.getHours().toString();
  //     let minutes = room?.serverRecordingState?.startedAt
  //       .getMinutes()
  //       ?.toString();
  //     let time = hours + ':' + minutes;

  //     Toast.showWithGravity(
  //       `Server Recording ${streaming ? 'Started At ' + time : 'Stopped'}`,
  //       Toast.LONG,
  //       Toast.TOP,
  //     );
  //   }
  // };

  // const onPeerListener = ({
  //   peer,
  //   type,
  // }: {
  //   peer: HMSPeer;
  //   type: HMSPeerUpdate;
  // }) => {
  //   const newPeerTrackNodes = updatePeersTrackNodesOnPeerListener(
  //     peerTrackNodesRef?.current,
  //     peer,
  //     type,
  //   );
  //   setPeerTrackNodes(newPeerTrackNodes);
  //   peerTrackNodesRef.current = newPeerTrackNodes;

  //   if (type === HMSPeerUpdate.PEER_LEFT) {
  //     Toast.showWithGravity(
  //       `Peer Left: ${peer.name} left the Room`,
  //       Toast.LONG,
  //       Toast.TOP,
  //     );
  //   } else if (type === HMSPeerUpdate.PEER_JOINED) {
  //     Toast.showWithGravity(
  //       `Peer Joined: ${peer.name} joined the Room`,
  //       Toast.LONG,
  //       Toast.TOP,
  //     );
  //   } else if (type === HMSPeerUpdate.ROLE_CHANGED) {
  //     Toast.showWithGravity(
  //       `Role Changed: Role of ${peer?.name} changed to ${peer?.role?.name}`,
  //       Toast.LONG,
  //       Toast.TOP,
  //     );
  //   }
  // };

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
    if (peer?.isLocal) {
      data?.setLocalPeer(
        new HMSLocalPeer({
          ...peer,
          localAudioTrackData: peer.audioTrack,
          localVideoTrackData: peer.videoTrack,
        }),
      );
    }
    peerTrackNodesRef.current = newPeerTrackNodes;
  };

  const onRemovedFromRoomListener = async () => {
    await destroy();
  };

  const updateHmsInstance = (hms?: HMSSDK) => {
    // hms?.addEventListener(
    //   HMSUpdateListenerActions.ON_ROOM_UPDATE,
    //   onRoomListener,
    // );
    // hms?.addEventListener(
    //   HMSUpdateListenerActions.ON_PEER_UPDATE,
    //   onPeerListener,
    // );
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_TRACK_UPDATE,
      onTrackListener,
    );
    hms?.addEventListener(HMSUpdateListenerActions.ON_ERROR, onErrorListener);
    hms?.addEventListener(
      HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM,
      onRemovedFromRoomListener,
    );
    // hms?.addEventListener(
    //   HMSUpdateListenerActions.ON_MESSAGE,
    //   onMessageListener,
    // );
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
    // hms?.addEventListener(
    //   HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST,
    //   onRoleChangeRequestListener,
    // );
    // hms?.addEventListener(
    //   HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST,
    //   onChangeTrackStateRequestListener,
    // );
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

  useEffect(() => {
    updateHmsInstance(hmsInstance);

    return () => {
      onLeavePress();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      {/* <View style={{flex: 1, backgroundColor: 'red'}}></View> */}
      <GridView pairedPeers={pairedPeers} />
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
  const {roomCode} = useSelector((state: RootState) => state.user);

  const iconSize = 20;
  const isScreenShared =
    localPeer?.auxiliaryTracks && localPeer?.auxiliaryTracks?.length > 0;
  const parsedMetadata = parseMetadata(localPeer?.metadata);

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
            <RealTime />
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
          onPress={() => console.log('onParticipantsPress')}
          viewStyle={styles.iconContainer}
          LeftIcon={
            <Ionicons name="people" style={styles.icon} size={iconSize} />
          }
        />
        <CustomButton
          onPress={() => console.log('onRaiseHandPress')}
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
            onPress={() => console.log('onSwitchCameraPress')}
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
  room,
  localPeer,
  setModalVisible,
}: {
  room?: HMSRoom;
  localPeer?: HMSLocalPeer;
  setModalVisible: React.Dispatch<React.SetStateAction<ModalTypes>>;
}) => {
  const {bottom, left, right} = useSafeAreaInsets();

  const iconSize = 20;
  const isScreenShared =
    localPeer?.auxiliaryTracks && localPeer?.auxiliaryTracks?.length > 0;

  return (
    <View
      style={[
        localPeer?.role?.permissions?.hlsStreaming
          ? styles.iconBotttomWrapperHls
          : styles.iconBotttomWrapper,
        {bottom, left, right},
      ]}>
      <View style={styles.iconBotttomButtonWrapper}>
        {localPeer?.role?.publishSettings?.allowed?.includes('audio') && (
          <CustomButton
            // onPress={() => console.log('onMicStatusPress')}
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
            // onPress={() => console.log('onVideoStatusPress')}
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
        {localPeer?.role?.permissions?.hlsStreaming &&
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
          ))}
        <CustomButton
          onPress={
            isScreenShared
              ? () => console.log('onEndScreenSharePress')
              : () => console.log('onStartScreenSharePress')
          }
          viewStyle={[styles.iconContainer, isScreenShared && styles.iconMuted]}
          LeftIcon={
            <MaterialCommunityIcons
              name="monitor-share"
              style={styles.icon}
              size={iconSize}
            />
          }
        />
        <CustomButton
          onPress={() => console.log('onSettingsPress')}
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
      {localPeer?.role?.permissions?.hlsStreaming &&
        (room?.hlsStreamingState?.running ? (
          <Text style={styles.liveText}>End stream</Text>
        ) : (
          <Text style={styles.liveText}>Go Live</Text>
        ))}
    </View>
  );
};

export {Meeting};
