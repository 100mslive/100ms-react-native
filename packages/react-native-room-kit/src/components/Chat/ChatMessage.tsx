import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { HMSMessage } from '@100mslive/react-native-hms';

import {
  useAllowBlockingPeerFromChat,
  useAllowPinningMessage,
  useHMSRoomStyleSheet,
} from '../../hooks-util';
import {
  getTimeStringin12HourFormat,
  splitLinksAndContent,
} from '../../utils/functions';
import { PinIcon, ThreeDotsIcon } from '../../Icons';
import type { RootState } from '../../redux';
import { setSelectedMessageForAction } from '../../redux/actions';

interface HMSHLSMessageProps {
  message: HMSMessage;
}

const _ChatMessage: React.FC<HMSHLSMessageProps> = ({ message }) => {
  const dispatch = useDispatch();
  const isPinned = useSelector(
    (state: RootState) =>
      state.messages.pinnedMessages.findIndex(
        (pinnedMessage) => pinnedMessage.id === message.messageId
      ) >= 0
  );
  const localPeerId = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.peerID
  );

  const allowPinningMessage = useAllowPinningMessage();
  const allowPeerBlocking = useAllowBlockingPeerFromChat();
  const canRemoveOthers = useSelector(
    (state: RootState) =>
      !!state.hmsStates.localPeer?.role?.permissions?.removeOthers
  );

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
        color: theme.palette.on_surface_low,
        fontFamily: `${typography.font_family}-Regular`,
      },
      threeDots: {
        tintColor: theme.palette.on_surface_low,
      },
      pinnedLabel: {
        color: theme.palette.on_surface_low,
        fontFamily: `${typography.font_family}-SemiBold`,
      },
      link: {
        color: theme.palette.primary_bright,
      },
    }),
    []
  );

  const onThreeDotsPress = () => {
    dispatch(setSelectedMessageForAction(message));
  };

  const messageSender = message.sender;

  const canTakeAction =
    allowPinningMessage || // can pin message, OR
    (allowPeerBlocking &&
      message.sender &&
      message.sender.peerID !== localPeerId) || // can block peers, OR
    (canRemoveOthers &&
      message.sender &&
      message.sender.peerID !== localPeerId); // can remove participants

  const handleLinkPress = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      {isPinned ? (
        <View style={styles.pinLabelContainer}>
          <PinIcon
            type="pin"
            style={[styles.pinIcon, hmsRoomStyles.threeDots]}
          />
          <Text style={[styles.pinnedLabel, hmsRoomStyles.pinnedLabel]}>
            PINNED
          </Text>
        </View>
      ) : null}

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

        {canTakeAction ? (
          <TouchableOpacity
            hitSlop={styles.threeDotsHitSlop}
            onPress={onThreeDotsPress}
          >
            <ThreeDotsIcon
              stack="vertical"
              style={[styles.threeDots, hmsRoomStyles.threeDots]}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={[styles.message, hmsRoomStyles.message]}>
        {splitLinksAndContent(message.message, {
          pressHandler: handleLinkPress,
          style: hmsRoomStyles.link,
        })}
      </Text>
    </View>
  );
};

export const ChatMessage = React.memo(_ChatMessage);

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    padding: 8,
    width: '100%',
  },
  nameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderName: {
    flexGrow: 1,
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
    marginTop: 4,
  },
  threeDots: {
    width: 20,
    height: 20,
    marginLeft: 4,
  },
  threeDotsHitSlop: {
    left: 12,
    right: 12,
    top: 12,
    bottom: 12,
  },
  pinLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pinIcon: {
    width: 12,
    height: 12,
    marginRight: 4,
  },
  pinnedLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    lineHeight: 16,
    letterSpacing: 1.5,
  },
});
