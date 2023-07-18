import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface ScreenShareIconProps extends Omit<ImageProps, 'source'> {}

export const ScreenShareIcon: React.FC<ScreenShareIconProps> = ({
  style,
  ...restProps
}) => {
  return (
    <Image
      source={require('./assets/screen-share.png')}
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
