import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { hexToRgbA } from '../../utils/theme';
import { ChatFilterView } from './ChatFilterView';
import { useHMSRoomStyleSheet } from '../../hooks-util';
import type { RootState } from '../../redux';
import { setChatFilterSheetVisible } from '../../redux/actions';

interface ChatFilterBottomSheetViewProps {}

const _ChatFilterBottomSheetView: React.FC<ChatFilterBottomSheetViewProps> = ({
}) => {
  const dispatch = useDispatch();
  const chatFilterSheetVisible = useSelector((state: RootState) => state.app.chatFilterSheetVisible);

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    backdrop: {
      backgroundColor: hexToRgbA(theme.palette.background_dim, 0.1),
    },
    contentContainer: {
      backgroundColor: theme.palette.surface_default,
    },
  }));

  const closeFiltersBottomSheet = () => {
    dispatch(setChatFilterSheetVisible(false));
  }

  if (!chatFilterSheetVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={closeFiltersBottomSheet}
        style={[styles.backdrop, hmsRoomStyles.backdrop]}
      />

      <Animated.View
        entering={SlideInDown}
        exiting={SlideOutDown}
        style={[styles.contentContainer, hmsRoomStyles.contentContainer]}
      >
        <ChatFilterView />
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
    width: '100%',
    minHeight: 352,
    maxHeight: '80%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});

export const ChatFilterBottomSheetView = React.memo(_ChatFilterBottomSheetView);
