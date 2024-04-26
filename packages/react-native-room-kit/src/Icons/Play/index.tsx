import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface PlayIconProps extends Omit<ImageProps, 'source'> {
  size?: 'med';
}

export const PlayIcon: React.FC<PlayIconProps> = ({
  style,
  size = 'med',
  ...restProps
}) => {
  if (size !== 'med') return null;

  return (
    <Image
      source={require('./assets/play-med.png')}
      style={[styles.icon, styles.medIcon, style]}
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
  medIcon: {
    width: 48,
    height: 48,
  },
});
