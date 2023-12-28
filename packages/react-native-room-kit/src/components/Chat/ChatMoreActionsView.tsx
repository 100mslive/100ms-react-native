import * as React from 'react';
import { useDispatch } from 'react-redux';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';

import { PauseCircleIcon } from '../../Icons';
import { useHMSChatState, useHMSRoomStyleSheet } from '../../hooks-util';
import { setChatMoreActionsSheetVisible } from '../../redux/actions';

interface ChatMoreActionsViewProps {
  onDismiss?: () => void;
}

const _ChatMoreActionsView: React.FC<ChatMoreActionsViewProps> = ({
  onDismiss,
}) => {
  const dispatch = useDispatch();
  const { chatState, setChatState } = useHMSChatState();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      backgroundColor: theme.palette.surface_default,
      borderColor: theme.palette.border_default,
    },
    // --- Button Item Styles ---
    buttonText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  const pauseChatHandler = () => {
    setChatState(!chatState.enabled);
    if (onDismiss) {
      onDismiss();
    } else {
      dispatch(setChatMoreActionsSheetVisible(false));
    }
  };

  return (
    <View style={[styles.container, hmsRoomStyles.container]}>
      <TouchableOpacity onPress={pauseChatHandler} style={styles.button}>
        <View style={styles.buttonWrapper}>
          {chatState.enabled ? (
            <PauseCircleIcon style={styles.buttonIcon} />
          ) : null}
          <Text style={[styles.buttonText, hmsRoomStyles.buttonText]}>
            {chatState.enabled ? 'Pause Chat' : 'Resume Chat'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  // --- Button Item Styles ---
  button: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  buttonWrapper: {
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
});

export const ChatMoreActionsView = React.memo(_ChatMoreActionsView);
