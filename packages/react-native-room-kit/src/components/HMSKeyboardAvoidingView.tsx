import * as React from 'react';
import { useWindowDimensions } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export interface HMSKeyboardAvoidingViewProps {
  style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
}

export const HMSKeyboardAvoidingView: React.FC<
  HMSKeyboardAvoidingViewProps
> = ({ children, style }) => {
  const animatedViewRef = React.useRef<Animated.View>(null);
  const { height: windowHeight } = useWindowDimensions();
  const animatedKeyboard = useAnimatedKeyboard();

  const initialPageY = useSharedValue(0);

  const _handleViewOnLayout = React.useCallback(() => {
    animatedViewRef.current?.measure((_fx, _fy, _width, height, _px, py) => {
      if (height > 0) {
        initialPageY.value = windowHeight - (height + py);
      }
    });
  }, []);

  const keyboardAvoidStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY:
            animatedKeyboard.height.value <= initialPageY.value
              ? 0 // Keep element at original `pageY` till and when keyboard height is less than `pageY`
              : -(animatedKeyboard.height.value - initialPageY.value),
        },
      ],
    };
  });

  return (
    <Animated.View
      ref={animatedViewRef}
      onLayout={_handleViewOnLayout}
      style={[style, keyboardAvoidStyle]}
    >
      {children}
    </Animated.View>
  );
};
