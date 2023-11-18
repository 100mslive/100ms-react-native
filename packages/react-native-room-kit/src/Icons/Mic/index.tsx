import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';
import { TestIds } from '../../utils/constants';

interface MicIconProps extends Omit<ImageProps, 'source'> {
  muted: boolean;
}

export const MicIcon: React.FC<MicIconProps> = ({
  muted,
  style,
  ...restProps
}) => {
  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.on_surface_high,
  }));

  return (
    <Image
      testID={
        muted
          ? TestIds.mic_muted_icon
          : TestIds.mic_unmuted_icon
      }
      source={
        muted
          ? require('./assets/mic-muted.png')
          : require('./assets/mic-unmuted.png')
      }
      style={[styles.icon, iconStyles, style]}
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
