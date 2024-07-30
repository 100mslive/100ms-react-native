import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Image,
  useWindowDimensions,
} from 'react-native';
import type { ImageURISource } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  HMSTrack,
  HMSRole,
  HMSSDK,
  HMSTrackType,
  HMSTrackSource,
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

import { styles } from './styles';

import { CustomButton } from './CustomButton';
import { Menu, MenuItem } from './MenuModal';

import {
  addNotification,
  changeHLSAspectRatio,
  changeShowStats,
} from '../redux/actions';
import { getTime } from '../utils/functions';
import { ModalTypes, SUPPORTED_ASPECT_RATIOS } from '../utils/types';
import { COLORS } from '../utils/theme';
import type { RootState } from '../redux';
import { SwitchRow } from './SwitchRow';
import { useHMSInstance } from '../hooks-util';
import { ChevronIcon } from '../Icons';
import { NotificationTypes } from '../types';

export const ChangeRoleModal = ({ cancelModal }: { cancelModal: Function }) => {
  const instance = useHMSInstance();
  const dispatch = useDispatch();
  const allRoles = useSelector((state: RootState) => state.hmsStates.roles);
  let peer = useSelector((state: RootState) => state.app.peerToUpdate);

  useEffect(() => {
    let validRoles = allRoles.filter(
      (role) =>
        role.name !== peer?.role?.name && role.name !== '__internal_recorder'
    );
    setValidRoles(validRoles);
    if (validRoles.length > 0) {
      setNewRole(validRoles[0]);
    }
  }, [allRoles, peer]);

  const [validRoles, setValidRoles] = useState<HMSRole[] | undefined>(
    undefined
  );
  const [newRole, setNewRole] = useState<HMSRole | undefined>(undefined);

  const [visible, setVisible] = useState<boolean>(false);

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);
  const switchRole = () => {
    if (newRole) {
      instance?.changeRoleOfPeer(peer!, newRole, true).catch((e) => {
        console.log('Switch Role of Peer Error: ', e);
        dispatch(
          addNotification({
            id: Math.random().toString(16).slice(2),
            type: NotificationTypes.ERROR,
            title: e.message,
          })
        );
      });
    } else {
      dispatch(
        addNotification({
          id: Math.random().toString(16).slice(2),
          type: NotificationTypes.ERROR,
          title: 'Please select a role',
        })
      );
    }
    cancelModal();
  };

  return (
    <View style={styles.roleChangeModal}>
      <Text style={styles.roleChangeModalHeading}>Switch Role</Text>
      <Text style={styles.roleChangeModalDescription}>
        Switch the role of '{peer?.name}' from '{peer?.role?.name}' to
      </Text>
      <Menu
        visible={visible}
        anchor={
          <TouchableOpacity
            style={styles.participantChangeRoleContainer}
            onPress={showMenu}
            disabled={validRoles && validRoles?.length <= 1}
          >
            <Text style={styles.participantFilterText} numberOfLines={1}>
              {newRole?.name}
            </Text>
            {validRoles && validRoles?.length > 1 && (
              <ChevronIcon direction={'down'} />
            )}
          </TouchableOpacity>
        }
        onRequestClose={hideMenu}
        style={styles.participantsMenuContainer}
      >
        {validRoles?.map((knownRole) => {
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
      <View style={styles.roleChangeModalPermissionContainer}>
        <CustomButton
          title="Cancel"
          onPress={cancelModal}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          title="Switch Role"
          onPress={switchRole}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

export const SaveScreenshot = ({
  imageSource,
  cancelModal,
}: {
  imageSource?: Required<Pick<ImageURISource, 'uri'>> | null;
  cancelModal: Function;
}) => {
  const peer = useSelector(
    (state: RootState) => state.hmsStates.localPeer || undefined
  );

  return (
    <View style={[{ flexGrow: 1 }, styles.volumeModalContainer]}>
      <Text style={styles.roleChangeModalHeading}>
        {peer ? `${peer.name}'s Snapshot` : 'Snapshot'}
      </Text>
      {imageSource ? (
        <Image
          source={imageSource}
          style={styles.screenshotImage}
          resizeMode="contain"
        />
      ) : null}
      <View style={styles.roleChangeModalPermissionContainer}>
        <CustomButton
          title="Done"
          onPress={cancelModal}
          viewStyle={[styles.roleChangeModalCancelButton, { width: '100%' }]}
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
    (state: RootState) => state.app.joinConfig.showStats
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
    remotePeers.forEach((remotePeer) => {
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
    selectedTrackId ? state.app.rtcStats[selectedTrackId] : null
  );

  return (
    <View style={styles.participantContainer}>
      <View style={styles.participantsHeaderContainer}>
        <Text style={styles.participantsHeading}>Stats for Nerds</Text>
      </View>

      <SwitchRow
        text="Show Stats on Tiles"
        value={showStatsOnTiles}
        onChange={(value) => dispatch(changeShowStats(value))}
      />

      <Menu
        visible={tracksListModalVisible}
        anchor={
          <TouchableOpacity style={styles.statsModalMenu} onPress={showMenu}>
            <Text style={styles.participantFilterText} numberOfLines={1}>
              {currentTrack?.name ?? 'Choose'}
            </Text>
          </TouchableOpacity>
        }
        onRequestClose={hideMenu}
        style={styles.participantsMenuContainer}
      >
        {statsList.map((trackObj) => {
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

      <ScrollView
        contentContainerStyle={
          Array.isArray(rtcStatsData) ? null : styles.statsModalCardContainer
        }
      >
        {rtcStatsData ? (
          Array.isArray(rtcStatsData) ? (
            <View>
              {rtcStatsData.map((rtcStatsItem) => {
                return (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.statsModalCardDescription}>
                      {rtcStatsItem.layer}
                    </Text>

                    <View style={styles.statsModalCardContainer}>
                      {Object.entries(rtcStatsItem)
                        .filter((item) => item[0] !== 'layer')
                        .map((item) => {
                          const [key, value] = item;

                          return (
                            <View style={styles.statsModalCard} key={key}>
                              <Text style={styles.statsModalCardHeading}>
                                {key}
                              </Text>

                              <Text style={styles.statsModalCardDescription}>
                                {key === 'resolution'
                                  ? `Height: ${value?.height ?? 0}, Width: ${
                                      value?.width ?? 0
                                    }`
                                  : key === 'qualityLimitationReasons'
                                    ? value.reason
                                    : value}
                              </Text>
                            </View>
                          );
                        })}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            Object.entries(rtcStatsData).map((item) => {
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
          )
        ) : null}
      </ScrollView>
    </View>
  );
};

export const ChangeAudioOutputModal = ({
  cancelModal,
}: {
  cancelModal: Function;
}) => {
  const instance = useHMSInstance();
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
      {audioOutputDevicesList.map((device) => {
        return (
          <TouchableOpacity
            key={device}
            style={styles.roleChangeModalPermissionContainer}
            onPress={() => {
              setCurrentOutputDevice(device);
            }}
          >
            <Text
              style={[
                styles.roleChangeModalPermission,
                currentOutputDevice === device
                  ? { color: COLORS.PRIMARY.DEFAULT }
                  : null,
              ]}
            >
              {device}
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
          onPress={switchAudioOutput}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

export const ChangeAspectRatio = ({
  cancelModal,
}: {
  cancelModal: Function;
}) => {
  const { height } = useWindowDimensions();
  const dispatch = useDispatch();
  const hlsPlayerAspectRatio = useSelector(
    (state: RootState) => state.app.hlsAspectRatio
  );
  const [selectedRatio, setSelectedRatio] = useState(hlsPlayerAspectRatio);

  const handleChangePress = () => {
    cancelModal();
    if (hlsPlayerAspectRatio.id !== selectedRatio.id) {
      dispatch(changeHLSAspectRatio(selectedRatio));
    }
  };

  return (
    <View style={styles.roleChangeModal}>
      <Text style={styles.roleChangeModalHeading}>Change Aspect Ratio</Text>
      <Text style={styles.roleChangeModalDescription}>
        Current: {hlsPlayerAspectRatio.id}
      </Text>

      <ScrollView style={{ maxHeight: height * 0.4 }}>
        {SUPPORTED_ASPECT_RATIOS.map((ratio) => {
          return (
            <TouchableOpacity
              key={ratio.id}
              style={styles.roleChangeModalPermissionContainer}
              onPress={() => setSelectedRatio(ratio)}
            >
              <Text
                style={[
                  styles.roleChangeModalPermission,
                  selectedRatio.id === ratio.id
                    ? { color: COLORS.PRIMARY.DEFAULT }
                    : null,
                ]}
              >
                {ratio.id}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.roleChangeModalPermissionContainer}>
        <CustomButton
          title="Cancel"
          onPress={cancelModal}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          title="Change"
          onPress={handleChangePress}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

export const ChangeAudioModeModal = ({
  cancelModal,
  audioMode,
  setAudioMode,
}: {
  audioMode: HMSAudioMode;
  setAudioMode: React.Dispatch<React.SetStateAction<HMSAudioMode>>;
  cancelModal: Function;
}) => {
  const instance = useHMSInstance();
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
      {AudioModeList.map((mode) => {
        return (
          <TouchableOpacity
            key={mode}
            style={styles.roleChangeModalPermissionContainer}
            onPress={() => {
              setCurrentAudioMode(AudioModeList.indexOf(mode));
            }}
          >
            <Text
              style={[
                styles.roleChangeModalPermission,
                currentAudioMode === AudioModeList.indexOf(mode)
                  ? { color: COLORS.PRIMARY.DEFAULT }
                  : null,
              ]}
            >
              {mode}
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
          onPress={switchAudioMode}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

export const ChangeAudioMixingModeModal = ({
  newAudioMixingMode,
  cancelModal,
  setNewAudioMixingMode,
}: {
  newAudioMixingMode: HMSAudioMixingMode;
  cancelModal: Function;
  setNewAudioMixingMode: React.Dispatch<
    React.SetStateAction<HMSAudioMixingMode>
  >;
}) => {
  const instance = useHMSInstance();
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
      {Object.keys(HMSAudioMixingMode).map((audioMixingMode) => {
        return (
          <TouchableOpacity
            key={audioMixingMode}
            style={styles.roleChangeModalPermissionContainer}
            onPress={() => {
              setNewAudioMixingMode(audioMixingMode as HMSAudioMixingMode);
            }}
          >
            <Text
              style={[
                styles.roleChangeModalPermission,
                newAudioMixingMode === audioMixingMode
                  ? { color: COLORS.PRIMARY.DEFAULT }
                  : null,
              ]}
            >
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

export const ChangeTrackStateForRoleModal = ({
  cancelModal,
}: {
  cancelModal: Function;
}) => {
  const instance = useHMSInstance();
  const roles = useSelector((state: RootState) => state.hmsStates.roles);
  const localPeerRole = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role
  );

  const [role, setRole] = useState<HMSRole>(localPeerRole!);
  const [visible, setVisible] = useState<boolean>(false);
  const [trackType, setTrackType] = useState<HMSTrackType>(HMSTrackType.VIDEO);
  const [trackState, setTrackState] = useState<boolean>(false);

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);
  const changeTrackState = async () => {
    const source = HMSTrackSource.REGULAR;
    await instance
      ?.changeTrackStateForRoles(trackState, trackType, source, [role])
      .then((d) => console.log('Change Track State For Role Success: ', d))
      .catch((e) => console.log('Change Track State For Role Error: ', e));
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
          </TouchableOpacity>
        }
        onRequestClose={hideMenu}
        style={styles.participantsMenuContainer}
      >
        {roles?.map((knownRole) => {
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
        {localPeerRole?.permissions?.mute && (
          <TouchableOpacity
            style={styles.changeTrackStateRoleOption}
            onPress={() => setTrackState(true)}
          >
            <Text
              style={[
                styles.roleChangeModalPermission,
                trackState ? { color: COLORS.PRIMARY.DEFAULT } : null,
              ]}
            >
              MUTE
            </Text>
          </TouchableOpacity>
        )}
        {localPeerRole?.permissions?.unmute && (
          <TouchableOpacity
            style={styles.changeTrackStateRoleOption}
            onPress={() => setTrackState(false)}
          >
            <Text
              style={[
                styles.roleChangeModalPermission,
                !trackState ? { color: COLORS.PRIMARY.DEFAULT } : null,
              ]}
            >
              UNMUTE
            </Text>
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
          <Text
            style={[
              styles.roleChangeModalPermission,
              trackType === HMSTrackType.AUDIO
                ? { color: COLORS.PRIMARY.DEFAULT }
                : null,
            ]}
          >
            {HMSTrackType.AUDIO}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.changeTrackStateRoleOption}
          onPress={() => setTrackType(HMSTrackType.VIDEO)}
        >
          <Text
            style={[
              styles.roleChangeModalPermission,
              trackType === HMSTrackType.VIDEO
                ? { color: COLORS.PRIMARY.DEFAULT }
                : null,
            ]}
          >
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
  roleChangeRequest,
  cancelModal,
}: {
  roleChangeRequest: {
    requestedBy?: string;
    suggestedRole?: string;
  };
  cancelModal: Function;
}) => {
  const localPeer = useSelector(
    (state: RootState) => state.hmsStates.localPeer
  );

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
  cancelModal,
}: {
  cancelModal: Function;
}) => {
  const instance = useHMSInstance();
  const roomID = useSelector((state: RootState) => state.user.roomID);
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
      .then((d) => console.log('Start HLS Streaming Success: ', d))
      .catch((err) => {
        if (startHlsRetry) {
          setStartHlsRetry(false);
          const hmsHLSConfig = new HMSHLSConfig({
            hlsRecordingConfig: hlsRecordingDetails,
            meetingURLVariants: [hlsStreamingDetails],
          });
          instance
            ?.startHLSStreaming(hmsHLSConfig)
            .then((d) => console.log('Start HLS Streaming Success: ', d))
            .catch((e) => console.log('Start HLS Streaming Error: ', e));
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
        onChangeText={(value) => {
          setHLSStreamingDetails({ ...hlsStreamingDetails, meetingUrl: value });
        }}
        placeholderTextColor={COLORS.SECONDARY.DEFAULT}
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
        <Text
          style={[
            styles.roleChangeModalPermission,
            hlsRecordingDetails.singleFilePerLayer
              ? { color: COLORS.PRIMARY.DEFAULT }
              : null,
          ]}
        >
          SingleFilePerLayer
        </Text>
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
        <Text
          style={[
            styles.roleChangeModalPermission,
            hlsRecordingDetails.videoOnDemand
              ? { color: COLORS.PRIMARY.DEFAULT }
              : null,
          ]}
        >
          VideoOnDemand
        </Text>
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
  setModalVisible,
}: {
  setModalVisible(modalType: ModalTypes, delay?: any): void;
}) => {
  const instance = useHMSInstance();
  const roomID = useSelector((state: RootState) => state.user.roomID);
  const [recordingDetails, setRecordingDetails] = useState<HMSRTMPConfig>({
    record: false,
    meetingURL: roomID ? roomID + '?token=beam_recording' : undefined,
  });

  const changeLayout = () => {
    instance
      ?.startRTMPOrRecording(recordingDetails)
      .then((d) => console.log('Start RTMP Or Recording Success: ', d))
      .catch((e) => console.log('Start RTMP Or Recording Error: ', e));
    setModalVisible(ModalTypes.DEFAULT);
  };

  return (
    <View style={styles.roleChangeModal}>
      <Text style={styles.roleChangeModalHeading}>Recording Details</Text>
      <TextInput
        onChangeText={(value) => {
          setRecordingDetails({ ...recordingDetails, meetingURL: value });
        }}
        placeholderTextColor={COLORS.SECONDARY.DEFAULT}
        placeholder="Enter meeting url"
        style={styles.input}
        defaultValue={recordingDetails.meetingURL || ''}
        returnKeyType="done"
        multiline
        blurOnSubmit
      />
      <TextInput
        onChangeText={(value) => {
          if (value === '') {
            setRecordingDetails({ ...recordingDetails, rtmpURLs: undefined });
          } else {
            setRecordingDetails({ ...recordingDetails, rtmpURLs: [value] });
          }
        }}
        placeholderTextColor={COLORS.SECONDARY.DEFAULT}
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
        <Text
          style={[
            styles.roleChangeModalPermission,
            recordingDetails.record ? { color: COLORS.PRIMARY.DEFAULT } : null,
          ]}
        >
          Record
        </Text>
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

export const RealTime = ({ startedAt }: { startedAt?: Date }) => {
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
      setSecond((sec) => sec + 1);
    }, 1000);

    return () => {
      clearInterval(updatePostInfo);
    };
  }, []);

  useEffect(() => {
    if (second === 60) {
      setSecond(0);
      setMinute((min) => min + 1);
    }
  }, [second]);

  useEffect(() => {
    if (minute === 60) {
      setMinute(0);
      setHour((hr) => hr + 1);
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
  const roles = useSelector((state: RootState) => state.hmsStates.roles);
  const [showRolesSelectionView, setShowRolesSelectionView] =
    useState<null | RoleSelection>(null);
  const [targetRole, setTargetRole] = useState<HMSRole | null>(null);
  const [rolesToChange, setRolesToChange] = useState<HMSRole[]>([]);

  const changeRole = async () => {
    if (!hmsInstance || !targetRole) {
      return;
    }

    hmsInstance.changeRoleOfPeersWithRoles(
      rolesToChange.filter(
        (roleToChange) => roleToChange.name !== targetRole.name
      ),
      targetRole
    );

    cancelModal();
  };

  const handleRoleSelection = (roleSelected: HMSRole) => {
    if (showRolesSelectionView === RoleSelection.TARGET) {
      setTargetRole(roleSelected);
    } else {
      setRolesToChange((prevRolesToChange) => {
        if (
          prevRolesToChange.findIndex(
            (role) => role.name === roleSelected.name
          ) >= 0
        ) {
          return prevRolesToChange.filter(
            (role) => role.name !== roleSelected.name
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
              {rolesToChange.map((role) => role.name).join(', ') ||
                'Select Roles'}
            </Text>
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
              {roles.map((role) => {
                const selected =
                  showRolesSelectionView === RoleSelection.TARGET
                    ? role.name === targetRole?.name
                    : rolesToChange.findIndex(
                        (roleToChange) => roleToChange.name === role.name
                      ) >= 0;

                return (
                  <TouchableOpacity
                    key={role.name}
                    style={bulkRoleStyles.roleBtn}
                    onPress={() => handleRoleSelection(role)}
                  >
                    <Text
                      style={{
                        color: selected
                          ? COLORS.PRIMARY.DEFAULT
                          : COLORS.TEXT.MEDIUM_EMPHASIS,
                      }}
                    >
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
