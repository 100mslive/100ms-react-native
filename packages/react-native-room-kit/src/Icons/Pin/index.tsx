import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface PinIconProps extends Omit<ImageProps, 'source'> {
  type: 'pin' | 'unpin';
}

export const PinIcon: React.FC<PinIconProps> = ({
  type = 'pin',
  style,
  ...restProps
}) => {
  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.on_surface_high,
  }));

  return (
    <Image
      source={
        type === 'unpin'
          ? require('./assets/unpin.png')
          : require('./assets/pin.png')
      }
      style={[styles.icon, iconStyles, style]}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
