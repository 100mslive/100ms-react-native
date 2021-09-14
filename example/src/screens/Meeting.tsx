import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
  SafeAreaView,
  Platform,
} from 'react-native';
import {connect} from 'react-redux';
import HmsManager, {
  HmsView,
  HMSUpdateListenerActions,
  HMSMessage,
} from '@100mslive/react-native-hms';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ChatWindow from '../components/ChatWindow';
import AlertModal from '../components/AlertModal';
import Modal from '../components/Modal';
import Picker from '../components/Picker';
import {addMessage, clearMessageData} from '../redux/actions/index';
import {useNavigation} from '@react-navigation/native';
import dimension from '../utils/dimension';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {AppStackParamList} from '../navigator';
import {getRandomColor, getInitials} from '../utils/functions';

type Peer = {
  trackId?: string;
  peerName?: string;
  isAudioMute?: boolean;
  isVideoMute?: boolean;
  peerId?: String;
  colour?: string;
  role?: any;
};

type DisplayNameProps = {
  peer?: Peer;
  videoStyles: Function;
  safeHeight: any;
  speakers: Array<String>;
  type: 'local' | 'remote';
  instance: any;
};

type MeetingProps = {
  messages: any;
  addMessageRequest: Function;
  clearMessageRequest: Function;
  audioState: boolean;
  videoState: boolean;
  state: any;
};

type MeetingScreenProp = StackNavigationProp<AppStackParamList, 'Meeting'>;

const android = Platform.OS === 'android' ? true : false;

const DisplayName = ({
  peer,
  videoStyles,
  safeHeight,
  speakers,
  type,
  instance,
}: DisplayNameProps) => {
  const {peerName, isAudioMute, isVideoMute, trackId, colour, peerId, role} =
    peer!;
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [newRole, setNewRole] = useState(role?.name);
  const [force, setForce] = useState(false);

  const knownRoles = instance?.knownRoles || [];
  const speaking = speakers.includes(peerId!);
  const selectActionTitle = 'Select action';
  const selectActionMessage = '';
  const selectActionButtons = [
    {text: 'Cancel', type: 'cancel'},
    {
      text: 'Prompt to change role',
      onPress: () => {
        setForce(false);
        setRoleModalVisible(true);
      },
    },
    {
      text: 'Force change',
      onPress: () => {
        setForce(true);
        setRoleModalVisible(true);
      },
    },
    {
      text: 'Remove Participant',
      onPress: () => {
        instance?.removePeer(peerId, 'removed from room');
      },
    },
  ];
  const roleRequestTitle = 'Select action';
  const roleRequestButtons: [
    {text: String; onPress?: Function},
    {text: String; onPress?: Function}?,
  ] = [
    {text: 'Cancel'},
    {
      text: 'Send',
      onPress: () => {
        instance?.changeRole(peerId, newRole, force);
      },
    },
  ];

  const promptUser = () => {
    setAlertModalVisible(true);
  };

  return (
    <View
      key={trackId}
      style={[
        videoStyles(),
        {
          height: android
            ? safeHeight / 2 - 2
            : (safeHeight - dimension.viewHeight(90)) / 2 - 2,
        },
        speaking && styles.highlight,
      ]}>
      <AlertModal
        modalVisible={alertModalVisible}
        setModalVisible={setAlertModalVisible}
        title={selectActionTitle}
        message={selectActionMessage}
        buttons={selectActionButtons}
      />
      <Modal
        modalVisible={roleModalVisible}
        setModalVisible={setRoleModalVisible}
        title={roleRequestTitle}
        buttons={roleRequestButtons}>
        <Picker
          data={knownRoles}
          selectedItem={newRole}
          onItemSelected={setNewRole}
        />
      </Modal>
      {isVideoMute ? (
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, {backgroundColor: colour}]}>
            <Text style={styles.avatarText}>{getInitials(peerName!)}</Text>
          </View>
        </View>
      ) : (
        <HmsView trackId={trackId} style={styles.hmsView} />
      )}
      {type === 'remote' && (
        <TouchableOpacity onPress={promptUser} style={styles.optionsContainer}>
          <Entypo
            name="dots-three-horizontal"
            style={styles.options}
            size={20}
          />
        </TouchableOpacity>
      )}
      <View style={styles.displayContainer}>
        <View style={styles.peerNameContainer}>
          <Text numberOfLines={2} style={styles.peerName}>
            {peerName}
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
  );
};

