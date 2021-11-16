import React, {useEffect, useState} from 'react';
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
} from 'react-native';
import {connect} from 'react-redux';
import {
  // HmsView,
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
} from '@100mslive/react-native-hms';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';

import {ChatWindow, AlertModal, CustomModal, CustomPicker} from '../components';
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
};

type DisplayTrackProps = {
  peer?: Peer;
  videoStyles: Function;
  speakers: Array<string>;
  type: 'local' | 'remote' | 'screen';
  instance: HMSSDK | undefined;
  permissions: HMSPermissions | undefined;
  allAudioMute: boolean;
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
  id: undefined,
  colour: getThemeColour(),
  sink: true,
  type: 'local',
};

type MeetingScreenProp = StackNavigationProp<AppStackParamList, 'Meeting'>;

const DisplayTrack = ({
  peer,
  videoStyles,
  speakers,
  type,
  instance,
  permissions,
  allAudioMute,
}: DisplayTrackProps) => {
  const {name, trackId, colour, id, sink, peerRefrence} = peer!;
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [newRole, setNewRole] = useState(peerRefrence?.role);
  const [force, setForce] = useState(false);
  const [isAudioMute, setIsAudioMute] = useState(true);
  const [isVideoMute, setIsVideoMute] = useState(true);
  let mounted = true;

  const fetchTrackStates = async () => {
    const localIsAudioMute = await peerRefrence?.audioTrack?.isMute();
    const localIsVideoMute = await peerRefrence?.videoTrack?.isMute();
    if (mounted) {
      setIsAudioMute(localIsAudioMute);
      setIsVideoMute(localIsVideoMute);
    }
  };

  useEffect(() => {
    fetchTrackStates();
  }, [peerRefrence, peer?.isAudioMute, peer?.isVideoMute, mounted]);

  useEffect(() => {
    return () => {
      mounted = false;
    };
  }, []);

  const HmsViewComponent = instance?.HmsView;
  const knownRoles = instance?.knownRoles || [];
  const isDegraded = peerRefrence?.videoTrack?.isDegraded || false;
  const speaking = speakers.includes(id!);
  const selectActionTitle = 'Select action';
  const selectActionMessage = '';
  const selectActionButtons: Array<{
    text: string;
    type?: string;
    onPress?: Function;
  }> = [
    {text: 'Cancel', type: 'cancel'},
    {
      text: 'Mute/Unmute video locally',
      onPress: async () => {
        const remotePeer = peerRefrence as HMSRemotePeer;
        const playbackAllowed = await remotePeer
          ?.remoteAudioTrack()
          ?.isPlaybackAllowed();
        remotePeer?.remoteAudioTrack()?.setPlaybackAllowed(!playbackAllowed);
      },
    },
    {
      text: 'Mute/Unmute audio locally',
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
    selectActionButtons.push(
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
    selectActionButtons.push({
      text: 'Remove Participant',
      onPress: () => {
        instance?.removePeer(id!, 'removed from room');
      },
    });
  }
  const roleRequestTitle = 'Select action';
  const roleRequestButtons: [
    {text: string; onPress?: Function},
    {text: string; onPress?: Function}?,
  ] = [
    {text: 'Cancel'},
    {
      text: 'Send',
      onPress: () => {
        instance?.changeRole(peerRefrence!, newRole!, force);
      },
    },
  ];

  if (permissions?.unmute) {
    const unmute = false;
    if (isAudioMute) {
      selectActionButtons.push({
        text: 'Unmute audio',
        onPress: () => {
          instance?.changeTrackState(
            peerRefrence?.audioTrack as HMSTrack,
            unmute,
          );
        },
      });
    }
    if (isVideoMute) {
      selectActionButtons.push({
        text: 'Unmute video',
        onPress: () => {
          instance?.changeTrackState(
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
      selectActionButtons.push({
        text: 'Mute audio',
        onPress: () => {
          instance?.changeTrackState(
            peerRefrence?.audioTrack as HMSTrack,
            mute,
          );
        },
      });
    }
    if (!isVideoMute) {
      selectActionButtons.push({
        text: 'Mute video',
        onPress: () => {
          instance?.changeTrackState(
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

  const mute = type === 'remote' && allAudioMute ? true : isAudioMute;

  const {top, bottom} = useSafeAreaInsets();
  // window height - (header + bottom container + top + bottom + padding) / views in one screen
  const viewHeight =
    type === 'screen'
      ? Dimensions.get('window').height -
        (dimension.viewHeight(50) + dimension.viewHeight(90) + top + bottom + 2)
      : isPortrait()
      ? (Dimensions.get('window').height -
          (dimension.viewHeight(50) +
            dimension.viewHeight(90) +
            top +
            bottom +
            2)) /
        2
      : Dimensions.get('window').height -
        (Platform.OS === 'ios' ? 0 : 25) -
        (dimension.viewHeight(50) +
          dimension.viewHeight(90) +
          top +
          bottom +
          2);

  if (HmsViewComponent) {
    return (
      <View
        key={trackId}
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
          buttons={selectActionButtons}
        />
        <CustomModal
          modalVisible={roleModalVisible}
          setModalVisible={setRoleModalVisible}
          title={roleRequestTitle}
          buttons={roleRequestButtons}>
          <CustomPicker
            data={knownRoles}
            selectedItem={newRole}
            onItemSelected={setNewRole}
          />
        </CustomModal>
        {isVideoMute || isDegraded ? (
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, {backgroundColor: colour}]}>
              <Text style={styles.avatarText}>{getInitials(name!)}</Text>
            </View>
          </View>
        ) : (
          <HmsViewComponent
            sink={sink}
            trackId={trackId!}
            mirror={type === 'local' ? true : false}
            scaleType={HMSVideoViewMode.ASPECT_FILL}
            style={type === 'screen' ? styles.hmsViewScreen : styles.hmsView}
          />
        )}
        {type === 'remote' && selectActionButtons.length > 1 && (
          <TouchableOpacity
            onPress={promptUser}
            style={styles.optionsContainer}>
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
              {name}
            </Text>
          </View>
          <View style={styles.micContainer}>
            <Feather
              name={mute ? 'mic-off' : 'mic'}
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
  } else {
    return null;
  }
};

const Meeting = ({
  messages,
  addMessageRequest,
  clearMessageRequest,
  hmsInstance,
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
  const [newRole, setNewRole] = useState(trackId?.peerRefrence?.role);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [roleChangeModalVisible, setRoleChangeModalVisible] = useState(false);
  const [changeTrackStateModalVisible, setChangeTrackStateModalVisible] =
    useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [localPeerPermissions, setLocalPeerPermissions] =
    useState<HMSPermissions>();

  const roleChangeRequestTitle = roleChangeModalVisible
    ? 'Role Change Request'
    : changeTrackStateModalVisible
    ? 'Change Track State Request'
    : '';
  const roleChangeRequestButtons: [
    {text: string; onPress?: Function},
    {text: string; onPress?: Function},
  ] = roleChangeModalVisible
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
    isPortrait() ? 4 : 2,
  );

  const decodeRemotePeer = (
    peer: HMSRemotePeer,
    type: 'remote' | 'screen',
  ): Peer => {
    return {
      trackId: peer?.videoTrack?.trackId,
      name: peer?.name,
      isAudioMute: true,
      isVideoMute: true,
      id: peer?.peerID,
      colour: getThemeColour(),
      sink: true,
      type,
      peerRefrence: peer,
    };
  };

  const decodeLocalPeer = async (
    peer: HMSLocalPeer,
    type: 'local' | 'screen',
  ): Promise<Peer> => {
    const peerIsAudioMute = await peer?.audioTrack?.isMute();
    const peerIsVideoMute = await peer?.videoTrack?.isMute();
    return {
      trackId: peer?.videoTrack?.trackId,
      name: peer?.name,
      isAudioMute: peerIsAudioMute,
      isVideoMute: peerIsVideoMute,
      id: peer?.peerID,
      colour: getThemeColour(),
      sink: true,
      type,
      peerRefrence: peer,
    };
  };

  const updateVideoIds = async (
    remotePeers: HMSRemotePeer[],
    localPeer?: HMSLocalPeer,
  ) => {
    // get local track Id
    const localTrackId = localPeer?.videoTrack?.trackId;
    if (localTrackId) {
      const localTrackTemp = await decodeLocalPeer(localPeer, 'local');
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

        auxiliaryTracks?.map((track: HMSTrack) => {
          let auxTrackId = track?.trackId;

          if (auxTrackId && track?.type === HMSTrackType.VIDEO) {
            newAuxTracks.push({
              trackId: auxTrackId,
              name: `${remotePeer?.name}'s Screen`,
              isAudioMute: true,
              isVideoMute: false,
              id: `${remotePeer?.peerID}_${auxTrackId}`,
              colour: getThemeColour(),
              sink: true,
              type: 'screen',
            });
          }
        });
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
    localPeer,
    remotePeers,
  }: {
    room?: HMSRoom;
    localPeer: HMSLocalPeer;
    remotePeers: HMSRemotePeer[];
  }) => {
    console.log('data in onJoinListener: ', localPeer, remotePeers);
  };

  const onRoomListener = ({
    // room,
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
    console.log('data in onRoomListener: ', type, localPeer, remotePeers);
  };

  const onPeerListener = ({
    // room,
    type,
    remotePeers,
    localPeer,
  }: {
    room?: HMSRoom;
    type?: HMSPeerUpdate;
    localPeer: HMSLocalPeer;
    remotePeers: HMSRemotePeer[];
  }) => {
    updateVideoIds(remotePeers, localPeer);
    console.log('data in onPeerListener: ', type, localPeer, remotePeers);
  };

  const onTrackListener = ({
    // room,
    type,
    remotePeers,
    localPeer,
  }: {
    room?: HMSRoom;
    type?: HMSTrackUpdate;
    localPeer: HMSLocalPeer;
    remotePeers: HMSRemotePeer[];
  }) => {
    updateVideoIds(remotePeers, localPeer);
    console.log('data in onTrackListener: ', type, localPeer, remotePeers);
  };

  const onMessage = (data: HMSMessage) => {
    addMessageRequest({data, isLocal: false});
    setNotification(true);
    console.log('data in onMessage: ', data);
  };

  const onError = (data: any) => {
    console.log('data in onError: ', data);
  };

  const onSpeaker = (data: HMSSpeakerUpdate) => {
    const peerIds = data?.peers?.map(speaker => speaker?.peer?.peerID);
    setSpeakers(peerIds || []);
    console.log('data in onSpeaker: ', data);
  };

  const reconnecting = (data: any) => {
    console.log(data);
  };

  const reconnected = (data: any) => {
    console.log(data);
  };

  const onRoleChangeRequest = (data: HMSRoleChangeRequest) => {
    console.log(data);
    setRoleChangeModalVisible(true);
    setRoleChangeRequest({
      requestedBy: data?.requestedBy?.name,
      suggestedRole: data?.suggestedRole?.name,
    });
  };

  const onChangeTrackStateRequest = (data: HMSChangeTrackStateRequest) => {
    console.log(data);
    setChangeTrackStateModalVisible(true);
    setRoleChangeRequest({
      requestedBy: data?.requestedBy?.name,
      suggestedRole: data?.trackType,
    });
  };

  const onRemovedFromRoom = (data: any) => {
    console.log(data);
    clearMessageRequest();
    navigate('WelcomeScreen');
  };

  const updateHmsInstance = async (hms: HMSSDK | undefined) => {
    console.log('instance', hms);
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
    const buttons = [
      {
        text: 'Cancel',
        type: 'cancel',
      },
      {
        text: 'Mute video of custom roles',
        onPress: () => {
          setRoleModalVisible(true);
          setAction(1);
        },
      },
      {
        text: 'Unmute video of custom roles',
        onPress: () => {
          setRoleModalVisible(true);
          setAction(2);
        },
      },
      {
        text: 'Mute audio of custom roles',
        onPress: () => {
          setRoleModalVisible(true);
          setAction(3);
        },
      },
      {
        text: 'Unmute audio of custom roles',
        onPress: () => {
          setRoleModalVisible(true);
          setAction(4);
        },
      },
    ];
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
        onPress: () => {
          const source = 'regular';
          switch (action) {
            case 1:
              instance?.changeTrackStateRoles(
                HMSTrackType.VIDEO,
                true,
                source,
                [newRole!],
              );
              break;
            case 2:
              instance?.changeTrackStateRoles(
                HMSTrackType.VIDEO,
                false,
                source,
                [newRole!],
              );
              break;
            case 3:
              instance?.changeTrackStateRoles(
                HMSTrackType.AUDIO,
                true,
                source,
                [newRole!],
              );
              break;
            case 4:
              instance?.changeTrackStateRoles(
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
          instance?.endRoom(false, 'Host ended the room');
          clearMessageRequest();
          navigate('WelcomeScreen');
        },
      });
    }
    return buttons;
  };

  const onViewRef = React.useRef(async ({viewableItems}: any) => {
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
        Promise.all(sinkRemoteTrackIds).then(result => {
          setRemoteTrackIds(result ? result : []);
        });
      }
    }
  });

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
        <CustomPicker
          data={instance?.knownRoles || []}
          selectedItem={newRole}
          onItemSelected={setNewRole}
        />
      </CustomModal>
      <View style={styles.headerContainer}>
        <Text style={styles.headerName}>{trackId?.name}</Text>
        <View style={styles.headerRight}>
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
        <FlatList
          horizontal
          data={pairedPeers}
          initialNumToRender={2}
          maxToRenderPerBatch={3}
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
                        allAudioMute={muteAllAudio}
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
                        allAudioMute={muteAllAudio}
                      />
                    )),
                )}
              </View>
            );
          }}
          numColumns={1}
          onViewableItemsChanged={onViewRef.current}
          keyExtractor={item => item[0]?.trackId!}
        />
      </View>
      <View style={styles.iconContainers}>
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
            instance?.localPeer?.localVideoTrack()?.switchCamera();
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
                instance?.sendBroadcastMessage(value);
              } else if (messageTo?.type === 'group') {
                instance?.sendGroupMessage(value, [messageTo?.obj]);
              } else if (messageTo.type === 'direct') {
                instance?.sendDirectMessage(value, messageTo?.obj?.peerId);
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
  videoIcon: {},
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
  state: state,
});

export default connect(mapStateToProps, mapDispatchToProps)(Meeting);
