import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';
import { TestIds } from '../../utils/constants';

interface HandIconProps extends Omit<ImageProps, 'source'> {
  type?: 'off' | 'on';
}

export const HandIcon: React.FC<HandIconProps> = ({
  style,
  type = 'on',
  ...restProps
}) => {
  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.on_surface_high,
  }));

  return (
    <Image
      testID={
        type === 'on'
          ? TestIds.hand_icon
          : TestIds.hand_off_icon
      }
      source={
        type === 'on'
          ? require('./assets/hand.png')
          : require('./assets/hand-off.png')
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
