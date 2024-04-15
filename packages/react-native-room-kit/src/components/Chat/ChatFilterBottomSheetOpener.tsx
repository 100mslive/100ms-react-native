import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import {
  ChevronIcon,
  ParticipantsIcon,
  PersonIcon,
  SearchIcon,
  ThreeDotsIcon,
} from '../../Icons';
import type { RootState } from '../../redux';
import {
  useHMSCanDisableChat,
  useHMSChatRecipientSelector,
  useHMSRoomStyleSheet,
  useIsAllowedToSendMessage,
  useIsLocalPeerBlockedFromChat,
  useModalType,
} from '../../hooks-util';
import {
  setChatFilterSheetVisible,
  setChatMoreActionsSheetVisible,
} from '../../redux/actions';
import { PressableIcon } from '../PressableIcon';
import { ChatBroadcastFilter, ModalTypes } from '../../utils/types';
import { hexToRgbA } from '../../utils/theme';

interface ChatFilterBottomSheetOpenerProps {
  overlay?: boolean;
  useFilterModal?: boolean;
  showActionBtn?: boolean;
  useActionModal?: boolean;
}

const _ChatFilterBottomSheetOpener: React.FC<
  ChatFilterBottomSheetOpenerProps
> = ({
  overlay = false,
  useFilterModal = false,
  showActionBtn = false,
  useActionModal = false,
}) => {
  const dispatch = useDispatch();
  const canDisableChat = useHMSCanDisableChat();
  const chatRecipients = useHMSChatRecipientSelector();
  const allowedToSendMessage = useIsAllowedToSendMessage();
  const isLocalPeerBlockedFromChat = useIsLocalPeerBlockedFromChat();
  const selectedChatRecipient = useSelector(
    (state: RootState) => state.chatWindow.sendTo
  );
  const { handleModalVisibleType } = useModalType();

  const hmsRoomStyles = useHMSRoomStyleSheet(
    (theme, typography) => ({
      label: {
        color: theme.palette.on_surface_medium,
        fontFamily: `${typography.font_family}-Regular`,
      },
      button: {
        backgroundColor: overlay
          ? theme.palette.background_dim &&
            hexToRgbA(theme.palette.background_dim, 0.64)
          : theme.palette.primary_default,
      },
      buttonText: {
        color: theme.palette.on_surface_high,
        fontFamily: `${typography.font_family}-Regular`,
      },
      moreAction: {
        backgroundColor:
          theme.palette.background_dim &&
          hexToRgbA(theme.palette.background_dim, 0.64),
      },
      moreActionIcon: {
        tintColor: overlay
          ? theme.palette.on_surface_low
          : theme.palette.on_surface_medium,
      },
    }),
    [overlay]
  );

  const openChatFiltersSheet = () => {
    if (useFilterModal) {
      handleModalVisibleType(ModalTypes.CHAT_FILTER);
    } else {
      dispatch(setChatFilterSheetVisible(true));
    }
  };

  const openChatMoreActionsSheet = () => {
    if (useActionModal) {
      handleModalVisibleType(ModalTypes.CHAT_MORE_ACTIONS);
    } else {
      dispatch(setChatMoreActionsSheetVisible(true));
    }
  };

  const filterSheetDisabled =
    !chatRecipients.privateChat && // filter Sheet can't be diabled when privateChat is 'on'
    (chatRecipients.publicChat
      ? chatRecipients.roles.length === 0
      : chatRecipients.roles.length <= 1);

  const showActionButtons =
    (allowedToSendMessage && !isLocalPeerBlockedFromChat) || canDisableChat;

  if (!showActionButtons) {
    return null;
  }

  const tapGesture = Gesture.Tap();

  return (
    <View style={styles.container}>
      {allowedToSendMessage && !isLocalPeerBlockedFromChat ? (
        <View style={styles.sendToContainer}>
          <Text style={[styles.label, hmsRoomStyles.label]}>
            {selectedChatRecipient !== null
              ? 'To'
              : `Choose ${
                  chatRecipients.privateChat
                    ? 'Participant'
                    : chatRecipients.roles.length > 0
                      ? 'Role'
                      : ''
                }`}
          </Text>

          <GestureDetector gesture={tapGesture}>
            <TouchableOpacity
              disabled={filterSheetDisabled}
              onPress={openChatFiltersSheet}
              style={[
                styles.button,
                { paddingRight: filterSheetDisabled ? 8 : undefined },
                hmsRoomStyles.button,
              ]}
            >
              {selectedChatRecipient ? (
                selectedChatRecipient === ChatBroadcastFilter ? (
                  <ParticipantsIcon style={styles.buttonIcon} />
                ) : (
                  <PersonIcon style={styles.buttonIcon} />
                )
              ) : (
                <SearchIcon style={styles.buttonIcon} />
              )}

              <Text style={[styles.buttonText, hmsRoomStyles.buttonText]}>
                {selectedChatRecipient ? selectedChatRecipient.name : 'Search'}
              </Text>

              {filterSheetDisabled || !selectedChatRecipient ? null : (
                <ChevronIcon direction="down" style={styles.buttonIcon} />
              )}
            </TouchableOpacity>
          </GestureDetector>
        </View>
      ) : (
        <View />
      )}

      {canDisableChat && showActionBtn ? (
        <PressableIcon
          onPress={openChatMoreActionsSheet}
          style={[styles.moreAction, hmsRoomStyles.moreAction]}
        >
          <ThreeDotsIcon stack="vertical" style={styles.moreActionIcon} />
        </PressableIcon>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sendToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreAction: {
    padding: 4,
    borderRadius: 4,
  },
  moreActionIcon: {
    width: 16,
    height: 16,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  button: {
    padding: 4,
    flexDirection: 'row',
    marginLeft: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    textTransform: 'capitalize',
    lineHeight: 16,
    letterSpacing: 0.4,
    marginHorizontal: 4,
  },
  buttonIcon: {
    width: 16,
    height: 16,
  },
});

export const ChatFilterBottomSheetOpener = React.memo(
  _ChatFilterBottomSheetOpener
);
