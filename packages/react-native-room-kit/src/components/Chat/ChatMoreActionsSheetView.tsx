import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { hexToRgbA } from '../../utils/theme';
import { useHMSRoomStyleSheet } from '../../hooks-util';
import type { RootState } from '../../redux';
import { setChatMoreActionsSheetVisible } from '../../redux/actions';
import { ChatMoreActionsView } from './ChatMoreActionsView';

interface ChatMoreActionsSheetViewProps {}

const _ChatMoreActionsSheetView: React.FC<
  ChatMoreActionsSheetViewProps
> = ({}) => {
  const dispatch = useDispatch();
  const chatMoreActionsSheetVisible = useSelector(
    (state: RootState) => state.app.chatMoreActionsSheetVisible
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    backdrop: {
      backgroundColor:
        theme.palette.background_dim &&
        hexToRgbA(theme.palette.background_dim, 0.05),
    },
  }));

  const closeFiltersBottomSheet = () => {
    dispatch(setChatMoreActionsSheetVisible(false));
  };

  if (!chatMoreActionsSheetVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={closeFiltersBottomSheet}
        style={[styles.backdrop, hmsRoomStyles.backdrop]}
      />

      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(150)}
        style={styles.contentContainer}
      >
        <ChatMoreActionsView />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    position: 'absolute',
    top: 60,
    right: 48,
    overflow: 'hidden',
  },
});

export const ChatMoreActionsSheetView = React.memo(_ChatMoreActionsSheetView);
