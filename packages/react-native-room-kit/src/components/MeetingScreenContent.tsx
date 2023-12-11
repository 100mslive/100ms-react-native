import React, { useCallback, useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Keyboard } from 'react-native';
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
import { useIsHLSViewer, useKeyboardState } from '../hooks-util';
import { HMSStatusBar } from './StatusBar';
import { AnimatedFooter } from './AnimatedFooter';
import { HLSFooter } from './HLSFooter';
import { AnimatedHeader } from './AnimatedHeader';
// import { ReconnectionView } from './ReconnectionView';

interface MeetingScreenContentProps {
  peerTrackNodes: Array<PeerTrackNode>;
}

export const MeetingScreenContent: React.FC<MeetingScreenContentProps> = ({
  peerTrackNodes,
}) => {
  const offset = useSharedValue(1);
  const isHLSViewer = useIsHLSViewer();
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);
  const [controlsHidden, setControlsHidden] = useState(false);
  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE
  );
  const { keyboardState } = useKeyboardState();

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const toggleControls = useCallback((fromTimeout: boolean = false) => {
    'worklet';
    if (
      !fromTimeout &&
      (keyboardState.value === KeyboardState.OPEN ||
        keyboardState.value === KeyboardState.OPENING)
    ) {
      runOnJS(dismissKeyboard)();
    } else {
      if (timerIdRef.current !== null) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
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
  }, []);

  // Handles Auto hiding the controls for the first time
  // to make this feature discoverable
  useEffect(() => {
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
    }
    timerIdRef.current = setTimeout(() => {
      timerIdRef.current = null;
      toggleControls(true);
    }, HeaderFooterHideDelayMs);

    return () => {
      if (timerIdRef.current !== null) {
        clearTimeout(timerIdRef.current);
      }
    };
  }, []);

  const tapGesture = Gesture.Tap()
    .onEnd(() => toggleControls())
    .requireExternalGestureToFail();

  return (
    <View style={styles.container}>
      <HMSStatusBar hidden={controlsHidden} barStyle={'light-content'} />

      <GestureDetector gesture={tapGesture}>
        <View style={styles.container}>
          {isPipModeActive ? null : (
            <AnimatedHeader offset={offset}>
              <Header transparent={isHLSViewer} showControls={!isHLSViewer} />
            </AnimatedHeader>
          )}

          <DisplayView offset={offset} peerTrackNodes={peerTrackNodes} />

          {isPipModeActive ? null : isHLSViewer ? (
            <HLSFooter offset={offset} />
          ) : (
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
