import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface ClockIconProps extends Omit<ImageProps, 'source'> {
  type?: 'vector' | 'normal';
}

export const ClockIcon: React.FC<ClockIconProps> = ({
  style,
  type = 'vector',
  ...restProps
}) => {
  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.on_surface_high,
  }));

  return (
    <Image
      source={
        type === 'vector'
          ? require('./assets/clock-vector.png')
          : require('./assets/clock.png')
      }
      style={[styles.icon, style, type === 'vector' ? undefined : iconStyles]}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
