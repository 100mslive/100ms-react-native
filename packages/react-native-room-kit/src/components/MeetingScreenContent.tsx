import React, { useCallback, useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Keyboard, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import {
  Easing,
  KeyboardState,
  cancelAnimation,
  runOnJS,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { HeaderFooterHideDelayMs, PipModes } from '../utils/types';
import type { PeerTrackNode } from '../utils/types';
import type { RootState } from '../redux';
import { Footer } from './Footer';
import { DisplayView } from './DisplayView';
import { Header } from './Header';
import { useKeyboardState } from '../hooks-util';
import { HMSStatusBar } from './StatusBar';
import { AnimatedFooter } from './AnimatedFooter';
import { AnimatedHeader } from './AnimatedHeader';
import { useIsLandscapeOrientation } from '../utils/dimension';
// import { ReconnectionView } from './ReconnectionView';

interface MeetingScreenContentProps {
  peerTrackNodes: Array<PeerTrackNode>;
}

export const MeetingScreenContent: React.FC<MeetingScreenContentProps> = ({
  peerTrackNodes,
}) => {
  const offset = useSharedValue(1);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);
  const [controlsHidden, setControlsHidden] = useState(false);
  const isLandscapeOrientation = useIsLandscapeOrientation();
  const prevIsLandscapeOrientation = useRef(isLandscapeOrientation);
  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE
  );
  const whiteboardActive =
    Platform.OS === 'android'
      ? useSelector((state: RootState) => !!state.hmsStates.whiteboard)
      : null;
  const { keyboardState } = useKeyboardState();

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const clearTimer = useCallback(() => {
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  const toggleControls = useCallback(
    (fromTimeout: boolean = false) => {
      'worklet';
      if (
        fromTimeout !== true &&
        (keyboardState.value === KeyboardState.OPEN ||
          keyboardState.value === KeyboardState.OPENING)
      ) {
        runOnJS(dismissKeyboard)();
      } else {
        runOnJS(clearTimer)();
        cancelAnimation(offset);
        offset.value = withTiming(
          offset.value === 1 ? 0 : 1,
          { duration: 200, easing: Easing.ease },
          (finished) => {
            if (finished) {
              runOnJS(setControlsHidden)(offset.value === 0);
            }
          }
        );
      }
    },
    [dismissKeyboard, clearTimer]
  );

  if (
    !!whiteboardActive &&
    (isLandscapeOrientation ? offset.value === 1 : offset.value < 1)
  ) {
    cancelAnimation(offset);
    offset.value = withTiming(
      isLandscapeOrientation ? 0 : 1,
      { duration: 200, easing: Easing.ease },
      (finished) => {
        if (finished) {
          runOnJS(setControlsHidden)(offset.value === 0);
        }
      }
    );
  }

  //#region Hiding Header & Footer when user switches from Portrait to Landscape
  if (
    prevIsLandscapeOrientation.current === false &&
    isLandscapeOrientation &&
    offset.value === 1
  ) {
    cancelAnimation(offset);
    offset.value = withTiming(
      0,
      { duration: 200, easing: Easing.ease },
      (finished) => {
        if (finished) {
          runOnJS(setControlsHidden)(offset.value === 0);
        }
      }
    );
  }
  prevIsLandscapeOrientation.current = isLandscapeOrientation;
  //#endregion

  // Handles Auto hiding the controls for the first time
  // to make this feature discoverable
  useEffect(() => {
    if (!!whiteboardActive) {
      return;
    }
    clearTimer();
    timerIdRef.current = setTimeout(() => {
      timerIdRef.current = null;
      toggleControls(true);
    }, HeaderFooterHideDelayMs);

    return clearTimer;
  }, [clearTimer, toggleControls, !!whiteboardActive]);

  const tapGesture = Gesture.Tap()
    .enabled(Platform.select({ android: !whiteboardActive, default: true }))
    .onEnd(() => toggleControls())
    .requireExternalGestureToFail();

  return (
    <View style={styles.container}>
      <HMSStatusBar hidden={controlsHidden} barStyle={'light-content'} />

      <GestureDetector gesture={tapGesture}>
        <View collapsable={false} style={styles.container}>
          {isPipModeActive && Platform.OS === 'android' ? null : (
            <AnimatedHeader offset={offset}>
              <Header />
            </AnimatedHeader>
          )}

          <DisplayView offset={offset} peerTrackNodes={peerTrackNodes} />

          {isPipModeActive && Platform.OS === 'android' ? null : (
            <AnimatedFooter offset={offset}>
              <Footer />
            </AnimatedFooter>
          )}
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  takeLessSpaceAsItCan: {
    flex: 0,
  },
  reconnectionWrapper: {
    flex: 1,
  },
});
