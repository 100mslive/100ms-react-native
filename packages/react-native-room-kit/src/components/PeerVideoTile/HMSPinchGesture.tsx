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
   * - Tracking number of active pointers in pinch gesture
   * "Focal point" is used as an origin point for scaling the view
   * when active number of pointers change, focal point is also changed causing a flicker effect
   *
   * To remove flicker effect, when `numberOfPointers` change, we calculate the amount of change in focal point
   * and use the `(new focal point) + (amount of change in focal point)` to apply transformations
   */
  const numberOfPointers = useSharedValue(0);

  /**
   * - Current focal point to apply scaling
   * "Focal point" is used as an origin point for scaling the view
   * > We transform the "center of View" to the "focal point", "apply scaling" and then "undo the transformation"
   */
  const focalPoint = useSharedValue({ x: 0, y: 0 });

  const adjustedFocalPoint = useSharedValue({ x: 0, y: 0 });

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

  /**
   * - x,y coords representing the amount by which focal point shifted due to change in `numberOfPointers`
   * e.g. focal point when `numberOfPointers = 2`            - (20, 100)
   *      focal point when `numberOfPointers` reduced to `1` - (40, 300)
   *
   *      focal point got shifted by `20` points on x-axis and `200` points on y-axis. Thus, `focalShift = (20, 200)`
   *
   * Usage: TODO
   */
  const focalShift = useSharedValue({ x: 0, y: 0 });

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
      translation.value = {
        x: e.translationX + savedTranslation.value.x,
        y: e.translationY + savedTranslation.value.y,
      };
    })
    .onEnd(() => {
      savedTranslation.value = translation.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onStart((e) => {
      numberOfPointers.value = e.numberOfPointers;
      focalPointAtStart.value = { x: e.focalX, y: e.focalY };

      adjustedFocalPoint.value = {
        x: e.focalX - focalShift.value.x, // subtracting "focal point shift" value from "current focal point", we will get "focal point before the shift", and apply transformations on the that focal point
        y: e.focalY - focalShift.value.y, // subtracting "focal point shift" value from "current focal point", we will get "focal point before the shift", and apply transformations on the that focal point
      };
    })
    .onUpdate((e) => {
      // Calculating `focal point` shift values when `numberOfPointers` changes
      if (numberOfPointers.value !== e.numberOfPointers) {
        numberOfPointers.value = e.numberOfPointers;

        focalShift.value = {
          x: e.focalX - (focalPoint.value.x - focalShift.value.x),
          y: e.focalY - (focalPoint.value.y - focalShift.value.y),
        };
      }

      adjustedFocalPoint.value = {
        x: e.focalX - focalShift.value.x, // subtracting "focal point shift" value from "current focal point", we will get "focal point before the shift", and apply transformations on the that focal point
        y: e.focalY - focalShift.value.y, // subtracting "focal point shift" value from "current focal point", we will get "focal point before the shift", and apply transformations on the that focal point
      };

      // Applying translations
      translation.value = {
        x:
          adjustedFocalPoint.value.x -
          focalPointAtStart.value.x + // subtracting "focal point position capturred at start of gesture" from "adjusted focal point position" we will get the translation value
          savedTranslation.value.x, // Adding current translation to previous Translation to make it a continuous gesture
        y:
          adjustedFocalPoint.value.y -
          focalPointAtStart.value.y + // subtracting "focal point position capturred at start of gesture" from "adjusted focal point position" we will get the translation value
          savedTranslation.value.y, // Adding current translation to previous Translation to make it a continuous gesture
      };

      // saving focal point to apply scaling on correct position
      focalPoint.value = { x: e.focalX, y: e.focalY };
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 0.94), 5.2);
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

      focalShift.value = { x: 0, y: 0 };
      savedTranslation.value = translation.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translation.value.x },
      { translateY: translation.value.y },
      { translateX: focalPointAtStart.value.x - dimensions.value.width / 2 },
      { translateY: focalPointAtStart.value.y - dimensions.value.height / 2 },
      { scale: scale.value },
      { translateX: -(focalPointAtStart.value.x - dimensions.value.width / 2) },
      {
        translateY: -(focalPointAtStart.value.y - dimensions.value.height / 2),
      },
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
