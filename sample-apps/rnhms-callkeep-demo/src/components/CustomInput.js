import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {COLORS} from '../utils/theme';

const CustomInput = ({
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
}) => {
  const showClear = clear && value !== undefined && value?.length > 0;

  const onChange = (newValue) => {
    onChangeText(newValue);
  };

  return (
    <View style={[styles.inputContainer, viewStyle]}>
      {title && <Text style={textStyle}>{title}</Text>}
      <View>
        <TextInput
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
            onPress={() => {
              onChange('');
            }}
            style={[styles.clearContainer, clearButtonStyle]}
          >
            <MaterialIcons name="clear" style={styles.clearIcon} size={24} />
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
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
});

export {CustomInput};
