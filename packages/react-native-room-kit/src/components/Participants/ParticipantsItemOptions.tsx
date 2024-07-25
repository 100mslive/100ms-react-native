import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { HMSLocalPeer, HMSPeer } from '@100mslive/react-native-hms';
import { HMSPeerType } from '@100mslive/react-native-hms';

import {
  useHMSInstance,
  useHMSLayoutConfig,
  useHMSRoomStyleSheet,
  useModalType,
} from '../../hooks-util';
import { CameraIcon, HandIcon, MicIcon, PersonIcon } from '../../Icons';
import { ParticipantsItemOption } from './ParticipantsItemOption';
import type { RootState } from '../../redux';
import { selectCanPublishTrackForRole } from '../../hooks-sdk-selectors';
import { parseMetadata } from '../../utils/functions';
import { ModalTypes } from '../../utils/types';
import { setPeerToUpdate } from '../../redux/actions';

interface ParticipantsItemOptionsProps {
  insideHandRaiseGroup: boolean;
  peer: HMSLocalPeer | HMSPeer;
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

  const roles = useSelector((state: RootState) => state.hmsStates.roles);

  const localPeerCanMuteTrack =
    localPeerPermissions && localPeerPermissions.mute;
  const localPeerCanUnmuteTrack =
    localPeerPermissions && localPeerPermissions.unmute;
  const localPeerCanRemove =
    localPeerPermissions && localPeerPermissions.removeOthers;
  const localPeerCanChangeRole =
    localPeerPermissions && localPeerPermissions.changeRole && roles.length > 1;

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
  const firstOffStageRoleStr =
    offStageRoles && offStageRoles.length > 0 ? offStageRoles[0] : undefined;
  const prevRoleStr = parseMetadata(peer.metadata).prevRole;

  const offStageRole = useSelector((state: RootState) => {
    const roles = state.hmsStates.roles;
    const offStageRoleStr = prevRoleStr || firstOffStageRoleStr;
    return roles.find((role) => role.name === offStageRoleStr);
  });

  const skipPreviewForRoleChange = useHMSLayoutConfig(
    (layoutConfig) =>
      layoutConfig?.screens?.conferencing?.default?.elements?.on_stage_exp
        ?.skip_preview_for_role_change
  );

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
        .changeRoleOfPeer(peer, onStageRole, skipPreviewForRoleChange || false)
        .then((d) => console.log('Bring on Stage Success: ', d))
        .catch((e) => console.log('Bring on Stage Error: ', e));
    } else {
      console.warn(`onStageRole '${onStageRoleStr}' is ${onStageRole}`);
    }
    onItemPress();
  };

  const handleLowerHandPress = () => {
    if (peer.isHandRaised) {
      hmsInstance
        .lowerRemotePeerHand(peer)
        .then((d) => console.log('Lower Remote Peer hand Success: ', d))
        .catch((e) => console.log('Lower Remote Peer hand Error: ', e));
    } else {
      console.warn(
        `peer.isHandRaised = ${peer.isHandRaised} | peer's hand is not raised`
      );
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
      console.warn(
        `offStageRole '${
          prevRoleStr || firstOffStageRoleStr
        }' is ${offStageRole}`
      );
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

  const { handleModalVisibleType: setModalVisible } = useModalType();

  const dispatch = useDispatch();

  const handleChangeRolePress = () => {
    setModalVisible(ModalTypes.CHANGE_ROLE, true);
    dispatch(setPeerToUpdate(peer));
    onItemPress();
  };

  const showMuteAudioOption =
    !insideHandRaiseGroup &&
    localPeerCanMuteTrack &&
    peerCanPublishAudio &&
    peer.audioTrack?.isMute() === false &&
    peer.type === HMSPeerType.REGULAR;

  const showUnmuteAudioOption =
    !insideHandRaiseGroup &&
    localPeerCanUnmuteTrack &&
    peerCanPublishAudio &&
    peer.audioTrack?.isMute() &&
    peer.type === HMSPeerType.REGULAR;

  const showMuteVideoOption =
    !insideHandRaiseGroup &&
    localPeerCanMuteTrack &&
    peerCanPublishVideo &&
    peer.videoTrack?.isMute() === false &&
    peer.type === HMSPeerType.REGULAR;

  const showUnmuteVideoOption =
    !insideHandRaiseGroup &&
    localPeerCanUnmuteTrack &&
    peerCanPublishVideo &&
    peer.videoTrack?.isMute() &&
    peer.type === HMSPeerType.REGULAR;

  const showBringOnStageOptions =
    offStageRoles && offStageRoles.includes(peer.role?.name || '');

  const showLowerHandOption = peer.isHandRaised;

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
          id: 'lower-hand',
          icon: <HandIcon type="off" style={{ width: 20, height: 20 }} />,
          label: 'Lower Hand',
          pressHandler: handleLowerHandPress,
          isActive: false,
          hide: !showLowerHandOption,
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
          id: 'change-role',
          icon: (
            <PersonIcon type="rectangle" style={{ width: 20, height: 20 }} />
          ),
          label: 'Switch Role',
          pressHandler: handleChangeRolePress,
          isActive: false,
          hide: !localPeerCanChangeRole,
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
