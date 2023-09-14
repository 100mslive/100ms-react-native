import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface QRCodeIconProps extends Omit<ImageProps, 'source'> {}

export const QRCodeIcon: React.FC<QRCodeIconProps> = ({
  style,
  ...restProps
}) => {
  return (
    <Image
      source={require('./assets/qr-code.png')}
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
