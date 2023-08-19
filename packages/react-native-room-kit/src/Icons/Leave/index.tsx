import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface LeaveIconProps extends Omit<ImageProps, 'source'> {}

export const LeaveIcon: React.FC<LeaveIconProps> = ({
  style,
  ...restProps
}) => {
  return (
    <Image
      source={require('./assets/leave.png')}
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
