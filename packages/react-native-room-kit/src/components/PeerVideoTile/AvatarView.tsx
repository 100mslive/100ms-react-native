import * as React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';

import { PersonIcon } from '../../Icons';
import type { RootState } from '../../redux';
import { getInitials } from '../../utils/functions';
import { COLORS } from '../../utils/theme';
import type { VideoView } from './VideoView';

export interface AvatarViewProps {
  videoView: React.ReactElement<typeof VideoView>;
}

export const _AvatarView: React.FC<AvatarViewProps> = ({ videoView }) => {
  const showAvatar = useSelector((state: RootState) => {
    const isLocalVideoMuted = state.hmsStates.isLocalVideoMuted;
    const localVideoTrackId = state.hmsStates.localPeer?.videoTrack?.trackId;

    // show avatar when video is muted or not available
    return isLocalVideoMuted || !localVideoTrackId;
  });

  const name = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.name
  );

  const showInitials = !!name && (name.length > 0);

  return (
    <View style={styles.container}>
      {showAvatar ? (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {showInitials ? (
              <Text style={styles.avatarText}>{getInitials(name)}</Text>
            ) : (
              <PersonIcon style={styles.avatarIcon} />
            )}
          </View>
        </View>
      ) : videoView}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.SURFACE.DEFAULT,
  },
  avatar: {
    width: 88,
    aspectRatio: 1,
    backgroundColor: COLORS.EXTENDED.PURPLE,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    width: 40,
    height: 40,
  },
  avatarText: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 34,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 40,
    letterSpacing: 0.25,
  },
});

export const AvatarView = React.memo(_AvatarView);
