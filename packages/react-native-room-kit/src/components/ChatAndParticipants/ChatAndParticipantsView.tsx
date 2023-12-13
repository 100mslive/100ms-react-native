import * as React from 'react';
import { useSelector } from 'react-redux';
import { Platform, StyleSheet, View } from 'react-native';

import {
  useHMSRoomStyleSheet,
  useShowChatAndParticipants,
} from '../../hooks-util';
import { ChatAndParticipantsHeader } from './ChatAndParticipantsHeader';
import { ChatFilterBottomSheetView } from '../Chat/ChatFilterBottomSheetView';
import type { RootState } from '../../redux';
import { ParticipantsView } from './ParticipantsView';
import { ChatView } from './ChatView';

const _ChatAndParticipantsView: React.FC = () => {
  const activeChatBottomSheetTab = useSelector(
    (state: RootState) => state.app.activeChatBottomSheetTab
  );

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
    activeChatBottomSheetTab === 'Chat' && canShowChat && !overlayChatLayout;

  return (
    <View style={styles.container}>
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

      <ChatFilterBottomSheetView />
    </View>
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
