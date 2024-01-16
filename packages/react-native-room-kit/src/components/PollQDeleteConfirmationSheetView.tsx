import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { hexToRgbA } from '../utils/theme';
import { useHMSRoomStyleSheet } from '../hooks-util';
import type { RootState } from '../redux';
import { setPollQDeleteConfirmationVisible } from '../redux/actions';
import { PollQuestionDeleteConfirmation } from './PollQuestionDeleteConfirmation';

interface PollQDeleteConfirmationSheetViewProps {}

const _PollQDeleteConfirmationSheetView: React.FC<
  PollQDeleteConfirmationSheetViewProps
> = ({}) => {
  const dispatch = useDispatch();
  const deleteConfirmationVisible = useSelector(
    (state: RootState) => state.polls.deleteConfirmationVisible
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    backdrop: {
      backgroundColor:
        theme.palette.background_dim &&
        hexToRgbA(theme.palette.background_dim, 0.1),
    },
    contentContainer: {
      backgroundColor: theme.palette.surface_dim,
    },
  }));

  const closeBottomSheet = () => {
    dispatch(setPollQDeleteConfirmationVisible(false));
  };

  if (!deleteConfirmationVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={closeBottomSheet}
        style={[styles.backdrop, hmsRoomStyles.backdrop]}
      />

      <Animated.View
        entering={SlideInDown}
        exiting={SlideOutDown}
        style={[styles.contentContainer, hmsRoomStyles.contentContainer]}
      >
        <PollQuestionDeleteConfirmation dismissModal={closeBottomSheet} />
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
    alignSelf: 'center',
  },
  backdrop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});

export const PollQDeleteConfirmationSheetView = React.memo(
  _PollQDeleteConfirmationSheetView
);
