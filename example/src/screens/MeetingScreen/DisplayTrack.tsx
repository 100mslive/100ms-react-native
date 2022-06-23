import React, {useEffect, useRef, useState} from 'react';
import {View, TouchableOpacity, Text, Image, Platform} from 'react-native';
import {
  HMSRemotePeer,
  HMSVideoViewMode,
  HMSTrack,
  HMSLocalAudioStats,
  HMSLocalVideoStats,
  HMSRTCStatsReport,
  HMSSDK,
  HMSTrackType,
  HMSTrackSource,
} from '@100mslive/react-native-hms';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Slider} from '@miblanchard/react-native-slider';
import {useSelector} from 'react-redux';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';
import Toast from 'react-native-simple-toast';

import {AlertModal, CustomModal, RolePicker} from '../../components';
import {
  getInitials,
  parseMetadata,
  requestExternalStoragePermission,
} from '../../utils/functions';
import {styles} from './styles';
import {
  LayoutParams,
  ModalTypes,
  PeerTrackNode,
  TrackType,
} from '../../utils/types';
import type {RootState} from '../../redux';

type DisplayTrackProps = {
  layout?: LayoutParams;
  setModalVisible?: Function;
  statsForNerds?: boolean;
  rtcStats?: HMSRTCStatsReport;
  remoteAudioStats?: any;
  remoteVideoStats?: any;
  localAudioStats?: HMSLocalAudioStats;
  localVideoStats?: HMSLocalVideoStats;
  isSpeaking?: Function;
  miniView?: boolean;
  instance: HMSSDK | undefined;
  peerTrackNode: PeerTrackNode;
  videoStyles: any;
  pinnedPeerTrackIds?: String[];
  setPinnedPeerTrackIds?: React.Dispatch<React.SetStateAction<String[]>>;
};

