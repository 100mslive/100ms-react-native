import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface SettingsIconProps extends Omit<ImageProps, 'source'> {}

export const SettingsIcon: React.FC<SettingsIconProps> = ({
  style,
  ...restProps
}) => {
  return (
    <Image
      source={require('./assets/settings.png')}
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
