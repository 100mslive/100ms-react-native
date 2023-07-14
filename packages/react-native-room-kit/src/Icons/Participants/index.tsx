import React from 'react';
import { Image, ImageProps, StyleSheet } from 'react-native';

interface ParticipantsIconProps extends Omit<ImageProps, 'source'> {}

export const ParticipantsIcon: React.FC<ParticipantsIconProps> = ({
  style,
  ...restProps
}) => {
  return (
    <Image
      source={require('./assets/participants.png')}
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
