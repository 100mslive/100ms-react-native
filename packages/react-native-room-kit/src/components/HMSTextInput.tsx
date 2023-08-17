import * as React from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';

import {
  useHMSRoomColorPalette,
  useHMSRoomStyleSheet,
} from '../hooks-util';

export interface HMSTextInputProps {
  value: string;
  onChangeText(text: string): void;
  style?: StyleProp<TextStyle>;
  autoFocus?: boolean;
}

export const HMSTextInput: React.FC<HMSTextInputProps> = ({ value, onChangeText, style, autoFocus }) => {
  const [inputFocused, setInputFocused] = React.useState(false);

  const handleInputFocus = () => setInputFocused(true);

  const handleInputBlur = () => setInputFocused(false);

  const {
    on_surface_low: onSurfaceLowColor,
    on_surface_high: onSurfaceHighColor,
  } = useHMSRoomColorPalette();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    input: {
      backgroundColor: theme.palette.surface_default,
      color: theme.palette.on_surface_high,
      borderColor: theme.palette.surface_default,
      fontFamily: `${typography.font_family}-Regular`,
    },
    focusedInput: {
      borderColor: theme.palette.primary_default,
      borderWidth: 2,
    },
  }));

  return (
    <TextInput
      style={[
        styles.input,
        hmsRoomStyles.input,
        inputFocused ? hmsRoomStyles.focusedInput : null,
        style,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder="Enter Name..."
      autoCapitalize="words"
      autoCompleteType="name"
      placeholderTextColor={onSurfaceLowColor}
      selectionColor={onSurfaceHighColor}
      onFocus={handleInputFocus}
      onBlur={handleInputBlur}
      autoFocus={autoFocus}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 50,
    textAlignVertical: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    lineHeight: Platform.OS === 'android' ? 24 : undefined,
    letterSpacing: 0.5,
    borderWidth: 2,
  },
});
