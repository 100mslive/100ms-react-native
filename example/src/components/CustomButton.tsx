import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

const CustomButton = ({
  disabled = false,
  title,
  onPress,
  textStyle,
  viewStyle,
  LeftIcon,
  RightIcon,
}: {
  title?: string;
  onPress: Function;
  textStyle?: StyleProp<TextStyle>;
  viewStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  LeftIcon?: JSX.Element;
  RightIcon?: JSX.Element;
}) => {
  const onButtonPress = () => {
    onPress();
  };

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[styles.buttonConatiner, viewStyle]}
      onPress={onButtonPress}>
      {LeftIcon}
      <Text style={textStyle}>{title}</Text>
      {RightIcon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonConatiner: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
  },
});

export {CustomButton};
