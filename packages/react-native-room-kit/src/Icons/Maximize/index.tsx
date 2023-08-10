import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { COLORS } from '../../utils/theme';

interface MaximizeIconProps extends Omit<ImageProps, 'source'> {}

export const MaximizeIcon: React.FC<MaximizeIconProps> = ({ style, ...restProps }) => {
  return (
    <Image
      source={require('./assets/maximize.png')}
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
