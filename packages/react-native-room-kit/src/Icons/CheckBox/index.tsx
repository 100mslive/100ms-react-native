import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface CheckBoxIconProps extends Omit<ImageProps, 'source'> {
  type?: 'checked' | 'unchecked';
  onChange?: (type: 'checked' | 'unchecked') => void;
}

export const CheckBoxIcon: React.FC<CheckBoxIconProps> = ({
  style,
  type = 'unchecked',
  onChange,
  ...restProps
}) => {
  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.on_surface_high,
  }));

  const checkbox = (
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

  if (typeof onChange !== 'function') {
    return checkbox;
  }

  return (
    <TouchableOpacity
      onPress={() => onChange(type === 'unchecked' ? 'checked' : 'unchecked')}
    >
      {checkbox}
    </TouchableOpacity>
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
