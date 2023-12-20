import * as React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import {
  useHMSCanDisableChat,
  useHMSChatState,
  useHMSRoomStyleSheet,
} from '../../hooks-util';
import { HMSPrimaryButton } from '../HMSPrimaryButton';
import { hexToRgbA } from '../../utils/theme';

interface ChatPausedProps {
  insetMode?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const _ChatPaused: React.FC<ChatPausedProps> = ({
  insetMode = false,
  style,
}) => {
  const canDisableChat = useHMSCanDisableChat();
  const { chatState, setChatState } = useHMSChatState();

  const hmsRoomStyles = useHMSRoomStyleSheet(
    (theme, typography) => ({
      container: {
        backgroundColor: insetMode
          ? theme.palette.background_dim &&
            hexToRgbA(theme.palette.background_dim, 0.64)
          : theme.palette.surface_default,
      },
      title: {
        color: theme.palette.on_surface_high,
        fontFamily: `${typography.font_family}-SemiBold`,
      },
      subtitle: {
        color: theme.palette.on_surface_medium,
        fontFamily: `${typography.font_family}-Regular`,
      },
    }),
    [insetMode]
  );

  const resumeChatHandler = () => {
    setChatState(true);
  };

  return (
    <View style={[styles.container, hmsRoomStyles.container, style]}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, hmsRoomStyles.title]}>Chat Paused</Text>

        <Text
          numberOfLines={1}
          style={[styles.subtitle, hmsRoomStyles.subtitle]}
        >
          Chat has been paused by{' '}
          {!chatState.enabled ? chatState.updatedBy.userName : null}
        </Text>
      </View>

      {canDisableChat ? (
        <HMSPrimaryButton
          title="Resume"
          loading={false}
          onPress={resumeChatHandler}
          style={styles.resumeBtn}
          wrapWithGestureDetector={true}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingRight: 8,
    paddingLeft: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flexGrow: 1,
    flexShrink: 1,
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  resumeBtn: { marginLeft: 16 },
});

export const ChatPaused = React.memo(_ChatPaused);
