import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewProps, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { HMSHLSPlayer } from '@100mslive/react-native-hms';

import type { RootState } from '../redux';
import { HLSGoLiveControl } from './HLSGoLiveControl';
import { HLSSeekbar } from './HLSSeekbar';
import { useIsLandscapeOrientation } from '../utils/dimension';
import { HLSCloseMeetingControl } from './HLSCloseMeetingControl';
import { HLSClosedCaptionControl } from './HLSClosedCaptionControl';
import { HLSFullScreenControl } from './HLSFullScreenControl';
import { HLSDistanceFromLive } from './HLSDistanceFromLive';
import { HLSPlayPauseControl } from './HLSPlayPauseControl';

interface HLSPlayerControlsProps {
  playerRef: React.RefObject<React.ElementRef<typeof HMSHLSPlayer>>;
}

export const _HLSPlayerControls: React.FC<HLSPlayerControlsProps> = ({
  playerRef,
}) => {
  const { bottom: bottomSafeInset } = useSafeAreaInsets();
  const isLandscapeOrientation = useIsLandscapeOrientation();
  const hlsFullScreen = useSelector(
    (state: RootState) => state.app.hlsFullScreen
  );

  const animatedValue = useSharedValue(1);

  const cancelCurrentControlAnimation = React.useCallback(() => {
    'worklet';
    cancelAnimation(animatedValue);
  }, []);

  const hideControlsAfterDelay = React.useCallback(() => {
    'worklet';
    animatedValue.value = withDelay(
      5000,
      withTiming(0, { duration: 500, easing: Easing.ease })
    );
  }, []);

  React.useEffect(() => {
    cancelCurrentControlAnimation();
    hideControlsAfterDelay();
  }, [cancelCurrentControlAnimation, hideControlsAfterDelay]);

  const tapGesture = React.useMemo(() => {
    return Gesture.Tap().onStart(() => {
      cancelCurrentControlAnimation();
      animatedValue.value = withTiming(
        1,
        { duration: 200, easing: Easing.ease },
        (finished) => {
          if (finished) {
            hideControlsAfterDelay();
          }
        }
      );
    });
  }, [cancelCurrentControlAnimation, hideControlsAfterDelay]);

  const hideControlsStyles: ViewStyle = useAnimatedStyle(
    () => ({
      opacity: animatedValue.value,
    }),
    []
  );

  const hideControlsProps: ViewProps = useAnimatedProps(
    () => ({
      pointerEvents: animatedValue.value < 0.8 ? 'none' : 'auto',
    }),
    []
  );

  return (
    <GestureDetector gesture={tapGesture}>
      <View
        collapsable={false}
        style={[
          styles.detectorContainer,
          {
            paddingBottom: isLandscapeOrientation ? bottomSafeInset : 0,
          },
        ]}
      >
        <Animated.View
          animatedProps={hideControlsProps}
          style={[styles.container, hideControlsStyles]}
        >
          <View style={styles.controlsRow}>
            <HLSCloseMeetingControl />

            <View style={[styles.normalRow, styles.gap]}>
              <HLSClosedCaptionControl playerRef={playerRef} />
            </View>
          </View>

          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flex: 1 }} />
            <HLSPlayPauseControl playerRef={playerRef} />
            <View style={{ flex: 1 }} />
          </View>

          <View
            style={{
              flexDirection:
                isLandscapeOrientation || hlsFullScreen
                  ? 'column-reverse'
                  : 'column',
            }}
          >
            <View style={styles.controlsRow}>
              <View style={styles.normalRow}>
                <HLSGoLiveControl playerRef={playerRef} />
                <HLSDistanceFromLive />
              </View>

              <View style={[styles.normalRow, styles.gap]}>
                <HLSFullScreenControl />
              </View>
            </View>

            <HLSSeekbar
              playerRef={playerRef}
              onStart={cancelCurrentControlAnimation}
              onEnd={hideControlsAfterDelay}
            />
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

export const HLSPlayerControls = React.memo(_HLSPlayerControls);

const styles = StyleSheet.create({
  detectorContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 5,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 8,
  },
  normalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    padding: 4,
    alignSelf: 'flex-start',
  },
  gap: {
    marginLeft: 16,
  },
});
