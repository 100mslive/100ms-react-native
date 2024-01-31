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
  /**
   * - Dimensions of Animated View
   * This will be used to apply transformations as per width and height of Animated Views
   */
  const dimensions = useSharedValue({ width: 0, height: 0 });

  /**
   * - focal point captured at the start of the pinch gesture
   * We use this point to calculate the amount of translation of focal point
   * `
   * translation = (current focal point) - (focal point at the start of the gesture)
   * `
   * then translation value is amount of swipe(pan) gesture user has applied while scaling
   * we can use this calculated value as a translation value, similar to what we get in `pan gesture`
   */
  const focalPointAtStart = useSharedValue({ x: 0, y: 0 });

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translation = useSharedValue({ x: 0, y: 0 });
  const savedTranslation = useSharedValue({ x: 0, y: 0 });

  const handleLayoutChange = React.useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      dimensions.value = {
        width: nativeEvent.layout.width,
        height: nativeEvent.layout.height,
      };
    },
    []
  );

  const panGesture = Gesture.Pan()
    .maxPointers(1)
    .onUpdate((e) => {
      if (savedScale.value <= 1) {
        return;
      }
      const swipeOnXAxis = e.translationX + savedTranslation.value.x;
      const swipeOnYAxis = e.translationY + savedTranslation.value.y;

      const diffX =
        (dimensions.value.width * savedScale.value - dimensions.value.width) /
        2;
      const diffY =
        (dimensions.value.height * savedScale.value - dimensions.value.height) /
        2;

      translation.value = {
        x: Math.max(Math.min(swipeOnXAxis, diffX), -diffX),
        y: Math.max(Math.min(swipeOnYAxis, diffY), -diffY),
      };
    })
    .onEnd(() => {
      savedTranslation.value = translation.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onStart((e) => {
      focalPointAtStart.value = { x: e.focalX, y: e.focalY };
    })
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 0.94), 5.2);

      const offsetX = dimensions.value.width / 2 - focalPointAtStart.value.x;
      const offsetY = dimensions.value.height / 2 - focalPointAtStart.value.y;

      const swipeOnXAxis = offsetX * scale.value + savedTranslation.value.x;
      const swipeOnYAxis = offsetY * scale.value + savedTranslation.value.y;

      const diffX =
        (dimensions.value.width * scale.value - dimensions.value.width) / 2;
      const diffY =
        (dimensions.value.height * scale.value - dimensions.value.height) / 2;

      translation.value = {
        x: Math.max(Math.min(swipeOnXAxis, diffX), -diffX),
        y: Math.max(Math.min(swipeOnYAxis, diffY), -diffY),
      };
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1, { damping: 100, stiffness: 200 });
        savedScale.value = 1;
        translation.value = { x: 0, y: 0 };
      } else if (scale.value > 5) {
        scale.value = withSpring(5, { damping: 100, stiffness: 200 });
        savedScale.value = 5;
      } else {
        savedScale.value = scale.value;
      }

      savedTranslation.value = translation.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translation.value.x },
      { translateY: translation.value.y },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={Gesture.Exclusive(panGesture, pinchGesture)}>
      <Animated.View style={{ flex: 1 }}>
        <Animated.View
          onLayout={handleLayoutChange}
          style={[style, animatedStyle]}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};
