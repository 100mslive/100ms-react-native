import * as React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

import Animated, {
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { AnimatedStyle, SharedValue } from 'react-native-reanimated';

export interface HLSAnimatedDescriptionPaneProps {
  sharedValue: SharedValue<number>;
  height: number;
  style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
}

export const HLSAnimatedDescriptionPane: React.FC<
  HLSAnimatedDescriptionPaneProps
> = ({ children, style, sharedValue, height }) => {
  const animatedStyles = useAnimatedStyle(
    () => ({
      // opacity: interpolate(sharedValue.value, [0, 0.3, 1], [0, 1, 1]),
      transform: [
        {
          translateY: interpolate(sharedValue.value, [0, 1], [-height, 0]),
        },
      ],
    }),
    [height]
  );

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyles, style]}>
      {children}
    </Animated.View>
  );
};
