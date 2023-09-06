import * as React from 'react';
import { Platform, StatusBar, useWindowDimensions } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';

export interface HMSKeyboardAvoidingViewProps {
  style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
}

export const HMSKeyboardAvoidingView: React.FC<
  HMSKeyboardAvoidingViewProps
> = ({ children, style }) => {
  const animatedViewRef = React.useRef<Animated.View>(null);
  const { height: windowHeight } = useWindowDimensions();
  const animatedKeyboard = useReanimatedKeyboardAnimation();

  const initialPageY = useSharedValue(0);

  const _handleViewOnLayout = React.useCallback(() => {
    animatedViewRef.current?.measureInWindow((_fx, fy, _width, height) => {
      if (height > 0) {
        const finalWindowHeight =
          Platform.OS === 'android' && Platform.Version < 29
            ? windowHeight - (StatusBar.currentHeight ?? 0)
            : windowHeight;
        initialPageY.value = finalWindowHeight - (height + fy);
      }
    });
  }, []);

  const keyboardAvoidStyle = useAnimatedStyle(() => {
    const keyboardHeight = -animatedKeyboard.height.value;
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
    <Animated.View
      ref={animatedViewRef}
      onLayout={_handleViewOnLayout}
      style={[style, keyboardAvoidStyle]}
    >
      {children}
    </Animated.View>
  );
};
