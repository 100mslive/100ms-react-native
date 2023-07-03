import React from 'react';
import {Image, ImageProps, StyleSheet} from 'react-native';

interface ChatIconProps extends Omit<ImageProps, 'source'> {}

export const ChatIcon: React.FC<ChatIconProps> = ({style, ...restProps}) => {
  return (
    <Image
      source={require('./assets/chat.png')}
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
