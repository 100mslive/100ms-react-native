import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface ThreeDotsIconProps extends Omit<ImageProps, 'source'> {}

export const ThreeDotsIcon: React.FC<ThreeDotsIconProps> = ({
  style,
  ...restProps
}) => {
  return (
    <Image
      source={require('./assets/three-dots-vertical.png')}
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
