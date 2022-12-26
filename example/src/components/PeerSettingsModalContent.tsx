import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {HMSLocalPeer, HMSPeer, HMSTrack} from '@100mslive/react-native-hms';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import type {RootState} from '../redux';
import {COLORS} from '../utils/theme';
import {PeerTrackNode} from '../utils/types';

interface PeerSettingsModalContentProps {
  localPeer: HMSLocalPeer;
  peerTrackNode: PeerTrackNode;
  cancelModal(): void;
  onChangeNamePress(peer: HMSPeer): void;
  onChangeRolePress(peer: HMSPeer): void;
  onSetVolumePress(peer: HMSPeer): void;
  onStreamingQualityPress(track: HMSTrack): void;
}

export const PeerSettingsModalContent: React.FC<
  PeerSettingsModalContentProps
> = ({
  localPeer,
  peerTrackNode,
  cancelModal,
  onChangeNamePress,
  onChangeRolePress,
  onSetVolumePress,
  onStreamingQualityPress,
}) => {
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);

  const removePeer = () => {
    hmsInstance
      ?.removePeer(peerTrackNode.peer, 'removed from room')
      .then(d => console.log('Remove Peer Success: ', d))
      .catch(e => console.log('Remove Peer Error: ', e));

    cancelModal();
  };

  const toggleMuteAudio = () => {
    cancelModal();

    if (peerTrackNode.peer.isLocal) return;

    hmsInstance?.changeTrackState(
      peerTrackNode.peer.audioTrack!!,
      !peerTrackNode.peer.audioTrack!!.isMute(),
    );
  };

  const toggleMuteVideo = () => {
    cancelModal();

    if (peerTrackNode.peer.isLocal) return;

    hmsInstance?.changeTrackState(
      peerTrackNode.peer.videoTrack!!,
      !peerTrackNode.peer.videoTrack!!.isMute(),
    );
  };

  const {peer} = peerTrackNode;

  const localPeerPermissions = localPeer.role?.permissions;

  const isPeerAudioMute = peer.isLocal ? null : peer.audioTrack?.isMute();
  const isPeerVideoMute = peer.isLocal ? null : peer.videoTrack?.isMute();

  return (
    <View style={styles.container}>
      <Text style={styles.roleChangeModalHeading}>
        {peer.name}
        {peer.isLocal ? ' (You)' : ''}
      </Text>
      <Text style={styles.participantRole}>{peer.role?.name}</Text>

      <View style={styles.contentContainer}>
        {!peer.isLocal ? (
          <SettingItem
            text={isPeerAudioMute ? 'Request Audio Unmute' : 'Mute Audio'}
            IconType={Ionicons}
            iconName={isPeerAudioMute ? 'mic-off-outline' : 'mic-outline'}
            onPress={toggleMuteAudio}
          />
        ) : null}

        {!peer.isLocal ? (
          <SettingItem
            text={isPeerVideoMute ? 'Request Video Unmute' : 'Mute Video'}
            IconType={MaterialCommunityIcons}
            iconName={isPeerVideoMute ? 'video-off-outline' : 'video-outline'}
            onPress={toggleMuteVideo}
          />
        ) : null}

        {!peer.isLocal && localPeerPermissions?.removeOthers ? (
          <SettingItem
            text="Remove Peer"
            IconType={Ionicons}
            iconName={'person-remove-outline'}
            onPress={removePeer}
          />
        ) : null}

        {peer.isLocal ? (
          <SettingItem
            text="Change Name"
            IconType={MaterialCommunityIcons}
            iconName={'account-edit-outline'}
            onPress={() => onChangeNamePress(peer)}
          />
        ) : null}

        {localPeerPermissions?.changeRole ? (
          <SettingItem
            text="Change Role"
            IconType={Ionicons}
            iconName={'people-outline'}
            onPress={() => onChangeRolePress(peer)}
          />
        ) : null}

        {!peer.isLocal ? (
          <SettingItem
            text="Set Volume"
            IconType={Ionicons}
            iconName={'volume-high-outline'}
            onPress={() => onSetVolumePress(peer)}
          />
        ) : null}

        {!peer.isLocal ? (
          <SettingItem
            text="Streaming Quality"
            IconType={Ionicons}
            iconName={'layers-outline'}
            onPress={() =>
              peerTrackNode.track
                ? onStreamingQualityPress(peerTrackNode.track)
                : null
            }
          />
        ) : null}
      </View>
    </View>
  );
};

interface SettingItemProps {
  onPress(): void;
  text: string;
  iconName: string;
  IconType: any;
}

const SettingItem: React.FC<SettingItemProps> = ({
  onPress,
  text,
  iconName,
  IconType,
}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <IconType name={iconName} size={24} style={styles.icon} />

      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  contentContainer: {
    marginTop: 16,
  },
  roleChangeModalHeading: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  participantRole: {
    color: COLORS.TEXT.MEDIUM_EMPHASIS,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
    textTransform: 'capitalize',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  text: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 24,
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
  icon: {
    color: COLORS.WHITE,
    marginRight: 12,
  },
});
