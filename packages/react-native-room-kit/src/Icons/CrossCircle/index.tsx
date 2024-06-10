import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface CrossCircleIconProps extends Omit<ImageProps, 'source'> {
  size?: 'normal' | 'large';
}

export const CrossCircleIcon: React.FC<CrossCircleIconProps> = ({
  style,
  size = 'normal',
  ...restProps
}) => {
  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.on_surface_high,
  }));

  return (
    <Image
      source={
        size === 'large'
          ? require('./assets/cross-circle-large.png')
          : require('./assets/cross-circle.png')
      }
      style={[
        styles.icon,
        iconStyles,
        size === 'large' ? styles.largeIcon : null,
        style,
      ]}
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
  largeIcon: {
    width: 40,
    height: 40,
  },
});
