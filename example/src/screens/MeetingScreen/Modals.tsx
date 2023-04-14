import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  Platform,
  InteractionManager,
} from 'react-native';
import Toast from 'react-native-simple-toast';
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
import RNFetchBlob from 'rn-fetch-blob';

import {styles} from './styles';
import {
  CustomButton,
  CustomInput,
  Menu,
  MenuItem,
  MenuDivider,
  CustomPicker,
} from '../../components';
import {changeShowStats, saveUserData} from '../../redux/actions';
import {
  parseMetadata,
  getInitials,
  requestExternalStoragePermission,
  getTime,
} from '../../utils/functions';
import {LayoutParams, ModalTypes, SortingType} from '../../utils/types';
import {COLORS} from '../../utils/theme';
import type {RootState} from '../../redux';
import {SwitchRow} from '../../components/SwitchRow';

export const ParticipantsModal = ({
  instance,
  localPeer,
  changeName,
  changeRole,
  setVolume,
}: {
  instance?: HMSSDK;
  localPeer?: HMSLocalPeer;
  changeName: (peer: HMSPeer) => void;
  changeRole: (peer: HMSPeer) => void;
  setVolume: (peer: HMSPeer) => void;
}) => {
  // useState hook
  const [hmsPeers, setHmsPeers] = useState<(HMSLocalPeer | HMSRemotePeer)[]>([
    localPeer!,
  ]);
  const [participantsSearchInput, setParticipantsSearchInput] = useState('');
  const [visible, setVisible] = useState<number>(-1);
  const [filteredPeerTrackNodes, setFilteredPeerTrackNodes] =
    useState<(HMSLocalPeer | HMSRemotePeer)[]>();
  const [filter, setFilter] = useState('everyone');
  // constants
  const localPeerPermissions = localPeer?.role?.permissions;

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
    if (peer?.audioTrack) {
      instance
        ?.changeTrackState(peer?.audioTrack, !peer?.audioTrack?.isMute())
        .then(d => console.log('Remove Peer Success: ', d))
        .catch(e => console.log('Remove Peer Error: ', e));
    }
  };
  const toggleVideo = (peer: HMSPeer) => {
    hideMenu();
    if (peer?.videoTrack) {
      instance
        ?.changeTrackState(peer?.videoTrack, !peer?.videoTrack?.isMute())
        .then(d => console.log('Remove Peer Success: ', d))
        .catch(e => console.log('Remove Peer Error: ', e));
    }
  };

  useMemo(() => {
    const newFilteredPeerTrackNodes = hmsPeers?.filter(peer => {
      if (
        participantsSearchInput.length < 1 ||
        peer.name.includes(participantsSearchInput) ||
        peer.role?.name?.includes(participantsSearchInput)
      ) {
        return true;
      }
      return false;
    });
    if (filter === 'everyone') {
      setFilteredPeerTrackNodes(newFilteredPeerTrackNodes);
    } else if (filter === 'raised hand') {
      const updatedPeerTrackNodes = newFilteredPeerTrackNodes?.filter(peer => {
        const parsedMetaData = parseMetadata(peer?.metadata);
        return parsedMetaData.isHandRaised === true;
      });
      setFilteredPeerTrackNodes(updatedPeerTrackNodes);
    } else {
      const updatedPeerTrackNodes = newFilteredPeerTrackNodes?.filter(peer => {
        return peer?.role?.name === filter;
      });
      setFilteredPeerTrackNodes(updatedPeerTrackNodes);
    }
  }, [participantsSearchInput, filter, hmsPeers]);

  useEffect(() => {
    instance?.getRemotePeers().then(peers => {
      if (localPeer) {
        InteractionManager.runAfterInteractions(() => {
          setHmsPeers([
            localPeer,
            ...peers.map(peer => {
              // Extracting name and role out of peer object,
              // so that we still have these value even after peer leaves the meeting
              const partialCachedPeer: any = {name: peer.name, role: peer.role};
              Object.setPrototypeOf(partialCachedPeer, peer);
              return partialCachedPeer;
            }),
          ]);
        });
      }
    });
  }, [instance, localPeer]);

  return (
    <View style={styles.participantContainer}>
      <View style={styles.participantsHeaderContainer}>
        <Text style={styles.participantsHeading}>Participants</Text>
        <ParticipantFilter filter={filter} setFilter={setFilter} />
        <View style={styles.peerCountContainer}>
          <Text style={styles.peerCount}>{hmsPeers.length}</Text>
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
      <FlatList
        data={filteredPeerTrackNodes}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        keyboardShouldPersistTaps="always"
        windowSize={11}
        renderItem={({item, index}) => {
          const peer = item;
          return (
            <View style={styles.participantItem} key={peer.peerID}>
              <View style={styles.participantAvatar}>
                <Text style={styles.participantAvatarText}>
                  {getInitials(peer.name)}
                </Text>
              </View>
              <View style={styles.participantDescription}>
                <Text style={styles.participantName} numberOfLines={1}>
                  {peer.name}
                  {peer.isLocal && ' (You)'}
                </Text>
                <Text style={styles.participantRole} numberOfLines={1}>
                  {peer.role?.name}
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
                style={styles.participantsMenuContainer}
              >
                {peer.isLocal === false &&
                  localPeerPermissions?.removeOthers && (
                    <MenuItem onPress={() => removePeer(peer)}>
                      <View style={styles.participantMenuItem}>
                        <MaterialCommunityIcons
                          name="account-remove-outline"
                          style={[styles.participantMenuItemIcon, styles.error]}
                          size={24}
                        />
                        <Text
                          style={[styles.participantMenuItemName, styles.error]}
                        >
                          Remove Peer
                        </Text>
                      </View>
                    </MenuItem>
                  )}
                {peer.isLocal && (
                  <MenuItem onPress={() => onChangeNamePress(peer)}>
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
                {localPeerPermissions?.changeRole && (
                  <MenuItem onPress={() => onChangeRolePress(peer)}>
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
                {peer.isLocal === false &&
                  peer.role?.publishSettings?.allowed?.includes('audio') && (
                    <MenuItem onPress={() => toggleAudio(peer)}>
                      <View style={styles.participantMenuItem}>
                        <Feather
                          name={
                            peer.audioTrack?.isMute() === false
                              ? 'mic'
                              : 'mic-off'
                          }
                          style={styles.participantMenuItemIcon}
                          size={24}
                        />
                        <Text style={styles.participantMenuItemName}>
                          {peer.audioTrack?.isMute() === false
                            ? 'Mute audio'
                            : 'Unmute audio'}
                        </Text>
                      </View>
                    </MenuItem>
                  )}
                {peer.isLocal === false &&
                  peer.role?.publishSettings?.allowed?.includes('video') && (
                    <MenuItem onPress={() => toggleVideo(peer)}>
                      <View style={styles.participantMenuItem}>
                        <Feather
                          name={
                            peer.videoTrack?.isMute() === false
                              ? 'video'
                              : 'video-off'
                          }
                          style={styles.participantMenuItemIcon}
                          size={24}
                        />
                        <Text style={styles.participantMenuItemName}>
                          {peer.videoTrack?.isMute() === false
                            ? 'Mute video'
                            : 'Unmute video'}
                        </Text>
                      </View>
                    </MenuItem>
                  )}
                {/* {peer.isLocal === false &&
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
                {peer.isLocal === false &&
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
                {peer.isLocal === false && (
                  <MenuItem onPress={() => onSetVolumePress(peer)}>
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
        }}
        keyExtractor={item => item.peerID}
      />
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
  const roles = useSelector((state: RootState) => state.user.roles);

  const [visible, setVisible] = useState<boolean>(false);

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);

  return (
    <Menu
      visible={visible}
      anchor={
        <TouchableOpacity
          style={styles.participantFilterContainer}
          onPress={showMenu}
        >
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
      style={styles.participantsMenuContainer}
    >
      <MenuItem
        onPress={() => {
          hideMenu();
          setFilter('everyone');
        }}
      >
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
        }}
      >
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
            key={knownRole.name}
          >
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
  const roles = useSelector((state: RootState) => state.user.roles);

  const [newRole, setNewRole] = useState<HMSRole>(peer?.role!);
  const [request, setRequest] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);
  const changeRole = () => {
    instance?.changeRole(peer!, newRole, !request);
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
            onPress={showMenu}
          >
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
        style={styles.participantsMenuContainer}
      >
        {roles?.map(knownRole => {
          return (
            <MenuItem
              onPress={() => {
                hideMenu();
                setNewRole(knownRole);
              }}
              key={knownRole.name}
            >
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
          }}
        >
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

export const SaveScreenshot = ({
  screenshotData,
  cancelModal,
}: {
  screenshotData: {peer: HMSPeer; source: {uri: string}} | null;
  cancelModal: Function;
}) => {
  const saveToDisk = async () => {
    try {
      const permission = await requestExternalStoragePermission();

      cancelModal();

      if (permission && screenshotData) {
        InteractionManager.runAfterInteractions(async () => {
          // Save to Disk
          const imageName = `${
            screenshotData.peer.name
          }-snapshot-${Date.now()}.png`;

          const saveDir =
            Platform.OS === 'ios'
              ? RNFetchBlob.fs.dirs.DocumentDir
              : RNFetchBlob.fs.dirs.DCIMDir;

          const fileLocation = `${saveDir}/${imageName}`;

          await RNFetchBlob.fs.writeFile(
            fileLocation,
            screenshotData.source.uri.replace('data:image/png;base64,', ''),
            'base64',
          );

          if (Platform.OS === 'ios') {
            RNFetchBlob.ios.previewDocument(fileLocation);
          }

          Toast.showWithGravity(
            'Snapshot has been saved successfully',
            Toast.LONG,
            Toast.TOP,
          );
        });
      }
    } catch (error) {
      console.warn('Snapshot Save Error: ', error);
    }
  };

  return (
    <View style={[{flexGrow: 1}, styles.volumeModalContainer]}>
      <Text style={styles.roleChangeModalHeading}>
        {screenshotData ? `${screenshotData.peer.name}'s Snapshot` : 'Snapshot'}
      </Text>
      {screenshotData ? (
        <Image
          source={screenshotData.source}
          style={styles.screenshotImage}
          resizeMode="contain"
        />
      ) : null}
      <View style={styles.roleChangeModalPermissionContainer}>
        <CustomButton
          title="Cancel"
          onPress={cancelModal}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          title="Save to Disk"
          onPress={saveToDisk}
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
    if (peer?.audioTrack) {
      instance?.setVolume(peer?.audioTrack, volume);
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

interface RTCTrack {
  name: string;
  peerId?: string; // peerId is used to get audio track stats
  track?: HMSTrack;
}

export const RtcStatsModal = () => {
  const dispatch = useDispatch();
  const instance = useSelector((state: RootState) => state.user.hmsInstance);
  const showStatsOnTiles = useSelector(
    (state: RootState) => state.app.joinConfig.showStats,
  );

  const [localPeer, setLocalPeer] = useState<HMSLocalPeer | null>(null);
  const [remotePeers, setRemotePeers] = useState<HMSRemotePeer[]>([]);
  const [tracksListModalVisible, setTracksListModalVisible] =
    useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<RTCTrack | null>(null);

  const hideMenu = () => setTracksListModalVisible(false);
  const showMenu = () => setTracksListModalVisible(true);

  const getStatsList = () => {
    const list: RTCTrack[] = [];

    if (localPeer?.audioTrack?.trackId) {
      list.push({
        name: localPeer?.name + "'s audio",
        peerId: localPeer?.peerID,
        track: localPeer?.audioTrack,
      });
    }
    if (localPeer?.videoTrack?.trackId) {
      list.push({
        name: localPeer?.name + "'s video",
        track: localPeer?.videoTrack,
      });
    }
    remotePeers.forEach(remotePeer => {
      if (remotePeer?.audioTrack?.trackId) {
        list.push({
          name: remotePeer?.name + "'s audio",
          peerId: remotePeer?.peerID,
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

    return list;
  };

  // Getting Local Peer from hms instance
  useEffect(() => {
    if (instance) {
      const updateLocalPeer = async () => {
        setLocalPeer(await instance.getLocalPeer());
      };

      updateLocalPeer();
    }
  }, [instance]);

  // Getting Remote Peers from hms instance
  useEffect(() => {
    if (instance) {
      const updateRemotePeers = async () => {
        setRemotePeers(await instance.getRemotePeers());
      };

      updateRemotePeers();
    }
  }, [instance]);

  const isCurrentTrackSelected = currentTrack !== null;

  const statsList = getStatsList();

  const firstTrackInStatsList = statsList.length > 0 ? statsList[0] : null;

  // If currentTrack is null and we have valid item in StatsList
  // then showing stats for the first valid item in StatsList
  useEffect(() => {
    if (!isCurrentTrackSelected && firstTrackInStatsList) {
      setCurrentTrack(firstTrackInStatsList);
    }
  }, [isCurrentTrackSelected, firstTrackInStatsList]);

  const selectedTrackId = currentTrack
    ? currentTrack.peerId || currentTrack.track?.trackId
    : null;

  const rtcStatsData = useSelector((state: RootState) =>
    selectedTrackId ? state.app.rtcStats[selectedTrackId] : null,
  );

  return (
    <View style={styles.participantContainer}>
      <View style={styles.participantsHeaderContainer}>
        <Text style={styles.participantsHeading}>Stats for Nerds</Text>
      </View>

      <SwitchRow
        text="Show Stats on Tiles"
        value={showStatsOnTiles}
        onChange={value => dispatch(changeShowStats(value))}
      />

      <Menu
        visible={tracksListModalVisible}
        anchor={
          <TouchableOpacity style={styles.statsModalMenu} onPress={showMenu}>
            <Text style={styles.participantFilterText} numberOfLines={1}>
              {currentTrack?.name ?? 'Choose'}
            </Text>
            <MaterialIcons
              name={
                tracksListModalVisible ? 'arrow-drop-up' : 'arrow-drop-down'
              }
              style={styles.participantFilterIcon}
              size={24}
            />
          </TouchableOpacity>
        }
        onRequestClose={hideMenu}
        style={styles.participantsMenuContainer}
      >
        {statsList.map(trackObj => {
          return (
            <MenuItem
              onPress={() => {
                hideMenu();
                setCurrentTrack(trackObj);
              }}
              key={trackObj?.track?.trackId}
            >
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
        {rtcStatsData
          ? Object.entries(rtcStatsData).map(item => {
              const [key, value] = item;

              return (
                <View style={styles.statsModalCard} key={key}>
                  <Text style={styles.statsModalCardHeading}>{key}</Text>

                  <Text style={styles.statsModalCardDescription}>
                    {key === 'resolution'
                      ? `Height: ${value?.height ?? 0}, Width: ${
                          value?.width ?? 0
                        }`
                      : value}
                  </Text>
                </View>
              );
            })
          : null}
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
            }}
          >
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
            }}
          >
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
            }}
          >
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
  const roles = useSelector((state: RootState) => state.user.roles);

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
            onPress={showMenu}
          >
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
        style={styles.participantsMenuContainer}
      >
        {roles?.map(knownRole => {
          return (
            <MenuItem
              onPress={() => {
                hideMenu();
                setRole(knownRole);
              }}
              key={knownRole.name}
            >
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
            onPress={() => setTrackState(true)}
          >
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
            onPress={() => setTrackState(false)}
          >
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
          onPress={() => setTrackType(HMSTrackType.AUDIO)}
        >
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
          onPress={() => setTrackType(HMSTrackType.VIDEO)}
        >
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
}: {
  instance?: HMSSDK;
  roomID: string;
  cancelModal: Function;
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
      .then(d => console.log('Start HLS Streaming Success: ', d))
      .catch(err => {
        if (startHlsRetry) {
          setStartHlsRetry(false);
          const hmsHLSConfig = new HMSHLSConfig({
            hlsRecordingConfig: hlsRecordingDetails,
            meetingURLVariants: [hlsStreamingDetails],
          });
          instance
            ?.startHLSStreaming(hmsHLSConfig)
            .then(d => console.log('Start HLS Streaming Success: ', d))
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
        }}
      >
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
        }}
      >
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
}: {
  instance?: HMSSDK;
  roomID: string;
  recordingModal: boolean;
  setModalVisible(modalType: ModalTypes, delay?: any): void;
}) => {
  const [resolutionDetails, setResolutionDetails] = useState<boolean>(false);
  const [recordingDetails, setRecordingDetails] = useState<HMSRTMPConfig>({
    record: false,
    meetingURL: roomID ? roomID + '?token=beam_recording' : '',
  });

  const changeLayout = () => {
    instance
      ?.startRTMPOrRecording(recordingDetails)
      .then(d => console.log('Start RTMP Or Recording Success: ', d))
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
        }}
      >
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
            setModalVisible(ModalTypes.RESOLUTION, true);
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
      >
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
          onPress={() => setModalVisible(ModalTypes.RECORDING, true)}
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
    if (startedAt) {
      const millisecs = Date.now() - startedAt.getTime();
      const [h, min, sec] = getTime(Math.abs(millisecs));
      if (h > 0) {
        setHour(h);
      }
      if (min > 0) {
        setMinute(min);
      }
      if (sec > 0) {
        setSecond(sec);
      }
    }
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

interface ChangeBulkRoleModalProps {
  cancelModal(): void;
}

enum RoleSelection {
  TARGET = 'TARGET',
  TO_CHANGE = 'TO_CHANGE',
}

export const ChangeBulkRoleModal: React.FC<ChangeBulkRoleModalProps> = ({
  cancelModal,
}) => {
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const roles = useSelector((state: RootState) => state.user.roles);
  const [showRolesSelectionView, setShowRolesSelectionView] =
    useState<null | RoleSelection>(null);
  const [targetRole, setTargetRole] = useState<HMSRole | null>(null);
  const [rolesToChange, setRolesToChange] = useState<HMSRole[]>([]);

  const changeRole = async () => {
    if (!hmsInstance || !targetRole) return;

    hmsInstance.changeRoleOfPeersWithRoles(
      rolesToChange.filter(
        roleToChange => roleToChange.name !== targetRole.name,
      ),
      targetRole,
    );

    cancelModal();
  };

  const handleRoleSelection = (roleSelected: HMSRole) => {
    if (showRolesSelectionView === RoleSelection.TARGET) {
      setTargetRole(roleSelected);
    } else {
      setRolesToChange(prevRolesToChange => {
        if (
          prevRolesToChange.findIndex(
            role => role.name === roleSelected.name,
          ) >= 0
        ) {
          return prevRolesToChange.filter(
            role => role.name !== roleSelected.name,
          );
        }

        return [...prevRolesToChange, roleSelected];
      });
    }
  };

  // if targetRole is not available, OR
  // role or rolesToChange is not available. then "Change" button should be disabled
  const changeSubmitDisabled = !targetRole || rolesToChange.length === 0;

  return (
    <View style={bulkRoleStyles.container}>
      <Text style={styles.roleChangeModalHeading}>Bulk Role Change</Text>

      <View style={bulkRoleStyles.contentContainer}>
        <View style={bulkRoleStyles.row}>
          <Text style={bulkRoleStyles.label}>Select Roles to Change</Text>

          <TouchableOpacity
            style={bulkRoleStyles.btn}
            onPress={() => setShowRolesSelectionView(RoleSelection.TO_CHANGE)}
          >
            <Text style={bulkRoleStyles.value} numberOfLines={1}>
              {rolesToChange.map(role => role.name).join(', ') ||
                'Select Roles'}
            </Text>

            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              style={bulkRoleStyles.chevronIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={bulkRoleStyles.row}>
          <Text style={bulkRoleStyles.label}>Target Role</Text>

          <TouchableOpacity
            style={bulkRoleStyles.btn}
            onPress={() => setShowRolesSelectionView(RoleSelection.TARGET)}
          >
            <Text style={bulkRoleStyles.value}>
              {targetRole ? targetRole.name : 'Select Role'}
            </Text>

            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              style={bulkRoleStyles.chevronIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.roleChangeModalPermissionContainer}>
        <CustomButton
          title="Cancel"
          onPress={cancelModal}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          disabled={changeSubmitDisabled}
          title="Change"
          onPress={changeRole}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>

      {showRolesSelectionView ? (
        <View style={bulkRoleStyles.roleSelectionBackdrop}>
          <View style={bulkRoleStyles.roleSelectionContainer}>
            <Text style={bulkRoleStyles.heading}>
              {showRolesSelectionView === RoleSelection.TARGET
                ? 'Select Target Role'
                : 'Select Role to Change'}
            </Text>

            <ScrollView
              centerContent={true}
              contentContainerStyle={bulkRoleStyles.scrollContainer}
            >
              {roles.map(role => {
                const selected =
                  showRolesSelectionView === RoleSelection.TARGET
                    ? role.name === targetRole?.name
                    : rolesToChange.findIndex(
                        roleToChange => roleToChange.name === role.name,
                      ) >= 0;

                return (
                  <TouchableOpacity
                    key={role.name}
                    style={bulkRoleStyles.roleBtn}
                    onPress={() => handleRoleSelection(role)}
                  >
                    <View style={bulkRoleStyles.checkboxContainer}>
                      {showRolesSelectionView === RoleSelection.TARGET ? (
                        <MaterialCommunityIcons
                          name={selected ? 'radiobox-marked' : 'radiobox-blank'}
                          style={styles.roleChangeModalCheck}
                          size={20}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name={
                            selected
                              ? 'checkbox-outline'
                              : 'checkbox-blank-outline'
                          }
                          style={styles.roleChangeModalCheck}
                          size={24}
                        />
                      )}
                    </View>

                    <Text style={bulkRoleStyles.checkboxLabel}>
                      {role.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={bulkRoleStyles.roleSelectionDone}
              onPress={() => setShowRolesSelectionView(null)}
            >
              <Text style={bulkRoleStyles.roleSelectionDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const bulkRoleStyles = StyleSheet.create({
  container: {
    padding: 24,
    position: 'relative',
    height: 320,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 24,
  },
  row: {
    // flexGrow: 1,
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
  value: {
    flex: 1,
    color: COLORS.TEXT.MEDIUM_EMPHASIS,
    textAlign: 'right',
  },
  toggleContainer: {
    width: 160,
    borderRadius: 6,
    backgroundColor: COLORS.SECONDARY.DARK,
    flexDirection: 'row',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  toggleItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  toggleActiveItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: COLORS.SECONDARY.DEFAULT,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 4,
  },
  chevronIcon: {
    color: COLORS.TEXT.MEDIUM_EMPHASIS,
  },
  roleSelectionBackdrop: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: '100%',
    height: '100%',
    shadowColor: COLORS.SURFACE.LIGHT,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    padding: 8,
  },
  roleSelectionContainer: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.SURFACE.LIGHT,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: COLORS.BORDER.LIGHT,
  },
  heading: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.TEXT.HIGH_EMPHASIS,
    marginVertical: 4,
    marginLeft: 4,
  },
  scrollContainer: {
    paddingHorizontal: 12,
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    color: COLORS.TEXT.MEDIUM_EMPHASIS,
  },
  roleBtn: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleSelectionDone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingVertical: 6,
  },
  roleSelectionDoneText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Inter-Medium',
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
});
