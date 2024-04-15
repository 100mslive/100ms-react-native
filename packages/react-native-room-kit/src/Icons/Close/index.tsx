import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface CloseIconProps extends Omit<ImageProps, 'source'> {
  size?: 'normal' | 'medium';
}

export const CloseIcon: React.FC<CloseIconProps> = ({
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
        size === 'medium'
          ? require('./assets/close-med.png')
          : require('./assets/close.png')
      }
      style={[
        styles.icon,
        size === 'medium' ? styles.medSize : null,
        iconStyles,
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
  medSize: {
    width: 32,
    height: 32,
  },
});
