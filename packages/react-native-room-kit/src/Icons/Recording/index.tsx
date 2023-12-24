import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface RecordingIconProps extends Omit<ImageProps, 'source'> {
  type?: 'off' | 'on' | 'pause';
}

export const RecordingIcon: React.FC<RecordingIconProps> = ({
  style,
  type = 'on',
  ...restProps
}) => {
  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.on_surface_high,
  }));

  return (
    <Image
      source={
        type === 'on'
          ? require('./assets/recording.png')
          : type === 'pause'
            ? require('./assets/recording-pause.png')
            : require('./assets/recording-off.png')
      }
      style={[styles.icon, iconStyles, style]}
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
