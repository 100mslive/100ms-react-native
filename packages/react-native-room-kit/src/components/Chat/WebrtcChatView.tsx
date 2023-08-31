import * as React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, View } from 'react-native';

import { useHMSRoomStyleSheet, useShowChat } from '../../hooks-util';
import { ChatList } from './ChatList';
import { HMSSendMessageInput } from '../HMSSendMessageInput';
import { SearchableParticipantsView } from '../Participants';
import { WebrtcChatHeader } from './WebrtcChatHeader';
import { ChatFilterBottomSheetView } from './ChatFilterBottomSheetView';
import { ChatFilterBottomSheetOpener } from './ChatFilterBottomSheetOpener';
import type { RootState } from '../../redux';

const _WebrtcChatView: React.FC = () => {
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
      <View style={[chatViewStyles.container, hmsRoomStyles.container]}>
        <WebrtcChatHeader onClosePress={closeChatBottomSheet} />

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
  },
  input: {
    flex: 0,
    height: 40,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  participantsWrapper: {
    marginTop: 16,
  },
});

export const WebrtcChatView = React.memo(_WebrtcChatView);
