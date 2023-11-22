import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ChevronIcon } from '../../Icons';
import type { RootState } from '../../redux';
import { useHMSRoomStyleSheet } from '../../hooks-util';
import { setChatFilterSheetVisible } from '../../redux/actions';

interface ChatFilterBottomSheetOpenerProps {}

const _ChatFilterBottomSheetOpener: React.FC<
  ChatFilterBottomSheetOpenerProps
> = () => {
  const dispatch = useDispatch();
  const filter = useSelector(
    (state: RootState) => state.chatWindow.sendTo.name as string
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    label: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    button: {
      borderColor: theme.palette.border_bright,
    },
    buttonText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  const openChatFiltersSheet = () => {
    dispatch(setChatFilterSheetVisible(true));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, hmsRoomStyles.label]}>SEND TO</Text>

      <TouchableOpacity
        onPress={openChatFiltersSheet}
        style={[styles.button, hmsRoomStyles.button]}
      >
        <Text style={[styles.buttonText, hmsRoomStyles.buttonText]}>
          {filter}
        </Text>

        <ChevronIcon direction="down" style={styles.buttonIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 16,
  },
  label: {
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
  },
  button: {
    padding: 4,
    paddingLeft: 8,
    flexDirection: 'row',
    marginLeft: 8,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 10,
    textTransform: 'uppercase',
    lineHeight: 16,
    letterSpacing: 1.5,
  },
  buttonIcon: { width: 16, height: 16, marginLeft: 4 },
});

export const ChatFilterBottomSheetOpener = React.memo(
  _ChatFilterBottomSheetOpener
);