const DisplayTrack = ({
  peerTrackNode,
  videoStyles,
  isSpeaking,
  instance,
  layout,
  statsForNerds,
  remoteAudioStats,
  remoteVideoStats,
  localAudioStats,
  localVideoStats,
  setModalVisible,
  miniView,
  pinnedPeerTrackIds,
  setPinnedPeerTrackIds,
}: DisplayTrackProps) => {
  const {mirrorLocalVideo} = useSelector((state: RootState) => state.user);
  const isVideoMute = peerTrackNode?.track?.isMute() ?? true;
  const isAudioMute = peerTrackNode.peer?.audioTrack?.isMute() ?? true;
  const metadata = parseMetadata(peerTrackNode.peer?.metadata);
  const id = peerTrackNode.peer.peerID;
  const name = peerTrackNode.peer.name;
  const type =
    peerTrackNode?.track?.source !== HMSTrackSource.REGULAR
      ? TrackType.SCREEN
      : peerTrackNode?.peer.isLocal
      ? TrackType.LOCAL
      : TrackType.REMOTE;
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [newRole, setNewRole] = useState(peerTrackNode.peer?.role);
  const [force, setForce] = useState(false);
  const [volumeModal, setVolumeModal] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isDegraded, setIsDegraded] = useState(false);
  const modalTitle = 'Set Volume';
  const hmsViewRef: any = useRef();
  const HmsView = instance?.HmsView;
  const knownRoles = instance?.knownRoles || [];
  const speaking = isSpeaking && isSpeaking(peerTrackNode);

  const modalButtons: [
    {text: string; onPress?: Function},
    {text: string; onPress?: Function},
  ] = [
    {text: 'Cancel'},
    {
      text: 'Set',
      onPress: () => {
        if (type === TrackType.LOCAL || type === TrackType.REMOTE) {
          instance?.setVolume(
            peerTrackNode.peer?.audioTrack as HMSTrack,
            volume,
          );
        } else {
          peerTrackNode.peer?.auxiliaryTracks?.map(track => {
            if (
              track.source === TrackType.SCREEN &&
              track.type === HMSTrackType.AUDIO
            ) {
              instance?.setVolume(track, volume);
            }
          });
        }
      },
    },
  ];

  useEffect(() => {
    knownRoles?.map(role => {
      if (role?.name === peerTrackNode.peer?.role?.name) {
        setNewRole(role);
        return;
      }
    });
    const getVolume = async () => {
      if (type === TrackType.LOCAL && !isAudioMute) {
        try {
          setVolume(await instance?.localPeer?.localAudioTrack()?.getVolume());
        } catch (e) {
          console.log('error in get volume', e);
        }
      }
    };
    let fetchVolume = true;
    if (fetchVolume) {
      getVolume();
    }
    return () => {
      fetchVolume = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsDegraded(peerTrackNode.track?.isDegraded || false);
  }, [peerTrackNode.track?.isDegraded]);

  const roleRequestTitle = 'Select action';
  const roleRequestButtons: Array<{
    text: string;
    type?: string;
    onPress?: Function;
  }> = [
    {text: 'Cancel'},
    {
      text: force ? 'Set' : 'Send',
      onPress: async () => {
        await instance?.changeRole(peerTrackNode.peer, newRole!, force);
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
  }> = [
    {text: 'Cancel', type: 'cancel'},
    {
      text: 'Change Name',
      onPress: () => {
        setModalVisible && setModalVisible(ModalTypes.CHANGE_NAME);
      },
    },
  ];

  const selectActionTitle = 'Select action';
  const selectRemoteActionButtons: Array<{
    text: string;
    type?: string;
    onPress?: Function;
  }> = [
    {text: 'Cancel', type: 'cancel'},
    {
      text: pinnedPeerTrackIds?.includes(peerTrackNode.id) ? 'Unpin' : 'Pin',
      onPress: () => {
        if (pinnedPeerTrackIds && setPinnedPeerTrackIds) {
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
            const newPinnedPeerTrackIds = [
              peerTrackNode.id,
              ...pinnedPeerTrackIds,
            ];
            setPinnedPeerTrackIds(newPinnedPeerTrackIds);
          }
        }
      },
    },
    {
      text: 'Set Volume',
      onPress: () => {
        setVolumeModal(true);
      },
    },
    {
      text: 'Mute/Unmute audio locally',
      onPress: async () => {
        let remotePeer = peerTrackNode.peer as HMSRemotePeer;
        instance?.remotePeers?.map(item => {
          if (item.peerID === remotePeer.peerID) {
            remotePeer = item;
          }
        });
        const playbackAllowed = await remotePeer
          ?.remoteAudioTrack()
          ?.isPlaybackAllowed();
        remotePeer?.remoteAudioTrack()?.setPlaybackAllowed(!playbackAllowed);
      },
    },
    {
      text: 'Mute/Unmute video locally',
      onPress: async () => {
        let remotePeer = peerTrackNode.peer as HMSRemotePeer;
        instance?.remotePeers?.map(item => {
          if (item.peerID === remotePeer.peerID) {
            remotePeer = item;
          }
        });
        const playbackAllowed = await remotePeer
          ?.remoteVideoTrack()
          ?.isPlaybackAllowed();
        remotePeer?.remoteVideoTrack()?.setPlaybackAllowed(!playbackAllowed);
      },
    },
  ];
  if (instance?.localPeer?.role?.permissions?.changeRole) {
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
  if (instance?.localPeer?.role?.permissions?.removeOthers) {
    selectRemoteActionButtons.push({
      text: 'Remove Participant',
      onPress: async () => {
        await instance?.removePeer(peerTrackNode.peer, 'removed from room');
      },
    });
  }
  if (instance?.localPeer?.role?.permissions?.unmute) {
    const unmute = false;
    if (isAudioMute) {
      selectRemoteActionButtons.push({
        text: 'Unmute audio',
        onPress: async () => {
          await instance?.changeTrackState(
            peerTrackNode.peer?.audioTrack as HMSTrack,
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
            peerTrackNode.peer?.videoTrack as HMSTrack,
            unmute,
          );
        },
      });
    }
  }
  if (instance?.localPeer?.role?.permissions?.mute) {
    const mute = true;
    if (!isAudioMute) {
      selectRemoteActionButtons.push({
        text: 'Mute audio',
        onPress: async () => {
          await instance?.changeTrackState(
            peerTrackNode.peer?.audioTrack as HMSTrack,
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
            peerTrackNode.peer?.videoTrack as HMSTrack,
            mute,
          );
        },
      });
    }
  }
  if (Platform.OS === 'android') {
    const takeScreenshot = {
      text: 'Take Screenshot',
      onPress: async () => {
        const granted = await requestExternalStoragePermission();
        if (granted) {
          hmsViewRef?.current
            ?.capture()
            .then(async (d: string) => {
              const imagePath = `${RNFS.DownloadDirectoryPath}image.jpg`;
              RNFS.writeFile(imagePath, d, 'base64')
                .then(() => {
                  CameraRoll.save(imagePath, {type: 'photo'})
                    .then(() => {
                      Toast.showWithGravity(
                        'Image converted to jpg and saved at ' + imagePath,
                        Toast.LONG,
                        Toast.TOP,
                      );
                      console.log(
                        'Image converted to jpg and saved at ',
                        imagePath,
                      );
                    })
                    .catch(err => console.log(err));
                })
                .catch(e => console.log(e));
            })
            .catch((e: any) => console.log(e));
        }
      },
    };
    selectAuxActionButtons.push(takeScreenshot);
    selectRemoteActionButtons.push(takeScreenshot);
    selectLocalActionButtons.push(takeScreenshot);
  }

  const promptUser = () => {
    setAlertModalVisible(true);
  };

  return HmsView ? (
    <View style={[videoStyles, speaking && styles.highlight]}>
      <AlertModal
        modalVisible={alertModalVisible}
        setModalVisible={setAlertModalVisible}
        title={selectActionTitle}
        buttons={
          type === TrackType.SCREEN
            ? selectAuxActionButtons
            : type === TrackType.LOCAL
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
      {statsForNerds && (
        <View style={styles.statsContainer}>
          {type === TrackType.LOCAL ? (
            <View>
              <Text style={styles.statsText}>
                Bitrate(A) = {localAudioStats?.bitrate}
              </Text>
              <Text style={styles.statsText}>
                Bitrate(V) = {localVideoStats?.bitrate}
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.statsText}>
                Bitrate(A) = {remoteAudioStats[id!]?.bitrate}
              </Text>
              <Text style={styles.statsText}>
                Bitrate(V) = {remoteVideoStats[id!]?.bitrate}
              </Text>
              <Text style={styles.statsText}>
                Jitter(A) = {remoteAudioStats[id!]?.jitter}
              </Text>
              <Text style={styles.statsText}>
                Jitter(V) = {remoteVideoStats[id!]?.jitter}
              </Text>
            </View>
          )}
        </View>
      )}
      {isVideoMute || layout === LayoutParams.AUDIO ? (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.flex}>
          <HmsView
            ref={hmsViewRef}
            setZOrderMediaOverlay={miniView}
            trackId={peerTrackNode.track?.trackId!}
            mirror={
              type === TrackType.LOCAL && mirrorLocalVideo !== undefined
                ? mirrorLocalVideo
                : false
            }
            scaleType={
              type === TrackType.SCREEN
                ? HMSVideoViewMode.ASPECT_FIT
                : HMSVideoViewMode.ASPECT_FILL
            }
            style={
              type === TrackType.SCREEN ? styles.hmsViewScreen : styles.hmsView
            }
          />
          {isDegraded && (
            <View style={styles.degradedContainer}>
              <View style={styles.avatarContainer}>
                <Text style={styles.degradedText}>Degraded</Text>
              </View>
            </View>
          )}
        </View>
      )}
      {metadata?.isHandRaised && (
        <View style={styles.status}>
          <Ionicons name="ios-hand-left" style={styles.raiseHand} size={30} />
        </View>
      )}
      {metadata?.isBRBOn && (
        <View style={styles.status}>
          <View style={styles.brbOnContainer}>
            <Text style={styles.brbOn}>BRB</Text>
          </View>
        </View>
      )}
      <View style={styles.labelContainer}>
        {peerTrackNode.peer?.networkQuality?.downlinkQuality &&
        peerTrackNode.peer?.networkQuality?.downlinkQuality > -1 ? (
          <View>
            <Image
              style={styles.network}
              source={
                peerTrackNode.peer?.networkQuality?.downlinkQuality === 0
                  ? require('../../../assets/network_0.png')
                  : peerTrackNode.peer?.networkQuality?.downlinkQuality === 1
                  ? require('../../../assets/network_1.png')
                  : peerTrackNode.peer?.networkQuality?.downlinkQuality === 2
                  ? require('../../../assets/network_2.png')
                  : peerTrackNode.peer?.networkQuality?.downlinkQuality === 3
                  ? require('../../../assets/network_3.png')
                  : require('../../../assets/network_4.png')
              }
            />
          </View>
        ) : (
          <></>
        )}
        {isDegraded && (
          <View>
            <MaterialCommunityIcons
              name="shield-alert-outline"
              style={styles.degraded}
              size={30}
            />
          </View>
        )}
      </View>
      {layout === LayoutParams.GRID &&
        (type === TrackType.SCREEN ||
          (type === TrackType.LOCAL && selectLocalActionButtons.length > 1) ||
          (type === TrackType.REMOTE &&
            selectRemoteActionButtons.length > 1)) && (
          <TouchableOpacity
            onPress={promptUser}
            style={styles.optionsContainer}>
            <Entypo
              name="dots-three-horizontal"
              style={styles.options}
              size={30}
            />
          </TouchableOpacity>
        )}
      <View style={styles.displayContainer}>
        <View style={styles.peerNameContainer}>
          <Text numberOfLines={2} style={styles.peerName}>
            {peerTrackNode.track?.source === HMSTrackSource.SCREEN
              ? `${name}'s Screen`
              : peerTrackNode.peer?.isLocal
              ? `You (${name})`
              : name}
          </Text>
        </View>
        <View style={styles.micContainer}>
          {isAudioMute && (
            <Feather name="mic-off" style={styles.mic} size={20} />
          )}
          {isVideoMute && (
            <Feather name="video-off" style={styles.mic} size={20} />
          )}
        </View>
      </View>
    </View>
  ) : (
    <></>
  );
};

export {DisplayTrack};
