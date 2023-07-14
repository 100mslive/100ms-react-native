import React from 'react';
import { Image, ImageProps, StyleSheet } from 'react-native';

interface CameraIconProps extends Omit<ImageProps, 'source'> {
  muted: boolean;
}

export const CameraIcon: React.FC<CameraIconProps> = ({
  muted,
  style,
  ...restProps
}) => {
  return (
    <Image
      source={
        muted
          ? require('./assets/camera-muted.png')
          : require('./assets/camera-unmuted.png')
      }
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
