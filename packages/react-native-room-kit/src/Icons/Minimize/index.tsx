import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { COLORS } from '../../utils/theme';

interface MinimizeIconProps extends Omit<ImageProps, 'source'> {}

export const MinimizeIcon: React.FC<MinimizeIconProps> = ({ style, ...restProps }) => {
  return (
    <Image
      source={require('./assets/minimize.png')}
      style={[styles.icon, style]}
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
    tintColor: COLORS.SURFACE.ON_SURFACE.HIGH,
  },
});
