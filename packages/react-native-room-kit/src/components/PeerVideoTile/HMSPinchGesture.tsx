import * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export interface HMSPinchGestureProps {
  style?: StyleProp<ViewStyle>;
}

export const HMSPinchGesture: React.FC<HMSPinchGestureProps> = ({
  children,
  style,
}) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(savedScale.value * e.scale, 0.94);
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1, { damping: 100, stiffness: 200 });
        savedScale.value = 1;
      } else {
        savedScale.value = scale.value;
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={pinchGesture}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
};
