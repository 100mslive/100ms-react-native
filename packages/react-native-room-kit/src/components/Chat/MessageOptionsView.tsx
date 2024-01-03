import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  useAllowBlockingPeerFromChat,
  useAllowPinningMessage,
  useBlockPeerActions,
  useHMSInstance,
  useHMSMessagePinningActions,
  useHMSRoomStyle,
  useHMSRoomStyleSheet,
  useIsMessagePinned,
  useIsPeerBlocked,
  useModalType,
} from '../../hooks-util';
import type { RootState } from '../../redux';
import { BottomSheet } from '../BottomSheet';
import { NoEntryIcon, PersonIcon, PinIcon } from '../../Icons';
import {
  addNotification,
  setSelectedMessageForAction,
} from '../../redux/actions';
import { ModalTypes } from '../../utils/types';
import { NotificationTypes } from '../../types';

interface MessageOptionsViewProps {
  onDismiss?: () => void;
}

const _MessageOptionsView: React.FC<MessageOptionsViewProps> = ({
  onDismiss,
}) => {
  const dispatch = useDispatch();
  const hmsInstance = useHMSInstance();
  const localPeerPermissions = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role?.permissions
  );
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

  const { handleModalVisibleType } = useModalType();

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

  const showError = (error: any) => {
    if (!onDismiss) {
      handleModalVisibleType(ModalTypes.DEFAULT);
    }
    dispatch(
      addNotification({
        id: Math.random().toString(16).slice(2),
        type: NotificationTypes.ERROR,
        title: error.message,
      })
    );
  };

  const handleMessagePin = async () => {
    try {
      if (selectedMessageForAction) {
        if (isPinned) {
          await unpinMessage(selectedMessageForAction);
        } else {
          await pinMessage(selectedMessageForAction);
        }
      }
      closeMessageOptionsBottomSheet();
    } catch (error) {
      closeMessageOptionsBottomSheet();
      showError(error);
    }
  };

  const handleBlockPeerFromChat = async () => {
    try {
      if (selectedMessageForAction?.sender) {
        if (isPeerBlocked) {
          await unblockPeer(selectedMessageForAction.sender);
        } else {
          await blockPeer(selectedMessageForAction.sender);
        }
      }
      closeMessageOptionsBottomSheet();
    } catch (error) {
      closeMessageOptionsBottomSheet();
      showError(error);
    }
  };

  const handleRemoveParticipant = async () => {
    if (selectedMessageForAction?.sender) {
      await hmsInstance.removePeer(
        selectedMessageForAction.sender,
        'Removed from chat'
      );
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
  const hideRemoveItem = !(
    localPeerPermissions?.removeOthers &&
    selectedMessageForAction?.sender &&
    !selectedMessageForAction.sender.isLocal
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

      {hideRemoveItem ? null : (
        <MessageOptionsItem
          label="Remove Participant"
          labelStyle={hmsRoomStyle.blockLabel}
          icon={
            <PersonIcon
              type="left"
              style={[styles.icon, hmsRoomStyle.blockIcon]}
            />
          }
          onPress={handleRemoveParticipant}
        />
      )}

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
