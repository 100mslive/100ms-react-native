import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '../BottomSheet';
import { useShowChatAndParticipants } from '../../hooks-util';
import { ChatAndParticipantsView } from './ChatAndParticipantsView';
import { HEADER_HEIGHT } from '../Header';
import { useIsLandscapeOrientation } from '../../utils/dimension';

export const ChatAndParticipantsBottomSheet = () => {
  const { top: topSafeArea } = useSafeAreaInsets();
  const isLandscapeOrientation = useIsLandscapeOrientation();

  const { modalVisible, hide } = useShowChatAndParticipants();

  const closeChatWindow = () => hide('modal');

  return (
    <BottomSheet
      dismissModal={closeChatWindow}
      isVisible={modalVisible}
      avoidKeyboard={true}
      containerStyle={[
        styles.bottomSheet,
        { marginTop: topSafeArea + (isLandscapeOrientation ? 0 : HEADER_HEIGHT) },
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
