import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface SendIconProps extends Omit<ImageProps, 'source'> {}

export const SendIcon: React.FC<SendIconProps> = ({ style, ...restProps }) => {
  return (
    <Image
      source={require('./assets/send.png')}
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
