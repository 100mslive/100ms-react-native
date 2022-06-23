import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {HMSMessage, HMSMessageRecipientType} from '@100mslive/react-native-hms';

import {COLORS} from '../utils/theme';

export const ChatBubble = ({
  data,
  isLocal,
  name,
}: {
  data: HMSMessage;
  isLocal: boolean;
  name: string;
}) => {
  return (
    <View>
      <View style={isLocal ? styles.senderMessageBubble : styles.messageBubble}>
        <View
          style={[
            styles.textContainer,
            isLocal ? styles.sent : styles.received,
          ]}>
          <View style={styles.textSubContainer}>
            <Text style={styles.senderText}>
              {isLocal ? 'You' : data?.sender?.name ?? 'Server'}
            </Text>
            <Text style={styles.text}>
              {isLocal
                ? ` to ${name}`
                : ` to ${
                    data.recipient.recipientType ===
                    HMSMessageRecipientType.ROLES
                      ? data?.recipient?.recipientRoles &&
                        data.recipient.recipientRoles[0].name
                      : data.recipient.recipientType ===
                        HMSMessageRecipientType.PEER
                      ? 'me'
                      : 'everyone'
                  }`}
            </Text>
          </View>
          <Text style={styles.message}>{data.message}</Text>
        </View>
      </View>
      <Text style={[styles.message, isLocal && styles.data, styles.time]}>
        {data.time?.getHours() +
          '.' +
          data.time?.getMinutes() +
          '.' +
          data.time?.getSeconds()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 22,
    paddingVertical: 6,
    borderRadius: 24,
    maxWidth: '80%',
  },
  sent: {
    backgroundColor: COLORS.PRIMARY.LIGHT,
  },
  received: {
    backgroundColor: COLORS.PRIMARY.DISABLED,
  },
  textSubContainer: {
    flexDirection: 'row',
  },
  text: {
    color: COLORS.WHITE,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  data: {
    textAlign: 'right',
  },
  messageBubble: {
    flexDirection: 'row',
  },
  senderMessageBubble: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  message: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontFamily: 'Inter-Regular',
    fontSize: 20,
    paddingTop: 4,
    textAlign: 'left',
  },
  senderText: {
    textAlign: 'right',
    color: COLORS.WHITE,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  time: {
    fontSize: 12,
    color: COLORS.BLACK,
    fontFamily: 'Inter-Regular',
    paddingHorizontal: 8,
  },
});
