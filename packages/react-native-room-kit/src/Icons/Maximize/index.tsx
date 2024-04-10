import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface MaximizeIconProps extends Omit<ImageProps, 'source'> {
  size?: 'normal' | 'medium';
}

export const MaximizeIcon: React.FC<MaximizeIconProps> = ({
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
          ? require('./assets/maximize-med.png')
          : require('./assets/maximize.png')
      }
      style={[
        styles.icon,
        iconStyles,
        size === 'medium' ? styles.medSize : null,
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
