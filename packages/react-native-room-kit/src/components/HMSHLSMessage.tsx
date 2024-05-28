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

interface HMSHLSMessageProps {
  message: HMSMessage;
}

const _HMSHLSMessage: React.FC<HMSHLSMessageProps> = ({ message }) => {
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
    (theme, typography) => ({
      regularSurfaceHigh: {
        fontFamily: `${typography.font_family}-Regular`,
        color: theme.palette.on_surface_high,
      },
      semiBoldSurfaceLow: {
        fontFamily: `${typography.font_family}-SemiBold`,
        color: theme.palette.on_surface_low,
      },
      threeDots: {
        tintColor: '#ffffff',
      },
      pinnedLabel: {
        color: '#ffffff',
      },
      link: {
        color: theme.palette.primary_bright,
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

      <View style={styles.messageWrapper}>
        <Text style={[styles.message, hmsRoomStyles.regularSurfaceHigh]}>
          <Text style={hmsRoomStyles.semiBoldSurfaceLow}>
            {messageSender
              ? messageSender.isLocal
                ? 'You'
                : messageSender.name
              : 'Anonymous'}
            {'   '}
          </Text>

          {splitLinksAndContent(message.message, {
            pressHandler: handleLinkPress,
            style: hmsRoomStyles.link,
          })}
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
    </View>
  );
};

export const HMSHLSMessage = React.memo(_HMSHLSMessage);

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    width: '100%',
  },
  messageWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  message: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: Platform.OS === 'android' ? 20 : undefined,
    letterSpacing: 0.25,
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
