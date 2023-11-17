import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { useSelector } from 'react-redux';
import {
  Easing,
  cancelAnimation,
  runOnJS,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { PipModes } from '../utils/types';
import type { PeerTrackNode } from '../utils/types';
import type { RootState } from '../redux';
import { Footer } from './Footer';
import { DisplayView } from './DisplayView';
import { Header } from './Header';
import { useIsHLSViewer } from '../hooks-util';
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

  const toggleControls = useCallback(() => {
    'worklet';
    if (timerIdRef.current) {
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
  }, []);

  // Handles Auto hiding the controls for the first time
  // to make this feature discoverable
  // useEffect(() => {
  //   if (false && !isHLSViewer) {
  //     if (timerIdRef.current) {
  //       clearTimeout(timerIdRef.current);
  //     }
  //     timerIdRef.current = setTimeout(() => {
  //       timerIdRef.current = null;
  //       toggleControls();
  //     }, 3000); d

  //     return () => {
  //       if (timerIdRef.current) {
  //         clearTimeout(timerIdRef.current);
  //       }
  //     };
  //   }
  // }, [isHLSViewer]);

  /**
   * TODO: disbaled Expended View animation in Webrtc flow
   *
   * Problem: Tiles Flatlist was not scrollable because Root Pressable was registering screen taps.
   * Solution: Try using Tab Gesture detector instead on Pressable component
   */
  return (
    <Pressable
      onPress={toggleControls}
      style={styles.container}
      disabled={isHLSViewer || true}
    >
      <HMSStatusBar hidden={controlsHidden} barStyle={'light-content'} />

      <View style={styles.reconnectionWrapper}>
        {isPipModeActive ? null : (
          <AnimatedHeader offset={offset}>
            <Header transparent={isHLSViewer} showControls={!isHLSViewer} />
          </AnimatedHeader>
        )}

        <DisplayView offset={offset} peerTrackNodes={peerTrackNodes} />

        {/* <ReconnectionView /> */}
      </View>

      {isPipModeActive ? null : isHLSViewer ? (
        <HLSFooter offset={offset} />
      ) : (
        <AnimatedFooter offset={offset}>
          <Footer />
        </AnimatedFooter>
      )}
    </Pressable>
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
