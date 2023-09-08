import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import type { HMSLocalPeer, HMSRemotePeer } from '@100mslive/react-native-hms';

import {
  useHMSInstance,
  useHMSLayoutConfig,
  useHMSRoomStyleSheet,
} from '../../hooks-util';
import { CameraIcon, MicIcon, PersonIcon } from '../../Icons';
import { ParticipantsItemOption } from './ParticipantsItemOption';
import type { RootState } from '../../redux';
import { selectCanPublishTrackForRole } from '../../hooks-sdk-selectors';
import { parseMetadata } from '../../utils/functions';

interface ParticipantsItemOptionsProps {
  insideHandRaiseGroup: boolean;
  peer: HMSLocalPeer | HMSRemotePeer;
  onItemPress(): void;
}

const _ParticipantsItemOptions: React.FC<ParticipantsItemOptionsProps> = ({
  peer,
  onItemPress,
  insideHandRaiseGroup = false,
}) => {
  const hmsInstance = useHMSInstance();

  // Local Peer Permissions related states
  const localPeerPermissions = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role?.permissions
  );

  const localPeerCanMuteTrack =
    localPeerPermissions && localPeerPermissions.mute;
  const localPeerCanUnmuteTrack =
    localPeerPermissions && localPeerPermissions.unmute;
  const localPeerCanRemove =
    localPeerPermissions && localPeerPermissions.removeOthers;

  // Selected Peer Permissions related states
  const peerCanPublishAudio = selectCanPublishTrackForRole(peer.role!, 'audio');
  const peerCanPublishVideo = selectCanPublishTrackForRole(peer.role!, 'video');

  // On Stage related states
  const onStageRoleStr = useHMSLayoutConfig(
    (layoutConfig) =>
      layoutConfig?.screens?.conferencing?.default?.elements?.on_stage_exp
        ?.on_stage_role
  );
  const onStageRole = useSelector((state: RootState) => {
    const roles = state.hmsStates.roles;
    return roles.find((role) => role.name === onStageRoleStr);
  });
  const offStageRoles = useHMSLayoutConfig((layoutConfig) => {
    return layoutConfig?.screens?.conferencing?.default?.elements?.on_stage_exp
      ?.off_stage_roles;
  });
  const offStageRoleStr =
    offStageRoles && offStageRoles.length > 0 ? offStageRoles[0] : undefined;
  const offStageRole = useSelector((state: RootState) => {
    const roles = state.hmsStates.roles;
    return roles.find((role) => role.name === offStageRoleStr);
  });

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    divider: {
      backgroundColor: theme.palette.border_bright,
    },
    removeParticipant: {
      color: theme.palette.alert_error_default,
    },
  }));

  const handleBringOnStagePress = () => {
    if (onStageRole) {
      hmsInstance
        .changeRoleOfPeer(peer, onStageRole)
        .then((d) => console.log('Bring on Stage Success: ', d))
        .catch((e) => console.log('Bring on Stage Error: ', e));
    } else {
      console.warn(`onStageRole '${onStageRoleStr}' is ${onStageRole}`);
    }
    onItemPress();
  };

  const handleAudioTogglePress = () => {
    if (peer.audioTrack) {
      hmsInstance
        .changeTrackState(peer.audioTrack, !peer.audioTrack.isMute())
        .then((d) => console.log('Toggle Video Success: ', d))
        .catch((e) => console.log('Toggle Video Error: ', e));
    }
    onItemPress();
  };

  const handleVideoTogglePress = () => {
    if (peer.videoTrack) {
      hmsInstance
        .changeTrackState(peer.videoTrack, !peer.videoTrack.isMute())
        .then((d) => console.log('Toggle Video Success: ', d))
        .catch((e) => console.log('Toggle Video Error: ', e));
    }
    onItemPress();
  };

  const handleRemoveFromStagePress = () => {
    if (offStageRole) {
      hmsInstance
        .changeRoleOfPeer(peer, offStageRole, true)
        .then((d) => console.log('Remove from Stage Success: ', d))
        .catch((e) => console.log('Remove from Stage Error: ', e));
    } else {
      console.warn(`offStageRole '${offStageRoleStr}' is ${offStageRole}`);
    }
    onItemPress();
  };

  const handleRemoveParticipantPress = () => {
    hmsInstance
      .removePeer(peer, 'removed from room')
      .then((d) => console.log('Remove Peer Success: ', d))
      .catch((e) => console.log('Remove Peer Error: ', e));
    onItemPress();
  };

  const showMuteAudioOption =
    !insideHandRaiseGroup &&
    localPeerCanMuteTrack &&
    peerCanPublishAudio &&
    peer.audioTrack?.isMute() === false;

  const showUnmuteAudioOption =
    !insideHandRaiseGroup &&
    localPeerCanUnmuteTrack &&
    peerCanPublishAudio &&
    peer.audioTrack?.isMute();

  const showMuteVideoOption =
    !insideHandRaiseGroup &&
    localPeerCanMuteTrack &&
    peerCanPublishVideo &&
    peer.videoTrack?.isMute() === false;

  const showUnmuteVideoOption =
    !insideHandRaiseGroup &&
    localPeerCanUnmuteTrack &&
    peerCanPublishVideo &&
    peer.videoTrack?.isMute();

  const showBringOnStageOptions =
    insideHandRaiseGroup &&
    offStageRoles &&
    offStageRoles.includes(peer.role?.name || '') &&
    parseMetadata(peer.metadata).isHandRaised;

  return (
    <>
      {[
        {
          id: 'bring-on-stage',
          icon: (
            <PersonIcon type="rectangle" style={{ width: 20, height: 20 }} />
          ),
          label: 'Bring on Stage',
          pressHandler: handleBringOnStagePress,
          isActive: false,
          hide: !showBringOnStageOptions,
        },
        {
          id: 'mute-audio',
          icon: <MicIcon muted={true} style={{ width: 20, height: 20 }} />,
          label: 'Mute Audio',
          pressHandler: handleAudioTogglePress,
          isActive: false,
          hide: !showMuteAudioOption,
        },
        {
          id: 'unmute-audio',
          icon: <MicIcon muted={false} style={{ width: 20, height: 20 }} />,
          label: 'Unmute Audio',
          pressHandler: handleAudioTogglePress,
          isActive: false,
          hide: !showUnmuteAudioOption,
        },
        {
          id: 'mute-video',
          icon: <CameraIcon muted={true} style={{ width: 20, height: 20 }} />,
          label: 'Mute Video',
          pressHandler: handleVideoTogglePress,
          isActive: false,
          hide: !showMuteVideoOption,
        },
        {
          id: 'unmute-video',
          icon: <CameraIcon muted={false} style={{ width: 20, height: 20 }} />,
          label: 'Unmute Video',
          pressHandler: handleVideoTogglePress,
          isActive: false,
          hide: !showUnmuteVideoOption,
        },
        {
          id: 'remove-from-stage',
          icon: (
            <PersonIcon type="rectangle" style={{ width: 20, height: 20 }} />
          ),
          label: 'Remove from Stage',
          pressHandler: handleRemoveFromStagePress,
          isActive: false,
          hide: Boolean(!onStageRoleStr || peer.role?.name !== onStageRoleStr),
        },
        {
          id: 'remove-participant',
          icon: <PersonIcon type="left" style={{ width: 20, height: 20 }} />,
          label: 'Remove Participant',
          pressHandler: handleRemoveParticipantPress,
          style: null,
          labelStyle: hmsRoomStyles.removeParticipant,
          isActive: false,
          hide: !localPeerCanRemove,
        },
      ]
        .filter((item) => !item.hide)
        .map((item, idx) => {
          const isFirst = idx === 0;

          return (
            <React.Fragment key={item.id}>
              {isFirst ? null : (
                <View style={[styles.divider, hmsRoomStyles.divider]} />
              )}

              <ParticipantsItemOption
                label={item.label}
                onPress={item.pressHandler}
                icon={item.icon}
                style={item.style}
                labelStyle={item.labelStyle}
              />
            </React.Fragment>
          );
        })}
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});

export const ParticipantsItemOptions = React.memo(_ParticipantsItemOptions);
