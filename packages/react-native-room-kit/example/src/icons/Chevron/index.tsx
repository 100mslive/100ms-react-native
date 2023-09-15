import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

interface ChevronIconProps extends Omit<ImageProps, 'source'> {
  direction: 'left' | 'down';
}

export const ChevronIcon: React.FC<ChevronIconProps> = ({
  direction,
  style,
  ...restProps
}) => {
  return (
    <Image
      source={
        direction === 'down'
          ? require('./assets/chevron-down.png')
          : require('./assets/chevron-left.png')
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
