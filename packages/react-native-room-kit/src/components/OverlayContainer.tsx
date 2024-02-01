import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

type OverlayContainerProps = {};

export const OverlayContainer: React.FC<OverlayContainerProps> & {
  Overlay: typeof Overlay;
} = ({ children }) => {
  return <View style={styles.container}>{children}</View>;
};

export type OverlayProps = {
  animatedStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
};

const Overlay: React.FC<OverlayProps> = ({ children, animatedStyle }) => {
  return (
    <Animated.View style={[styles.absoluteContainer, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

OverlayContainer.Overlay = Overlay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  absoluteContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    zIndex: 1,
  },
});
