import React, { useRef } from 'react';
import type { ComponentRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, StyleSheet, Platform } from 'react-native';
import {
  HMSHLSPlayer,
  HMSHLSPlayerPlaybackState,
  useHMSHLSPlayerPlaybackState,
} from '@100mslive/react-native-hms';

import type { RootState } from '../redux';
import { changeShowHLSStats } from '../redux/actions';
import { HLSPlayerStatsView } from './HLSPlayerStatsView';
import { HLSPlayerEmoticons } from './HLSPlayerEmoticons';
import { CustomControls } from './CustomHLSPlayerControls';
import { COLORS, hexToRgbA } from '../utils/theme';
import { HMSHLSNotStarted } from './HMSHLSNotStarted';
import { CrossCircleIcon } from '../Icons';
import { useHMSRoomStyleSheet } from '../hooks-util';
import { useIsHLSStreamingOn } from '../hooks-sdk';

export const _HLSView: React.FC = () => {
  const dispatch = useDispatch();
  const isHLSStreaming = useIsHLSStreamingOn();
  const isStreamUrlPresent = useSelector(
    (state: RootState) =>
      !!state.hmsStates.room?.hlsStreamingState.variants?.[0]?.hlsStreamUrl
  );
  const hmsHlsPlayerRef = useRef<ComponentRef<typeof HMSHLSPlayer>>(null);
  const showHLSStats = useSelector(
    (state: RootState) => state.app.joinConfig.showHLSStats
  );
  const showCustomHLSPlayerControls = useSelector(
    (state: RootState) => state.app.joinConfig.showCustomHLSPlayerControls
  );
  const enableHLSPlayerControls = useSelector(
    (state: RootState) => state.app.joinConfig.enableHLSPlayerControls
  );

  const handleClosePress = () => {
    dispatch(changeShowHLSStats(false));
  };

  const hlsPlayerActions = <
    T extends
      | 'play'
      | 'stop'
      | 'pause'
      | 'resume'
      | 'seekForward'
      | 'seekBackward'
      | 'seekToLive'
      | 'setVolume',
  >(
    action: T,
    ...args: any[]
  ) => {
    switch (action) {
      case 'play': {
        hmsHlsPlayerRef.current?.play(args[0]);
        break;
      }
      case 'stop': {
        hmsHlsPlayerRef.current?.stop();
        break;
      }
      case 'pause': {
        hmsHlsPlayerRef.current?.pause();
        break;
      }
      case 'resume': {
        hmsHlsPlayerRef.current?.resume();
        break;
      }
      case 'seekForward': {
        hmsHlsPlayerRef.current?.seekForward(args[0]);
        break;
      }
      case 'seekBackward': {
        hmsHlsPlayerRef.current?.seekBackward(args[0]);
        break;
      }
      case 'seekToLive': {
        hmsHlsPlayerRef.current?.seekToLivePosition();
        break;
      }
      case 'setVolume': {
        hmsHlsPlayerRef.current?.setVolume(args[0]);
        break;
      }
    }
  };

  const [playerKey, setPlayerKey] = React.useState(1);

  const prevReconnectingRef = React.useRef<null | boolean>(null);
  const reconnecting = useSelector(
    (state: RootState) => state.hmsStates.reconnecting
  );

  const hlsPlayerPlaybackState = useHMSHLSPlayerPlaybackState();

  const isPlaybackFailed =
    hlsPlayerPlaybackState === HMSHLSPlayerPlaybackState.FAILED;

  React.useEffect(() => {
    const prevReconnecting = prevReconnectingRef.current;

    if (
      Platform.OS === 'android' &&
      prevReconnecting && // previously were in reconnection state
      reconnecting === false && // now in reconnected state
      isPlaybackFailed // and player playback is in failed state
    ) {
      // Recreate the HLS PLayer instance
      setPlayerKey((prevKey) => (prevKey += 1));
    }

    prevReconnectingRef.current = reconnecting;
  }, [reconnecting, isPlaybackFailed]);

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    failedContainer: {
      backgroundColor: theme.palette.background_dim
        ? hexToRgbA(theme.palette.background_dim, 0.7)
        : COLORS.LOADING_BACKDROP,
    },
    failedText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  return (
    <View style={styles.hlsView}>
      {isHLSStreaming ? (
        isStreamUrlPresent ? (
          <View style={styles.hlsPlayerContainer}>
            <HMSHLSPlayer
              key={playerKey}
              ref={hmsHlsPlayerRef}
              enableStats={showHLSStats}
              enableControls={enableHLSPlayerControls}
            />

            <HLSPlayerEmoticons />

            {showHLSStats ? (
              <HLSPlayerStatsView onClosePress={handleClosePress} />
            ) : null}

            {showCustomHLSPlayerControls ? (
              <CustomControls handleControlPress={hlsPlayerActions} />
            ) : null}

            {isPlaybackFailed ? (
              <View
                style={[
                  styles.playbackFailedContainer,
                  hmsRoomStyles.failedContainer,
                ]}
              >
                <CrossCircleIcon />

                <Text style={[styles.playbackFailed, hmsRoomStyles.failedText]}>
                  Playback Failed
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.textContainer}>
            <Text style={styles.warningSubtitle}>Stream URL not found!</Text>
          </View>
        )
      ) : (
        <HMSHLSNotStarted />
      )}
    </View>
  );
};

export const HLSView = React.memo(_HLSView);

const styles = StyleSheet.create({
  hlsView: {
    flex: 1,
  },
  hlsPlayerContainer: {
    flex: 1,
    position: 'relative',
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningSubtitle: {
    color: COLORS.INDICATORS.WARNING,
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.25,
    textAlign: 'center',
  },
  taleLessSpaceAsYouCan: {
    flex: 0,
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
