import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {
  HMSLocalPeer,
  HMSPeer,
  HMSTrack,
  HMSTrackSource,
} from '@100mslive/react-native-hms';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import type {RootState} from '../redux';
import {COLORS} from '../utils/theme';
import {PeerTrackNode} from '../utils/types';
import {isTileOnSpotlight} from '../utils/functions';

interface PeerSettingsModalContentProps {
  peerTrackNode: PeerTrackNode;
  cancelModal(): void;
  onChangeNamePress(peer: HMSPeer): void;
  onChangeRolePress(peer: HMSPeer): void;
  onSetVolumePress(peer: HMSPeer): void;
  onCaptureScreenShotPress(node: PeerTrackNode): void;
  onCaptureImageAtMaxSupportedResolutionPress(node: PeerTrackNode): void;
  onStreamingQualityPress(track: HMSTrack): void;
}

export const PeerSettingsModalContent: React.FC<
  PeerSettingsModalContentProps
> = ({
  peerTrackNode,
  cancelModal,
  onChangeNamePress,
  onChangeRolePress,
  onSetVolumePress,
  onCaptureScreenShotPress,
  onCaptureImageAtMaxSupportedResolutionPress,
  onStreamingQualityPress,
}) => {
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const localPeer = useSelector(
    (state: RootState) => state.hmsStates.localPeer,
  );
  const hmsSessionStore = useSelector(
    (state: RootState) => state.user.hmsSessionStore,
  );
  const spotlightTrackId = useSelector(
    (state: RootState) => state.user.spotlightTrackId,
  );

  const removePeer = () => {
    hmsInstance
      ?.removePeer(peerTrackNode.peer, 'removed from room')
      .then(d => console.log('Remove Peer Success: ', d))
      .catch(e => console.log('Remove Peer Error: ', e));

    cancelModal();
  };

  const toggleMuteAudio = () => {
    cancelModal();

    if (peerTrackNode.peer.isLocal) {
      return;
    }

    hmsInstance?.changeTrackState(
      peerTrackNode.peer.audioTrack!!,
      !peerTrackNode.peer.audioTrack!!.isMute(),
    );
  };

  const toggleMuteVideo = () => {
    cancelModal();

    if (peerTrackNode.peer.isLocal) {
      return;
    }

    hmsInstance?.changeTrackState(
      peerTrackNode.peer.videoTrack!!,
      !peerTrackNode.peer.videoTrack!!.isMute(),
    );
  };

  // Check if selected tile is "On Spotlight"
  const {onSpotlight, tileVideoTrackId, tileAudioTrackId} = isTileOnSpotlight(
    spotlightTrackId,
    {
      tileVideoTrack: peerTrackNode.track,
      peerRegularAudioTrack: peerTrackNode.peer.audioTrack,
      peerAuxTracks: peerTrackNode.peer.auxiliaryTracks,
    },
  );

  const handleSpotlightPress = async () => {
    try {
      // Close Modal
      cancelModal();

      if (!hmsSessionStore) {
        return null;
      }

      if (tileAudioTrackId || tileVideoTrackId) {
        // Toggle `spotlight` key value on Session Store
        await hmsSessionStore.set(
          onSpotlight ? null : tileAudioTrackId || tileVideoTrackId,
          'spotlight',
        );
      }
    } catch (error) {
      console.log('Add to spotlight error -> ', error);
    }
  };

  const {peer} = peerTrackNode;

  const localPeerPermissions = localPeer?.role?.permissions;

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
        <SettingItem
          text={onSpotlight ? 'Remove from Spotlight' : 'Add to Spotlight'}
          IconType={Ionicons}
          iconName={onSpotlight ? 'ios-star' : 'ios-star-outline'}
          onPress={handleSpotlightPress}
          disabled={!peerTrackNode.track?.trackId}
        />

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

        {/* Don't show Capture Screenshot option, if track is screenshare of local peer */}
        {peerTrackNode.peer.isLocal &&
        peerTrackNode.track &&
        peerTrackNode.track.source === HMSTrackSource.SCREEN ? null : (
          <SettingItem
            text="Capture Screenshot"
            IconType={MaterialCommunityIcons}
            iconName={'cellphone-screenshot'}
            onPress={() => onCaptureScreenShotPress(peerTrackNode)}
            disabled={!peerTrackNode.track || peerTrackNode.track.isMute()} // Capture Screenshot option should be disable, if track is muted or not available
          />
        )}

        {/* Local Image Capture is only available for local peer */}
        {peerTrackNode.peer.isLocal ? (
          <SettingItem
            text="Local Image Capture"
            IconType={MaterialCommunityIcons}
            iconName={'cellphone-screenshot'}
            onPress={() =>
              onCaptureImageAtMaxSupportedResolutionPress(peerTrackNode)
            }
            disabled={!peerTrackNode.track || peerTrackNode.track.isMute()} // Local Image Capture option should be disable, if track is muted or not available
          />
        ) : null}

        {/* Don't show Streaming Quality option for local peer */}
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
            disabled={!peerTrackNode.track || peerTrackNode.track.isMute()} // Streaming Quality option should be disable, if track is muted or not available
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
  disabled?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  onPress,
  text,
  iconName,
  IconType,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      style={[styles.button, disabled ? {opacity: 0.6} : null]}
      onPress={onPress}
    >
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
