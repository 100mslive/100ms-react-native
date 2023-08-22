import * as React from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type {
  StyleProp,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';

import { useHMSRoomColorPalette, useHMSRoomStyleSheet } from '../hooks-util';
import { SendIcon } from '../Icons';

export type HMSTextInputProps = TextInputProps & {
  value: string;
  focusedStyle?: StyleProp<TextStyle>;
} & (
    | {
        leftIcon: React.ReactElement;
        containerStyle?: StyleProp<ViewStyle>;
        focusedContainerStyle?: StyleProp<ViewStyle>;
      }
    | {
        leftIcon?: undefined;
        sendIcon: boolean;
        onSendIconPress(): void;
        containerStyle?: StyleProp<ViewStyle>;
        focusedContainerStyle?: StyleProp<ViewStyle>;
      }
    | { leftIcon?: undefined; sendIcon?: undefined }
  );

export const HMSTextInput: React.FC<HMSTextInputProps> = ({
  value,
  onChangeText,
  style,
  focusedStyle,
  ...resetProps
}) => {
  const [inputFocused, setInputFocused] = React.useState(false);

  const handleInputFocus = () => setInputFocused(true);

  const handleInputBlur = () => setInputFocused(false);

  const {
    on_surface_low: onSurfaceLowColor,
    on_surface_high: onSurfaceHighColor,
  } = useHMSRoomColorPalette();

  const containerExists = resetProps.leftIcon || resetProps.sendIcon;

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    // TEXT INPUT STYLES
    input: {
      backgroundColor: theme.palette.surface_default,
      color: theme.palette.on_surface_high,
      borderColor: theme.palette.surface_default,
      fontFamily: `${typography.font_family}-Regular`,
    },
    // when text input is inside container
    childInput: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
    focusedInput: {
      borderColor: theme.palette.primary_default,
      borderWidth: 2,
    },
    // when text input is inside container
    focusedChildInput: {},

    // CONTAINER STYLES
    container: {
      backgroundColor: theme.palette.surface_default,
      borderColor: theme.palette.surface_default,
    },
    focusedContainer: {
      borderColor: theme.palette.primary_default,
      borderWidth: 2,
    },

    // ICON STYLES
    sendIcon: {
      tintColor: theme.palette.on_surface_low,
    },
    focusedSendIcon: {
      tintColor: theme.palette.on_surface_high,
    },
  }));

  const textInputStyles: StyleProp<TextStyle> = [
    // regular styles
    containerExists ? styles.childInput : styles.input,
    containerExists ? hmsRoomStyles.childInput : hmsRoomStyles.input, // theme regular styles
    style, // user provided regular styles

    // focused styles
    inputFocused
      ? containerExists
        ? hmsRoomStyles.focusedChildInput
        : hmsRoomStyles.focusedInput
      : null, // theme focused styles
    inputFocused ? focusedStyle : null, // user provided focused styles
  ];

  const textInputComp = (
    <TextInput
      {...resetProps}
      style={textInputStyles}
      value={value}
      onChangeText={onChangeText}
      placeholder={resetProps.placeholder ?? 'Enter Name...'}
      autoCapitalize={resetProps.autoCapitalize ?? 'words'}
      autoCompleteType={resetProps.autoCompleteType ?? 'name'}
      placeholderTextColor={
        resetProps.placeholderTextColor ?? onSurfaceLowColor
      }
      selectionColor={resetProps.selectionColor ?? onSurfaceHighColor}
      onFocus={resetProps.onFocus ?? handleInputFocus}
      onBlur={resetProps.onBlur ?? handleInputBlur}
    />
  );

  if (!containerExists) {
    return textInputComp;
  }

  const containerStyles: StyleProp<ViewStyle> = [
    // regular styles
    styles.container,
    hmsRoomStyles.container, // theme regular styles
    resetProps.leftIcon || resetProps.sendIcon
      ? resetProps.containerStyle
      : null, // user provided regular styles

    // focused styles
    inputFocused ? hmsRoomStyles.focusedContainer : null, // theme focused styles
    inputFocused && (resetProps.leftIcon || resetProps.sendIcon)
      ? resetProps.focusedContainerStyle
      : null, // user provided focused styles
  ];

  return (
    <View style={containerStyles}>
      {textInputComp}

      {resetProps.leftIcon ||
        (resetProps.sendIcon ? (
          <TouchableOpacity
            style={styles.sendIconButton}
            onPress={resetProps.onSendIconPress}
          >
            <SendIcon
              style={[
                hmsRoomStyles.sendIcon,
                inputFocused ? hmsRoomStyles.focusedSendIcon : null,
              ]}
            />
          </TouchableOpacity>
        ) : null)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 50,
    overflow: 'hidden',
    paddingLeft: 16,
    paddingRight: 8,
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: 'row',
  },
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
  childInput: {
    flex: 1,
    textAlignVertical: 'center',
    marginRight: 8,
    fontSize: 16,
    lineHeight: Platform.OS === 'android' ? 24 : undefined,
    letterSpacing: 0.5,
  },
  sendIconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
