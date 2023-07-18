import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface HmsLogoIconProps extends Omit<ImageProps, 'source'> {}

export const HmsLogoIcon: React.FC<HmsLogoIconProps> = ({
  style,
  ...restProps
}) => {
  return (
    <Image
      source={require('./assets/hms-logo.png')}
      style={[styles.icon, style]}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    maxWidth: 100,
    resizeMode: 'contain',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
