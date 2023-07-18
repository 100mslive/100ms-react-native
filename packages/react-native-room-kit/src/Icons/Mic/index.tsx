import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface MicIconProps extends Omit<ImageProps, 'source'> {
  muted: boolean;
}

export const MicIcon: React.FC<MicIconProps> = ({
  muted,
  style,
  ...restProps
}) => {
  return (
    <Image
      source={
        muted
          ? require('./assets/mic-muted.png')
          : require('./assets/mic-unmuted.png')
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
