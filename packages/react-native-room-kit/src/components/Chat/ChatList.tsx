import * as React from 'react';
import type { HMSMessage } from '@100mslive/react-native-hms';
import {
  FlashList,
  // FlashListProps
} from '@shopify/flash-list';
import { Platform, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';

import type { RootState } from '../../redux';
import { ChatMessage } from './ChatMessage';
import { ChatBanner } from './ChatBanner';
import { PinnedMessages } from './PinnedMessages';
import { useIsAllowedToSendMessage } from '../../hooks-util';

type ChatListProps = {
  style?: StyleProp<ViewStyle>;
  // estimatedListSize?: FlashListProps<HMSMessage>['estimatedListSize'];
};

const _ChatList: React.FC<ChatListProps> = ({ style }) => {
  const flashlistRef = React.useRef<null | FlashList<HMSMessage>>(null);
  const isAllowedToSendMessage = useIsAllowedToSendMessage();
  const messages = useSelector((state: RootState) => state.messages.messages);

  const _keyExtractor = React.useCallback(
    (item: HMSMessage) => item.messageId,
    []
  );

  const _renderItem = React.useCallback((data: { item: HMSMessage }) => {
    return <ChatMessage message={data.item} />;
  }, []);

  return (
    <View
      style={[
        chatListStyle.list,
        isAllowedToSendMessage ? chatListStyle.bottomSpace : null,
        style,
      ]}
    >
      <PinnedMessages />

      {messages.length > 0 ? (
        <FlashList
          ref={flashlistRef}
          data={messages}
          inverted={true}
          estimatedItemSize={75}
          showsVerticalScrollIndicator={Platform.OS !== 'android'}
          // contentContainerStyle={chatListStyle.listContentContainer} // Bug: Android inverted flashlist will apply padding on left when `paddingRight: 12` is applied
          keyboardShouldPersistTaps="always"
          // ItemSeparatorComponent={() => <View style={{ height: 16 }} />} // TODO: There is a bug related to this: https://github.com/Shopify/flash-list/issues/638
          renderItem={_renderItem}
          keyExtractor={_keyExtractor}
        />
      ) : (
        <ChatBanner />
      )}
    </View>
  );
};

const chatListStyle = StyleSheet.create({
  list: {
    flex: 1,
    marginTop: 8,
  },
  bottomSpace: {
    marginBottom: 16,
  },
  listContentContainer: {
    paddingRight: 8,
  },
});

export const ChatList = React.memo(_ChatList);
