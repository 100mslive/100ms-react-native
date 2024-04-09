import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import {
  useHMSChatState,
  useHMSRoomStyleSheet,
  useIsAllowedToSendMessage,
  useIsLocalPeerBlockedFromChat,
} from '../hooks-util';
import { ChatPaused } from './Chat/ChatPaused';
import { PeerBlockedFromChat } from './Chat/PeerBlockedFromChat';
import { ChatFilterBottomSheetOpener } from './Chat/ChatFilterBottomSheetOpener';
import { HMSSendMessageInput } from './HMSSendMessageInput';
import type { RootState } from '../redux';
import { ChatFilterBottomSheet } from './Chat/ChatFilterBottomSheet';

export const HLSManageChatTextInput = () => {
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

  if (isLocalPeerBlockedFromChat) {
    return <PeerBlockedFromChat style={styles.shrink} />;
  }

  if (chatState.enabled) {
    return (
      <>
        {/* INFO: Chat action button UI might be broken,
        but hls-viewer might not have permission to take action */}
        <View style={styles.grow}>
          <ChatFilterBottomSheetOpener useFilterModal={true} />

          {isAllowedToSendMessage && isChatRecipientSelected ? (
            <HMSSendMessageInput
              containerStyle={[styles.input, hmsRoomStyles.input]}
            />
          ) : null}
        </View>

        <ChatFilterBottomSheet />
      </>
    );
  }

  if (isAllowedToSendMessage) {
    return <ChatPaused style={styles.shrink} />;
  }

  return <View style={styles.grow} />;
};

const styles = StyleSheet.create({
  input: {
    flex: 0,
    height: 40,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  shrink: {
    flexShrink: 1,
  },
  grow: {
    flexGrow: 1,
  },
});
