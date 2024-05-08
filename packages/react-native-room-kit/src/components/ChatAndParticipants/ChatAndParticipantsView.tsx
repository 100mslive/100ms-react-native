import * as React from 'react';
import { useSelector } from 'react-redux';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useHMSRoomStyleSheet,
  useIsHLSViewer,
  useShowChatAndParticipants,
} from '../../hooks-util';
import { ChatAndParticipantsHeader } from './ChatAndParticipantsHeader';
import { ChatFilterBottomSheetView } from '../Chat/ChatFilterBottomSheetView';
import type { RootState } from '../../redux';
import { ParticipantsView } from './ParticipantsView';
import { ChatView } from './ChatView';
import { ChatMoreActionsSheetView } from '../Chat/ChatMoreActionsSheetView';
import { MessageOptionsBottomSheetView } from '../Chat/MessageOptionsBottomSheetView';

const _ChatAndParticipantsView: React.FC = () => {
  const activeChatBottomSheetTab = useSelector(
    (state: RootState) => state.app.activeChatBottomSheetTab
  );
  const isHLSViewer = useIsHLSViewer();

  const { hide, canShowParticipants, canShowChat, overlayChatLayout } =
    useShowChatAndParticipants();

  const closeBottomSheet = () => hide('modal');

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    contentContainer: {
      backgroundColor: theme.palette.surface_dim,
    },
  }));

  const showParticipants =
    activeChatBottomSheetTab === 'Participants' && canShowParticipants;

  const showChat =
    !isHLSViewer &&
    activeChatBottomSheetTab === 'Chat' &&
    canShowChat &&
    !overlayChatLayout;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View
        style={[
          styles.contentContainer,
          hmsRoomStyles.contentContainer,
          showParticipants ? styles.participantsContainer : null,
        ]}
      >
        <ChatAndParticipantsHeader onClosePress={closeBottomSheet} />

        {showParticipants ? (
          <View style={styles.participantsWrapper}>
            <ParticipantsView />
          </View>
        ) : showChat ? (
          <ChatView />
        ) : null}
      </View>

      {canShowChat && !overlayChatLayout ? (
        <>
          <MessageOptionsBottomSheetView />
          <ChatFilterBottomSheetView />
          <ChatMoreActionsSheetView />
        </>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  participantsContainer: {
    paddingBottom: 0,
  },
  participantsWrapper: {
    flex: 1,
    marginTop: 16,
  },
});

export const ChatAndParticipantsView = React.memo(_ChatAndParticipantsView);
