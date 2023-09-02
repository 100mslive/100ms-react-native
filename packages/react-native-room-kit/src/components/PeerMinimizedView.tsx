import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CameraIcon, MaximizeIcon, MicIcon } from '../Icons';
import { PressableIcon } from './PressableIcon';
import { useCanPublishAudio, useCanPublishVideo } from '../hooks-sdk';
import type { PeerTrackNode } from '../utils/types';
import { selectCanPublishTrackForRole } from '../hooks-sdk-selectors';
import { useHMSRoomStyleSheet } from '../hooks-util';

export const usePeerMinimizedViewDimensions = () => {
  const canPublishAudio = useCanPublishAudio();
  const canPublishVideo = useCanPublishVideo();

  const iconTakesSpace = 20 + 6; // Width + Right Margin
  const totalWidth = 128;
  const widthLessIconsWidth = totalWidth - 2 * iconTakesSpace;

  return {
    width:
      widthLessIconsWidth +
      (canPublishAudio ? iconTakesSpace : 0) +
      (canPublishVideo ? iconTakesSpace : 0),
    height: 36,
  };
};

export interface PeerMinimizedViewProps {
  peerTrackNode: PeerTrackNode;
  onMaximizePress(): void;
}

const _PeerMinimizedView: React.FC<PeerMinimizedViewProps> = ({
  peerTrackNode,
  onMaximizePress,
}) => {
  const peerCanPublishAudio = selectCanPublishTrackForRole(
    peerTrackNode.peer.role,
    'audio'
  );
  const peerCanPublishVideo = selectCanPublishTrackForRole(
    peerTrackNode.peer.role,
    'video'
  );

  const isAudioMuted = peerTrackNode.peer.audioTrack?.isMute();
  const isVideoMuted = peerTrackNode.track?.isMute();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      backgroundColor: theme.palette.surface_default,
    },
    iconWrapper: {
      backgroundColor: theme.palette.surface_bright,
    },
    name: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  return (
    <View style={[styles.container, hmsRoomStyles.container]}>
      <View style={styles.wrapper}>
        {peerCanPublishAudio ? (
          <View style={[styles.iconWrapper, hmsRoomStyles.iconWrapper]}>
            <MicIcon muted={!!isAudioMuted} style={styles.icon} />
          </View>
        ) : null}

        {peerCanPublishVideo ? (
          <View style={[styles.iconWrapper, hmsRoomStyles.iconWrapper]}>
            <CameraIcon muted={!!isVideoMuted} style={styles.icon} />
          </View>
        ) : null}

        <Text style={[styles.name, hmsRoomStyles.name]} numberOfLines={1}>
          {peerTrackNode.peer.isLocal ? 'You' : peerTrackNode.peer.name}
        </Text>
      </View>

      <PressableIcon
        border={false}
        style={styles.maximizeBtn}
        onPress={onMaximizePress}
      >
        <MaximizeIcon style={styles.maximizeIcon} />
      </PressableIcon>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    padding: 2,
    marginRight: 6,
    borderRadius: 4,
  },
  icon: {
    width: 16,
    height: 16,
  },
  name: {
    maxWidth: 48,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    marginRight: 12,
  },
  maximizeBtn: {
    padding: 0,
  },
  maximizeIcon: {
    width: 20,
    height: 20,
  },
});

export const PeerMinimizedView = React.memo(_PeerMinimizedView);
