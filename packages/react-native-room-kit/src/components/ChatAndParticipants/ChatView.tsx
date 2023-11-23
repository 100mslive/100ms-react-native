import * as React from 'react';
import { StyleSheet } from 'react-native';

import { useHMSChatState, useHMSRoomStyleSheet } from '../../hooks-util';
import { ChatList } from '../Chat/ChatList';
import { HMSSendMessageInput } from '../HMSSendMessageInput';
import { ChatFilterBottomSheetOpener } from '../Chat/ChatFilterBottomSheetOpener';
import { ChatPaused } from '../Chat/ChatPaused';

interface ChatViewProps {}

const _ChatView: React.FC<ChatViewProps> = () => {
  const { chatState } = useHMSChatState();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    input: {
      backgroundColor: theme.palette.surface_default,
      borderColor: theme.palette.surface_default,
    },
  }));

  return (
    <>
      <ChatList />

      {chatState.enabled ? (
        <>
          <ChatFilterBottomSheetOpener />

          <HMSSendMessageInput
            containerStyle={[styles.input, hmsRoomStyles.input]}
          />
        </>
      ) : (
        <ChatPaused style={styles.chatPaused} />
      )}
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
});

export const ChatView = React.memo(_ChatView);
