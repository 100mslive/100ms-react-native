import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { PersonIcon } from '../../Icons';
import { getInitials } from '../../utils/functions';
import { COLORS } from '../../utils/theme';
import type { VideoView } from './VideoView';
import { useHMSRoomStyleSheet } from '../../hooks-util';

export interface AvatarViewProps {
  name: string;
  videoView: React.ReactElement<typeof VideoView> | null;
  avatarStyles?: StyleProp<ViewStyle>;
  avatarContainerStyles?: StyleProp<ViewStyle>;
}

export const _AvatarView: React.FC<AvatarViewProps> = ({
  name,
  videoView,
  avatarStyles,
  avatarContainerStyles,
}) => {
  const showInitials = !!name && name.length > 0;

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    avatarContainer: {
      backgroundColor: theme.palette.background_default,
    },
    avatar: {
      backgroundColor: COLORS.EXTENDED.PURPLE,
    },
    avatarText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  return (
    <View style={styles.container}>
      {videoView || (
        <View
          style={[
            styles.avatarContainer,
            hmsRoomStyles.avatarContainer,
            avatarContainerStyles,
          ]}
        >
          <View style={[styles.avatar, hmsRoomStyles.avatar, avatarStyles]}>
            {showInitials ? (
              <Text style={[styles.avatarText, hmsRoomStyles.avatarText]}>
                {getInitials(name)}
              </Text>
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
  },
  avatar: {
    width: 88,
    aspectRatio: 1,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    width: 40,
    height: 40,
  },
  avatarText: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 0.25,
  },
});

export const AvatarView = React.memo(_AvatarView);
