import * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

export interface HMSKeyboardAvoidingViewProps {
  style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
  bottomOffset?: number | SharedValue<number>;
}

export const HMSKeyboardAvoidingView: React.FC<
  HMSKeyboardAvoidingViewProps
> = ({ children, style, bottomOffset = 0 }) => {
  const animatedKeyboard = useAnimatedKeyboard();

  const initialPageY = useDerivedValue(() => {
    return typeof bottomOffset === 'number' ? bottomOffset : bottomOffset.value;
  }, [bottomOffset]);

  const keyboardAvoidStyle = useAnimatedStyle(() => {
    const keyboardHeight = animatedKeyboard.height.value;
    return {
      transform: [
        {
          translateY:
            keyboardHeight <= initialPageY.value
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
