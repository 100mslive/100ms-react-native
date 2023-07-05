import React from 'react';
import {Image, ImageProps, StyleSheet} from 'react-native';

interface ThreeDotsIconProps extends Omit<ImageProps, 'source'> {
  stack: 'horizontal' | 'vertical';
}

export const ThreeDotsIcon: React.FC<ThreeDotsIconProps> = ({
  stack,
  style,
  ...restProps
}) => {
  return (
    <Image
      source={
        stack
          ? require('./assets/three-dots-vertical.png')
          : require('./assets/three-dots-vertical.png')
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
