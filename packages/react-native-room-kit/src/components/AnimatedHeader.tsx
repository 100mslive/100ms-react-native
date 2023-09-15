import * as React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { useIsHLSViewer } from '../hooks-util';

export interface AnimatedHeaderProps {
  offset: SharedValue<number>;
}

export const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  children,
  offset,
}) => {
  const isHLSViewer = useIsHLSViewer();

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: offset.value,
      // transform: [{ translateY: interpolate(offset.value, [0, 1], [-10, 0]) }]
    };
  }, []);

  const animatedProps = useAnimatedProps((): {
    pointerEvents: 'none' | 'auto';
  } => {
    return {
      pointerEvents: offset.value === 0 ? 'none' : 'auto',
    };
  }, []);

  return (
    <Animated.View
      style={[isHLSViewer ? styles.hlsContainer : null, animatedStyles]}
      animatedProps={animatedProps}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  hlsContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 1,
  },
});
