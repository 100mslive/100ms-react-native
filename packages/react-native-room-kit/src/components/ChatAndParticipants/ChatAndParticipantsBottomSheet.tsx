import * as React from 'react';
import { StyleSheet } from 'react-native';

import { BottomSheet } from '../BottomSheet';
import {
  useHMSRoomStyleSheet,
  useShowChatAndParticipants,
} from '../../hooks-util';
import { ChatAndParticipantsView } from './ChatAndParticipantsView';
import { useHeaderHeight } from '../Header';
import { useIsLandscapeOrientation } from '../../utils/dimension';

export const ChatAndParticipantsBottomSheet = () => {
  const headerHeight = useHeaderHeight();
  const isLandscapeOrientation = useIsLandscapeOrientation();

  const { modalVisible, hide } = useShowChatAndParticipants();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    contentContainer: {
      backgroundColor: theme.palette.surface_dim,
    },
  }));

  const closeChatWindow = () => hide('modal');

  return (
    <BottomSheet
      fullWidth={true}
      dismissModal={closeChatWindow}
      isVisible={modalVisible}
      avoidKeyboard={true}
      containerStyle={[
        styles.bottomSheet,
        hmsRoomStyles.contentContainer,
        {
          marginTop: isLandscapeOrientation ? 0 : headerHeight,
        },
      ]}
      bottomOffsetSpace={0}
    >
      <ChatAndParticipantsView />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    flex: 1,
  },
});
