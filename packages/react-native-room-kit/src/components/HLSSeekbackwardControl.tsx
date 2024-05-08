import { HMSHLSPlaylistType } from '@100mslive/react-native-hms';
import type { HMSHLSPlayer } from '@100mslive/react-native-hms';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { useIsHLSStreamingOn } from '../hooks-sdk';
import type { RootState } from '../redux';
import { SeekArrowIcon } from '../Icons';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export interface HLSSeekbackwardControlProps {
  playerRef: React.RefObject<React.ElementRef<typeof HMSHLSPlayer>>;
  onPress?: () => void;
}

const _HLSSeekbackwardControl: React.FC<HLSSeekbackwardControlProps> = ({
  playerRef,
  onPress,
}) => {
  const animatedValue = useSharedValue(0);
  const isHLSStreamingOn = useIsHLSStreamingOn();
  const isDVRStream = useSelector((state: RootState) => {
    return (
      state.hmsStates.room?.hlsStreamingState.variants?.[0]?.playlistType ===
      HMSHLSPlaylistType.DVR
    );
  });

  const handdleSeekBackward = () => {
    onPress?.();
    playerRef.current?.seekBackward(10);
  };

  const tapGestureHandler = React.useMemo(() => {
    return Gesture.Tap().onStart(() => {
      cancelAnimation(animatedValue);
      animatedValue.value = withTiming(
        1,
        { duration: 200, easing: Easing.ease },
        (finished) => {
          if (finished) {
            animatedValue.value = withTiming(0, {
              duration: 100,
              easing: Easing.ease,
            });
          }
        }
      );
      runOnJS(handdleSeekBackward)();
    });
  }, []);

  const animatedStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(animatedValue.value, [0, 1], [1, 0.8]),
      transform: [
        {
          rotateZ: `${interpolate(animatedValue.value, [0, 1], [0, -17])} deg`,
        },
      ],
    }),
    []
  );

  if (!isHLSStreamingOn || !isDVRStream) return null;

  return (
    <GestureDetector gesture={tapGestureHandler}>
      <Animated.View
        collapsable={false}
        style={[{ marginRight: 24 }, animatedStyle]}
      >
        <SeekArrowIcon type="backward" />
      </Animated.View>
    </GestureDetector>
  );
};

export const HLSSeekbackwardControl = React.memo(_HLSSeekbackwardControl);
