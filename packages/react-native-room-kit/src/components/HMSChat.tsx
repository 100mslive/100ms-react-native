import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { ChatIcon } from '../Icons';
import { PressableIcon } from './PressableIcon';
import { ChatView } from './ChatWindow';
import { useShowChat } from '../hooks-util';
import { BottomSheet } from './BottomSheet';

export const HMSChat = () => {
  const [chatVisibleType, setChatVisible] = useShowChat();

  const toggleChatWindow = () => setChatVisible(chatVisibleType === 'none');

  const closeChatWindow = () => setChatVisible(false);

  return (
    <View>
      <PressableIcon
        onPress={toggleChatWindow}
        active={chatVisibleType === 'inset'}
      >
        <ChatIcon />
      </PressableIcon>

      <BottomSheet
        dismissModal={closeChatWindow}
        isVisible={chatVisibleType === 'modal'}
        avoidKeyboard={true}
        containerStyle={styles.bottomSheet}
      >
        <ChatView />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    flex: 1,
    backgroundColor: undefined,
    paddingBottom: 0,
  },
});
