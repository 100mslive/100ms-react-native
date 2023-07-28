import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface RadioIconProps extends Omit<ImageProps, 'source'> {}

export const RadioIcon: React.FC<RadioIconProps> = ({
  style,
  ...restProps
}) => {
  return (
    <Image
      source={require('./assets/radio.png')}
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
