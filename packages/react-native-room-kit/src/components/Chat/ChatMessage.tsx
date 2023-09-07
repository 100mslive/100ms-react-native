import * as React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { HMSMessage } from '@100mslive/react-native-hms';

import { useHMSRoomStyleSheet } from '../../hooks-util';
import { getTimeStringin12HourFormat } from '../../utils/functions';

interface HMSHLSMessageProps {
  message: HMSMessage;
}

const _ChatMessage: React.FC<HMSHLSMessageProps> = ({ message }) => {
  const messageSender = message.sender;

  const hmsRoomStyles = useHMSRoomStyleSheet(
    (theme, typography) => ({
      senderName: {
        color: theme.palette.on_surface_high,
        fontFamily: `${typography.font_family}-SemiBold`,
      },
      message: {
        color: theme.palette.on_surface_high,
        fontFamily: `${typography.font_family}-Regular`,
      },
      time: {
        color: theme.palette.on_surface_medium,
        fontFamily: `${typography.font_family}-Regular`,
      },
    }),
    []
  );

  return (
    <View style={styles.container}>
      <View style={[styles.nameWrapper]}>
        <Text
          style={[styles.senderName, hmsRoomStyles.senderName]}
          numberOfLines={1}
        >
          {messageSender
            ? messageSender.isLocal
              ? 'You'
              : messageSender.name
            : 'Anonymous'}
        </Text>

        <Text style={[styles.time, hmsRoomStyles.time]}>
          {getTimeStringin12HourFormat(message.time)}
        </Text>
      </View>

      <Text style={[styles.message, hmsRoomStyles.message]}>
        {message.message}
      </Text>
    </View>
  );
};

export const ChatMessage = React.memo(_ChatMessage);

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 8,
    width: '100%',
  },
  nameWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  senderName: {
    fontSize: 14,
    lineHeight: Platform.OS === 'android' ? 20 : undefined,
    letterSpacing: 0.1,
  },
  time: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    marginLeft: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: Platform.OS === 'android' ? 20 : undefined,
    letterSpacing: 0.25,
    marginTop: 8,
  },
});
