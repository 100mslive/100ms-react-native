import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface WelcomeHandIconProps extends Omit<ImageProps, 'source'> {}

export const WelcomeHandIcon: React.FC<WelcomeHandIconProps> = ({
  style,
  ...restProps
}) => {
  return (
    <Image
      source={require('./assets/welcome-hand.png')}
      style={[styles.icon, style]}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
