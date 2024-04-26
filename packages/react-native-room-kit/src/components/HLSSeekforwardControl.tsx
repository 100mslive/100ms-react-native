import {
  HMSHLSPlaylistType,
  useIsHLSStreamLive,
} from '@100mslive/react-native-hms';
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

export interface HLSSeekforwardControlProps {
  playerRef: React.RefObject<React.ElementRef<typeof HMSHLSPlayer>>;
  onPress?: () => void;
}

const _HLSSeekforwardControl: React.FC<HLSSeekforwardControlProps> = ({
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
  const isStreamLive = useIsHLSStreamLive();

  const handdleSeekForward = () => {
    onPress?.();
    playerRef.current?.seekForward(10);
  };

  const tapGestureHandler = React.useMemo(() => {
    return Gesture.Tap()
      .enabled(!isStreamLive)
      .onStart(() => {
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
        runOnJS(handdleSeekForward)();
      });
  }, [isStreamLive]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(animatedValue.value, [0, 1], [1, 0.8]),
      transform: [
        {
          rotateZ: `${interpolate(animatedValue.value, [0, 1], [0, 17])} deg`,
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
        style={[{ marginLeft: 24 }, animatedStyle]}
      >
        <SeekArrowIcon
          style={{ opacity: isStreamLive ? 0.2 : 1 }}
          type="forward"
        />
      </Animated.View>
    </GestureDetector>
  );
};

export const HLSSeekforwardControl = React.memo(_HLSSeekforwardControl);
