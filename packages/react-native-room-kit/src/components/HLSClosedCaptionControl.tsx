import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import {
  useHMSHLSPlayerPlaybackState,
  HMSHLSPlayerPlaybackState,
} from '@100mslive/react-native-hms';
import type { HMSHLSPlayer } from '@100mslive/react-native-hms';

import { CCIcon } from '../Icons';
import type { RootState } from '../redux';
import { useIsHLSStreamingOn } from '../hooks-sdk';

interface HLSClosedCaptionControlProps {
  playerRef: React.RefObject<React.ElementRef<typeof HMSHLSPlayer>>;
}

export const _HLSClosedCaptionControl: React.FC<
  HLSClosedCaptionControlProps
> = ({ playerRef }) => {
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

  const [isCCSupported, setIsCCSupported] = useState(false);
  const [isCCEnabled, setIsCCEnabled] = useState(true);

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

  if (!isCCSupported) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={handleCCBtnPress}
      style={[styles.icon, styles.gap]}
    >
      <CCIcon size="medium" enabled={isCCEnabled} />
    </TouchableOpacity>
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
