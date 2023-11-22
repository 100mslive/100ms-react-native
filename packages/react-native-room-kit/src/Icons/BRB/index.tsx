import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';
import { TestIds } from '../../utils/constants';

interface BRBIconProps extends Omit<ImageProps, 'source'> {}

export const BRBIcon: React.FC<BRBIconProps> = ({ style, ...restProps }) => {
  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.on_surface_high,
  }));

  return (
    <Image
      testID={TestIds.brb_icon}
      source={require('./assets/BRB.png')}
      style={[styles.icon, iconStyles, style]}
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
  },
});
