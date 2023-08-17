import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface MaximizeIconProps extends Omit<ImageProps, 'source'> {}

export const MaximizeIcon: React.FC<MaximizeIconProps> = ({ style, ...restProps }) => {
  const iconStyles = useHMSRoomStyle(theme => ({ tintColor: theme.palette.on_surface_high }));

  return (
    <Image
      source={require('./assets/maximize.png')}
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
