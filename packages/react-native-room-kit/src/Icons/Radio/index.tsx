import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { ImageProps, StyleProp, ViewStyle } from 'react-native';

import { useHMSRoomStyleSheet } from '../../hooks-util';

type RadioIconProps = Omit<ImageProps, 'source'> &
  (
    | {
        size?: 'normal';
      }
    | {
        size?: 'extra-large';
        containerStyle?: StyleProp<ViewStyle>;
      }
  );

export const RadioIcon: React.FC<RadioIconProps> = ({
  style,
  ...restProps
}) => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    container: {
      backgroundColor: theme.palette.surface_default,
    },
    icon: {
      tintColor: theme.palette.on_surface_high,
    },
  }));

  if (restProps.size === 'extra-large') {
    return (
      <View
        style={[
          styles.container,
          hmsRoomStyles.container,
          restProps.containerStyle,
        ]}
      >
        <Image
          source={require('./assets/radio-xlarge.png')}
          style={[styles.icon, styles.xLargeIcon, hmsRoomStyles.icon, style]}
          {...restProps}
        />
      </View>
    );
  }

  return (
    <Image
      source={require('./assets/radio.png')}
      style={[styles.icon, hmsRoomStyles.icon, style]}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xLargeIcon: {
    width: 56,
    height: 56,
  },
});
