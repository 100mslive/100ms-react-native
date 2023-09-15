import * as React from 'react';
import Animated, {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

interface AnimatedFooterProps {
  offset: SharedValue<number>;
}

export const AnimatedFooter: React.FC<AnimatedFooterProps> = ({
  offset,
  children,
}) => {
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
    <Animated.View style={animatedStyles} animatedProps={animatedProps}>
      {children}
    </Animated.View>
  );
};
