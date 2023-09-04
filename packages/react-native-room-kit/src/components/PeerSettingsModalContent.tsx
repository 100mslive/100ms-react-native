import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  LayoutAnimation,
  InteractionManager,
} from 'react-native';
import { batch, useDispatch, useSelector } from 'react-redux';
import { HMSTrack, HMSTrackSource } from '@100mslive/react-native-hms';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import type { RootState } from '../redux';
import { COLORS } from '../utils/theme';
import { ModalTypes } from '../utils/types';
import type { PeerTrackNode } from '../utils/types';
import { isTileOnSpotlight } from '../utils/functions';
import { setInsetViewMinimized, setPeerToUpdate } from '../redux/actions';
import { useHMSRoomStyle, useModalType } from '../hooks-util';
import { MinimizeIcon, PinIcon, StarIcon } from '../Icons';
import { useCanPublishVideo } from '../hooks-sdk';
import { BottomSheet } from './BottomSheet';

interface PeerSettingsModalContentProps {
  peerTrackNode: PeerTrackNode;
  peerTrackNodesListEmpty: boolean;
  cancelModal(): void;
  onCaptureScreenShotPress(node: PeerTrackNode): void;
  onCaptureImageAtMaxSupportedResolutionPress(node: PeerTrackNode): void;
  onStreamingQualityPress(track: HMSTrack): void;
}

export const PeerSettingsModalContent: React.FC<
  PeerSettingsModalContentProps
