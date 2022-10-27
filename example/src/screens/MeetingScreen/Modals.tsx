import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  TextInput,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
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
  HMSAudioDevice,
  HMSAudioMode,
  HMSAudioMixingMode,
  HMSHLSMeetingURLVariant,
  HMSHLSRecordingConfig,
  HMSHLSConfig,
  HMSRTMPConfig,
  HMSLocalPeer,
  HMSRemotePeer,
} from '@100mslive/react-native-hms';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Slider} from '@miblanchard/react-native-slider';
import moment from 'moment';

import {styles} from './styles';
import {
  CustomButton,
  CustomInput,
  Menu,
  MenuItem,
  MenuDivider,
  CustomPicker,
} from '../../components';
import {saveUserData} from '../../redux/actions';
import {parseMetadata, getInitials} from '../../utils/functions';
import {
  LayoutParams,
  ModalTypes,
  PeerTrackNode,
  SortingType,
} from '../../utils/types';
import {COLORS} from '../../utils/theme';
import type {RootState} from '../../redux';

export const ParticipantsModal = ({
  instance,
  localPeer,
  peerTrackNodes,
  changeName,
  changeRole,
  setVolume,
}: {
  instance?: HMSSDK;
  localPeer?: HMSLocalPeer;
  peerTrackNodes?: PeerTrackNode[];
  changeName: (peer: HMSPeer) => void;
  changeRole: (peer: HMSPeer) => void;
  setVolume: (peer: HMSPeer) => void;
}) => {
  // useEffect hook
  const [participantsSearchInput, setParticipantsSearchInput] = useState('');
  const [visible, setVisible] = useState<number>(-1);
  const [peerCount, setPeerCount] = useState<number>(0);
  const [filteredPeerTrackNodes, setFilteredPeerTrackNodes] =
    useState<PeerTrackNode[]>();
  const [filter, setFilter] = useState('everyone');
  // constants
  const peerTrackNodePermissions = localPeer?.role?.permissions;

  // functions
  const hideMenu = () => setVisible(-1);
  const showMenu = (index: number) => setVisible(index);
  const onChangeNamePress = (peer: HMSPeer) => {
    hideMenu();
    setTimeout(() => {
      changeName(peer);
    }, 500);
  };
  const onChangeRolePress = (peer: HMSPeer) => {
    hideMenu();
    setTimeout(() => {
      changeRole(peer);
    }, 500);
  };
  const onSetVolumePress = (peer: HMSPeer) => {
    hideMenu();
    setTimeout(() => {
      setVolume(peer);
    }, 500);
  };
  // const toggleLocalAudioMute = async () => {
  //   hideMenu();
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
  // const toggleLocalVideoMute = async () => {
  //   hideMenu();
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
  const removePeer = (peer: HMSPeer) => {
    hideMenu();
    instance
      ?.removePeer(peer, 'removed from room')
      .then(d => console.log('Remove Peer Success: ', d))
      .catch(e => console.log('Remove Peer Error: ', e));
  };
  const toggleAudio = (peer: HMSPeer) => {
    hideMenu();
    instance
      ?.changeTrackState(
        peer?.audioTrack as HMSTrack,
        !peer?.audioTrack?.isMute(),
      )
      .then(d => console.log('Remove Peer Success: ', d))
      .catch(e => console.log('Remove Peer Error: ', e));
  };
  const toggleVideo = (peer: HMSPeer) => {
    hideMenu();
    instance
      ?.changeTrackState(
        peer?.videoTrack as HMSTrack,
        !peer?.videoTrack?.isMute(),
      )
      .then(d => console.log('Remove Peer Success: ', d))
      .catch(e => console.log('Remove Peer Error: ', e));
  };

  useEffect(() => {
    const newFilteredPeerTrackNodes = peerTrackNodes?.filter(peerTrackNode => {
      if (
        peerTrackNode?.track?.source !== undefined &&
        peerTrackNode?.track?.source !== HMSTrackSource.REGULAR
      ) {
        return false;
      }
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
          const parsedMetaData = parseMetadata(peerTrackNode.peer?.metadata);
          return parsedMetaData.isHandRaised === true;
        },
      );
      setFilteredPeerTrackNodes(updatedPeerTrackNodes);
    } else {
      const updatedPeerTrackNodes = newFilteredPeerTrackNodes?.filter(
        peerTrackNode => {
          return peerTrackNode.peer?.role?.name === filter;
        },
      );
      setFilteredPeerTrackNodes(updatedPeerTrackNodes);
    }
  }, [participantsSearchInput, filter, peerTrackNodes]);

  useEffect(() => {
    let newPeerCount = 0;
    peerTrackNodes?.map(peerTrackNode => {
      if (peerTrackNode.id.includes(HMSTrackSource.REGULAR)) {
        newPeerCount++;
      }
    });
    setPeerCount(newPeerCount);
  }, [peerTrackNodes]);

  return (
    <View style={styles.participantContainer}>
      <View style={styles.participantsHeaderContainer}>
        <Text style={styles.participantsHeading}>Participants</Text>
        <ParticipantFilter filter={filter} setFilter={setFilter} />
        <View style={styles.peerCountContainer}>
          <Text style={styles.peerCount}>{peerCount}</Text>
        </View>
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
                {peerTrackNode.peer?.isLocal === false &&
                  peerTrackNodePermissions?.removeOthers && (
                    <MenuItem onPress={() => removePeer(peerTrackNode.peer)}>
                      <View style={styles.participantMenuItem}>
                        <MaterialCommunityIcons
                          name="account-remove-outline"
                          style={[styles.participantMenuItemIcon, styles.error]}
                          size={24}
                        />
                        <Text
                          style={[
                            styles.participantMenuItemName,
                            styles.error,
                          ]}>
                          Remove Peer
                        </Text>
                      </View>
                    </MenuItem>
                  )}
                {peerTrackNode.peer.isLocal && (
                  <MenuItem
                    onPress={() => onChangeNamePress(peerTrackNode.peer)}>
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
                  <MenuItem
                    onPress={() => onChangeRolePress(peerTrackNode.peer)}>
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
                  peerTrackNode.peer.role?.publishSettings?.allowed?.includes(
                    'audio',
                  ) && (
                    <MenuItem onPress={() => toggleAudio(peerTrackNode.peer)}>
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
                  peerTrackNode.peer.role?.publishSettings?.allowed?.includes(
                    'video',
                  ) && (
                    <MenuItem onPress={() => toggleVideo(peerTrackNode.peer)}>
                      <View style={styles.participantMenuItem}>
                        <Feather
                          name={
                            peerTrackNode.track?.isMute() === false
                              ? 'video'
                              : 'video-off'
                          }
                          style={styles.participantMenuItemIcon}
                          size={24}
                        />
                        <Text style={styles.participantMenuItemName}>
                          {peerTrackNode.track?.isMute() === false
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
                  <MenuItem
                    onPress={() => onSetVolumePress(peerTrackNode.peer)}>
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
              </Menu>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const ParticipantFilter = ({
  filter,
  setFilter,
}: {
  filter?: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const {roles} = useSelector((state: RootState) => state.user);

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
      {roles?.map(knownRole => {
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
  peer,
  cancelModal,
}: {
  instance?: HMSSDK;
  peer?: HMSPeer;
  cancelModal: Function;
}) => {
  const {roles} = useSelector((state: RootState) => state.user);

  const [newRole, setNewRole] = useState<HMSRole>(peer?.role!);
  const [request, setRequest] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);
  const changeRole = async () => {
    await instance?.changeRole(peer!, newRole, !request);
    cancelModal();
  };

  return (
    <View style={styles.roleChangeModal}>
      <Text style={styles.roleChangeModalHeading}>Change Role</Text>
      <Text style={styles.roleChangeModalDescription}>
        Change the role of '{peer?.name}' to
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
        {roles?.map(knownRole => {
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
      {!peer?.isLocal && (
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
  peer,
  cancelModal,
}: {
  instance?: HMSSDK;
  peer?: HMSPeer;
  cancelModal: Function;
}) => {
  const [volume, setVolume] = useState<number>(0);

  const changeVolume = () => {
    instance?.setVolume(peer?.audioTrack as HMSTrack, volume);
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
  peer,
  cancelModal,
}: {
  instance?: HMSSDK;
  peer?: HMSPeer;
  cancelModal: Function;
}) => {
  const dispatch = useDispatch();

  const [name, setName] = useState<string>(peer?.name!);

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

export const RtcStatsModal = ({
  instance,
  localPeer,
}: {
  instance?: HMSSDK;
  localPeer?: HMSLocalPeer;
}) => {
  const rtcStatsRef = React.useRef<any>({});
  const [rtcStats, setRtcStats] = useState(Math.random());
  const [statsVisible, setStatsVisible] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [remotePeers, setRemotePeers] = useState<HMSRemotePeer[]>();
  const [currentTrack, setCurrentTrack] = useState<{
    name: string;
    track?: HMSTrack;
  }>({
    name: localPeer?.name + "'s audio",
    track: localPeer?.audioTrack,
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
    if (localPeer?.audioTrack?.trackId) {
      list.push({
        name: localPeer?.name + "'s audio",
        track: localPeer?.audioTrack,
      });
    }
    if (localPeer?.videoTrack?.trackId) {
      list.push({
        name: localPeer?.name + "'s video",
        track: localPeer?.videoTrack,
      });
    }
    remotePeers?.map(remotePeer => {
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

  const updateRemotePeers = async () => {
    setRemotePeers(await instance?.getRemotePeers());
  };

  useEffect(() => {
    getStatsList();
    updateRemotePeers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remotePeers]);

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

export const ChangeAudioOutputModal = ({
  instance,
  cancelModal,
}: {
  instance?: HMSSDK;
  cancelModal: Function;
}) => {
  const [currentOutputDevice, setCurrentOutputDevice] =
    useState<HMSAudioDevice>(HMSAudioDevice.SPEAKER_PHONE);
  const [audioOutputDevicesList, setAudioOutputDevicesList] = useState<
    HMSAudioDevice[]
  >([]);

  const switchAudioOutput = () => {
    instance?.switchAudioOutput(currentOutputDevice);
    cancelModal();
  };

  useEffect(() => {
    const getList = async () => {
      setAudioOutputDevicesList(await instance?.getAudioDevicesList());
      setCurrentOutputDevice(await instance?.getAudioOutputRouteType());
    };
    getList();
  }, [instance]);

  return (
    <View style={styles.roleChangeModal}>
      <Text style={styles.roleChangeModalHeading}>Switch Audio Output</Text>
      {audioOutputDevicesList.map(device => {
        return (
          <TouchableOpacity
            key={device}
            style={styles.roleChangeModalPermissionContainer}
            onPress={() => {
              setCurrentOutputDevice(device);
            }}>
            <View style={styles.roleChangeModalCheckBox}>
              {currentOutputDevice === device && (
                <Entypo
                  name="check"
                  style={styles.roleChangeModalCheck}
                  size={10}
                />
              )}
            </View>
            <Text style={styles.roleChangeModalPermission}>{device}</Text>
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
          onPress={switchAudioOutput}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

export const ChangeAudioModeModal = ({
  instance,
  cancelModal,
  audioMode,
  setAudioMode,
}: {
  instance?: HMSSDK;
  audioMode: HMSAudioMode;
  setAudioMode: React.Dispatch<React.SetStateAction<HMSAudioMode>>;
  cancelModal: Function;
}) => {
  const [currentAudioMode, setCurrentAudioMode] =
    useState<HMSAudioMode>(audioMode);

  const AudioModeList = [
    'MODE_NORMAL',
    'MODE_RINGTONE',
    'MODE_IN_CALL',
    'MODE_IN_COMMUNICATION',
    'MODE_CALL_SCREENING',
  ];

  const switchAudioMode = () => {
    instance?.setAudioMode(currentAudioMode);
    setAudioMode(currentAudioMode);
    cancelModal();
  };

  return (
    <View style={styles.roleChangeModal}>
      <Text style={styles.roleChangeModalHeading}>Switch Audio Output</Text>
      {AudioModeList.map(mode => {
        return (
          <TouchableOpacity
            key={mode}
            style={styles.roleChangeModalPermissionContainer}
            onPress={() => {
              setCurrentAudioMode(AudioModeList.indexOf(mode));
            }}>
            <View style={styles.roleChangeModalCheckBox}>
              {currentAudioMode === AudioModeList.indexOf(mode) && (
                <Entypo
                  name="check"
                  style={styles.roleChangeModalCheck}
                  size={10}
                />
              )}
            </View>
            <Text style={styles.roleChangeModalPermission}>{mode}</Text>
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
          onPress={switchAudioMode}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

export const ChangeAudioMixingModeModal = ({
  instance,
  newAudioMixingMode,
  cancelModal,
  setNewAudioMixingMode,
}: {
  instance?: HMSSDK;
  newAudioMixingMode: HMSAudioMixingMode;
  cancelModal: Function;
  setNewAudioMixingMode: React.Dispatch<
    React.SetStateAction<HMSAudioMixingMode>
  >;
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
      {Object.keys(HMSAudioMixingMode).map(audioMixingMode => {
        return (
          <TouchableOpacity
            key={audioMixingMode}
            style={styles.roleChangeModalPermissionContainer}
            onPress={() => {
              setNewAudioMixingMode(audioMixingMode as HMSAudioMixingMode);
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

export const ChangeSortingModal = ({
  data,
  selectedItem,
  onItemSelected,
  cancelModal,
}: {
  data: SortingType[];
  selectedItem: SortingType | undefined;
  onItemSelected: React.Dispatch<React.SetStateAction<SortingType | undefined>>;
  cancelModal: Function;
}) => {
  const [sortingType, setSortingType] = useState<SortingType>(
    selectedItem || SortingType.DEFAULT,
  );

  const changeSorting = () => {
    onItemSelected(sortingType);
    cancelModal();
  };

  return (
    <View style={styles.roleChangeModal}>
      <Text style={styles.roleChangeModalHeading}>Sorting Style</Text>
      <CustomPicker
        data={data}
        selectedItem={sortingType}
        onItemSelected={setSortingType}
        viewStyle={styles.picker}
      />
      <View style={styles.sortingButtonContainer}>
        <CustomButton
          title="Cancel"
          onPress={cancelModal}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          title="Change"
          onPress={changeSorting}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

export const ChangeLayoutModal = ({
  data,
  selectedItem,
  onItemSelected,
  cancelModal,
}: {
  data: LayoutParams[];
  selectedItem: LayoutParams;
  onItemSelected: React.Dispatch<React.SetStateAction<LayoutParams>>;
  cancelModal: Function;
}) => {
  const [layout, setLayout] = useState<LayoutParams>(selectedItem);

  const changeLayout = () => {
    onItemSelected(layout);
    cancelModal();
  };

  return (
    <View style={styles.roleChangeModal}>
      <Text style={styles.roleChangeModalHeading}>Layout Style</Text>
      <CustomPicker
        data={data}
        selectedItem={layout}
        onItemSelected={setLayout}
        viewStyle={styles.picker}
      />
      <View style={styles.sortingButtonContainer}>
        <CustomButton
          title="Cancel"
          onPress={cancelModal}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          title="Change"
          onPress={changeLayout}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

export const ChangeTrackStateForRoleModal = ({
  instance,
  localPeer,
  cancelModal,
}: {
  instance?: HMSSDK;
  localPeer?: HMSLocalPeer;
  cancelModal: Function;
}) => {
  const {roles} = useSelector((state: RootState) => state.user);

  const [role, setRole] = useState<HMSRole>(localPeer?.role!);
  const [visible, setVisible] = useState<boolean>(false);
  const [trackType, setTrackType] = useState<HMSTrackType>(HMSTrackType.VIDEO);
  const [trackState, setTrackState] = useState<boolean>(false);

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);
  const changeTrackState = async () => {
    const source = HMSTrackSource.REGULAR;
    await instance
      ?.changeTrackStateForRoles(trackState, trackType, source, [role])
      .then(d => console.log('Change Track State For Role Success: ', d))
      .catch(e => console.log('Change Track State For Role Error: ', e));
    cancelModal();
  };

  return (
    <View style={styles.roleChangeModal}>
      <Text style={styles.roleChangeModalHeading}>
        Change Track State For Role
      </Text>
      <Menu
        visible={visible}
        anchor={
          <TouchableOpacity
            style={styles.participantChangeRoleContainer}
            onPress={showMenu}>
            <Text style={styles.participantFilterText} numberOfLines={1}>
              {role?.name}
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
        {roles?.map(knownRole => {
          return (
            <MenuItem
              onPress={() => {
                hideMenu();
                setRole(knownRole);
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
      <View style={styles.roleChangeModalPermissionContainer}>
        <Text style={styles.changeTrackStateRoleOptionHeading}>
          {'Track State: '}
        </Text>
        {localPeer?.role?.permissions?.mute && (
          <TouchableOpacity
            style={styles.changeTrackStateRoleOption}
            onPress={() => setTrackState(true)}>
            <View style={styles.roleChangeModalCheckBox}>
              {trackState && (
                <Entypo
                  name="check"
                  style={styles.roleChangeModalCheck}
                  size={10}
                />
              )}
            </View>
            <Text style={styles.roleChangeModalPermission}>MUTE</Text>
          </TouchableOpacity>
        )}
        {localPeer?.role?.permissions?.unmute && (
          <TouchableOpacity
            style={styles.changeTrackStateRoleOption}
            onPress={() => setTrackState(false)}>
            <View style={styles.roleChangeModalCheckBox}>
              {!trackState && (
                <Entypo
                  name="check"
                  style={styles.roleChangeModalCheck}
                  size={10}
                />
              )}
            </View>
            <Text style={styles.roleChangeModalPermission}>UNMUTE</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.roleChangeModalPermissionContainer}>
        <Text style={styles.changeTrackStateRoleOptionHeading}>
          {'Track Type: '}
        </Text>
        <TouchableOpacity
          style={styles.changeTrackStateRoleOption}
          onPress={() => setTrackType(HMSTrackType.AUDIO)}>
          <View style={styles.roleChangeModalCheckBox}>
            {trackType === HMSTrackType.AUDIO && (
              <Entypo
                name="check"
                style={styles.roleChangeModalCheck}
                size={10}
              />
            )}
          </View>
          <Text style={styles.roleChangeModalPermission}>
            {HMSTrackType.AUDIO}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.changeTrackStateRoleOption}
          onPress={() => setTrackType(HMSTrackType.VIDEO)}>
          <View style={styles.roleChangeModalCheckBox}>
            {trackType === HMSTrackType.VIDEO && (
              <Entypo
                name="check"
                style={styles.roleChangeModalCheck}
                size={10}
              />
            )}
          </View>
          <Text style={styles.roleChangeModalPermission}>
            {HMSTrackType.VIDEO}
          </Text>
        </TouchableOpacity>
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
          onPress={changeTrackState}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

export const ChangeTrackStateModal = ({
  localPeer,
  roleChangeRequest,
  cancelModal,
}: {
  localPeer?: HMSLocalPeer;
  roleChangeRequest: {
    requestedBy?: string;
    suggestedRole?: string;
  };
  cancelModal: Function;
}) => {
  const changeLayout = () => {
    if (roleChangeRequest?.suggestedRole?.toLocaleLowerCase() === 'video') {
      localPeer?.localVideoTrack()?.setMute(false);
    } else {
      localPeer?.localAudioTrack()?.setMute(false);
    }
    cancelModal();
  };

  return (
    <View style={styles.roleChangeModal}>
      <Text style={styles.roleChangeModalHeading}>
        Change Track State Request
      </Text>
      <Text style={styles.roleChangeText}>
        {`${roleChangeRequest?.requestedBy?.toLocaleUpperCase()} requested to unmute your regular ${roleChangeRequest?.suggestedRole?.toLocaleUpperCase()}`}
      </Text>
      <View style={styles.sortingButtonContainer}>
        <CustomButton
          title="Reject"
          onPress={cancelModal}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          title="Accept"
          onPress={changeLayout}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

export const HlsStreamingModal = ({
  instance,
  roomID,
  cancelModal,
  setHlsStreaming,
}: {
  instance?: HMSSDK;
  roomID: string;
  cancelModal: Function;
  setHlsStreaming: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}) => {
  const [hlsStreamingDetails, setHLSStreamingDetails] =
    useState<HMSHLSMeetingURLVariant>({
      meetingUrl: roomID ? roomID + '?skip_preview=true' : '',
      metadata: '',
    });
  const [startHlsRetry, setStartHlsRetry] = useState(true);
  const [hlsRecordingDetails, setHLSRecordingDetails] =
    useState<HMSHLSRecordingConfig>({
      singleFilePerLayer: false,
      videoOnDemand: false,
    });

  const changeLayout = () => {
    instance
      ?.startHLSStreaming()
      .then(d => {
        setHlsStreaming(true);
        console.log('Start HLS Streaming Success: ', d);
      })
      .catch(err => {
        if (startHlsRetry) {
          setStartHlsRetry(false);
          const hmsHLSConfig = new HMSHLSConfig({
            hlsRecordingConfig: hlsRecordingDetails,
            meetingURLVariants: [hlsStreamingDetails],
          });
          instance
            ?.startHLSStreaming(hmsHLSConfig)
            .then(d => {
              setHlsStreaming(true);
              console.log('Start HLS Streaming Success: ', d);
            })
            .catch(e => console.log('Start HLS Streaming Error: ', e));
        } else {
          console.log('Start HLS Streaming Error: ', err);
        }
      });
    cancelModal();
  };

  return (
    <View style={styles.roleChangeModal}>
      <Text style={styles.roleChangeModalHeading}>HLS Streaming Details</Text>
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
        style={styles.checkboxButtonContainer}
        onPress={() => {
          setHLSRecordingDetails({
            ...hlsRecordingDetails,
            singleFilePerLayer: !hlsRecordingDetails.singleFilePerLayer,
          });
        }}>
        <View style={styles.roleChangeModalCheckBox}>
          {hlsRecordingDetails.singleFilePerLayer && (
            <Entypo
              name="check"
              style={styles.roleChangeModalCheck}
              size={10}
            />
          )}
        </View>
        <Text style={styles.roleChangeModalPermission}>SingleFilePerLayer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.checkboxButtonContainer}
        onPress={() => {
          setHLSRecordingDetails({
            ...hlsRecordingDetails,
            videoOnDemand: !hlsRecordingDetails.videoOnDemand,
          });
        }}>
        <View style={styles.roleChangeModalCheckBox}>
          {hlsRecordingDetails.videoOnDemand && (
            <Entypo
              name="check"
              style={styles.roleChangeModalCheck}
              size={10}
            />
          )}
        </View>
        <Text style={styles.roleChangeModalPermission}>VideoOnDemand</Text>
      </TouchableOpacity>
      <View style={styles.roleChangeModalPermissionContainer}>
        <CustomButton
          title="Cancel"
          onPress={cancelModal}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          title="Start"
          onPress={changeLayout}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

export const RecordingModal = ({
  instance,
  roomID,
  recordingModal,
  setModalVisible,
  setRtmpAndRecording,
}: {
  instance?: HMSSDK;
  roomID: string;
  recordingModal: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<ModalTypes>>;
  setRtmpAndRecording: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >;
}) => {
  const [resolutionDetails, setResolutionDetails] = useState<boolean>(false);
  const [recordingDetails, setRecordingDetails] = useState<HMSRTMPConfig>({
    record: false,
    meetingURL: roomID ? roomID + '?token=beam_recording' : '',
  });

  const changeLayout = () => {
    instance
      ?.startRTMPOrRecording(recordingDetails)
      .then(d => {
        setRtmpAndRecording(true);
        console.log('Start RTMP Or Recording Success: ', d);
      })
      .catch(e => console.log('Start RTMP Or Recording Error: ', e));
    setModalVisible(ModalTypes.DEFAULT);
  };

  return recordingModal ? (
    <View style={styles.roleChangeModal}>
      <Text style={styles.roleChangeModalHeading}>Recording Details</Text>
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
        style={styles.checkboxButtonContainer}
        onPress={() => {
          setRecordingDetails({
            ...recordingDetails,
            record: !recordingDetails.record,
          });
        }}>
        <View style={styles.roleChangeModalCheckBox}>
          {recordingDetails.record && (
            <Entypo
              name="check"
              style={styles.roleChangeModalCheck}
              size={10}
            />
          )}
        </View>
        <Text style={styles.roleChangeModalPermission}>Record</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.checkboxButtonContainer}
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
        }}>
        <View style={styles.roleChangeModalCheckBox}>
          {resolutionDetails && (
            <Entypo
              name="check"
              style={styles.roleChangeModalCheck}
              size={10}
            />
          )}
        </View>
        <Text style={styles.roleChangeModalPermission}>Resolution</Text>
      </TouchableOpacity>
      <View style={styles.roleChangeModalPermissionContainer}>
        <CustomButton
          title="Cancel"
          onPress={() => setModalVisible(ModalTypes.DEFAULT)}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          title="Start"
          onPress={changeLayout}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  ) : (
    <View style={styles.roleChangeModal}>
      <Text style={styles.roleChangeModalHeading}>Resolution Details</Text>
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
      <View style={styles.sortingButtonContainer}>
        <CustomButton
          title="Back"
          onPress={() => setModalVisible(ModalTypes.RECORDING)}
          viewStyle={styles.backButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

export const ChangeRoleAccepteModal = ({
  instance,
  roleChangeRequest,
  cancelModal,
}: {
  instance?: HMSSDK;
  roleChangeRequest: {
    requestedBy?: string;
    suggestedRole?: string;
  };
  cancelModal: Function;
}) => {
  const changeLayout = () => {
    instance?.acceptRoleChange();
    cancelModal();
  };

  return (
    <View style={styles.roleChangeModal}>
      <Text style={styles.roleChangeModalHeading}>Role Change Details</Text>
      <Text style={styles.roleChangeText}>
        {`Role change requested by ${roleChangeRequest?.requestedBy?.toLocaleUpperCase()}. Changing role to ${roleChangeRequest?.suggestedRole?.toLocaleUpperCase()}`}
      </Text>
      <View style={styles.sortingButtonContainer}>
        <CustomButton
          title="Reject"
          onPress={cancelModal}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          title="Accept"
          onPress={changeLayout}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

export const EndHlsModal = ({
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
          End live stream for all?
        </Text>
      </View>
      <View style={styles.roleChangeModalPermissionContainer}>
        <Text style={styles.roleChangeModalDescription}>
          Your stream will end and everone will go offline immediately in this
          room. You can’t undo this action.
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
          title="End Stream"
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

export const RealTime = ({startedAt}: {startedAt?: Date}) => {
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);

  useEffect(() => {
    const time2 = moment(startedAt, 'hh:mm:ss');
    const time1 = moment(new Date(), 'hh:mm:ss');
    const subtract = time1.subtract({
      hours: time2.hours(),
      minutes: time2.minutes(),
      seconds: time2.seconds(),
    });
    setHour(subtract.hours());
    setMinute(subtract.minutes());
    setSecond(subtract.seconds());
  }, [startedAt]);

  useEffect(() => {
    const updatePostInfo = setInterval(() => {
      setSecond(sec => sec + 1);
    }, 1000);

    return () => {
      clearInterval(updatePostInfo);
    };
  }, []);

  useEffect(() => {
    if (second === 60) {
      setSecond(0);
      setMinute(min => min + 1);
    }
  }, [second]);

  useEffect(() => {
    if (minute === 60) {
      setMinute(0);
      setHour(hr => hr + 1);
    }
  }, [minute]);

  return (
    <View style={styles.liveTextContainer}>
      {hour > 0 && (
        <Text style={styles.liveTimeText}>
          {hour < 10 ? '0' + hour : hour}:
        </Text>
      )}
      <Text style={styles.liveTimeText}>
        {minute < 10 ? '0' + minute : minute}:
      </Text>
      <Text style={styles.liveTimeText}>
        {second < 10 ? '0' + second : second}
      </Text>
    </View>
  );
};

export const AudioShareSetVolumeModal = ({
  success,
  cancel,
}: {
  success: Function;
  cancel: Function;
}) => {
  const [volume, setVolume] = useState<number>(0);

  const changeVolume = () => {
    success(volume);
    cancel();
  };

  return (
    <View style={styles.volumeModalContainer}>
      <Text style={styles.roleChangeModalHeading}>Set Volume</Text>
      <View style={styles.volumeModalSlider}>
        <Text style={styles.roleChangeModalDescription}>Volume: {volume}</Text>
        <Slider
          value={volume}
          maximumValue={1}
          minimumValue={0}
          step={0.1}
          onValueChange={(value: any) => setVolume(value[0])}
        />
      </View>
      <View style={styles.roleChangeModalPermissionContainer}>
        <CustomButton
          title="Cancel"
          onPress={cancel}
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
