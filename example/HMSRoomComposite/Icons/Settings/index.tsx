import React from 'react';
import {Image, ImageProps, StyleSheet} from 'react-native';

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