> = ({
  peerTrackNode,
  peerTrackNodesListEmpty,
  cancelModal,
  onCaptureScreenShotPress,
  onCaptureImageAtMaxSupportedResolutionPress,
  onStreamingQualityPress,
}) => {
  const dispatch = useDispatch();
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const localPeer = useSelector(
    (state: RootState) => state.hmsStates.localPeer
  );
  const hmsSessionStore = useSelector(
    (state: RootState) => state.user.hmsSessionStore
  );
  const spotlightTrackId = useSelector(
    (state: RootState) => state.user.spotlightTrackId
  );
  const debugMode = useSelector((state: RootState) => state.user.debugMode);
  const { handleModalVisibleType: setModalVisible } = useModalType();
  const localPeerCanPublishVideo = useCanPublishVideo();

  const removePeer = () => {
    hmsInstance
      ?.removePeer(peerTrackNode.peer, 'removed from room')
      .then((d) => console.log('Remove Peer Success: ', d))
      .catch((e) => console.log('Remove Peer Error: ', e));

    cancelModal();
  };

  const toggleMuteAudio = () => {
    cancelModal();

    if (peerTrackNode.peer.isLocal) {
      return;
    }

    hmsInstance?.changeTrackState(
      peerTrackNode.peer.audioTrack!!,
      !peerTrackNode.peer.audioTrack!!.isMute()
    );
  };

  const toggleMuteVideo = () => {
    cancelModal();

    if (peerTrackNode.peer.isLocal) {
      return;
    }

    hmsInstance?.changeTrackState(
      peerTrackNode.peer.videoTrack!!,
      !peerTrackNode.peer.videoTrack!!.isMute()
    );
  };

  // const changeName = () => {
  //   batch(() => {
  //     dispatch(setPeerToUpdate(peerTrackNode.peer));
  //     setModalVisible(ModalTypes.CHANGE_NAME, true);
  //   });
  // };

  const handleMinimizeVideoPress = () => {
    cancelModal();
    InteractionManager.runAfterInteractions(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      dispatch(setInsetViewMinimized(true));
    });
  };

  const changeRole = () => {
    batch(() => {
      dispatch(setPeerToUpdate(peerTrackNode.peer));
      setModalVisible(ModalTypes.CHANGE_ROLE, true);
    });
  };

  // Check if selected tile is "On Spotlight"
  const { onSpotlight, tileVideoTrackId, tileAudioTrackId } = isTileOnSpotlight(
    spotlightTrackId,
    {
      tileVideoTrack: peerTrackNode.track,
      peerRegularAudioTrack: peerTrackNode.peer.audioTrack,
      peerAuxTracks: peerTrackNode.peer.auxiliaryTracks,
    }
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
          'spotlight'
        );
      }
    } catch (error) {
      console.log('Add to spotlight error -> ', error);
    }
  };

  const { peer } = peerTrackNode;

  const localPeerPermissions = localPeer?.role?.permissions;

  const isPeerAudioMute = peer.isLocal ? null : peer.audioTrack?.isMute();
  const isPeerVideoMute = peer.isLocal ? null : peer.videoTrack?.isMute();

  return (
    <View>
      <BottomSheet.Header
        dismissModal={cancelModal}
        heading={peer.name + (peer.isLocal ? ' (You)' : '')}
        subheading={peer.role?.name}
      />

      <BottomSheet.Divider />

      {/* Content */}
      <View style={styles.contentContainer}>
        {peer.isLocal ? ( // TODO: Remove this condition later
          <SettingItem
            customIcon={true}
            text={true ? 'Pin Tile for Myself' : 'Unpin Tile for Myself'}
            icon={<PinIcon style={styles.customIcon} />}
            disabled={true}
            onPress={() => {}}
          />
        ) : null}

        <SettingItem
          customIcon={true}
          text={
            onSpotlight
              ? 'Remove Spotlight for Everyone'
              : 'Spotlight Tile for Everyone'
          }
          icon={<StarIcon style={styles.customIcon} />}
          onPress={handleSpotlightPress}
          disabled={!peerTrackNode.track?.trackId}
        />

        {peer.isLocal && localPeerCanPublishVideo ? (
          <SettingItem
            customIcon={true}
            text={'Minimize Your Video'}
            icon={<MinimizeIcon style={styles.customIcon} />}
            onPress={handleMinimizeVideoPress}
            disabled={peerTrackNodesListEmpty}
          />
        ) : null}

        {!peer.isLocal &&
        (localPeerPermissions?.mute || localPeerPermissions?.unmute) ? (
          <>
            {/* If Peer's Audio is Muted and Local Peer has unmute Permissions */}
            {isPeerAudioMute && localPeerPermissions?.unmute ? (
              <SettingItem
                text={'Request Audio Unmute'}
                IconType={Ionicons}
                iconName={'mic-off-outline'}
                onPress={toggleMuteAudio}
              />
            ) : null}

            {/* If Peer's Audio is Unmuted and Local Peer has mute Permissions */}
            {!isPeerAudioMute && localPeerPermissions?.mute ? (
              <SettingItem
                text={'Mute Audio'}
                IconType={Ionicons}
                iconName={'mic-outline'}
                onPress={toggleMuteAudio}
              />
            ) : null}
          </>
        ) : null}

        {!peer.isLocal &&
        (localPeerPermissions?.mute || localPeerPermissions?.unmute) ? (
          <>
            {/* If Peer's Video is Muted and Local Peer has unmute Permissions */}
            {isPeerVideoMute && localPeerPermissions?.unmute ? (
              <SettingItem
                text={'Request Video Unmute'}
                IconType={MaterialCommunityIcons}
                iconName={'video-off-outline'}
                onPress={toggleMuteVideo}
              />
            ) : null}

            {/* If Peer's Video is Unmuted and Local Peer has mute Permissions */}
            {!isPeerVideoMute && localPeerPermissions?.mute ? (
              <SettingItem
                text={'Mute Video'}
                IconType={MaterialCommunityIcons}
                iconName={'video-outline'}
                onPress={toggleMuteVideo}
              />
            ) : null}
          </>
        ) : null}

        {!peer.isLocal && localPeerPermissions?.removeOthers ? (
          <SettingItem
            text="Remove Peer"
            IconType={Ionicons}
            iconName={'person-remove-outline'}
            onPress={removePeer}
          />
        ) : null}

        {/* {peer.isLocal ? (
          <SettingItem
            text="Change Name"
            IconType={MaterialCommunityIcons}
            iconName={'account-edit-outline'}
            onPress={() => changeName()}
          />
        ) : null} */}

        {debugMode && !peer.isLocal && localPeerPermissions?.changeRole ? (
          <SettingItem
            text="Change Role"
            IconType={Ionicons}
            iconName={'people-outline'}
            onPress={() => changeRole()}
          />
        ) : null}

        {/* Don't show Capture Screenshot option, if track is screenshare of local peer */}
        {!debugMode ||
        (peerTrackNode.peer.isLocal &&
          peerTrackNode.track &&
          peerTrackNode.track.source === HMSTrackSource.SCREEN) ? null : (
          <SettingItem
            text="Capture Screenshot"
            IconType={MaterialCommunityIcons}
            iconName={'cellphone-screenshot'}
            onPress={() => onCaptureScreenShotPress(peerTrackNode)}
            disabled={!peerTrackNode.track || peerTrackNode.track.isMute()} // Capture Screenshot option should be disable, if track is muted or not available
          />
        )}

        {/* Local Image Capture is only available for local peer */}
        {debugMode && peerTrackNode.peer.isLocal ? (
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
        {debugMode && !peer.isLocal ? (
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

type SettingItemBaseProps = {
  onPress(): void;
  text: string;
  disabled?: boolean;
};

type SettingItemWithCustomIconProps = {
  customIcon: true;
  icon: React.ReactElement;
};

type SettingItemWithIconProps = {
  customIcon?: false;
  iconName: string;
  IconType: any;
};

type SettingItemProps = SettingItemBaseProps &
  (SettingItemWithCustomIconProps | SettingItemWithIconProps);

const SettingItem: React.FC<SettingItemProps> = ({
  onPress,
  text,
  disabled = false,
  ...resetProps
}) => {
  const textStyles = useHMSRoomStyle((theme, typography) => ({
    color: theme.palette.on_surface_high,
    fontFamily: `${typography.font_family}-SemiBold`,
  }));

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[styles.button, disabled ? { opacity: 0.6 } : null]}
      onPress={onPress}
    >
      {resetProps.customIcon ? (
        resetProps.icon
      ) : (
        <resetProps.IconType
          name={resetProps.iconName}
          size={24}
          style={styles.icon}
        />
      )}

      <Text style={[styles.text, textStyles]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    marginBottom: 8,
  },
  customIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  icon: {
    color: COLORS.WHITE,
    marginRight: 12,
  },
});
