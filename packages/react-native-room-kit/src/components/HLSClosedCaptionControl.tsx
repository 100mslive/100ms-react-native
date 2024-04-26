import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import {
  useHMSHLSPlayerPlaybackState,
  HMSHLSPlayerPlaybackState,
} from '@100mslive/react-native-hms';
import type { HMSHLSPlayer } from '@100mslive/react-native-hms';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { CCIcon } from '../Icons';
import type { RootState } from '../redux';
import { useIsHLSStreamingOn } from '../hooks-sdk';

interface HLSClosedCaptionControlProps {
  playerRef: React.RefObject<React.ElementRef<typeof HMSHLSPlayer>>;
  onPress?: () => void;
}

export const _HLSClosedCaptionControl: React.FC<
  HLSClosedCaptionControlProps
> = ({ playerRef, onPress }) => {
  const isHLSStreamingOn = useIsHLSStreamingOn();
  const isStreamUrlPresent = useSelector(
    (state: RootState) =>
      !!state.hmsStates.room?.hlsStreamingState.variants?.[0]?.hlsStreamUrl
  );

  let startedPlayingFirstTimeRef = useRef(false);
  let prevPlaybackStateRef = useRef(HMSHLSPlayerPlaybackState.UNKNOWN);
  const playbackState = useHMSHLSPlayerPlaybackState();

  if (
    prevPlaybackStateRef.current === HMSHLSPlayerPlaybackState.UNKNOWN &&
    playbackState === HMSHLSPlayerPlaybackState.PLAYING
  ) {
    prevPlaybackStateRef.current = playbackState;
    startedPlayingFirstTimeRef.current = true;
  }

  const [isCCSupported, setIsCCSupported] = useState(false);
  const [isCCEnabled, setIsCCEnabled] = useState(true);

  const handleCCBtnPress = () => {
    if (!isCCSupported || !playerRef.current) {
      return;
    }
    onPress?.();
    if (isCCEnabled) {
      playerRef.current.disableClosedCaption();
      setIsCCEnabled(false);
    } else {
      playerRef.current.enableClosedCaption();
      setIsCCEnabled(true);
    }
  };

  React.useEffect(() => {
    if (
      isHLSStreamingOn &&
      isStreamUrlPresent &&
      startedPlayingFirstTimeRef.current &&
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
  }, [
    isHLSStreamingOn,
    isStreamUrlPresent,
    startedPlayingFirstTimeRef.current,
  ]);

  if (!isCCSupported) {
    return null;
  }

  return (
    <GestureDetector gesture={Gesture.Tap()}>
      <TouchableOpacity
        onPress={handleCCBtnPress}
        style={[styles.icon, styles.gap]}
      >
        <CCIcon size="medium" enabled={isCCEnabled} />
      </TouchableOpacity>
    </GestureDetector>
  );
};

export const HLSClosedCaptionControl = React.memo(_HLSClosedCaptionControl);

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
