import * as React from 'react';
import { StyleSheet } from 'react-native';

import { BottomSheet } from '../BottomSheet';
import { useShowChatAndParticipants } from '../../hooks-util';
import { ChatAndParticipantsView } from './ChatAndParticipantsView';
import { useHeaderHeight } from '../Header';

export const ChatAndParticipantsBottomSheet = () => {
  const headerHeight = useHeaderHeight();

  const { modalVisible, hide } = useShowChatAndParticipants();

  const closeChatWindow = () => hide('modal');

  return (
    <BottomSheet
      fullWidth={true}
      dismissModal={closeChatWindow}
      isVisible={modalVisible}
      avoidKeyboard={true}
      containerStyle={[
        styles.bottomSheet,
        {
          marginTop: headerHeight,
        },
      ]}
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
  },
});
