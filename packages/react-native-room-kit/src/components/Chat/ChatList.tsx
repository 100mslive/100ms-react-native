import * as React from 'react';
import type { HMSMessage } from '@100mslive/react-native-hms';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import type { RootState } from '../../redux';
import { ChatMessage } from './ChatMessage';
import { ChatBanner } from './ChatBanner';
import { PinnedMessage } from './PinnedMessage';

type ChatListProps = {
  // estimatedListSize?: FlashListProps<HMSMessage>['estimatedListSize'];
};

const _ChatList: React.FC<ChatListProps> = () => {
  const messages = useSelector((state: RootState) => state.messages.messages);

  const _keyExtractor = React.useCallback(
    (item: HMSMessage) => item.messageId,
    []
  );

  const _renderItem = React.useCallback((data: { item: HMSMessage }) => {
    return <ChatMessage message={data.item} />;
  }, []);

  return (
    <View style={chatListStyle.list}>
      <PinnedMessage />

      <FlashList
        data={messages}
        inverted={true}
        estimatedItemSize={104}
        contentContainerStyle={chatListStyle.listContentContainer} // Bug: Android inverted flashlist will apply padding on left when `paddingRight: 12` is applied
        keyboardShouldPersistTaps="always"
        ListEmptyComponent={ChatBanner}
        // ItemSeparatorComponent={() => <View style={{ height: 16 }} />} // TODO: There is a bug related to this: https://github.com/Shopify/flash-list/issues/638
        renderItem={_renderItem}
        keyExtractor={_keyExtractor}
      />
    </View>
  );
};

const chatListStyle = StyleSheet.create({
  list: {
    flex: 1,
    marginVertical: 8,
  },
  listContentContainer: {
    paddingRight: 12,
  },
});

export const ChatList = React.memo(_ChatList);
