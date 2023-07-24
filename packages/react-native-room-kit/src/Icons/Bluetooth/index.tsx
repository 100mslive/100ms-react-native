import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface BluetoothIconProps extends Omit<ImageProps, 'source'> {}

export const BluetoothIcon: React.FC<BluetoothIconProps> = ({
  style,
  ...restProps
}) => {
  return (
    <Image
      source={require('./assets/bluetooth-on.png')}
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
