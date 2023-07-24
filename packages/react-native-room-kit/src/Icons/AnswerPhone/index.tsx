import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface AnswerPhoneIconProps extends Omit<ImageProps, 'source'> {}

export const AnswerPhoneIcon: React.FC<AnswerPhoneIconProps> = ({
  style,
  ...restProps
}) => {
  return (
    <Image
      source={require('./assets/answer-phone.png')}
      style={[styles.icon, style]}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
