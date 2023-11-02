import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { HMSTextInput } from './HMSTextInput';
import { useHMSRoomStyleSheet, useSendMessage } from '../hooks-util';
import { TestIds } from '../utils/constants';

interface HMSSendMessageInputProps {
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const HMSSendMessageInput: React.FC<HMSSendMessageInputProps> = ({
  style,
  containerStyle,
}) => {
  const { message, sendMessage, setMessage } = useSendMessage();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    containerStyle: {
      backgroundColor: theme.palette.surface_dim,
      borderColor: theme.palette.surface_dim,
    },
  }));

  return (
    <HMSTextInput
      testID={TestIds.enter_message_input}
      style={[styles.input, style]}
      value={message}
      onChangeText={setMessage}
      placeholder="Send a message..."
      autoCapitalize="sentences"
      autoCompleteType="off"
      containerStyle={[
        styles.inputContainer,
        hmsRoomStyles.containerStyle,
        containerStyle,
      ]}
      sendIcon={true}
      sendIconTestID={TestIds.send_message_cta}
      onSendIconPress={sendMessage}
      onSubmitEditing={sendMessage}
      returnKeyType="send"
    />
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: 14,
    lineHeight: Platform.OS === 'android' ? 20 : undefined,
    letterSpacing: 0.25,
  },
  inputContainer: {
    height: 40,
    marginHorizontal: 8,
    marginTop: 4,
    marginBottom: 8,
  },
});
