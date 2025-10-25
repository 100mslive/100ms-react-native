import * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue, AnimatedStyleProp } from 'react-native-reanimated';

import { useFooterHeight } from './Footer';

interface AnimatedHLSFooterProps {
  offset: SharedValue<number>;
  style?: AnimatedStyleProp<ViewStyle>;
}

export const AnimatedHLSFooter: React.FC<AnimatedHLSFooterProps> = ({
  offset,
  children,
  style,
}) => {
  const footerHeight = useFooterHeight();

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(offset.value, [0, 1], [footerHeight, 0]) },
      ],
    };
  }, []);

  return (
    <Animated.View style={[animatedStyles, style]}>{children}</Animated.View>
  );
};
