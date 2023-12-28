import * as React from 'react';
import Modal from 'react-native-modal';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  HMSLocalAudioTrack,
  HMSLocalVideoTrack,
  HMSTrackType,
} from '@100mslive/react-native-hms';

import type { RootState } from '../redux';
import {
  useHMSInstance,
  useHMSRoomColorPalette,
  useHMSRoomStyleSheet,
} from '../hooks-util';
import { setRoleChangeRequest } from '../redux/actions';
import { useHMSActions } from '../hooks-sdk';
import { parseMetadata } from '../utils/functions';
import { NotificationTypes } from '../types';
import { Header } from './Header';
import { selectCanPublishTrackForRole } from '../hooks-sdk-selectors';
import { HMSPrimaryButton } from './HMSPrimaryButton';
import { CameraIcon, MicIcon, RotateCameraIcon } from '../Icons';
import { PressableIcon } from './PressableIcon';
import { AvatarView } from './PeerVideoTile/AvatarView';
import { HMSVideoView } from './HMSVideoView';
import {
  selectIsHLSViewer,
  selectLayoutConfigForRole,
} from '../hooks-util-selectors';

const _PreviewForRoleChangeModal = () => {
  const dispatch = useDispatch();
  const hmsInstance = useHMSInstance();
  const hmsActions = useHMSActions();
  const roleChangeRequest = useSelector(
    (state: RootState) => state.hmsStates.roleChangeRequest
  );
  const localPeerName = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.name || ''
  );
  const localPeerRoleName = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role?.name
  );
  const localPeerMetadata = useSelector(
    (state: RootState) => parseMetadata(state.hmsStates.localPeer?.metadata),
    shallowEqual
  );
  const becomeHLSViewer = useSelector((state: RootState) => {
    const layoutConfig = selectLayoutConfigForRole(
      state.hmsStates.layoutConfig,
      roleChangeRequest?.suggestedRole || null
    );
    return selectIsHLSViewer(roleChangeRequest?.suggestedRole, layoutConfig);
  });

  const [localVideoTrack, setLocalVideoTrack] =
    React.useState<HMSLocalVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    React.useState<HMSLocalAudioTrack | null>(null);

  const [isLocalAudioMuted, setIsLocalAudioMuted] = React.useState<
    boolean | undefined
  >();
  const [isLocalVideoMuted, setIsLocalVideoMuted] = React.useState<
    boolean | undefined
  >();

  const { background_dim: backgroundDimColor } = useHMSRoomColorPalette();

  const hmsRoomStyles = useHMSRoomStyleSheet(
    (theme, typography) => ({
      container: {
        backgroundColor: theme.palette.background_dim,
      },
      footer: {
        backgroundColor: theme.palette.background_default,
      },
      heading: {
        color: theme.palette.on_surface_high,
        fontFamily: `${typography.font_family}-SemiBold`,
      },
      subheading: {
        color: theme.palette.on_surface_medium,
        fontFamily: `${typography.font_family}-Regular`,
      },
      cameraRotation: {
        tintColor: isLocalVideoMuted
          ? theme.palette.on_surface_low
          : theme.palette.on_surface_high,
      },
      pressableIcon: {
        borderColor: theme.palette.border_bright,
      },
      activePressableIcon: {
        backgroundColor: theme.palette.surface_brighter,
        borderColor: theme.palette.surface_brighter,
      },
      declineButton: {
        borderColor: theme.palette.secondary_default,
      },
      declineButtonText: {
        color: theme.palette.on_surface_high,
        fontFamily: `${typography.font_family}-SemiBold`,
      },
    }),
    [isLocalVideoMuted]
  );

  const onModalShow = async () => {
    if (
      roleChangeRequest &&
      roleChangeRequest.suggestedRole &&
      roleChangeRequest.suggestedRole.name
    ) {
      // get preview tracks
      const previewForRoleTracks = await hmsInstance.previewForRole(
        roleChangeRequest.suggestedRole.name
      );

      const localVideoTrack = previewForRoleTracks.find(
        (track: HMSLocalVideoTrack | HMSLocalAudioTrack) =>
          track.type === HMSTrackType.VIDEO
      ) as HMSLocalVideoTrack;
      if (localVideoTrack) {
        localVideoTrack.setMute(false);
        setLocalVideoTrack(localVideoTrack);
        setIsLocalVideoMuted(false);
      }

      const localAudioTrack = previewForRoleTracks.find(
        (track: HMSLocalVideoTrack | HMSLocalAudioTrack) =>
          track.type === HMSTrackType.AUDIO
      ) as HMSLocalAudioTrack;
      if (localAudioTrack) {
        localAudioTrack.setMute(false);
        setLocalAudioTrack(localAudioTrack);
        setIsLocalAudioMuted(false);
      }

      // lower hand
      await hmsActions.lowerLocalPeerHand();
    }
  };

  const handleRequestAccept = async () => {
    dispatch(setRoleChangeRequest(null));
    // saving current role in peer metadata,
    // so that when peer is removed from stage, we can assign previous role to it.
    if (localPeerRoleName) {
      const newMetadata = {
        ...localPeerMetadata,
        prevRole: localPeerRoleName,
      };
      await hmsActions.changeMetadata(newMetadata);
    }
    await hmsInstance.acceptRoleChange();
  };

  const handleRequestDecline = async () => {
    await hmsInstance.cancelPreview();
    if (roleChangeRequest?.requestedBy) {
      await hmsInstance.sendDirectMessage(
        '',
        roleChangeRequest.requestedBy,
        NotificationTypes.ROLE_CHANGE_DECLINED
      );
    }
    dispatch(setRoleChangeRequest(null));
  };

  const handleAudioMuteTogglePress = async () => {
    if (!localAudioTrack) {
      return;
    }
    const enable = !isLocalAudioMuted;
    try {
      setIsLocalAudioMuted(enable);
      localAudioTrack.setMute(enable);
    } catch (error) {
      setIsLocalAudioMuted(!enable);
      return Promise.reject(error);
    }
  };

  const handleVideoMuteTogglePress = async () => {
    if (!localVideoTrack) {
      return;
    }
    const enable = !isLocalVideoMuted;
    try {
      setIsLocalVideoMuted(enable);
      localVideoTrack.setMute(enable);
    } catch (error) {
      setIsLocalVideoMuted(!enable);
      return Promise.reject(error);
    }
  };

  const handleSwitchCameraPress = async () => {
    if (isLocalVideoMuted) {
      return;
    }
    if (!localVideoTrack) {
      return;
    }
    localVideoTrack.switchCamera();
  };

  const canPublishAudio = selectCanPublishTrackForRole(
    roleChangeRequest?.suggestedRole,
    'audio'
  );
  const canPublishVideo = selectCanPublishTrackForRole(
    roleChangeRequest?.suggestedRole,
    'video'
  );

  const heading = becomeHLSViewer
    ? "You're invited to view the live stream"
    : "You're invited to join the stage";
  const subheading = getSubheading(canPublishAudio, canPublishVideo);

  return (
    <Modal
      isVisible={roleChangeRequest !== null}
      animationIn={'fadeInUp'}
      animationInTiming={100}
      animationOutTiming={100}
      animationOut={'fadeOutDown'}
      backdropColor={backgroundDimColor}
      backdropOpacity={0.3}
      onBackButtonPress={handleRequestDecline}
      onBackdropPress={handleRequestDecline}
      onModalShow={onModalShow}
      useNativeDriver={true}
      useNativeDriverForBackdrop={true}
      hideModalContentWhileAnimating={true}
      style={styles.modal}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={[styles.container, hmsRoomStyles.container]}>
        <View style={[styles.container, hmsRoomStyles.container]}>
          <AvatarView
            name={localPeerName}
            avatarStyles={styles.avatar}
            videoView={
              localVideoTrack &&
              localVideoTrack.trackId &&
              !isLocalVideoMuted ? (
                // && localVideoTrack.isMute() === false // can't rely on `isMute()` result, because we are not receiving ON_TRACK_UPDATES for `previewForRole` tracks
                <HMSVideoView trackId={localVideoTrack.trackId} />
              ) : null
            }
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Header showControls={false} transparent={true} />
        </View>

        {/* Footer */}
        <View style={styles.footerWrapper}>
          <View style={[styles.footer, hmsRoomStyles.footer]}>
            <Text style={[styles.heading, hmsRoomStyles.heading]}>
              {heading}
            </Text>

            {subheading ? (
              <Text style={[styles.subheading, hmsRoomStyles.subheading]}>
                {subheading}
              </Text>
            ) : null}

            {canPublishAudio || canPublishVideo ? (
              <View style={styles.micAndCameraControls}>
                {/* Toggle Audio Mute Status */}
                {canPublishAudio && localAudioTrack ? (
                  <PressableIcon
                    onPress={handleAudioMuteTogglePress}
                    active={isLocalAudioMuted}
                    style={[
                      styles.pressableIcon,
                      hmsRoomStyles.pressableIcon,
                      !!isLocalAudioMuted
                        ? hmsRoomStyles.activePressableIcon
                        : null,
                    ]}
                  >
                    <MicIcon muted={!!isLocalAudioMuted} />
                  </PressableIcon>
                ) : null}

                {canPublishVideo && localVideoTrack ? (
                  <>
                    {/* Toggle Video Mute Status */}
                    <View style={styles.manageLocalVideoWrapper}>
                      <PressableIcon
                        onPress={handleVideoMuteTogglePress}
                        active={isLocalVideoMuted}
                        style={[
                          styles.pressableIcon,
                          hmsRoomStyles.pressableIcon,
                          !!isLocalVideoMuted
                            ? hmsRoomStyles.activePressableIcon
                            : null,
                        ]}
                      >
                        <CameraIcon muted={!!isLocalVideoMuted} />
                      </PressableIcon>
                    </View>

                    {/* Manage Camera Rotation */}
                    <PressableIcon
                      onPress={handleSwitchCameraPress}
                      disabled={isLocalVideoMuted}
                      style={[
                        styles.pressableIcon,
                        hmsRoomStyles.pressableIcon,
                      ]}
                    >
                      <RotateCameraIcon style={hmsRoomStyles.cameraRotation} />
                    </PressableIcon>
                  </>
                ) : null}
              </View>
            ) : null}

            <HMSPrimaryButton
              loading={false}
              onPress={handleRequestAccept}
              title="Join Now"
              style={styles.joinButton}
            />

            <TouchableOpacity
              style={[styles.declineButton, hmsRoomStyles.declineButton]}
              onPress={handleRequestDecline}
            >
              <Text
                style={[
                  styles.declineButtonText,
                  hmsRoomStyles.declineButtonText,
                ]}
              >
                Decline
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const PreviewForRoleChangeModal = React.memo(_PreviewForRoleChangeModal);

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    position: 'absolute',
    width: '100%',
  },
  micAndCameraControls: {
    flexDirection: 'row',
  },
  manageLocalVideoWrapper: {
    marginHorizontal: 16,
  },
  footerWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 30,
  },
  footer: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  heading: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.15,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    marginBottom: 24,
  },
  pressableIcon: {
    backgroundColor: undefined,
    borderWidth: 1,
  },
  avatar: {
    marginBottom: 200,
  },
  joinButton: {
    marginTop: 16,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
  },
  declineButtonText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

const getSubheading = (canPublishAudio: boolean, canPublishVideo: boolean) => {
  if (canPublishAudio && canPublishVideo) {
    return 'Setup your audio and video before joining';
  }

  if (canPublishAudio) {
    return 'Setup your audio before joining';
  }

  if (canPublishVideo) {
    return 'Setup your video before joining';
  }

  return '';
};
