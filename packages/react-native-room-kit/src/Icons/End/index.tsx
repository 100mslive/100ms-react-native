import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface EndIconProps extends Omit<ImageProps, 'source'> {}

export const EndIcon: React.FC<EndIconProps> = ({ style, ...restProps }) => {
  return (
    <Image
      source={require('./assets/end.png')}
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
