import * as React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

import { useIsLandscapeOrientation } from '../utils/dimension';

export interface PollAndQuizSheetScreenProps {
  children: React.ReactElement | null;
  zIndex: number;
  disableAnimation?: boolean;
}

export const PollAndQuizSheetScreen: React.FC<PollAndQuizSheetScreenProps> = ({
  children,
  zIndex,
  disableAnimation,
}) => {
  const isLandscapeOrientation = useIsLandscapeOrientation();
  const { width } = useSafeAreaFrame();
  const xPosition = useSharedValue(disableAnimation ? 0 : 1);

  const animatedStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(xPosition.value, [0, 1], [1, 0]),
      transform: [
        {
          translateX: interpolate(
            xPosition.value,
            [0, 1],
            [0, isLandscapeOrientation ? width * 0.6 : width],
            'clamp'
          ),
        },
      ],
    }),
    [isLandscapeOrientation]
  );

  React.useEffect(() => {
    if (disableAnimation) {
      return;
    }
    xPosition.value = withTiming(0, { duration: 150 });
    return () => {
      cancelAnimationFrame(xPosition.value);
    };
  }, []);

  const unmountScreenWithAnimation = React.useCallback(
    (cb: () => void) => {
      if (disableAnimation) {
        cb();
        return;
      }
      xPosition.value = withTiming(1, { duration: 150 }, () => {
        runOnJS(cb)();
      });
    },
    [disableAnimation]
  );

  return (
    <Animated.View style={[styles.absolute, { zIndex }, animatedStyle]}>
      {children
        ? React.cloneElement(children, { unmountScreenWithAnimation })
        : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  absolute: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    overflow: 'hidden',
  },
});
