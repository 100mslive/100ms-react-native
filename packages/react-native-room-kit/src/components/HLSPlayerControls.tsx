import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import type { ViewProps, ViewStyle } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
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

import {
  useHMSHLSPlayerPlaybackState,
  HMSHLSPlayerPlaybackState,
} from '@100mslive/react-native-hms';
import type { HMSHLSPlayer } from '@100mslive/react-native-hms';

import { CCIcon, CloseIcon, MaximizeIcon, MinimizeIcon } from '../Icons';
import { ModalTypes } from '../utils/types';
import { useModalType } from '../hooks-util';
import type { RootState } from '../redux';
import { setHlsFullScreen } from '../redux/actions';
import { useIsHLSStreamingOn } from '../hooks-sdk';

interface HLSPlayerControlsProps {
  playerRef: React.RefObject<React.ElementRef<typeof HMSHLSPlayer>>;
}

export const _HLSPlayerControls: React.FC<HLSPlayerControlsProps> = ({
  playerRef,
}) => {
  const isHLSStreamingOn = useIsHLSStreamingOn();
  const isStreamUrlPresent = useSelector(
    (state: RootState) =>
      !!state.hmsStates.room?.hlsStreamingState.variants?.[0]?.hlsStreamUrl
  );

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

  const dispatch = useDispatch();
  const hlsFullScreen = useSelector(
    (state: RootState) => state.app.hlsFullScreen
  );
  const [isCCSupported, setIsCCSupported] = useState(false);
  const [isCCEnabled, setIsCCEnabled] = useState(true);
  const { handleModalVisibleType } = useModalType();

  const handleCloseBtnPress = () => {
    handleModalVisibleType(ModalTypes.LEAVE_ROOM);
  };

  const handleCCBtnPress = () => {
    if (!isCCSupported || !playerRef.current) {
      return;
    }
    if (isCCEnabled) {
      playerRef.current.disableClosedCaption();
      setIsCCEnabled(false);
    } else {
      playerRef.current.enableClosedCaption();
      setIsCCEnabled(true);
    }
  };

  const toggleFullScreen = () => {
    dispatch(setHlsFullScreen(!hlsFullScreen));
  };

  React.useEffect(() => {
    if (
      isHLSStreamingOn &&
      isStreamUrlPresent &&
      startedPlayingFirstTime &&
      playerRef.current
    ) {
      let mounted = true;

      playerRef.current
        .isClosedCaptionSupported()
        .then((supported) => {
          if (mounted) {
            setIsCCSupported(supported);
          }
        })
        .catch(() => {});
      playerRef.current
        .isClosedCaptionEnabled()
        .then((enabled) => {
          if (mounted) {
            setIsCCEnabled(enabled);
          }
        })
        .catch(() => {});

      return () => {
        mounted = false;
      };
    }
  }, [isHLSStreamingOn, isStreamUrlPresent, startedPlayingFirstTime]);

  return (
    <AutoHideView>
      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={handleCloseBtnPress} style={styles.icon}>
          <CloseIcon size="medium" />
        </TouchableOpacity>

        <View style={[styles.normalRow, styles.gap]}>
          {isCCSupported ? (
            <TouchableOpacity
              onPress={handleCCBtnPress}
              style={[styles.icon, styles.gap]}
            >
              <CCIcon size="medium" enabled={isCCEnabled} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.controlsRow}>
        <View />

        <View style={[styles.normalRow, styles.gap]}>
          <TouchableOpacity onPress={toggleFullScreen} style={styles.icon}>
            {hlsFullScreen ? (
              <MinimizeIcon size="medium" />
            ) : (
              <MaximizeIcon size="medium" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </AutoHideView>
  );
};

interface AutoHideViewProps {}

const _AutoHideView: React.FC<AutoHideViewProps> = ({ children }) => {
  const animatedValue = useSharedValue(1);

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

  React.useEffect(() => {
    cancelAnimation(animatedValue);
    animatedValue.value = withDelay(
      3000,
      withTiming(0, { duration: 500, easing: Easing.ease })
    );
  }, []);

  const tapGesture = Gesture.Tap().onStart(() => {
    cancelAnimation(animatedValue);
    animatedValue.value = withTiming(
      1,
      { duration: 200, easing: Easing.ease },
      (finished) => {
        if (finished) {
          animatedValue.value = withDelay(
            3000,
            withTiming(0, { duration: 500, easing: Easing.ease })
          );
        }
      }
    );
  });

  return (
    <GestureDetector gesture={tapGesture}>
      <View collapsable={false} style={styles.detectorContainer}>
        <Animated.View
          animatedProps={hideControlsProps}
          style={[styles.container, hideControlsStyles]}
        >
          {children}
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

const AutoHideView = React.memo(_AutoHideView);

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
