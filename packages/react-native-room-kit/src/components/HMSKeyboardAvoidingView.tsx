import * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  KeyboardState,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { useKeyboardState } from '../hooks-util';

export interface HMSKeyboardAvoidingViewProps {
  style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
  styleWhenInactive?: ViewStyle;
  styleWhenActive?: ViewStyle;
  bottomOffset?: number | SharedValue<number>;
}

export const HMSKeyboardAvoidingView: React.FC<
  HMSKeyboardAvoidingViewProps
> = ({
  children,
  style,
  styleWhenInactive,
  styleWhenActive,
  bottomOffset = 0,
}) => {
  const animatedKeyboard = useAnimatedKeyboard();
  const { keyboardState } = useKeyboardState();

  const initialPageY = useDerivedValue(() => {
    return typeof bottomOffset === 'number' ? bottomOffset : bottomOffset.value;
  }, [bottomOffset]);

  const keyboardAvoidStyle = useAnimatedStyle(() => {
    const keyboardHeight = animatedKeyboard.height.value;
    const keyboardHidden =
      keyboardHeight <= initialPageY.value ||
      keyboardState.value === KeyboardState.CLOSED;
    return {
      ...(keyboardHidden ? styleWhenInactive : styleWhenActive),
      transform: [
        {
          translateY: keyboardHidden
            ? 0 // Keep element at original `pageY` till and when keyboard height is less than `pageY`
            : -(keyboardHeight - initialPageY.value),
        },
      ],
    };
  });

  return (
    <Animated.View style={[style, keyboardAvoidStyle]}>
      {children}
    </Animated.View>
  );
};
