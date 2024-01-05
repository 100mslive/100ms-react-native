import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface ChatIconProps extends Omit<ImageProps, 'source'> {
  type?: 'on' | 'off';
}

export const ChatIcon: React.FC<ChatIconProps> = ({
  style,
  type = 'off',
  ...restProps
}) => {
  const iconStyles = useHMSRoomStyle(
    (theme) => ({
      tintColor: type === 'on' ? undefined : theme.palette.on_surface_high,
    }),
    [type]
  );

  return (
    <Image
      source={
        type === 'on'
          ? require('./assets/chat-on.png')
          : require('./assets/chat.png')
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
