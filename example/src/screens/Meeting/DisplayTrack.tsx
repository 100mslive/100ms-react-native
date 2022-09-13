import React, {useEffect, useRef, useState} from 'react';
import {View, TouchableOpacity, Text, Image, Platform} from 'react-native';
import {
  HMSRemotePeer,
  HMSVideoViewMode,
  HMSTrack,
  HMSSDK,
  HMSTrackSource,
  HMSTrackType,
} from '@100mslive/react-native-hms';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';
import Toast from 'react-native-simple-toast';

import {AlertModal, CustomButton} from '../../components';
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
  isSpeaking?: Function;
  miniView?: boolean;
  instance: HMSSDK | undefined;
  peerTrackNode: PeerTrackNode;
  videoStyles: any;
  pinnedPeerTrackIds?: String[];
  setPinnedPeerTrackIds?: React.Dispatch<React.SetStateAction<String[]>>;
  setUpdatePeerTrackNode?: React.Dispatch<React.SetStateAction<PeerTrackNode>>;
  onEndScreenSharePress?: Function;
};

const DisplayTrack = ({
  peerTrackNode,
  videoStyles,
  isSpeaking,
  instance,
  layout,
  setModalVisible,
  miniView,
  pinnedPeerTrackIds,
  setPinnedPeerTrackIds,
  setUpdatePeerTrackNode,
  onEndScreenSharePress,
}: DisplayTrackProps) => {
  const {mirrorLocalVideo, isHLSFlow} = useSelector(
    (state: RootState) => state.user,
  );

  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [isDegraded, setIsDegraded] = useState(false);
  const hmsViewRef: any = useRef();

  const HmsView = instance?.HmsView;
  const isVideoMute = peerTrackNode?.track?.isMute() ?? true;
  const isAudioMute = peerTrackNode.peer.audioTrack?.isMute() ?? true;
  const name = peerTrackNode.peer.name;
  const metadata = parseMetadata(peerTrackNode.peer.metadata);
  const speaking = isSpeaking && isSpeaking(peerTrackNode);
  const type =
    peerTrackNode.track?.source === HMSTrackSource.REGULAR ||
    peerTrackNode.track?.source === undefined
      ? peerTrackNode.peer.isLocal
        ? TrackType.LOCAL
        : TrackType.REMOTE
      : TrackType.SCREEN;

  const selectAuxActionButtons: Array<{
    text: string;
    type?: string;
    onPress?: Function;
  }> = [{text: 'Cancel', type: 'cancel'}];

  const selectLocalActionButtons: Array<{
    text: string;
    type?: string;
    onPress?: Function;
  }> = [{text: 'Cancel', type: 'cancel'}];

  const selectRemoteActionButtons: Array<{
    text: string;
    type?: string;
    onPress?: Function;
  }> = [{text: 'Cancel', type: 'cancel'}];

  const changeNameButton = {
    text: 'Change Name',
    onPress: () => {
      setUpdatePeerTrackNode && setUpdatePeerTrackNode(peerTrackNode);
      setModalVisible && setModalVisible(ModalTypes.CHANGE_NAME);
    },
  };
  selectLocalActionButtons.push(changeNameButton);

  if (instance?.localPeer?.role?.permissions?.changeRole) {
    const changeRoleButton = {
      text: 'Change Role',
      onPress: () => {
        setUpdatePeerTrackNode && setUpdatePeerTrackNode(peerTrackNode);
        setModalVisible && setModalVisible(ModalTypes.CHANGE_ROLE);
      },
    };
    selectLocalActionButtons.push(changeRoleButton);
    selectRemoteActionButtons.push(changeRoleButton);
  }

  if (instance?.localPeer?.role?.permissions?.removeOthers) {
    const removePeerButton = {
      text: 'Remove Participant',
      onPress: async () => {
        await instance?.removePeer(peerTrackNode.peer, 'removed from room');
      },
    };
    selectRemoteActionButtons.push(removePeerButton);
  }

  if (Platform.OS === 'android') {
    const takeScreenshot = {
      text: 'Take Snapshot',
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

  if (instance?.localPeer?.role?.permissions?.unmute) {
    if (isAudioMute) {
      const unmuteAudioButton = {
        text: 'Remote Unmute Audio',
        onPress: async () => {
          await instance?.changeTrackState(
            peerTrackNode.peer?.audioTrack as HMSTrack,
            false,
          );
        },
      };
      selectRemoteActionButtons.push(unmuteAudioButton);
    }
    if (isVideoMute) {
      const unmuteVideoButton = {
        text: 'Remote Unmute Video',
        onPress: async () => {
          await instance?.changeTrackState(
            peerTrackNode.peer?.videoTrack as HMSTrack,
            false,
          );
        },
      };
      selectRemoteActionButtons.push(unmuteVideoButton);
    }
  }

  if (instance?.localPeer?.role?.permissions?.mute) {
    if (!isAudioMute) {
      const muteAudioButton = {
        text: 'Remote Mute Audio',
        onPress: async () => {
          await instance?.changeTrackState(
            peerTrackNode.peer?.audioTrack as HMSTrack,
            true,
          );
        },
      };
      selectRemoteActionButtons.push(muteAudioButton);
    }
    if (!isVideoMute) {
      const muteVideoButton = {
        text: 'Remote Mute Video',
        onPress: async () => {
          await instance?.changeTrackState(
            peerTrackNode.peer?.videoTrack as HMSTrack,
            true,
          );
        },
      };
      selectRemoteActionButtons.push(muteVideoButton);
    }
  }

  const localMuteAudioButton = {
    text: 'Local Mute/Unmute Audio',
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
  };
  selectRemoteActionButtons.push(localMuteAudioButton);

  const localMuteVideoButton = {
    text: 'Local Mute/Unmute Video',
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
  };
  selectRemoteActionButtons.push(localMuteVideoButton);

  const setVolumeButton = {
    text: 'Set Volume',
    onPress: () => {
      setUpdatePeerTrackNode && setUpdatePeerTrackNode(peerTrackNode);
      setModalVisible && setModalVisible(ModalTypes.VOLUME);
    },
  };
  selectAuxActionButtons.push(setVolumeButton);
  selectRemoteActionButtons.push(setVolumeButton);
  selectLocalActionButtons.push(setVolumeButton);

  const pinPeerButton = {
    text: pinnedPeerTrackIds?.includes(peerTrackNode.id)
      ? 'Unpin Peer'
      : 'Pin Peer',
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
  };
  selectLocalActionButtons.push(pinPeerButton);
  selectRemoteActionButtons.push(pinPeerButton);

  useEffect(() => {
    setIsDegraded(peerTrackNode.track?.isDegraded || false);
  }, [peerTrackNode.track?.isDegraded]);

  const onScreenshareEnd = () => {
    onEndScreenSharePress && onEndScreenSharePress();
  };

  return HmsView ? (
    <View style={[videoStyles, speaking && styles.highlight]}>
      <AlertModal
        modalVisible={alertModalVisible}
        setModalVisible={setAlertModalVisible}
        title="Select Action"
        buttons={
          type === TrackType.LOCAL
            ? selectLocalActionButtons
            : type === TrackType.REMOTE
            ? selectRemoteActionButtons
            : selectAuxActionButtons
        }
      />
      {peerTrackNode.peer.isLocal &&
      peerTrackNode.track?.source === HMSTrackSource.SCREEN &&
      peerTrackNode.track.type === HMSTrackType.VIDEO ? (
        <View style={styles.screenshareContainer}>
          <MaterialCommunityIcons
            name="monitor-share"
            style={styles.icon}
            size={48}
          />
          <Text style={styles.screenshareText}>
            You are sharing your screen
          </Text>
          <CustomButton
            title="X   Stop Screenshare"
            onPress={onScreenshareEnd}
            viewStyle={styles.screenshareButton}
            textStyle={styles.roleChangeModalButtonText}
          />
        </View>
      ) : isVideoMute || layout === LayoutParams.AUDIO ? (
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
      <View style={styles.status}>
        {metadata?.isHandRaised && (
          <Ionicons name="ios-hand-left" style={styles.raiseHand} size={25} />
        )}
        {metadata?.isBRBOn && (
          <View style={styles.brbOnContainer}>
            <Text style={styles.brbOn}>BRB</Text>
          </View>
        )}
        {isDegraded && (
          <MaterialCommunityIcons
            name="shield-alert-outline"
            style={styles.degraded}
            size={25}
          />
        )}
      </View>
      {layout === LayoutParams.GRID &&
        isHLSFlow === false &&
        ((type === TrackType.SCREEN && selectAuxActionButtons.length > 1) ||
          (type === TrackType.LOCAL && selectLocalActionButtons.length > 1) ||
          (type === TrackType.REMOTE &&
            selectRemoteActionButtons.length > 1)) && (
          <TouchableOpacity
            onPress={() => setAlertModalVisible(true)}
            style={styles.optionsContainer}>
            <Entypo
              name="dots-three-horizontal"
              style={styles.options}
              size={30}
            />
          </TouchableOpacity>
        )}
      <View style={styles.peerNameContainer}>
        <Text numberOfLines={2} style={styles.peerName}>
          {peerTrackNode.track?.source === HMSTrackSource.SCREEN
            ? `${name}'s Screen`
            : peerTrackNode.peer?.isLocal
            ? `You (${name})`
            : name}
        </Text>
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
          resizeMode="contain"
        />
      </View>
      {isAudioMute && (
        <View style={styles.micContainer}>
          <Feather name="mic-off" style={styles.mic} size={20} />
        </View>
      )}
      {/* {isVideoMute && (
          <Feather name="video-off" style={styles.mic} size={20} />
        )} */}
    </View>
  ) : (
    <></>
  );
};

export {DisplayTrack};
