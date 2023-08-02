import * as React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { getInitials } from '../utils/functions';
import { COLORS } from '../utils/theme';

type AvatarViewProps = {
  userName: string;
  style?: StyleProp<ViewStyle>;
  initialsStyle?: StyleProp<TextStyle>;
};

export const AvatarView: React.FC<AvatarViewProps> = ({
  userName,
  style,
  initialsStyle,
}) => {
  return (
    <View
      style={[
        styles.avatar,
        userName.length === 0 ? styles.emptyAvatar : null,
        style,
      ]}
    >
      <Text style={[styles.avatarText, initialsStyle]}>
        {userName.length === 0 ? '👤' : getInitials(userName)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 88,
    aspectRatio: 1,
    backgroundColor: COLORS.EXTENDED.PURPLE,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyAvatar: {
    backgroundColor: '#C3D0E5', // TODO: use it from variable
  },
  avatarText: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 34,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 40,
    letterSpacing: 0.25,
  },
});
