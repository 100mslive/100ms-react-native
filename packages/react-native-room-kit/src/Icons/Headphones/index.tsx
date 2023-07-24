import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface HeadphonesIconProps extends Omit<ImageProps, 'source'> {}

export const HeadphonesIcon: React.FC<HeadphonesIconProps> = ({
  style,
  ...restProps
}) => {
  return (
    <Image
      source={require('./assets/headphones.png')}
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
