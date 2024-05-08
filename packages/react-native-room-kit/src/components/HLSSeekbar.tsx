import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import {
  HMSHLSPlayerPlaybackState,
  HMSHLSPlaylistType,
  useHMSHLSPlayerPlaybackState,
  useHMSHLSPlayerStat,
} from '@100mslive/react-native-hms';
import type {
  HLSPlayerDurationDetails,
  HMSHLSPlayer,
} from '@100mslive/react-native-hms';
import { useSelector } from 'react-redux';

import {
  useHLSStreamResumePause,
  useHLSViewsConstraints,
  useHMSRoomStyle,
} from '../hooks-util';
import { useIsHLSStreamingOn } from '../hooks-sdk';
import type { RootState } from '../redux';

interface HLSSeekbarProps {
  playerRef: React.RefObject<React.ElementRef<typeof HMSHLSPlayer>>;
  onStart: () => void;
  onEnd: () => void;
}

export const _HLSSeekbar: React.FC<HLSSeekbarProps> = (props) => {
  const isHLSStreamingOn = useIsHLSStreamingOn();
  const isDVRStream = useSelector((state: RootState) => {
    return (
      state.hmsStates.room?.hlsStreamingState.variants?.[0]?.playlistType ===
      HMSHLSPlaylistType.DVR
    );
  });

  if (!isHLSStreamingOn || !isDVRStream) return null;

  return <_Seekbar {...props} />;
};

