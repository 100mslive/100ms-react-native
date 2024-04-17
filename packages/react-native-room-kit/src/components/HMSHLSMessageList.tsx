import * as React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { FlashList } from '@shopify/flash-list';
import type { HMSMessage } from '@100mslive/react-native-hms';

import type { RootState } from '../redux';
import { useIsLandscapeOrientation } from '../utils/dimension';
import { HMSOverlayMessageView } from './HMSOverlayMessageView';

export const HMSHLSMessageList: React.FC = () => {
  const { height: windowHeight } = useWindowDimensions();
  const messages = useSelector((state: RootState) => state.messages.messages);
  const isLandscapeOrientation = useIsLandscapeOrientation();

  const _keyExtractor = React.useCallback(
    (item: HMSMessage) => item.messageId,
    []
  );

  const _renderItem = React.useCallback((data: { item: HMSMessage }) => {
    return <HMSOverlayMessageView message={data.item} />;
  }, []);

  if (messages.length <= 0) {
    return null;
  }

  const HEIGHT_MULTIPLIER = isLandscapeOrientation ? 0.42 : 0.25;

  return (
    <View
      style={[
        styles.container,
        {
          maxHeight: windowHeight * HEIGHT_MULTIPLIER,
          height:
            messages.length > 3
              ? windowHeight * HEIGHT_MULTIPLIER
              : messages.length * 66,
        },
      ]}
    >
      <FlashList
        data={messages}
        inverted={true}
        estimatedItemSize={62}
        contentContainerStyle={{ paddingBottom: 30 }}
        // contentContainerStyle={styles.listContentContainer} // Bug: Android inverted flashlist will apply padding on left when `paddingRight: 12` is applied
        keyboardShouldPersistTaps="always"
        // ListEmptyComponent={ChatBanner}
        // ItemSeparatorComponent={() => <View style={{ height: 16 }} />} // TODO: There is a bug related to this: https://github.com/Shopify/flash-list/issues/638
        renderItem={_renderItem}
        keyExtractor={_keyExtractor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 8,
    marginHorizontal: 16,
  },
});
