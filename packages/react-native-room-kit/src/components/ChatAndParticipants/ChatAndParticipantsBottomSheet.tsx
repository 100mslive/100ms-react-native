import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '../BottomSheet';
import { useShowChat } from '../../hooks-util';
import { ChatAndParticipantsView } from './ChatAndParticipantsView';
import { HEADER_HEIGHT } from '../Header';

export const ChatAndParticipantsBottomSheet = () => {
  const { top: topSafeArea } = useSafeAreaInsets();

  const [chatVisibleType, setChatVisible] = useShowChat();

  const closeChatWindow = () => setChatVisible(false);

  return (
    <BottomSheet
      dismissModal={closeChatWindow}
      isVisible={chatVisibleType === 'modal'}
      avoidKeyboard={true}
      containerStyle={[
        styles.bottomSheet,
        { marginTop: topSafeArea + HEADER_HEIGHT },
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
