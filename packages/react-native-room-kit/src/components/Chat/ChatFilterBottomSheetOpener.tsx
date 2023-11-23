import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ChevronIcon, ThreeDotsIcon } from '../../Icons';
import type { RootState } from '../../redux';
import {
  useHMSCanDisableChat,
  useHMSRoomStyleSheet,
  useModalType,
} from '../../hooks-util';
import {
  setChatFilterSheetVisible,
  setChatMoreActionsSheetVisible,
} from '../../redux/actions';
import { PressableIcon } from '../PressableIcon';
import { ModalTypes } from '../../utils/types';

interface ChatFilterBottomSheetOpenerProps {
  insetMode?: boolean;
}

const _ChatFilterBottomSheetOpener: React.FC<
  ChatFilterBottomSheetOpenerProps
> = ({ insetMode = false }) => {
  const dispatch = useDispatch();
  const canDisableChat = useHMSCanDisableChat();
  const filter = useSelector(
    (state: RootState) => state.chatWindow.sendTo.name as string
  );
  const { handleModalVisibleType } = useModalType();

  const hmsRoomStyles = useHMSRoomStyleSheet(
    (theme, typography) => ({
      label: {
        color: theme.palette.on_surface_medium,
        fontFamily: `${typography.font_family}-SemiBold`,
      },
      button: {
        backgroundColor: theme.palette.surface_dim,
        borderColor: theme.palette.border_bright,
      },
      buttonText: {
        color: theme.palette.on_surface_high,
        fontFamily: `${typography.font_family}-SemiBold`,
      },
      moreActionIcon: {
        tintColor: insetMode
          ? theme.palette.on_surface_low
          : theme.palette.on_surface_medium,
      },
    }),
    [insetMode]
  );

  const openChatFiltersSheet = () => {
    if (insetMode) {
      // Keyboard.dismiss();
      handleModalVisibleType(ModalTypes.CHAT_FILTER);
    } else {
      dispatch(setChatFilterSheetVisible(true));
    }
  };

  const openChatMoreActionsSheet = () => {
    if (insetMode) {
      handleModalVisibleType(ModalTypes.CHAT_MORE_ACTIONS);
    } else {
      dispatch(setChatMoreActionsSheetVisible(true));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sendToContainer}>
        <Text style={[styles.label, hmsRoomStyles.label]}>TO</Text>

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

      {canDisableChat ? (
        <PressableIcon
          onPress={openChatMoreActionsSheet}
          style={styles.moreAction}
        >
          <ThreeDotsIcon stack="vertical" style={styles.moreActionIcon} />
        </PressableIcon>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sendToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreAction: {
    padding: 4,
    borderRadius: 4,
  },
  moreActionIcon: {
    width: 16,
    height: 16,
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
  buttonIcon: {
    width: 16,
    height: 16,
    marginLeft: 4,
  },
});

export const ChatFilterBottomSheetOpener = React.memo(
  _ChatFilterBottomSheetOpener
);
