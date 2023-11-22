import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface PersonIconProps extends Omit<ImageProps, 'source'> {
  type?: 'off' | 'normal' | 'left' | 'rectangle';
}

export const PersonIcon: React.FC<PersonIconProps> = ({
  style,
  type = 'normal',
  ...restProps
}) => {
  return (
    <Image
      source={
        type === 'off'
          ? require('./assets/person-off.png')
          : type === 'left'
          ? require('./assets/person-left.png')
          : type === 'rectangle'
          ? require('./assets/person-rectangle.png')
          : require('./assets/person.png')
      }
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
  },
});
