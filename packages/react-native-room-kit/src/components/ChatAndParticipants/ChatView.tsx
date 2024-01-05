import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import {
  useHMSChatState,
  useHMSRoomStyleSheet,
  useIsAllowedToSendMessage,
  useIsLocalPeerBlockedFromChat,
} from '../../hooks-util';
import { ChatList } from '../Chat/ChatList';
import { HMSSendMessageInput } from '../HMSSendMessageInput';
import { ChatFilterBottomSheetOpener } from '../Chat/ChatFilterBottomSheetOpener';
import { ChatPaused } from '../Chat/ChatPaused';
import type { RootState } from '../../redux';
import { PeerBlockedFromChat } from '../Chat/PeerBlockedFromChat';

interface ChatViewProps {}

const _ChatView: React.FC<ChatViewProps> = () => {
  const { chatState } = useHMSChatState();
  const isAllowedToSendMessage = useIsAllowedToSendMessage();
  const isChatRecipientSelected = useSelector(
    (state: RootState) => state.chatWindow.sendTo !== null
  );
  const isLocalPeerBlockedFromChat = useIsLocalPeerBlockedFromChat();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    input: {
      backgroundColor: theme.palette.surface_default,
      borderColor: theme.palette.surface_default,
    },
  }));

  return (
    <>
      <ChatList />

      {isLocalPeerBlockedFromChat ? (
        <PeerBlockedFromChat style={styles.peerBlocked} />
      ) : chatState.enabled ? (
        <>
          <ChatFilterBottomSheetOpener />

          {isAllowedToSendMessage && isChatRecipientSelected ? (
            <HMSSendMessageInput
              containerStyle={[styles.input, hmsRoomStyles.input]}
            />
          ) : null}
        </>
      ) : isAllowedToSendMessage ? (
        <ChatPaused style={styles.chatPaused} />
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 0,
    height: 40,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  chatPaused: {
    marginTop: 18, // Applied margin so that content does not shift when this component mounts or unmounts
  },
  peerBlocked: {
    marginTop: 18, // Applied margin so that content does not shift when this component mounts or unmounts
  },
});

export const ChatView = React.memo(_ChatView);