const peerColour: any = {};
const getPeerColour = (trackId: string): string => {
  let colour = 'red';
  if (peerColour[trackId]) {
    colour = peerColour[trackId];
  } else {
    colour = getRandomColor();
    peerColour[trackId] = colour;
  }
  return colour;
};

const Meeting = ({
  messages,
  addMessageRequest,
  clearMessageRequest,
}: MeetingProps) => {
  const [instance, setInstance] = useState<any>(null);
  const [trackId, setTrackId] = useState<Peer>({});
  const [remoteTrackIds, setRemoteTrackIds] = useState<Peer[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [safeHeight, setSafeHeight] = useState(0);
  const [speakers, setSpeakers] = useState([]);
  const [notification, setNotification] = useState(false);
  const [roleChangeRequest, setRoleChangeRequest] = useState<{
    requestedBy?: String;
    suggestedRole?: String;
  }>({});
  const [roleChangeModalVisible, setRoleChangeModalVisible] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);

  const roleChangeRequestTitle = 'Role Change Request';
  const roleChangeRequestButtons: [
    {text: String; onPress?: Function},
    {text: String; onPress?: Function},
  ] = [
    {text: 'Reject'},
    {
      text: 'Accept',
      onPress: () => {
        instance?.acceptRoleChange();
      },
    },
  ];

  const navigate = useNavigation<MeetingScreenProp>().navigate;

  const updateVideoIds = (remotePeers: any, localPeer: any) => {
    // get local track Id
    const localPeerId = instance?.localPeer?.peerID;
    const localTrackId = localPeer?.videoTrack?.trackId;
    const localPeerName = localPeer?.name;
    const localPeerRole = localPeer?.role;
    const localPeerIsAudioMute = localPeer?.audioTrack?.mute;
    const localPeerIsVideoMute = localPeer?.videoTrack?.mute;
    const localPeerColour = getPeerColour(localTrackId);
    if (localTrackId) {
      setTrackId({
        trackId: localTrackId,
        peerName: localPeerName,
        isAudioMute: localPeerIsAudioMute,
        isVideoMute: localPeerIsVideoMute,
        peerId: localPeerId,
        colour: localPeerColour,
        role: localPeerRole,
      });
    }

    const remoteVideoIds: Peer[] = [];

    if (remotePeers) {
      remotePeers.map((remotePeer: any, index: number) => {
        const remotePeerId = remotePeer?.peerID;
        const remoteTrackId = remotePeer?.videoTrack?.trackId;
        const remotePeerName = remotePeer?.name;
        const remotePeerRole = remotePeer?.role;
        const remotePeerAudioIsMute = remotePeer?.audioTrack?.mute;
        const remotePeerVideoIsMute = remotePeer?.videoTrack?.mute;
        const remotePeerColour = getPeerColour(remoteTrackId);
        if (remoteTrackId) {
          remoteVideoIds.push({
            trackId: remoteTrackId,
            peerName: remotePeerName,
            isAudioMute: remotePeerAudioIsMute,
            isVideoMute: remotePeerVideoIsMute,
            peerId: remotePeerId,
            colour: remotePeerColour,
            role: remotePeerRole,
          });
        } else {
          remoteVideoIds.push({
            trackId: index.toString(),
            peerName: remotePeerName,
            isAudioMute: remotePeerAudioIsMute,
            isVideoMute: remotePeerVideoIsMute,
            peerId: '',
            colour: 'red',
            role: '',
          });
        }
      });

      setRemoteTrackIds(remoteVideoIds as []);
    }
  };

  const onJoinListener = ({
    localPeer,
    remotePeers,
  }: {
    room?: any;
    localPeer: any;
    remotePeers: any;
  }) => {
    console.log(localPeer, remotePeers, 'data in onJoin');
  };

  const onRoomListener = ({
    // room,
    localPeer,
    remotePeers,
  }: {
    room?: any;
    localPeer: Peer;
    remotePeers: Peer;
  }) => {
    updateVideoIds(remotePeers, localPeer);
    console.log(remotePeers, localPeer, 'data in onRoom');
  };

  const onPeerListener = ({
    // room,
    remotePeers,
    localPeer,
  }: {
    room?: any;
    localPeer: Peer;
    remotePeers: Peer;
  }) => {
    updateVideoIds(remotePeers, localPeer);
    console.log(remotePeers, localPeer, 'data in onPeer');
  };

  const onTrackListener = ({
    // room,
    remotePeers,
    localPeer,
  }: {
    room?: any;
    localPeer: Peer;
    remotePeers: Peer;
  }) => {
    updateVideoIds(remotePeers, localPeer);
    console.log(remotePeers, localPeer, 'data in onTrack');
  };

  const onMessage = (data: any) => {
    addMessageRequest({data, isLocal: false});
    setNotification(true);
    console.log(data, 'data in onMessage');
  };

  const onError = (data: any) => {
    console.log(data, 'data in onError');
  };

  const onSpeaker = (data: any) => {
    setSpeakers(data?.peers);
    console.log(data, 'data in onSpeaker');
  };

  const reconnecting = (data: any) => {
    console.log(data);
  };

  const reconnected = (data: any) => {
    console.log(data);
  };

  const onRoleChangeRequest = (data: any) => {
    console.log(data);
    setRoleChangeModalVisible(true);
    setRoleChangeRequest({
      requestedBy: data?.requestedBy?.name,
      suggestedRole: data?.suggestedRole?.name,
    });
  };

  const onRemovedFromRoom = (data: any) => {
    console.log(data);
    clearMessageRequest();
    navigate('WelcomeScreen');
  };

  const updateHmsInstance = async () => {
    const HmsInstance = await HmsManager.build();
    setInstance(HmsInstance);
    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_JOIN,
      onJoinListener,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_ROOM_UPDATE,
      onRoomListener,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_PEER_UPDATE,
      onPeerListener,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_TRACK_UPDATE,
      onTrackListener,
    );

    HmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_MESSAGE,
      onMessage,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_SPEAKER,
      onSpeaker,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.RECONNECTING,
      reconnecting,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.RECONNECTED,
      reconnected,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST,
      onRoleChangeRequest,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM,
      onRemovedFromRoom,
    );
  };

  useEffect(() => {
    updateHmsInstance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (instance) {
      const remotePeers = instance?.remotePeers ? instance.remotePeers : [];
      updateVideoIds(remotePeers, instance?.localPeer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance]);

  const getLocalVideoStyles = () => {
    // if (remoteTrackIds && remoteTrackIds.length === 1) {
    //   return styles.floatingTile;
    // }
    // if (remoteTrackIds.length && remoteTrackIds.length > 1) {
    //   return styles.generalTile;
    // }
    return styles.generalTile;
  };

  const getRemoteVideoStyles = () => {
    // if (remoteTrackIds && remoteTrackIds.length === 1) {
    //   return styles.fullScreenTile;
    // }
    // if (remoteTrackIds.length && remoteTrackIds.length > 1) {
    //   if (index === remoteTrackIds.length - 1 && index % 2 === 1) {
    //     return styles.fullWidthTile;
    //   }
    //   return styles.generalTile;
    // }
    return styles.generalTile;
  };

  const getMessageToList = (): Array<{
    name: string;
    type: string;
    obj: any;
  }> => {
    const everyone = {
      name: 'everyone',
      type: 'everyone',
      obj: {},
    };
    const knownRoles = instance?.knownRoles.map((role: any) => ({
      name: role?.name,
      type: 'group',
      obj: role,
    }));
    const peers = remoteTrackIds.map(trackId => ({
      name: trackId?.peerName,
      type: 'direct',
      obj: trackId,
    }));
    return [everyone, ...knownRoles, ...peers];
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        modalVisible={roleChangeModalVisible}
        setModalVisible={setRoleChangeModalVisible}
        title={roleChangeRequestTitle}
        buttons={roleChangeRequestButtons}>
        <Text style={styles.roleChangeText}>
          Role change requested by {roleChangeRequest?.requestedBy}. Changing
          role to {roleChangeRequest?.suggestedRole}
        </Text>
      </Modal>
      <AlertModal
        modalVisible={leaveModalVisible}
        setModalVisible={setLeaveModalVisible}
        title="End Room"
        message=""
        buttons={[
          {
            text: 'Cancel',
            type: 'cancel',
          },
          {
            text: 'Leave without ending room',
            onPress: () => {
              instance.leave();
              clearMessageRequest();
              navigate('WelcomeScreen');
            },
          },
          {
            text: 'End Room for all',
            onPress: () => {
              instance.endRoom(false, 'Host ended the room');
              clearMessageRequest();
              navigate('WelcomeScreen');
            },
          },
        ]}
      />
      <View
        style={styles.wrapper}
        onLayout={data => {
          const height = data?.nativeEvent?.layout?.height;
          if (height && safeHeight === 0) {
            setSafeHeight(height);
          }
        }}>
        <ScrollView style={styles.scroll} bounces={false}>
          <View style={styles.videoView}>
            <DisplayName
              peer={trackId}
              videoStyles={getLocalVideoStyles}
              safeHeight={safeHeight}
              speakers={speakers}
              type="local"
              instance={instance}
            />
            {remoteTrackIds.map((item: Peer) => {
              return (
                <DisplayName
                  peer={item}
                  videoStyles={getRemoteVideoStyles}
                  safeHeight={safeHeight}
                  speakers={speakers}
                  key={item.trackId}
                  type="remote"
                  instance={instance}
                />
              );
            })}
          </View>
        </ScrollView>
      </View>
      <View style={styles.iconContainers}>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={async () => {
            setTrackId({
              ...trackId,
              isAudioMute: !trackId.isAudioMute,
            });
            instance.localPeer.localAudioTrack().setMute(!trackId.isAudioMute);
          }}>
          <Feather
            name={trackId.isAudioMute ? 'mic-off' : 'mic'}
            style={styles.videoIcon}
            size={dimension.viewHeight(30)}
          />
        </TouchableOpacity>
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
            instance.localPeer.localVideoTrack().switchCamera();
          }}>
          <Ionicons
            name="camera-reverse-outline"
            style={styles.videoIcon}
            size={dimension.viewHeight(30)}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={() => {
            setTrackId({
              ...trackId,
              isVideoMute: !trackId.isVideoMute,
            });
            instance.localPeer.localVideoTrack().setMute(!trackId.isVideoMute);
          }}>
          <Feather
            name={trackId.isVideoMute ? 'video-off' : 'video'}
            style={styles.videoIcon}
            size={dimension.viewHeight(30)}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.leaveIconContainer}
          onPress={async () => {
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
          send={(
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
                instance.sendBroadcastMessage(value);
              } else if (messageTo?.type === 'group') {
                instance.sendGroupMessage(value, [messageTo?.obj]);
              } else if (messageTo.type === 'direct') {
                instance.sendDirectMessage(value, messageTo?.obj?.peerId);
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
    height: dimension.viewHeight(896),
  },
  videoView: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    flex: 1,
  },
  videoIcon: {},
  fullScreenTile: {
    height: dimension.viewHeight(896),
    width: dimension.viewWidth(414),
  },
  floatingTile: {
    width: dimension.viewWidth(170),
    height: dimension.viewHeight(300),
    position: 'absolute',
    bottom: dimension.viewHeight(100),
    right: dimension.viewWidth(10),
    zIndex: 100,
  },
  generalTile: {
    width: dimension.viewWidth(206),
    marginVertical: 1,
    padding: 0.5,
    overflow: 'hidden',
    borderRadius: 10,
  },
  fullWidthTile: {
    height: dimension.viewHeight(445),
    width: dimension.viewWidth(414),
  },
  hmsView: {
    height: '100%',
    width: '100%',
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
    backgroundColor: '#4578e0',
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
    bottom: 0,
    alignSelf: 'center',
    backgroundColor: 'rgba(137,139,155,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  peerName: {
    color: 'blue',
  },
  peerNameContainer: {
    maxWidth: 80,
  },
  micContainer: {
    paddingHorizontal: 3,
  },
  mic: {
    color: 'blue',
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
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 30,
    color: 'white',
  },
  highlight: {
    backgroundColor: 'blue',
    padding: 5,
    borderRadius: 10,
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
    color: 'white',
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
});

const mapDispatchToProps = (dispatch: Function) => ({
  addMessageRequest: (data: any) => dispatch(addMessage(data)),
  clearMessageRequest: () => dispatch(clearMessageData()),
});

const mapStateToProps = (state: any) => ({
  messages: state?.messages?.messages,
  audioState: state?.app?.audioState,
  videoState: state?.app?.videoState,
});

export default connect(mapStateToProps, mapDispatchToProps)(Meeting);
