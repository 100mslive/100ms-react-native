import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface MinimizeIconProps extends Omit<ImageProps, 'source'> {
  size?: 'normal' | 'medium';
}

export const MinimizeIcon: React.FC<MinimizeIconProps> = ({
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
          ? require('./assets/minimize-med.png')
          : require('./assets/minimize.png')
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
