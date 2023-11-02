import React from 'react';
import {
  ReturnKeyTypeOptions,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import type { TextInputProps, TouchableOpacityProps } from 'react-native';

import { COLORS } from '../utils/theme';
import { CloseIcon } from '../icons';

const CustomInput = ({
  inputTestID,
  clearTestID,
  value,
  title,
  onChangeText,
  placeholderTextColor,
  placeholder,
  textStyle,
  viewStyle,
  clearButtonStyle,
  inputStyle,
  defaultValue,
  returnKeyType,
  multiline,
  blurOnSubmit,
  disableFullscreenUI = true,
  clear = true,
  autoCapitalize = 'none',
  autoCorrect = false,
  autoCompleteType = 'off',
}: {
  inputTestID?: TextInputProps['testID'];
  clearTestID?: TouchableOpacityProps['testID'];
  value?: string;
  title?: string;
  onChangeText: Function;
  placeholderTextColor?: string;
  placeholder?: string;
  textStyle?: StyleProp<TextStyle>;
  viewStyle?: StyleProp<ViewStyle>;
  clearButtonStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  defaultValue?: string;
  returnKeyType?: ReturnKeyTypeOptions;
  multiline?: boolean;
  blurOnSubmit?: boolean;
  disableFullscreenUI?: boolean;
  clear?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoCompleteType?:
    | 'off'
    | 'cc-csc'
    | 'cc-exp'
    | 'cc-exp-month'
    | 'cc-exp-year'
    | 'cc-number'
    | 'email'
    | 'name'
    | 'password'
    | 'postal-code'
    | 'street-address'
    | 'tel'
    | 'username';
}) => {
  const showClear = clear && value !== undefined && value?.length > 0;

  const onChange = (newValue: string) => {
    onChangeText(newValue);
  };

  return (
    <View style={[styles.inputContainer, viewStyle]}>
      {title && <Text style={textStyle}>{title}</Text>}
      <View>
        <TextInput
          testID={inputTestID}
          disableFullscreenUI={disableFullscreenUI}
          value={value}
          onChangeText={onChange}
          placeholderTextColor={placeholderTextColor}
          placeholder={placeholder}
          style={[
            !multiline && styles.input,
            showClear && styles.clear,
            inputStyle,
          ]}
          defaultValue={defaultValue}
          returnKeyType={returnKeyType}
          multiline={multiline}
          blurOnSubmit={blurOnSubmit}
          keyboardAppearance="dark"
          autoCapitalize={autoCapitalize}
          autoCorrect={true}
          textContentType={'name'}
          autoCompleteType={'name'}
        />
        {showClear && (
          <TouchableOpacity
            testID={clearTestID}
            onPress={() => {
              onChange('');
            }}
            style={[styles.clearContainer, clearButtonStyle]}
          >
            <CloseIcon style={styles.clearIcon} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
  },
  input: {
    height: 48,
  },
  clearContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  clear: {
    paddingRight: 40,
  },
  clearIcon: {
    tintColor: COLORS.TEXT.HIGH_EMPHASIS,
  },
});

export { CustomInput };
