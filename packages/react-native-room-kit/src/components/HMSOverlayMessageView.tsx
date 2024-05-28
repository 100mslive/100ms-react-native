import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Linking,
} from 'react-native';
import type { HMSMessage } from '@100mslive/react-native-hms';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import {
  useAllowBlockingPeerFromChat,
  useAllowPinningMessage,
  useHMSRoomStyleSheet,
  useModalType,
} from '../hooks-util';
import { PinIcon, ThreeDotsIcon } from '../Icons';
import { setSelectedMessageForAction } from '../redux/actions';
import { ModalTypes } from '../utils/types';
import type { RootState } from '../redux';
import { splitLinksAndContent } from '../utils/functions';

interface HMSMessageProps {
  message: HMSMessage;
}

const _HMSOverlayMessageView: React.FC<HMSMessageProps> = ({ message }) => {
  const dispatch = useDispatch();
  const { handleModalVisibleType } = useModalType();
  const localPeerId = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.peerID
  );

  const allowPinningMessage = useAllowPinningMessage();
  const allowPeerBlocking = useAllowBlockingPeerFromChat();
  const canRemoveOthers = useSelector(
    (state: RootState) =>
      !!state.hmsStates.localPeer?.role?.permissions?.removeOthers
  );

  const isPinned = useSelector(
    (state: RootState) =>
      state.messages.pinnedMessages.findIndex(
        (pinnedMessage) => pinnedMessage.id === message.messageId
      ) >= 0
  );

  const messageSender = message.sender;

  const hmsRoomStyles = useHMSRoomStyleSheet(
    (_theme, typography) => ({
      senderName: {
        color: '#ffffff',
        fontFamily: `${typography.font_family}-SemiBold`,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
      },
      message: {
        color: '#ffffff',
        fontFamily: `${typography.font_family}-Regular`,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
      },
      threeDots: {
        tintColor: '#ffffff',
      },
      pinnedLabel: {
        color: '#ffffff',
      },
      link: {
        color: _theme.palette.primary_bright,
      },
    }),
    []
  );

  const onThreeDotsPress = () => {
    dispatch(setSelectedMessageForAction(message));
    handleModalVisibleType(ModalTypes.MESSAGE_OPTIONS);
  };

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

      <View style={styles.nameWrapper}>
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

        {canTakeAction ? (
          <GestureDetector gesture={Gesture.Tap()}>
            <TouchableOpacity
              hitSlop={styles.threeDotsHitSlop}
              onPress={onThreeDotsPress}
            >
              <ThreeDotsIcon
                stack="vertical"
                style={[styles.threeDots, hmsRoomStyles.threeDots]}
              />
            </TouchableOpacity>
          </GestureDetector>
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

export const HMSOverlayMessageView = React.memo(_HMSOverlayMessageView);

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
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
    textShadowOffset: { height: 1, width: 1 },
    textShadowRadius: 2,
  },
  message: {
    fontSize: 14,
    lineHeight: Platform.OS === 'android' ? 20 : undefined,
    letterSpacing: 0.25,
    marginTop: 2,
    textShadowOffset: { height: 0.5, width: 0.5 },
    textShadowRadius: 2,
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
