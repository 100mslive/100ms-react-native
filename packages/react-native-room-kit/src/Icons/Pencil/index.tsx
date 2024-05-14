import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface PencilIconProps extends Omit<ImageProps, 'source'> {
  type?: 'normal' | 'board';
}

export const PencilIcon: React.FC<PencilIconProps> = ({
  style,
  type = 'normal',
  ...restProps
}) => {
  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.on_surface_high,
  }));

  return (
    <Image
      source={
        type === 'board'
          ? require('./assets/pencil-board.png')
          : require('./assets/pencil.png')
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
