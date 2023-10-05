import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface ChevronIconProps extends Omit<ImageProps, 'source'> {
  direction: 'left' | 'down' | 'right' | 'top';
}

export const ChevronIcon: React.FC<ChevronIconProps> = ({
  direction,
  style,
  ...restProps
}) => {
  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.on_surface_high,
  }));

  return (
    <Image
      source={
        direction === 'down'
          ? require('./assets/chevron-down.png')
          : require('./assets/chevron-left.png')
      }
      style={[
        styles.icon,
        direction === 'right' || direction === 'top' ? {
          transform: [{rotateZ: direction === 'right' ? '180deg' : '90deg' }]
        } : null,
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
});
