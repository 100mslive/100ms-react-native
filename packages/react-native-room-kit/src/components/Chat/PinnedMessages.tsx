import * as React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSelector, useStore } from 'react-redux';
import type { FlashList } from '@shopify/flash-list';

import type { RootState } from '../../redux';
import { useHMSRoomStyleSheet } from '../../hooks-util';
import { CloseIcon, PinIcon } from '../../Icons';
import { PressableIcon } from '../PressableIcon';

export interface PinnedMessagesProps {
  flashlistRef: React.ElementRef<typeof FlashList>;
}

export const PinnedMessages = ({ flashlistRef }) => {
  const reduxStore = useStore<RootState>();
  const [selectedPinnedMessageIndex, setSelectedMessageIndex] = React.useState(0);
  const [numOfLinesRestricted, setNumOfLinesRestricted] = React.useState(true);
  const canChangeRef = React.useRef(false);


  const pinnedMessages = useSelector(
    (state: RootState) => state.messages.pinnedMessages
  );
  const hmsSessionStore = useSelector(
    (state: RootState) => state.user.hmsSessionStore
  );

  if (selectedPinnedMessageIndex > 0 && selectedPinnedMessageIndex + 1 > pinnedMessages.length) {
    setSelectedMessageIndex(0);
  }

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
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

  // const removePinnedMessage = React.useCallback(async () => {
  //   // If instance of HMSSessionStore is available
  //   if (hmsSessionStore) {
  //     try {
  //       // set `value` on `session` with key 'pinnedMessages'
  //       const response = await hmsSessionStore.set(null, 'pinnedMessages');
  //       console.log('setSessionMetaData Response -> ', response);
  //     } catch (error) {
  //       console.log('setSessionMetaData Error -> ', error);
  //     }
  //   }
  // }, [hmsSessionStore]);

  const handlePinnedMessagePress = () => {
    const currentMessage = pinnedMessages[selectedPinnedMessageIndex]; // 0

    if (!currentMessage) return;

    let newIndex = selectedPinnedMessageIndex; // 0

    if (canChangeRef.current) {
      setSelectedMessageIndex(currIndex => {
        if (currIndex + 1 >= pinnedMessages.length) {
          newIndex = 0;
          return 0;
        }
        newIndex = currIndex + 1;
        return currIndex + 1;
      });
    }

    const newSelectedPinnedMessage = pinnedMessages[newIndex];

    if (!newSelectedPinnedMessage) return;

    const messagesList = reduxStore.getState().messages.messages;

    // find the index of newSelectedPinnedMessage in list
    const msgIndex = messagesList.findIndex(message => message.messageId === newSelectedPinnedMessage.id);

    if (msgIndex >= 0) {
      setNumOfLinesRestricted(true);
      // scroll to message
    } else {
      setNumOfLinesRestricted(false);
      // show full msg by increasing numOfLines
    }

    canChangeRef.current = true;
  }

  if (pinnedMessages.length <= 0) {
    return null;
  }

  const pinnedMessageToShow = pinnedMessages[selectedPinnedMessageIndex];

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.8} style={[styles.pinContainer, hmsRoomStyles.pinContainer]} onPress={handlePinnedMessagePress}>

        {pinnedMessages.length > 1 ? (
          <View style={{ marginRight: 8, flexDirection: 'column' }}>
            {pinnedMessages.map((message, idx) => {
              const isFirst = idx === 0;
              const isSelected = selectedPinnedMessageIndex === idx;

              return (
                <React.Fragment key={message.id}>
                  {isFirst ? null : <View style={[{ height: 3, width: 2 }]} />}

                  <View
                    style={[
                      { width: 2, flexGrow: 1, borderRadius: 16 },
                      isSelected
                        ? hmsRoomStyles.activeMessageContainer
                        : hmsRoomStyles.inactiveMessageContainer
                    ]}
                  />
                </React.Fragment>
              );
            })}
          </View>
        ) : null}

        {pinnedMessageToShow ? (
          <Text style={[styles.text, hmsRoomStyles.text]} numberOfLines={numOfLinesRestricted ? 2 : undefined}>
            {pinnedMessageToShow.pinnedBy ? (
              <Text style={hmsRoomStyles.highlightedText}>{pinnedMessageToShow.pinnedBy}: </Text>
            ) : null}{pinnedMessageToShow.text}{pinnedMessageToShow.text}
          </Text>
        ) : null}
      </TouchableOpacity>

      <TouchableOpacity style={{}} onPress={undefined}>
        <PinIcon type='unpin' style={[styles.icon, hmsRoomStyles.closeIcon]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  pinContainer: {
    flexDirection: 'row',
    flexGrow: 1,
    flexShrink: 1,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
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
