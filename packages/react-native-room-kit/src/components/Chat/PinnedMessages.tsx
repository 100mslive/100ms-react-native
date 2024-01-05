import * as React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import type { ViewabilityConfig } from 'react-native';
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

const FLATLIST_VIEWABILITY_CONFIG: ViewabilityConfig = {
  waitForInteraction: true,
  itemVisiblePercentThreshold: 90,
};

interface PinnedMessagesProps {
  insetMode?: boolean;
}

const LINE_HEIGHT = 20;

enum NumOfLines {
  EXPANDED = 6,
  COLLAPSED = 3,
}

const Heights = {
  EXAPANDED: NumOfLines.EXPANDED * LINE_HEIGHT + 2,
  COLLAPSED: NumOfLines.COLLAPSED * LINE_HEIGHT + 2,
};

export const _PinnedMessages: React.FC<PinnedMessagesProps> = ({
  insetMode = false,
}) => {
  const listRef = React.useRef<null | React.ElementRef<
    typeof FlashList<PinnedMessage>
  >>(null);

  const [numOfLinesInText, setNumOfLinesInText] = React.useState<
    Record<string, number>
  >({});
  const numOfLinesInTextRef = React.useRef(numOfLinesInText);

  const [listHeight, setListHeight] = React.useState(Heights.COLLAPSED);
  const listHeightRef = React.useRef(Heights.COLLAPSED);

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
    ellipsis: {
      backgroundColor:
        theme.palette.background_dim &&
        hexToRgbA(theme.palette.background_dim, 0.64),
    },
  }));

  const handleTapOnPinnedMessage = React.useCallback(() => {
    setListHeight((prevListHeight) => {
      let updated =
        prevListHeight > Heights.COLLAPSED
          ? Heights.COLLAPSED
          : Heights.EXAPANDED;

      listHeightRef.current = updated;
      return updated;
    });
  }, []);

  const handleUnpinMessagePress = React.useCallback(() => {
    const visiblePinnedMessage =
      pinnedMessages[selectedPinnedMessageIndexRef.current];
    if (visiblePinnedMessage) {
      if (listHeight > Heights.COLLAPSED) {
        setListHeight(Heights.COLLAPSED);
        listHeightRef.current = Heights.COLLAPSED;
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
          if (firstViewable.index !== null) {
            return firstViewable.index;
          }
          return currIndex;
        });
        selectedPinnedMessageIndexRef.current = firstViewable.index;

        const visiblePinnedMessage =
          pinnedMessages[selectedPinnedMessageIndexRef.current];

        if (
          viewableIndexChanged &&
          listHeightRef.current > Heights.COLLAPSED &&
          visiblePinnedMessage
        ) {
          const visibleMessageExpandable =
            numOfLinesInTextRef.current[visiblePinnedMessage.id];
          if (!visibleMessageExpandable) {
            setListHeight(Heights.COLLAPSED);
            listHeightRef.current = Heights.COLLAPSED;
          }
        }
      }
    },
    [pinnedMessages]
  );

  const _renderItem = React.useCallback(
    (data: { item: PinnedMessage }) => {
      const numOfLines = numOfLinesInText[data.item.id];
      const [sender, text] = data.item.text.split(':');

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={typeof numOfLines !== 'number'}
          onPress={
            typeof numOfLines === 'number'
              ? handleTapOnPinnedMessage
              : undefined
          }
          style={{
            height: listHeight,
            justifyContent: 'center',
            overflow:
              Platform.OS === 'ios' && typeof numOfLines !== 'number'
                ? 'scroll'
                : 'hidden',
          }}
        >
          {listHeight >= Heights.EXAPANDED &&
          typeof numOfLines === 'number' &&
          numOfLines > NumOfLines.EXPANDED ? (
            <ScrollView
              nestedScrollEnabled={true}
              contentContainerStyle={{ paddingBottom: 12 }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleTapOnPinnedMessage}
              >
                <Text
                  onTextLayout={({ nativeEvent }) => {
                    if (nativeEvent.lines.length > NumOfLines.COLLAPSED) {
                      setNumOfLinesInText((prev) => {
                        const currentValue = prev[data.item.id];
                        let updated;
                        if (
                          typeof currentValue === 'number' &&
                          currentValue === nativeEvent.lines.length
                        ) {
                          updated = prev;
                        } else {
                          updated = {
                            ...prev,
                            [data.item.id]: nativeEvent.lines.length,
                          };
                        }
                        numOfLinesInTextRef.current = updated;
                        return updated;
                      });
                    }
                  }}
                  style={[styles.text, hmsRoomStyles.text]}
                  numberOfLines={
                    listHeight === Heights.COLLAPSED &&
                    typeof numOfLines === 'number'
                      ? 3
                      : undefined
                  }
                >
                  {text ? (
                    <Text style={hmsRoomStyles.highlightedText}>
                      {sender}:{' '}
                    </Text>
                  ) : null}
                  {text ?? sender}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <Text
              onTextLayout={({ nativeEvent }) => {
                if (nativeEvent.lines.length > NumOfLines.COLLAPSED) {
                  setNumOfLinesInText((prev) => {
                    const currentValue = prev[data.item.id];
                    let updated;
                    if (
                      typeof currentValue === 'number' &&
                      currentValue === nativeEvent.lines.length
                    ) {
                      updated = prev;
                    } else {
                      updated = {
                        ...prev,
                        [data.item.id]: nativeEvent.lines.length,
                      };
                    }
                    numOfLinesInTextRef.current = updated;
                    return updated;
                  });
                }
              }}
              style={[styles.text, hmsRoomStyles.text]}
              numberOfLines={
                listHeight === Heights.COLLAPSED &&
                typeof numOfLines === 'number'
                  ? 3
                  : undefined
              }
            >
              {text ? (
                <Text style={hmsRoomStyles.highlightedText}>{sender}: </Text>
              ) : null}
              {text ?? sender}
            </Text>
          )}
        </TouchableOpacity>
      );
    },
    [listHeight, numOfLinesInText, handleTapOnPinnedMessage]
  );

  const _keyExtractor = React.useCallback((item: PinnedMessage) => item.id, []);

  const _onContentSizeChange = React.useCallback(
    (_w, _h) => {
      listRef.current?.scrollToOffset({
        offset: listHeight * selectedPinnedMessageIndexRef.current,
        animated: false,
      });
    },
    [listHeight]
  );

  const tapGesture = React.useMemo(() => Gesture.Tap(), []);

  const extraData = React.useMemo(
    () => [listHeight, numOfLinesInText, pinnedMessages],
    [listHeight, numOfLinesInText, pinnedMessages]
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
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="always"
            renderItem={_renderItem}
            keyExtractor={_keyExtractor}
            onContentSizeChange={_onContentSizeChange}
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

export const PinnedMessages = React.memo(_PinnedMessages);

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
