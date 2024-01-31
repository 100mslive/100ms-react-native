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
      if (savedScale.value <= 1) {
        return;
      }
      const swipeOnXAxis = e.translationX + savedTranslation.value.x;
      const swipeOnYAxis = e.translationY + savedTranslation.value.y;

      // console.log('\n');
      // console.log('View X > ', dimensions.value.width * savedScale.value);
      // console.log('View Y > ', dimensions.value.height * savedScale.value);
      // console.log('Screen X > ', dimensions.value.width);
      // console.log('Screen Y > ', dimensions.value.height);
      // console.log('Gap between View X & Screen X > ', (dimensions.value.width * savedScale.value) - dimensions.value.width);
      // console.log('Gap between View Y & Screen Y > ', (dimensions.value.height * savedScale.value) - dimensions.value.height);

      const diffX =
        (dimensions.value.width * savedScale.value - dimensions.value.width) /
        2;
      const diffY =
        (dimensions.value.height * savedScale.value - dimensions.value.height) /
        2;
      // console.log('diffX > ', diffX); // 60
      // console.log('diffY > ', diffY);
      // console.log('swipeOnXAxis > ', swipeOnXAxis); // 47
      // console.log('swipeOnYAxis > ', swipeOnYAxis);
      // console.log('\n');

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

      // const offsetX = focalPointAtStart.value.x * (focalPointAtStart.value.x > dimensions.value.width / 2 ? -1 : 1);
      // const offsetY = focalPointAtStart.value.y * (focalPointAtStart.value.y > dimensions.value.height / 2 ? -1 : 1);

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

  const focalOrigindotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: focalPointAtStart.value.x },
      { translateY: focalPointAtStart.value.y },
    ],
    // top: focalPointAtStart.value.x,
    // left: focalPointAtStart.value.y,
  }));

  const focalTransformeddotStyle = useAnimatedStyle(() => ({
    top: focalPointAtStart.value.x * scale.value,
    left: focalPointAtStart.value.y * scale.value,
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
        {/* <Animated.View style={[{ position: 'absolute', width: 4, height: 4, backgroundColor: 'red', transform: [{translateX: -2}, {translateY: -2}] }, focalOrigindotStyle]} />
        <Animated.View style={[{ position: 'absolute', width: 4, height: 4, backgroundColor: 'green', transform: [{translateX: -2}, {translateY: -2}] }, focalTransformeddotStyle]} /> */}
      </Animated.View>
    </GestureDetector>
  );
};
