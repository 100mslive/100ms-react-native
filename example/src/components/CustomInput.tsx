import React from 'react';
import {
  ReturnKeyTypeOptions,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

const CustomInput = ({
  value,
  title,
  onChangeText,
  placeholderTextColor,
  placeholder,
  textStyle,
  viewStyle,
  inputStyle,
  defaultValue,
  returnKeyType,
  multiline,
  blurOnSubmit,
  disableFullscreenUI = true,
}: {
  value?: string;
  title?: string;
  onChangeText: Function;
  placeholderTextColor?: string;
  placeholder?: string;
  textStyle?: StyleProp<TextStyle>;
  viewStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  defaultValue?: string;
  returnKeyType?: ReturnKeyTypeOptions;
  multiline?: boolean;
  blurOnSubmit?: boolean;
  disableFullscreenUI?: boolean;
}) => {
  const onChange = (newValue: string) => {
    onChangeText(newValue);
  };
  return (
    <View style={[styles.inputContainer, viewStyle]}>
      {title && <Text style={textStyle}>{title}</Text>}
      <TextInput
        disableFullscreenUI={disableFullscreenUI}
        value={value}
        onChangeText={onChange}
        placeholderTextColor={placeholderTextColor}
        placeholder={placeholder}
        style={[!multiline && styles.input, inputStyle]}
        defaultValue={defaultValue}
        returnKeyType={returnKeyType}
        multiline={multiline}
        blurOnSubmit={blurOnSubmit}
      />
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
});

export {CustomInput};
