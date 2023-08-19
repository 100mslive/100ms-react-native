import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface NetworkQualityIconProps extends Omit<ImageProps, 'source'> {
  quality: number | undefined;
}

export const NetworkQualityIcon: React.FC<NetworkQualityIconProps> = ({
  quality,
  style,
  ...restProps
}) => {
  return (
    <Image
      source={
        quality === 0
          ? require('./assets/network_0.png')
          : quality === 1
          ? require('./assets/network_1.png')
          : quality === 2
          ? require('./assets/network_2.png')
          : quality === 3
          ? require('./assets/network_3.png')
          : quality === 4
          ? require('./assets/network_4.png')
          : require('./assets/network_5.png')
      }
      style={[styles.icon, style]}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
