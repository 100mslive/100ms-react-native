import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface AlertIconProps extends Omit<ImageProps, 'source'> {}

export const AlertIcon: React.FC<AlertIconProps> = ({
  style,
  ...restProps
}) => {
  return (
    <Image
      source={require('./assets/alert.png')}
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
