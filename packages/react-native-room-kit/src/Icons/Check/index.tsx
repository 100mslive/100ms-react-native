import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface CheckIconProps extends Omit<ImageProps, 'source'> {
  type?: 'normal' | 'in-circle';
}

export const CheckIcon: React.FC<CheckIconProps> = ({
  type = 'normal',
  style,
  ...restProps
}) => {
  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.on_surface_high,
  }));

  return (
    <Image
      source={
        type === 'in-circle'
          ? require('./assets/check-in-circle.png')
          : require('./assets/check.png')
      }
      style={[styles.icon, iconStyles, style]}
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
