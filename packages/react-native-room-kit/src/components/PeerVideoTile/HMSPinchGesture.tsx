import * as React from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
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
  const dimensions = useSharedValue({ width: 0, height: 0 });
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const focalPoint = useSharedValue({ x: 0, y: 0 });

  const handleLayoutChange = React.useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      dimensions.value = {
        width: nativeEvent.layout.width,
        height: nativeEvent.layout.height,
      };
    },
    []
  );

  const pinchGesture = Gesture.Pinch()
    .onStart((e) => {
      focalPoint.value = { x: e.focalX, y: e.focalY };
    })
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 0.94), 5.2);
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1, { damping: 100, stiffness: 200 });
        savedScale.value = 1;
      } else if (scale.value > 5) {
        scale.value = withSpring(5, { damping: 100, stiffness: 200 });
        savedScale.value = 5;
      } else {
        savedScale.value = scale.value;
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: focalPoint.value.x - dimensions.value.width / 2 },
      { translateY: focalPoint.value.y - dimensions.value.height / 2 },
      { scale: scale.value },
      { translateX: -(focalPoint.value.x - dimensions.value.width / 2) },
      { translateY: -(focalPoint.value.y - dimensions.value.height / 2) },
    ],
  }));

  return (
    <GestureDetector gesture={pinchGesture}>
      <Animated.View
        onLayout={handleLayoutChange}
        style={[style, animatedStyle]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
};
