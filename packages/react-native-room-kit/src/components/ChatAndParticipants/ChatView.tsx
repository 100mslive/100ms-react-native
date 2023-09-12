import * as React from 'react';
import { StyleSheet } from 'react-native';

import { useHMSRoomStyleSheet } from '../../hooks-util';
import { ChatList } from '../Chat/ChatList';
import { HMSSendMessageInput } from '../HMSSendMessageInput';
import { ChatFilterBottomSheetOpener } from '../Chat/ChatFilterBottomSheetOpener';

interface ChatViewProps {}

const _ChatView: React.FC<ChatViewProps> = () => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    input: {
      backgroundColor: theme.palette.surface_default,
      borderColor: theme.palette.surface_default,
    },
  }));

  return (
    <>
      <ChatList />

      <ChatFilterBottomSheetOpener />

      <HMSSendMessageInput
        containerStyle={[styles.input, hmsRoomStyles.input]}
      />
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
});

export const ChatView = React.memo(_ChatView);
