import * as React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';

import { useHMSRoomStyleSheet } from '../../hooks-util';

export const ChatBanner = () => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    title: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    subtitle: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/empty-chat-illustration/empty-chat.png')}
      />
      <Text style={[styles.title, hmsRoomStyles.title]}>
        Start a Conversation
      </Text>
      <Text style={[styles.subtitle, hmsRoomStyles.subtitle]}>
        There are no messages here yet. Start a conversation by sending a
        message.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // transform: [Platform.OS === 'android' ? { scale: -1 } : { scaleY: -1 }],
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.15,
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    textAlign: 'center',
    marginTop: 8,
  },
});
