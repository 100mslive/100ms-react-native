import * as React from 'react';
import { StyleSheet } from 'react-native';

import { BottomSheet } from '../BottomSheet';
import { useShowChat } from '../../hooks-util';
import { ChatAndParticipantsView } from './ChatAndParticipantsView';

export const ChatAndParticipantsBottomSheet = () => {
  const [chatVisibleType, setChatVisible] = useShowChat();

  const closeChatWindow = () => setChatVisible(false);

  return (
    <BottomSheet
      dismissModal={closeChatWindow}
      isVisible={chatVisibleType === 'modal'}
      avoidKeyboard={true}
      containerStyle={styles.bottomSheet}
    >
      <ChatAndParticipantsView />
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
