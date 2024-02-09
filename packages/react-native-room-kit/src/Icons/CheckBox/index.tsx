import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface CheckBoxIconProps extends Omit<ImageProps, 'source'> {
  type?: 'checked' | 'unchecked';
}

export const CheckBoxIcon: React.FC<CheckBoxIconProps> = ({
  style,
  type = 'unchecked',
  ...restProps
}) => {
  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.on_surface_high,
  }));

  return (
    <Image
      source={
        type === 'unchecked'
          ? require('./assets/checkbox.png')
          : require('./assets/checkbox-checked.png')
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
