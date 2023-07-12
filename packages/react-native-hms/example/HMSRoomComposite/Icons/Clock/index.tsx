import React from 'react';
import {Image, ImageProps, StyleSheet} from 'react-native';

interface ClockIconProps extends Omit<ImageProps, 'source'> {}

export const ClockIcon: React.FC<ClockIconProps> = ({style, ...restProps}) => {
  return (
    <Image
      source={require('./assets/clock.png')}
      style={[styles.icon, style]}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
