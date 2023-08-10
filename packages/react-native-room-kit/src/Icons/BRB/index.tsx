import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { COLORS } from '../../utils/theme';

interface BRBIconProps extends Omit<ImageProps, 'source'> {}

export const BRBIcon: React.FC<BRBIconProps> = ({ style, ...restProps }) => {
  return (
    <Image
      source={require('./assets/BRB.png')}
      style={[styles.icon, style]}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    alignItems: 'center',
    justifyContent: 'center',
    tintColor: COLORS.SURFACE.ON_SURFACE.HIGH,
  },
});
