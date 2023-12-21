import * as React from 'react';
import Animated, {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { useFooterHeight } from './Footer';

interface AnimatedFooterProps {
  offset: SharedValue<number>;
}

export const AnimatedFooter: React.FC<AnimatedFooterProps> = ({
  offset,
  children,
}) => {
  const footerHeight = useFooterHeight();

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(offset.value, [0, 0.3, 1], [0, 0.7, 1]),
      transform: [
        { translateY: interpolate(offset.value, [0, 1], [footerHeight, 0]) },
      ],
    };
  }, [footerHeight]);

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
