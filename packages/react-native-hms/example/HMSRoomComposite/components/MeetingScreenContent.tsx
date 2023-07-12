import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, Pressable} from 'react-native';
import {useSelector} from 'react-redux';
import {
  Easing,
  cancelAnimation,
  runOnJS,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {PeerTrackNode, PipModes} from '../utils/types';
import type {RootState} from '../redux';
import {Footer} from './Footer';
import {DisplayView} from './DisplayView';
import {Header} from './Header';
import {useIsHLSViewer, useLandscapeChatViewVisible} from '../hooks-util';
import {HMSStatusBar} from './StatusBar';

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
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE,
  );

  const toggleControls = useCallback(() => {
    'worklet';
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    cancelAnimation(offset);
    offset.value = withTiming(
      offset.value === 1 ? 0 : 1,
      {duration: 200, easing: Easing.ease},
      finished => {
        if (finished) {
          runOnJS(setControlsHidden)(offset.value === 0);
        }
      },
    );
  }, []);

  // Handles Auto hiding the controls for the first time
  // to make this feature discoverable
  useEffect(() => {
    if (false && !isHLSViewer) {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
      timerIdRef.current = setTimeout(() => {
        timerIdRef.current = null;
        toggleControls();
      }, 3000);

      return () => {
        if (timerIdRef.current) {
          clearTimeout(timerIdRef.current);
        }
      };
    }
  }, [isHLSViewer]);

  const landscapeChatViewVisible = useLandscapeChatViewVisible();

  /**
   * TODO: disbaled Expended View animation in Webrtc flow
   *
   * Problem: Tiles Flatlist was not scrollable because Root Pressable was registering screen taps.
   * Solution: Try using Tab Gesture detector instead on Pressable component
   */
  return (
    <Pressable
      onPress={toggleControls}
      style={[
        styles.container,
        landscapeChatViewVisible ? styles.takeLessSpaceAsItCan : null,
      ]}
      disabled={isHLSViewer || true}
    >
      <HMSStatusBar hidden={controlsHidden} />

      {isPipModeActive ? null : <Header offset={offset} />}

      <DisplayView offset={offset} peerTrackNodes={peerTrackNodes} />

      {isPipModeActive ? null : <Footer offset={offset} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  takeLessSpaceAsItCan: {
    flex: 0,
  },
});
