import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import type { HMSHLSPlayer } from '@100mslive/react-native-hms';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  cancelAnimation,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useHLSViewsConstraints } from '../hooks-util';
import { HLSPlayer } from './HLSPlayer';
import { HLSPlayerControls } from './HLSPlayerControls';
import { PipModes } from '../utils/types';
import type { RootState } from '../redux';

export const _HLSPlayerContainer: React.FC = () => {
  const hlsPlayerRef =
    React.useRef<React.ElementRef<typeof HMSHLSPlayer>>(null);
  const { playerWrapperConstraints } = useHLSViewsConstraints();
  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE
  );

  const animatedValue = useSharedValue(1);

  const cancelCurrentControlAnimation = React.useCallback(() => {
    'worklet';
    cancelAnimation(animatedValue);
  }, []);

  const hideControlsAfterDelay = React.useCallback((duration = 500) => {
    'worklet';
    animatedValue.value = withDelay(
      5000,
      withTiming(0, { duration, easing: Easing.ease })
    );
  }, []);

  const resetHideControlAnimation = React.useCallback(() => {
    cancelCurrentControlAnimation();
    hideControlsAfterDelay();
  }, [cancelCurrentControlAnimation, hideControlsAfterDelay]);

  const hideControls = React.useCallback((duration = 500) => {
    'worklet';
    animatedValue.value = withTiming(0, { duration, easing: Easing.ease });
  }, []);

  React.useEffect(() => {
    resetHideControlAnimation();
  }, [resetHideControlAnimation]);

  const tapGesture = React.useMemo(() => {
    return Gesture.Tap().onStart(() => {
      cancelCurrentControlAnimation();
      if (animatedValue.value < 1) {
        animatedValue.value = withTiming(
          1,
          { duration: 200, easing: Easing.ease },
          (finished) => {
            if (finished) {
              hideControlsAfterDelay();
            }
          }
        );
      } else {
        hideControls(200);
      }
    });
  }, [cancelCurrentControlAnimation, hideControls, hideControlsAfterDelay]);

  return (
    <GestureDetector gesture={tapGesture}>
      <View
        collapsable={false}
        style={[
          styles.hlsPlayerContainer,
          {
            backgroundColor: 'black',
            width: playerWrapperConstraints.width,
            height: playerWrapperConstraints.height,
          },
        ]}
      >
        <HLSPlayer ref={hlsPlayerRef} />

        {isPipModeActive ? null : (
          <HLSPlayerControls
            playerRef={hlsPlayerRef}
            animatedValue={animatedValue}
            cancelCurrentControlAnimation={cancelCurrentControlAnimation}
            hideControlsAfterDelay={hideControlsAfterDelay}
            resetHideControlAnimation={resetHideControlAnimation}
          />
        )}
      </View>
    </GestureDetector>
  );
};

export const HLSPlayerContainer = React.memo(_HLSPlayerContainer);

const styles = StyleSheet.create({
  hlsView: {
    flex: 1,
  },
  hlsPlayerContainer: {
    // flex: 1,
    position: 'relative',
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningSubtitle: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.25,
    textAlign: 'center',
  },
  playbackFailedContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  playbackFailed: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 8,
  },
});
