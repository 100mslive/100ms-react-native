import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PersonIcon } from '../../Icons';
import { getInitials } from '../../utils/functions';
import { COLORS } from '../../utils/theme';
import type { VideoView } from './VideoView';

export interface AvatarViewProps {
  name: string;
  videoView: React.ReactElement<typeof VideoView> | null;
}

export const _AvatarView: React.FC<AvatarViewProps> = ({ name, videoView }) => {

  const showInitials = !!name && (name.length > 0);

  return (
    <View style={styles.container}>
      {videoView || (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {showInitials ? (
              <Text style={styles.avatarText}>{getInitials(name)}</Text>
            ) : (
              <PersonIcon style={styles.avatarIcon} />
            )}
          </View>
        </View>
      )}
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
