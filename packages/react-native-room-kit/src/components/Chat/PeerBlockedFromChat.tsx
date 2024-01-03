import * as React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { useHMSRoomStyleSheet } from '../../hooks-util';

interface PeerBlockedFromChatProps {
  style?: StyleProp<ViewStyle>;
}

export const _PeerBlockedFromChat: React.FC<PeerBlockedFromChatProps> = ({
  style,
}) => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      backgroundColor: theme.palette.surface_default,
    },
    subtitle: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  return (
    <View style={[styles.container, hmsRoomStyles.container, style]}>
      <Text style={[styles.subtitle, hmsRoomStyles.subtitle]}>
        You've been blocked from sending messages
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    textAlign: 'center',
  },
});

export const PeerBlockedFromChat = React.memo(_PeerBlockedFromChat);
