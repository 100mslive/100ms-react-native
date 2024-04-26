import * as React from 'react';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import type { HMSMessage } from '@100mslive/react-native-hms';

import type { RootState } from '../redux';
import { HMSHLSMessage } from './HMSHLSMessage';
import { ChatBanner, PinnedMessages } from './Chat';
import { MessageOptionsBottomSheet } from './Chat/MessageOptionsBottomSheet';

export const HLSChatMessages = () => {
  const messages = useSelector((state: RootState) => state.messages.messages);

  const _keyExtractor = React.useCallback(
    (item: HMSMessage) => item.messageId,
    []
  );

  const _renderItem = React.useCallback((data: { item: HMSMessage }) => {
    return <HMSHLSMessage message={data.item} />;
  }, []);

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 16,
      }}
    >
      <View style={styles.container}>
        <PinnedMessages />

        {messages.length > 0 ? (
          <FlatList
            inverted={true}
            data={messages}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            showsVerticalScrollIndicator={Platform.OS !== 'android'}
            // contentContainerStyle={styles.listContentContainer} // Bug: Android inverted flashlist will apply padding on left when `paddingRight: 12` is applied
            keyboardShouldPersistTaps="always"
            // ListEmptyComponent={ChatBanner}
            // ItemSeparatorComponent={() => <View style={{ height: 16 }} />} // TODO: There is a bug related to this: https://github.com/Shopify/flash-list/issues/638
            renderItem={_renderItem}
            keyExtractor={_keyExtractor}
          />
        ) : (
          <ChatBanner />
        )}
      </View>

      <MessageOptionsBottomSheet />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
