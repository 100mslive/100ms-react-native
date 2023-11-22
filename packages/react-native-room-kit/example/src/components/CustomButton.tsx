import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import type { TouchableOpacityProps } from 'react-native';
import { COLORS } from '../utils/theme';

const CustomButton = ({
  testID,
  loading = false,
  disabled = false,
  title,
  onPress,
  textStyle,
  viewStyle,
  LeftIcon,
  RightIcon,
}: {
  testID?: TouchableOpacityProps['testID'];
  title?: string;
  onPress: Function;
  textStyle?: StyleProp<TextStyle>;
  viewStyle?: StyleProp<ViewStyle>;
  loading?: boolean;
  disabled?: boolean;
  LeftIcon?: JSX.Element;
  RightIcon?: JSX.Element;
}) => {
  const onButtonPress = () => {
    onPress();
  };

  return (
    <TouchableOpacity
      testID={testID}
      disabled={disabled || loading}
      style={[
        styles.buttonConatiner,
        viewStyle,
        disabled && styles.disabled,
        loading && styles.opacity,
      ]}
      onPress={onButtonPress}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.WHITE} />
      ) : (
        <>
          {LeftIcon}
          {title && (
            <Text style={[textStyle, disabled && styles.disabledText]}>
              {title}
            </Text>
          )}
          {RightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonConatiner: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
  },
  disabled: {
    backgroundColor: COLORS.SECONDARY.DISABLED,
    borderColor: COLORS.SECONDARY.DISABLED,
  },
  disabledText: {
    color: COLORS.TEXT.DISABLED_ACCENT,
  },
  opacity: {
    opacity: 0.5,
  },
});

export { CustomButton };
