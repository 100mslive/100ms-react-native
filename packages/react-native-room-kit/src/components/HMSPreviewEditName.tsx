import * as React from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { changeUsername } from '../redux/actions';
import {
  useHMSConfig,
  useHMSRoomColorPalette,
  useHMSRoomStyleSheet,
} from '../hooks-util';

export interface HMSPreviewEditNameProps {}

export const HMSPreviewEditName: React.FC<HMSPreviewEditNameProps> = () => {
  const dispatch = useDispatch();
  const { updateConfig } = useHMSConfig();
  const userName = useSelector((state: RootState) => state.user.userName);
  const [inputFocused, setInputFocused] = React.useState(false);

  const handleNameChange = (name: string) => {
    dispatch(changeUsername(name));
    updateConfig({ username: name });
  };

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
      ]}
      value={userName}
      onChangeText={handleNameChange}
      placeholder="Enter Name..."
      autoCapitalize="words"
      autoCompleteType="name"
      placeholderTextColor={onSurfaceLowColor}
      selectionColor={onSurfaceHighColor}
      onFocus={handleInputFocus}
      onBlur={handleInputBlur}
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
