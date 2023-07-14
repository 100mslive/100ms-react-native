import React from 'react';
import { Image, ImageProps, StyleSheet } from 'react-native';

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
