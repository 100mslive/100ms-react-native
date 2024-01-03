import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  useAllowBlockingPeerFromChat,
  useAllowPinningMessage,
  useBlockPeerActions,
  useHMSMessagePinningActions,
  useHMSRoomStyle,
  useHMSRoomStyleSheet,
  useIsMessagePinned,
  useIsPeerBlocked,
} from '../../hooks-util';
import type { RootState } from '../../redux';
import { BottomSheet } from '../BottomSheet';
import { NoEntryIcon, PersonIcon, PinIcon } from '../../Icons';
import { setSelectedMessageForAction } from '../../redux/actions';

interface MessageOptionsViewProps {
  onDismiss?: () => void;
}

const _MessageOptionsView: React.FC<MessageOptionsViewProps> = ({
  onDismiss,
}) => {
  const dispatch = useDispatch();

  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);

  const localPeer = useSelector(
    (state: RootState) => state.hmsStates.localPeer
  );
  const localPeerPermissions = localPeer?.role?.permissions;

  const removeTextStyle = useHMSRoomStyle((theme) => ({
    color: theme.palette.alert_error_default,
  }));

  const localPeerId = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.peerID
  );
  const selectedMessageForAction = useSelector(
    (state: RootState) => state.app.selectedMessageForAction
  );

  const allowPinningMessage = useAllowPinningMessage();
  const isPinned = useIsMessagePinned(selectedMessageForAction);
  const { pinMessage, unpinMessage } = useHMSMessagePinningActions();

  const allowPeerBlocking = useAllowBlockingPeerFromChat();
  const isPeerBlocked = useIsPeerBlocked(
    selectedMessageForAction?.sender ?? null
  );
  const { blockPeer, unblockPeer } = useBlockPeerActions();

  const hmsRoomStyle = useHMSRoomStyleSheet((theme) => ({
    blockLabel: {
      color: theme.palette.alert_error_default,
    },
    blockIcon: {
      tintColor: theme.palette.alert_error_default,
    },
  }));

  const closeMessageOptionsBottomSheet = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      dispatch(setSelectedMessageForAction(null));
    }
  };

  const handleMessagePin = async () => {
    if (selectedMessageForAction) {
      if (isPinned) {
        await unpinMessage(selectedMessageForAction);
      } else {
        await pinMessage(selectedMessageForAction);
      }
    }
    closeMessageOptionsBottomSheet();
  };

  const handleRemoveParticipant = async () => {
    if (hmsInstance && selectedMessageForAction?.sender) {
      await hmsInstance?.removePeer(
        selectedMessageForAction?.sender,
        'Removed from chat'
      );
    }
    closeMessageOptionsBottomSheet();
  };

  const handleBlockPeerFromChat = async () => {
    if (selectedMessageForAction?.sender) {
      if (isPeerBlocked) {
        await unblockPeer(selectedMessageForAction.sender);
      } else {
        await blockPeer(selectedMessageForAction.sender);
      }
    }
    closeMessageOptionsBottomSheet();
  };

  const hidePinItem = !(selectedMessageForAction && allowPinningMessage);
  const hideBlockItem = !(
    selectedMessageForAction &&
    selectedMessageForAction.sender &&
    allowPeerBlocking &&
    selectedMessageForAction.sender.peerID !== localPeerId
  );

  return (
    <View>
      <BottomSheet.Header
        heading="Message Options"
        dismissModal={closeMessageOptionsBottomSheet}
      />

      <BottomSheet.Divider style={styles.headerDivider} />

      {hidePinItem ? null : (
        <MessageOptionsItem
          label={isPinned ? 'Unpin' : 'Pin'}
          icon={
            <PinIcon type={isPinned ? 'unpin' : 'pin'} style={styles.icon} />
          }
          onPress={handleMessagePin}
        />
      )}

      {hideBlockItem ? null : (
        <MessageOptionsItem
          label={isPeerBlocked ? 'Unblock from Chat' : 'Block from Chat'}
          labelStyle={hmsRoomStyle.blockLabel}
          icon={<NoEntryIcon style={[styles.icon, hmsRoomStyle.blockIcon]} />}
          onPress={handleBlockPeerFromChat}
        />
      )}

      {localPeerPermissions?.removeOthers &&
      selectedMessageForAction?.sender &&
      !selectedMessageForAction.sender.isLocal ? (
        <MessageOptionsItem
          label="Remove Participant"
          labelStyle={removeTextStyle}
          icon={<PersonIcon type="left" style={styles.icon} />}
          onPress={handleRemoveParticipant}
        />
      ) : null}

      <View style={styles.bottomSpacer} />
    </View>
  );
};

interface MessageOptionsItemProps {
  label: string;
  onPress(): void;
  icon?: React.ReactElement;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

const MessageOptionsItem: React.FC<MessageOptionsItemProps> = ({
  label,
  onPress,
  icon = null,
  style,
  labelStyle,
}) => {
  const textStyle = useHMSRoomStyle((theme, typography) => ({
    color: theme.palette.on_surface_high,
    fontFamily: `${typography.font_family}-SemiBold`,
  }));

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      {icon}

      <Text style={[styles.text, textStyle, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Item styles
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    marginLeft: 8,
  },
  // Container styles
  headerDivider: {
    marginVertical: 12,
  },
  icon: {
    width: 20,
    height: 20,
  },
  bottomSpacer: {
    width: '100%',
    height: 32,
  },
});

export const MessageOptionsView = React.memo(_MessageOptionsView);
