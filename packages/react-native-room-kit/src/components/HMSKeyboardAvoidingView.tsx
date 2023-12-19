import * as React from 'react';
import { Keyboard, Platform } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  KeyboardState,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
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
  const keyboardState = useSharedValue(KeyboardState.UNKNOWN);

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      let didShowTimeoutId: null | NodeJS.Timeout = null;
      let didHideTimeoutId: null | NodeJS.Timeout = null;

      const didShowSubscription = Keyboard.addListener(
        'keyboardDidShow',
        () => {
          keyboardState.value = KeyboardState.OPENING;
          if (didShowTimeoutId !== null) {
            clearTimeout(didShowTimeoutId);
          }
          didShowTimeoutId = setTimeout(() => {
            keyboardState.value = KeyboardState.OPEN;
            didShowTimeoutId = null;
          }, 400);
        }
      );

      const didHideSubscription = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          keyboardState.value = KeyboardState.CLOSING;
          if (didHideTimeoutId !== null) {
            clearTimeout(didHideTimeoutId);
          }
          didHideTimeoutId = setTimeout(() => {
            keyboardState.value = KeyboardState.CLOSED;
            didHideTimeoutId = null;
          }, 400);
        }
      );

      return () => {
        if (didShowTimeoutId !== null) {
          clearTimeout(didShowTimeoutId);
        }
        if (didHideTimeoutId !== null) {
          clearTimeout(didHideTimeoutId);
        }
        if ('remove' in didShowSubscription) {
          didShowSubscription.remove();
        } else {
          Keyboard.removeSubscription(didShowSubscription);
        }
        if ('remove' in didHideSubscription) {
          didHideSubscription.remove();
        } else {
          Keyboard.removeSubscription(didHideSubscription);
        }
      };
    }
  }, [animatedKeyboard, keyboardState]);

  const initialPageY = useDerivedValue(() => {
    return typeof bottomOffset === 'number' ? bottomOffset : bottomOffset.value;
  }, [bottomOffset]);

  const keyboardAvoidStyle = useAnimatedStyle(() => {
    const keyboardHeight = animatedKeyboard.height.value;
    return {
      transform: [
        {
          translateY:
            keyboardHeight <= initialPageY.value ||
            keyboardState.value === KeyboardState.CLOSED
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
