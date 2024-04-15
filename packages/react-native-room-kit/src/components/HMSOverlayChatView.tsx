import * as React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useDerivedValue, interpolate } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import type { RootState } from '../redux';
import { HMSKeyboardAvoidingView } from './HMSKeyboardAvoidingView';
import { HMSSendMessageInput } from './HMSSendMessageInput';
import { HMSHLSMessageList } from './HMSHLSMessageList';
import { useFooterHeight } from './Footer';
import { useHMSNotificationsHeight } from './HMSNotifications';
import { ChatFilterBottomSheetOpener } from './Chat/ChatFilterBottomSheetOpener';
import { ChatMoreActionsModal } from './Chat/ChatMoreActionsModal';
import { ChatFilterBottomSheet } from './Chat/ChatFilterBottomSheet';
import { ChatPaused } from './Chat/ChatPaused';
import {
  useHMSChatState,
  useIsAllowedToSendMessage,
  useIsLocalPeerBlockedFromChat,
} from '../hooks-util';
import { PinnedMessages } from './Chat';
import { MessageOptionsBottomSheet } from './Chat/MessageOptionsBottomSheet';
import { PeerBlockedFromChat } from './Chat/PeerBlockedFromChat';

const colors = [
  'rgba(0, 0, 0, 0)',
  'rgba(255, 255, 255, 1)',
  'rgba(255, 255, 255, 1)',
];
const colorLocations = [0, 0.4, 1];

export interface HMSOverlayChatViewProps {
  offset?: SharedValue<number>;
}

export const HMSOverlayChatView: React.FC<HMSOverlayChatViewProps> = ({
  offset,
}) => {
  const footerHeight = useFooterHeight();
  const hmsNotificationsHeight = useHMSNotificationsHeight();
  const { chatState } = useHMSChatState();
  const isAllowedToSendMessage = useIsAllowedToSendMessage();
  const isLocalPeerBlockedFromChat = useIsLocalPeerBlockedFromChat();
  const isSelectedChatRecipient = useSelector(
    (state: RootState) => state.chatWindow.sendTo !== null
  );

  const chatBottomOffset = useDerivedValue(() => {
    if (offset) {
      return (
        interpolate(offset.value, [0, 1], [0, footerHeight]) +
        hmsNotificationsHeight
      );
    }
    return footerHeight + hmsNotificationsHeight;
  }, [offset, footerHeight, hmsNotificationsHeight]);

  return (
    <>
      <HMSKeyboardAvoidingView bottomOffset={chatBottomOffset}>
        <MaskedView
          maskElement={
            <LinearGradient
              pointerEvents="box-none"
              style={StyleSheet.absoluteFill}
              colors={colors}
              locations={colorLocations}
            />
          }
        >
          <HMSHLSMessageList />
        </MaskedView>

        <PinnedMessages insetMode={true} />

        {chatState.enabled ? (
          <>
            <View style={styles.filterSheetWrapper}>
              <ChatFilterBottomSheetOpener
                overlay={true}
                useFilterModal={true}
                showActionBtn={true}
                useActionModal={true}
              />
            </View>

            {isLocalPeerBlockedFromChat ? (
              <PeerBlockedFromChat style={styles.peerBlocked} />
            ) : isAllowedToSendMessage && isSelectedChatRecipient ? (
              <HMSSendMessageInput />
            ) : null}
          </>
        ) : (
          <ChatPaused insetMode={true} style={styles.chatPaused} />
        )}
      </HMSKeyboardAvoidingView>

      <MessageOptionsBottomSheet />
      <ChatFilterBottomSheet />
      <ChatMoreActionsModal offset={offset} />
    </>
  );
};

const styles = StyleSheet.create({
  filterSheetWrapper: {
    marginHorizontal: 8,
    marginTop: 8,
  },
  chatPaused: {
    marginHorizontal: 8,
    marginBottom: 38,
  },
  peerBlocked: {
    marginHorizontal: 8,
    marginBottom: 8,
  },
});
