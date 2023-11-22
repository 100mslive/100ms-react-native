import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface GenericLogoIconProps extends Omit<ImageProps, 'source'> {}

export const GenericLogoIcon: React.FC<GenericLogoIconProps> = ({
  style,
  ...restProps
}) => {
  return (
    <Image
      source={require('./assets/generic-logo.png')}
      style={[styles.icon, style]}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
