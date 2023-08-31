import * as React from 'react';
import { StyleSheet } from 'react-native';

import { BottomSheet } from '../BottomSheet';
import { useShowChat } from '../../hooks-util';
import { WebrtcChatView } from './WebrtcChatView';

export const WebrtcChatBottomSheet = () => {
  const [chatVisibleType, setChatVisible] = useShowChat();

  const closeChatWindow = () => setChatVisible(false);

  return (
    <BottomSheet
      dismissModal={closeChatWindow}
      isVisible={chatVisibleType === 'modal'}
      avoidKeyboard={true}
      containerStyle={styles.bottomSheet}
    >
      <WebrtcChatView />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    flex: 1,
    backgroundColor: undefined,
    paddingBottom: 0,
    marginTop: 112,
  },
});
