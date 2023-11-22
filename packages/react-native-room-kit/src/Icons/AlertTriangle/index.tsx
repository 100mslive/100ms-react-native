import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface AlertTriangleIconProps extends Omit<ImageProps, 'source'> {
  type?: 'fill' | 'line';
}

export const AlertTriangleIcon: React.FC<AlertTriangleIconProps> = ({
  style,
  type = 'line',
  ...restProps
}) => {
  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.alert_error_default,
  }));

  return (
    <Image
      source={
        type === 'fill'
          ? require('./assets/alert-triangle-filled.png')
          : require('./assets/alert-triangle.png')
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
