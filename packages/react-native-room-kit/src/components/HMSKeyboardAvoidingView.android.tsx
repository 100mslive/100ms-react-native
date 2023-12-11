import * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated'; // useDerivedValue, // useAnimatedStyle, // useAnimatedKeyboard,

export interface HMSKeyboardAvoidingViewProps {
  style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
  bottomOffset?: number;
}

export const HMSKeyboardAvoidingView: React.FC<
  HMSKeyboardAvoidingViewProps
> = ({
  children,
  style,
  // bottomOffset=0
}) => {
  // const animatedKeyboard = useAnimatedKeyboard();

  // const initialPageY = useDerivedValue(() => bottomOffset, [bottomOffset]);

  // const keyboardAvoidStyle = useAnimatedStyle(() => {
  //   const keyboardHeight = animatedKeyboard.height.value;
  //   return {
  //     transform: [
  //       {
  //         translateY:
  //           keyboardHeight <= initialPageY.value
  //             ? 0 // Keep element at original `pageY` till and when keyboard height is less than `pageY`
  //             : -(keyboardHeight - initialPageY.value),
  //       },
  //     ],
  //   };
  // });

  return (
    <Animated.View
      style={[
        style,
        // keyboardAvoidStyle
      ]}
    >
      {children}
    </Animated.View>
  );
};
