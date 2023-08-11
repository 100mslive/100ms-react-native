import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface StarIconProps extends Omit<ImageProps, 'source'> {}

export const StarIcon: React.FC<StarIconProps> = ({ style, ...restProps }) => {
  return (
    <Image
      source={require('./assets/star.png')}
      style={[styles.icon, style]}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
