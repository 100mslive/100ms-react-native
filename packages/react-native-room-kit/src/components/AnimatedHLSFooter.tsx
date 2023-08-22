import * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

interface AnimatedHLSFooterProps {
  offset: SharedValue<number>;
  style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
}

export const AnimatedHLSFooter: React.FC<AnimatedHLSFooterProps> = ({ offset, children, style }) => {
  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(offset.value, [0, 0.7, 1], [0, 0.5, 1]),
      transform: [{ translateY: interpolate(offset.value, [0, 1], [10, 0]) }],
    };
  }, []);

  const animatedProps = useAnimatedProps((): {
    pointerEvents: 'none' | 'auto';
  } => {
    return {
      pointerEvents: offset.value === 0 ? 'none' : 'auto',
    };
  }, []);

  return (
    <Animated.View style={[animatedStyles, style]} animatedProps={animatedProps}>
      {children}
    </Animated.View>
  );
};
