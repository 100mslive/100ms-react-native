import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewProps, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
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
import { HLSSeekbackwardControl } from './HLSSeekbackwardControl';
import { HLSSeekforwardControl } from './HLSSeekforwardControl';

interface HLSPlayerControlsProps {
  playerRef: React.RefObject<React.ElementRef<typeof HMSHLSPlayer>>;
  cancelCurrentControlAnimation: () => void;
  hideControlsAfterDelay: () => void;
  resetHideControlAnimation: () => void;
  animatedValue: SharedValue<number>;
}

export const _HLSPlayerControls: React.FC<HLSPlayerControlsProps> = ({
  playerRef,
  cancelCurrentControlAnimation,
  hideControlsAfterDelay,
  animatedValue,
  resetHideControlAnimation,
}) => {
  const { bottom: bottomSafeInset } = useSafeAreaInsets();
  const isLandscapeOrientation = useIsLandscapeOrientation();
  const hlsFullScreen = useSelector(
    (state: RootState) => state.app.hlsFullScreen
  );

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
    <React.Fragment>
      {/* Play/Pause Controls */}
      <Animated.View
        animatedProps={hideControlsProps}
        style={[
          { height: '100%' },
          styles.floatingContainer,
          hideControlsStyles,
        ]}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HLSSeekbackwardControl
            playerRef={playerRef}
            onPress={resetHideControlAnimation}
          />

          <HLSPlayPauseControl
            playerRef={playerRef}
            onPress={resetHideControlAnimation}
          />

          <HLSSeekforwardControl
            playerRef={playerRef}
            onPress={resetHideControlAnimation}
          />
        </View>
      </Animated.View>

      {/* Header Controls */}
      <Animated.View
        animatedProps={hideControlsProps}
        style={[{ top: 0 }, styles.floatingContainer, hideControlsStyles]}
      >
        <View style={styles.controlsRow}>
          <HLSCloseMeetingControl onPress={resetHideControlAnimation} />

          <View style={[styles.normalRow, styles.gap]}>
            <HLSClosedCaptionControl
              playerRef={playerRef}
              onPress={resetHideControlAnimation}
            />
          </View>
        </View>
      </Animated.View>

      {/* Footer Controls */}
      <Animated.View
        animatedProps={hideControlsProps}
        style={[
          { bottom: isLandscapeOrientation ? bottomSafeInset : 0 },
          styles.floatingContainer,
          hideControlsStyles,
        ]}
      >
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
              <HLSGoLiveControl
                playerRef={playerRef}
                onPress={resetHideControlAnimation}
              />
              <HLSDistanceFromLive />
            </View>

            <View style={[styles.normalRow, styles.gap]}>
              <HLSFullScreenControl onPress={resetHideControlAnimation} />
            </View>
          </View>

          <HLSSeekbar
            playerRef={playerRef}
            onStart={cancelCurrentControlAnimation}
            onEnd={hideControlsAfterDelay}
          />
        </View>
      </Animated.View>
    </React.Fragment>
  );
};

export const HLSPlayerControls = React.memo(_HLSPlayerControls);

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    width: '100%',
    zIndex: 5,
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
