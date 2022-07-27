import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity, Text, ScrollView} from 'react-native';
import {useDispatch} from 'react-redux';
import {
  HMSTrack,
  HMSRole,
  HMSSDK,
  HMSTrackType,
  HMSTrackSource,
  HMSRTCStatsReport,
  HMSUpdateListenerActions,
  HMSLocalAudioStats,
  HMSLocalAudioTrack,
  HMSPeer,
  HMSLocalVideoStats,
  HMSLocalVideoTrack,
  HMSRemoteAudioStats,
  HMSRemoteAudioTrack,
  HMSRemoteVideoStats,
  HMSRemoteVideoTrack,
  AudioMixingMode,
} from '@100mslive/react-native-hms';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Slider} from '@miblanchard/react-native-slider';

import {styles} from './styles';
import {
  CustomButton,
  CustomInput,
  Menu,
  MenuItem,
  MenuDivider,
} from '../../components';
import {saveUserData} from '../../redux/actions';
import {parseMetadata, getInitials} from '../../utils/functions';
import {ModalTypes, PeerTrackNode, TrackType} from '../../utils/types';
import {COLORS} from '../../utils/theme';

export const ParticipantsModal = ({
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

export const ChangeRoleModal = ({
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

export const ChangeVolumeModal = ({
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

export const ChangeNameModal = ({
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

export const RtcStatsModal = ({instance}: {instance?: HMSSDK}) => {
  const rtcStatsRef = React.useRef<any>({});
  const [rtcStats, setRtcStats] = useState(Math.random());
  const [statsVisible, setStatsVisible] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<{
    name: string;
    track?: HMSTrack;
  }>({
    name: instance?.localPeer?.name + "'s audio",
    track: instance?.localPeer?.audioTrack,
  });
  const [trackList, setTrackList] = useState<
    {
      name: string;
      track?: HMSTrack;
    }[]
  >();

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);

  const getStatsList = () => {
    const list: {
      name: string;
      track?: HMSTrack;
    }[] = [];
    if (instance?.localPeer?.audioTrack?.trackId) {
      list.push({
        name: instance?.localPeer?.name + "'s audio",
        track: instance?.localPeer?.audioTrack,
      });
    }
    if (instance?.localPeer?.videoTrack?.trackId) {
      list.push({
        name: instance?.localPeer?.name + "'s video",
        track: instance?.localPeer?.videoTrack,
      });
    }
    instance?.remotePeers?.map(remotePeer => {
      if (remotePeer?.audioTrack?.trackId) {
        list.push({
          name: remotePeer?.name + "'s audio",
          track: remotePeer?.audioTrack,
        });
      }
      if (remotePeer?.videoTrack?.trackId) {
        list.push({
          name: remotePeer?.name + "'s video",
          track: remotePeer?.videoTrack,
        });
      }
    });
    setTrackList(list);
  };

  const enableRTCStats = () => {
    instance?.enableRTCStats();
    setStatsVisible(true);
  };

  const disableRTCStats = () => {
    instance?.disableRTCStats();
    setStatsVisible(false);
  };

  const onChangeLocalAudioStats = (data: {
    localAudioStats: HMSLocalAudioStats;
    track: HMSLocalAudioTrack;
    peer: HMSPeer;
  }) => {
    const trackRtcStats = rtcStatsRef?.current;
    trackRtcStats[data.track.trackId] = data.localAudioStats;
    setRtcStats(Math.random());
    rtcStatsRef.current = trackRtcStats;
  };

  const onChangeLocalVideoStats = (data: {
    localVideoStats: HMSLocalVideoStats;
    track: HMSLocalVideoTrack;
    peer: HMSPeer;
  }) => {
    const trackRtcStats = rtcStatsRef?.current;
    trackRtcStats[data.track.trackId] = data.localVideoStats;
    setRtcStats(Math.random());
    rtcStatsRef.current = trackRtcStats;
  };

  const onChangeRtcStats = (data: {rtcStats: HMSRTCStatsReport}) => {
    console.log(data.rtcStats);
  };

  const onChangeRemoteAudioStats = (data: {
    remoteAudioStats: HMSRemoteAudioStats;
    track: HMSRemoteAudioTrack;
    peer: HMSPeer;
  }) => {
    const trackRtcStats = rtcStatsRef?.current;
    trackRtcStats[data.track.trackId] = data.remoteAudioStats;
    setRtcStats(Math.random());
    rtcStatsRef.current = trackRtcStats;
  };

  const onChangeRemoteVideoStats = (data: {
    remoteVideoStats: HMSRemoteVideoStats;
    track: HMSRemoteVideoTrack;
    peer: HMSPeer;
  }) => {
    const trackRtcStats = rtcStatsRef?.current;
    trackRtcStats[data.track.trackId] = data.remoteVideoStats;
    setRtcStats(Math.random());
    rtcStatsRef.current = trackRtcStats;
  };

  useEffect(() => {
    getStatsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance?.remotePeers]);

  useEffect(() => {
    instance?.addEventListener(
      HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS,
      onChangeLocalAudioStats,
    );
    instance?.addEventListener(
      HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS,
      onChangeLocalVideoStats,
    );
    instance?.addEventListener(
      HMSUpdateListenerActions.ON_RTC_STATS,
      onChangeRtcStats,
    );
    instance?.addEventListener(
      HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS,
      onChangeRemoteAudioStats,
    );
    instance?.addEventListener(
      HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS,
      onChangeRemoteVideoStats,
    );
    return () => {
      instance?.removeEventListener(
        HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS,
      );
      instance?.removeEventListener(
        HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS,
      );
      instance?.removeEventListener(HMSUpdateListenerActions.ON_RTC_STATS);
      instance?.removeEventListener(
        HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS,
      );
      instance?.removeEventListener(
        HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS,
      );
      disableRTCStats();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.participantContainer}>
      <View style={styles.participantsHeaderContainer}>
        <Text style={styles.participantsHeading}>Stats for Nerds</Text>
      </View>
      <TouchableOpacity
        onPress={statsVisible ? disableRTCStats : enableRTCStats}
        style={styles.statsModalContainer}>
        <Text style={styles.statsModalText}>Enable Stats for Nerds</Text>
        <View style={styles.statsModalCheckbox}>
          {statsVisible && (
            <Entypo name="check" style={styles.statsModalCheck} size={20} />
          )}
        </View>
      </TouchableOpacity>
      <Menu
        visible={visible}
        anchor={
          <TouchableOpacity style={styles.statsModalMenu} onPress={showMenu}>
            <Text style={styles.participantFilterText} numberOfLines={1}>
              {currentTrack?.name ?? 'Choose'}
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
        {trackList?.map(trackObj => {
          return (
            <MenuItem
              onPress={() => {
                hideMenu();
                setCurrentTrack(trackObj);
              }}
              key={trackObj?.track?.trackId}>
              <View style={styles.participantMenuItem}>
                <Text style={styles.participantMenuItemName}>
                  {trackObj?.name}
                </Text>
              </View>
            </MenuItem>
          );
        })}
      </Menu>
      <ScrollView contentContainerStyle={styles.statsModalCardContainer}>
        {rtcStats &&
          rtcStatsRef?.current &&
          currentTrack?.track?.trackId &&
          rtcStatsRef?.current[currentTrack?.track?.trackId] &&
          Object.keys(rtcStatsRef?.current[currentTrack?.track?.trackId]).map(
            item => {
              const value =
                currentTrack?.track &&
                rtcStatsRef?.current[currentTrack?.track?.trackId][item];
              return (
                <View style={styles.statsModalCard} key={item}>
                  <Text style={styles.statsModalCardHeading}>{item}</Text>
                  <Text style={styles.statsModalCardDescription}>
                    {item === 'resolution'
                      ? 'Height: ' +
                        (value?.height ?? 0) +
                        ' Width: ' +
                        (value?.width ?? 0)
                      : value}
                  </Text>
                </View>
              );
            },
          )}
      </ScrollView>
    </View>
  );
};

export const LeaveRoomModal = ({
  onSuccess,
  cancelModal,
}: {
  onSuccess: Function;
  cancelModal: Function;
}) => {
  const onLeave = () => {
    cancelModal();
    onSuccess();
  };
  return (
    <View style={styles.volumeModalContainer}>
      <View style={styles.participantMenuItem}>
        <Feather
          name="log-out"
          style={styles.participantMenuItemIcon}
          size={24}
        />
        <Text style={styles.roleChangeModalHeading}>Leave Studio</Text>
      </View>
      <View style={styles.roleChangeModalPermissionContainer}>
        <Text style={styles.roleChangeModalDescription}>
          Others will continue after you leave. You can join the studio again.
        </Text>
      </View>
      <View style={styles.roleChangeModalPermissionContainer}>
        <CustomButton
          title="Don’t Leave"
          onPress={cancelModal}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          title="Leave"
          onPress={onLeave}
          viewStyle={[
            styles.roleChangeModalSuccessButton,
            styles.errorContainer,
          ]}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

export const EndRoomModal = ({
  onSuccess,
  cancelModal,
}: {
  onSuccess: Function;
  cancelModal: Function;
}) => {
  const onEnd = () => {
    cancelModal();
    onSuccess();
  };
  return (
    <View style={styles.volumeModalContainer}>
      <View style={styles.participantMenuItem}>
        <Feather
          name="alert-triangle"
          style={[styles.participantMenuItemIcon, styles.error]}
          size={24}
        />
        <Text style={[styles.roleChangeModalHeading, styles.error]}>
          End Session
        </Text>
      </View>
      <View style={styles.roleChangeModalPermissionContainer}>
        <Text style={styles.roleChangeModalDescription}>
          The session will end for everyone and all the activities will stop.
          You can’t undo this action.
        </Text>
      </View>
      <View style={styles.roleChangeModalPermissionContainer}>
        <CustomButton
          title="Don’t End"
          onPress={cancelModal}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          title="End Session"
          onPress={onEnd}
          viewStyle={[
            styles.roleChangeModalSuccessButton,
            styles.errorContainer,
          ]}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

export const ChangeAudioMixingModeModal = ({
  instance,
  newAudioMixingMode,
  setNewAudioMixingMode,
  cancelModal,
}: {
  instance?: HMSSDK;
  newAudioMixingMode: AudioMixingMode;
  setNewAudioMixingMode: React.Dispatch<React.SetStateAction<AudioMixingMode>>;
  cancelModal: Function;
}) => {
  const changeAudioMixingMode = async () => {
    await instance?.setAudioMixingMode(newAudioMixingMode);
    cancelModal();
  };

  return (
    <View style={styles.roleChangeModal}>
      <Text style={styles.roleChangeModalHeading}>
        Change Audio Mixing Mode
      </Text>
      <Text style={styles.roleChangeModalDescription}>
        TALK_ONLY : only data captured by mic will be streamed in the room,
        TALK_AND_MUSIC : data captured by mic as well as playback audio being
        captured from device will be streamed in the room, MUSIC_ONLY : only the
        playback audio being captured from device will be streamed in the room
      </Text>
      {Object.keys(AudioMixingMode).map(audioMixingMode => {
        return (
          <TouchableOpacity
            key={audioMixingMode}
            style={styles.roleChangeModalPermissionContainer}
            onPress={() => {
              setNewAudioMixingMode(audioMixingMode as AudioMixingMode);
            }}>
            <View style={styles.roleChangeModalCheckBox}>
              {newAudioMixingMode === audioMixingMode && (
                <Entypo
                  name="check"
                  style={styles.roleChangeModalCheck}
                  size={10}
                />
              )}
            </View>
            <Text style={styles.roleChangeModalPermission}>
              {audioMixingMode}
            </Text>
          </TouchableOpacity>
        );
      })}
      <View style={styles.roleChangeModalPermissionContainer}>
        <CustomButton
          title="Cancel"
          onPress={cancelModal}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          title="Change"
          onPress={changeAudioMixingMode}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};
