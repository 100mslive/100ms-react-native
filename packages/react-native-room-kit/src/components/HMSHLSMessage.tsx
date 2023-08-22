import * as React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { HMSMessage } from '@100mslive/react-native-hms';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { hexToRgbA } from '../utils/theme';

interface HMSHLSMessageProps {
  message: HMSMessage;
}

const _HMSHLSMessage: React.FC<HMSHLSMessageProps> = ({ message }) => {
  const messageSender = message.sender;
  const isMessageSenderLocal = !!messageSender?.isLocal;

  const hmsRoomStyles = useHMSRoomStyleSheet((_theme, typography) => ({
    senderName: {
      color: '#ffffff',
      fontFamily: `${typography.font_family}-SemiBold`,
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
    },
    message: {
      color: '#ffffff',
      fontFamily: `${typography.font_family}-Regular`,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
    },
  }), []);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.senderName,
          hmsRoomStyles.senderName,
          isMessageSenderLocal ? styles.textAlignRight : null,
        ]}
        numberOfLines={1}
      >
        {messageSender
          ? messageSender.isLocal
            ? 'You'
            : messageSender.name
          : 'Anonymous'}
      </Text>

      <Text
        style={[
          styles.message,
          hmsRoomStyles.message,
          isMessageSenderLocal ? styles.textAlignRight : null,
        ]}
      >
        {message.message}
      </Text>
    </View>
  );
};

export const HMSHLSMessage = React.memo(_HMSHLSMessage);

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    width: '100%',
  },
  senderName: {
    fontSize: 14,
    lineHeight: Platform.OS === 'android' ? 20 : undefined,
    letterSpacing: 0.10,
    textShadowOffset: { height: 2, width: 2 },
    textShadowRadius: 3,
  },
  message: {
    fontSize: 14,
    lineHeight: Platform.OS === 'android' ? 20 : undefined,
    letterSpacing: 0.25,
    marginTop: 2,
  },
  textAlignRight: {
    textAlign: 'right',
  },
});
