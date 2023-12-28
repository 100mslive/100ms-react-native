import * as React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { TextLayoutEventData } from 'react-native';
import { useSelector } from 'react-redux';
import { FlashList } from '@shopify/flash-list';
import type { ViewToken } from '@shopify/flash-list';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import type { RootState } from '../../redux';
import {
  useAllowPinningMessage,
  useHMSMessagePinningActions,
  useHMSRoomStyleSheet,
} from '../../hooks-util';
import { PinIcon } from '../../Icons';
import type { PinnedMessage } from 'src/types';
import { hexToRgbA } from '../../utils/theme';

const FLATLIST_VIEWABILITY_CONFIG = {
  waitForInteraction: true,
  itemVisiblePercentThreshold: 90,
};

interface PinnedMessagesProps {
  insetMode?: boolean;
}

export const PinnedMessages: React.FC<PinnedMessagesProps> = ({
  insetMode = false,
}) => {
  const listRef = React.useRef<null | React.ElementRef<typeof FlashList>>(null);
  const textComponentLayoutsRefs = React.useRef<
    Record<string, TextLayoutEventData>
  >({});

  const [listHeight, setListHeight] = React.useState(42);
  const listHeightRef = React.useRef(42);

  const [selectedPinnedMessageIndex, setSelectedMessageIndex] =
    React.useState(0);
  const selectedPinnedMessageIndexRef = React.useRef(0);

  const allowPinningMessage = useAllowPinningMessage();
  const { unpinMessage } = useHMSMessagePinningActions();

  const pinnedMessages = useSelector(
    (state: RootState) => state.messages.pinnedMessages
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    insetContainer: {
      backgroundColor:
        theme.palette.background_dim &&
        hexToRgbA(theme.palette.background_dim, 0.64),
    },
    pinContainer: {
      backgroundColor: theme.palette.surface_default,
    },
    activeMessageContainer: {
      backgroundColor: theme.palette.on_surface_high,
    },
    inactiveMessageContainer: {
      backgroundColor: theme.palette.on_surface_low,
    },
    closeIcon: {
      tintColor: theme.palette.on_surface_medium,
    },
    highlightedText: {
      fontFamily: `${typography.font_family}-SemiBold`,
      color: theme.palette.on_surface_high,
    },
    text: {
      fontFamily: `${typography.font_family}-Regular`,
      color: theme.palette.on_surface_high,
    },
  }));

  const handleTapOnPinnedMessage = React.useCallback(() => {
    console.log('***** listHeight > ', listHeight);
    if (listHeight > 42) {
      setListHeight(42);
      listHeightRef.current = 42;
    } else {
      console.log(
        '***** selectedPinnedMessageIndex > ',
        selectedPinnedMessageIndexRef.current
      );
      const visiblePinnedMessage =
        pinnedMessages[selectedPinnedMessageIndexRef.current];
      console.log('***** pinnedMessages length > ', pinnedMessages.length);
      console.log(
        '***** visiblePinnedMessage exists? > ',
        !!visiblePinnedMessage
      );
      if (visiblePinnedMessage) {
        const visibleMessageLayout =
          textComponentLayoutsRefs.current[visiblePinnedMessage.id];
        console.log(
          '***** visibleMessageLayout #lines > ',
          visibleMessageLayout?.lines.length
        );
        if (visibleMessageLayout) {
          if (visibleMessageLayout.lines.length > 2) {
            setListHeight(visibleMessageLayout.lines.length * 20 + 2);
            listHeightRef.current = visibleMessageLayout.lines.length * 20 + 2;

            // setTimeout(() => {
            //  listRef.current?.scrollToIndex({ index: selectedPinnedMessageIndexRef.current, animated: false });
            // }, 2000);
          }
        }
      }
    }
  }, [listHeight, pinnedMessages]);

  const handleUnpinMessagePress = React.useCallback(() => {
    const visiblePinnedMessage =
      pinnedMessages[selectedPinnedMessageIndexRef.current];
    if (visiblePinnedMessage) {
      if (listHeight > 42) {
        setListHeight(42);
        listHeightRef.current = 42;
      }
      unpinMessage(visiblePinnedMessage);
    }
  }, [listHeight, pinnedMessages]);

  const _handleViewableItemsChanged = React.useCallback(
    (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      const firstViewable = info.viewableItems[0];
      if (
        firstViewable?.isViewable &&
        typeof firstViewable.index === 'number'
      ) {
        let viewableIndexChanged = false;

        setSelectedMessageIndex((currIndex) => {
          if (currIndex !== firstViewable.index) {
            viewableIndexChanged = true;
          }
          return firstViewable.index;
        });
        selectedPinnedMessageIndexRef.current = firstViewable.index;

        if (viewableIndexChanged && listHeightRef.current > 42) {
          setListHeight(42);
          listHeightRef.current = 42;
        }
        // setSelectedMessageIndex(firstViewable.index);
      }
    },
    []
  );

  const _renderItem = React.useCallback(
    (data: { item: PinnedMessage }) => {
      const [sender, text] = data.item.text.split(':');
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleTapOnPinnedMessage}
          style={{ height: listHeight, justifyContent: 'center' }}
        >
          <Text
            onTextLayout={({ nativeEvent }) => {
              textComponentLayoutsRefs.current[data.item.id] = nativeEvent;
            }}
            style={[styles.text, hmsRoomStyles.text]}
          >
            {text ? (
              <Text style={hmsRoomStyles.highlightedText}>{sender}: </Text>
            ) : null}
            {text ?? sender}
          </Text>
        </TouchableOpacity>
      );
    },
    [listHeight, handleTapOnPinnedMessage]
  );

  const _keyExtractor = React.useCallback((item: PinnedMessage) => item.id, []);

  const tapGesture = React.useMemo(() => Gesture.Tap(), []);

  const extraData = React.useMemo(
    () => [listHeight, pinnedMessages],
    [listHeight, pinnedMessages]
  );

  if (pinnedMessages.length <= 0) {
    return null;
  }

  return (
    <GestureDetector gesture={tapGesture}>
      <View
        style={[
          insetMode ? styles.insetContainer : styles.container,
          insetMode ? hmsRoomStyles.insetContainer : null,
        ]}
      >
        <View
          style={[
            styles.pinContainer,
            insetMode ? { paddingRight: 0 } : hmsRoomStyles.pinContainer,
            { height: listHeight + 16 },
          ]}
        >
          {pinnedMessages.length > 1 ? (
            <View style={{ marginRight: 8, flexDirection: 'column' }}>
              {pinnedMessages.map((message, idx) => {
                const isFirst = idx === 0;
                const isSelected = selectedPinnedMessageIndex === idx;
                return (
                  <React.Fragment key={message.id}>
                    {isFirst ? null : (
                      <View style={[{ height: 3, width: 2 }]} />
                    )}

                    <View
                      style={[
                        { width: 2, flexGrow: 1, borderRadius: 16 },
                        isSelected
                          ? hmsRoomStyles.activeMessageContainer
                          : hmsRoomStyles.inactiveMessageContainer,
                      ]}
                    />
                  </React.Fragment>
                );
              })}
            </View>
          ) : null}

          <FlashList
            ref={listRef}
            data={pinnedMessages}
            extraData={extraData}
            showsVerticalScrollIndicator={false}
            pagingEnabled={true}
            keyboardShouldPersistTaps="always"
            renderItem={_renderItem}
            keyExtractor={_keyExtractor}
            estimatedItemSize={40}
            onViewableItemsChanged={_handleViewableItemsChanged}
            viewabilityConfig={FLATLIST_VIEWABILITY_CONFIG}
          />
        </View>

        {allowPinningMessage ? (
          <TouchableOpacity
            style={{ marginLeft: 8 }}
            onPress={handleUnpinMessagePress}
          >
            <PinIcon
              type="unpin"
              style={[styles.icon, hmsRoomStyles.closeIcon]}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  insetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 8,
    marginBottom: 4,
    borderRadius: 8,
    paddingRight: 8,
  },
  pinContainer: {
    flexDirection: 'row',
    flexGrow: 1,
    flexShrink: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingRight: 8,
    paddingLeft: 8,
  },
  textWrapper: {
    maxHeight: 50,
    marginHorizontal: 8,
  },
  icon: {
    width: 20,
    height: 20,
    // marginTop: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
});
