import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  HMSMessage,
  HMSMessageRecipientType,
} from '@100mslive/react-native-hms';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';

import type { RootState } from '../../redux';
import { CustomButton } from '../CustomButton';
import { AvatarView } from '../AvatarView';
import { COLORS } from '../../utils/theme';
import { getTimeStringin12HourFormat } from '../../utils/functions';

interface ChatMessageProps {
  message: HMSMessage;
}

const _ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const hmsSessionStore = useSelector(
    (state: RootState) => state.user.hmsSessionStore
  );

  const pinMessage = async () => {
    // If instance of HMSSessionStore is available
    if (hmsSessionStore) {
      try {
        const formattedMessage = `${message.sender?.name || 'Anonymous'}: ${
          message.message
        }`;

        // set `formattedMessage` on `session` with key 'pinnedMessage'
        const response = await hmsSessionStore.set(
          formattedMessage,
          'pinnedMessage'
        );
        console.log('setSessionMetaData Response -> ', response);
      } catch (error) {
        console.log('setSessionMetaData Error -> ', error);
      }
    }
  };

  const messageSender = message.sender;
  const isMessageSenderLocal = messageSender?.isLocal;

  const messageRecipient = message.recipient;
  const isBroadcastMessage =
    messageRecipient.recipientType === HMSMessageRecipientType.BROADCAST;
  const isPrivatePeerMessage =
    messageRecipient.recipientType === HMSMessageRecipientType.PEER;
  const isPrivateRoleMessage =
    messageRecipient.recipientType === HMSMessageRecipientType.ROLES;

  return (
    <View
      style={[
        styles.message,
        isBroadcastMessage ? null : styles.privateMessage,
      ]}
    >
      <View
        style={[
          styles.messageHeader,
          isMessageSenderLocal ? styles.localMessageHeader : null,
        ]}
      >
        <View style={styles.headingLeftContainer}>
          <AvatarView
            userName={messageSender?.name || ''}
            style={styles.messageAvatar}
            initialsStyle={styles.messageAvatarText}
          />

          <Text
            style={styles.senderName}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {messageSender
              ? messageSender.isLocal
                ? 'You'
                : messageSender.name
              : 'Anonymous'}
          </Text>

          <Text style={styles.messageTime}>
            {getTimeStringin12HourFormat(message.time)}
          </Text>
        </View>

        {isBroadcastMessage ? (
          <CustomButton
            onPress={pinMessage}
            viewStyle={[
              styles.pinIconContainer,
              isMessageSenderLocal ? styles.localMsgPinIconContainer : null,
            ]}
            LeftIcon={
              <MaterialCommunityIcons
                style={styles.pinIcon}
                size={24}
                name="pin-outline"
              />
            }
          />
        ) : (
          <View style={styles.privateRecipientTypeContainer}>
            <Text
              style={styles.private}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {isPrivatePeerMessage
                ? `${
                    isMessageSenderLocal
                      ? 'TO ' + messageRecipient.recipientPeer?.name
                      : 'TO YOU'
                  } | PRIVATE`
                : null}
              {isPrivateRoleMessage &&
              messageRecipient.recipientRoles.length > 0
                ? messageRecipient.recipientRoles[0].name
                : null}
            </Text>
          </View>
        )}
      </View>

      <Text
        style={[
          styles.messageText,
          isMessageSenderLocal ? styles.messageTextRightAlign : null,
        ]}
        numberOfLines={3}
      >
        {message.message}
      </Text>
    </View>
  );
};

export const ChatMessage = React.memo(_ChatMessage);

const styles = StyleSheet.create({
  message: {
    padding: 8,
    borderRadius: 8,
    marginTop: 16,
    width: '100%',
  },
  privateMessage: {
    backgroundColor: COLORS.SURFACE.LIGHT,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  localMessageHeader: {
    flexDirection: 'row-reverse',
  },
  headingLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  messageAvatarText: {
    fontSize: 10,
    lineHeight: undefined,
  },
  privateRecipientTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    borderColor: COLORS.BORDER.LIGHT,
    justifyContent: 'center',
    padding: 4,
    flexShrink: 1,
    marginLeft: 8,
  },
  private: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
    color: COLORS.TEXT.HIGH_EMPHASIS,
    textTransform: 'uppercase',
  },
  senderName: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    textTransform: 'capitalize',
    marginHorizontal: 8,
  },
  messageTime: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: COLORS.SURFACE.ON_SURFACE.LOW,
  },
  messageText: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  messageTextRightAlign: {
    textAlign: 'right',
  },
  pinIcon: {
    color: COLORS.WHITE,
  },
  pinIconContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  localMsgPinIconContainer: {
    justifyContent: 'flex-start',
  },
});
