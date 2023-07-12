import React from 'react';
import {Image, ImageProps, StyleSheet} from 'react-native';

interface SpeakerIconProps extends Omit<ImageProps, 'source'> {
  muted: boolean;
}

export const SpeakerIcon: React.FC<SpeakerIconProps> = ({
  muted,
  style,
  ...restProps
}) => {
  return (
    <Image
      source={
        muted
          ? require('./assets/speaker-muted.png')
          : require('./assets/speaker.png')
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