const _Seekbar: React.FC<HLSSeekbarProps> = React.memo(
  ({ playerRef, onStart, onEnd }) => {
    const { playerWrapperConstraints } = useHLSViewsConstraints();
    const hlsPlayerDurationDetails = useRef<null | HLSPlayerDurationDetails>(
      null
    );
    const prevSeekbarPositionValue = useSharedValue(0);
    const seekbarPositionValue = useSharedValue(0);
    const seekbarHeightValue = useSharedValue(4);
    const streamStartedAt = useSelector((state: RootState) => {
      return state.hmsStates.room?.hlsStreamingState.variants?.[0]?.startedAt;
    });
    const distanceFromLiveEdge = useHMSHLSPlayerStat('distanceFromLive');
    const distanceFromLiveEdgeValue = useDerivedValue(
      () => distanceFromLiveEdge,
      [distanceFromLiveEdge]
    );

    const seekbarRoomStyle = useHMSRoomStyle((theme) => ({
      backgroundColor: theme.palette.primary_default,
    }));

    const { isPaused, pauseStream, resumeStream } =
      useHLSStreamResumePause(playerRef);

    const seekToBarPosition = () => {
      if (!streamStartedAt) return;
      const liveStreamDuration = Date.now() - streamStartedAt.getTime();
      const rollingWindowTime =
        hlsPlayerDurationDetails.current?.rollingWindowTime;
      const durationOfStream =
        rollingWindowTime && liveStreamDuration >= rollingWindowTime
          ? rollingWindowTime
          : liveStreamDuration;

      // console.log(
      //   '$$$ rolling window time > ',
      //   hlsPlayerDurationDetails.current?.rollingWindowTime
      // );
      // console.log('$$$ live stream duration > ', liveStreamDuration);
      // console.log('$$$ current stream duration > ', durationOfStream);

      const prevPosition = prevSeekbarPositionValue.value;
      const currPosition = seekbarPositionValue.value;
      const diff = currPosition - prevPosition;
      const seekByMillis = (durationOfStream / 100) * Math.abs(diff);

      const seekBySecs = seekByMillis / 1000;
      if (diff >= 0) {
        playerRef.current?.seekForward(seekBySecs);
      } else {
        playerRef.current?.seekBackward(seekBySecs);
      }
      resumeStream();
    };

    const activeSeekbarStyle = useAnimatedStyle(
      () => ({
        width: interpolate(
          seekbarPositionValue.value,
          [0, 100],
          [0, playerWrapperConstraints.width],
          {
            extrapolateLeft: Extrapolation.CLAMP,
            extrapolateRight: Extrapolation.CLAMP,
          }
        ),
        height: seekbarHeightValue.value,
      }),
      [playerWrapperConstraints.width]
    );

    const activeSeekbarThumbStyle = useAnimatedStyle(
      () => ({
        width: seekbarHeightValue.value * 3,
        height: seekbarHeightValue.value * 3,
        borderRadius: (seekbarHeightValue.value * 3) / 2,
        bottom: -seekbarHeightValue.value,
        left: -(seekbarHeightValue.value * 3) / 2,
        transform: [
          {
            translateX: interpolate(
              seekbarPositionValue.value,
              [0, 100],
              [0, playerWrapperConstraints.width],
              {
                extrapolateLeft: Extrapolation.CLAMP,
                extrapolateRight: Extrapolation.CLAMP,
              }
            ),
          },
        ],
      }),
      [playerWrapperConstraints.width]
    );

    const panGesture = Gesture.Pan()
      .maxPointers(1)
      .minPointers(1)
      .hitSlop({ top: 12, bottom: 12 })
      .onStart((e) => {
        'worklet';
        onStart();
        runOnJS(pauseStream)();
        prevSeekbarPositionValue.value = seekbarPositionValue.value;
        seekbarPositionValue.value = interpolate(
          e.x,
          [0, playerWrapperConstraints.width],
          [0, 100],
          {
            extrapolateLeft: Extrapolation.CLAMP,
            extrapolateRight: Extrapolation.CLAMP,
          }
        );
        seekbarHeightValue.value = withTiming(6, {
          duration: 160,
          easing: Easing.linear,
        });
      })
      .onUpdate((e) => {
        'worklet';
        seekbarPositionValue.value = interpolate(
          e.x,
          [0, playerWrapperConstraints.width],
          [0, 100],
          {
            extrapolateLeft: Extrapolation.CLAMP,
            extrapolateRight: Extrapolation.CLAMP,
          }
        );
      })
      .onEnd(() => {
        'worklet';
        onEnd();
        seekbarHeightValue.value = withTiming(4, {
          duration: 160,
          easing: Easing.linear,
        });
        runOnJS(seekToBarPosition)();
      });

    React.useEffect(() => {
      if (streamStartedAt && !isPaused) {
        const intervalId = setInterval(() => {
          const liveStreamDuration = Date.now() - streamStartedAt.getTime();

          const rollingWindowTime =
            hlsPlayerDurationDetails.current?.rollingWindowTime;

          const durationOfStream =
            rollingWindowTime && liveStreamDuration >= rollingWindowTime
              ? rollingWindowTime
              : liveStreamDuration;

          // console.log(
          //   '$$$ rolling window time > ',
          //   hlsPlayerDurationDetails.current?.rollingWindowTime
          // );
          // console.log('$$$ live stream duration > ', liveStreamDuration);
          // console.log('$$$ current stream duration > ', durationOfStream);

          const currentPosition =
            durationOfStream - distanceFromLiveEdgeValue.value;

          // console.log('currentPosition > ', currentPosition);

          seekbarPositionValue.value = interpolate(
            currentPosition,
            [0, durationOfStream],
            [0, 100],
            {
              extrapolateLeft: Extrapolation.CLAMP,
              extrapolateRight: Extrapolation.CLAMP,
            }
          );
        }, 1000);

        return () => {
          clearInterval(intervalId);
        };
      }
    }, [isPaused, streamStartedAt]);

    let startedPlayingFirstTime = false;
    let prevPlaybackState = HMSHLSPlayerPlaybackState.UNKNOWN;
    const playbackState = useHMSHLSPlayerPlaybackState();

    if (
      prevPlaybackState === HMSHLSPlayerPlaybackState.UNKNOWN &&
      playbackState === HMSHLSPlayerPlaybackState.PLAYING
    ) {
      prevPlaybackState = playbackState;
      startedPlayingFirstTime = true;
    }

    React.useEffect(() => {
      if (startedPlayingFirstTime && playerRef.current) {
        let mounted = true;

        playerRef.current
          .getPlayerDurationDetails()
          .then((data) => {
            if (mounted) {
              console.log('$$$ getPlayerDurationDetails > ', data);
              hlsPlayerDurationDetails.current = data;
              if (
                typeof data.rollingWindowTime === 'number' &&
                data.rollingWindowTime < 300000
              ) {
                hlsPlayerDurationDetails.current.rollingWindowTime = 300000;
              }
            }
          })
          .catch(() => {});

        return () => {
          mounted = false;
        };
      }
    }, [startedPlayingFirstTime]);

    return (
      <GestureDetector gesture={panGesture}>
        <View
          collapsable={false}
          hitSlop={{ top: 12, bottom: 12 }}
          style={[styles.container, { width: playerWrapperConstraints.width }]}
        >
          <Animated.View
            style={[
              styles.inactiveSeekbar,
              { width: playerWrapperConstraints.width },
            ]}
          >
            <Animated.View
              style={[styles.seekbar, seekbarRoomStyle, activeSeekbarStyle]}
            />
            <Animated.View
              style={[
                styles.seekbarThumb,
                seekbarRoomStyle,
                activeSeekbarThumbStyle,
              ]}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    );
  }
);

export const HLSSeekbar = React.memo(_HLSSeekbar);

const styles = StyleSheet.create({
  container: {
    height: 6,
    justifyContent: 'flex-end',
  },
  inactiveSeekbar: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  seekbar: {
    height: 4,
  },
  seekbarThumb: {
    position: 'absolute',
    bottom: -4,
    right: 0,
    zIndex: 100,
  },
});

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * 200 -> 200 * 40%
 *
 * 180 - 33.33% = 60;
 *
 * currentStreamDuration * (diff in current and prev) * 100 / prev
 *
 * 0 |----------| 150
 * prev  = 135
 *
 * curr = 90
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * //// 2 * 30 = 60
 * 1.5 * 30 = 45
 *
 * 180
 *
 * 120
 *
 * 0 |------____| 100
 *
 *
 * 200 * 40% = 80
 *
 * 200 * 30% = 60
 *
 *
 * 30*90
 *
 * 0 |---------_| 100
 *             Prev = 90
 *   |------|
 *          Curr = 60
 *
 *  90 - 60 = 30
 *
 *  seekbackward(80)
 */
