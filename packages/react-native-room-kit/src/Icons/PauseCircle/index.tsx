import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface PauseCircleIconProps extends Omit<ImageProps, 'source'> {}

export const PauseCircleIcon: React.FC<PauseCircleIconProps> = ({
  style,
  ...restProps
}) => {
  return (
    <Image
      source={require('./assets/pause-circle.png')}
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
