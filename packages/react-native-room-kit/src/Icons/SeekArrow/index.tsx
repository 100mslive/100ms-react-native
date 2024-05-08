import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface SeekArrowIconProps extends Omit<ImageProps, 'source'> {
  type: 'forward' | 'backward';
}

export const SeekArrowIcon: React.FC<SeekArrowIconProps> = ({
  style,
  type,
  ...restProps
}) => {
  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.on_surface_high,
  }));

  return (
    <Image
      source={
        type === 'forward'
          ? require('./assets/seek-forward-arrow.png')
          : require('./assets/seek-backward-arrow.png')
      }
      style={[styles.icon, iconStyles, style]}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
