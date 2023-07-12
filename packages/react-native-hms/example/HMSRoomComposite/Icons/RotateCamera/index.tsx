import React from 'react';
import {Image, ImageProps, StyleSheet} from 'react-native';

interface RotateCameraIconProps extends Omit<ImageProps, 'source'> {}

export const RotateCameraIcon: React.FC<RotateCameraIconProps> = ({
  style,
  ...restProps
}) => {
  return (
    <Image
      source={require('./assets/rotate-camera.png')}
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
