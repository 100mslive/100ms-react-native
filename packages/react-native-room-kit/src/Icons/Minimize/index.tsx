import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface MinimizeIconProps extends Omit<ImageProps, 'source'> {}

export const MinimizeIcon: React.FC<MinimizeIconProps> = ({ style, ...restProps }) => {
  const iconStyles = useHMSRoomStyle(theme => ({ tintColor: theme.palette.on_surface_high }));

  return (
    <Image
      source={require('./assets/minimize.png')}
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