import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface CCIconProps extends Omit<ImageProps, 'source'> {
  size?: 'medium';
  enabled?: boolean;
}

export const CCIcon: React.FC<CCIconProps> = ({
  style,
  size = 'medium',
  enabled = false,
  ...restProps
}) => {
  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.on_surface_high,
  }));

  return (
    <Image
      source={
        enabled
          ? require('./assets/cc-on-med.png')
          : require('./assets/cc-off-med.png')
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
