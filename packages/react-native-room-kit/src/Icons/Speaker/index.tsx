import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface SpeakerIconProps extends Omit<ImageProps, 'source'> {
  muted: boolean;
  size?: 'normal' | 'large';
}

export const SpeakerIcon: React.FC<SpeakerIconProps> = ({
  size = 'normal',
  muted,
  style,
  ...restProps
}) => {
  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.on_surface_high,
  }));

  return (
    <Image
      source={
        muted
          ? require('./assets/speaker-muted.png')
          : size === 'normal'
          ? require('./assets/speaker.png')
          : require('./assets/speaker-large.png')
      }
      style={[
        styles.icon,
        iconStyles,
        style,
        size === 'large' ? styles.large : null,
      ]}
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
  large: {
    width: 32,
    height: 32,
  },
});
