import * as React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, View } from 'react-native';

import { useHMSRoomStyleSheet, useShowChat } from '../../hooks-util';
import { ChatList } from '../Chat/ChatList';
import { HMSSendMessageInput } from '../HMSSendMessageInput';
import { SearchableParticipantsView } from '../Participants';
import { ChatAndParticipantsHeader } from './ChatAndParticipantsHeader';
import { ChatFilterBottomSheetView } from '../Chat/ChatFilterBottomSheetView';
import { ChatFilterBottomSheetOpener } from '../Chat/ChatFilterBottomSheetOpener';
import type { RootState } from '../../redux';

const _ChatAndParticipantsView: React.FC = () => {
  const activeChatBottomSheetTab = useSelector(
    (state: RootState) => state.app.activeChatBottomSheetTab
  );

  const [_, setChatVisible] = useShowChat();

  const closeChatBottomSheet = () => setChatVisible(false);

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    container: {
      backgroundColor: theme.palette.surface_dim,
    },
    input: {
      backgroundColor: theme.palette.surface_default,
      borderColor: theme.palette.surface_default,
    },
  }));

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <View
        style={[
          chatViewStyles.container,
          hmsRoomStyles.container,
          activeChatBottomSheetTab === 'Participants'
            ? chatViewStyles.participantsContainer
            : null,
        ]}
      >
        <ChatAndParticipantsHeader onClosePress={closeChatBottomSheet} />

        {activeChatBottomSheetTab === 'Chat' ? (
          <>
            <ChatList />

            <ChatFilterBottomSheetOpener />

            <HMSSendMessageInput
              containerStyle={[chatViewStyles.input, hmsRoomStyles.input]}
            />
          </>
        ) : activeChatBottomSheetTab === 'Participants' ? (
          <View style={chatViewStyles.participantsWrapper}>
            <SearchableParticipantsView />
          </View>
        ) : null}
      </View>

      <ChatFilterBottomSheetView />
    </View>
  );
};

const chatViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  participantsContainer: {
    paddingBottom: 0,
  },
  input: {
    flex: 0,
    height: 40,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  participantsWrapper: {
    flex: 1,
    marginTop: 16,
  },
});

export const ChatAndParticipantsView = React.memo(_ChatAndParticipantsView);
